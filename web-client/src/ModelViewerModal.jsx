import React, { useState } from 'react';
import './ModelViewerModal.css';

function ModelViewerModal({ isOpen, onClose }) {
  const [rotationAngle, setRotationAngle] = useState(0);

  if (!isOpen) return null;

  const handleRotate = () => {
    setRotationAngle((prev) => (prev + 45) % 360);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2>🧊 3D Model Interactive Viewer (Three.js)</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Viewport Render Box */}
        <div className="model-viewport">
          <div 
            className="cube-graphic" 
            style={{ transform: `rotateY(${rotationAngle}deg) rotateX(${rotationAngle / 2}deg)` }}
          >
            📦
          </div>
          <div className="rotation-status">
            Sync Angle: <code>Y: {rotationAngle}°</code>
          </div>
        </div>

        {/* Controls Footer */}
        <div className="modal-controls">
          <div className="control-group">
            <span className="sync-badge">⚡ Live Sync Active</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Instructor rotation coordinates are shared with all students.
            </span>
          </div>
          <div className="control-group">
            <button className="action-sm-btn" onClick={handleRotate}>
              🔄 Rotate Model
            </button>
            <button className="action-sm-btn" onClick={() => setRotationAngle(0)}>
              ⏮️ Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelViewerModal;