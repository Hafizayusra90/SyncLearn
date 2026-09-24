import React, { useState, useEffect } from 'react';
import './BreakoutPodsModal.css';

export default function BreakoutPodsModal({
  isOpen,
  onClose,
  isHost,
  user,
  roomId,
  socket,
  onJoinPod
}) {
  const [pods, setPods] = useState([
    {
      podId: 'pod_group_alpha',
      podName: 'Group Alpha: Algorithm Design',
      createdByName: 'Prof. Yusra',
      roomId
    },
    {
      podId: 'pod_group_beta',
      podName: 'Group Beta: WebRTC Debugging',
      createdByName: 'Prof. Yusra',
      roomId
    }
  ]);
  const [newPodName, setNewPodName] = useState('');

  // Listen for newly announced pods
  useEffect(() => {
    if (!socket) return;
    const handleCreated = (newPod) => {
      setPods(prev => {
        if (prev.some(p => p.podId === newPod.podId)) return prev;
        return [...prev, newPod];
      });
    };

    const handleClosed = ({ podId }) => {
      setPods(prev => prev.filter(p => p.podId !== podId));
    };

    socket.on('breakout-created', handleCreated);
    socket.on('breakout-closed', handleClosed);

    return () => {
      socket.off('breakout-created', handleCreated);
      socket.off('breakout-closed', handleClosed);
    };
  }, [socket]);

  if (!isOpen) return null;

  const handleCreatePod = (e) => {
    e.preventDefault();
    const name = newPodName.trim();
    if (!name) return;

    const podId = `pod_${Date.now()}`;
    const podObj = {
      podId,
      podName: name,
      createdByName: user?.name || 'Instructor',
      roomId
    };

    setPods(prev => [...prev, podObj]);
    if (socket) {
      socket.emit('breakout-create', podObj);
    }
    setNewPodName('');
  };

  const handleClosePod = (podId) => {
    setPods(prev => prev.filter(p => p.podId !== podId));
    if (socket) {
      socket.emit('breakout-close', { roomId, podId });
    }
  };

  const handleEnterPod = (pod) => {
    if (onJoinPod) {
      onJoinPod(pod);
    } else {
      // Direct room redirection to breakout sub-room
      const subRoomCode = `${roomId}-${pod.podId}`;
      const url = `${window.location.origin}?room=${encodeURIComponent(subRoomCode)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="breakout-backdrop" onClick={onClose}>
      <div className="breakout-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="breakout-header">
          <div className="breakout-header-title">
            <span className="breakout-badge">Group Work</span>
            <h3>💬 Breakout Rooms & Discussion Pods</h3>
          </div>
          <button className="breakout-close-btn" onClick={onClose} title="Close">×</button>
        </div>

        {/* Body */}
        <div className="breakout-body">
          {/* Creator section for Instructor */}
          {isHost && (
            <div className="breakout-creator-card">
              <div className="creator-title">➕ Create New Discussion Pod</div>
              <form onSubmit={handleCreatePod} className="creator-row">
                <input
                  type="text"
                  className="creator-input"
                  placeholder="Pod title (e.g. Group 3: Architecture Brainstorm)..."
                  value={newPodName}
                  onChange={(e) => setNewPodName(e.target.value)}
                />
                <button type="submit" className="btn-create-pod">
                  Launch Pod 🚀
                </button>
              </form>
            </div>
          )}

          {/* Pods List */}
          <div className="pods-list-title">
            <span>Active Discussion Pods ({pods.length})</span>
            <span>Room: {roomId}</span>
          </div>

          {pods.length === 0 ? (
            <div className="empty-pods-placeholder">
              No breakout pods currently active. The instructor will launch one shortly!
            </div>
          ) : (
            <div className="pods-grid">
              {pods.map(pod => (
                <div key={pod.podId} className="pod-card">
                  <div className="pod-info">
                    <div className="pod-name">
                      <span>👥</span>
                      <span>{pod.podName}</span>
                    </div>
                    <div className="pod-creator-meta">
                      Created by {pod.createdByName} · Dedicated Sub-room
                    </div>
                  </div>

                  <div className="pod-actions">
                    <button
                      type="button"
                      className="btn-join-pod"
                      onClick={() => handleEnterPod(pod)}
                      title="Join this private group discussion"
                    >
                      Enter Pod ➔
                    </button>
                    {isHost && (
                      <button
                        type="button"
                        className="btn-close-pod"
                        onClick={() => handleClosePod(pod.podId)}
                        title="Close this pod for all participants"
                      >
                        ✕ Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
