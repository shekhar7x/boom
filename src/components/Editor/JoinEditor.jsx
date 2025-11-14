import React, { useState, useEffect } from 'react';
import storageService from '../../services/storageService';
import { formatDuration, formatFileSize } from '../../utils/formatUtils';
import Button from '../Common/Button';
import './JoinEditor.css';

const JoinEditor = ({ currentVideo, onJoin, processing, progress }) => {
  const [allVideos, setAllVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([currentVideo.id]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const videos = await storageService.getAllVideos();
      setAllVideos(videos);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVideo = (id) => {
    if (selectedVideos.includes(id)) {
      setSelectedVideos(selectedVideos.filter(v => v !== id));
    } else {
      setSelectedVideos([...selectedVideos, id]);
    }
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newSelected = [...selectedVideos];
      [newSelected[index - 1], newSelected[index]] = [newSelected[index], newSelected[index - 1]];
      setSelectedVideos(newSelected);
    }
  };

  const handleMoveDown = (index) => {
    if (index < selectedVideos.length - 1) {
      const newSelected = [...selectedVideos];
      [newSelected[index], newSelected[index + 1]] = [newSelected[index + 1], newSelected[index]];
      setSelectedVideos(newSelected);
    }
  };

  const handleJoin = () => {
    if (selectedVideos.length < 2) {
      alert('Please select at least 2 videos to join');
      return;
    }
    onJoin(selectedVideos);
  };

  const selectedVideoObjects = selectedVideos
    .map(id => allVideos.find(v => v.id === id))
    .filter(Boolean);

  const totalDuration = selectedVideoObjects.reduce((sum, v) => sum + v.duration, 0);
  const totalSize = selectedVideoObjects.reduce((sum, v) => sum + v.size, 0);

  if (loading) {
    return (
      <div className="join-editor">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="join-editor">
      <div className="join-layout">
        <div className="available-videos">
          <h3>Available Videos</h3>
          <div className="videos-list">
            {allVideos.map((video) => (
              <div
                key={video.id}
                className={`video-item ${selectedVideos.includes(video.id) ? 'selected' : ''}`}
                onClick={() => handleToggleVideo(video.id)}
              >
                <div className="video-thumbnail-small">
                  <video src={URL.createObjectURL(video.blob)} />
                </div>
                <div className="video-info-small">
                  <div className="video-title-small">{video.title}</div>
                  <div className="video-meta-small">
                    {formatDuration(video.duration)} • {formatFileSize(video.size)}
                  </div>
                </div>
                <div className="video-checkbox">
                  {selectedVideos.includes(video.id) && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="selected-videos">
          <h3>Join Order ({selectedVideos.length} videos)</h3>
          
          {selectedVideos.length === 0 ? (
            <div className="empty-selection">
              <p>Select videos from the left to join them</p>
            </div>
          ) : (
            <>
              <div className="order-list">
                {selectedVideoObjects.map((video, index) => (
                  <div key={video.id} className="order-item">
                    <div className="order-number">{index + 1}</div>
                    <div className="order-video-info">
                      <div className="order-title">{video.title}</div>
                      <div className="order-meta">
                        {formatDuration(video.duration)}
                      </div>
                    </div>
                    <div className="order-controls">
                      <button
                        className="order-btn"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </button>
                      <button
                        className="order-btn"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === selectedVideos.length - 1}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="join-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Duration:</span>
                  <span className="summary-value">{formatDuration(totalDuration)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Size:</span>
                  <span className="summary-value">{formatFileSize(totalSize)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {processing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="spinner"></div>
            <p>Joining videos... {progress}%</p>
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
          onClick={handleJoin}
          disabled={processing || selectedVideos.length < 2}
        >
          Join {selectedVideos.length} Videos
        </Button>
      </div>
    </div>
  );
};

export default JoinEditor;
