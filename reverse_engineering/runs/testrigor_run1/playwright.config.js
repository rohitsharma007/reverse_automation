const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    // Wait for domcontentloaded instead of load for faster page loads
    waitForLoadState: 'domcontentloaded',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use faster navigation strategies
        waitForLoadState: 'domcontentloaded',
        // Configure proxy for container environment
        proxy: process.env.HTTP_PROXY ? {
          server: process.env.HTTP_PROXY,
        } : undefined,
        launchOptions: {
          // Configure Chromium args for proxy compatibility
          args: [
            '--ignore-certificate-errors',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
          ],
        },
      },
    },
  ],
  timeout: 120000,
  // Improve test speed
  expect: {
    timeout: 10000,
  },
});
