import React, { useState, useRef, useEffect } from 'react';
import './FloatingRecordingControls.css';

const FloatingRecordingControls = ({
  isRecording,
  isPaused,
  duration,
  onPause,
  onResume,
  onStop,
  onCancel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0.9);
  const controlsRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
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

  const handleMouseDown = (e) => {
    if (e.target.closest('.floating-control-button')) {
      return; // Don't drag when clicking buttons
    }
    
    const rect = controlsRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const toggleExpanded = () => {
    if (!isMinimized) {
      setIsExpanded(!isExpanded);
    }
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setIsExpanded(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) return null;

  return (
    <div
      ref={controlsRef}
      className={`floating-recording-controls ${isExpanded ? 'expanded' : ''} ${isMinimized ? 'minimized' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: isDragging ? 0.7 : opacity,
      }}
      onMouseDown={handleMouseDown}
    >
      {isMinimized ? (
        <div className="floating-minimal" onClick={toggleMinimized}>
          <div className="minimal-dot"></div>
        </div>
      ) : (
        <>
          <div className="floating-header" onClick={toggleExpanded}>
            <div className="floating-status">
              <span className="status-dot"></span>
              <span className="status-text">{isPaused ? 'Paused' : 'REC'}</span>
            </div>
            <div className="floating-duration">{formatTime(duration)}</div>
          </div>

          {isExpanded && (
            <div className="floating-controls-expanded">
              <div className="floating-controls-row">
                {isPaused ? (
                  <button
                    className="floating-control-button resume"
                    onClick={onResume}
                    title="Resume Recording"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                ) : (
                  <button
                    className="floating-control-button pause"
                    onClick={onPause}
                    title="Pause Recording"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  </button>
                )}
                <button
                  className="floating-control-button stop"
                  onClick={onStop}
                  title="Stop & Save"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              </div>

              <div className="floating-controls-footer">
                <button
                  className="floating-minimize-btn"
                  onClick={toggleMinimized}
                  title="Minimize to tiny dot"
                >
                  Minimize
                </button>
                <div className="floating-opacity-control">
                  <label htmlFor="opacity-slider" title="Adjust transparency">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a10 10 0 0 1 0 20" />
                    </svg>
                  </label>
                  <input
                    id="opacity-slider"
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="opacity-slider"
                    title="Adjust transparency"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FloatingRecordingControls;
