import React, { useState } from 'react';
import './ProfilePage.css';

function ProfilePage({ user, onBackToDashboard, onNavigate }) {
  const [profileName, setProfileName] = useState(user?.name || 'Yusra User');
  const [email] = useState(user?.email || 'yusra@university.edu');
  const [role] = useState(user?.role || 'Student');

  // Unified click handler for Back button
  const handleBack = (e) => {
    e.preventDefault();
    if (typeof onBackToDashboard === 'function') {
      onBackToDashboard();
    } else if (typeof onNavigate === 'function') {
      onNavigate('dashboard');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Profile settings updated successfully!');
  };

  return (
    <div className="profile-container">
      {/* Navigation Header */}
      <nav className="profile-nav">
        <div className="logo-container">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">SyncLearn</span>
        </div>
        <button 
          type="button" 
          className="back-btn" 
          onClick={handleBack}
          style={{ cursor: 'pointer' }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="profile-content">
        <h1>Account & Hardware Settings ⚙️</h1>

        {/* User Identity Details Card */}
        <div className="profile-card">
          <h2>👤 Account Details</h2>
          <div className="user-info-grid">
            <div className="avatar-badge">
              {profileName.charAt(0).toUpperCase()}
            </div>
            
            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label>System Role</label>
                <input
                  type="text"
                  value={role.toUpperCase()}
                  disabled
                  className="profile-input"
                />
              </div>
            </form>
          </div>
        </div>

        {/* WebRTC Hardware Check Card */}
        <div className="profile-card">
          <h2>🎙️ Media Device Configurations (WebRTC)</h2>
          <div className="devices-grid">
            {/* Camera Selector */}
            <div className="profile-field">
              <label>Select Camera Device</label>
              <select className="profile-input">
                <option>Integrated HD Web Camera (Default)</option>
                <option>Virtual Camera Driver</option>
              </select>
              <div className="device-preview-box">
                📹 Camera Preview Active
              </div>
            </div>

            {/* Microphone Selector */}
            <div className="profile-field">
              <label>Select Microphone Device</label>
              <select className="profile-input">
                <option>Internal Audio Microphone (Default)</option>
                <option>External Headset Microphone</option>
              </select>
              <div style={{ marginTop: '0.8rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Microphone Test Level:</span>
                <div className="mic-meter-bar">
                  <div className="mic-level-active"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button type="button" className="save-profile-btn" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;