import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially to avoid IndexedDB conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid IndexedDB conflicts
  reporter: [
    ['html', { outputFolder: 'test-reports/html-report', open: 'never' }],
    ['json', { outputFile: 'test-reports/results.json' }],
    ['junit', { outputFile: 'test-reports/junit.xml' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    permissions: ['camera', 'microphone'],
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--use-file-for-fake-video-capture=/dev/null',
        '--use-file-for-fake-audio-capture=/dev/null',
        '--enable-experimental-web-platform-features'
      ]
    },
    contextOptions: {
      permissions: ['camera', 'microphone']
    }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--enable-experimental-web-platform-features',
            '--auto-select-desktop-capture-source=Entire screen',
            '--enable-features=SharedArrayBuffer'
          ]
        }
      }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
