import React from 'react';
import './FeaturesPage.css';

function FeaturesPage({ onNavigate }) {
  const featuresList = [
    {
      icon: '🎥',
      title: 'Real-Time Video Collaboration',
      description: 'Low-latency peer-to-peer WebRTC video and audio streaming for seamless live classroom sessions.'
    },
    {
      icon: '🎨',
      title: 'Interactive Multi-User Whiteboard',
      description: 'Synchronized digital canvas powered by Socket.io allowing participants to draw, annotate, and brainstorm in real-time.'
    },
    {
      icon: '🎙️',
      title: 'AI Speech Transcripts & Notes',
      description: 'Automated live transcription using OpenAI Whisper to convert class discussions into smart, downloadable lecture notes.'
    },
    {
      icon: '🧊',
      title: '3D Interactive Model Viewer',
      description: 'Embedded 3D model viewer enabling students and instructors to inspect complex structural models directly inside the room.'
    },
    {
      icon: '💬',
      title: 'Contextual Live Chat',
      description: 'Integrated workspace messaging sidebar for instant Q&A, link sharing, and dynamic active learning participation.'
    },
    {
      icon: '🛡️',
      title: 'Secure Room Authorization',
      description: 'Encrypted room access codes ensuring private, protected interactive learning environments.'
    }
  ];

  return (
    <div className="features-page-container">
      <header className="features-header">
        <h1>SyncLearn Core Features</h1>
        <p>Explore the powerful active learning and real-time collaboration tools built into SyncLearn.</p>
      </header>

      <div className="features-grid">
        {featuresList.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>

<div className="cta-box">
          <h3>Ready to start learning?</h3>
          <button 
            className="large-primary-btn" 
            onClick={() => onNavigate('auth')}
          >
            Sign In Now →
          </button>
        </div>
            </div>
  );
}

export default FeaturesPage;