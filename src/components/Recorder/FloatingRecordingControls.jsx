import React, { useState, useRef, useEffect } from 'react';
import Button from '../Common/Button';
import './FloatingRecordingControls.css';

const FloatingRecordingControls = ({
  isRecording,
  isPaused,
  duration,
  fileSize,
  onPause,
  onResume,
  onStop,
  onCancel
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const controlsRef = useRef(null);

  // Format duration as HH:MM:SS or MM:SS
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.floating-controls-button')) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep within viewport bounds
        const maxX = window.innerWidth - (controlsRef.current?.offsetWidth || 250);
        const maxY = window.innerHeight - (controlsRef.current?.offsetHeight || 100);

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isRecording) return null;

  return (
    <div
      ref={controlsRef}
      className={`floating-recording-controls ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Minimized View - Small recording indicator */}
      {isMinimized ? (
        <div className="floating-minimized-view" onClick={() => setIsMinimized(false)}>
          <div className="recording-indicator-mini">
            <div className="recording-dot-mini pulsing"></div>
            <span className="recording-time-mini">{formatDuration(duration)}</span>
          </div>
        </div>
      ) : (
        /* Expanded View - Full controls */
        <div className="floating-expanded-view">
          <div className="floating-header">
            <div className="recording-status">
              <div className="recording-dot pulsing"></div>
              <span>Recording</span>
            </div>
            <button
              className="minimize-button floating-controls-button"
              onClick={() => setIsMinimized(true)}
              title="Minimize"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="floating-info">
            <div className="info-item">
              <span className="info-label">Duration:</span>
              <span className="info-value">{formatDuration(duration)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Size:</span>
              <span className="info-value">{formatFileSize(fileSize)}</span>
            </div>
          </div>

          <div className="floating-actions">
            {isPaused ? (
              <Button
                variant="success"
                onClick={onResume}
                size="small"
                className="floating-controls-button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 3l9 5-9 5V3z"/>
                </svg>
                Resume
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={onPause}
                size="small"
                className="floating-controls-button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="4" y="3" width="3" height="10"/>
                  <rect x="9" y="3" width="3" height="10"/>
                </svg>
                Pause
              </Button>
            )}

            <Button
              variant="danger"
              onClick={onStop}
              size="small"
              className="floating-controls-button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="4" y="4" width="8" height="8"/>
              </svg>
              Stop
            </Button>

            <Button
              variant="ghost"
              onClick={onCancel}
              size="small"
              className="floating-controls-button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingRecordingControls;
