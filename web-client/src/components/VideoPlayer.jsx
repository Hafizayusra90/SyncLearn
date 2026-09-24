import React, { useRef, useEffect, useState } from 'react';
import { socket } from '../socket';
import { SyncManager } from '../utils/SyncManager';
import TimelineOverlay from './TimelineOverlay';
import './VideoPlayer.css';

// Helper to extract YouTube Video ID from standard or short URLs
export function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Helper to format seconds to mm:ss
export function formatVideoTime(secs) {
  if (!secs || isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

const VideoPlayer = ({
  roomId,
  isInstructor = false,
  user,
  pinnedDoubts = [],
  onPinDoubt,
  onResolveDoubt
}) => {
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const syncManagerRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Doubt Pinning State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [doubtText, setDoubtText] = useState('');
  const [capturedTimestamp, setCapturedTimestamp] = useState(0);
  const [localVideoDoubts, setLocalVideoDoubts] = useState([]);

  // Sync incoming pinnedDoubts prop
  useEffect(() => {
    if (Array.isArray(pinnedDoubts) && pinnedDoubts.length > 0) {
      setLocalVideoDoubts(prev => {
        const map = new Map();
        [...pinnedDoubts, ...prev].forEach(d => {
          if (d && d.id) map.set(d.id, d);
        });
        return Array.from(map.values());
      });
    }
  }, [pinnedDoubts]);

  // Listen directly for real-time doubt events on socket
  useEffect(() => {
    const handleRemoteDoubtPinned = (doubt) => {
      if (!doubt) return;
      setLocalVideoDoubts(prev => {
        if (prev.some(d => d.id === doubt.id)) return prev;
        return [doubt, ...prev];
      });
    };
    const handleRemoteDoubtResolved = ({ doubtId }) => {
      setLocalVideoDoubts(prev => prev.filter(d => d.id !== doubtId));
    };

    socket.on('doubt-pinned', handleRemoteDoubtPinned);
    socket.on('doubt-resolved', handleRemoteDoubtResolved);
    return () => {
      socket.off('doubt-pinned', handleRemoteDoubtPinned);
      socket.off('doubt-resolved', handleRemoteDoubtResolved);
    };
  }, []);

  // Video Source state
  const [mediaType, setMediaType] = useState('none'); // 'none' | 'direct' | 'youtube'
  const [videoSrc, setVideoSrc] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [ytVideoId, setYtVideoId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [inputUrl, setInputUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [selectedInputTab, setSelectedInputTab] = useState('youtube'); // 'youtube' | 'mp4'

  const handleLocalVideoFile = (file) => {
    if (!file) return;
    try {
      const blobUrl = URL.createObjectURL(file);
      setVideoSrc(blobUrl);
      setVideoFileName(file.name);
      setMediaType('direct');
      setYtVideoId('');
      setShowUrlInput(false);
    } catch (e) {
      console.error('Local video file error:', e);
    }
  };

  // YouTube IFrame API integration
  const ytPlayerRef = useRef(null);
  const isYtApiLoadedRef = useRef(false);

  // Initialize SyncManager for direct HTML5 video
  useEffect(() => {
    if (videoRef.current && mediaType === 'direct') {
      syncManagerRef.current = new SyncManager(socket, roomId, videoRef.current);
    }
    return () => {
      if (syncManagerRef.current) {
        syncManagerRef.current.destroy();
      }
    };
  }, [roomId, mediaType]);

  // Listen for remote video source updates (YouTube URL / Lecture Video change broadcast)
  useEffect(() => {
    const handleRemoteSourceChange = (data) => {
      if (data.mediaType === 'youtube') {
        setMediaType('youtube');
        setYtVideoId(data.ytVideoId);
      } else {
        setMediaType('direct');
        setVideoSrc(data.videoSrc);
      }
    };

    socket.on('video-source-change', handleRemoteSourceChange);
    return () => {
      socket.off('video-source-change', handleRemoteSourceChange);
    };
  }, []);

  // Listen for YouTube sync commands from instructor
  useEffect(() => {
    const handleYtSyncState = (data) => {
      if (mediaType !== 'youtube' || !ytPlayerRef.current) return;
      if (typeof ytPlayerRef.current.getPlayerState !== 'function') return;

      if (data.type === 'play') {
        ytPlayerRef.current.playVideo();
      } else if (data.type === 'pause') {
        ytPlayerRef.current.pauseVideo();
      } else if (data.type === 'seek' && typeof data.timestamp === 'number') {
        ytPlayerRef.current.seekTo(data.timestamp, true);
      }
    };

    socket.on('video-state-change', handleYtSyncState);
    return () => {
      socket.off('video-state-change', handleYtSyncState);
    };
  }, [mediaType]);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        isYtApiLoadedRef.current = true;
      };
    } else {
      isYtApiLoadedRef.current = true;
    }
  }, []);

  // Initialize or re-create YouTube Player when ytVideoId changes
  useEffect(() => {
    if (mediaType !== 'youtube' || !ytVideoId) return;

    const createPlayer = () => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        ytPlayerRef.current.destroy();
      }

      if (window.YT && window.YT.Player) {
        ytPlayerRef.current = new window.YT.Player('synclearn-yt-iframe', {
          videoId: ytVideoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin
          },
          events: {
            onStateChange: (event) => {
              // 1: Playing, 2: Paused
              if (!isInstructor) return;
              if (event.data === 1) {
                const cur = ytPlayerRef.current?.getCurrentTime() || 0;
                socket.emit('video-state-change', { roomId, type: 'play', timestamp: cur });
              } else if (event.data === 2) {
                const cur = ytPlayerRef.current?.getCurrentTime() || 0;
                socket.emit('video-state-change', { roomId, type: 'pause', timestamp: cur });
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          createPlayer();
        }
      }, 300);
      return () => clearInterval(checkInterval);
    }
  }, [mediaType, ytVideoId, roomId, isInstructor]);

  // Poll YouTube video position & duration so timestamp is always live
  useEffect(() => {
    if (mediaType !== 'youtube') return;
    const timer = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const cur = ytPlayerRef.current.getCurrentTime();
          if (typeof cur === 'number' && !isNaN(cur)) {
            setCurrentTime(cur);
          }
          const dur = ytPlayerRef.current.getDuration();
          if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
            setDuration(dur);
          }
        } catch (e) {}
      }
    }, 500);
    return () => clearInterval(timer);
  }, [mediaType]);

  // Video seeking capability across HTML5 & YouTube
  const seekToTimestamp = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return;
    if (mediaType === 'youtube' && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      ytPlayerRef.current.seekTo(seconds, true);
      ytPlayerRef.current.playVideo && ytPlayerRef.current.playVideo();
    } else if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play && videoRef.current.play().catch(() => {});
    }
    setCurrentTime(seconds);
  };

  // Listen for seek commands (e.g. when peer or instructor clicks a pinned doubt in chat or sidebar)
  useEffect(() => {
    const handleSeekToVideoTime = (data) => {
      if (data && typeof data.timestamp === 'number') {
        seekToTimestamp(data.timestamp);
      }
    };
    socket.on('seek-to-video-time', handleSeekToVideoTime);
    return () => {
      socket.off('seek-to-video-time', handleSeekToVideoTime);
    };
  }, [mediaType]);

  // Doubt Pinning Handlers
  const handleOpenPinModal = () => {
    let currentSec = 0;
    if (mediaType === 'youtube' && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
      currentSec = ytPlayerRef.current.getCurrentTime() || 0;
    } else if (videoRef.current) {
      currentSec = videoRef.current.currentTime || 0;
    } else {
      currentSec = currentTime || 0;
    }
    setCapturedTimestamp(currentSec);
    setDoubtText('');
    setIsPinModalOpen(true);
  };

  const handleSubmitPinDoubt = (e) => {
    e && e.preventDefault();
    const cleanText = doubtText.trim() || `Doubt at ${formatVideoTime(capturedTimestamp)}`;
    const doubtObj = {
      id: 'doubt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      senderName: user?.name || (isInstructor ? 'Instructor' : 'Student'),
      senderRole: user?.role || 'student',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: cleanText,
      videoTimestamp: capturedTimestamp,
      videoTimeFormatted: formatVideoTime(capturedTimestamp),
      isDoubt: true,
    };

    // 1. Optimistically add to local doubts immediately
    setLocalVideoDoubts(prev => [doubtObj, ...prev]);

    // 2. Call parent callback so ActiveRoomPage updates immediately
    if (onPinDoubt) {
      onPinDoubt(doubtObj);
    }

    // 3. Emit live to room via socket
    const cleanRoom = String(roomId || '').replace(/[^a-zA-Z0-9_-]/g, '').trim();
    socket.emit('pin-doubt', { roomId: cleanRoom, doubt: doubtObj });
    socket.emit('pin-annotation', {
      roomId: cleanRoom,
      id: doubtObj.id,
      timestamp: capturedTimestamp,
      text: `${doubtObj.senderName}: ${cleanText}`
    });

    setIsPinModalOpen(false);
    setDoubtText('');
  };

  // Direct HTML5 event handlers
  const handlePlay = () => {
    if (syncManagerRef.current && videoRef.current) {
      syncManagerRef.current.broadcastPlay(videoRef.current.currentTime);
    }
  };

  const handlePause = () => {
    if (syncManagerRef.current && videoRef.current) {
      syncManagerRef.current.broadcastPause(videoRef.current.currentTime);
    }
  };

  const handleSeek = () => {
    if (syncManagerRef.current && videoRef.current) {
      syncManagerRef.current.broadcastSeek(videoRef.current.currentTime);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  // Submit new media URL
  const handleUpdateMedia = (e) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    if (!cleanUrl) return;

    const extractedYtId = getYouTubeId(cleanUrl);

    if (extractedYtId) {
      setMediaType('youtube');
      setYtVideoId(extractedYtId);
      socket.emit('video-source-change', {
        roomId,
        mediaType: 'youtube',
        ytVideoId: extractedYtId
      });
    } else {
      setMediaType('direct');
      setVideoSrc(cleanUrl);
      socket.emit('video-source-change', {
        roomId,
        mediaType: 'direct',
        videoSrc: cleanUrl
      });
    }

    setInputUrl('');
    setShowUrlInput(false);
  };

  // Manual YouTube sync triggers for Host
  const syncHostYtPlay = () => {
    if (!ytPlayerRef.current) return;
    const cur = ytPlayerRef.current.getCurrentTime ? ytPlayerRef.current.getCurrentTime() : 0;
    ytPlayerRef.current.playVideo && ytPlayerRef.current.playVideo();
    socket.emit('video-state-change', { roomId, type: 'play', timestamp: cur });
  };

  const syncHostYtPause = () => {
    if (!ytPlayerRef.current) return;
    const cur = ytPlayerRef.current.getCurrentTime ? ytPlayerRef.current.getCurrentTime() : 0;
    ytPlayerRef.current.pauseVideo && ytPlayerRef.current.pauseVideo();
    socket.emit('video-state-change', { roomId, type: 'pause', timestamp: cur });
  };

  // Merge prop pinnedDoubts and local optimistic doubts (deduplicated by ID)
  const mergedDoubtsMap = new Map();
  [...(pinnedDoubts || []), ...localVideoDoubts].forEach(d => {
    if (d && d.id && !mergedDoubtsMap.has(d.id)) {
      mergedDoubtsMap.set(d.id, d);
    }
  });
  const videoDoubts = Array.from(mergedDoubtsMap.values()).filter(d => typeof d?.videoTimestamp === 'number');

  return (
    <div className="video-player-wrapper">
      {/* Top Controls Bar */}
      <div className="video-player-header">
        <div className="video-title-group">
          <h3>
            <span>🎬</span>
            <span>Lecture Video & Watch Party</span>
          </h3>
          <span className={`video-source-pill ${mediaType}`}>
            {mediaType === 'youtube' ? '▶ YouTube Stream' : mediaType === 'direct' ? '📽️ HTML5 Video' : '📁 Video Ready'}
          </span>
          {videoFileName && (
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              📄 {videoFileName}
            </span>
          )}
        </div>

        <div className="video-header-actions">
          {(videoSrc || ytVideoId) && (
            <button
              type="button"
              className="btn-pin-doubt-action"
              onClick={handleOpenPinModal}
              title="Pin doubt at current video timestamp"
            >
              <span>📍 Pin Doubt ({formatVideoTime(currentTime)})</span>
            </button>
          )}

          {(videoSrc || ytVideoId) && (
            <label className="btn-video-action" style={{ cursor: 'pointer' }}>
              📁 Change Video File
              <input
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLocalVideoFile(file);
                }}
              />
            </label>
          )}

          <button
            type="button"
            className="btn-video-action"
            onClick={() => setShowUrlInput(!showUrlInput)}
            title="Load YouTube URL or direct MP4 video link"
          >
            {showUrlInput ? '✕ Close' : '🔗 Load URL'}
          </button>
        </div>
      </div>

      {/* URL Input Form */}
      {showUrlInput && (
        <div className="video-input-card">
          <div className="video-input-tabs">
            <button
              type="button"
              className={`video-input-tab ${selectedInputTab === 'youtube' ? 'active' : ''}`}
              onClick={() => setSelectedInputTab('youtube')}
            >
              ▶ YouTube Link
            </button>
            <button
              type="button"
              className={`video-input-tab ${selectedInputTab === 'mp4' ? 'active' : ''}`}
              onClick={() => setSelectedInputTab('mp4')}
            >
              📽️ Direct MP4 / WebM Link
            </button>
          </div>

          <form onSubmit={handleUpdateMedia} className="video-input-row">
            <input
              type="text"
              className="video-url-input"
              placeholder={
                selectedInputTab === 'youtube'
                  ? "Paste YouTube link (e.g. https://www.youtube.com/watch?v=k3_tw44QsZQ)..."
                  : "Enter direct MP4 / WebM URL..."
              }
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            <button type="submit" className="video-btn-submit">
              Load Video 🚀
            </button>
          </form>
        </div>
      )}

      {/* Frame Container */}
      <div className="video-frame-container">
        {!ytVideoId && !videoSrc ? (
          /* Drag & Drop Upload Zone when no video is loaded */
          <div
            className={`video-dropzone-box ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('video/')) {
                handleLocalVideoFile(file);
              }
            }}
          >
            <div className="dropzone-inner">
              <span style={{ fontSize: '3.2rem' }}>🎬</span>
              <h3>Drag & Drop Lecture Video Here</h3>
              <p>Drag any MP4 or WebM video file from your computer or click to browse</p>
              
              <label className="btn-browse-video">
                📁 Browse Video File
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLocalVideoFile(file);
                  }}
                />
              </label>

              <div className="dropzone-divider">
                <span>OR PASTE YOUTUBE VIDEO LINK</span>
              </div>

              <form onSubmit={handleUpdateMedia} className="dropzone-yt-form">
                <input
                  type="text"
                  placeholder="e.g. https://www.youtube.com/watch?v=k3_tw44QsZQ"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="dropzone-yt-input"
                />
                <button type="submit" className="dropzone-yt-btn">
                  ▶ Load YouTube
                </button>
              </form>
            </div>
          </div>
        ) : mediaType === 'youtube' && ytVideoId ? (
          <div>
            <div className="youtube-iframe-wrapper">
              <div id="synclearn-yt-iframe" ref={iframeRef}></div>
            </div>

            {/* Host Sync Bar for YouTube */}
            <div className="youtube-sync-controller">
              <div className="youtube-sync-title">
                <span>🔴 YouTube Watch Party Room</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {isInstructor ? '(You have Host Sync controls)' : '(Synced with Teacher)'}
                </span>
              </div>
              {isInstructor && (
                <div className="youtube-sync-btns">
                  <button type="button" className="btn-yt-sync" onClick={syncHostYtPlay} title="Force Play on all student screens">
                    ▶ Force Sync Play
                  </button>
                  <button type="button" className="btn-yt-sync" onClick={syncHostYtPause} title="Force Pause on all student screens">
                    ⏸ Force Sync Pause
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <video
              ref={videoRef}
              src={videoSrc}
              className="html5-video-player"
              controls
              onPlay={handlePlay}
              onPause={handlePause}
              onSeeked={handleSeek}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
            {/* Timeline Annotations & Doubt Pinning */}
            <TimelineOverlay currentTime={currentTime} duration={duration} roomId={roomId} />
          </div>
        )}

        {/* Timeline & Pinned Doubts Navigation (Works for both YouTube & MP4) */}
        {(videoSrc || ytVideoId) && duration > 0 && (
          <div className="video-timeline-doubts-bar">
            <div className="timeline-track-wrap">
              <div className="timeline-time-display">
                <span>⏱️ {formatVideoTime(currentTime)} / {formatVideoTime(duration)}</span>
                <span className="timeline-pins-count">
                  📍 {videoDoubts.length} {videoDoubts.length === 1 ? 'Doubt Pinned' : 'Doubts Pinned'}
                </span>
              </div>
              <div
                className="timeline-track-progress-bar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const pct = Math.max(0, Math.min(1, clickX / rect.width));
                  seekToTimestamp(pct * duration);
                }}
                title="Click on timeline to seek video"
              >
                <div
                  className="timeline-progress-fill"
                  style={{ width: `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` }}
                />
                {videoDoubts.map((d) => {
                  const leftPct = Math.min(100, Math.max(0, (d.videoTimestamp / duration) * 100));
                  return (
                    <button
                      key={d.id}
                      type="button"
                      className="timeline-pin-marker"
                      style={{ left: `${leftPct}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        seekToTimestamp(d.videoTimestamp);
                      }}
                      title={`📍 ${d.videoTimeFormatted || formatVideoTime(d.videoTimestamp)} - ${d.senderName}: "${d.text}" (Click to seek)`}
                    >
                      <span className="timeline-pin-icon">📍</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {videoDoubts.length > 0 && (
              <div className="video-pinned-doubts-chips">
                <span className="video-chips-title">Doubts:</span>
                {videoDoubts.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className="video-doubt-chip-btn"
                    onClick={() => seekToTimestamp(d.videoTimestamp)}
                    title="Click to seek video to this doubt"
                  >
                    <span className="chip-time">▶ {d.videoTimeFormatted || formatVideoTime(d.videoTimestamp)}</span>
                    <span className="chip-sender">{d.senderName}:</span>
                    <span className="chip-text">
                      {d.text && d.text.length > 25 ? d.text.substring(0, 25) + '…' : d.text}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pin Doubt Modal Dialog */}
      {isPinModalOpen && (
        <div className="video-pin-modal-backdrop" onClick={() => setIsPinModalOpen(false)}>
          <div className="video-pin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="video-pin-modal-header">
              <div className="video-pin-title">
                <h4>📍 Pin Doubt at {formatVideoTime(capturedTimestamp)}</h4>
                <span className="video-pin-sub">
                  Pin your doubt at this exact video moment so the instructor and peers can review it.
                </span>
              </div>
              <button
                type="button"
                className="video-pin-close-btn"
                onClick={() => setIsPinModalOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="video-pin-chips-row">
              {[
                'Explain this formula',
                'Please repeat this step',
                'Why is this method used?',
                'Code syntax question',
                'Could not understand this part'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="video-pin-chip"
                  onClick={() => setDoubtText(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitPinDoubt}>
              <textarea
                className="video-pin-textarea"
                rows={3}
                placeholder="Type your question or doubt here..."
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                autoFocus
              />

              <div className="video-pin-actions">
                <button
                  type="button"
                  className="btn-cancel-pin"
                  onClick={() => setIsPinModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-confirm-pin">
                  📌 Pin Doubt to Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;

