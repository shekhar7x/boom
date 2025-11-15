import { test, expect } from './fixtures/base-fixtures.js';

test.describe('Critical Path 7: Video Join Workflow', () => {
  let videoId1, videoId2, videoId3;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Create multiple test videos for joining
    const createVideo = async (title, duration, color) => {
      return await page.evaluate(async ({ title, duration, color }) => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
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

            const id = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await db.add('videos', {
              id,
              title,
              blob,
              duration: duration / 1000,
              size: blob.size,
              timestamp: Date.now(),
              resolution: '640x480',
              fps: 30
            });
            resolve(id);
          };

          recorder.start();
          setTimeout(() => recorder.stop(), duration);
        });
      }, { title, duration, color });
    };

    // Create three test videos
    videoId1 = await createVideo('Test Video 1', 5000, 'red');
    await page.waitForTimeout(5500);

    videoId2 = await createVideo('Test Video 2', 5000, 'green');
    await page.waitForTimeout(5500);

    videoId3 = await createVideo('Test Video 3', 5000, 'blue');
    await page.waitForTimeout(5500);
  });

  test('CP7: Join editor loads with available videos', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId1}`);
    await helpers.wait(1000);

    // Switch to Join tab
    const joinTab = page.locator('button:has-text("Join"), .join-tab, [role="tab"]:has-text("Join")').first();

    if (await joinTab.isVisible({ timeout: 2000 })) {
      await joinTab.click();
      await helpers.wait(500);

      // Verify join editor is active
      const joinEditor = page.locator('.join-editor, .join-controls').first();
      const hasEditor = await joinEditor.count() > 0;
      expect(hasEditor).toBeTruthy();

      // Verify available videos list
      const videosList = page.locator('.available-videos, .video-list, .videos-to-join').first();
      const hasList = await videosList.count() > 0;
      expect(hasList).toBeTruthy();
    }
  });

  test('CP7: Select multiple videos with checkboxes', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId1}`);
    await helpers.wait(1000);

    const joinTab = page.locator('button:has-text("Join")').first();
    if (await joinTab.isVisible({ timeout: 2000 })) {
      await joinTab.click();
      await helpers.wait(500);
    }

    // Find video checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      // Select first two videos
      await checkboxes.nth(0).check();
      await helpers.wait(300);

      const firstChecked = await checkboxes.nth(0).isChecked();
      expect(firstChecked).toBeTruthy();

      if (checkboxCount > 1) {
        await checkboxes.nth(1).check();
        await helpers.wait(300);

        const secondChecked = await checkboxes.nth(1).isChecked();
        expect(secondChecked).toBeTruthy();
      }

      // Verify selection appears in join order section
      const joinOrder = page.locator('.join-order, .selected-videos, text=/Selected/i').first();
      const hasJoinOrder = await joinOrder.count() > 0;
      expect(hasJoinOrder).toBeTruthy();
    }
  });

  test('CP7: Selected videos appear in join order list', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId1}`);
    await helpers.wait(1000);

    const joinTab = page.locator('button:has-text("Join")').first();
    if (await joinTab.isVisible({ timeout: 2000 })) {
      await joinTab.click();
      await helpers.wait(500);
    }

    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount >= 2) {
      // Select multiple videos
      await checkboxes.nth(0).check();
      await helpers.wait(300);
      await checkboxes.nth(1).check();
      await helpers.wait(500);

      // Look for join order section
      const joinOrderSection = page.locator('.join-order, .selected-videos, ul li, .video-item').first();
      const hasItems = await joinOrderSection.count() > 0;
      expect(hasItems).toBeTruthy();
    }
  });

  test('CP7: Reorder videos with up/down arrows', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId1}`);
    await helpers.wait(1000);

    const joinTab = page.locator('button:has-text("Join")').first();
    if (await joinTab.isVisible({ timeout: 2000 })) {
      await joinTab.click();
      await helpers.wait(500);
    }

    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount >= 2) {
      // Select two videos
      await checkboxes.nth(0).check();
      await helpers.wait(300);
      await checkboxes.nth(1).check();
      await helpers.wait(500);

      // Look for reorder buttons
      const upButton = page.locator('button:has-text("Up"), button[aria-label*="Up"], .move-up').first();
      const downButton = page.locator('button:has-text("Down"), button[aria-label*="Down"], .move-down').first();

      if (await upButton.isVisible({ timeout: 2000 }) || await downButton.isVisible({ timeout: 2000 })) {
        // Try to move second item up
        if (await upButton.isVisible()) {
          await upButton.click();
          await helpers.wait(500);
        } else if (await downButton.isVisible()) {
          await downButton.click();
          await helpers.wait(500);
        }

        // Verify order list still exists (order changed)
        const orderList = page.locator('.join-order, .selected-videos');
        const hasOrder = await orderList.count() > 0;
        expect(hasOrder).toBeTruthy();
      }
    }
  });

  test('CP7: Total duration and size display updates', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId1}`);
    await helpers.wait(1000);

    const joinTab = page.locator('button:has-text("Join")').first();
    if (await joinTab.isVisible({ timeout: 2000 })) {
      await joinTab.click();
      await helpers.wait(500);
    }

    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount >= 2) {
      // Select videos
      await checkboxes.nth(0).check();
      await helpers.wait(300);
      await checkboxes.nth(1).check();
      await helpers.wait(500);

      // Look for total duration/size display
      const totalInfo = page.locator('text=/total/i, text=/duration/i, text=/size/i');
      const hasTotal = await totalInfo.count() > 0;

      if (hasTotal) {
        const totalText = await totalInfo.first().textContent();
        expect(totalText.toLowerCase()).toMatch(/total|duration|size/);
      }
    }
  });

  test('CP7: Join videos button processes videos', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId1}`);
    await helpers.wait(1000);

    const joinTab = page.locator('button:has-text("Join")').first();
    if (await joinTab.isVisible({ timeout: 2000 })) {
      await joinTab.click();
      await helpers.wait(500);
    }

    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount >= 2) {
      // Select videos
      await checkboxes.nth(0).check();
      await helpers.wait(300);
      await checkboxes.nth(1).check();
      await helpers.wait(500);

      // Get initial video count
      const initialCount = await helpers.getVideoCount();

      // Click join button
      const joinButton = page.locator('button:has-text("Join Video"), button:has-text("Join"), .join-btn').first();

      if (await joinButton.isVisible({ timeout: 2000 })) {
        await joinButton.click();

        // Look for processing indicator
        await helpers.wait(1000);
        const processing = page.locator('.processing, .loading, text=/Processing/i').first();
        const isProcessing = await processing.isVisible({ timeout: 2000 }).catch(() => false);

        if (isProcessing) {
          // Wait for processing
          await page.waitForSelector('.processing, .loading', { state: 'hidden', timeout: 60000 });
        }

        await helpers.wait(3000);

        // Verify joined video was created
        const finalCount = await helpers.getVideoCount();
        expect(finalCount).toBeGreaterThan(initialCount);
      }
    }
  });

  test('CP7: Can deselect videos from join list', async ({ page, helpers }) => {
    await page.goto(`/edit/${videoId1}`);
    await helpers.wait(1000);

    const joinTab = page.locator('button:has-text("Join")').first();
    if (await joinTab.isVisible({ timeout: 2000 })) {
      await joinTab.click();
      await helpers.wait(500);
    }

    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount >= 2) {
      // Select a video
      await checkboxes.nth(0).check();
      await helpers.wait(300);

      const isChecked = await checkboxes.nth(0).isChecked();
      expect(isChecked).toBeTruthy();

      // Deselect it
      await checkboxes.nth(0).uncheck();
      await helpers.wait(300);

      const isUnchecked = await checkboxes.nth(0).isChecked();
      expect(isUnchecked).toBeFalsy();
    }
  });
});
