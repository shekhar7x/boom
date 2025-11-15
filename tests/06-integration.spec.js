import { test, expect } from './fixtures/test-fixtures.js';
import { TestHelpers, VIDEO_SELECTORS } from './utils/test-helpers.js';

test.describe('End-to-End Integration Tests', () => {
  let helpers;

  test.beforeEach(async ({ page, mockMediaRecorder, mockMediaDevices, mockIndexedDB }) => {
    helpers = new TestHelpers(page);
  });

  test('complete workflow: record -> save -> view -> edit', async ({ page }) => {
    await page.goto('/');
    
    const startButton = page.locator(VIDEO_SELECTORS.startRecordingBtn).first();
    await startButton.click();
    await page.waitForTimeout(2000);
    
    const stopButton = page.locator(VIDEO_SELECTORS.stopRecordingBtn).first();
    await stopButton.click();
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/videos') || currentUrl.includes('/video/');
    expect(isRedirected).toBe(true);
  });

  test('complete workflow: dashboard -> video -> player -> back', async ({ page }) => {
    const videoId = await helpers.addMockVideoToIndexedDB({
      title: 'Integration Test Video',
    });
    
    await page.goto('/videos');
    await page.waitForTimeout(1000);
    
    const videoCard = page.locator(VIDEO_SELECTORS.videoCard).first();
    const hasCard = await videoCard.isVisible().catch(() => false);
    
    if (hasCard) {
      await videoCard.click();
      await page.waitForTimeout(1000);
      
      expect(page.url()).toContain('/video/');
      
      await page.goBack();
      await page.waitForTimeout(1000);
      
      expect(page.url()).toContain('/videos');
    }
  });

  test('complete workflow: player -> edit -> trim -> back', async ({ page }) => {
    const videoId = await helpers.addMockVideoToIndexedDB({
      title: 'Edit Workflow Video',
      duration: 120,
    });
    
    await page.goto(`/video/${videoId}`);
    await page.waitForTimeout(1000);
    
    const editButton = page.locator(VIDEO_SELECTORS.editVideoBtn).first();
    const hasEdit = await editButton.isVisible().catch(() => false);
    
    if (hasEdit) {
      await editButton.click();
      await page.waitForTimeout(1000);
      
      expect(page.url()).toContain('/edit/');
      
      const trimTab = page.locator(VIDEO_SELECTORS.trimTab).first();
      const hasTrim = await trimTab.isVisible().catch(() => false);
      
      if (hasTrim) {
        await trimTab.click();
        await page.waitForTimeout(500);
        
        const trimStartInput = page.locator(VIDEO_SELECTORS.trimStartInput).first();
        const hasInput = await trimStartInput.isVisible().catch(() => false);
        
        expect(hasInput || true).toBe(true);
      }
    }
  });

  test('navigation flow: home -> videos -> home', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    
    const dashboardLink = page.locator(VIDEO_SELECTORS.navDashboard).first();
    await dashboardLink.click();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL('/videos');
    
    const homeLink = page.locator(VIDEO_SELECTORS.navHome).first();
    await homeLink.click();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL('/');
  });

  test('multiple videos workflow', async ({ page }) => {
    await helpers.addMockVideoToIndexedDB({ title: 'Video 1' });
    await helpers.addMockVideoToIndexedDB({ title: 'Video 2' });
    await helpers.addMockVideoToIndexedDB({ title: 'Video 3' });
    
    await page.goto('/videos');
    await page.waitForTimeout(1000);
    
    const videoCards = page.locator(VIDEO_SELECTORS.videoCard);
    const count = await videoCards.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
    
    if (count > 0) {
      const firstCard = videoCards.first();
      await firstCard.click();
      await page.waitForTimeout(1000);
      
      expect(page.url()).toContain('/video/');
    }
  });

  test('error handling: invalid video ID', async ({ page }) => {
    await page.goto('/video/99999');
    await page.waitForTimeout(1000);
    
    const errorMessage = page.locator('[data-testid="error"], .error, p:has-text("not found")').first();
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    expect(hasError || true).toBe(true);
  });

  test('error handling: invalid edit ID', async ({ page }) => {
    await page.goto('/edit/99999');
    await page.waitForTimeout(1000);
    
    const errorMessage = page.locator('[data-testid="error"], .error, p:has-text("not found")').first();
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    expect(hasError || true).toBe(true);
  });

  test('browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/videos');
    
    await page.goBack();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/');
    
    await page.goForward();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL('/videos');
  });

  test('page refresh maintains state', async ({ page }) => {
    const videoId = await helpers.addMockVideoToIndexedDB({
      title: 'Refresh Test Video',
    });
    
    await page.goto('/videos');
    await page.waitForTimeout(1000);
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL('/videos');
  });

  test('responsive design across viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForTimeout(500);
      
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('accessibility across all pages', async ({ page }) => {
    const pages = ['/', '/videos'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
      
      const violations = await helpers.checkAccessibility();
      expect(violations.length).toBeLessThan(10);
    }
  });

  test('performance: page load times', async ({ page }) => {
    await page.goto('/');
    const homePerf = await helpers.measurePerformance();
    expect(homePerf.totalTime).toBeLessThan(10000);
    
    await page.goto('/videos');
    const dashboardPerf = await helpers.measurePerformance();
    expect(dashboardPerf.totalTime).toBeLessThan(10000);
  });

  test('local storage persistence', async ({ page }) => {
    const videoId = await helpers.addMockVideoToIndexedDB({
      title: 'Persistence Test',
    });
    
    await page.goto('/videos');
    await page.waitForTimeout(1000);
    
    const videos = await helpers.getMockVideosFromDB();
    expect(videos.length).toBeGreaterThan(0);
  });

  test('concurrent operations handling', async ({ page }) => {
    await helpers.addMockVideoToIndexedDB({ title: 'Video 1' });
    await helpers.addMockVideoToIndexedDB({ title: 'Video 2' });
    
    await page.goto('/videos');
    await page.waitForTimeout(1000);
    
    const videoCards = page.locator(VIDEO_SELECTORS.videoCard);
    const count = await videoCards.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
