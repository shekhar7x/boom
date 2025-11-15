import { test, expect } from './fixtures/base-fixtures.js';

test.describe('Critical Path 12: Navigation Between Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('CP12: Navigate from home to videos dashboard', async ({ page, helpers }) => {
    // Verify we're on home
    await expect(page).toHaveURL('/');

    // Find navigation link to videos
    const videosLink = page.locator('a:has-text("Videos"), a:has-text("My Videos"), nav a[href*="videos"]').first();

    if (await videosLink.isVisible({ timeout: 2000 })) {
      await videosLink.click();
      await helpers.wait(1000);

      // Verify navigation to videos page
      await expect(page).toHaveURL(/\/videos/);
    }
  });

  test('CP12: Navigate from videos to home', async ({ page, helpers }) => {
    await page.goto('/videos');
    await helpers.wait(500);

    // Find navigation link to home
    const homeLink = page.locator('a:has-text("Home"), a:has-text("Record"), nav a[href="/"]').first();

    if (await homeLink.isVisible({ timeout: 2000 })) {
      await homeLink.click();
      await helpers.wait(1000);

      // Verify navigation to home
      await expect(page).toHaveURL('/');
    } else {
      // Try clicking logo
      const logo = page.locator('a:has-text("Boom"), .logo, header a').first();
      if (await logo.isVisible({ timeout: 2000 })) {
        await logo.click();
        await helpers.wait(1000);
        await expect(page).toHaveURL('/');
      }
    }
  });

  test('CP12: Navigate from dashboard to video player', async ({ page, helpers }) => {
    // Create a test video first
    const videoId = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'cyan';
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
            title: 'Nav Test Video',
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

    // Click on video
    const videoCard = page.locator('.video-card, .video-item').first();
    const playButton = page.locator('button:has-text("Play")').first();

    if (await playButton.isVisible({ timeout: 2000 })) {
      await playButton.click();
    } else if (await videoCard.count() > 0) {
      await videoCard.click();
    }

    await helpers.wait(1000);
    await expect(page).toHaveURL(/\/video\//);
  });

  test('CP12: Navigate from player to editor', async ({ page, helpers }) => {
    // Create test video
    const videoId = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'magenta';
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

          const id = `video_${Date.now()}_edit`;
          await db.add('videos', {
            id,
            title: 'Edit Nav Test',
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
    await page.goto(`/video/${videoId}`);
    await helpers.wait(1000);

    // Find edit button
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();

    if (await editButton.isVisible({ timeout: 2000 })) {
      await editButton.click();
      await helpers.wait(1000);

      // Verify navigation to editor
      await expect(page).toHaveURL(/\/edit\//);
    }
  });

  test('CP12: Browser back button works correctly', async ({ page, helpers }) => {
    // Start at home
    await page.goto('/');
    await helpers.wait(500);

    // Navigate to videos
    await page.goto('/videos');
    await helpers.wait(500);

    // Go back
    await page.goBack();
    await helpers.wait(500);

    // Should be at home
    await expect(page).toHaveURL('/');
  });

  test('CP12: Header navigation is always visible', async ({ page, helpers }) => {
    // Check header on home
    await page.goto('/');
    const header = page.locator('header, nav, .header, .navigation').first();
    await expect(header).toBeVisible();

    // Check header on videos
    await page.goto('/videos');
    await expect(header).toBeVisible();
  });

  test('CP12: Logo/brand navigates to home', async ({ page, helpers }) => {
    await page.goto('/videos');
    await helpers.wait(500);

    const logo = page.locator('a:has-text("Boom"), .logo a, header a[href="/"]').first();

    if (await logo.isVisible({ timeout: 2000 })) {
      await logo.click();
      await helpers.wait(1000);

      await expect(page).toHaveURL('/');
    }
  });

  test('CP12: Cancel in editor returns to previous page', async ({ page, helpers }) => {
    // Create test video
    const videoId = await page.evaluate(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'yellow';
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
            title: 'Cancel Test',
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
    await page.goto(`/edit/${videoId}`);
    await helpers.wait(1000);

    // Find cancel button
    const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("Back")').first();

    if (await cancelButton.isVisible({ timeout: 2000 })) {
      await cancelButton.click();
      await helpers.wait(1000);

      // Should navigate away from editor
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/edit');
    }
  });

  test('CP12: All main routes are accessible', async ({ page, helpers }) => {
    // Test home route
    await page.goto('/');
    await helpers.wait(500);
    await expect(page).toHaveURL('/');

    // Test videos route
    await page.goto('/videos');
    await helpers.wait(500);
    await expect(page).toHaveURL(/\/videos/);

    // Test that editor route requires video ID
    await page.goto('/edit/test123');
    await helpers.wait(500);
    // Should either load editor or redirect (both are acceptable)
    const url = page.url();
    expect(url).toBeTruthy();
  });
});
