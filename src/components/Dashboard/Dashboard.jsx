import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import storageService from '../../services/storageService';
import { formatDuration, formatFileSize, formatDate } from '../../utils/formatUtils';
import Button from '../Common/Button';
import './Dashboard.css';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const allVideos = await storageService.getAllVideos();
      setVideos(allVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        await storageService.deleteVideo(id);
        setVideos(videos.filter(v => v.id !== id));
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete video');
      }
    }
  };

  const getVideoThumbnail = (video) => {
    if (video.thumbnail) {
      return video.thumbnail;
    }
    if (video.blob) {
      return URL.createObjectURL(video.blob);
    }
    return null;
  };

  const getVideoDuration = (video) => {
    return video.duration || 0;
  };

  const filteredVideos = videos.filter(video => {
    if (filter === 'all') return true;
    if (filter === 'recent') {
      const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
      return video.timestamp > dayAgo;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>My Videos</h1>
            <p className="dashboard-subtitle">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'} recorded
            </p>
          </div>
          <Link to="/">
            <Button
              variant="primary"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              }
            >
              New Recording
            </Button>
          </Link>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="15" rx="2" />
              <polyline points="17 2 12 7 7 2" />
            </svg>
            <h2>No videos yet</h2>
            <p>Start recording to see your videos here</p>
            <Link to="/">
              <Button variant="primary" size="large">
                Start Recording
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="dashboard-filters">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Videos
              </button>
              <button
                className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
                onClick={() => setFilter('recent')}
              >
                Recent
              </button>
            </div>

            <div className="video-grid">
              {filteredVideos.map((video) => (
                <div key={video.id} className="video-card">
                  <Link to={`/video/${video.id}`} className="video-thumbnail">
                    <video
                      src={getVideoThumbnail(video)}
                      className="thumbnail-video"
                      preload="metadata"
                    />
                    <div className="video-duration">
                      {formatDuration(getVideoDuration(video))}
                    </div>
                  </Link>

                  <div className="video-info">
                    <Link to={`/video/${video.id}`} className="video-title">
                      {video.title}
                    </Link>
                    <div className="video-meta">
                      <span>{formatDate(video.timestamp)}</span>
                      <span>•</span>
                      <span>{formatFileSize(video.size)}</span>
                    </div>
                  </div>

                  <div className="video-actions">
                    <Link to={`/video/${video.id}`}>
                      <Button variant="ghost" size="small">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </Button>
                    </Link>
                    <Link to={`/edit/${video.id}`}>
                      <Button variant="ghost" size="small">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleDelete(video.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
