const { expect } = require('@playwright/test');

/**
 * Advanced AI-Powered Self-Healing Framework with Runtime Diagnostics
 *
 * This framework automatically:
 * - Detects failures during test execution
 * - Extracts HTML structure from the page
 * - Generates alternative selectors
 * - Retries with better strategies
 * - Learns from successes
 * - NO MANUAL INTERVENTION NEEDED
 */

class RuntimeDiagnostics {
  constructor(page) {
    this.page = page;
    this.failureLog = [];
  }

  /**
   * Extract HTML structure around an element
   */
  async extractElementContext(selector) {
    try {
      const elements = await this.page.locator(selector).all();
      const contexts = [];

      for (const element of elements) {
        const html = await element.evaluate(el => {
          return {
            tag: el.tagName.toLowerCase(),
            classes: Array.from(el.classList),
            id: el.id,
            text: el.textContent?.trim(),
            attributes: Array.from(el.attributes).reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {}),
            parent: {
              tag: el.parentElement?.tagName.toLowerCase(),
              classes: Array.from(el.parentElement?.classList || [])
            },
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label')
          };
        });
        contexts.push(html);
      }

      return contexts;
    } catch (error) {
      return [];
    }
  }

  /**
   * Analyze strict mode violation and generate better selectors
   */
  async analyzeStrictModeViolation(originalSelector, expectedText) {
    console.log(`\n🔍 [AI Diagnostics] Analyzing strict mode violation for: "${expectedText}"`);

    // Extract all matching elements
    const contexts = await this.extractElementContext(originalSelector);

    console.log(`📊 Found ${contexts.length} matching elements:`);
    contexts.forEach((ctx, i) => {
      console.log(`  ${i + 1}. <${ctx.tag}> with role="${ctx.role || 'none'}" class="${ctx.classes.join(' ')}"`);
      console.log(`     Text: "${ctx.text?.substring(0, 50)}"`);
      console.log(`     Parent: <${ctx.parent.tag}> class="${ctx.parent.classes.join(' ')}"`);
    });

    // Generate better selectors based on analysis
    const betterSelectors = this.generateBetterSelectors(contexts, expectedText);

    console.log(`\n💡 [AI Diagnostics] Generated ${betterSelectors.length} alternative selectors`);

    return betterSelectors;
  }

  /**
   * Generate better, more specific selectors
   */
  generateBetterSelectors(contexts, expectedText) {
    const selectors = [];

    contexts.forEach((ctx, index) => {
      // Strategy 1: Use role if available
      if (ctx.role) {
        selectors.push({
          description: `Element ${index + 1}: Role-based (${ctx.role})`,
          locator: (page) => page.getByRole(ctx.role, { name: expectedText }),
          priority: 10
        });
      }

      // Strategy 2: Use heading level for h1-h6 tags
      if (ctx.tag.match(/^h[1-6]$/)) {
        const level = parseInt(ctx.tag.substring(1));
        selectors.push({
          description: `Element ${index + 1}: Heading level ${level}`,
          locator: (page) => page.getByRole('heading', { name: expectedText, level }),
          priority: 9
        });
      }

      // Strategy 3: Use class-based selector
      if (ctx.classes.length > 0) {
        const classSelector = ctx.classes.map(c => `.${c}`).join('');
        selectors.push({
          description: `Element ${index + 1}: Class-based (${classSelector})`,
          locator: (page) => page.locator(`${ctx.tag}${classSelector}:has-text("${expectedText}")`),
          priority: 8
        });
      }

      // Strategy 4: Use parent context
      if (ctx.parent.classes.length > 0) {
        const parentClass = ctx.parent.classes[0];
        selectors.push({
          description: `Element ${index + 1}: Via parent .${parentClass}`,
          locator: (page) => page.locator(`.${parentClass} ${ctx.tag}:has-text("${expectedText}")`),
          priority: 7
        });
      }

      // Strategy 5: Use specific tag + text
      selectors.push({
        description: `Element ${index + 1}: Tag-based (${ctx.tag})`,
        locator: (page) => page.locator(`${ctx.tag}:has-text("${expectedText}")`).first(),
        priority: 6
      });

      // Strategy 6: Use data attributes if available
      const dataAttrs = Object.keys(ctx.attributes).filter(k => k.startsWith('data-'));
      if (dataAttrs.length > 0) {
        const dataAttr = dataAttrs[0];
        selectors.push({
          description: `Element ${index + 1}: Data attribute (${dataAttr})`,
          locator: (page) => page.locator(`[${dataAttr}="${ctx.attributes[dataAttr]}"]:has-text("${expectedText}")`),
          priority: 5
        });
      }
    });

    // Sort by priority (highest first)
    return selectors.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Log failure for learning
   */
  logFailure(error, context) {
    this.failureLog.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      context,
      stackTrace: error.stack
    });
  }
}

