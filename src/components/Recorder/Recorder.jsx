import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recordingService from '../../services/recordingService';
import storageService from '../../services/storageService';
import { formatDuration, formatFileSize, generateVideoTitle } from '../../utils/formatUtils';
import Button from '../Common/Button';
import QualitySettings from './QualitySettings';
import FloatingRecordingControls from './FloatingRecordingControls';
import './Recorder.css';

const Recorder = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stream, setStream] = useState(null);
  const [duration, setDuration] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    recordScreen: true,
    recordWebcam: false,
    recordAudio: true,
    resolution: '1080p',
    frameRate: 30,
    videoBitsPerSecond: 2500000,
  });

  useEffect(() => {
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setDuration(recordingService.getRecordingDuration());
        setFileSize(recordingService.getCurrentSize());
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCountdown = async () => {
    setCountdown(3);
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCountdown(0);
  };

  const handleStartRecording = async () => {
    try {
      await startCountdown();
      
      const result = await recordingService.startRecording(settings);
      setStream(result.stream);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setFileSize(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check permissions and try again.');
    }
  };

  const handlePauseRecording = () => {
    if (recordingService.pauseRecording()) {
      setIsPaused(true);
    }
  };

  const handleResumeRecording = () => {
    if (recordingService.resumeRecording()) {
      setIsPaused(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await recordingService.stopRecording();
      
      const videoData = {
        title: generateVideoTitle(),
        blob: result.blob,
        duration: result.duration,
        size: result.size,
        mimeType: result.mimeType,
        settings: settings,
      };

      const savedVideo = await storageService.saveVideo(videoData);
      
      setStream(null);
      setIsRecording(false);
      setIsPaused(false);
      setDuration(0);
      setFileSize(0);

      navigate(`/video/${savedVideo.id}`);
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('Failed to save recording. Please try again.');
    }
  };

  const handleCancelRecording = async () => {
    if (confirm('Are you sure you want to cancel this recording?')) {
      try {
        await recordingService.stopRecording();
        setStream(null);
        setIsRecording(false);
        setIsPaused(false);
        setDuration(0);
        setFileSize(0);
      } catch (error) {
        console.error('Error canceling recording:', error);
      }
    }
  };

  return (
    <div className="recorder">
      <div className="recorder-container">
        {countdown > 0 && (
          <div className="recorder-countdown">
            <div className="countdown-number">{countdown}</div>
          </div>
        )}

        <div className="recorder-preview">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="recorder-video"
            />
          ) : (
            <div className="recorder-placeholder">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              <h2>Ready to Record</h2>
              <p>Click start to begin recording your screen</p>
            </div>
          )}

          {isRecording && (
            <div className="recorder-overlay">
              <div className="recorder-status">
                <div className="recording-indicator">
                  <span className="recording-dot"></span>
                  {isPaused ? 'Paused' : 'Recording'}
                </div>
                <div className="recording-info">
                  <span className="recording-duration">{formatDuration(duration)}</span>
                  <span className="recording-separator">•</span>
                  <span className="recording-size">{formatFileSize(fileSize)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="recorder-controls">
          {!isRecording ? (
            <>
              <Button
                variant="primary"
                size="large"
                onClick={handleStartRecording}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                }
              >
                Start Recording
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={() => setShowSettings(!showSettings)}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m-5.2-13.8l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M3.8 6.2l4.2 4.2m4.2 4.2l4.2 4.2" />
                  </svg>
                }
              >
                Settings
              </Button>
            </>
          ) : (
            <>
              {isPaused ? (
                <Button
                  variant="success"
                  size="large"
                  onClick={handleResumeRecording}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  }
                >
                  Resume
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="large"
                  onClick={handlePauseRecording}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  }
                >
                  Pause
                </Button>
              )}
              <Button
                variant="danger"
                size="large"
                onClick={handleStopRecording}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                }
              >
                Stop & Save
              </Button>
              <Button
                variant="ghost"
                size="large"
                onClick={handleCancelRecording}
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        {showSettings && !isRecording && (
          <QualitySettings
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>

      {/* Floating Recording Controls */}
      <FloatingRecordingControls
        isRecording={isRecording}
        isPaused={isPaused}
        duration={duration}
        fileSize={fileSize}
        onPause={handlePauseRecording}
        onResume={handleResumeRecording}
        onStop={handleStopRecording}
        onCancel={handleCancelRecording}
      />
    </div>
  );
};

export default Recorder;
