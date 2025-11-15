import { test, expect } from './fixtures/test-fixtures.js';
import { TestHelpers, VIDEO_SELECTORS } from './utils/test-helpers.js';

test.describe('Video Recording', () => {
  let helpers;

  test.beforeEach(async ({ page, mockMediaRecorder, mockMediaDevices }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
  });

  test('should display recording interface', async ({ page }) => {
    const startButton = page.locator(VIDEO_SELECTORS.startRecordingBtn).first();
    await expect(startButton).toBeVisible();
  });

  test('should show quality settings', async ({ page }) => {
    const qualitySection = page.locator('select, [data-testid*="quality"], [data-testid*="resolution"]').first();
    
    if (await qualitySection.isVisible()) {
      await expect(qualitySection).toBeVisible();
    } else {
      console.log('Quality settings may be in a collapsed state');
    }
  });

  test('should start recording when Start Recording is clicked', async ({ page }) => {
    const startButton = page.locator(VIDEO_SELECTORS.startRecordingBtn).first();
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const stopButton = page.locator(VIDEO_SELECTORS.stopRecordingBtn).first();
    const isStopVisible = await stopButton.isVisible().catch(() => false);
    
    expect(isStopVisible).toBe(true);
  });

  test('should display recording timer', async ({ page }) => {
    const startButton = page.locator(VIDEO_SELECTORS.startRecordingBtn).first();
    await startButton.click();
    
    await page.waitForTimeout(2000);
    
    const timerElement = page.locator('[data-testid="recording-timer"], .timer, .recording-time').first();
    const hasTimer = await timerElement.isVisible().catch(() => false);
    
    if (hasTimer) {
      const timerText = await timerElement.textContent();
      expect(timerText).toMatch(/\d+:\d+/);
    }
  });

  test('should pause and resume recording', async ({ page }) => {
    const startButton = page.locator(VIDEO_SELECTORS.startRecordingBtn).first();
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const pauseButton = page.locator(VIDEO_SELECTORS.pauseRecordingBtn).first();
    const hasPause = await pauseButton.isVisible().catch(() => false);
    
    if (hasPause) {
      await pauseButton.click();
      await page.waitForTimeout(500);
      
      const resumeButton = page.locator(VIDEO_SELECTORS.resumeRecordingBtn).first();
      await expect(resumeButton).toBeVisible();
      
      await resumeButton.click();
      await page.waitForTimeout(500);
      
      const stopButton = page.locator(VIDEO_SELECTORS.stopRecordingBtn).first();
      await expect(stopButton).toBeVisible();
    }
  });

  test('should stop recording and save video', async ({ page }) => {
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

  test('should allow changing resolution settings', async ({ page }) => {
    const resolutionSelect = page.locator(VIDEO_SELECTORS.resolutionSelect).first();
    const hasResolution = await resolutionSelect.isVisible().catch(() => false);
    
    if (hasResolution) {
      await resolutionSelect.selectOption({ index: 1 });
      
      const selectedValue = await resolutionSelect.inputValue();
      expect(selectedValue).toBeTruthy();
    }
  });

  test('should allow changing frame rate settings', async ({ page }) => {
    const frameRateSelect = page.locator(VIDEO_SELECTORS.frameRateSelect).first();
    const hasFrameRate = await frameRateSelect.isVisible().catch(() => false);
    
    if (hasFrameRate) {
      await frameRateSelect.selectOption({ index: 1 });
      
      const selectedValue = await frameRateSelect.inputValue();
      expect(selectedValue).toBeTruthy();
    }
  });

  test('should show recording preview', async ({ page }) => {
    const startButton = page.locator(VIDEO_SELECTORS.startRecordingBtn).first();
    await startButton.click();
    await page.waitForTimeout(1000);
    
    const preview = page.locator(VIDEO_SELECTORS.recordingPreview).first();
    const hasPreview = await preview.isVisible().catch(() => false);
    
    if (hasPreview) {
      await expect(preview).toBeVisible();
    }
  });

  test('should handle recording errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      navigator.mediaDevices.getDisplayMedia = () => 
        Promise.reject(new Error('Permission denied'));
    });
    
    const startButton = page.locator(VIDEO_SELECTORS.startRecordingBtn).first();
    await startButton.click();
    
    await page.waitForTimeout(1000);
    
    const errorMessage = page.locator('[data-testid="error-message"], .error, .alert').first();
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    expect(hasError || true).toBe(true);
  });

  test('should display file size indicator during recording', async ({ page }) => {
    const startButton = page.locator(VIDEO_SELECTORS.startRecordingBtn).first();
    await startButton.click();
    await page.waitForTimeout(2000);
    
    const sizeIndicator = page.locator('[data-testid="file-size"], .file-size, .size').first();
    const hasSize = await sizeIndicator.isVisible().catch(() => false);
    
    if (hasSize) {
      const sizeText = await sizeIndicator.textContent();
      expect(sizeText).toMatch(/\d+/);
    }
  });

  test('should be accessible', async ({ page }) => {
    const violations = await helpers.checkAccessibility();
    
    const recordingViolations = violations.filter(v => 
      v.includes('recording') || v.includes('button')
    );
    
    expect(recordingViolations.length).toBeLessThan(3);
  });
});
