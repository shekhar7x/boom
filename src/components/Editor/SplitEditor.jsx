import React, { useState, useRef, useEffect } from 'react';
import { formatDuration } from '../../utils/formatUtils';
import Button from '../Common/Button';
import './SplitEditor.css';

const SplitEditor = ({ video, onSplit, processing, progress }) => {
  const videoRef = useRef(null);
  const [splitPoints, setSplitPoints] = useState([]);
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
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleAddSplitPoint = () => {
    if (!splitPoints.includes(currentTime) && currentTime > 0 && currentTime < duration) {
      setSplitPoints([...splitPoints, currentTime].sort((a, b) => a - b));
    }
  };

  const handleRemoveSplitPoint = (point) => {
    setSplitPoints(splitPoints.filter(p => p !== point));
  };

  const handleSplit = () => {
    if (splitPoints.length === 0) {
      alert('Please add at least one split point');
      return;
    }
    onSplit(splitPoints);
  };

  const segments = [0, ...splitPoints, duration];
  const segmentCount = segments.length - 1;

  return (
    <div className="split-editor">
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

      <div className="split-controls">
        <div className="current-time-display">
          <span>Current Time: {formatDuration(currentTime)}</span>
          <Button variant="primary" onClick={handleAddSplitPoint}>
            Add Split Point
          </Button>
        </div>

        <div className="timeline-container">
          <div className="timeline-track">
            <div
              className="timeline-progress"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            {splitPoints.map((point, index) => (
              <div
                key={index}
                className="split-marker"
                style={{ left: `${(point / duration) * 100}%` }}
              />
            ))}
          </div>
        </div>

        {splitPoints.length > 0 && (
          <div className="split-points-list">
            <h4>Split Points ({splitPoints.length})</h4>
            <div className="points-grid">
              {splitPoints.map((point, index) => (
                <div key={index} className="split-point-item">
                  <span>{formatDuration(point)}</span>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveSplitPoint(point)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="segments-preview">
          <h4>Resulting Segments ({segmentCount})</h4>
          <div className="segments-list">
            {Array.from({ length: segmentCount }).map((_, index) => (
              <div key={index} className="segment-item">
                <span className="segment-number">Part {index + 1}</span>
                <span className="segment-duration">
                  {formatDuration(segments[index])} - {formatDuration(segments[index + 1])}
                </span>
                <span className="segment-length">
                  ({formatDuration(segments[index + 1] - segments[index])})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {processing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="spinner"></div>
            <p>Splitting video... {progress}%</p>
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
          onClick={handleSplit}
          disabled={processing || splitPoints.length === 0}
        >
          Split Video into {segmentCount} Parts
        </Button>
      </div>
    </div>
  );
};

export default SplitEditor;
