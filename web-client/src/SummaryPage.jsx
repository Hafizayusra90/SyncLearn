import React from 'react';
import './SummaryPage.css';

function SummaryPage({ roomId, onBackToDashboard }) {
  return (
    <div className="summary-container">
      {/* Top Header */}
      <nav className="summary-nav">
        <div className="logo-container">
          <img src="/logo.png" alt="SyncLearn" className="logo-img" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="logo-text">SyncLearn</span>
        </div>
        <button className="back-btn" onClick={onBackToDashboard}>
          ← Back to Dashboard
        </button>
      </nav>

      {/* Main Content */}
      <div className="summary-content">
        <div className="summary-header">
          <div>
            <span className="summary-title-badge">🎙️ AI Generated Summary</span>
            <h1>Session Recap & Transcripts</h1>
            <p>Room ID: <code>{roomId || 'sync-8821'}</code> • Duration: 45 Mins</p>
          </div>
          <button className="download-btn" onClick={() => alert("Downloading PDF...")}>
            📄 Download PDF Notes
          </button>
        </div>

        <div className="summary-grid">
          {/* AI Key Takeaways Card */}
          <div className="summary-card">
            <h3>✨ Key Learning Takeaways</h3>
            <ul className="bullets-list">
              <li>WebRTC handles low latency peer-to-peer media streaming using SDP offers and answers.</li>
              <li>HTML5 Canvas allows real-time interactive drawing across connected student screens.</li>
              <li>Socket.io syncs real-time events like mouse coordinates and live chat payloads.</li>
              <li>OpenAI Whisper automatically converts audio buffers into timestamped text transcripts.</li>
            </ul>
          </div>

          {/* Complete Audio Transcripts Card */}
          <div className="summary-card">
            <h3>📜 Full Speech Transcript</h3>
            <div className="transcript-box">
              <div className="transcript-line">
                <span className="timestamp">00:15</span>
                <span className="speaker-text"><b>Instructor:</b> Welcome everyone! Today we are testing SyncLearn real-time capabilities.</span>
              </div>

              <div className="transcript-line">
                <span className="timestamp">02:40</span>
                <span className="speaker-text"><b>Student 1:</b> Sir, is the whiteboard canvas synchronized for all connected clients?</span>
              </div>

              <div className="transcript-line">
                <span className="timestamp">03:10</span>
                <span className="speaker-text"><b>Instructor:</b> Yes, every drawing stroke is instantly emitted through Socket.io web sockets.</span>
              </div>

              <div className="transcript-line">
                <span className="timestamp">12:05</span>
                <span className="speaker-text"><b>Instructor:</b> Alright, let us summarize our architecture model for the degree project presentation.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SummaryPage;