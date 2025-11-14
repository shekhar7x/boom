import React from 'react';
import Button from '../Common/Button';
import './QualitySettings.css';

const QualitySettings = ({ settings, onSettingsChange, onClose }) => {
  const handleChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const resolutions = [
    { value: '2160p', label: '4K (2160p)', bitrate: 8000000 },
    { value: '1440p', label: 'QHD (1440p)', bitrate: 5000000 },
    { value: '1080p', label: 'Full HD (1080p)', bitrate: 2500000 },
    { value: '720p', label: 'HD (720p)', bitrate: 1500000 },
    { value: '480p', label: 'SD (480p)', bitrate: 1000000 },
  ];

  const frameRates = [
    { value: 60, label: '60 FPS' },
    { value: 30, label: '30 FPS' },
    { value: 24, label: '24 FPS' },
    { value: 15, label: '15 FPS' },
  ];

  const bitrates = [
    { value: 8000000, label: 'High (8 Mbps)' },
    { value: 5000000, label: 'Medium-High (5 Mbps)' },
    { value: 2500000, label: 'Medium (2.5 Mbps)' },
    { value: 1500000, label: 'Low-Medium (1.5 Mbps)' },
    { value: 1000000, label: 'Low (1 Mbps)' },
  ];

  return (
    <div className="quality-settings">
      <div className="quality-settings-header">
        <h3>Recording Settings</h3>
        <button className="close-button" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="quality-settings-content">
        <div className="settings-section">
          <h4>Source</h4>
          <div className="settings-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.recordScreen}
                onChange={(e) => handleChange('recordScreen', e.target.checked)}
              />
              <span>Record Screen</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.recordWebcam}
                onChange={(e) => handleChange('recordWebcam', e.target.checked)}
              />
              <span>Record Webcam</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.recordAudio}
                onChange={(e) => handleChange('recordAudio', e.target.checked)}
              />
              <span>Record Audio</span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h4>Video Quality</h4>
          <div className="settings-group">
            <label className="select-label">
              <span>Resolution</span>
              <select
                value={settings.resolution}
                onChange={(e) => {
                  const selected = resolutions.find(r => r.value === e.target.value);
                  handleChange('resolution', e.target.value);
                  if (selected) {
                    handleChange('videoBitsPerSecond', selected.bitrate);
                  }
                }}
              >
                {resolutions.map((res) => (
                  <option key={res.value} value={res.value}>
                    {res.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="select-label">
              <span>Frame Rate</span>
              <select
                value={settings.frameRate}
                onChange={(e) => handleChange('frameRate', parseInt(e.target.value))}
              >
                {frameRates.map((fr) => (
                  <option key={fr.value} value={fr.value}>
                    {fr.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="select-label">
              <span>Bitrate (Quality/Size)</span>
              <select
                value={settings.videoBitsPerSecond}
                onChange={(e) => handleChange('videoBitsPerSecond', parseInt(e.target.value))}
              >
                {bitrates.map((br) => (
                  <option key={br.value} value={br.value}>
                    {br.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="settings-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>
            Higher quality settings will result in larger file sizes. 
            Adjust based on your needs and available storage.
          </p>
        </div>
      </div>

      <div className="quality-settings-footer">
        <Button variant="primary" onClick={onClose}>
          Apply Settings
        </Button>
      </div>
    </div>
  );
};

export default QualitySettings;
