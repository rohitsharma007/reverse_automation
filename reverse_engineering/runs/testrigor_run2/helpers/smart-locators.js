const { expect } = require('@playwright/test');

/**
 * AI-Powered Self-Healing Test Helpers
 *
 * This module provides intelligent locator strategies that automatically
 * adapt when elements are not found, implementing self-healing patterns
 * commonly used in modern AI-powered test automation.
 */

class SmartLocator {
  constructor(page) {
    this.page = page;
    this.attemptLog = [];
  }

  /**
   * Intelligent element finder with multiple fallback strategies
   * Tries different approaches automatically and logs what worked
   */
  async findElement(config) {
    const strategies = config.strategies || [];
    const elementName = config.name || 'element';

    for (let i = 0; i < strategies.length; i++) {
      const strategy = strategies[i];

      try {
        console.log(`🔍 [SmartLocator] Trying strategy ${i + 1}/${strategies.length}: ${strategy.description}`);

        const locator = await strategy.locate(this.page);

        // Check if element is visible
        const isVisible = await locator.isVisible({ timeout: strategy.timeout || 2000 });

        if (isVisible) {
          console.log(`✅ [SmartLocator] Found ${elementName} using: ${strategy.description}`);
          this.attemptLog.push({
            element: elementName,
            strategy: strategy.description,
            success: true,
            index: i + 1
          });
          return locator;
        }
      } catch (error) {
        console.log(`⚠️  [SmartLocator] Strategy ${i + 1} failed: ${error.message}`);
        this.attemptLog.push({
          element: elementName,
          strategy: strategy.description,
          success: false,
          error: error.message
        });
      }
    }

    // All strategies failed - throw with helpful message
    const triedStrategies = strategies.map(s => s.description).join(', ');
    throw new Error(`❌ [SmartLocator] Could not find ${elementName} after trying: ${triedStrategies}`);
  }

  /**
   * Get success log for analysis
   */
  getSuccessLog() {
    return this.attemptLog.filter(log => log.success);
  }

  /**
   * Suggest best strategy based on past successes
   */
  suggestOptimalStrategy(elementName) {
    const successes = this.attemptLog.filter(log =>
      log.element === elementName && log.success
    );

    if (successes.length > 0) {
      // Find most commonly successful strategy
      const strategyCounts = {};
      successes.forEach(log => {
        strategyCounts[log.strategy] = (strategyCounts[log.strategy] || 0) + 1;
      });

      const best = Object.entries(strategyCounts)
        .sort((a, b) => b[1] - a[1])[0];

      return {
        strategy: best[0],
        successRate: best[1] / successes.length
      };
    }

    return null;
  }
}

/**
 * Smart OrangeHRM Navigation Helper
 * Handles complex navigation with multiple fallback strategies
 */
class OrangeHRMNavigator {
  constructor(page) {
    this.page = page;
    this.smartLocator = new SmartLocator(page);
  }

  /**
   * Navigate to topbar tab with self-healing
   */
  async navigateToTopbarTab(tabName) {
    const strategies = [
      {
        description: `Topbar link with nested span: "${tabName}"`,
        timeout: 3000,
        locate: async (page) => {
          return page.locator(`a.oxd-topbar-body-nav-tab-item:has(span:has-text("${tabName}"))`);
        }
      },
      {
        description: `Direct topbar link: "${tabName}"`,
        timeout: 3000,
        locate: async (page) => {
          return page.locator(`a.oxd-topbar-body-nav-tab-item`).filter({ hasText: tabName });
        }
      },
      {
        description: `Role-based link: "${tabName}"`,
        timeout: 2000,
        locate: async (page) => {
          return page.getByRole('link', { name: tabName });
        }
      },
      {
        description: `Text-based locator: "${tabName}"`,
        timeout: 2000,
        locate: async (page) => {
          return page.getByText(tabName, { exact: true });
        }
      },
      {
        description: `Partial text match: "${tabName}"`,
        timeout: 2000,
        locate: async (page) => {
          return page.locator(`text=${tabName}`).first();
        }
      }
    ];

    const element = await this.smartLocator.findElement({
      name: `${tabName} tab`,
      strategies
    });

    // Ensure element is in viewport before clicking
    await element.scrollIntoViewIfNeeded();
    await element.click();

    return element;
  }

