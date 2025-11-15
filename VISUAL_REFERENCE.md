# Floating Recording Controls - Visual Reference

## 🎨 Visual States

### State 1: Minimized (Tiny Dot Mode)
```
┌─┐
│●│  ← 12px × 12px red pulsing dot
└─┘
```
**Purpose**: Maximum invisibility in recordings  
**Action**: Click dot to restore to collapsed state

---

### State 2: Collapsed (Default)
```
┌──────────────────────┐
│ ● REC        00:15   │  ← ~140px × 40px
└──────────────────────┘
```
**Elements**:
- Red pulsing dot (●)
- Status text ("REC" or "Paused")
- Duration timer (MM:SS)

**Action**: Click anywhere to expand

---

### State 3: Expanded (Full Controls)
```
┌──────────────────────────┐
│ ● REC           00:15    │  ← Header (clickable)
├──────────────────────────┤
│  [⏸]         [⏹]        │  ← Control buttons
├──────────────────────────┤
│ Minimize    ◐ ▬▬▬▬▬▬   │  ← Footer controls
└──────────────────────────┘
   ~180px × 120px
```
**Elements**:
- Header: Status + Duration (click to collapse)
- Pause/Resume button (yellow/green)
- Stop button (red)
- Minimize button
- Opacity slider

---

## 🎯 Interactive Elements

### Dragging
```
     Drag anywhere on header
            ↓
┌──────────────────────┐
│ ● REC        00:15   │ ← Cursor: grab/grabbing
└──────────────────────┘
            ↓
     Move to any position
```

### Expanding/Collapsing
```
Collapsed State          Expanded State
┌────────────┐          ┌────────────┐
│ ● REC 00:15│  Click → │ ● REC 00:15│
└────────────┘          ├────────────┤
                        │  [⏸] [⏹]  │
                        ├────────────┤
                        │ Min  ◐ ▬▬ │
                        └────────────┘
```

### Minimizing
```
Expanded State          Minimized State
┌────────────┐          
│ ● REC 00:15│          ┌─┐
├────────────┤  Click → │●│
│  [⏸] [⏹]  │  "Min"   └─┘
├────────────┤          
│ Min  ◐ ▬▬ │          
└────────────┘          
```

---

## 🎨 Color Scheme

### Recording Indicator
```
● ← Red (#ef4444) with pulse animation
```

### Buttons
```
[⏸] ← Pause: Yellow (#fbbf24)
[▶] ← Resume: Green (#22c55e)
[⏹] ← Stop: Red (#ef4444)
```

### Background
```
┌──────────────┐
│ Dark with    │ ← rgba(0, 0, 0, 0.85)
│ blur effect  │   + backdrop-filter: blur(10px)
└──────────────┘
```

---

## 📐 Size Specifications

### Minimized Mode
- **Width**: 12px
- **Height**: 12px
- **Dot Size**: 8px (with 2px padding)
- **Visibility**: Barely noticeable

### Collapsed Mode
- **Width**: ~140px
- **Height**: ~40px
- **Padding**: 8px 12px
- **Border Radius**: 24px

### Expanded Mode
- **Width**: ~180px
- **Height**: ~120px
- **Padding**: 12px
- **Border Radius**: 24px

---

## 🎭 Animations

### Pulsing Dot (Recording)
```
Frame 1:  ●  (100% opacity, scale 1.0)
Frame 2:  ○  (60% opacity, scale 0.85)
Frame 3:  ●  (100% opacity, scale 1.0)
Duration: 2 seconds, infinite loop
```

### Expand Animation
```
Collapsed → Expanded
- Fade in: 0 → 1 opacity
- Slide down: -8px → 0px
- Duration: 0.2s ease-out
```

### Hover Effects
```
Button Normal:  [⏸]
Button Hover:   [⏸]  ← Slightly brighter + translateY(-1px)
Button Active:  [⏸]  ← translateY(0)
```

---

## 🎯 Positioning

