import { test as base } from '@playwright/test';
import { TestHelpers } from '../helpers/test-helpers.js';

/**
 * Extended test fixture with helper utilities
 */
export const test = base.extend({
  helpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },

  // Auto-clear IndexedDB before each test
  cleanDatabase: [async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await page.goto('/');
    await helpers.clearIndexedDB();
    await use();
  }, { auto: true }]
});

export { expect } from '@playwright/test';
