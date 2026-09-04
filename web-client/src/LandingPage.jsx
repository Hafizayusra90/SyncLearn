import React from 'react';
import './LandingPage.css';
import logoImg from './assets/logo.png.jpeg';

function LandingPage({ onNavigate, onEnterWorkspace }) {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
<div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
  <img 
    src={logoImg} 
    alt="SyncLearn Logo" 
    style={{ 
width: '38px', 
    height: '38px', 
    borderRadius: '50%', 
    objectFit: 'cover',
    border: '2px solid #6366f1'    }} 
  />
  <span className="logo-text">SyncLearn</span>
</div>
        <div className="nav-links">
          <a 
            href="#features" 
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('features');
            }}
          >
            Features
          </a>
          <a 
            href="#about" 
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) onNavigate('about');
            }}
          >
            Our Vision
          </a>

          {/* Header Button */}
          <button className="primary-btn" onClick={onEnterWorkspace}>
            Enter Workspace 
          </button>
        </div>
      </nav>
      <header className="hero-section">
        <h1 className="hero-title">
          AI-Powered Real-Time Collaborative <span className="gradient-text"> Video Annotation Using WebRTC </span>
        </h1>
        <p className="hero-subtitle">
          Connect seamlessly with peers and instructors. Experience real-time video calls, multi-user whiteboard collaboration, and automated speech-to-text summaries in one place.
        </p>
        
        <div className="hero-cta">
          {/* Main Hero Get Started Button */}
          <button className="large-primary-btn" onClick={onEnterWorkspace}>
            Get Started <span>→</span>
          </button>
          
          <button className="secondary-btn" onClick={() => onNavigate && onNavigate('demo')}>
            Watch Demo
          </button>
        </div>
      </header>
    </div>
  );
}

export default LandingPage;