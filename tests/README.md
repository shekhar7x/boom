# Boom - Playwright Test Suite

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### View Test Report
```bash
npm run test:report
```

## Test Suites

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:recording` | Test recording flow (CP1, CP2, CP11, CP13) |
| `npm run test:quality` | Test quality settings (CP3) |
| `npm run test:playback` | Test video playback (CP4, CP9) |
| `npm run test:trim` | Test trim workflow (CP5) |
| `npm run test:split` | Test split workflow (CP6) |
| `npm run test:join` | Test join workflow (CP7) |
| `npm run test:dashboard` | Test dashboard & management (CP8, CP10) |
| `npm run test:navigation` | Test navigation (CP12) |

## Advanced Options

| Command | Description |
|---------|-------------|
| `npm run test:headed` | Run tests with visible browser |
| `npm run test:ui` | Run tests with Playwright UI |
| `npm run test:debug` | Debug tests step by step |
| `npm run test:chromium` | Run tests in Chromium only |

## Test Coverage

✅ **52 Tests** covering **13 Critical Paths**

- ✅ Screen Recording (4 tests)
- ✅ Quality Settings (3 tests)
- ✅ Video Playback (7 tests)
- ✅ Trim Workflow (6 tests)
- ✅ Split Workflow (7 tests)
- ✅ Join Workflow (7 tests)
- ✅ Dashboard Management (9 tests)
- ✅ Navigation (9 tests)

## Reports

After running tests, reports are generated in:

- **HTML Report**: `test-reports/html-report/` (interactive)
- **JSON Report**: `test-reports/results.json` (programmatic)
- **JUnit XML**: `test-reports/junit.xml` (CI/CD)

## Documentation

See [TEST_DOCUMENTATION.md](../TEST_DOCUMENTATION.md) for comprehensive documentation including:

- Detailed test descriptions
- Architecture and design
- Configuration options
- CI/CD integration
- Troubleshooting guide
- Extension guide

## Test Structure

```
tests/
├── fixtures/
│   └── base-fixtures.js       # Test fixtures
├── helpers/
│   └── test-helpers.js        # Utility functions
├── 01-recording.spec.js       # Recording tests
├── 02-quality-settings.spec.js # Quality settings tests
├── 03-video-playback.spec.js  # Playback tests
├── 04-video-trim.spec.js      # Trim tests
├── 05-video-split.spec.js     # Split tests
├── 06-video-join.spec.js      # Join tests
├── 07-dashboard-management.spec.js # Dashboard tests
└── 08-navigation.spec.js      # Navigation tests
```

## Key Features

- 🧪 **Comprehensive**: Tests all critical user paths
- 🔄 **Isolated**: Each test is independent with clean state
- 🎯 **Resilient**: Multiple selector strategies for reliability
- 📊 **Detailed Reports**: HTML, JSON, and JUnit formats
- 🚀 **Fast Feedback**: Organized into focused test suites
- 🛠️ **Developer Friendly**: Helpers and fixtures for easy extension

## Requirements

- Node.js 18+
- Chromium (installed automatically by Playwright)
- Running Vite dev server on port 3000

## Tips

1. **Run specific tests**: Add file name after test command
   ```bash
   npx playwright test tests/01-recording.spec.js
   ```

2. **Run one test**: Use `-g` flag with test name
   ```bash
   npx playwright test -g "complete recording flow"
   ```

3. **Update snapshots**: Use `--update-snapshots` flag
   ```bash
   npm test -- --update-snapshots
   ```

4. **Trace viewer**: Open traces from failed tests
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

## Support

- Check [TEST_DOCUMENTATION.md](../TEST_DOCUMENTATION.md) for detailed info
- Review test code for implementation examples
- Use `npm run test:debug` for interactive debugging

---

Happy Testing! 🎬✨
