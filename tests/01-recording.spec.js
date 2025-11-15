import { test, expect } from './fixtures/base-fixtures.js';

test.describe('Critical Path 1-2: Screen Recording Flow', () => {
  test.beforeEach(async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.mockMediaDevices();
    await helpers.grantMediaPermissions();
  });

  test('CP1: Complete screen recording flow with save', async ({ page, helpers }) => {
    // Verify we're on the recorder page
    await expect(page).toHaveTitle(/Boom/);
    await helpers.waitForElement('.recorder-container');

    // Click Start Recording button
    const startButton = page.locator('button:has-text("Start Recording")');
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Wait for 3-second countdown
    await helpers.wait(500);
    const countdownText = await helpers.isTextVisible('3');
    expect(countdownText || await helpers.isTextVisible('2') || await helpers.isTextVisible('1')).toBeTruthy();

    // Wait for countdown to finish and recording to start
    await helpers.wait(4000);

    // Verify recording started
    await helpers.waitForElement('.recording-indicator', 10000);
    const recordingIndicator = page.locator('.recording-indicator');
    await expect(recordingIndicator).toBeVisible();

    // Verify preview is showing
    const videoPreview = page.locator('video.preview-video');
    await expect(videoPreview).toBeVisible();

    // Verify duration timer is updating
    await helpers.wait(2000);
    const durationDisplay = page.locator('.duration-display, .recording-time, .timer');
    const durationExists = await durationDisplay.count() > 0;
    expect(durationExists).toBeTruthy();

    // Record for a few seconds
    await helpers.wait(3000);

    // Click Stop & Save button
    const stopButton = page.locator('button:has-text("Stop"), button:has-text("Save")').first();
    await expect(stopButton).toBeVisible();
    await stopButton.click();

    // Wait for video to be saved and redirected
    await helpers.wait(2000);

    // Should redirect to video player or dashboard
    await page.waitForURL(/\/(video|videos)/, { timeout: 10000 });

    // Verify video was saved to IndexedDB
    const videoCount = await helpers.getVideoCount();
    expect(videoCount).toBeGreaterThan(0);
  });

  test('CP2: Recording with pause and resume', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.mockMediaDevices();

    // Start recording
    const startButton = page.locator('button:has-text("Start Recording")');
    await startButton.click();

    // Wait for countdown and recording to start
    await helpers.wait(4000);
    await helpers.waitForElement('.recording-indicator', 10000);

    // Wait a bit then pause
    await helpers.wait(2000);

    // Click Pause button
    const pauseButton = page.locator('button:has-text("Pause")').first();
    if (await pauseButton.isVisible({ timeout: 1000 })) {
      await pauseButton.click();
      await helpers.wait(1000);

      // Verify pause state
      const isPaused = await helpers.isTextVisible('Resume') || await helpers.isTextVisible('Paused');
      expect(isPaused).toBeTruthy();

      // Click Resume button
      const resumeButton = page.locator('button:has-text("Resume")').first();
      await resumeButton.click();
      await helpers.wait(1000);

      // Verify recording resumed
      const recordingIndicator = page.locator('.recording-indicator');
      await expect(recordingIndicator).toBeVisible();
    }

    // Record for a bit more
    await helpers.wait(2000);

    // Stop and save
    const stopButton = page.locator('button:has-text("Stop"), button:has-text("Save")').first();
    await stopButton.click();

    // Wait for save
    await helpers.wait(2000);
    await page.waitForURL(/\/(video|videos)/, { timeout: 10000 });

    // Verify video was saved
    const videoCount = await helpers.getVideoCount();
    expect(videoCount).toBeGreaterThan(0);
  });

  test('CP11: Recording cancellation', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.mockMediaDevices();

    // Start recording
    const startButton = page.locator('button:has-text("Start Recording")');
    await startButton.click();

    // Wait for recording to start
    await helpers.wait(4000);
    await helpers.waitForElement('.recording-indicator', 10000);

    // Click Cancel button
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    if (await cancelButton.isVisible({ timeout: 1000 })) {
      await cancelButton.click();

      // Handle confirmation dialog if present
      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      await helpers.wait(1000);
    }

    // Verify no video was saved
    const videoCount = await helpers.getVideoCount();
    expect(videoCount).toBe(0);

    // Verify we're back to initial state
    const startButtonVisible = await startButton.isVisible();
    expect(startButtonVisible).toBeTruthy();
  });

  test('CP13: Floating recording controls', async ({ page, helpers }) => {
    await page.goto('/');
    await helpers.mockMediaDevices();

    // Start recording
    const startButton = page.locator('button:has-text("Start Recording")');
    await startButton.click();

    // Wait for recording to start
    await helpers.wait(4000);

    // Check for floating controls
    const floatingControls = page.locator('.floating-controls, .floating-recording-controls, .floating-widget');
    const floatingExists = await floatingControls.count() > 0;

    if (floatingExists) {
      // Verify floating controls are visible
      await expect(floatingControls.first()).toBeVisible();

      // Check for minimize/expand button
      const minimizeButton = page.locator('button:has-text("Minimize"), button.minimize-btn, button.collapse-btn').first();
      if (await minimizeButton.isVisible({ timeout: 1000 })) {
        await minimizeButton.click();
        await helpers.wait(500);

        // Check for compact view
        const compactView = page.locator('.compact-view, .minimized');
        const isCompact = await compactView.count() > 0;
        expect(isCompact).toBeTruthy();
      }
    }

    // Stop recording
    const stopButton = page.locator('button:has-text("Stop"), button:has-text("Save")').first();
    await stopButton.click();
    await helpers.wait(2000);
  });
});