  /**
   * Handle autocomplete input with self-healing
   */
  async fillAutocompleteInput(fieldLabel, value) {
    console.log(`📝 [AutoComplete] Filling "${fieldLabel}" with "${value}"`);

    const strategies = [
      {
        description: `Autocomplete input by class: ${fieldLabel}`,
        timeout: 3000,
        locate: async (page) => {
          // Find the label, then navigate to the autocomplete input
          const container = page.locator(`label:has-text("${fieldLabel}")`).locator('..');
          return container.locator('div.oxd-autocomplete-text-input input').first();
        }
      },
      {
        description: `Direct autocomplete input class`,
        timeout: 2000,
        locate: async (page) => {
          return page.locator('div.oxd-autocomplete-text-input input').first();
        }
      },
      {
        description: `Input by placeholder: ${fieldLabel}`,
        timeout: 2000,
        locate: async (page) => {
          return page.getByPlaceholder(new RegExp(fieldLabel, 'i'));
        }
      },
      {
        description: `Input near label: ${fieldLabel}`,
        timeout: 2000,
        locate: async (page) => {
          const label = page.locator(`label:has-text("${fieldLabel}")`);
          return label.locator('..').locator('input').first();
        }
      },
      {
        description: `Any visible input in form`,
        timeout: 2000,
        locate: async (page) => {
          return page.locator('input[type="text"]').first();
        }
      }
    ];

    const input = await this.smartLocator.findElement({
      name: `${fieldLabel} input`,
      strategies
    });

    // Ensure input is in viewport
    await input.scrollIntoViewIfNeeded();

    // Wait a moment for any animations
    await this.page.waitForTimeout(200);

    // Clear and fill
    await input.clear();
    await input.fill(value);

    // Wait for autocomplete dropdown if it appears
    try {
      await this.page.locator('.oxd-autocomplete-dropdown, .oxd-autocomplete-option')
        .first()
        .waitFor({ timeout: 1000 });
      console.log(`✅ [AutoComplete] Dropdown appeared for "${fieldLabel}"`);
    } catch {
      console.log(`ℹ️  [AutoComplete] No dropdown for "${fieldLabel}" (may be normal)`);
    }

    return input;
  }

  /**
   * Wait for page section to be ready
   */
  async waitForSection(sectionName) {
    const strategies = [
      {
        description: `H6 heading: "${sectionName}"`,
        timeout: 5000,
        locate: async (page) => {
          return page.locator(`h6:has-text("${sectionName}")`);
        }
      },
      {
        description: `H5 heading: "${sectionName}"`,
        timeout: 5000,
        locate: async (page) => {
          return page.locator(`h5:has-text("${sectionName}")`);
        }
      },
      {
        description: `Any heading: "${sectionName}"`,
        timeout: 3000,
        locate: async (page) => {
          return page.locator(`h1, h2, h3, h4, h5, h6`).filter({ hasText: sectionName });
        }
      },
      {
        description: `Text content: "${sectionName}"`,
        timeout: 2000,
        locate: async (page) => {
          return page.getByText(sectionName);
        }
      }
    ];

    const element = await this.smartLocator.findElement({
      name: `${sectionName} section`,
      strategies
    });

    await expect(element).toBeVisible({ timeout: 5000 });
    return element;
  }

  /**
   * Intelligent button click with retries
   */
  async clickButton(buttonName) {
    const strategies = [
      {
        description: `Button role: "${buttonName}"`,
        timeout: 3000,
        locate: async (page) => {
          return page.getByRole('button', { name: buttonName });
        }
      },
      {
        description: `Button with exact text: "${buttonName}"`,
        timeout: 2000,
        locate: async (page) => {
          return page.locator('button').filter({ hasText: new RegExp(`^${buttonName}$`) });
        }
      },
      {
        description: `Button with partial text: "${buttonName}"`,
        timeout: 2000,
        locate: async (page) => {
          return page.locator('button').filter({ hasText: buttonName });
        }
      },
      {
        description: `Any clickable with text: "${buttonName}"`,
        timeout: 2000,
        locate: async (page) => {
          return page.locator(`button, [role="button"], .oxd-button`).filter({ hasText: buttonName }).first();
        }
      }
    ];

    const button = await this.smartLocator.findElement({
      name: `${buttonName} button`,
      strategies
    });

    await button.scrollIntoViewIfNeeded();
    await button.click();

    return button;
  }

