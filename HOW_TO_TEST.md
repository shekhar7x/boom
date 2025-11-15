# How to Test the Floating Recording Controls

## 🚀 Quick Start

### 1. Start the Development Server
```bash
npm run dev
```

The app will be available at: `http://localhost:3000`

---

## 🎬 Testing the Feature

### Step 1: Navigate to Recorder
1. Open `http://localhost:3000` in your browser
2. You should see the "Ready to Record" screen
3. Click the **"Start Recording"** button

### Step 2: Grant Permissions
When prompted:
- ✅ Allow screen recording/sharing
- ✅ Allow microphone access (if needed)
- ✅ Select which screen/window to record

**Note**: The floating controls will only appear after permissions are granted and recording actually starts.

### Step 3: Observe the Floating Control
After the 3-second countdown:
- 🎯 A floating control appears in the **top-right corner**
- 🔴 Shows a **red pulsing dot** with "REC" text
- ⏱️ Displays a **live timer** (00:00, 00:01, etc.)

---

## 🧪 Test Scenarios

### Test 1: Basic Visibility
**Goal**: Verify the floating control appears and displays correctly

1. Start recording
2. ✅ Check: Floating control visible in top-right
3. ✅ Check: Red dot is pulsing
4. ✅ Check: "REC" text is displayed
5. ✅ Check: Timer is counting up

---

### Test 2: Expand/Collapse
**Goal**: Test the expand/collapse functionality

1. Start recording
2. **Click** on the floating control
3. ✅ Check: Control expands to show buttons
4. ✅ Check: Pause and Stop buttons visible
5. ✅ Check: Minimize button and opacity slider visible
6. **Click** on the header again
7. ✅ Check: Control collapses back to compact size

---

### Test 3: Dragging
**Goal**: Test the drag-and-drop positioning

1. Start recording
2. **Click and hold** on the floating control header
3. **Drag** to different positions:
   - Top-left corner
   - Bottom-right corner
   - Center of screen
4. ✅ Check: Control follows mouse smoothly
5. ✅ Check: Control stays where you drop it
6. ✅ Check: Cursor changes to "grabbing" while dragging

---

### Test 4: Minimize to Tiny Dot
**Goal**: Test the minimized mode for maximum invisibility

1. Start recording
2. **Click** to expand the control
3. **Click** the "Minimize" button
4. ✅ Check: Control shrinks to tiny red dot (~12px)
5. ✅ Check: Dot is barely visible
6. ✅ Check: Dot still pulses
7. **Click** the tiny dot
8. ✅ Check: Control restores to collapsed state

---

### Test 5: Opacity Adjustment
**Goal**: Test transparency control

1. Start recording
2. **Click** to expand the control
3. **Drag** the opacity slider left (decrease)
4. ✅ Check: Control becomes more transparent
5. **Drag** the opacity slider right (increase)
6. ✅ Check: Control becomes more opaque
7. Try different levels:
   - 30% (very transparent)
   - 50% (semi-transparent)
   - 100% (fully opaque)

---

### Test 6: Pause/Resume
**Goal**: Test recording pause functionality

1. Start recording
2. **Click** to expand the control
3. **Click** the **Pause button** (yellow, with pause icon)
4. ✅ Check: Status changes to "Paused"
5. ✅ Check: Timer stops counting
6. ✅ Check: Pause button changes to Resume button (green)
7. **Click** the **Resume button**
8. ✅ Check: Status changes back to "REC"
9. ✅ Check: Timer continues counting

---

### Test 7: Stop Recording
**Goal**: Test stopping and saving the recording

1. Start recording
2. Record for a few seconds
3. **Click** to expand the control
4. **Click** the **Stop button** (red, with square icon)
5. ✅ Check: Recording stops
6. ✅ Check: Floating control disappears
7. ✅ Check: Video is saved and opens in player

---

### Test 8: Visibility in Recording
**Goal**: Verify minimal visibility in actual recording

1. Start recording
2. Minimize to tiny dot mode
3. Set opacity to 30-40%
4. Position in bottom-right corner
5. Record for 10-15 seconds
6. Stop and save
7. **Play back the recording**
8. ✅ Check: Floating control is barely visible
9. ✅ Check: Doesn't interfere with content

---

## 🎯 Expected Behavior

### When Recording Starts:
- ✅ Floating control appears automatically
- ✅ Positioned in top-right corner by default
- ✅ Shows "REC" status with pulsing dot
- ✅ Timer starts at 00:00

### When Collapsed (Default):
- ✅ Shows: Status dot + "REC" text + Timer
- ✅ Size: ~140px × 40px
- ✅ Click to expand