class AdaptiveElementFinder {
  constructor(page) {
    this.page = page;
    this.diagnostics = new RuntimeDiagnostics(page);
    this.successCache = new Map();
  }

  /**
   * Intelligent element finder with automatic error recovery
   */
  async findAndVerifyVisible(selector, options = {}) {
    const {
      text = null,
      timeout = 10000,
      role = null,
      level = null
    } = options;

    let lastError = null;

    try {
      // Try original selector first
      const locator = this.buildLocator(selector, { text, role, level });
      await expect(locator).toBeVisible({ timeout });

      // Cache success
      this.cacheSuccess(selector, { text, role, level }, 'original');

      return locator;
    } catch (error) {
      lastError = error;

      // Check if it's a strict mode violation
      if (error.message.includes('strict mode violation')) {
        console.log('\n⚠️  [AI Self-Heal] Detected strict mode violation');
        console.log('🤖 [AI Self-Heal] Activating automatic repair...\n');

        // Extract and analyze
        const betterSelectors = await this.diagnostics.analyzeStrictModeViolation(
          selector,
          text || selector
        );

        // Try each generated selector
        for (const strategy of betterSelectors) {
          try {
            console.log(`🔄 [AI Self-Heal] Trying: ${strategy.description}`);

            const locator = strategy.locator(this.page);
            await expect(locator).toBeVisible({ timeout: 3000 });

            console.log(`✅ [AI Self-Heal] SUCCESS with: ${strategy.description}\n`);

            // Cache this success for future use
            this.cacheSuccess(selector, { text, role, level }, strategy.description);

            return locator;
          } catch (retryError) {
            console.log(`   ❌ Failed: ${retryError.message.split('\n')[0]}`);
            continue;
          }
        }

        // If all strategies failed, throw with helpful message
        console.error('\n❌ [AI Self-Heal] All strategies exhausted');
        this.diagnostics.logFailure(lastError, { selector, text, role, level });
        throw new Error(`AI Self-Heal: Could not find visible element after trying ${betterSelectors.length} strategies. Original error: ${lastError.message}`);
      }

      // For non-strict-mode errors, try smart fallbacks
      return await this.trySmartFallbacks(selector, { text, role, level, timeout }, lastError);
    }
  }

  /**
   * Build locator based on options
   */
  buildLocator(selector, options) {
    const { text, role, level } = options;

    // Check cache first
    const cached = this.getCachedStrategy(selector, options);
    if (cached) {
      console.log(`⚡ [Cache Hit] Using previously successful strategy: ${cached}`);
      return this.buildLocatorFromStrategy(cached, selector, options);
    }

    if (role) {
      if (level) {
        return this.page.getByRole(role, { name: text, level });
      }
      return this.page.getByRole(role, { name: text });
    }

    if (text) {
      return this.page.getByText(text);
    }

    return this.page.locator(selector);
  }

  /**
   * Build locator from cached strategy
   */
  buildLocatorFromStrategy(strategy, selector, options) {
    if (strategy.includes('heading level')) {
      const level = parseInt(strategy.match(/level (\d)/)?.[1]);
      return this.page.getByRole('heading', { name: options.text, level });
    }
    if (strategy.includes('Role-based')) {
      const role = strategy.match(/Role-based \((\w+)\)/)?.[1];
      return this.page.getByRole(role, { name: options.text });
    }
    // Fallback to original
    return this.buildLocator(selector, options);
  }

  /**
   * Try smart fallbacks for other types of errors
   */
  async trySmartFallbacks(selector, options, originalError) {
    const { text, timeout } = options;

    console.log('\n🔄 [AI Self-Heal] Trying smart fallbacks...');

    const fallbackStrategies = [
      {
        desc: 'First matching element',
        locator: () => this.page.locator(selector).first()
      },
      {
        desc: 'Visible element only',
        locator: () => this.page.locator(selector).locator('visible=true').first()
      },
      {
        desc: 'Text content match',
        locator: () => text ? this.page.locator(`text="${text}"`).first() : null
      },
      {
        desc: 'Partial text match',
        locator: () => text ? this.page.locator(`text=${text}`).first() : null
      }
    ];

    for (const strategy of fallbackStrategies) {
      if (!strategy.locator()) continue;

      try {
        console.log(`🔄 [AI Self-Heal] Trying: ${strategy.desc}`);
        const locator = strategy.locator();
        await expect(locator).toBeVisible({ timeout: 3000 });
        console.log(`✅ [AI Self-Heal] SUCCESS with: ${strategy.desc}\n`);
        return locator;
      } catch (error) {
        continue;
      }
    }

    // All strategies failed
    throw originalError;
  }

