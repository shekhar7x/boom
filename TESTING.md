# Testing Guide - Boom Video Application

## Quick Start

### Run All Tests
```bash
npm test
```

### View Test Report
```bash
npm run test:report
```

---

## Available Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests in headless mode |
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:ui` | Run tests in interactive UI mode |
| `npm run test:report` | Open the HTML test report |
| `npm run test:debug` | Run tests in debug mode |

---

## Running Specific Tests

### By Test File
```bash
# Navigation tests
npx playwright test tests/01-navigation.spec.js

# Recording tests
npx playwright test tests/02-recorder.spec.js

# Dashboard tests
npx playwright test tests/03-dashboard.spec.js

# Video player tests
npx playwright test tests/04-video-player.spec.js

# Video editor tests
npx playwright test tests/05-video-editor.spec.js

# Integration tests
npx playwright test tests/06-integration.spec.js
```

### By Test Name
```bash
# Run tests matching a pattern
npx playwright test -g "should navigate"

# Run tests in a specific describe block
npx playwright test -g "Navigation and Routing"
```

### By Line Number
```bash
# Run a specific test at line 12
npx playwright test tests/01-navigation.spec.js:12
```

---

## Test Modes

### Headless Mode (Default)
Tests run without visible browser window - faster execution.
```bash
npm test
```

### Headed Mode
See the browser while tests run - useful for debugging.
```bash
npm run test:headed
```

### UI Mode
Interactive mode with time-travel debugging.
```bash
npm run test:ui
```

### Debug Mode
Step through tests with Playwright Inspector.
```bash
npm run test:debug
```

---

## Test Reports

### HTML Report
Interactive report with screenshots and videos of failures.
```bash
npm run test:report
```

Location: `playwright-report/index.html`

### JSON Report
Machine-readable test results.

Location: `test-results/results.json`

### Console Output
Real-time test results in terminal during execution.

---

## Test Structure

### Test Files
```
tests/
├── 01-navigation.spec.js      # 9 tests - Navigation & routing
├── 02-recorder.spec.js        # 11 tests - Video recording
├── 03-dashboard.spec.js       # 12 tests - Video dashboard
├── 04-video-player.spec.js    # 18 tests - Video playback
├── 05-video-editor.spec.js    # 21 tests - Video editing
└── 06-integration.spec.js     # 14 tests - E2E workflows
```

### Support Files
```
tests/
├── fixtures/
│   └── test-fixtures.js       # Mocks for MediaRecorder, IndexedDB
└── utils/
    └── test-helpers.js        # Helper functions & selectors
```

---

## Test Coverage

### What's Tested

#### ✅ Navigation (9 tests)
- Page loading and routing
- Navigation links
- Browser back/forward
- Responsive design
- Accessibility

#### ✅ Recording (11 tests)
- Start/stop/pause/resume recording
- Quality settings (resolution, frame rate)
- Recording preview
- Timer and file size indicators
- Error handling

#### ✅ Dashboard (12 tests)
- Video grid display
- Video cards with metadata
- Delete functionality
- Empty state
- Responsive design

#### ✅ Video Player (18 tests)
- Video playback controls
- Seek bar and timeline
- Volume control
- Fullscreen mode
- Navigation to editor
- Keyboard controls

#### ✅ Video Editor (21 tests)
- **Trim:** Set start/end points, preview, process
- **Split:** Add split points, preview segments, process
- **Join:** Select videos, reorder, merge
- Timeline and controls

#### ✅ Integration (14 tests)
- Complete user workflows
- Error handling
- Performance
- Accessibility
- Responsive design

---

## Debugging Failed Tests

### 1. View Screenshots
Failed tests automatically capture screenshots:
```
test-results/[test-name]/test-failed-1.png
```

### 2. Watch Videos
Failed tests record video:
```
test-results/[test-name]/video.webm
```

### 3. Check Error Context
Detailed error information:
```
test-results/[test-name]/error-context.md
```

### 4. Run in Debug Mode
```bash
# Debug specific test
npx playwright test tests/02-recorder.spec.js:27 --debug

