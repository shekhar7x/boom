import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import storageService from '../../services/storageService';
import ffmpegService from '../../services/ffmpegService';
import { formatDuration, generateVideoTitle } from '../../utils/formatUtils';
import Button from '../Common/Button';
import TrimEditor from './TrimEditor';
import SplitEditor from './SplitEditor';
import JoinEditor from './JoinEditor';
import './VideoEditor.css';

const VideoEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trim');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleTrim = async (startTime, endTime) => {
    try {
      setProcessing(true);
      setProgress(0);

      const trimmedBlob = await ffmpegService.trimVideo(
        video.blob,
        startTime,
        endTime,
        (p) => setProgress(p)
      );

      const newVideo = {
        title: `${video.title} (Trimmed)`,
        blob: trimmedBlob,
        duration: endTime - startTime,
        size: trimmedBlob.size,
        mimeType: 'video/mp4',
        settings: video.settings,
      };

      const saved = await storageService.saveVideo(newVideo);
      alert('Video trimmed successfully!');
      navigate(`/video/${saved.id}`);
    } catch (error) {
      console.error('Error trimming video:', error);
      alert('Failed to trim video. Please try again.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleSplit = async (splitPoints) => {
    try {
      setProcessing(true);
      setProgress(0);

      const segments = await ffmpegService.splitVideo(
        video.blob,
        splitPoints,
        (p) => setProgress(p)
      );

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const newVideo = {
          title: `${video.title} (Part ${i + 1})`,
          blob: segment.blob,
          duration: segment.endTime ? segment.endTime - segment.startTime : 0,
          size: segment.blob.size,
          mimeType: 'video/mp4',
          settings: video.settings,
        };
        await storageService.saveVideo(newVideo);
      }

      alert(`Video split into ${segments.length} parts successfully!`);
      navigate('/videos');
    } catch (error) {
      console.error('Error splitting video:', error);
      alert('Failed to split video. Please try again.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleJoin = async (videoIds) => {
    try {
      setProcessing(true);
      setProgress(0);

      const videos = await Promise.all(
        videoIds.map(id => storageService.getVideo(id))
      );

      const blobs = videos.map(v => v.blob);
      const joinedBlob = await ffmpegService.joinVideos(
        blobs,
        (p) => setProgress(p)
      );

      const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);

      const newVideo = {
        title: generateVideoTitle() + ' (Joined)',
        blob: joinedBlob,
        duration: totalDuration,
        size: joinedBlob.size,
        mimeType: 'video/mp4',
        settings: video.settings,
      };

      const saved = await storageService.saveVideo(newVideo);
      alert('Videos joined successfully!');
      navigate(`/video/${saved.id}`);
    } catch (error) {
      console.error('Error joining videos:', error);
      alert('Failed to join videos. Please try again.');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="video-editor">
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

  return (
    <div className="video-editor">
      <div className="video-editor-container">
        <div className="editor-header">
          <h1>Edit Video</h1>
          <Button variant="secondary" onClick={() => navigate(`/video/${id}`)}>
            Cancel
          </Button>
        </div>

        <div className="editor-tabs">
          <button
            className={`tab-btn ${activeTab === 'trim' ? 'active' : ''}`}
            onClick={() => setActiveTab('trim')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M10 11v6M14 11v6" />
            </svg>
            Trim
          </button>
          <button
            className={`tab-btn ${activeTab === 'split' ? 'active' : ''}`}
            onClick={() => setActiveTab('split')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="2" x2="12" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Split
          </button>
          <button
            className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            Join
          </button>
        </div>

        <div className="editor-content">
          {activeTab === 'trim' && (
            <TrimEditor
              video={video}
              onTrim={handleTrim}
              processing={processing}
              progress={progress}
            />
          )}
          {activeTab === 'split' && (
            <SplitEditor
              video={video}
              onSplit={handleSplit}
              processing={processing}
              progress={progress}
            />
          )}
          {activeTab === 'join' && (
            <JoinEditor
              currentVideo={video}
              onJoin={handleJoin}
              processing={processing}
              progress={progress}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
