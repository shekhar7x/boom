export class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  async waitForNavigation(url) {
    await this.page.waitForURL(url);
    await this.page.waitForLoadState('networkidle');
  }

  async clickAndWait(selector, options = {}) {
    await this.page.click(selector, options);
    await this.page.waitForTimeout(500);
  }

  async fillAndWait(selector, value) {
    await this.page.fill(selector, value);
    await this.page.waitForTimeout(300);
  }

  async waitForElement(selector, options = {}) {
    return await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: 10000,
      ...options,
    });
  }

  async isElementVisible(selector) {
    try {
      const element = await this.page.$(selector);
      return element !== null && await element.isVisible();
    } catch {
      return false;
    }
  }

  async getElementText(selector) {
    const element = await this.page.$(selector);
    return element ? await element.textContent() : null;
  }

  async getElementCount(selector) {
    const elements = await this.page.$$(selector);
    return elements.length;
  }

  async scrollToElement(selector) {
    await this.page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, selector);
    await this.page.waitForTimeout(500);
  }

  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async mockVideoFile(filename = 'test-video.webm') {
    return await this.page.evaluate((name) => {
      const blob = new Blob(['mock video data'], { type: 'video/webm' });
      const file = new File([blob], name, { type: 'video/webm' });
      return {
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }, filename);
  }

  async addMockVideoToIndexedDB(videoData = {}) {
    return await this.page.evaluate((data) => {
      const defaultVideo = {
        id: Date.now(),
        title: data.title || 'Test Video',
        blob: new Blob(['mock video data'], { type: 'video/webm' }),
        duration: data.duration || 60,
        size: data.size || 1024000,
        createdAt: data.createdAt || new Date().toISOString(),
        quality: data.quality || '1080p',
        frameRate: data.frameRate || 30,
        ...data,
      };

      if (window.__mockDB) {
        window.__mockDB.videos.push(defaultVideo);
        return defaultVideo.id;
      }
      return null;
    }, videoData);
  }

  async getMockVideosFromDB() {
    return await this.page.evaluate(() => {
      return window.__mockDB ? window.__mockDB.videos : [];
    });
  }

  async clearMockDB() {
    await this.page.evaluate(() => {
      if (window.__mockDB) {
        window.__mockDB.videos = [];
        window.__mockDB.nextId = 1;
      }
    });
  }

  async checkAccessibility() {
    const violations = await this.page.evaluate(() => {
      const issues = [];
      
      // Check for alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt) {
          issues.push(`Image ${index} missing alt text`);
        }
      });

      // Check for button labels
      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn, index) => {
        if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
          issues.push(`Button ${index} missing label`);
        }
      });

      // Check for form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const id = input.id;
        if (id) {
          const label = document.querySelector(`label[for="${id}"]`);
          if (!label && !input.getAttribute('aria-label')) {
            issues.push(`Input ${index} missing label`);
          }
        }
      });

      return issues;
    });

    return violations;
  }

  async checkResponsiveness() {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' },
    ];

    const results = [];

    for (const viewport of viewports) {
      await this.page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await this.page.waitForTimeout(500);

      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      results.push({
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        hasHorizontalScroll,
      });
    }

    return results;
  }

  async measurePerformance() {
    return await this.page.evaluate(() => {
      const perfData = window.performance.getEntriesByType('navigation')[0];
      return {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      };
    });
  }
}

export const VIDEO_SELECTORS = {
  // Recorder
  startRecordingBtn: '[data-testid="start-recording"], button:has-text("Start Recording")',
  stopRecordingBtn: '[data-testid="stop-recording"], button:has-text("Stop")',
  pauseRecordingBtn: '[data-testid="pause-recording"], button:has-text("Pause")',
  resumeRecordingBtn: '[data-testid="resume-recording"], button:has-text("Resume")',
  recordingPreview: '[data-testid="recording-preview"], video',
  qualitySettings: '[data-testid="quality-settings"]',
  resolutionSelect: '[data-testid="resolution-select"], select[name="resolution"]',
  frameRateSelect: '[data-testid="framerate-select"], select[name="frameRate"]',
  
  // Dashboard
  videoGrid: '[data-testid="video-grid"]',
  videoCard: '[data-testid="video-card"]',
  deleteVideoBtn: '[data-testid="delete-video"]',
  
  // Video Player
  videoPlayer: '[data-testid="video-player"], video',
  playBtn: '[data-testid="play-btn"], button[aria-label="Play"]',
  pauseBtn: '[data-testid="pause-btn"], button[aria-label="Pause"]',
  seekBar: '[data-testid="seek-bar"], input[type="range"]',
  volumeControl: '[data-testid="volume-control"]',
  fullscreenBtn: '[data-testid="fullscreen-btn"]',
  
  // Editor
  editorTabs: '[data-testid="editor-tabs"]',
  trimTab: '[data-testid="trim-tab"], button:has-text("Trim")',
  splitTab: '[data-testid="split-tab"], button:has-text("Split")',
  joinTab: '[data-testid="join-tab"], button:has-text("Join")',
  trimStartInput: '[data-testid="trim-start"]',
  trimEndInput: '[data-testid="trim-end"]',
  trimVideoBtn: '[data-testid="trim-video-btn"], button:has-text("Trim Video")',
  splitPointBtn: '[data-testid="add-split-point"], button:has-text("Add Split Point")',
  splitVideoBtn: '[data-testid="split-video-btn"], button:has-text("Split Video")',
  joinVideosBtn: '[data-testid="join-videos-btn"], button:has-text("Join Videos")',
  
  // Navigation
  navHome: 'a[href="/"], nav a:has-text("Record")',
  navDashboard: 'a[href="/videos"], nav a:has-text("Videos")',
  editVideoBtn: '[data-testid="edit-video"], button:has-text("Edit")',
};
