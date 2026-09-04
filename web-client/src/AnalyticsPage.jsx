import React from 'react';
import './AnalyticsPage.css';

function AnalyticsPage({ onNavigate }) {
  const attendanceData = [
    { id: 1, name: 'Hafiza Yusra', role: 'Student', status: 'Present', duration: '45 mins', latency: '24 ms' },
    { id: 2, name: 'Kashish', role: 'Student', status: 'Present', duration: '42 mins', latency: '38 ms' },
    { id: 3, name: 'Abdul Basit', role: 'Student', status: 'Late', duration: '28 mins', latency: '110 ms' },
    { id: 4, name: 'Dr. Instructor', role: 'Instructor', status: 'Present', duration: '45 mins', latency: '18 ms' },
  ];

  return (
    <div className="analytics-container">
      {/* Nav */}
      <nav className="analytics-nav">
        <div className="logo-container">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">SyncLearn Analytics</span>
        </div>
        <button 
          className="back-btn" 
          onClick={() => onNavigate && onNavigate('dashboard')}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="analytics-content">
        <div className="analytics-header-section">
          <h1>Session Overview & Telemetry Dashboard 📊</h1>
          <p>Real-time analytics, WebRTC latency telemetry, and student interaction metrics for Room ID: <code>CS-401-LIVE</code></p>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-title">Avg Student Engagement</span>
            <span className="metric-value">88.4%</span>
            <span className="metric-sub">▲ +5.2% from last session</span>
          </div>

          <div className="metric-card">
            <span className="metric-title">Total Transcription Time</span>
            <span className="metric-value">45m 12s</span>
            <span className="metric-sub">OpenAI Whisper Active</span>
          </div>

          <div className="metric-card">
            <span className="metric-title">WebRTC Network Latency</span>
            <span className="metric-value">28 ms</span>
            <span className="metric-sub">Stable Connection (P2P)</span>
          </div>

          <div className="metric-card">
            <span className="metric-title">Canvas Sync Events</span>
            <span className="metric-value">1,240</span>
            <span className="metric-sub alert">Socket.io Operational</span>
          </div>
        </div>

        {/* Detailed Section */}
        <div className="analytics-tables-grid">
          {/* Attendance & Connection Quality Table */}
          <div className="analytics-card">
            <h2>👥 Attendance & Peer Telemetry</h2>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Active Time</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.role}</td>
                    <td>
                      <span className={`status-badge ${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.duration}</td>
                    <td><code>{p.latency}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Student Engagement Breakdown */}
          <div className="analytics-card">
            <h2>🎯 Participation Index</h2>
            
            <div className="engagement-item">
              <div className="engagement-info">
                <span>Chat Participation</span>
                <strong>92%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div className="engagement-item">
              <div className="engagement-info">
                <span>Whiteboard Canvas Activity</span>
                <strong>84%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: '84%', backgroundColor: '#22c55e' }}></div>
              </div>
            </div>

            <div className="engagement-item">
              <div className="engagement-info">
                <span>3D Model Interaction</span>
                <strong>65%</strong>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: '65%', backgroundColor: '#f59e0b' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;