  /**
   * Cache successful strategy
   */
  cacheSuccess(selector, options, strategy) {
    const key = JSON.stringify({ selector, ...options });
    this.successCache.set(key, strategy);
  }

  /**
   * Get cached strategy
   */
  getCachedStrategy(selector, options) {
    const key = JSON.stringify({ selector, ...options });
    return this.successCache.get(key);
  }

  /**
   * Get diagnostics report
   */
  getDiagnosticsReport() {
    return {
      failures: this.diagnostics.failureLog,
      cachedStrategies: Array.from(this.successCache.entries()).map(([k, v]) => ({
        selector: k,
        strategy: v
      }))
    };
  }
}

/**
 * Test helper with automatic self-healing
 */
class SelfHealingTestHelper {
  constructor(page) {
    this.page = page;
    this.finder = new AdaptiveElementFinder(page);
  }

  /**
   * Verify element visible with automatic self-healing
   */
  async expectVisible(selector, options = {}) {
    return await this.finder.findAndVerifyVisible(selector, options);
  }

  /**
   * Click element with automatic self-healing
   */
  async click(selector, options = {}) {
    const element = await this.finder.findAndVerifyVisible(selector, options);
    await element.click();
  }

  /**
   * Fill input with automatic self-healing
   */
  async fill(selector, value, options = {}) {
    const element = await this.finder.findAndVerifyVisible(selector, options);
    await element.fill(value);
  }

  /**
   * Find input by label text (works even without proper label association)
   * This is specifically for OrangeHRM-style forms where labels are divs
   */
  async findInputByLabelText(labelText, options = {}) {
    console.log(`\n🔍 [Smart Input Find] Looking for input with label: "${labelText}"`);

    const strategies = [
      {
        desc: `Proper label association`,
        find: async () => {
          return this.page.getByLabel(labelText).first();
        }
      },
      {
        desc: `Label text then sibling input`,
        find: async () => {
          const labelDiv = this.page.locator(`div:has-text("${labelText}")`).first();
          return labelDiv.locator('..').locator('input').first();
        }
      },
      {
        desc: `Parent container with label text`,
        find: async () => {
          return this.page.locator(`.oxd-input-group:has-text("${labelText}") input`).first();
        }
      },
      {
        desc: `Generic container with label text`,
        find: async () => {
          const container = this.page.locator(`*:has-text("${labelText}")`).first();
          return container.locator('input').first();
        }
      },
      {
        desc: `Textbox with nearby label`,
        find: async () => {
          // Find any textbox near the label text
          return this.page.locator(`textbox`).filter({
            has: this.page.locator(`text="${labelText}"`)
          }).first();
        }
      },
      {
        desc: `Input by placeholder matching label`,
        find: async () => {
          return this.page.getByPlaceholder(new RegExp(labelText, 'i')).first();
        }
      }
    ];

    let lastError = null;

    for (const strategy of strategies) {
      try {
        console.log(`🔄 Trying: ${strategy.desc}`);
        const input = await strategy.find();
        await input.waitFor({ state: 'visible', timeout: options.timeout || 5000 });
        console.log(`✅ SUCCESS with: ${strategy.desc}\n`);
        return input;
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message.split('\n')[0]}`);
        lastError = error;
        continue;
      }
    }

    throw new Error(`Could not find input for label "${labelText}" after trying ${strategies.length} strategies. Last error: ${lastError?.message}`);
  }

  /**
   * Fill input by label text (even without proper label association)
   */
  async fillByLabel(labelText, value, options = {}) {
    const input = await this.findInputByLabelText(labelText, options);
    await input.fill(value);
    console.log(`✅ Filled "${labelText}" with value`);
  }

  /**
   * Get test diagnostics
   */
  getDiagnostics() {
    return this.finder.getDiagnosticsReport();
  }

  /**
   * Print learning summary
   */
  printLearningSummary() {
    const diagnostics = this.getDiagnostics();

    console.log('\n📊 === AI Self-Healing Summary ===');
    console.log(`✅ Cached strategies: ${diagnostics.cachedStrategies.length}`);
    console.log(`❌ Total failures: ${diagnostics.failures.length}`);

    if (diagnostics.cachedStrategies.length > 0) {
      console.log('\n🎓 Learned Strategies:');
      diagnostics.cachedStrategies.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.strategy}`);
      });
    }

    if (diagnostics.failures.length > 0) {
      console.log('\n⚠️  Unresolved Failures:');
      diagnostics.failures.forEach((failure, i) => {
        console.log(`  ${i + 1}. ${failure.error.substring(0, 100)}...`);
      });
    }

    console.log('================================\n');
  }
}

module.exports = {
  SelfHealingTestHelper,
  AdaptiveElementFinder,
  RuntimeDiagnostics
};