### Default Position
```
Screen
┌─────────────────────────────┐
│                      [●REC] │ ← 200px from right
│                             │    100px from top
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

### After Dragging
```
Screen
┌─────────────────────────────┐
│                             │
│                             │
│  [●REC]                     │ ← User-defined position
│                             │    (maintained during session)
│                             │
└─────────────────────────────┘
```

---

## 🔧 Opacity Levels

### 100% Opacity (Default)
```
┌──────────────┐
│ ● REC  00:15 │ ← Fully visible
└──────────────┘
```

### 50% Opacity
```
┌──────────────┐
│ ● REC  00:15 │ ← Semi-transparent
└──────────────┘
(Lighter appearance)
```

### 30% Opacity (Minimum)
```
┌──────────────┐
│ ● REC  00:15 │ ← Very transparent
└──────────────┘
(Barely visible)
```

---

## 📱 Responsive Behavior

### Desktop (> 768px)
```
┌──────────────────────┐
│ ● REC        00:15   │  Full size
└──────────────────────┘
```

### Mobile (≤ 768px)
```
┌────────────────┐
│ ● REC   00:15  │  Slightly smaller
└────────────────┘
```

---

## 🎬 User Interaction Flow

```
1. Start Recording
   ↓
2. Floating Control Appears (Collapsed)
   ┌──────────────┐
   │ ● REC  00:00 │
   └──────────────┘
   ↓
3. User Clicks → Expands
   ┌──────────────┐
   │ ● REC  00:15 │
   ├──────────────┤
   │  [⏸]  [⏹]   │
   ├──────────────┤
   │ Min   ◐ ▬▬  │
   └──────────────┘
   ↓
4. User Clicks "Minimize" → Tiny Dot
   ┌─┐
   │●│
   └─┘
   ↓
5. User Clicks Dot → Back to Collapsed
   ┌──────────────┐
   │ ● REC  00:45 │
   └──────────────┘
```

---

## 🎨 CSS Classes Reference

### Main Container
```css
.floating-recording-controls
  - Base styles
  - Fixed positioning
  - z-index: 9999

.floating-recording-controls.expanded
  - Larger padding
  - Shows controls

.floating-recording-controls.minimized
  - Minimal size
  - Transparent background

.floating-recording-controls.dragging
  - Reduced opacity
  - Grabbing cursor
```

### Components
```css
.floating-minimal
  - 12px × 12px container

.minimal-dot
  - 8px red dot with pulse

.floating-header
  - Status + duration display

.status-dot
  - Pulsing indicator

.floating-control-button
  - Pause/Resume/Stop buttons

.opacity-slider
  - Transparency control
```

---

## 🎯 Best Visibility Settings

### For Minimal Visibility in Recording:
1. **Mode**: Minimized (12px dot)
2. **Opacity**: 30-40%
3. **Position**: Bottom-right corner
4. **Background**: Dark content

### For Easy Access:
1. **Mode**: Collapsed
2. **Opacity**: 80-90%
3. **Position**: Top-right corner
4. **Background**: Any

### For Full Control:
1. **Mode**: Expanded
2. **Opacity**: 90-100%
3. **Position**: Convenient location
4. **Background**: Any

---

## 📊 Comparison Chart

| Feature | Minimized | Collapsed | Expanded |
|---------|-----------|-----------|----------|
| Size | 12×12px | 140×40px | 180×120px |
| Visibility | ⭐ Minimal | ⭐⭐ Low | ⭐⭐⭐ High |
| Controls | None | None | All |
| Info | None | Status+Time | Status+Time |
| Use Case | Recording | Monitoring | Controlling |

---

## ✨ Visual Highlights

### Glass-morphism Effect
- Semi-transparent background
- Backdrop blur (10px)
- Subtle border (white 10% opacity)
- Modern, sleek appearance

### Smooth Transitions
- All state changes animated
- Hover effects on buttons
- Pulsing recording indicator
- Fade in/out effects

### Accessibility
- High contrast colors
- Clear visual indicators
- Tooltips on buttons
- Keyboard-friendly (future)

---

This visual reference provides a complete overview of how the floating recording controls look and behave in different states!
