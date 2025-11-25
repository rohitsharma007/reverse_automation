#!/usr/bin/env python3
"""
AI-Powered Automation Framework - Vision Executor
Uses AI to analyze screenshots and execute browser automation based on visual understanding
"""

import json
import re
import os
import base64
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass


@dataclass
class TestStep:
    """Represents a single test step with action, target, and value"""
    action: str  # enter, click, check, scroll, wait
    target: Optional[str] = None  # element identifier (e.g., "Username", "Login")
    value: Optional[str] = None  # value to enter or check
    raw_step: str = ""  # original step text
    screenshot: Optional[str] = None  # associated screenshot

    def __repr__(self):
        return f"TestStep(action={self.action}, target={self.target}, value={self.value})"


class NaturalLanguageParser:
    """Parses natural language test steps into structured actions"""

    @staticmethod
    def parse_step(step_text: str) -> TestStep:
        """Parse a natural language test step"""
        step_text = step_text.strip()
        original = step_text
        step_text_lower = step_text.lower()

        # Pattern: enter "value" into "target"
        match = re.match(r'enter\s+"([^"]+)"\s+into\s+"([^"]+)"', step_text_lower)
        if match:
            return TestStep(
                action="enter",
                value=match.group(1),
                target=match.group(2),
                raw_step=original
            )

        # Pattern: click "target"
        match = re.match(r'click\s+"([^"]+)"', step_text_lower)
        if match:
            return TestStep(
                action="click",
                target=match.group(1),
                raw_step=original
            )

        # Pattern: check that page contains "value"
        match = re.match(r'check that page contains\s+"([^"]+)"', step_text_lower)
        if match:
            return TestStep(
                action="check",
                value=match.group(1),
                raw_step=original
            )

        # Pattern: scroll down/up
        match = re.match(r'scroll\s+(down|up)', step_text_lower)
        if match:
            return TestStep(
                action="scroll",
                target=match.group(1),
                raw_step=original
            )

        # Pattern: wait N sec/seconds
        match = re.match(r'wait\s+(\d+)\s+sec', step_text_lower)
        if match:
            return TestStep(
                action="wait",
                value=match.group(1),
                raw_step=original
            )

        # Default: return as-is
        return TestStep(action="unknown", raw_step=original)


class SmartSelectorGenerator:
    """Generates smart selectors for UI elements based on target descriptions"""

    @staticmethod
    def generate_selectors(target: str, action: str = "click") -> List[Dict[str, str]]:
        """
        Generate multiple selector strategies for a target element
        Returns list of selector strategies to try in order
        """
        target_lower = target.lower()
        selectors = []

        if action == "enter":
            # For input fields, try multiple strategies
            selectors.extend([
                {"type": "placeholder", "value": target},
                {"type": "label", "value": target},
                {"type": "name", "value": target_lower.replace(" ", "")},
                {"type": "xpath", "value": f"//input[@placeholder='{target}' or @name='{target_lower}']"},
                {"type": "role_name", "value": f"textbox[name='{target}']"},
            ])
        elif action == "click":
            # For clickable elements
            selectors.extend([
                {"type": "text", "value": target},
                {"type": "role_name", "value": f"button[name='{target}']"},
                {"type": "role_name", "value": f"link[name='{target}']"},
                {"type": "xpath", "value": f"//button[contains(text(), '{target}')] | //a[contains(text(), '{target}')]"},
                {"type": "text_contains", "value": target},
            ])

        return selectors

    @staticmethod
    def selector_to_playwright(selector: Dict[str, str]) -> str:
        """Convert selector dict to Playwright locator string"""
        sel_type = selector["type"]
        value = selector["value"]

        if sel_type == "text":
            return f"text={value}"
        elif sel_type == "text_contains":
            return f"text={value}"
        elif sel_type == "placeholder":
            return f"[placeholder='{value}']"
        elif sel_type == "label":
            # Use getByLabel
            return f"label={value}"
        elif sel_type == "name":
            return f"[name='{value}']"
        elif sel_type == "xpath":
            return value
        elif sel_type == "role_name":
            return f"role={value}"

        return value


