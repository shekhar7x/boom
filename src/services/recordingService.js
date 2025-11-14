class RecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.startTime = null;
    this.pausedDuration = 0;
    this.lastPauseTime = null;
  }

  async startRecording(options = {}) {
    const {
      recordScreen = true,
      recordWebcam = false,
      recordAudio = true,
      resolution = '1080p',
      frameRate = 30,
      videoBitsPerSecond = 2500000, // 2.5 Mbps default
    } = options;

    try {
      let streams = [];

      // Get screen stream
      if (recordScreen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: this.getResolution(resolution).width,
            height: this.getResolution(resolution).height,
            frameRate: frameRate,
          },
          audio: recordAudio,
        });
        streams.push(screenStream);
      }

      // Get webcam stream
      if (recordWebcam) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: frameRate,
          },
          audio: recordAudio && !recordScreen, // Only if not already recording audio from screen
        });
        streams.push(webcamStream);
      }

      // Get audio stream if needed and not already included
      if (recordAudio && !recordScreen && !recordWebcam) {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streams.push(audioStream);
      }

      // Combine streams
      this.stream = this.combineStreams(streams);

      // Create MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        videoBitsPerSecond,
      });

      this.recordedChunks = [];
      this.startTime = Date.now();
      this.pausedDuration = 0;
      this.lastPauseTime = null;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms

      return {
        success: true,
        stream: this.stream,
        mimeType,
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.lastPauseTime = Date.now();
      return true;
    }
    return false;
  }

  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      if (this.lastPauseTime) {
        this.pausedDuration += Date.now() - this.lastPauseTime;
        this.lastPauseTime = null;
      }
      this.mediaRecorder.resume();
      return true;
    }
    return false;
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder.mimeType,
        });

        const duration = this.startTime 
          ? (Date.now() - this.startTime - this.pausedDuration) / 1000 
          : 0;

        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        resolve({
          blob,
          duration,
          size: blob.size,
          mimeType: this.mediaRecorder.mimeType,
        });

        // Cleanup
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.stream = null;
        this.startTime = null;
        this.pausedDuration = 0;
        this.lastPauseTime = null;
      };

      this.mediaRecorder.stop();
    });
  }

  getRecordingDuration() {
    if (!this.startTime) return 0;
    const currentPausedDuration = this.lastPauseTime 
      ? this.pausedDuration + (Date.now() - this.lastPauseTime)
      : this.pausedDuration;
    return (Date.now() - this.startTime - currentPausedDuration) / 1000;
  }

  getCurrentSize() {
    return this.recordedChunks.reduce((total, chunk) => total + chunk.size, 0);
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }

  isPaused() {
    return this.mediaRecorder && this.mediaRecorder.state === 'paused';
  }

  combineStreams(streams) {
    const tracks = [];
    streams.forEach(stream => {
      stream.getTracks().forEach(track => tracks.push(track));
    });
    return new MediaStream(tracks);
  }

  getResolution(resolution) {
    const resolutions = {
      '2160p': { width: 3840, height: 2160 },
      '1440p': { width: 2560, height: 1440 },
      '1080p': { width: 1920, height: 1080 },
      '720p': { width: 1280, height: 720 },
      '480p': { width: 854, height: 480 },
      '360p': { width: 640, height: 360 },
    };
    return resolutions[resolution] || resolutions['1080p'];
  }

  getSupportedMimeType() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm'; // Fallback
  }

  static async checkPermissions() {
    try {
      const permissions = {
        screen: false,
        camera: false,
        microphone: false,
      };

      // Check screen capture support
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        permissions.screen = true;
      }

      // Check camera permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        permissions.camera = true;
      } catch (e) {
        permissions.camera = false;
      }

      // Check microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        permissions.microphone = true;
      } catch (e) {
        permissions.microphone = false;
      }

      return permissions;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { screen: false, camera: false, microphone: false };
    }
  }
}

export default new RecordingService();
