import { test, expect } from './fixtures/test-fixtures.js';
import { TestHelpers, VIDEO_SELECTORS } from './utils/test-helpers.js';

test.describe('Navigation and Routing', () => {
  let helpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
  });

  test('should load the home page (Recorder)', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page).toHaveTitle(/Boom/i);
    
    const header = await page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should navigate to Videos dashboard', async ({ page }) => {
    const dashboardLink = page.locator(VIDEO_SELECTORS.navDashboard).first();
    await dashboardLink.click();
    
    await helpers.waitForNavigation(/\/videos/);
    await expect(page).toHaveURL('/videos');
  });

  test('should navigate back to Recorder from Dashboard', async ({ page }) => {
    await page.goto('/videos');
    
    const homeLink = page.locator(VIDEO_SELECTORS.navHome).first();
    await homeLink.click();
    
    await helpers.waitForNavigation('/');
    await expect(page).toHaveURL('/');
  });

  test('should have working navigation links in header', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const navLinks = await header.locator('a').all();
    expect(navLinks.length).toBeGreaterThan(0);
  });

  test('should handle direct URL navigation', async ({ page }) => {
    await page.goto('/videos');
    await expect(page).toHaveURL('/videos');
    
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/');
    const initialTitle = await page.title();
    
    await page.goto('/videos');
    await page.goBack();
    
    await expect(page).toHaveURL('/');
    const finalTitle = await page.title();
    expect(finalTitle).toBe(initialTitle);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    const violations = await helpers.checkAccessibility();
    
    const navViolations = violations.filter(v => v.includes('nav') || v.includes('link'));
    expect(navViolations.length).toBe(0);
  });
});