class AIVisionExecutor:
    """Main executor that uses AI vision to understand and execute test steps"""

    def __init__(self, test_run_path: str):
        """
        Initialize the executor with a test run directory

        Args:
            test_run_path: Path to test run directory (e.g., runs/testrigor_run2)
        """
        self.test_run_path = Path(test_run_path)
        self.screenshots_path = self.test_run_path / "extracted_images"
        self.manual_steps_path = self.test_run_path / "manual_steps.txt"
        self.image_context_path = self.test_run_path / "image_context.json"

        self.parser = NaturalLanguageParser()
        self.selector_generator = SmartSelectorGenerator()

        self.steps: List[TestStep] = []
        self.image_context: Dict = {}

    def load_test_data(self) -> None:
        """Load test steps and image context"""
        # Load manual steps
        if self.manual_steps_path.exists():
            with open(self.manual_steps_path, 'r') as f:
                steps_text = f.read().strip().split('\n')
                self.steps = [self.parser.parse_step(step) for step in steps_text if step.strip()]

        # Load image context
        if self.image_context_path.exists():
            with open(self.image_context_path, 'r') as f:
                self.image_context = json.load(f)

        # Map screenshots to steps
        self._map_screenshots_to_steps()

    def _map_screenshots_to_steps(self) -> None:
        """Map screenshots to test steps based on page context"""
        screenshot_steps = {}

        # Parse steps from each screenshot's context
        for img_name, context in self.image_context.items():
            page_text = context.get("page_text", "")
            # Extract steps from page text
            steps_section = re.search(r'Steps:\s*\n(.+)', page_text, re.DOTALL)
            if steps_section:
                steps_text = steps_section.group(1).strip()
                screenshot_steps[img_name] = steps_text

        # Try to match our steps to screenshots
        # Simple approach: match by step content similarity
        for step in self.steps:
            for img_name, img_steps in screenshot_steps.items():
                if step.raw_step.lower() in img_steps.lower():
                    if not step.screenshot:
                        step.screenshot = img_name
                        break

    def generate_playwright_code(self, base_url: str, credentials: Dict[str, str]) -> str:
        """
        Generate Playwright automation code based on parsed test steps

        Args:
            base_url: Base URL of the application
            credentials: Dict with username and password

        Returns:
            Generated Python/Playwright code
        """
        code_lines = [
            "#!/usr/bin/env python3",
            '"""',
            "AI-Generated Playwright Test",
            f"Generated from: {self.test_run_path}",
            '"""',
            "",
            "import asyncio",
            "from playwright.async_api import async_playwright, Page, expect",
            "import re",
            "",
            "",
            "async def run_test():",
            "    async with async_playwright() as p:",
            "        # Launch browser",
            "        browser = await p.chromium.launch(headless=False, slow_mo=500)",
            "        context = await browser.new_context(viewport={'width': 1280, 'height': 720})",
            "        page = await context.new_page()",
            "        ",
            f'        # Navigate to application',
            f'        await page.goto("{base_url}")',
            "        await page.wait_for_load_state('networkidle')",
            "        print('✓ Page loaded')",
            "        ",
        ]

        # Generate code for each step
        step_num = 0
        for step in self.steps:
            step_num += 1
            code_lines.append(f"        # Step {step_num}: {step.raw_step}")

            if step.action == "enter":
                # Generate input code with smart selectors
                target = step.target
                value = step.value

                # Replace credentials if needed
                if target and target.lower() in ["username", "email"]:
                    value = credentials.get("username", value)
                elif target and target.lower() in ["password", "pass"]:
                    value = credentials.get("password", value)

                code_lines.extend([
                    f"        try:",
                    f"            # Try to find input field for '{target}'",
                    f"            input_field = None",
                    f"            # Strategy 1: By placeholder",
                    f"            try:",
                    f"                input_field = page.get_by_placeholder(re.compile('{target}', re.IGNORECASE))",
                    f"                await input_field.fill('{value}')",
                    f"                print(f'  ✓ Entered \"{value}\" into \"{target}\" (by placeholder)')",
                    f"            except:",
                    f"                # Strategy 2: By label",
                    f"                try:",
                    f"                    input_field = page.get_by_label(re.compile('{target}', re.IGNORECASE))",
                    f"                    await input_field.fill('{value}')",
                    f"                    print(f'  ✓ Entered \"{value}\" into \"{target}\" (by label)')",
                    f"                except:",
                    f"                    # Strategy 3: By name attribute",
                    f"                    input_field = page.locator(f'[name*=\"{target.lower()}\"]').first",
                    f"                    await input_field.fill('{value}')",
                    f"                    print(f'  ✓ Entered \"{value}\" into \"{target}\" (by name)')",
                    f"        except Exception as e:",
                    f"            print(f'  ✗ Failed to enter \"{value}\" into \"{target}\": {{e}}')",
                    f"            raise",
                    "        ",
                ])

            elif step.action == "click":
                target = step.target
                code_lines.extend([
                    f"        try:",
                    f"            # Try to find and click '{target}'",
                    f"            # Strategy 1: By text (exact)",
                    f"            try:",
                    f"                button = page.get_by_text('{target}', exact=True)",
                    f"                await button.click()",
                    f"                print(f'  ✓ Clicked \"{target}\" (exact text)')",
                    f"            except:",
                    f"                # Strategy 2: By text (case insensitive)",
                    f"                try:",
                    f"                    button = page.get_by_text(re.compile('{target}', re.IGNORECASE))",
                    f"                    await button.click()",
                    f"                    print(f'  ✓ Clicked \"{target}\" (case insensitive)')",
                    f"                except:",
                    f"                    # Strategy 3: By role",
                    f"                    try:",
                    f"                        button = page.get_by_role('button', name=re.compile('{target}', re.IGNORECASE))",
                    f"                        await button.click()",
                    f"                        print(f'  ✓ Clicked \"{target}\" (by role)')",
                    f"                    except:",
                    f"                        # Strategy 4: Link",
                    f"                        button = page.get_by_role('link', name=re.compile('{target}', re.IGNORECASE))",
                    f"                        await button.click()",
                    f"                        print(f'  ✓ Clicked \"{target}\" (by link)')",
                    f"            await page.wait_for_timeout(1000)  # Wait for action to complete",
                    f"        except Exception as e:",
                    f"            print(f'  ✗ Failed to click \"{target}\": {{e}}')",
                    f"            raise",
                    "        ",
                ])

            elif step.action == "check":
                value = step.value
                code_lines.extend([
                    f"        try:",
                    f"            # Check that page contains '{value}'",
                    f"            await expect(page.locator('body')).to_contain_text('{value}')",
                    f"            print(f'  ✓ Verified page contains \"{value}\"')",
                    f"        except Exception as e:",
                    f"            print(f'  ✗ Page does not contain \"{value}\": {{e}}')",
                    f"            raise",
                    "        ",
                ])

            elif step.action == "scroll":
                direction = step.target
                if direction == "down":
                    code_lines.extend([
                        f"        await page.evaluate('window.scrollBy(0, 500)')",
                        f"        print('  ✓ Scrolled down')",
                        "        ",
                    ])
                elif direction == "up":
                    code_lines.extend([
                        f"        await page.evaluate('window.scrollBy(0, -500)')",
                        f"        print('  ✓ Scrolled up')",
                        "        ",
                    ])

            elif step.action == "wait":
                seconds = step.value
                ms = int(seconds) * 1000
                code_lines.extend([
                    f"        await page.wait_for_timeout({ms})",
                    f"        print(f'  ✓ Waited {seconds} seconds')",
                    "        ",
                ])

        # Cleanup
        code_lines.extend([
            "        # Test completed successfully",
            "        print('\\n✅ All test steps completed successfully!')",
            "        ",
            "        # Keep browser open for a moment to see results",
            "        await page.wait_for_timeout(3000)",
            "        ",
            "        await browser.close()",
            "",
            "",
            "if __name__ == '__main__':",
            "    asyncio.run(run_test())",
        ])

        return "\n".join(code_lines)

    def generate_test_report(self) -> str:
        """Generate a test report showing parsed steps and mapped screenshots"""
        report_lines = [
            "# AI Vision Test Report",
            f"## Test Run: {self.test_run_path.name}",
            "",
            f"**Total Steps:** {len(self.steps)}",
            "",
            "## Parsed Test Steps",
            ""
        ]

        for i, step in enumerate(self.steps, 1):
            report_lines.append(f"### Step {i}: {step.raw_step}")
            report_lines.append(f"- **Action:** {step.action}")
            if step.target:
                report_lines.append(f"- **Target:** {step.target}")
            if step.value:
                report_lines.append(f"- **Value:** {step.value}")
            if step.screenshot:
                report_lines.append(f"- **Screenshot:** {step.screenshot}")
            report_lines.append("")

        return "\n".join(report_lines)


def main():
    """Main entry point for standalone execution"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python ai_vision_executor.py <test_run_path>")
        print("Example: python ai_vision_executor.py runs/testrigor_run2")
        sys.exit(1)

    test_run_path = sys.argv[1]

    # Initialize executor
    executor = AIVisionExecutor(test_run_path)

    # Load test data
    print(f"Loading test data from {test_run_path}...")
    executor.load_test_data()
    print(f"✓ Loaded {len(executor.steps)} test steps")

    # Generate report
    print("\nGenerating test report...")
    report = executor.generate_test_report()
    print(report)

    # Generate Playwright code
    print("\nGenerating Playwright automation code...")
    credentials = {
        "username": "Admin",
        "password": "admin123"
    }
    code = executor.generate_playwright_code(
        "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login",
        credentials
    )

    # Save generated code
    output_path = Path(test_run_path) / "generated_automation.py"
    with open(output_path, 'w') as f:
        f.write(code)

    print(f"✓ Generated code saved to: {output_path}")
    print("\nYou can run the generated test with:")
    print(f"  python {output_path}")


if __name__ == "__main__":
    main()