### When Expanded:
- ✅ Shows: All controls + opacity slider
- ✅ Size: ~180px × 120px
- ✅ Click header to collapse

### When Minimized:
- ✅ Shows: Only tiny red dot
- ✅ Size: 12px × 12px
- ✅ Click dot to restore

### When Dragging:
- ✅ Cursor changes to "grabbing"
- ✅ Control follows mouse
- ✅ Opacity reduces slightly
- ✅ Stays where dropped

### When Recording Stops:
- ✅ Floating control disappears
- ✅ Video is saved
- ✅ Redirects to video player

---

## 🐛 Troubleshooting

### Issue: Floating control doesn't appear
**Possible Causes**:
- Recording didn't actually start
- Permissions were denied
- Browser doesn't support screen recording

**Solutions**:
1. Check browser console for errors
2. Ensure you granted screen recording permission
3. Try refreshing and starting again
4. Use Chrome/Edge/Firefox (latest versions)

---

### Issue: Can't drag the control
**Possible Causes**:
- Clicking on buttons instead of header
- Browser blocking drag events

**Solutions**:
1. Click on the dark background area (not buttons)
2. Click on the status/timer area
3. Try clicking and holding for a moment before dragging

---

### Issue: Control is too visible in recording
**Solutions**:
1. Click "Minimize" to reduce to tiny dot
2. Lower opacity to 30-40%
3. Position in a corner or edge
4. Use against darker backgrounds

---

### Issue: Buttons don't work
**Possible Causes**:
- Recording service error
- State management issue

**Solutions**:
1. Check browser console for errors
2. Try refreshing the page
3. Restart the recording

---

## 📸 Screenshot Checklist

Take screenshots of:
- [ ] Collapsed state (default view)
- [ ] Expanded state (with all controls)
- [ ] Minimized state (tiny dot)
- [ ] Control in different positions
- [ ] Control at different opacity levels
- [ ] Pause state (showing "Paused")
- [ ] Recording state (showing "REC")

---

## ✅ Acceptance Criteria

The feature is working correctly if:

1. ✅ Floating control appears when recording starts
2. ✅ Can be dragged to any position
3. ✅ Can be expanded/collapsed by clicking
4. ✅ Can be minimized to tiny dot
5. ✅ Opacity slider adjusts transparency
6. ✅ Pause button pauses recording
7. ✅ Resume button resumes recording
8. ✅ Stop button stops and saves recording
9. ✅ Timer counts up during recording
10. ✅ Status indicator pulses
11. ✅ Control disappears when recording stops
12. ✅ Minimal visibility in actual recording

---

## 🎓 Tips for Best Results

### For Testing:
1. Use a **real browser** (not headless/automated)
2. Grant all **permissions** when prompted
3. Test on **different screen sizes**
4. Try **different browsers** (Chrome, Firefox, Edge)
5. Record actual content to see visibility

### For Minimal Visibility:
1. Use **minimized mode** (tiny dot)
2. Set opacity to **30-50%**
3. Position in **corner or edge**
4. Use against **dark backgrounds**
5. Keep control **out of main content area**

### For Easy Access:
1. Use **collapsed mode** (compact)
2. Set opacity to **80-90%**
3. Position in **convenient location**
4. Expand when needed for controls

---

## 🎬 Demo Script

Follow this script for a complete demo:

```
1. "Let me show you the new floating recording controls"
2. Click "Start Recording"
3. "Notice the floating control appears in the top-right"
4. "It shows the recording status and timer"
5. Click to expand
6. "Here are all the controls - pause, stop, and settings"
7. Drag to different position
8. "I can drag it anywhere on screen"
9. Click "Minimize"
10. "Now it's just a tiny dot - barely visible"
11. Adjust opacity slider
12. "I can make it more or less transparent"
13. Click pause
14. "I can pause the recording"
15. Click resume
16. "And resume when ready"
17. Click stop
18. "Finally, stop and save the recording"
```

---

## 📝 Test Report Template

```markdown
## Test Report: Floating Recording Controls

**Date**: [Date]
**Browser**: [Chrome/Firefox/Edge/Safari]
**Version**: [Browser version]
**OS**: [Windows/Mac/Linux]

### Test Results:

| Test | Status | Notes |
|------|--------|-------|
| Control appears | ✅/❌ | |
| Dragging works | ✅/❌ | |
| Expand/collapse | ✅/❌ | |
| Minimize to dot | ✅/❌ | |
| Opacity control | ✅/❌ | |
| Pause/resume | ✅/❌ | |
| Stop recording | ✅/❌ | |
| Visibility in recording | ✅/❌ | |

### Issues Found:
[List any issues]

### Suggestions:
[List any suggestions]
```

---

Happy Testing! 🎉
