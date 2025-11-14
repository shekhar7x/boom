import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import storageService from '../../services/storageService';
import { formatDuration, formatFileSize, downloadBlob } from '../../utils/formatUtils';
import Button from '../Common/Button';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      const videoData = await storageService.getVideo(parseInt(id));
      if (videoData) {
        setVideo(videoData);
      } else {
        alert('Video not found');
        navigate('/videos');
      }
    } catch (error) {
      console.error('Error loading video:', error);
      alert('Failed to load video');
      navigate('/videos');
    } finally {
      setLoading(false);
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleDownload = () => {
    if (video) {
      downloadBlob(video.blob, `${video.title}.webm`);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        await storageService.deleteVideo(parseInt(id));
        navigate('/videos');
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video');
      }
    }
  };

  if (loading) {
    return (
      <div className="video-player">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  const videoUrl = URL.createObjectURL(video.blob);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="video-player">
      <div className="video-player-container">
        <div className="video-wrapper">
          <video
            ref={videoRef}
            src={videoUrl}
            className="video-element"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setPlaying(false)}
          />

          <div className="video-controls">
            <div className="progress-bar" onClick={handleSeek}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="controls-row">
              <div className="controls-left">
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

                <div className="time-display">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </div>
              </div>

              <div className="controls-right">
                <div className="volume-control">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="video-details">
          <div className="video-header">
            <h1>{video.title}</h1>
            <div className="video-actions-bar">
              <Link to={`/edit/${id}`}>
                <Button variant="secondary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleDownload}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </Button>
            </div>
          </div>

          <div className="video-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Duration:</span>
              <span className="metadata-value">{formatDuration(video.duration)}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Size:</span>
              <span className="metadata-value">{formatFileSize(video.size)}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Resolution:</span>
              <span className="metadata-value">{video.settings?.resolution || 'Unknown'}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Frame Rate:</span>
              <span className="metadata-value">{video.settings?.frameRate || 30} FPS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
