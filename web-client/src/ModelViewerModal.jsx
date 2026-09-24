import React, { useState, useEffect } from 'react';
import './ModelViewerModal.css';
import { socket } from './socket';

function ModelViewerModal({ isOpen, onClose, roomId }) {
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Listen for remote rotation updates
  useEffect(() => {
    if (!isOpen) return;
    const handler = (data) => {
      setRotationX(data.rotX);
      setRotationY(data.rotY);
      setZoom(data.zoom ?? 1);
    };
    socket.on('model-rotate', handler);
    return () => socket.off('model-rotate', handler);
  }, [isOpen]);

  const broadcastRotation = (rX, rY, z = zoom) => {
    socket.emit('model-rotate', { roomId, rotX: rX, rotY: rY, zoom: z });
  };

  const handleRotateStep = (dX, dY) => {
    const newX = rotationX + dX;
    const newY = rotationY + dY;
    setRotationX(newX);
    setRotationY(newY);
    broadcastRotation(newX, newY);
  };

  const handleReset = () => {
    setRotationX(0); setRotationY(0); setZoom(1);
    broadcastRotation(0, 0, 1);
  };

  const handleMouseDown = (e) => { setIsDragging(true); setLastMouse({ x: e.clientX, y: e.clientY }); };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    const newX = rotationX + dy * 0.5;
    const newY = rotationY + dx * 0.5;
    setRotationX(newX); setRotationY(newY);
    setLastMouse({ x: e.clientX, y: e.clientY });
    broadcastRotation(newX, newY);
  };
  const handleMouseUp   = () => setIsDragging(false);
  const handleWheel     = (e) => {
    e.preventDefault();
    const newZ = Math.min(3, Math.max(0.3, zoom - e.deltaY * 0.002));
    setZoom(newZ);
    broadcastRotation(rotationX, rotationY, newZ);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🧊</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>3D Model Viewer</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Drag to rotate · Scroll to zoom · Synced with peers</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Viewport */}
        <div
          className="model-viewport"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div
            className="cube-wrapper"
            style={{ transform: `scale(${zoom}) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`, transformStyle: 'preserve-3d' }}
          >
            <div className="cube">
              <div className="face front">SyncLearn</div>
              <div className="face back">WebRTC</div>
              <div className="face left">AI Notes</div>
              <div className="face right">Canvas</div>
              <div className="face top">3D Sync</div>
              <div className="face bottom">Socket.io</div>
            </div>
          </div>
          <div className="rotation-status">
            X: <code>{rotationX.toFixed(0)}°</code> &nbsp; Y: <code>{rotationY.toFixed(0)}°</code> &nbsp; Zoom: <code>{zoom.toFixed(2)}×</code>
          </div>
        </div>

        {/* Controls */}
        <div className="modal-controls">
          <span className="sync-badge">⚡ Live Sync Active</span>
          <div className="control-group" style={{ gap: '0.5rem' }}>
            <button className="action-sm-btn" onClick={() => handleRotateStep(0, 45)}>↻ Y+45°</button>
            <button className="action-sm-btn" onClick={() => handleRotateStep(45, 0)}>↕ X+45°</button>
            <button className="action-sm-btn action-sm-btn-danger" onClick={handleReset}>⏮ Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelViewerModal;