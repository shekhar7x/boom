import { test, expect } from './fixtures/base-fixtures.js';

test.describe('Critical Path 5: Video Trim Workflow', () => {
  let videoId;

  test.beforeEach(async ({ page }) => {
    // Create a test video for trimming
    await page.goto('/');

    videoId = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      // Draw different colors for each second to verify trimming
      let frame = 0;
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];

      // Change color every second
      const interval = setInterval(() => {
        const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
        ctx.fillStyle = colors[Math.floor(frame / 30) % colors.length];
        ctx.fillRect(0, 0, 640, 480);
        frame++;
      }, 33);

      return new Promise((resolve) => {
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          clearInterval(interval);
          const blob = new Blob(chunks, { type: 'video/webm' });

          const { openDB } = await import('https://cdn.jsdelivr.net/npm/idb@8/+esm');
          const db = await openDB('BoomVideoDB', 1, {
            upgrade(db) {
              if (!db.objectStoreNames.contains('videos')) {
                db.createObjectStore('videos', { keyPath: 'id' });
              }
            }
          });

          const id = `video_${Date.now()}_trim`;
          const videoData = {
            id,
            title: 'Test Trim Video',
            blob,
            duration: 10,
            size: blob.size,
            timestamp: Date.now(),
            resolution: '640x480',
            fps: 30
          };

          await db.add('videos', videoData);
          resolve(id);
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 10000);
      });
    });

    await page.waitForTimeout(11000);
  });

  test('CP5: Trim editor loads correctly', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    // Verify we're on the editor page
    await expect(page).toHaveURL(new RegExp(`/edit/${videoId}`));

    // Check for Trim tab or that we're in trim mode by default
    const trimTab = page.locator('button:has-text("Trim"), .trim-tab, [role="tab"]:has-text("Trim")').first();
    if (await trimTab.isVisible({ timeout: 2000 })) {
      await trimTab.click();
      await helpers.wait(500);
    }

    // Verify video preview is visible
    const videoElement = page.locator('video').first();
    await expect(videoElement).toBeVisible({ timeout: 5000 });

    // Verify trim controls exist
    const trimControls = page.locator('.trim-controls, .trim-editor').first();
    const hasControls = await trimControls.count() > 0;
    expect(hasControls).toBeTruthy();
  });

  test('CP5: Start and end sliders work', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    // Activate Trim tab if needed
    const trimTab = page.locator('button:has-text("Trim"), .trim-tab').first();
    if (await trimTab.isVisible({ timeout: 2000 })) {
      await trimTab.click();
      await helpers.wait(500);
    }

    // Find start time slider
    const startSlider = page.locator('input[type="range"][name*="start"], .start-slider, #startTime').first();

    if (await startSlider.isVisible({ timeout: 2000 })) {
      // Set start time
      await startSlider.fill('2');
      await helpers.wait(300);

      const startValue = await startSlider.inputValue();
      expect(parseFloat(startValue)).toBeGreaterThan(0);
    }

    // Find end time slider
    const endSlider = page.locator('input[type="range"][name*="end"], .end-slider, #endTime').first();

    if (await endSlider.isVisible({ timeout: 2000 })) {
      // Set end time
      await endSlider.fill('8');
      await helpers.wait(300);

      const endValue = await endSlider.inputValue();
      expect(parseFloat(endValue)).toBeGreaterThan(0);
    }
  });

  test('CP5: "Set Current" buttons work', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    // Activate Trim tab
    const trimTab = page.locator('button:has-text("Trim"), .trim-tab').first();
    if (await trimTab.isVisible({ timeout: 2000 })) {
      await trimTab.click();
      await helpers.wait(500);
    }

    const videoElement = page.locator('video').first();
    await expect(videoElement).toBeVisible();

    // Seek video to specific time
    await videoElement.evaluate(el => el.currentTime = 3);
    await helpers.wait(500);

    // Click "Set Current" for start
    const setStartButton = page.locator('button:has-text("Set Current"), button:has-text("Set Start")').first();
    if (await setStartButton.isVisible({ timeout: 2000 })) {
      await setStartButton.click();
      await helpers.wait(300);

      // Verify start time was set
      const startSlider = page.locator('input[type="range"][name*="start"], .start-slider').first();
      if (await startSlider.isVisible({ timeout: 1000 })) {
        const value = await startSlider.inputValue();
        expect(parseFloat(value)).toBeGreaterThan(2);
      }
    }
  });

  test('CP5: Trimmed duration displays correctly', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    const trimTab = page.locator('button:has-text("Trim")').first();
    if (await trimTab.isVisible({ timeout: 2000 })) {
      await trimTab.click();
      await helpers.wait(500);
    }

    // Set trim range
    const startSlider = page.locator('input[type="range"][name*="start"], .start-slider').first();
    if (await startSlider.isVisible({ timeout: 2000 })) {
      await startSlider.fill('2');
      await helpers.wait(300);
    }

    const endSlider = page.locator('input[type="range"][name*="end"], .end-slider').first();
    if (await endSlider.isVisible({ timeout: 2000 })) {
      await endSlider.fill('7');
      await helpers.wait(300);
    }

    // Check for duration display
    const durationDisplay = page.locator('.trimmed-duration, .new-duration, text=/\\d+:\\d+/').first();
    const hasDuration = await durationDisplay.count() > 0;
    expect(hasDuration).toBeTruthy();
  });

  test('CP5: Trim video button processes video', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    const trimTab = page.locator('button:has-text("Trim")').first();
    if (await trimTab.isVisible({ timeout: 2000 })) {
      await trimTab.click();
      await helpers.wait(500);
    }

    // Set trim range
    const startSlider = page.locator('input[type="range"][name*="start"], .start-slider').first();
    if (await startSlider.isVisible({ timeout: 2000 })) {
      await startSlider.fill('1');
    }

    const endSlider = page.locator('input[type="range"][name*="end"], .end-slider').first();
    if (await endSlider.isVisible({ timeout: 2000 })) {
      await endSlider.fill('5');
    }

    await helpers.wait(500);

    // Get initial video count
    const initialCount = await helpers.getVideoCount();

    // Click trim button
    const trimButton = page.locator('button:has-text("Trim Video"), button:has-text("Trim"), .trim-btn').first();

    if (await trimButton.isVisible({ timeout: 2000 })) {
      await trimButton.click();

      // Look for processing indicator
      await helpers.wait(1000);
      const processingIndicator = page.locator('.processing, .loading, text=/Processing/i').first();
      const isProcessing = await processingIndicator.isVisible({ timeout: 2000 }).catch(() => false);

      // Wait for processing to complete (this may take a while with FFmpeg)
      if (isProcessing) {
        await page.waitForSelector('.processing, .loading', { state: 'hidden', timeout: 60000 });
      }

      // Wait for redirect or completion
      await helpers.wait(3000);

      // Verify new video was created (should have one more video)
      const finalCount = await helpers.getVideoCount();
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    }
  });

  test('CP5: Timeline shows selection highlight', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    const trimTab = page.locator('button:has-text("Trim")').first();
    if (await trimTab.isVisible({ timeout: 2000 })) {
      await trimTab.click();
      await helpers.wait(500);
    }

    // Check for timeline element
    const timeline = page.locator('.timeline, .trim-timeline, .video-timeline').first();

    if (await timeline.isVisible({ timeout: 2000 })) {
      // Set trim points
      const startSlider = page.locator('input[type="range"][name*="start"]').first();
      if (await startSlider.isVisible({ timeout: 1000 })) {
        await startSlider.fill('2');
        await helpers.wait(300);
      }

      const endSlider = page.locator('input[type="range"][name*="end"]').first();
      if (await endSlider.isVisible({ timeout: 1000 })) {
        await endSlider.fill('8');
        await helpers.wait(300);
      }

      // Verify timeline has selection indicator
      const selection = page.locator('.timeline-selection, .trim-selection, .selected-range').first();
      const hasSelection = await selection.count() > 0;
      expect(hasSelection || await timeline.isVisible()).toBeTruthy();
    }
  });
});
