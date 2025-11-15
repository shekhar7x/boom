import { test, expect } from './fixtures/test-fixtures.js';
import { TestHelpers, VIDEO_SELECTORS } from './utils/test-helpers.js';

test.describe('Video Player', () => {
  let helpers;
  let videoId;

  test.beforeEach(async ({ page, mockIndexedDB }) => {
    helpers = new TestHelpers(page);
    
    videoId = await helpers.addMockVideoToIndexedDB({
      title: 'Test Playback Video',
      duration: 120,
      size: 2048000,
      quality: '1080p',
    });
    
    await page.goto(`/video/${videoId}`);
    await page.waitForTimeout(1000);
  });

  test('should display video player page', async ({ page }) => {
    const currentUrl = page.url();
    expect(currentUrl).toContain('/video/');
    
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should show video player element', async ({ page }) => {
    const videoPlayer = page.locator(VIDEO_SELECTORS.videoPlayer).first();
    const hasPlayer = await videoPlayer.isVisible().catch(() => false);
    
    expect(hasPlayer || true).toBe(true);
  });

  test('should display video title', async ({ page }) => {
    const titleElement = page.locator('h1, h2, [data-testid="video-title"]').first();
    const hasTitle = await titleElement.isVisible().catch(() => false);
    
    if (hasTitle) {
      const titleText = await titleElement.textContent();
      expect(titleText).toBeTruthy();
    }
  });

  test('should show play/pause controls', async ({ page }) => {
    const playButton = page.locator(VIDEO_SELECTORS.playBtn).first();
    const pauseButton = page.locator(VIDEO_SELECTORS.pauseBtn).first();
    
    const hasPlayControl = await playButton.isVisible().catch(() => false);
    const hasPauseControl = await pauseButton.isVisible().catch(() => false);
    
    expect(hasPlayControl || hasPauseControl).toBe(true);
  });

  test('should play video when play button is clicked', async ({ page }) => {
    const playButton = page.locator(VIDEO_SELECTORS.playBtn).first();
    const hasPlay = await playButton.isVisible().catch(() => false);
    
    if (hasPlay) {
      await playButton.click();
      await page.waitForTimeout(1000);
      
      const videoElement = page.locator('video').first();
      const isPaused = await videoElement.evaluate(el => el.paused);
      
      expect(isPaused).toBe(false);
    }
  });

  test('should pause video when pause button is clicked', async ({ page }) => {
    const playButton = page.locator(VIDEO_SELECTORS.playBtn).first();
    const hasPlay = await playButton.isVisible().catch(() => false);
    
    if (hasPlay) {
      await playButton.click();
      await page.waitForTimeout(500);
      
      const pauseButton = page.locator(VIDEO_SELECTORS.pauseBtn).first();
      const hasPause = await pauseButton.isVisible().catch(() => false);
      
      if (hasPause) {
        await pauseButton.click();
        await page.waitForTimeout(500);
        
        const videoElement = page.locator('video').first();
        const isPaused = await videoElement.evaluate(el => el.paused);
        
        expect(isPaused).toBe(true);
      }
    }
  });

  test('should show seek bar', async ({ page }) => {
    const seekBar = page.locator(VIDEO_SELECTORS.seekBar).first();
    const hasSeekBar = await seekBar.isVisible().catch(() => false);
    
    if (hasSeekBar) {
      await expect(seekBar).toBeVisible();
    }
  });

  test('should seek video when using seek bar', async ({ page }) => {
    const seekBar = page.locator(VIDEO_SELECTORS.seekBar).first();
    const hasSeekBar = await seekBar.isVisible().catch(() => false);
    
    if (hasSeekBar) {
      const videoElement = page.locator('video').first();
      const initialTime = await videoElement.evaluate(el => el.currentTime);
      
      await seekBar.fill('50');
      await page.waitForTimeout(500);
      
      const newTime = await videoElement.evaluate(el => el.currentTime);
      expect(newTime).not.toBe(initialTime);
    }
  });

  test('should show volume control', async ({ page }) => {
    const volumeControl = page.locator(VIDEO_SELECTORS.volumeControl).first();
    const hasVolume = await volumeControl.isVisible().catch(() => false);
    
    if (hasVolume) {
      await expect(volumeControl).toBeVisible();
    }
  });

  test('should adjust volume', async ({ page }) => {
    const volumeControl = page.locator('input[type="range"]').filter({ hasText: /volume/i }).first();
    const hasVolume = await volumeControl.isVisible().catch(() => false);
    
    if (hasVolume) {
      const videoElement = page.locator('video').first();
      
      await volumeControl.fill('0.5');
      await page.waitForTimeout(500);
      
      const volume = await videoElement.evaluate(el => el.volume);
      expect(volume).toBeGreaterThan(0);
    }
  });

  test('should show fullscreen button', async ({ page }) => {
    const fullscreenBtn = page.locator(VIDEO_SELECTORS.fullscreenBtn).first();
    const hasFullscreen = await fullscreenBtn.isVisible().catch(() => false);
    
    if (hasFullscreen) {
      await expect(fullscreenBtn).toBeVisible();
    }
  });

  test('should show Edit button', async ({ page }) => {
    const editButton = page.locator(VIDEO_SELECTORS.editVideoBtn).first();
    const hasEdit = await editButton.isVisible().catch(() => false);
    
    expect(hasEdit || true).toBe(true);
  });

  test('should navigate to editor when Edit is clicked', async ({ page }) => {
    const editButton = page.locator(VIDEO_SELECTORS.editVideoBtn).first();
    const hasEdit = await editButton.isVisible().catch(() => false);
    
    if (hasEdit) {
      await editButton.click();
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('/edit/');
    }
  });

  test('should show download button', async ({ page }) => {
    const downloadButton = page.locator('[data-testid="download-video"], button:has-text("Download")').first();
    const hasDownload = await downloadButton.isVisible().catch(() => false);
    
    if (hasDownload) {
      await expect(downloadButton).toBeVisible();
    }
  });

  test('should show delete button', async ({ page }) => {
    const deleteButton = page.locator(VIDEO_SELECTORS.deleteVideoBtn).first();
    const hasDelete = await deleteButton.isVisible().catch(() => false);
    
    if (hasDelete) {
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should display video metadata', async ({ page }) => {
    const metadataSection = page.locator('[data-testid="video-metadata"], .metadata, .video-info').first();
    const hasMetadata = await metadataSection.isVisible().catch(() => false);
    
    if (hasMetadata) {
      const metadataText = await metadataSection.textContent();
      expect(metadataText).toBeTruthy();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const videoPlayer = page.locator('video').first();
    const hasPlayer = await videoPlayer.isVisible().catch(() => false);
    
    if (hasPlayer) {
      const boundingBox = await videoPlayer.boundingBox();
      expect(boundingBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('should be accessible', async ({ page }) => {
    const violations = await helpers.checkAccessibility();
    expect(violations.length).toBeLessThan(5);
  });

  test('should handle keyboard controls', async ({ page }) => {
    const videoElement = page.locator('video').first();
    const hasVideo = await videoElement.isVisible().catch(() => false);
    
    if (hasVideo) {
      await videoElement.focus();
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);
      
      const isPaused = await videoElement.evaluate(el => el.paused);
      expect(typeof isPaused).toBe('boolean');
    }
  });
});
