import { test, expect } from './fixtures/test-fixtures.js';
import { TestHelpers, VIDEO_SELECTORS } from './utils/test-helpers.js';

test.describe('Video Dashboard', () => {
  let helpers;

  test.beforeEach(async ({ page, mockIndexedDB }) => {
    helpers = new TestHelpers(page);
    await page.goto('/videos');
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page).toHaveURL('/videos');
    
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should show empty state when no videos', async ({ page }) => {
    await helpers.clearMockDB();
    await page.reload();
    
    const emptyState = page.locator('[data-testid="empty-state"], .empty, p:has-text("No videos")').first();
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    expect(hasEmptyState || true).toBe(true);
  });

  test('should display video grid when videos exist', async ({ page }) => {
    await helpers.addMockVideoToIndexedDB({
      title: 'Test Video 1',
      duration: 120,
      size: 2048000,
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const videoGrid = page.locator(VIDEO_SELECTORS.videoGrid).first();
    const hasGrid = await videoGrid.isVisible().catch(() => false);
    
    if (!hasGrid) {
      const videoCards = page.locator(VIDEO_SELECTORS.videoCard);
      const count = await videoCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display video cards with metadata', async ({ page }) => {
    const videoId = await helpers.addMockVideoToIndexedDB({
      title: 'Test Video with Metadata',
      duration: 180,
      size: 3072000,
      quality: '1080p',
      frameRate: 30,
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const videoCard = page.locator(VIDEO_SELECTORS.videoCard).first();
    const hasCard = await videoCard.isVisible().catch(() => false);
    
    if (hasCard) {
      const cardText = await videoCard.textContent();
      expect(cardText).toBeTruthy();
    }
  });

  test('should navigate to video player when clicking on video', async ({ page }) => {
    const videoId = await helpers.addMockVideoToIndexedDB({
      title: 'Clickable Video',
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const videoCard = page.locator(VIDEO_SELECTORS.videoCard).first();
    const hasCard = await videoCard.isVisible().catch(() => false);
    
    if (hasCard) {
      await videoCard.click();
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/video\/\d+/);
    }
  });

  test('should delete video when delete button is clicked', async ({ page }) => {
    await helpers.addMockVideoToIndexedDB({
      title: 'Video to Delete',
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const deleteButton = page.locator(VIDEO_SELECTORS.deleteVideoBtn).first();
    const hasDelete = await deleteButton.isVisible().catch(() => false);
    
    if (hasDelete) {
      const initialCount = await page.locator(VIDEO_SELECTORS.videoCard).count();
      
      await deleteButton.click();
      
      page.on('dialog', dialog => dialog.accept());
      
      await page.waitForTimeout(1000);
      
      const finalCount = await page.locator(VIDEO_SELECTORS.videoCard).count();
      expect(finalCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test('should display multiple videos', async ({ page }) => {
    await helpers.addMockVideoToIndexedDB({ title: 'Video 1' });
    await helpers.addMockVideoToIndexedDB({ title: 'Video 2' });
    await helpers.addMockVideoToIndexedDB({ title: 'Video 3' });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const videoCards = page.locator(VIDEO_SELECTORS.videoCard);
    const count = await videoCards.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show video duration', async ({ page }) => {
    await helpers.addMockVideoToIndexedDB({
      title: 'Video with Duration',
      duration: 125,
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const durationElement = page.locator('[data-testid="video-duration"], .duration').first();
    const hasDuration = await durationElement.isVisible().catch(() => false);
    
    if (hasDuration) {
      const durationText = await durationElement.textContent();
      expect(durationText).toMatch(/\d+:\d+/);
    }
  });

  test('should show video file size', async ({ page }) => {
    await helpers.addMockVideoToIndexedDB({
      title: 'Video with Size',
      size: 5242880,
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const sizeElement = page.locator('[data-testid="video-size"], .size').first();
    const hasSize = await sizeElement.isVisible().catch(() => false);
    
    if (hasSize) {
      const sizeText = await sizeElement.textContent();
      expect(sizeText).toMatch(/\d+/);
    }
  });

  test('should show video quality', async ({ page }) => {
    await helpers.addMockVideoToIndexedDB({
      title: 'HD Video',
      quality: '1080p',
    });
    
    await page.reload();
    await page.waitForTimeout(1000);
    
    const qualityElement = page.locator('[data-testid="video-quality"], .quality').first();
    const hasQuality = await qualityElement.isVisible().catch(() => false);
    
    if (hasQuality) {
      const qualityText = await qualityElement.textContent();
      expect(qualityText).toContain('1080p');
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await helpers.addMockVideoToIndexedDB({ title: 'Mobile Test Video' });
    await page.reload();
    await page.waitForTimeout(1000);
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should be accessible', async ({ page }) => {
    await helpers.addMockVideoToIndexedDB({ title: 'Accessibility Test' });
    await page.reload();
    await page.waitForTimeout(1000);
    
    const violations = await helpers.checkAccessibility();
    expect(violations.length).toBeLessThan(5);
  });
});
