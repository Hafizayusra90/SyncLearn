import React, { useState, useEffect, useRef } from 'react';
import './DemoPage.css';

const TIMELINE_CHAPTERS = [
  {
    seconds: 15,
    time: '0:15',
    icon: '📡',
    title: 'WebRTC P2P Video & Audio Call',
    desc: 'Ultra-low latency peer-to-peer connection for crystal-clear real-time classroom interaction.',
    badge: 'Real-Time Communication'
  },
  {
    seconds: 45,
    time: '0:45',
    icon: '🎨',
    title: 'Multi-User Collaborative Whiteboard',
    desc: 'Synchronized digital canvas supporting pen, shapes, colors, and multi-cursor drawing.',
    badge: 'Live Collaboration'
  },
  {
    seconds: 80,
    time: '1:20',
    icon: '🧊',
    title: 'Interactive 3D Model Viewer',
    desc: '3D spatial visualization synchronized across teacher and students with drag-to-rotate controls.',
    badge: 'Immersive Learning'
  },
  {
    seconds: 125,
    time: '2:05',
    icon: '🎙️',
    title: 'Live AI Speech-to-Text Transcription',
    desc: 'Automated speech recognition generating real-time lecture captions and searchable notes.',
    badge: 'AI Smart Engine'
  },
  {
    seconds: 165,
    time: '2:45',
    icon: '📍',
    title: 'Timeline Doubt Pinning System',
    desc: 'Students can bookmark questions directly on the lecture timeline for contextual teacher feedback.',
    badge: 'Temporal Annotation'
  },
  {
    seconds: 210,
    time: '3:30',
    icon: '📊',
    title: 'Session Analytics & Engagement Metrics',
    desc: 'Comprehensive post-session learning analytics, attendance tracking, and student participation rates.',
    badge: 'Learning Insights'
  }
];

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function DemoPage({ onNavigate, theme, onToggleTheme }) {
  const [currentSeconds, setCurrentSeconds] = useState(15);
  const [isPlaying, setIsPlaying] = useState(true);

  const TOTAL_DURATION = 240; // 4 minutes duration

  // Auto-play timer for project simulation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSeconds(prev => {
          if (prev >= TOTAL_DURATION) {
            return 0; // loop back
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Determine active chapter based on currentSeconds
  const getActiveChapter = () => {
    if (currentSeconds < 35) return TIMELINE_CHAPTERS[0];
    if (currentSeconds < 70) return TIMELINE_CHAPTERS[1];
    if (currentSeconds < 110) return TIMELINE_CHAPTERS[2];
    if (currentSeconds < 150) return TIMELINE_CHAPTERS[3];
    if (currentSeconds < 190) return TIMELINE_CHAPTERS[4];
    return TIMELINE_CHAPTERS[5];
  };

  const activeChapter = getActiveChapter();

  const handleSeek = (secs) => {
    setCurrentSeconds(secs);
    setIsPlaying(true);
  };

  return (
    <div className="demo-container">
      {/* Navbar */}
      <nav className="demo-nav">
        <div className="logo-container">
          <img src="/logo.png" alt="SyncLearn" className="logo-img" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="logo-text">SyncLearn</span>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button className="back-btn" onClick={() => onNavigate && onNavigate('home')}>
            ← Back to Home
          </button>
          <button
            type="button"
            className="theme-icon-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <main className="demo-content">
        {/* Header */}
        <div className="demo-hero">
          <div className="demo-badge">🎬 Project Video Demo</div>
          <h1>SyncLearn <span className="gradient-text">Live Feature Tour</span></h1>
          <p>
            Watch what happens at each timestamp in the SyncLearn collaborative platform,
            or load your own recorded project demo video.
          </p>

        </div>

        {/* ── Main Video Display Wrapper ── */}
        <div className="demo-video-wrapper">
          <div className="demo-video-card">
            <div className="sim-player-frame">
                {/* Top Video Header Overlay */}
                <div className="sim-header-bar">
                  <div className="sim-title-group">
                    <span className="sim-live-tag">● SYNCLEARN LIVE DEMO</span>
                    <span className="sim-chapter-title">{activeChapter.icon} {activeChapter.title}</span>
                  </div>
                  <span className="sim-badge">{activeChapter.badge}</span>
                </div>

                {/* Simulated Screen Area */}
                <div className="sim-stage-canvas">
                  {/* SCENE 1: WebRTC Video Call */}
                  {activeChapter.seconds === 15 && (
                    <div className="sim-scene webrtc-scene">
                      <div className="sim-cam-grid">
                        <div className="sim-cam-card host">
                          <div className="sim-avatar">👨‍🏫</div>
                          <div className="sim-cam-info">
                            <strong>Prof. Sarah (Teacher)</strong>
                            <span className="sim-latency-tag">⚡ 12ms (P2P Mesh)</span>
                          </div>
                          <div className="sim-audio-wave">
                            <span /><span /><span /><span /><span />
                          </div>
                        </div>
                        <div className="sim-cam-card peer">
                          <div className="sim-avatar">👩‍🎓</div>
                          <div className="sim-cam-info">
                            <strong>Yusra (Student #1)</strong>
                            <span className="sim-status-tag">🟢 Connected</span>
                          </div>
                        </div>
                      </div>
                      <div className="sim-call-controls">
                        <span className="sim-pill">🎙️ Mic Active</span>
                        <span className="sim-pill">📹 HD Camera</span>
                        <span className="sim-pill highlight">🖥️ Screen Sharing Enabled</span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 2: Collaborative Whiteboard */}
                  {activeChapter.seconds === 45 && (
                    <div className="sim-scene whiteboard-scene">
                      <div className="sim-wb-toolbar">
                        <span className="sim-tool active">✏️ Pen</span>
                        <span className="sim-tool">📏 Line</span>
                        <span className="sim-tool">⬜ Rect</span>
                        <span className="sim-color-dot" style={{ background: '#6366f1' }} />
                        <span className="sim-color-dot" style={{ background: '#38bdf8' }} />
                        <span className="sim-color-dot" style={{ background: '#4ade80' }} />
                        <span className="sim-tool danger">🗑️ Clear</span>
                      </div>
                      <div className="sim-wb-board">
                        <svg className="sim-drawing-svg" viewBox="0 0 500 250">
                          {/* Flowchart Diagram */}
                          <rect x="30" y="30" width="120" height="50" rx="8" fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="2" />
                          <text x="90" y="60" fill="#fff" fontSize="13" textAnchor="middle">Input Stream</text>

                          <path d="M 150 55 L 210 55" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrow)" />

                          <rect x="210" y="30" width="130" height="50" rx="8" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="2" />
                          <text x="275" y="60" fill="#fff" fontSize="13" textAnchor="middle">WebRTC Signaling</text>

                          <path d="M 340 55 L 390 55" stroke="#4ade80" strokeWidth="2" />

                          <circle cx="430" cy="55" r="28" fill="rgba(74,222,128,0.2)" stroke="#4ade80" strokeWidth="2" />
                          <text x="430" y="60" fill="#fff" fontSize="12" textAnchor="middle">Sync</text>

                          {/* Math Formula */}
                          <text x="50" y="160" fill="#f59e0b" fontSize="22" fontFamily="monospace" fontWeight="bold">
                            ∇ · E = ρ / ε₀  (Gauss's Law)
                          </text>
                          <text x="50" y="205" fill="#a78bfa" fontSize="16" fontFamily="monospace">
                            Collaborative Sync: 3 peers drawing simultaneously
                          </text>
                        </svg>
                        <div className="sim-user-cursor" style={{ top: '85px', left: '260px' }}>
                          <span className="sim-cursor-dot" />
                          <span className="sim-cursor-name">Yusra (Drawing...)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 3: 3D Model Viewer */}
                  {activeChapter.seconds === 80 && (
                    <div className="sim-scene model-scene">
                      <div className="sim-3d-box-wrapper">
                        <div className="sim-3d-cube-container">
                          <div className="sim-3d-cube">
                            <div className="cube-face front">SyncLearn</div>
                            <div className="cube-face back">3D View</div>
                            <div className="cube-face right">Mesh</div>
                            <div className="cube-face left">Model</div>
                            <div className="cube-face top">WebGL</div>
                            <div className="cube-face bottom">Spatial</div>
                          </div>
                        </div>
                        <div className="sim-3d-stats">
                          <div className="stat-line"><span>Model:</span> <strong>Scientific Anatomical Cube</strong></div>
                          <div className="stat-line"><span>Rotation:</span> <strong>Yaw: 42° | Pitch: 18°</strong></div>
                          <div className="stat-line"><span>Peers Synced:</span> <strong style={{ color: '#4ade80' }}>4/4 Users (Active)</strong></div>
                          <div className="stat-line"><span>Interaction:</span> <em>Drag mouse to rotate in 3D</em></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 4: AI Speech Transcription */}
                  {activeChapter.seconds === 125 && (
                    <div className="sim-scene ai-scene">
                      <div className="sim-ai-header">
                        <span>🎙️ Web Speech API & Neural Model</span>
                        <span className="sim-rec-pulse">● LIVE RECORDING</span>
                      </div>
                      <div className="sim-transcript-feed">
                        <div className="trans-bubble">
                          <span className="speaker">Teacher (02:01):</span>
                          <p>"In this architecture, WebRTC handles audio/video while WebSockets broadcast the data packets..."</p>
                        </div>
                        <div className="trans-bubble active">
                          <span className="speaker">Teacher (02:04):</span>
                          <p>"...which guarantees that every student sees the whiteboard updates under 20 milliseconds."</p>
                        </div>
                      </div>
                      <div className="sim-ai-summary-card">
                        <strong>✨ AI Auto-Generated Key Note:</strong>
                        <p>WebRTC is utilized for peer media tracks; Socket.io handles event state synchronization.</p>
                      </div>
                    </div>
                  )}

                  {/* SCENE 5: Timeline Doubt Pinning */}
                  {activeChapter.seconds === 165 && (
                    <div className="sim-scene doubt-scene">
                      <div className="sim-mock-video">
                        <div className="sim-mock-badge">Lecture: Data Structures & Algorithms</div>
                        <div className="sim-timeline-scrubber">
                          <div className="scrub-bar" style={{ width: '68%' }} />
                          <div className="doubt-pin-marker" style={{ left: '68%' }}>
                            📍
                            <div className="doubt-tooltip">
                              <strong>Doubt #3 (Pinned by Student at 02:45):</strong>
                              <p>"How does the peer reconnection recover from packet loss?"</p>
                              <span className="reply-count">1 Teacher Answer Attached</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="sim-doubt-footer">
                        <button className="pin-doubt-btn">📍 Pin Doubt Here at 02:45</button>
                        <span className="sync-note">Synchronized playback across 12 session participants</span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 6: Analytics & Insights */}
                  {activeChapter.seconds === 210 && (
                    <div className="sim-scene analytics-scene">
                      <div className="sim-analytics-grid">
                        <div className="sim-stat-box">
                          <span className="stat-num">96%</span>
                          <span className="stat-label">Comprehension Score</span>
                        </div>
                        <div className="sim-stat-box">
                          <span className="stat-num">24</span>
                          <span className="stat-label">Whiteboard Actions</span>
                        </div>
                        <div className="sim-stat-box">
                          <span className="stat-num">6</span>
                          <span className="stat-label">Doubt Pins Solved</span>
                        </div>
                        <div className="sim-stat-box">
                          <span className="stat-num">100%</span>
                          <span className="stat-label">Attendance Verified</span>
                        </div>
                      </div>
                      <div className="sim-progress-bar-wrap">
                        <div className="prog-label">
                          <span>Student Engagement Over Session</span>
                          <span>94% High</span>
                        </div>
                        <div className="prog-track">
                          <div className="prog-fill" style={{ width: '94%' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Video Player Controls */}
                <div className="sim-video-controls">
                  <button className="sim-ctrl-btn" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>

                  <div className="sim-time-text">
                    {formatTime(currentSeconds)} / {formatTime(TOTAL_DURATION)}
                  </div>

                  {/* Scrubber slider */}
                  <input
                    type="range"
                    min="0"
                    max={TOTAL_DURATION}
                    value={currentSeconds}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="sim-scrubber-slider"
                  />

                  {/* Chapter Quick Jump Buttons */}
                  <div className="sim-quick-chapters">
                    {TIMELINE_CHAPTERS.map(ch => (
                      <button
                        key={ch.seconds}
                        className={`sim-chapter-pill ${activeChapter.seconds === ch.seconds ? 'active' : ''}`}
                        onClick={() => handleSeek(ch.seconds)}
                        title={ch.title}
                      >
                        {ch.time} {ch.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          {/* Current Playing Badge */}
          <div className="demo-now-playing-badge">
            <strong>Now Playing:</strong>{' '}
            <span style={{ color: '#f8fafc' }}>
              {activeChapter.time} — {activeChapter.title} ({activeChapter.badge})
            </span>
          </div>
        </div>

        {/* ── Highlights / Chapter List (Clickable!) ── */}
        <div className="demo-highlights">
          <h2>📌 What you'll see in this project demo (Click any chapter to jump!)</h2>
          <div className="highlights-grid">
            {TIMELINE_CHAPTERS.map((ch, i) => {
              const isCurrent = activeChapter.seconds === ch.seconds;
              return (
                <div
                  className={`highlight-card ${isCurrent ? 'active-highlight' : ''}`}
                  key={i}
                  onClick={() => handleSeek(ch.seconds)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="highlight-icon">{ch.icon}</div>
                  <div>
                    <span className="highlight-time">{ch.time}</span>
                    <strong style={{ display: 'block', color: '#fff', fontSize: '0.92rem', marginBottom: '3px' }}>
                      {ch.title}
                    </strong>
                    <p>{ch.desc}</p>
                  </div>
                  {isCurrent && <span className="now-showing-badge">Now Showing</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="demo-cta">
          <h2>Ready to test SyncLearn live?</h2>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="large-primary-btn" onClick={() => onNavigate && onNavigate('auth')}>
              Launch Workspace 🚀
            </button>
            <button className="secondary-btn" onClick={() => onNavigate && onNavigate('features')}>
              View All Features
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DemoPage;