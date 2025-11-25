#!/usr/bin/env python3
"""
AI-Generated Playwright Test
Generated from: reverse_engineering/runs/testrigor_run2
"""

import asyncio
from playwright.async_api import async_playwright, Page, expect
import re


async def run_test():
    async with async_playwright() as p:
        # Launch browser (headless mode for CI/containers)
        browser = await p.chromium.launch(headless=True, slow_mo=500)
        context = await browser.new_context(viewport={'width': 1280, 'height': 720})
        page = await context.new_page()
        
        # Navigate to application
        await page.goto("https://opensource-demo.orangehrmlive.com/web/index.php/auth/login")
        await page.wait_for_load_state('networkidle')
        print('✓ Page loaded')
        
        # Step 1: enter "Admin" into "Username"
        try:
            # Try to find input field for 'username'
            input_field = None
            # Strategy 1: By placeholder
            try:
                input_field = page.get_by_placeholder(re.compile('username', re.IGNORECASE))
                await input_field.fill('Admin')
                print(f'  ✓ Entered "Admin" into "username" (by placeholder)')
            except:
                # Strategy 2: By label
                try:
                    input_field = page.get_by_label(re.compile('username', re.IGNORECASE))
                    await input_field.fill('Admin')
                    print(f'  ✓ Entered "Admin" into "username" (by label)')
                except:
                    # Strategy 3: By name attribute
                    input_field = page.locator(f'[name*="username"]').first
                    await input_field.fill('Admin')
                    print(f'  ✓ Entered "Admin" into "username" (by name)')
        except Exception as e:
            print(f'  ✗ Failed to enter "Admin" into "username": {e}')
            raise
        
        # Step 2: click "Login"
        try:
            # Try to find and click 'login'
            # Strategy 1: By text (exact)
            try:
                button = page.get_by_text('login', exact=True)
                await button.click()
                print(f'  ✓ Clicked "login" (exact text)')
            except:
                # Strategy 2: By text (case insensitive)
                try:
                    button = page.get_by_text(re.compile('login', re.IGNORECASE))
                    await button.click()
                    print(f'  ✓ Clicked "login" (case insensitive)')
                except:
                    # Strategy 3: By role
                    try:
                        button = page.get_by_role('button', name=re.compile('login', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "login" (by role)')
                    except:
                        # Strategy 4: Link
                        button = page.get_by_role('link', name=re.compile('login', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "login" (by link)')
            await page.wait_for_timeout(1000)  # Wait for action to complete
        except Exception as e:
            print(f'  ✗ Failed to click "login": {e}')
            raise
        
        # Step 3: scroll down
        await page.evaluate('window.scrollBy(0, 500)')
        print('  ✓ Scrolled down')
        
        # Step 4: click "PIM"
        try:
            # Try to find and click 'pim'
            # Strategy 1: By text (exact)
            try:
                button = page.get_by_text('pim', exact=True)
                await button.click()
                print(f'  ✓ Clicked "pim" (exact text)')
            except:
                # Strategy 2: By text (case insensitive)
                try:
                    button = page.get_by_text(re.compile('pim', re.IGNORECASE))
                    await button.click()
                    print(f'  ✓ Clicked "pim" (case insensitive)')
                except:
                    # Strategy 3: By role
                    try:
                        button = page.get_by_role('button', name=re.compile('pim', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "pim" (by role)')
                    except:
                        # Strategy 4: Link
                        button = page.get_by_role('link', name=re.compile('pim', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "pim" (by link)')
            await page.wait_for_timeout(1000)  # Wait for action to complete
        except Exception as e:
            print(f'  ✗ Failed to click "pim": {e}')
            raise
        
        # Step 5: scroll down
        await page.evaluate('window.scrollBy(0, 500)')
        print('  ✓ Scrolled down')
        
        # Step 6: scroll up
        await page.evaluate('window.scrollBy(0, -500)')
        print('  ✓ Scrolled up')
        
        # Step 7: click "Add Employee"
        try:
            # Try to find and click 'add employee'
            # Strategy 1: By text (exact)
            try:
                button = page.get_by_text('add employee', exact=True)
                await button.click()
                print(f'  ✓ Clicked "add employee" (exact text)')
            except:
                # Strategy 2: By text (case insensitive)
                try:
                    button = page.get_by_text(re.compile('add employee', re.IGNORECASE))
                    await button.click()
                    print(f'  ✓ Clicked "add employee" (case insensitive)')
                except:
                    # Strategy 3: By role
                    try:
                        button = page.get_by_role('button', name=re.compile('add employee', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "add employee" (by role)')
                    except:
                        # Strategy 4: Link
                        button = page.get_by_role('link', name=re.compile('add employee', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "add employee" (by link)')
            await page.wait_for_timeout(1000)  # Wait for action to complete
        except Exception as e:
            print(f'  ✗ Failed to click "add employee": {e}')
            raise
        
        # Step 8: enter "John" into "First Name"
        try:
            # Try to find input field for 'first name'
            input_field = None
            # Strategy 1: By placeholder
            try:
                input_field = page.get_by_placeholder(re.compile('first name', re.IGNORECASE))
                await input_field.fill('john')
                print(f'  ✓ Entered "john" into "first name" (by placeholder)')
            except:
                # Strategy 2: By label
                try:
                    input_field = page.get_by_label(re.compile('first name', re.IGNORECASE))
                    await input_field.fill('john')
                    print(f'  ✓ Entered "john" into "first name" (by label)')
                except:
                    # Strategy 3: By name attribute
                    input_field = page.locator(f'[name*="first name"]').first
                    await input_field.fill('john')
                    print(f'  ✓ Entered "john" into "first name" (by name)')
        except Exception as e:
            print(f'  ✗ Failed to enter "john" into "first name": {e}')
            raise
        
        # Step 9: enter "Michael" into "Middle Name"
        try:
            # Try to find input field for 'middle name'
            input_field = None
            # Strategy 1: By placeholder
            try:
                input_field = page.get_by_placeholder(re.compile('middle name', re.IGNORECASE))
                await input_field.fill('michael')
                print(f'  ✓ Entered "michael" into "middle name" (by placeholder)')
            except:
                # Strategy 2: By label
                try:
                    input_field = page.get_by_label(re.compile('middle name', re.IGNORECASE))
                    await input_field.fill('michael')
                    print(f'  ✓ Entered "michael" into "middle name" (by label)')
                except:
                    # Strategy 3: By name attribute
                    input_field = page.locator(f'[name*="middle name"]').first
                    await input_field.fill('michael')
                    print(f'  ✓ Entered "michael" into "middle name" (by name)')
        except Exception as e:
            print(f'  ✗ Failed to enter "michael" into "middle name": {e}')
            raise
        
        # Step 10: enter "Smith" into "Last Name"
        try:
            # Try to find input field for 'last name'
            input_field = None
            # Strategy 1: By placeholder
            try:
                input_field = page.get_by_placeholder(re.compile('last name', re.IGNORECASE))
                await input_field.fill('smith')
                print(f'  ✓ Entered "smith" into "last name" (by placeholder)')
            except:
                # Strategy 2: By label
                try:
                    input_field = page.get_by_label(re.compile('last name', re.IGNORECASE))
                    await input_field.fill('smith')
                    print(f'  ✓ Entered "smith" into "last name" (by label)')
                except:
                    # Strategy 3: By name attribute
                    input_field = page.locator(f'[name*="last name"]').first
                    await input_field.fill('smith')
                    print(f'  ✓ Entered "smith" into "last name" (by name)')
        except Exception as e:
            print(f'  ✗ Failed to enter "smith" into "last name": {e}')
            raise
        
        # Step 11: scroll down
        await page.evaluate('window.scrollBy(0, 500)')
        print('  ✓ Scrolled down')
        
        # Step 12: click "Save"
        try:
            # Try to find and click 'save'
            # Strategy 1: By text (exact)
            try:
                button = page.get_by_text('save', exact=True)
                await button.click()
                print(f'  ✓ Clicked "save" (exact text)')
            except:
                # Strategy 2: By text (case insensitive)
                try:
                    button = page.get_by_text(re.compile('save', re.IGNORECASE))
                    await button.click()
                    print(f'  ✓ Clicked "save" (case insensitive)')
                except:
                    # Strategy 3: By role
                    try:
                        button = page.get_by_role('button', name=re.compile('save', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "save" (by role)')
                    except:
                        # Strategy 4: Link
                        button = page.get_by_role('link', name=re.compile('save', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "save" (by link)')
            await page.wait_for_timeout(1000)  # Wait for action to complete
        except Exception as e:
            print(f'  ✗ Failed to click "save": {e}')
            raise
        
        # Step 13: wait 3 sec
        await page.wait_for_timeout(3000)
        print(f'  ✓ Waited 3 seconds')
        
        # Step 14: scroll up
        await page.evaluate('window.scrollBy(0, -500)')
        print('  ✓ Scrolled up')
        
        # Step 15: check that page contains "John Smith"
        try:
            # Check that page contains 'john smith'
            await expect(page.locator('body')).to_contain_text('john smith')
            print(f'  ✓ Verified page contains "john smith"')
        except Exception as e:
            print(f'  ✗ Page does not contain "john smith": {e}')
            raise
        
        # Step 16: check that page contains "Personal Details"
        try:
            # Check that page contains 'personal details'
            await expect(page.locator('body')).to_contain_text('personal details')
            print(f'  ✓ Verified page contains "personal details"')
        except Exception as e:
            print(f'  ✗ Page does not contain "personal details": {e}')
            raise
        
        # Step 17: check that page contains "Employee Full Name"
        try:
            # Check that page contains 'employee full name'
            await expect(page.locator('body')).to_contain_text('employee full name')
            print(f'  ✓ Verified page contains "employee full name"')
        except Exception as e:
            print(f'  ✗ Page does not contain "employee full name": {e}')
            raise
        
        # Step 18: click "Employee List"
        try:
            # Try to find and click 'employee list'
            # Strategy 1: By text (exact)
            try:
                button = page.get_by_text('employee list', exact=True)
                await button.click()
                print(f'  ✓ Clicked "employee list" (exact text)')
            except:
                # Strategy 2: By text (case insensitive)
                try:
                    button = page.get_by_text(re.compile('employee list', re.IGNORECASE))
                    await button.click()
                    print(f'  ✓ Clicked "employee list" (case insensitive)')
                except:
                    # Strategy 3: By role
                    try:
                        button = page.get_by_role('button', name=re.compile('employee list', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "employee list" (by role)')
                    except:
                        # Strategy 4: Link
                        button = page.get_by_role('link', name=re.compile('employee list', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "employee list" (by link)')
            await page.wait_for_timeout(1000)  # Wait for action to complete
        except Exception as e:
            print(f'  ✗ Failed to click "employee list": {e}')
            raise
        
        # Step 19: enter "John" into "Employee Name"
        try:
            # Try to find input field for 'employee name'
            input_field = None
            # Strategy 1: By placeholder
            try:
                input_field = page.get_by_placeholder(re.compile('employee name', re.IGNORECASE))
                await input_field.fill('john')
                print(f'  ✓ Entered "john" into "employee name" (by placeholder)')
            except:
                # Strategy 2: By label
                try:
                    input_field = page.get_by_label(re.compile('employee name', re.IGNORECASE))
                    await input_field.fill('john')
                    print(f'  ✓ Entered "john" into "employee name" (by label)')
                except:
                    # Strategy 3: By name attribute
                    input_field = page.locator(f'[name*="employee name"]').first
                    await input_field.fill('john')
                    print(f'  ✓ Entered "john" into "employee name" (by name)')
        except Exception as e:
            print(f'  ✗ Failed to enter "john" into "employee name": {e}')
            raise
        
        # Step 20: click "Search"
        try:
            # Try to find and click 'search'
            # Strategy 1: By text (exact)
            try:
                button = page.get_by_text('search', exact=True)
                await button.click()
                print(f'  ✓ Clicked "search" (exact text)')
            except:
                # Strategy 2: By text (case insensitive)
                try:
                    button = page.get_by_text(re.compile('search', re.IGNORECASE))
                    await button.click()
                    print(f'  ✓ Clicked "search" (case insensitive)')
                except:
                    # Strategy 3: By role
                    try:
                        button = page.get_by_role('button', name=re.compile('search', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "search" (by role)')
                    except:
                        # Strategy 4: Link
                        button = page.get_by_role('link', name=re.compile('search', re.IGNORECASE))
                        await button.click()
                        print(f'  ✓ Clicked "search" (by link)')
            await page.wait_for_timeout(1000)  # Wait for action to complete
        except Exception as e:
            print(f'  ✗ Failed to click "search": {e}')
            raise
        
        # Step 21: check that page contains "John Michael"
        try:
            # Check that page contains 'john michael'
            await expect(page.locator('body')).to_contain_text('john michael')
            print(f'  ✓ Verified page contains "john michael"')
        except Exception as e:
            print(f'  ✗ Page does not contain "john michael": {e}')
            raise
        
        # Step 22: check that page contains "Smith"
        try:
            # Check that page contains 'smith'
            await expect(page.locator('body')).to_contain_text('smith')
            print(f'  ✓ Verified page contains "smith"')
        except Exception as e:
            print(f'  ✗ Page does not contain "smith": {e}')
            raise
        
        # Test completed successfully
        print('\n✅ All test steps completed successfully!')
        
        # Keep browser open for a moment to see results
        await page.wait_for_timeout(3000)
        
        await browser.close()


if __name__ == '__main__':
    asyncio.run(run_test())