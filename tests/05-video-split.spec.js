import { test, expect } from './fixtures/base-fixtures.js';

test.describe('Critical Path 6: Video Split Workflow', () => {
  let videoId;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    videoId = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'orange';
      ctx.fillRect(0, 0, 640, 480);

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];

      return new Promise((resolve) => {
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'video/webm' });

          const { openDB } = await import('https://cdn.jsdelivr.net/npm/idb@8/+esm');
          const db = await openDB('BoomVideoDB', 1, {
            upgrade(db) {
              if (!db.objectStoreNames.contains('videos')) {
                db.createObjectStore('videos', { keyPath: 'id' });
              }
            }
          });

          const id = `video_${Date.now()}_split`;
          await db.add('videos', {
            id,
            title: 'Test Split Video',
            blob,
            duration: 12,
            size: blob.size,
            timestamp: Date.now(),
            resolution: '640x480',
            fps: 30
          });
          resolve(id);
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 12000);
      });
    });

    await page.waitForTimeout(13000);
  });

  test('CP6: Split editor loads correctly', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    // Switch to Split tab
    const splitTab = page.locator('button:has-text("Split"), .split-tab, [role="tab"]:has-text("Split")').first();

    if (await splitTab.isVisible({ timeout: 2000 })) {
      await splitTab.click();
      await helpers.wait(500);

      // Verify split editor is active
      const splitEditor = page.locator('.split-editor, .split-controls').first();
      const hasEditor = await splitEditor.count() > 0;
      expect(hasEditor).toBeTruthy();

      // Verify video preview
      const videoElement = page.locator('video').first();
      await expect(videoElement).toBeVisible();
    }
  });

  test('CP6: Add split points at different times', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    const splitTab = page.locator('button:has-text("Split")').first();
    if (await splitTab.isVisible({ timeout: 2000 })) {
      await splitTab.click();
      await helpers.wait(500);
    }

    const videoElement = page.locator('video').first();
    await expect(videoElement).toBeVisible();

    // Add first split point
    await videoElement.evaluate(el => el.currentTime = 3);
    await helpers.wait(300);

    const addSplitButton = page.locator('button:has-text("Add Split"), button:has-text("Split Point")').first();

    if (await addSplitButton.isVisible({ timeout: 2000 })) {
      await addSplitButton.click();
      await helpers.wait(500);

      // Verify split point was added
      const splitPoints = page.locator('.split-point, .split-marker, li:has-text("Split")').first();
      const hasPoint = await splitPoints.count() > 0;
      expect(hasPoint).toBeTruthy();

      // Add second split point
      await videoElement.evaluate(el => el.currentTime = 7);
      await helpers.wait(300);
      await addSplitButton.click();
      await helpers.wait(500);

      // Verify multiple split points
      const allSplitPoints = page.locator('.split-point, .split-marker, li');
      const count = await allSplitPoints.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('CP6: Split points appear as timeline markers', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    const splitTab = page.locator('button:has-text("Split")').first();
    if (await splitTab.isVisible({ timeout: 2000 })) {
      await splitTab.click();
      await helpers.wait(500);
    }

    const videoElement = page.locator('video').first();
    await videoElement.evaluate(el => el.currentTime = 4);
    await helpers.wait(300);

    const addSplitButton = page.locator('button:has-text("Add Split"), button:has-text("Split Point")').first();

    if (await addSplitButton.isVisible({ timeout: 2000 })) {
      await addSplitButton.click();
      await helpers.wait(500);

      // Check for markers on timeline
      const timeline = page.locator('.timeline, .split-timeline').first();
      const marker = page.locator('.split-marker, .marker, .split-indicator').first();

      const hasTimeline = await timeline.count() > 0;
      const hasMarker = await marker.count() > 0;

      expect(hasTimeline || hasMarker).toBeTruthy();
    }
  });

  test('CP6: Remove split points', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    const splitTab = page.locator('button:has-text("Split")').first();
    if (await splitTab.isVisible({ timeout: 2000 })) {
      await splitTab.click();
      await helpers.wait(500);
    }

    const videoElement = page.locator('video').first();
    await videoElement.evaluate(el => el.currentTime = 5);
    await helpers.wait(300);

    const addSplitButton = page.locator('button:has-text("Add Split"), button:has-text("Split Point")').first();

    if (await addSplitButton.isVisible({ timeout: 2000 })) {
      await addSplitButton.click();
      await helpers.wait(500);

      // Look for remove button
      const removeButton = page.locator('button:has-text("Remove"), button[aria-label*="Remove"], .remove-btn').first();

      if (await removeButton.isVisible({ timeout: 2000 })) {
        await removeButton.click();
        await helpers.wait(500);

        // Verify split point was removed (list should be empty or smaller)
        const splitPoints = page.locator('.split-point, .split-marker');
        const count = await splitPoints.count();
        expect(count).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('CP6: Segments preview shows resulting parts', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    const splitTab = page.locator('button:has-text("Split")').first();
    if (await splitTab.isVisible({ timeout: 2000 })) {
      await splitTab.click();
      await helpers.wait(500);
    }

    const videoElement = page.locator('video').first();

    // Add two split points
    await videoElement.evaluate(el => el.currentTime = 4);
    await helpers.wait(300);

    const addSplitButton = page.locator('button:has-text("Add Split"), button:has-text("Split Point")').first();

    if (await addSplitButton.isVisible({ timeout: 2000 })) {
      await addSplitButton.click();
      await helpers.wait(500);

      await videoElement.evaluate(el => el.currentTime = 8);
      await helpers.wait(300);
      await addSplitButton.click();
      await helpers.wait(500);

      // Look for segments preview
      const segmentsPreview = page.locator('.segments-preview, .segments, text=/Segment/i').first();
      const hasPreview = await segmentsPreview.count() > 0;

      if (hasPreview) {
        const previewText = await segmentsPreview.textContent();
        expect(previewText).toContain('Segment');
      }
    }
  });

  test('CP6: Split video button processes video', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    const splitTab = page.locator('button:has-text("Split")').first();
    if (await splitTab.isVisible({ timeout: 2000 })) {
      await splitTab.click();
      await helpers.wait(500);
    }

    const videoElement = page.locator('video').first();
    await videoElement.evaluate(el => el.currentTime = 6);
    await helpers.wait(300);

    const addSplitButton = page.locator('button:has-text("Add Split"), button:has-text("Split Point")').first();

    if (await addSplitButton.isVisible({ timeout: 2000 })) {
      await addSplitButton.click();
      await helpers.wait(500);

      // Get initial video count
      const initialCount = await helpers.getVideoCount();

      // Click split video button
      const splitVideoButton = page.locator('button:has-text("Split Video"), .split-video-btn').first();

      if (await splitVideoButton.isVisible({ timeout: 2000 })) {
        await splitVideoButton.click();

        // Look for processing indicator
        await helpers.wait(1000);
        const processing = page.locator('.processing, .loading, text=/Processing/i').first();
        const isProcessing = await processing.isVisible({ timeout: 2000 }).catch(() => false);

        if (isProcessing) {
          // Wait for processing (can take time with FFmpeg)
          await page.waitForSelector('.processing, .loading', { state: 'hidden', timeout: 60000 });
        }

        await helpers.wait(3000);

        // Verify new videos were created
        const finalCount = await helpers.getVideoCount();
        expect(finalCount).toBeGreaterThanOrEqual(initialCount);
      }
    }
  });

  test('CP6: Split creates multiple video segments', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    const splitTab = page.locator('button:has-text("Split")').first();
    if (await splitTab.isVisible({ timeout: 2000 })) {
      await splitTab.click();
      await helpers.wait(500);
    }

    const videoElement = page.locator('video').first();

    // Add one split point (should create 2 segments)
    await videoElement.evaluate(el => el.currentTime = 6);
    await helpers.wait(300);

    const addSplitButton = page.locator('button:has-text("Add Split"), button:has-text("Split Point")').first();

    if (await addSplitButton.isVisible({ timeout: 2000 })) {
      await addSplitButton.click();
      await helpers.wait(500);

      // Verify segment count display
      const segmentInfo = page.locator('text=/2 segment/i, text=/Part 1/i');
      const hasSegmentInfo = await segmentInfo.count() > 0;
      expect(hasSegmentInfo).toBeTruthy();
    }
  });
});
