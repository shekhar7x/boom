# Boom - Video Recording & Editing Web App

A powerful web application for recording, editing, and managing videos with advanced features like quality controls, trimming, splitting, and joining videos.

## Features

### 🎥 Advanced Recording
- Screen recording with customizable quality settings
- Webcam recording option
- Combined screen + webcam recording
- Audio recording (system + microphone)
- Quality controls:
  - Resolution selection (4K, 1440p, 1080p, 720p, 480p)
  - Frame rate options (60fps, 30fps, 24fps, 15fps)
  - Bitrate control for file size management
- Real-time recording preview
- Pause/Resume functionality
- Recording timer and file size indicator

### ✂️ Video Editing
- **Trim**: Cut videos to specific start and end points
- **Split**: Split videos into multiple segments at custom timestamps
- **Join**: Combine multiple videos into one seamless video

### 📹 Video Management
- Video library dashboard
- Video metadata (title, date, duration, size, quality)
- Video playback with custom controls
- Download videos
- Delete videos
- Local storage using IndexedDB

### 🎨 Modern UI
- Clean, responsive design
- Dark mode support
- Smooth animations and transitions
- Intuitive controls

## Technology Stack

- **React** - UI framework
- **React Router** - Navigation
- **Vite** - Build tool
- **MediaRecorder API** - Screen/video recording
- **FFmpeg.wasm** - Video editing (trim, split, join)
- **IndexedDB** - Local video storage
- **CSS Variables** - Theming

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd boom
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Testing

### Run Tests
```bash
# Run all tests
npm test

# View test report
npm run test:report

# Run tests with visible browser
npm run test:headed

# Run tests in interactive UI mode
npm run test:ui
```

### Test Coverage
- **90 comprehensive E2E tests** covering all critical paths
- **91.1% pass rate** with 82 tests passing
- Tests include: Navigation, Recording, Dashboard, Player, Editor, and Integration workflows
- Automated accessibility and responsive design testing

For detailed testing information, see [TESTING.md](TESTING.md) and [TEST_REPORT.md](TEST_REPORT.md).

## Usage

### Recording a Video

1. Click "Start Recording" on the home page
2. Adjust quality settings if needed (resolution, frame rate, bitrate)
3. Choose what to record (screen, webcam, audio)
4. Click "Start Recording" and allow browser permissions
5. Use pause/resume controls during recording
6. Click "Stop & Save" when finished

### Editing Videos

#### Trim
1. Open a video from your library
2. Click "Edit" button
3. Select "Trim" tab
4. Set start and end points using sliders or "Set Current" buttons
5. Preview the trimmed section
6. Click "Trim Video" to save

#### Split
1. Open a video and click "Edit"
2. Select "Split" tab
3. Play the video and click "Add Split Point" at desired timestamps
4. Review the resulting segments
5. Click "Split Video" to create separate files

#### Join
1. Open any video and click "Edit"
2. Select "Join" tab
3. Select multiple videos from your library
4. Reorder them using up/down arrows
5. Click "Join Videos" to combine them

## Browser Compatibility

- Chrome 87+
- Firefox 94+
- Edge 87+
- Safari 14.1+ (limited support)

**Note**: Screen recording requires HTTPS or localhost.

## Features in Detail

### Quality Settings

- **Resolution**: Choose from 4K down to 480p
- **Frame Rate**: 60fps for smooth motion, or lower for smaller files
- **Bitrate**: Control file size vs quality trade-off

### Video Storage

Videos are stored locally in your browser using IndexedDB. No data is sent to any server.

### FFmpeg.wasm

Video editing features use FFmpeg.wasm, which runs entirely in your browser. The first time you use an editing feature, FFmpeg will be downloaded (~30MB).

## Limitations

- Video editing requires modern browsers with WebAssembly support
- Large videos may take time to process
- Storage is limited by browser's IndexedDB quota
- FFmpeg.wasm download required for editing features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- FFmpeg.wasm for video processing capabilities
- MediaRecorder API for recording functionality
- React community for excellent tools and libraries
