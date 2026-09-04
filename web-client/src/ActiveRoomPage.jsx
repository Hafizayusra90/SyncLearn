import React, { useState, useEffect } from 'react';
import './ActiveRoomPage.css';
import ModelViewerModal from './ModelViewerModal';
import WhiteboardCanvas from './WhiteboardCanvas';
import { socket } from './socket';

function ActiveRoomPage({ roomId, onLeaveRoom }) {
  const [activeTab, setActiveTab] = useState('chat');
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
      console.log('Connected to Socket Server with ID:', socket.id);
      socket.emit('join-room', { roomId, userId: socket.id });
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log('Disconnected from Socket Server');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.disconnect();
    };
  }, [roomId]);

  return (
    <div className="room-container">
      {/* Top Header */}
      <header className="room-header">
        <div className="room-info">
          <h2>Room: <code>{roomId}</code></h2>
          <span className="status-indicator">
            {isConnected ? '🟢 Live Connected' : '🔴 Connecting...'}
          </span>
        </div>
        <button className="leave-btn" onClick={onLeaveRoom}>
          Leave Room
        </button>
      </header>

      {/* Main Workspace Body */}
      <div className="room-body">
        <div className="workspace-area">
          <div className="video-grid">
            <div className="video-card">
              <span className="video-label">Your Stream (Local)</span>
            </div>
            <div className="video-card">
              <span className="video-label">Peer Stream (Remote)</span>
            </div>
          </div>

          <div className="canvas-area">
            <WhiteboardCanvas roomId={roomId} />
          </div>
        </div>

        <aside className="sidebar-panel">
          <div className="panel-header">
            <button 
              className={`panel-tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Live Chat
            </button>
            <button 
              className={`panel-tab ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              AI Notes
            </button>
          </div>

          <div className="panel-content">
            {activeTab === 'chat' ? (
              <p>💬 Chat messages will appear here...</p>
            ) : (
              <p>🎙️ Real-time OpenAI Whisper transcription notes will show here...</p>
            )}
          </div>
        </aside>
      </div>

      {/* Bottom Control Bar */}
      <footer className="room-footer">
        <button 
          className={`control-btn ${!micOn ? 'active-danger' : ''}`} 
          onClick={() => setMicOn(!micOn)}
          title="Toggle Mic"
        >
          {micOn ? '🎙️' : '🔇'}
        </button>

        <button 
          className={`control-btn ${!videoOn ? 'active-danger' : ''}`} 
          onClick={() => setVideoOn(!videoOn)}
          title="Toggle Camera"
        >
          {videoOn ? '📹' : '🚫'}
        </button>

        <button className="control-btn" title="Share Screen">
          🖥️
        </button>

        <button className="control-btn" title="Whiteboard Tools">
          ✏️
        </button>

        <button 
          className="control-btn" 
          onClick={() => setIs3DModalOpen(true)}
          title="Launch 3D Model Viewer"
        >
          🧊
        </button>
      </footer>

      {/* 3D Model Viewer Modal */}
      <ModelViewerModal 
        isOpen={is3DModalOpen} 
        onClose={() => setIs3DModalOpen(false)} 
      />
    </div>
  );
}

export default ActiveRoomPage;