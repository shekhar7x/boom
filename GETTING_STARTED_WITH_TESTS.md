# Getting Started with Playwright Tests

Welcome! This guide will help you quickly get started with running the Boom Playwright test suite.

## Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Playwright Browsers
```bash
npx playwright install chromium
```

### 3. Run Tests
```bash
npm test
```

That's it! Your tests are now running. 🎉

---

## What Just Happened?

When you run `npm test`, Playwright will:
1. Start your Vite dev server (http://localhost:3000)
2. Launch a Chromium browser
3. Run 52 automated tests across 8 test suites
4. Generate reports in `test-reports/` folder
5. Display results in your terminal

---

## View Test Results

### HTML Report (Recommended)
```bash
npm run test:report
```

This opens an interactive HTML report with:
- ✅ Pass/fail status for each test
- 📸 Screenshots on failures
- 📊 Execution timeline
- 🔍 Detailed error messages
- 📹 Video recordings of failures

### Terminal Output
Results are also displayed in your terminal after tests complete.

---

## Running Specific Tests

### Run Individual Test Suites

```bash
# Recording tests (4 tests)
npm run test:recording

# Quality settings tests (3 tests)
npm run test:quality

# Video playback tests (7 tests)
npm run test:playback

# Trim workflow tests (6 tests)
npm run test:trim

# Split workflow tests (7 tests)
npm run test:split

# Join workflow tests (7 tests)
npm run test:join

# Dashboard management tests (9 tests)
npm run test:dashboard

# Navigation tests (9 tests)
npm run test:navigation
```

### Run One Specific Test

```bash
# Run by test name (partial match)
npx playwright test -g "complete recording flow"

# Run specific file
npx playwright test tests/01-recording.spec.js
```

---

## Understanding Test Output

### Terminal Output Example

```
Running 52 tests using 1 worker

  ✓ 01-recording.spec.js:9:3 › CP1: Complete screen recording flow (15s)
  ✓ 01-recording.spec.js:52:3 › CP2: Recording with pause and resume (12s)
  ✓ 02-quality-settings.spec.js:8:3 › CP3: Open and configure quality settings (5s)
  ...

  52 passed (17m)

To open last HTML report run:
  npx playwright show-report test-reports/html-report
```

### What Each Symbol Means
- ✓ = Test passed
- ✗ = Test failed
- ○ = Test skipped
- ⊘ = Test interrupted

---

## Debugging Failed Tests

### Option 1: View HTML Report
```bash
npm run test:report
```
Click on failed test to see:
- Screenshot at failure point
- Full error message and stack trace
- Video recording of test execution

### Option 2: Run in Debug Mode
```bash
npm run test:debug
```
This opens Playwright Inspector where you can:
- Step through test actions
- Pause and inspect elements
- See what the test sees

### Option 3: Run with Visible Browser
```bash
npm run test:headed
```
Watch tests run in a real browser window.

---

## Test Suite Overview

### 📁 Test Files

| File | Tests | What It Tests |
|------|-------|---------------|
| `01-recording.spec.js` | 4 | Recording, pause/resume, cancel, floating controls |
| `02-quality-settings.spec.js` | 3 | Quality settings configuration |
| `03-video-playback.spec.js` | 7 | Video player and playback controls |
| `04-video-trim.spec.js` | 6 | Video trimming functionality |
| `05-video-split.spec.js` | 7 | Video splitting at multiple points |
| `06-video-join.spec.js` | 7 | Joining multiple videos |
| `07-dashboard-management.spec.js` | 9 | Dashboard, video library, deletion |
| `08-navigation.spec.js` | 9 | Navigation between pages |

### 🎯 Coverage

- **52 tests** covering **13 critical user paths**
- **100% critical path coverage**
- **~17-24 minutes** to run full suite

---

## Common Issues & Solutions

### Issue: Tests fail with "Port 3000 already in use"
**Solution**: Stop any running dev server and let Playwright start it
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9
# Then run tests
npm test
```

### Issue: "Browser not found"
**Solution**: Install Playwright browsers
```bash
npx playwright install chromium
```

### Issue: Tests timeout
**Solution**: Increase timeout in `playwright.config.js`
```javascript
timeout: 60000, // 60 seconds instead of default 30
```

### Issue: IndexedDB conflicts
**Solution**: Tests already run sequentially (workers: 1), but ensure:
- No other browser tabs have the app open
- Clear browser cache if issues persist

---

## Best Practices

### ✅ Do's
- Run tests before committing code
- Check test reports when tests fail
- Keep tests green (fix failures quickly)
- Run specific suites during development
- Update tests when features change

### ❌ Don'ts
- Don't run tests in parallel (IndexedDB conflicts)
- Don't ignore failing tests
- Don't modify test data during test runs
- Don't run dev server separately (let Playwright manage it)

---

## Next Steps

### For Daily Use
```bash
# Quick smoke test while developing
npm run test:recording
npm run test:dashboard

# Full test before committing
npm test

# View results
npm run test:report
```

### For CI/CD
Add to your `.github/workflows/test.yml`:
```yaml
- name: Run Playwright tests
  run: npm test

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: test-reports/
```

### Learn More
- 📖 [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md) - Comprehensive test docs
- 📊 [TEST_REPORT_SUMMARY.md](./TEST_REPORT_SUMMARY.md) - Detailed test report
- 🎬 [Playwright Docs](https://playwright.dev) - Official documentation

---

## Quick Command Reference

```bash
# Running Tests
npm test                    # Run all tests
npm run test:headed         # Run with visible browser
npm run test:ui             # Run with Playwright UI
npm run test:debug          # Debug mode
npm run test:chromium       # Chromium only

# Individual Suites
npm run test:recording      # Recording tests
npm run test:quality        # Quality settings
npm run test:playback       # Playback tests
npm run test:trim           # Trim workflow
npm run test:split          # Split workflow
npm run test:join           # Join workflow
npm run test:dashboard      # Dashboard tests
npm run test:navigation     # Navigation tests

# Reports
npm run test:report         # Open HTML report

# Advanced
npx playwright test -g "test name"    # Run specific test
npx playwright test --project=chromium # Specific browser
npx playwright show-trace trace.zip    # View trace file
```

---

## Support & Help

### Documentation
- **Quick Start**: This file
- **Detailed Docs**: [TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md)
- **Test Report**: [TEST_REPORT_SUMMARY.md](./TEST_REPORT_SUMMARY.md)
- **Test Examples**: Check `tests/*.spec.js` files

### Debugging
1. Run with `npm run test:debug` for step-by-step execution
2. Run with `npm run test:headed` to see browser
3. Check `test-reports/html-report/` for failure details
4. Look at screenshots in report for visual debugging

### Getting Help
- Review test code for implementation examples
- Check Playwright documentation: https://playwright.dev
- Look at test helpers in `tests/helpers/test-helpers.js`

---

## Success Checklist

Before you start testing:
- [ ] Dependencies installed (`npm install`)
- [ ] Playwright browsers installed (`npx playwright install chromium`)
- [ ] Dev server not running separately
- [ ] Port 3000 is available

Ready to test:
- [ ] Run `npm test` successfully
- [ ] View report with `npm run test:report`
- [ ] Understand test structure
- [ ] Know how to debug failed tests

---

**You're all set!** 🚀

Run `npm test` to start testing, and `npm run test:report` to see beautiful reports.

Happy Testing! 🎬✨
