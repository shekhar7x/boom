import React, { useState, useRef, useEffect } from 'react';
import { formatDuration } from '../../utils/formatUtils';
import Button from '../Common/Button';
import './TrimEditor.css';

const TrimEditor = ({ video, onTrim, processing, progress }) => {
  const videoRef = useRef(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (video && videoRef.current) {
      videoRef.current.src = URL.createObjectURL(video.blob);
    }
  }, [video]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Auto-pause at end time
      if (time >= endTime) {
        videoRef.current.pause();
        setPlaying(false);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        // Start from start time if at end
        if (currentTime >= endTime) {
          videoRef.current.currentTime = startTime;
        }
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleStartChange = (e) => {
    const value = parseFloat(e.target.value);
    setStartTime(value);
    if (value > endTime) {
      setEndTime(value);
    }
    handleSeek(value);
  };

  const handleEndChange = (e) => {
    const value = parseFloat(e.target.value);
    setEndTime(value);
    if (value < startTime) {
      setStartTime(value);
    }
  };

  const handleSetStart = () => {
    setStartTime(currentTime);
  };

  const handleSetEnd = () => {
    setEndTime(currentTime);
  };

  const handleTrim = () => {
    if (startTime >= endTime) {
      alert('End time must be greater than start time');
      return;
    }
    onTrim(startTime, endTime);
  };

  const trimmedDuration = endTime - startTime;
  const progress_pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const start_pct = duration > 0 ? (startTime / duration) * 100 : 0;
  const end_pct = duration > 0 ? (endTime / duration) * 100 : 100;

  return (
    <div className="trim-editor">
      <div className="video-preview">
        <video
          ref={videoRef}
          className="preview-video"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setPlaying(false)}
        />
        
        <div className="preview-controls">
          <button className="control-btn" onClick={handlePlayPause}>
            {playing ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
          <span className="time-display">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
        </div>
      </div>

      <div className="timeline-section">
        <div className="timeline-container">
          <div className="timeline-track">
            <div
              className="timeline-progress"
              style={{ width: `${progress_pct}%` }}
            />
            <div
              className="timeline-selection"
              style={{
                left: `${start_pct}%`,
                width: `${end_pct - start_pct}%`,
              }}
            />
          </div>
        </div>

        <div className="trim-controls">
          <div className="trim-control-group">
            <label>
              <span>Start Time</span>
              <div className="time-input-group">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={startTime}
                  onChange={handleStartChange}
                  className="time-slider"
                />
                <span className="time-value">{formatDuration(startTime)}</span>
                <Button size="small" variant="secondary" onClick={handleSetStart}>
                  Set Current
                </Button>
              </div>
            </label>
          </div>

          <div className="trim-control-group">
            <label>
              <span>End Time</span>
              <div className="time-input-group">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={endTime}
                  onChange={handleEndChange}
                  className="time-slider"
                />
                <span className="time-value">{formatDuration(endTime)}</span>
                <Button size="small" variant="secondary" onClick={handleSetEnd}>
                  Set Current
                </Button>
              </div>
            </label>
          </div>
        </div>

        <div className="trim-info">
          <div className="info-item">
            <span className="info-label">Original Duration:</span>
            <span className="info-value">{formatDuration(duration)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Trimmed Duration:</span>
            <span className="info-value">{formatDuration(trimmedDuration)}</span>
          </div>
        </div>
      </div>

      {processing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="spinner"></div>
            <p>Processing video... {progress}%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="editor-actions">
        <Button
          variant="primary"
          size="large"
          onClick={handleTrim}
          disabled={processing || trimmedDuration <= 0}
        >
          Trim Video
        </Button>
      </div>
    </div>
  );
};

export default TrimEditor;
