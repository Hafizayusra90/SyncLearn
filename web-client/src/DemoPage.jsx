import React from 'react';
import './DemoPage.css';

function DemoPage({ onNavigate }) {
  return (
    <div className="demo-page-container">
      {/* Top Header Navigation */}
      <header className="demo-nav">
        <button className="back-btn" onClick={() => onNavigate('home')}>
          ← Back to Home
        </button>
        <div className="demo-logo">🚀 SyncLearn Demo</div>
      </header>

      {/* Main Content Area */}
      <main className="demo-content">
        <div className="demo-header-text">
          <h1>Experience Active Collaboration 🎬</h1>
          <p>
            Watch how SyncLearn integrates real-time video, interactive whiteboard, 
            3D visualization, and automated AI transcripts into a single workspace.
          </p>
        </div>

        {/* Video Player Box */}
        <div className="video-wrapper">
          <div className="video-card">
            {/* Sample Educational Demo Video */}
            <iframe
              className="demo-video-iframe"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0" 
              title="SyncLearn Platform Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Key Moments / Timestamps */}
        <div className="timestamps-section">
          <h3>📌 What you'll see in this demo:</h3>
          <ul className="timestamp-list">
            <li><span>0:15</span> Ultra-low latency WebRTC video & audio connection</li>
            <li><span>0:45</span> Real-time multi-user interactive canvas drawing</li>
            <li><span>1:20</span> Manipulating 3D models live with participants</li>
            <li><span>2:05</span> Speech-to-text AI live lecture transcript generation</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="demo-cta-box">
          <h2>Ready to try it yourself?</h2>
          <button className="demo-cta-btn" onClick={() => onNavigate('auth')}>
            Launch Workspace Now 🚀
          </button>
        </div>
      </main>
    </div>
  );
}

export default DemoPage;