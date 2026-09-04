import React, { useState } from 'react';
import './DashboardPage.css';

function DashboardPage({ 
  user, 
  onNavigate, 
  onBackToHome, 
  onJoinRoom, 
  onOpenProfile, 
  onOpenAnalytics, 
  onLogout 
}) {
  const [inputRoomId, setInputRoomId] = useState('');

  const handleCreateRoom = () => {
    const randomId = 'sync-' + Math.floor(1000 + Math.random() * 9000);
    if (onJoinRoom) onJoinRoom(randomId);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (inputRoomId.trim() && onJoinRoom) {
      onJoinRoom(inputRoomId.trim());
    }
  };

  // Safe navigation handlers
  const handleAnalytics = () => {
    if (onOpenAnalytics) onOpenAnalytics();
    else if (onNavigate) onNavigate('analytics');
  };

  const handleProfile = () => {
    if (onOpenProfile) onOpenProfile();
    else if (onNavigate) onNavigate('profile');
  };

  const handleHome = () => {
    if (onLogout) onLogout();
    else if (onBackToHome) onBackToHome();
    else if (onNavigate) onNavigate('home');
  };

  return (
    <div className="dashboard-container">
      {/* Top Header Navigation */}
      <nav className="dashboard-nav">
        <div className="logo-container">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">SyncLearn</span>
        </div>

        {/* Action Buttons in Header */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button 
            type="button" 
            className="back-btn" 
            onClick={handleAnalytics} 
            style={{ backgroundColor: '#334155', color: '#ffffff' }}
          >
            📊 Analytics
          </button>
          
          <button 
            type="button" 
            className="back-btn" 
            onClick={handleProfile} 
            style={{ backgroundColor: '#6366f1', color: '#ffffff' }}
          >
            👤 Profile & Settings
          </button>

          <button 
            type="button" 
            className="back-btn" 
            onClick={handleHome}
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Learning Workspace 📊</h1>
          <p>Welcome, <b>{user?.name || 'User'}</b>! Create an interactive room or join an ongoing class session.</p>
        </div>

        {/* Action Cards */}
        <div className="action-grid">
          {/* Instructor Mode: Create Room */}
          <div className="action-card">
            <span className="card-badge badge-purple">Instructor Mode</span>
            <h2>Create New Room</h2>
            <p>Start an instant live session with video call, canvas drawing, and AI notes.</p>
            <button type="button" className="dash-btn dash-primary-btn" onClick={handleCreateRoom}>
              + Launch Instant Room
            </button>
          </div>

          {/* Student Mode: Join Room */}
          <div className="action-card">
            <span className="card-badge badge-green">Student Mode</span>
            <h2>Join Existing Room</h2>
            <p>Enter the unique Room Code provided by your instructor to connect.</p>
            
            <form onSubmit={handleJoinSubmit} className="join-form">
              <input
                type="text"
                placeholder="Enter Room Code (e.g. sync-101)"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                className="dash-input"
              />
              <button type="submit" className="dash-btn dash-primary-btn" style={{ width: 'auto' }}>
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Recent Session History */}
        <div className="history-section">
          <h3>Recent Sessions</h3>
          <div className="history-list">
            <div className="history-item">
              <div className="history-info">
                <h4>Computer Networks - Lecture 04</h4>
                <p>Room ID: <code>sync-8821</code> • Last Active: Yesterday</p>
              </div>
              <button type="button" className="rejoin-btn" onClick={() => onJoinRoom && onJoinRoom('sync-8821')}>
                Rejoin
              </button>
            </div>

            <div className="history-item">
              <div className="history-info">
                <h4>Web Engineering - Lab Discussion</h4>
                <p>Room ID: <code>sync-1090</code> • Last Active: 3 days ago</p>
              </div>
              <button type="button" className="rejoin-btn" onClick={() => onJoinRoom && onJoinRoom('sync-1090')}>
                Rejoin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;