  /**
   * Get learning insights from this session
   */
  getLearningInsights() {
    return {
      successfulStrategies: this.smartLocator.getSuccessLog(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate recommendations based on what worked
   */
  generateRecommendations() {
    const log = this.smartLocator.attemptLog;
    const recommendations = [];

    // Analyze patterns
    const failurePatterns = log.filter(l => !l.success);
    const successPatterns = log.filter(l => l.success);

    if (failurePatterns.length > 0) {
      recommendations.push({
        type: 'LOCATOR_IMPROVEMENT',
        message: `${failurePatterns.length} locator strategies failed. Consider updating primary selectors.`
      });
    }

    if (successPatterns.length > 0) {
      const avgIndex = successPatterns.reduce((sum, p) => sum + p.index, 0) / successPatterns.length;
      if (avgIndex > 2) {
        recommendations.push({
          type: 'STRATEGY_ORDER',
          message: `Successful strategies are not in optimal order (avg index: ${avgIndex.toFixed(1)}). Reorder for faster execution.`
        });
      }
    }

    return recommendations;
  }
}

/**
 * AI-Powered Error Analyzer
 * Analyzes test failures and suggests fixes
 */
class ErrorAnalyzer {
  constructor() {
    this.errorPatterns = [];
  }

  /**
   * Analyze error and suggest solutions
   */
  analyzeError(error, context = {}) {
    const analysis = {
      errorType: this.categorizeError(error),
      suggestions: [],
      confidence: 0
    };

    // Pattern matching for common errors
    if (error.message.includes('Target closed') || error.message.includes('browser has been closed')) {
      analysis.suggestions.push({
        fix: 'Browser closed unexpectedly',
        action: 'Check for display/X server requirements, use headless mode, or increase timeout',
        confidence: 0.95
      });
    }

    if (error.message.includes('Timeout') && error.message.includes('waiting for')) {
      const locatorMatch = error.message.match(/locator\('([^']+)'\)/);
      if (locatorMatch) {
        analysis.suggestions.push({
          fix: `Element not found: ${locatorMatch[1]}`,
          action: 'Use SmartLocator with multiple fallback strategies',
          confidence: 0.90
        });
      }
    }

    if (error.message.includes('not visible') || error.message.includes('not interactable')) {
      analysis.suggestions.push({
        fix: 'Element exists but not interactable',
        action: 'Use scrollIntoViewIfNeeded() before interaction',
        confidence: 0.85
      });
    }

    if (error.message.includes('NetworkError') || error.message.includes('net::ERR')) {
      analysis.suggestions.push({
        fix: 'Network connectivity issue',
        action: 'Check internet connection, verify URL accessibility, increase navigation timeout',
        confidence: 0.90
      });
    }

    if (error.message.includes('autocomplete')) {
      analysis.suggestions.push({
        fix: 'Autocomplete field interaction failed',
        action: 'Use OrangeHRMNavigator.fillAutocompleteInput() with adaptive strategies',
        confidence: 0.88
      });
    }

    return analysis;
  }

  /**
   * Categorize error type
   */
  categorizeError(error) {
    if (error.message.includes('Timeout')) return 'TIMEOUT';
    if (error.message.includes('Target closed')) return 'BROWSER_CLOSED';
    if (error.message.includes('not visible')) return 'VISIBILITY';
    if (error.message.includes('NetworkError')) return 'NETWORK';
    if (error.message.includes('locator')) return 'LOCATOR';
    return 'UNKNOWN';
  }

  /**
   * Log error for learning
   */
  logError(error, context) {
    this.errorPatterns.push({
      timestamp: new Date().toISOString(),
      error: error.message,
      type: this.categorizeError(error),
      context,
      analysis: this.analyzeError(error, context)
    });
  }

  /**
   * Get error statistics
   */
  getStatistics() {
    const typeCount = {};
    this.errorPatterns.forEach(pattern => {
      typeCount[pattern.type] = (typeCount[pattern.type] || 0) + 1;
    });

    return {
      totalErrors: this.errorPatterns.length,
      errorTypes: typeCount,
      commonPatterns: this.getCommonPatterns()
    };
  }

  /**
   * Identify common error patterns
   */
  getCommonPatterns() {
    const patterns = {};
    this.errorPatterns.forEach(p => {
      // Extract common words from error messages
      const words = p.error.split(' ').filter(w => w.length > 5);
      words.forEach(word => {
        patterns[word] = (patterns[word] || 0) + 1;
      });
    });

    return Object.entries(patterns)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));
  }
}

module.exports = {
  SmartLocator,
  OrangeHRMNavigator,
  ErrorAnalyzer
};
