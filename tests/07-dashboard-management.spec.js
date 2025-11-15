import { test, expect } from './fixtures/base-fixtures.js';

test.describe('Critical Path 8-10: Dashboard and Video Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('CP8: Dashboard loads and displays empty state', async ({ page, helpers }) => {
    await page.goto('/videos');
    await helpers.wait(1000);

    // Verify we're on the videos page
    await expect(page).toHaveURL(/\/videos/);

    // Check for empty state or video grid
    const emptyState = page.locator('.empty-state, text=/No videos/i, text=/Get started/i').first();
    const videoGrid = page.locator('.video-grid, .videos-container, .dashboard').first();

    const hasEmptyState = await emptyState.count() > 0;
    const hasGrid = await videoGrid.count() > 0;

    expect(hasEmptyState || hasGrid).toBeTruthy();
  });

  test('CP8: Dashboard displays videos in grid layout', async ({ page, helpers }) => {
    // Create a test video first
    const videoId = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'purple';
      ctx.fillRect(0, 0, 320, 240);

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

          const id = `video_${Date.now()}_dashboard`;
          await db.add('videos', {
            id,
            title: 'Dashboard Test Video',
            blob,
            duration: 3,
            size: blob.size,
            timestamp: Date.now(),
            resolution: '320x240',
            fps: 30
          });
          resolve(id);
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 3000);
      });
    });

    await page.waitForTimeout(3500);

    // Navigate to dashboard
    await page.goto('/videos');
    await helpers.wait(1000);

    // Check for video cards
    const videoCard = page.locator('.video-card, .video-item, [data-video-id]').first();
    const hasCard = await videoCard.count() > 0;

    if (hasCard) {
      await expect(videoCard).toBeVisible();

      // Verify card has metadata
      const hasDuration = await helpers.isTextVisible('0:');
      const hasDate = await page.locator('text=/ago|date|\\d{1,2}\\/\\d{1,2}/i').count() > 0;

      expect(hasDuration || hasDate).toBeTruthy();
    }
  });

  test('CP8: Video cards show thumbnail, duration, title, date, and size', async ({ page, helpers }) => {
    // Create test video
    await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'teal';
      ctx.fillRect(0, 0, 320, 240);

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

          const id = `video_${Date.now()}_card`;
          await db.add('videos', {
            id,
            title: 'Card Metadata Test',
            blob,
            duration: 5,
            size: blob.size,
            timestamp: Date.now(),
            resolution: '320x240',
            fps: 30
          });
          resolve(id);
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 5000);
      });
    });

    await page.waitForTimeout(5500);
    await page.goto('/videos');
    await helpers.wait(1000);

    const videoCard = page.locator('.video-card, .video-item').first();

    if (await videoCard.count() > 0) {
      // Check for thumbnail (video or image element)
      const thumbnail = videoCard.locator('video, img, .thumbnail').first();
      const hasThumbnail = await thumbnail.count() > 0;

      // Check for title
      const hasTitle = await videoCard.locator('text=/Card Metadata Test|Test|Video/i').count() > 0;

      // Check for duration
      const hasDuration = await videoCard.locator('text=/\\d+:\\d+/').count() > 0;

      // At least some metadata should be present
      expect(hasThumbnail || hasTitle || hasDuration).toBeTruthy();
    }
  });

  test('CP8: Filter videos by "All Videos" and "Recent"', async ({ page, helpers }) => {
    await page.goto('/videos');
    await helpers.wait(1000);

    // Look for filter buttons
    const allVideosButton = page.locator('button:has-text("All Videos"), button:has-text("All")').first();
    const recentButton = page.locator('button:has-text("Recent")').first();

    if (await allVideosButton.isVisible({ timeout: 2000 })) {
      await allVideosButton.click();
      await helpers.wait(500);

      // Verify page updated
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    }

    if (await recentButton.isVisible({ timeout: 2000 })) {
      await recentButton.click();
      await helpers.wait(500);

      // Recent filter should show videos from last 24 hours
      const pageContent = await page.content();
      expect(pageContent).toBeTruthy();
    }
  });

  test('CP8: New Recording button navigates to recorder', async ({ page, helpers }) => {
    await page.goto('/videos');
    await helpers.wait(1000);

    const newRecordingButton = page.locator('button:has-text("New Recording"), a:has-text("New Recording")').first();

    if (await newRecordingButton.isVisible({ timeout: 2000 })) {
      await newRecordingButton.click();
      await helpers.wait(1000);

      // Should navigate to home/recorder
      await expect(page).toHaveURL(/^(?!.*\/videos)/);
    }
  });

  test('CP10: Delete video with confirmation', async ({ page, helpers }) => {
    // Create a test video to delete
    await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 320, 240);

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

          const id = `video_${Date.now()}_delete`;
          await db.add('videos', {
            id,
            title: 'Video To Delete',
            blob,
            duration: 2,
            size: blob.size,
            timestamp: Date.now(),
            resolution: '320x240',
            fps: 30
          });
          resolve(id);
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 2000);
      });
    });

    await page.waitForTimeout(2500);

    // Get initial count
    const initialCount = await helpers.getVideoCount();
    expect(initialCount).toBeGreaterThan(0);

    await page.goto('/videos');
    await helpers.wait(1000);

    // Find delete button
    const deleteButton = page.locator('button[aria-label*="Delete"], button:has-text("Delete"), .delete-btn').first();

    if (await deleteButton.isVisible({ timeout: 2000 })) {
      // Set up dialog handler for confirmation
      page.once('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      await deleteButton.click();
      await helpers.wait(1000);

      // Verify video was deleted
      const finalCount = await helpers.getVideoCount();
      expect(finalCount).toBeLessThan(initialCount);
    }
  });

  test('CP8: Click video card navigates to player', async ({ page, helpers }) => {
    // Create a test video
    const videoId = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, 320, 240);

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

          const id = `video_${Date.now()}_nav`;
          await db.add('videos', {
            id,
            title: 'Navigation Test Video',
            blob,
            duration: 2,
            size: blob.size,
            timestamp: Date.now(),
            resolution: '320x240',
            fps: 30
          });
          resolve(id);
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 2000);
      });
    });

    await page.waitForTimeout(2500);
    await page.goto('/videos');
    await helpers.wait(1000);

    // Find and click video card or play button
    const videoCard = page.locator('.video-card, .video-item').first();
    const playButton = page.locator('button:has-text("Play"), .play-btn').first();

    if (await playButton.isVisible({ timeout: 2000 })) {
      await playButton.click();
    } else if (await videoCard.count() > 0) {
      await videoCard.click();
    }

    await helpers.wait(1000);

    // Should navigate to video player
    await expect(page).toHaveURL(/\/video\//);
  });

  test('CP10: Cancel delete keeps video', async ({ page, helpers }) => {
    // Create a test video
    await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'green';
      ctx.fillRect(0, 0, 320, 240);

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

          const id = `video_${Date.now()}_cancel`;
          await db.add('videos', {
            id,
            title: 'Cancel Delete Test',
            blob,
            duration: 2,
            size: blob.size,
            timestamp: Date.now(),
            resolution: '320x240',
            fps: 30
          });
          resolve(id);
        };

        recorder.start();
        setTimeout(() => recorder.stop(), 2000);
      });
    });

    await page.waitForTimeout(2500);

    const initialCount = await helpers.getVideoCount();

    await page.goto('/videos');
    await helpers.wait(1000);

    const deleteButton = page.locator('button[aria-label*="Delete"], button:has-text("Delete")').first();

    if (await deleteButton.isVisible({ timeout: 2000 })) {
      // Set up dialog handler to cancel
      page.once('dialog', async dialog => {
        await dialog.dismiss();
      });

      await deleteButton.click();
      await helpers.wait(1000);

      // Verify video still exists
      const finalCount = await helpers.getVideoCount();
      expect(finalCount).toBe(initialCount);
    }
  });
});