# Debug with headed browser
npx playwright test tests/02-recorder.spec.js --headed --debug
```

### 5. Use UI Mode
```bash
npm run test:ui
```
- Time-travel through test execution
- Inspect DOM at any point
- View network requests
- See console logs

---

## Common Issues & Solutions

### Issue: Tests Timeout
**Solution:** Increase timeout in test
```javascript
test('my test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

### Issue: Element Not Found
**Solution:** Check selectors in `tests/utils/test-helpers.js`
```javascript
// Update VIDEO_SELECTORS with correct selectors
export const VIDEO_SELECTORS = {
  startRecordingBtn: '[data-testid="start-recording"]',
  // ...
};
```

### Issue: Mock Not Working
**Solution:** Check mock implementation in `tests/fixtures/test-fixtures.js`

### Issue: Server Not Starting
**Solution:** Check if port 3000 is available
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.js and playwright.config.js
```

---

## Writing New Tests

### Basic Test Structure
```javascript
import { test, expect } from './fixtures/test-fixtures.js';
import { TestHelpers, VIDEO_SELECTORS } from './utils/test-helpers.js';

test.describe('My Feature', () => {
  let helpers;

  test.beforeEach(async ({ page, mockMediaRecorder, mockIndexedDB }) => {
    helpers = new TestHelpers(page);
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.locator(VIDEO_SELECTORS.startRecordingBtn);
    
    // Act
    await button.click();
    
    // Assert
    await expect(button).toBeVisible();
  });
});
```

### Using Test Helpers
```javascript
// Wait for navigation
await helpers.waitForNavigation('/videos');

// Click and wait
await helpers.clickAndWait(VIDEO_SELECTORS.startRecordingBtn);

// Check accessibility
const violations = await helpers.checkAccessibility();
expect(violations.length).toBe(0);

// Add mock video
const videoId = await helpers.addMockVideoToIndexedDB({
  title: 'Test Video',
  duration: 120,
});
```

### Using Fixtures
```javascript
// Fixtures are automatically applied
test('my test', async ({ 
  page, 
  mockMediaRecorder,    // Mocks MediaRecorder API
  mockMediaDevices,     // Mocks getUserMedia/getDisplayMedia
  mockIndexedDB         // Mocks IndexedDB
}) => {
  // Your test code
});
```

---

## Best Practices

### 1. Use Data Test IDs
```jsx
// In components
<button data-testid="start-recording">Start</button>

// In tests
const button = page.locator('[data-testid="start-recording"]');
```

### 2. Wait for Elements
```javascript
// Good
await page.waitForSelector('[data-testid="video-card"]');
await button.click();

// Better
await expect(button).toBeVisible();
await button.click();
```

### 3. Use Descriptive Test Names
```javascript
// Good
test('should start recording when Start Recording is clicked', ...);

// Bad
test('test recording', ...);
```

### 4. Clean Up After Tests
```javascript
test.afterEach(async ({ page }) => {
  await helpers.clearMockDB();
});
```

### 5. Group Related Tests
```javascript
test.describe('Video Recording', () => {
  test.describe('Quality Settings', () => {
    // Related tests
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Performance Tips

### 1. Run Tests in Parallel
Playwright automatically runs tests in parallel (2 workers by default).

### 2. Use Selective Testing
```bash
# Run only changed tests
npx playwright test --only-changed

# Run specific browser
npx playwright test --project=chromium
```

### 3. Reuse Browser Context
Tests automatically reuse browser context when possible.

### 4. Skip Slow Tests in Development
```javascript
test.skip('slow test', async ({ page }) => {
  // This test will be skipped
});
```

---

## Resources

- **Playwright Docs:** https://playwright.dev
- **Test Report:** `TEST_REPORT.md`
- **Configuration:** `playwright.config.js`
- **Fixtures:** `tests/fixtures/test-fixtures.js`
- **Helpers:** `tests/utils/test-helpers.js`

---

## Support

For issues or questions:
1. Check `TEST_REPORT.md` for known issues
2. Review test artifacts in `test-results/`
3. Run tests in debug mode
4. Check Playwright documentation

---

**Last Updated:** November 15, 2025
