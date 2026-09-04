import React from 'react';
import './AboutPage.css';

function AboutPage({ onNavigate }) {
  return (
    <div className="about-page-container">
      <header className="about-header">
        <h1>About SyncLearn</h1>
        <p>Bridging the gap between passive online lectures and active collaborative learning.</p>
      </header>

      <section className="about-section">
        <h2>🚀 Our Vision</h2>
        <p>
          SyncLearn is designed to transform traditional digital classrooms into interactive, active learning hubs. 
          By combining low-latency video communication, real-time multi-user whiteboarding, 3D visualization, and automated AI lecture summary tools, 
          SyncLearn empowers students and instructors to collaborate seamlessly within a single workspace.
        </p>
      </section>

      <section className="about-section grid-section">
        <div className="about-card">
          <h3>⚠️ The Problem</h3>
          <p>
            Current remote learning tools force educators to jump between disconnected apps—one for video, 
            another for whiteboarding, and separate tools for note-taking—leading to distraction and passive student engagement.
          </p>
        </div>

        <div className="about-card highlight-card">
          <h3>💡 The Solution</h3>
          <p>
            SyncLearn consolidates the entire active learning workflow into a unified, dark-mode-optimized workspace 
            where students can visualize concepts in 3D, annotate on a shared canvas live, and review AI-generated notes instantly.
          </p>
        </div>
      </section>

      <section className="about-section">
        <h2>🛠️ Architectural Tech Stack</h2>
        <div className="tech-tags">
          <span className="tech-badge">React.js</span>
          <span className="tech-badge">Node.js / Express</span>
          <span className="tech-badge">Socket.io</span>
          <span className="tech-badge">WebRTC</span>
          <span className="tech-badge">OpenAI Whisper</span>
          <span className="tech-badge">Three.js / Model-Viewer</span>
        </div>
      </section>

      <div className="about-cta">
        <button className="cta-btn" onClick={() => onNavigate('dashboard')}>
          Explore Active Room Workspace 🚀
        </button>
      </div>
    </div>
  );
}

export default AboutPage;