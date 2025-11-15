/**
 * Test helper utilities for Boom Playwright tests
 */

export class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for a specific timeout
   */
  async wait(ms) {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Clear all IndexedDB data
   */
  async clearIndexedDB() {
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const databases = indexedDB.databases();
        databases.then((dbList) => {
          Promise.all(
            dbList.map((db) => {
              return new Promise((res) => {
                const deleteRequest = indexedDB.deleteDatabase(db.name);
                deleteRequest.onsuccess = () => res();
                deleteRequest.onerror = () => res();
              });
            })
          ).then(() => resolve());
        }).catch(() => resolve());
      });
    });
  }

  /**
   * Add a mock video to IndexedDB for testing
   */
  async addMockVideo(videoData = {}) {
    const defaultData = {
      title: `Test Video ${Date.now()}`,
      duration: 10,
      size: 1024000,
      timestamp: Date.now(),
      resolution: '1280x720',
      fps: 30,
      blob: null
    };

    const video = { ...defaultData, ...videoData };

    // Create a small test video blob if not provided
    if (!video.blob) {
      video.blob = await this.page.evaluate(() => {
        // Create a minimal valid webm video blob for testing
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, 320, 240);

        return new Promise((resolve) => {
          const stream = canvas.captureStream(30);
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
          const chunks = [];

          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            resolve(blob);
          };

          recorder.start();
          setTimeout(() => recorder.stop(), 1000);
        });
      });
    }

    return await this.page.evaluate(async (videoData) => {
      const { openDB } = await import('https://cdn.jsdelivr.net/npm/idb@8/+esm');
      const db = await openDB('BoomVideoDB', 1);

      const id = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.add('videos', { ...videoData, id });
      return id;
    }, video);
  }

  /**
   * Get video count from IndexedDB
   */
  async getVideoCount() {
    return await this.page.evaluate(async () => {
      try {
        const { openDB } = await import('https://cdn.jsdelivr.net/npm/idb@8/+esm');
        const db = await openDB('BoomVideoDB', 1);
        const videos = await db.getAll('videos');
        return videos.length;
      } catch (error) {
        return 0;
      }
    });
  }

  /**
   * Mock media devices for recording tests
   */
  async mockMediaDevices() {
    await this.page.evaluate(() => {
      // Create a canvas for fake video stream
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');

      // Draw something on canvas
      ctx.fillStyle = 'blue';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.fillText('Test Recording', 200, 240);

      const stream = canvas.captureStream(30);

      // Mock getUserMedia
      navigator.mediaDevices.getUserMedia = async (constraints) => {
        return stream;
      };

      // Mock getDisplayMedia for screen capture
      navigator.mediaDevices.getDisplayMedia = async (constraints) => {
        return stream;
      };
    });
  }

  /**
   * Grant permissions for media devices
   */
  async grantMediaPermissions() {
    const context = this.page.context();
    await context.grantPermissions(['camera', 'microphone']);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /**
   * Check if element exists
   */
  async elementExists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Take a screenshot with custom name
   */
  async screenshot(name) {
    await this.page.screenshot({ path: `test-reports/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Wait for network idle
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get element text content
   */
  async getTextContent(selector) {
    return await this.page.textContent(selector);
  }

  /**
   * Check if text is visible on page
   */
  async isTextVisible(text) {
    try {
      await this.page.waitForSelector(`text=${text}`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size in bytes to human readable
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Generate random video title
 */
export function generateVideoTitle() {
  const adjectives = ['Amazing', 'Quick', 'Demo', 'Test', 'Sample'];
  const nouns = ['Recording', 'Video', 'Capture', 'Presentation'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}
