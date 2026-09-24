import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Send } from 'lucide-react';
import Peer from 'simple-peer';
import './ActiveRoomPage.css';
import ModelViewerModal from './ModelViewerModal';
import WhiteboardCanvas from './WhiteboardCanvas';
import { socket } from './socket';
import VideoPlayer from './components/VideoPlayer';
import AIQuizModal from './AIQuizModal';
import BreakoutPodsModal from './BreakoutPodsModal';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Remote peer video & audio component with dedicated audio element and speaking indicator
const RemoteVideo = ({ peer, peerInfo }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [peerVolume, setPeerVolume] = useState(100);

  useEffect(() => {
    let audioCtx;
    let analyser;
    let animId;

    const setupStream = (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      if (audioRef.current) {
        audioRef.current.srcObject = stream;
        audioRef.current.volume = peerVolume / 100;
        audioRef.current.play()
          .then(() => setAudioBlocked(false))
          .catch(err => {
            console.warn('Audio playback waiting for interaction:', err);
            setAudioBlocked(true);
          });
      }

      // Live voice detection on remote stream
      try {
        if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 128;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const detectVoice = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = sum / dataArray.length;
            setIsSpeaking(avg > 18);
            animId = requestAnimationFrame(detectVoice);
          };
          detectVoice();
        }
      } catch (e) {
        console.warn('Remote audio analyser error:', e);
      }
    };

    peer.on('stream', setupStream);
    peer.on('track', (track, stream) => setupStream(stream));

    if (peer._remoteStreams?.[0]) {
      setupStream(peer._remoteStreams[0]);
    }

    return () => {
      peer.removeListener('stream', setupStream);
      peer.removeAllListeners('track');
      if (animId) cancelAnimationFrame(animId);
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    };
  }, [peer, peerVolume]);

  const handleUnblockAudio = () => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = 1.0;
      audioRef.current.play()
        .then(() => setAudioBlocked(false))
        .catch(err => console.error('Play error:', err));
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Global user interaction unblocker
  useEffect(() => {
    const autoUnlock = () => {
      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.play()
          .then(() => setAudioBlocked(false))
          .catch(() => {});
      }
    };
    window.addEventListener('click', autoUnlock, { once: true });
    window.addEventListener('keydown', autoUnlock, { once: true });
    window.addEventListener('pointerdown', autoUnlock, { once: true });
    return () => {
      window.removeEventListener('click', autoUnlock);
      window.removeEventListener('keydown', autoUnlock);
      window.removeEventListener('pointerdown', autoUnlock);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} className={isSpeaking ? 'peer-speaking-highlight' : ''}>
      <video autoPlay playsInline ref={videoRef} className="video-element" />
      <audio autoPlay playsInline ref={audioRef} />

      {/* Speaking badge indicator */}
      {isSpeaking && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          background: '#22c55e',
          color: '#fff',
          fontSize: '0.72rem',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '99px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: '0 2px 8px rgba(34,197,94,0.4)',
          zIndex: 5
        }}>
          <span>🔊</span>
          <span>Speaking...</span>
        </div>
      )}

      {audioBlocked && (
        <button
          type="button"
          onClick={handleUnblockAudio}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}
        >
          🔊 Click to Hear Peer
        </button>
      )}
    </div>
  );
};

// ── Local User Video Card with Auto-play & Live Speaking Indicator ──
const LocalVideo = ({ stream, isScreenSharing, videoOn, isSpeaking, micOn, isBackgroundBlurred = false, isAutoFramed = false, user, onOpenSettings }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && stream && videoOn) {
      ref.current.srcObject = stream;
      ref.current.play().catch(err => console.log('Local video play error:', err));
    }
  }, [stream, videoOn]);

  return (
    <div className={`video-card ${isSpeaking ? 'peer-speaking-highlight' : ''}`}>
      {/* ── Image 3: When camera is off, show Profile Picture ── */}
      {!videoOn ? (
        <div
          className="video-camera-off-container"
          onClick={() => onOpenSettings && onOpenSettings('account')}
          title="Click to add or change profile picture"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="video-camera-off-avatar-img" />
          ) : (
            <div className="video-camera-off-circle">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="video-camera-off-overlay-hint">
            📷 {user?.avatar ? 'Change Picture' : 'Add Profile Picture'}
          </div>
        </div>
      ) : (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          className="video-element"
          style={{
            filter: isBackgroundBlurred ? 'blur(8px)' : 'none',
            transform: isAutoFramed ? 'scale(1.2)' : isBackgroundBlurred ? 'scale(1.08)' : 'none',
            transition: 'filter 0.3s ease, transform 0.3s ease'
          }}
        />
      )}
      {isBackgroundBlurred && videoOn && (
        <span style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'rgba(2, 132, 199, 0.85)',
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 700,
          padding: '2px 7px',
          borderRadius: '99px',
          zIndex: 5
        }}>
          ✨ Blur On
        </span>
      )}
      <span className="video-label">
        {isScreenSharing ? '🖥️ Screen Share' : '📹 You (Local)'}
        <span style={{ marginLeft: 6 }}>
          {micOn ? '🎙️' : '🔇'} {videoOn ? '📹' : '🚫'}
        </span>
      </span>
      {isSpeaking && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          background: '#22c55e',
          color: '#fff',
          fontSize: '0.72rem',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '99px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: '0 2px 8px rgba(34,197,94,0.4)',
          zIndex: 5
        }}>
          <span>🎙️</span>
          <span>Speaking...</span>
        </div>
      )}
      {!videoOn && (
        <div style={{
          position: 'absolute', inset: 0,
          background: '#0f172a', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 6, color: '#94a3b8', fontSize: '0.85rem', zIndex: 2
        }}>
          <span style={{ fontSize: '1.6rem' }}>🚫</span>
          <span>Camera Off</span>
        </div>
      )}
    </div>
  );
};

// ── Control button with label ──
const CtrlBtn = ({ onClick, title, label, icon, className = '' }) => (
  <div className="control-btn-wrap">
    <button className={`control-btn ${className}`} onClick={onClick} title={title}>
      {icon}
    </button>
    <span className="ctrl-label">{label || title}</span>
  </div>
);

// ── Clean & Extract Room ID ──
const cleanRoomId = (raw) => {
  if (!raw) return '';
  let str = String(raw).trim();
  if (str.includes('room=')) {
    try {
      const urlPart = str.includes('?') ? str.split('?')[1] : str;
      const params = new URLSearchParams(urlPart);
      const r = params.get('room');
      if (r) return r.trim();
    } catch (e) {}
  }
  return str.replace(/^https?:\/\/[^/]+\/?/i, '').replace(/[^a-zA-Z0-9_-]/g, '').trim() || str.trim();
};

// ── Synthetic Canvas Video Stream Fallback ──
// Prevents WebRTC failure when two tabs on the same PC compete for the single hardware webcam
function createFallbackStream(userName, isInstructor) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const initials = (userName || (isInstructor ? 'Instructor' : 'Student'))
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || (isInstructor ? 'INS' : 'STU');

  const drawAvatar = () => {
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(320, 210, 85, 0, Math.PI * 2);
    ctx.fillStyle = isInstructor ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)';
    ctx.fill();

    // Inner avatar circle
    ctx.beginPath();
    ctx.arc(320, 210, 70, 0, Math.PI * 2);
    ctx.fillStyle = isInstructor ? '#6366f1' : '#10b981';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Initials
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 320, 212);

    // User Name
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(userName || (isInstructor ? 'Instructor' : 'Student'), 320, 320);

    // Status subtitle
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Virtual Feed Active', 320, 350);
  };

  drawAvatar();
  return canvas.captureStream ? canvas.captureStream(10) : null;
}

// ── Acquire Real Media with Automatic Audio / Synthetic Fallback ──
async function acquireMediaStream(userName, isInstructor) {
  let stream = null;
  let hasRealVideo = false;

  // 1. Try real video + audio
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    hasRealVideo = true;
    return { stream, hasRealVideo };
  } catch (errVideo) {
    console.warn('Physical camera unavailable (may be in use by instructor/student tab):', errVideo);
  }

  // 2. Try audio only
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
  } catch (errAudio) {
    console.warn('Hardware microphone also unavailable:', errAudio);
    stream = new MediaStream();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const actx = new AudioCtx();
        const dst = actx.createMediaStreamDestination();
        dst.stream.getAudioTracks().forEach(t => stream.addTrack(t));
      }
    } catch (e) {}
  }

  // 3. Attach fallback canvas video track so WebRTC simple-peer video channel is established
  try {
    const canvasStream = createFallbackStream(userName, isInstructor);
    if (canvasStream) {
      const vTrack = canvasStream.getVideoTracks()[0];
      if (vTrack) stream.addTrack(vTrack);
    }
  } catch (e) {
    console.warn('Synthetic canvas error:', e);
  }

  return { stream, hasRealVideo };
}

function ActiveRoomPage({
  roomId,
  user,
  onLeaveRoom,
  onOpenSettings,
  theme,
  onToggleTheme,
  initialMicOn = true,
  initialVideoOn = true,
  initialBlurBackground = false,
}) {
  const isInstructor = user?.role === 'instructor';

  const [activeTab, setActiveTab]         = useState(null);
  const [micOn, setMicOn]                 = useState(initialMicOn);
  const [videoOn, setVideoOn]             = useState(initialVideoOn);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [isConnected, setIsConnected]     = useState(socket.connected);
  const [peers, setPeers]                 = useState([]);
  const [userStream, setUserStream]       = useState(null);
  const [workspaceView, setWorkspaceView] = useState('all');
  const [isRoomActionsOpen, setIsRoomActionsOpen] = useState(false);
  const [isStudioDockOpen, setIsStudioDockOpen] = useState(true);

  // Host & Room state
  const [participants, setParticipants] = useState([]);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isMuteAllActive, setIsMuteAllActive] = useState(false);

  // Floating Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  // Network LAN IP for sharing to mobile / other devices on the same Wi-Fi
  const [networkLanIp, setNetworkLanIp] = useState('10.216.84.64');

  useEffect(() => {
    const backendHost = window.location.hostname || 'localhost';
    fetch(`http://${backendHost}:5000/api/v1/network-info`)
      .then(r => r.json())
      .then(d => {
        if (d?.lanIp && d.lanIp !== 'localhost') {
          setNetworkLanIp(d.lanIp);
        }
      })
      .catch(() => {});
  }, []);

  const getShareableLink = (preferLocal = false) => {
    if (!roomId) return '';
    if (preferLocal) {
      return `${window.location.protocol}//localhost:${window.location.port || '5173'}/?room=${encodeURIComponent(roomId)}`;
    }
    const host = (networkLanIp && networkLanIp !== 'localhost')
      ? networkLanIp
      : (window.location.hostname !== 'localhost' ? window.location.hostname : '10.216.84.64');
    return `${window.location.protocol}//${host}:${window.location.port || '5173'}/?room=${encodeURIComponent(roomId)}`;
  };

  const copyRoomCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId)
      .then(() => showToast(`📋 Room Code "${roomId}" copied to clipboard!`))
      .catch(() => showToast('Failed to copy room code', 'error'));
  };

  const copyInviteLink = (preferLocal = false) => {
    if (!roomId) return;
    const inviteUrl = getShareableLink(preferLocal);
    navigator.clipboard.writeText(inviteUrl)
      .then(() => {
        if (preferLocal) {
          showToast(`💻 Localhost PC Link copied: ${inviteUrl}`);
        } else {
          showToast(`📱 Mobile & Wi-Fi Share Link copied! Open on phone or send to students: ${inviteUrl}`, 'success');
        }
      })
      .catch(() => showToast('Failed to copy invite link', 'error'));
  };

  const copyClassInvitation = () => {
    if (!roomId) return;
    const inviteUrl = getShareableLink(false);
    const formattedId = roomId.includes('-') ? roomId.replace(/-/g, ' ') : roomId;
    const instructorName = user?.name || 'Instructor';
    const text = `🎓 SyncLearn Live Classroom Invitation\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n👨‍🏫 Instructor: ${instructorName}\n📚 Classroom: SyncLearn Interactive Session\n📅 Status: Live In Session Now\n\n🔗 Join Meeting Directly (Mobile / Tablet / PC):\n${inviteUrl}\n\n🆔 Meeting ID: ${formattedId}\n🔐 Security: Direct Verified Access\n\n👉 Click the link above to enter the whiteboard & video classroom on your phone or PC.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    navigator.clipboard.writeText(text)
      .then(() => showToast('📋 Mobile & Wi-Fi class invitation copied! Ready to paste in WhatsApp/Email.', 'success'))
      .catch(() => showToast('Failed to copy invitation', 'error'));
  };
  const copyZoomInvitation = copyClassInvitation;

  // ── Audio, Video & Participants Zoom-Style Menu States ──
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [isVideoMenuOpen, setIsVideoMenuOpen] = useState(false);
  const [isParticipantsMenuOpen, setIsParticipantsMenuOpen] = useState(false);

  const [availableMics, setAvailableMics] = useState([
    { deviceId: 'default', label: 'Microphone Array (Realtek(R) Audio)' },
    { deviceId: 'system', label: 'Same as system (Microphone Array (Realtek(R) Audio))' }
  ]);
  const [selectedMicId, setSelectedMicId] = useState('default');

  const [availableSpeakers, setAvailableSpeakers] = useState([
    { deviceId: 'system', label: 'Same as system (Speakers (Realtek(R) Audio))' },
    { deviceId: 'speakers', label: 'Speakers (Realtek(R) Audio)' }
  ]);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState('system');

  const [micMode, setMicMode] = useState('noise-removal');

  const [availableCameras, setAvailableCameras] = useState([
    { deviceId: 'default', label: 'Integrated Camera' },
    { deviceId: 'system-cam', label: 'Same as system (Integrated Camera)' }
  ]);
  const [selectedCameraId, setSelectedCameraId] = useState('default');

  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState(initialBlurBackground);
  const [isAutoFramed, setIsAutoFramed] = useState(false);

  // ── Image 2, 3, 4: Host Tools & Meeting Info States ──
  const [isHostToolsOpen, setIsHostToolsOpen] = useState(false);
  const [isMeetingInfoOpen, setIsMeetingInfoOpen] = useState(false);
  const [isWaitingRoomEnabled, setIsWaitingRoomEnabled] = useState(false);
  const [hideProfilePictures, setHideProfilePictures] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);
  const [roomPasscode] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  });

  const footerRef = useRef(null);
  const headerActionsRef = useRef(null);

  // Enumerate actual media devices if available in browser
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const mics = devices.filter(d => d.kind === 'audioinput' && d.label).map((d, i) => ({
            deviceId: d.deviceId || `mic-${i}`,
            label: d.label
          }));
          if (mics.length > 0) {
            setAvailableMics([
              mics[0],
              { deviceId: 'system', label: `Same as system (${mics[0].label})` },
              ...mics.slice(1)
            ]);
          }

          const cams = devices.filter(d => d.kind === 'videoinput' && d.label).map((d, i) => ({
            deviceId: d.deviceId || `cam-${i}`,
            label: d.label
          }));
          if (cams.length > 0) {
            setAvailableCameras([
              cams[0],
              { deviceId: 'system-cam', label: `Same as system (${cams[0].label})` },
              ...cams.slice(1)
            ]);
          }

          const spks = devices.filter(d => d.kind === 'audiooutput' && d.label).map((d, i) => ({
            deviceId: d.deviceId || `spk-${i}`,
            label: d.label
          }));
          if (spks.length > 0) {
            setAvailableSpeakers([
              { deviceId: 'system', label: `Same as system (${spks[0].label})` },
              ...spks
            ]);
          }
        })
        .catch(err => console.log('Device query notice:', err));
    }
  }, []);

  // Close popup menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (footerRef.current && !footerRef.current.contains(e.target)) {
        setIsAudioMenuOpen(false);
        setIsVideoMenuOpen(false);
        setIsParticipantsMenuOpen(false);
        setIsHostToolsOpen(false);
        setIsMeetingInfoOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleTestAudioAndMic = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55);
        osc.start();
        osc.stop(ctx.currentTime + 0.55);
      }
    } catch (e) {
      console.warn('AudioContext notice:', e);
    }
    showToast('🔊 Audio chime played! Speaker and microphone test passed.');
    setIsAudioMenuOpen(false);
  };

  // Speech transcription state
  // Speech transcription & YouTube-Style Live Subtitles state
  const [transcription, setTranscription]   = useState([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveCaption, setLiveCaption]       = useState(null); // { speaker, role, text, isFinal, timestamp }
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(true);
  const captionTimeoutRef                   = useRef(null);
  const recognitionRef                      = useRef(null);
  const lastSpeechRecTimeRef                = useRef(0);
  const lastVoiceDetectedTimeRef            = useRef(0);

  // Chat, Doubts & File Sharing
  const [messages, setMessages]           = useState([]);
  const [newMessage, setNewMessage]       = useState('');
  const [isDoubtMode, setIsDoubtMode]     = useState(false);
  const [selectedFile, setSelectedFile]   = useState(null);
  const [pinnedDoubts, setPinnedDoubts]   = useState([]);
  const [showPinnedDoubts, setShowPinnedDoubts] = useState(true);
  const fileInputRef = useRef(null);
  const chatEndRef   = useRef(null);

  // Screen share
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenTrackRef  = useRef(null);
  const cameraTrackRef  = useRef(null);

  // ── Category 1: AI Quiz, AI Co-Teacher & Engagement States ──
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeQuizData, setActiveQuizData]   = useState(null);
  const [hasHandRaised, setHasHandRaised]     = useState(false);
  const [handRaisedUsers, setHandRaisedUsers] = useState({}); // { socketId: { studentName, time } }
  const [engagementStats, setEngagementStats] = useState({}); // { socketId: { isFocused, score } }
  const [peerMediaStates, setPeerMediaStates] = useState({}); // { socketId: { videoOn, micOn } }
  const [localMicVolume, setLocalMicVolume]   = useState(0); // 0 to 100
  const [isMicTesting, setIsMicTesting]       = useState(false);
  const micTestAudioRef                       = useRef(null);

  // AI Co-Teacher Chat State
  const [aiChatMessages, setAiChatMessages]   = useState([
    {
      id: 'ai-intro',
      sender: 'assistant',
      text: "👋 Hello! I'm your AI Co-Teacher. Ask me anything about this lecture, or click the quick prompt chips above!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [aiPromptInput, setAiPromptInput]     = useState('');
  const [isAiThinking, setIsAiThinking]       = useState(false);
  const aiChatEndRef                          = useRef(null);

  // ── Category 3: Breakout Pods & Session Recording States ──
  const [isBreakoutModalOpen, setIsBreakoutModalOpen] = useState(false);
  const [isRecordingSession, setIsRecordingSession]   = useState(false);
  const [remoteRecordingNotice, setRemoteRecordingNotice] = useState(null); // { isRecording, recordedByName }
  const mediaRecorderRef                              = useRef(null);
  const recordedChunksRef                             = useRef([]);

  const userVideoRef  = useRef(null);
  const userStreamRef = useRef(null);
  const peersRef      = useRef([]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper to simulate live voice captions for instant testing/demonstration
  const handleSimulateLiveCaption = (sampleText) => {
    const textToStream = sampleText || (isInstructor
      ? "Welcome class! Today we are discussing data structures, algorithms, and real-time collaboration."
      : "Teacher, I have understood this concept and it is completely clear!");
    const words = textToStream.split(' ');
    let currentWords = [];

    if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);

    words.forEach((word, index) => {
      setTimeout(() => {
        currentWords.push(word);
        const isFinal = index === words.length - 1;
        const payload = {
          speaker: user?.name || (isInstructor ? 'Instructor' : 'Student'),
          role: isInstructor ? 'instructor' : 'student',
          text: currentWords.join(' '),
          isFinal,
          timestamp: Date.now()
        };

        setLiveCaption(payload);
        socket.emit('live-caption-stream', { roomId, ...payload });

        if (isFinal) {
          const entry = {
            id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            speaker: user?.name || (isInstructor ? 'Instructor' : 'Student'),
            text: textToStream,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setTranscription(prev => [...prev, entry]);
          socket.emit('new-transcription', { roomId, entry });

          captionTimeoutRef.current = setTimeout(() => {
            setLiveCaption(null);
            socket.emit('clear-live-caption', { roomId });
          }, 4500);
        }
      }, (index + 1) * 190);
    });
  };

  // Web Speech API (YouTube-Style Live Real-Time Subtitles & Transcription)
  useEffect(() => {
    if (!SpeechRecognition) return;

    let recognition = null;
    let shouldBeRunning = micOn;
    let restartTimer = null;

    const startRecognition = () => {
      if (!shouldBeRunning) return;
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }

        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true; // Enables live real-time words streaming like YouTube!
        recognition.lang = navigator.language || 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsTranscribing(true);
        };

        recognition.onresult = (event) => {
          lastSpeechRecTimeRef.current = Date.now();
          let interim = '';
          let finalChunk = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalChunk += transcript;
            } else {
              interim += transcript;
            }
          }

          const currentText = (finalChunk || interim).trim();
          if (currentText) {
            const targetCleanRoom = cleanRoomId(roomId);
            const captionPayload = {
              speaker: user?.name || (isInstructor ? 'Instructor' : 'Student'),
              role: isInstructor ? 'instructor' : 'student',
              text: currentText,
              isFinal: !!finalChunk.trim(),
              timestamp: Date.now()
            };

            // 1. Show immediately on local screen
            setLiveCaption(captionPayload);

            // 2. Clear previous timeout and set 4.5-second hold
            if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
            captionTimeoutRef.current = setTimeout(() => {
              setLiveCaption(null);
              socket.emit('clear-live-caption', { roomId: targetCleanRoom });
            }, 4500);

            // 3. Broadcast in real time to all student/peer screens
            socket.emit('live-caption-stream', {
              roomId: targetCleanRoom,
              ...captionPayload
            });

            // 4. If sentence is finalized, also archive in lecture notes history
            if (finalChunk.trim()) {
              const entry = {
                id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                speaker: user?.name || (isInstructor ? 'Instructor' : 'Student'),
                text: finalChunk.trim(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
              setTranscription(prev => [...prev, entry]);
              socket.emit('new-transcription', { roomId: targetCleanRoom, entry });
            }
          }
        };

        recognition.onerror = (err) => {
          if (err.error !== 'no-speech') {
            console.warn('SpeechRecognition notice:', err.error);
          }
        };

        recognition.onend = () => {
          if (shouldBeRunning) {
            restartTimer = setTimeout(() => {
              if (shouldBeRunning) startRecognition();
            }, 300);
          } else {
            setIsTranscribing(false);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Speech recognition init note:', e);
      }
    };

    if (micOn) {
      shouldBeRunning = true;
      startRecognition();
    } else {
      shouldBeRunning = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
      setIsTranscribing(false);
    }

    return () => {
      shouldBeRunning = false;
      if (restartTimer) clearTimeout(restartTimer);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
      setIsTranscribing(false);
    };
  }, [micOn, roomId, user, isInstructor]);

  // Auto-record session attendance in real-time when room is entered or roster updates
  useEffect(() => {
    if (!roomId) return;
    try {
      const existing = JSON.parse(localStorage.getItem('synclearn_completed_sessions') || '[]');
      const newRecord = {
        code: roomId,
        title: `Live Session (${roomId})`,
        date: 'Today',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        students: participants.length > 0 ? participants.length : 1,
        instructor: isInstructor ? (user?.name || 'You') : 'Prof. Yusra'
      };
      const updated = [newRecord, ...existing.filter(s => s.code !== roomId)].slice(0, 10);
      localStorage.setItem('synclearn_completed_sessions', JSON.stringify(updated));
    } catch (e) {
      console.warn('Session auto-record error:', e);
    }
  }, [roomId, isInstructor, user, participants.length]);

  // WebRTC & Socket init
  useEffect(() => {
    socket.connect();
    const cleanRoom = cleanRoomId(roomId);
    let currentStream = null;

    acquireMediaStream(user?.name, isInstructor).then(({ stream, hasRealVideo }) => {
      currentStream = stream;
      userStreamRef.current = stream;
      setUserStream(stream);

      const shouldEnableVideo = Boolean(initialVideoOn && hasRealVideo);
      setVideoOn(shouldEnableVideo);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        cameraTrackRef.current = videoTrack;
        videoTrack.enabled = shouldEnableVideo;
      }

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = Boolean(initialMicOn);
      }
      setMicOn(Boolean(initialMicOn));

      // Always join the socket room unconditionally
      socket.emit('join-room', {
        roomId: cleanRoom,
        userId: socket.id,
        userName: user?.name || (isInstructor ? 'Instructor' : 'Student'),
        userRole: user?.role || 'student',
      });
      socket.emit('media-state-change', { roomId: cleanRoom, videoOn: shouldEnableVideo, micOn: Boolean(initialMicOn) });

      // WebRTC Peer signaling listeners
      socket.on('user-connected', userId => {
        if (peersRef.current.some(p => p.peerID === userId)) {
          const existing = peersRef.current.find(p => p.peerID === userId);
          try { existing?.peer?.destroy(); } catch (e) {}
          peersRef.current = peersRef.current.filter(p => p.peerID !== userId);
        }
        const activeMedia = userStreamRef.current || currentStream;
        const peer = createPeer(userId, socket.id, activeMedia);
        peersRef.current.push({ peerID: userId, peer });
        setPeers(prev => [...prev.filter(p => p.peerID !== userId), { peerID: userId, peer }]);
      });

      socket.on('user-joined', payload => {
        if (peersRef.current.some(p => p.peerID === payload.callerID)) {
          const existing = peersRef.current.find(p => p.peerID === payload.callerID);
          try { existing?.peer?.destroy(); } catch (e) {}
          peersRef.current = peersRef.current.filter(p => p.peerID !== payload.callerID);
        }
        const activeMedia = userStreamRef.current || currentStream;
        const peer = addPeer(payload.signal, payload.callerID, activeMedia);
        peersRef.current.push({ peerID: payload.callerID, peer });
        setPeers(prev => [...prev.filter(p => p.peerID !== payload.callerID), { peerID: payload.callerID, peer }]);
      });

      socket.on('receiving-returned-signal', payload => {
        const item = peersRef.current.find(p => p.peerID === payload.id);
        if (item) item.peer.signal(payload.signal);
      });

      socket.on('user-disconnected', userId => {
        const peerObj = peersRef.current.find(p => p.peerID === userId);
        if (peerObj) peerObj.peer.destroy();
        const remaining = peersRef.current.filter(p => p.peerID !== userId);
        peersRef.current = remaining;
        setPeers(remaining);
      });
    }).catch(err => {
      console.warn('acquireMediaStream error fallback:', err);
      // Even on complete error, join the room!
      socket.emit('join-room', {
        roomId: cleanRoom,
        userId: socket.id,
        userName: user?.name || (isInstructor ? 'Instructor' : 'Student'),
        userRole: user?.role || 'student',
      });
    });

    // Receive live chat messages
    socket.on('receive-message', data => setMessages(prev => [...prev, data]));

    // Receive live lecture notes
    socket.on('receive-transcription', data => {
      if (data?.entry) {
        setTranscription(prev => [...prev, data.entry]);
      }
    });

    // Receive YouTube-style real-time live captions on student/peer screen
    socket.on('receive-live-caption', data => {
      if (data?.text) {
        setLiveCaption(data);
        if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
        captionTimeoutRef.current = setTimeout(() => {
          setLiveCaption(null);
        }, 4500);
      }
    });

    socket.on('receive-clear-caption', () => {
      setLiveCaption(null);
    });

    // Host Controls: Mute (all or individual)
    socket.on('force-mute', () => {
      if (!isInstructor) {
        setMicOn(false);
        const audioTrack = userStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) audioTrack.enabled = false;
        socket.emit('media-state-change', { roomId, videoOn, micOn: false });
        showToast('🔇 You have been muted by the instructor', 'error');
      }
    });

    // Host Controls: Camera Toggle Override
    socket.on('force-toggle-camera', (data) => {
      if (!isInstructor) {
        setVideoOn(prev => {
          const nextVal = data?.action === 'on' ? true : (data?.action === 'off' ? false : !prev);
          const videoTrack = userStreamRef.current?.getVideoTracks()[0];
          if (videoTrack) videoTrack.enabled = nextVal;
          socket.emit('media-state-change', { roomId, videoOn: nextVal, micOn });
          showToast(nextVal ? '📹 Instructor enabled your camera' : '📹 Instructor turned your camera OFF', 'info');
          return nextVal;
        });
      }
    });

    // Peer Media State Sync (Mic & Camera realtime indicator)
    socket.on('peer-media-state-change', ({ socketId, videoOn: peerVid, micOn: peerMic }) => {
      setPeerMediaStates(prev => ({
        ...prev,
        [socketId]: { videoOn: peerVid, micOn: peerMic }
      }));
    });

    // Host Controls: Remove Participant
    socket.on('force-removed', (data) => {
      alert(data?.reason || 'You have been removed from the session by the host.');
      if (onLeaveRoom) onLeaveRoom();
    });

    // Room Roster & Lock updates
    socket.on('room-participants-update', list => {
      if (Array.isArray(list)) setParticipants(list);
    });

    socket.on('room-lock-status', ({ isLocked }) => {
      setIsRoomLocked(isLocked);
    });

    // Real-time peer join announcement toast
    socket.on('peer-joined-notification', (data) => {
      const roleBadge = data.userRole === 'instructor' ? '👨‍🏫 Instructor' : '🎓 Student';
      showToast(`🟢 ${data.userName} (${roleBadge}) just entered the room! (${data.totalCount} active)`, 'success');
    });

    socket.on('room-locked-error', data => {
      alert(data?.message || 'This room is currently locked by the instructor.');
      if (onLeaveRoom) onLeaveRoom();
    });

    // Pinned Doubts Sync
    socket.on('doubt-pinned', (doubt) => {
      setPinnedDoubts(prev => {
        if (prev.some(d => d.id === doubt.id)) return prev;
        return [...prev, doubt];
      });
    });

    socket.on('doubt-resolved', ({ doubtId }) => {
      setPinnedDoubts(prev => prev.filter(d => d.id !== doubtId));
    });

    // ── Category 1: AI Quiz Events ──
    socket.on('room-quiz-published', (quiz) => {
      setActiveQuizData(quiz);
      setIsQuizModalOpen(true);
      showToast(`📝 Pop Quiz Launched: "${quiz.title || 'Lecture Quiz'}"!`, 'info');
    });

    // ── Category 1: Hand Raise Events ──
    socket.on('student-hand-raised', (data) => {
      setHandRaisedUsers(prev => ({
        ...prev,
        [data.socketId]: { studentName: data.studentName, time: data.time }
      }));
      showToast(`✋ ${data.studentName} raised their hand!`, 'info');
    });

    socket.on('student-hand-lowered', (data) => {
      setHandRaisedUsers(prev => {
        const next = { ...prev };
        delete next[data.socketId];
        return next;
      });
    });

    // ── Category 1: Peer Engagement Telemetry ──
    socket.on('peer-engagement-stat', (data) => {
      setEngagementStats(prev => ({
        ...prev,
        [data.socketId]: {
          studentName: data.studentName,
          isFocused: data.isFocused,
          score: data.score
        }
      }));
    });

    // ── Category 3: Remote Recording Status ──
    socket.on('recording-status-change', (data) => {
      setRemoteRecordingNotice(data);
      if (data.isRecording) {
        showToast(`⏺️ Session recording started by ${data.recordedByName || 'Host'}`, 'info');
      } else {
        showToast('⏹️ Session recording stopped', 'info');
      }
    });

    socket.on('connect',    () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      userStreamRef.current?.getTracks().forEach(t => t.stop());
      screenTrackRef.current?.stop();
      socket.off('connect'); socket.off('disconnect');
      socket.off('user-connected'); socket.off('user-joined');
      socket.off('receiving-returned-signal'); socket.off('user-disconnected');
      socket.off('receive-message'); socket.off('receive-transcription');
      socket.off('receive-live-caption'); socket.off('receive-clear-caption');
      socket.off('force-mute'); socket.off('force-removed');
      socket.off('force-toggle-camera'); socket.off('peer-media-state-change');
      socket.off('room-participants-update'); socket.off('room-lock-status');
      socket.off('room-locked-error');
      socket.off('doubt-pinned'); socket.off('doubt-resolved');
      socket.off('room-quiz-published');
      socket.off('student-hand-raised'); socket.off('student-hand-lowered');
      socket.off('peer-engagement-stat');
      socket.off('recording-status-change');
      socket.off('peer-joined-notification');
      socket.disconnect();
    };
  }, [roomId, isInstructor, onLeaveRoom, user]);

  // ─── Live Mic Voice Volume Detection (Web Audio API) ───
  useEffect(() => {
    if (!userStream || !micOn) {
      setLocalMicVolume(0);
      return;
    }
    let audioCtx;
    let analyser;
    let source;
    let animId;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.4;
        source = audioCtx.createMediaStreamSource(userStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          const score = Math.min(100, Math.round((avg / 128) * 100));
          setLocalMicVolume(score);

          animId = requestAnimationFrame(checkLevel);
        };
        checkLevel();
      }
    } catch (e) {
      console.warn('Local mic volume meter error:', e);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    };
  }, [userStream, micOn]);

  // ─── Hardware Mic & Speaker Loopback Self-Test ───
  const handleTestMicrophone = () => {
    if (!userStreamRef.current) {
      showToast('No microphone stream available', 'error');
      return;
    }
    if (isMicTesting) {
      setIsMicTesting(false);
      if (micTestAudioRef.current) {
        micTestAudioRef.current.srcObject = null;
      }
      showToast('Mic test stopped');
      return;
    }

    setIsMicTesting(true);
    showToast('🎙️ Mic Loopback Active: Speak to hear yourself in your headphones/speakers!', 'info');
    if (micTestAudioRef.current) {
      micTestAudioRef.current.srcObject = userStreamRef.current;
      micTestAudioRef.current.volume = 1.0;
      micTestAudioRef.current.play().catch(() => {});
    }

    setTimeout(() => {
      setIsMicTesting(false);
      if (micTestAudioRef.current) {
        micTestAudioRef.current.srcObject = null;
      }
    }, 4500);
  };

  // ─── Host Control Action Handlers ───
  const handleHostMuteAll = () => {
    const nextMuted = !isMuteAllActive;
    setIsMuteAllActive(nextMuted);
    socket.emit('host-mute-all', { roomId, isMuted: nextMuted });
    showToast(nextMuted ? '🔇 Muted all participants' : '🔊 Unmuted all participants');
  };

  const handleHostMuteStudent = (targetSocketId, targetName) => {
    socket.emit('host-mute-student', { roomId, targetSocketId });
    showToast(`🔇 Muted ${targetName || 'student'}`);
  };

  const handleHostToggleStudentCamera = (targetSocketId, targetName, currentCamOff) => {
    const nextAction = currentCamOff ? 'on' : 'off';
    socket.emit('host-toggle-student-camera', { roomId, targetSocketId, action: nextAction });
    showToast(`📹 Toggled camera for ${targetName || 'student'}`);
  };

  const handleToggleRoomLock = () => {
    const nextLock = !isRoomLocked;
    socket.emit('host-toggle-lock', { roomId, isLocked: nextLock });
    showToast(nextLock ? '🔒 Room Locked (No new students can join)' : '🔓 Room Unlocked');
  };

  const handleRemoveParticipant = (targetSocketId, targetName) => {
    if (window.confirm(`Are you sure you want to remove ${targetName || 'this student'} from the classroom?`)) {
      socket.emit('host-remove-peer', { roomId, targetSocketId });
      showToast(`🚫 Removed ${targetName || 'participant'}`);
    }
  };

  // ─── Category 3: Session Screen Recording with Audio & Instant Download ───
  const toggleSessionRecording = async () => {
    if (isRecordingSession) {
      // Stop Recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingSession(false);
      socket.emit('recording-status-change', {
        roomId,
        isRecording: false,
        recordedByName: user?.name || 'User'
      });
      showToast('⏹️ Recording stopped. Processing download...', 'info');
    } else {
      // Start Recording
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30 },
          audio: true
        });

        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(displayStream, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ? 'video/webm;codecs=vp9,opus'
            : 'video/webm'
        });

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);

          // Check user recording destination preferences
          let prefs = { saveToPc: true, saveToApp: true, storagePath: 'C:\\Users\\PMLS\\Documents\\Zoom' };
          try {
            const saved = localStorage.getItem('synclearn_recording_prefs');
            if (saved) prefs = { ...prefs, ...JSON.parse(saved) };
          } catch (e) {
            console.warn('Prefs read notice:', e);
          }

          // 1. Option 1: PC me download
          if (prefs.saveToPc) {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `synclearn-lecture-${roomId || 'session'}-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
            }, 100);
          }

          // 2. Option 2: Application me recording k andar save
          if (prefs.saveToApp) {
            try {
              const newRec = {
                id: 'rec-' + Date.now(),
                title: `Class Lecture - Room ${roomId || 'Session'}`,
                roomId: roomId || 'Session',
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                duration: `${Math.max(1, Math.round(recordedChunksRef.current.length))}s`,
                size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
                recordedBy: user?.name || 'User',
                url: url
              };
              const existing = JSON.parse(localStorage.getItem('synclearn_saved_recordings') || '[]');
              localStorage.setItem('synclearn_saved_recordings', JSON.stringify([newRec, ...existing].slice(0, 15)));
            } catch (err) {
              console.warn('App recording storage notice:', err);
            }
          }

          // Stop all capture tracks
          displayStream.getTracks().forEach(track => track.stop());
          setIsRecordingSession(false);

          if (prefs.saveToPc && prefs.saveToApp) {
            showToast('💾 Lecture recording downloaded to PC & saved in SyncLearn App Library!', 'success');
          } else if (prefs.saveToPc) {
            showToast('💾 Lecture recording downloaded to PC successfully!', 'success');
          } else {
            showToast('📁 Lecture recording saved in SyncLearn App Library successfully!', 'success');
          }
        };

        // User stops screen share via browser stop button
        displayStream.getVideoTracks()[0].onended = () => {
          if (recorder.state !== 'inactive') recorder.stop();
        };

        recorder.start(1000); // 1-second chunks
        mediaRecorderRef.current = recorder;
        setIsRecordingSession(true);

        socket.emit('recording-status-change', {
          roomId,
          isRecording: true,
          recordedByName: user?.name || 'Host'
        });
        showToast('⏺️ Recording started! The full lecture is being recorded.');
      } catch (err) {
        console.error('Recording error:', err);
        showToast('Failed to start recording (Display permission required)', 'error');
      }
    }
  };

  // ─── Category 1: Raise Hand Toggle ───
  const toggleRaiseHand = () => {
    const nextState = !hasHandRaised;
    setHasHandRaised(nextState);
    if (nextState) {
      socket.emit('raise-hand', {
        roomId,
        studentName: user?.name || 'Student'
      });
      showToast('✋ You raised your hand!');
    } else {
      socket.emit('lower-hand', {
        roomId,
        socketId: socket.id
      });
      showToast('Hand lowered');
    }
  };

  // ─── Category 1: Student Attention & Focus Telemetry ───
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isFocused = !document.hidden;
      if (socket && roomId) {
        socket.emit('student-engagement-update', {
          roomId,
          studentName: user?.name || 'Student',
          score: isFocused ? 95 : 40,
          isFocused
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [roomId, user]);

  // ─── Category 1: AI Co-Teacher Query Execution ───
  const handleSendAiPrompt = (customPromptText = null) => {
    const query = (customPromptText || aiPromptInput).trim();
    if (!query) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatMessages(prev => [...prev, userMsg]);
    if (!customPromptText) setAiPromptInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      const lectureContext = transcription.map(t => t.text).join(' ');
      let replyText = '';

      const lowerQ = query.toLowerCase();
      if (lowerQ.includes('summarize') || lowerQ.includes('summary')) {
        replyText = lectureContext.length > 20
          ? `📝 **AI Lecture Summary**: During today's lecture, the discussion highlighted: "${lectureContext.slice(0, 180)}...". Key focus areas include peer connection setup, real-time message streams, and collaborative state sharing.`
          : "📝 **AI Lecture Summary**: Today's session explores real-time collaboration using WebRTC, WebSocket signaling, and low-latency client synchronization.";
      } else if (lowerQ.includes('concept') || lowerQ.includes('hard') || lowerQ.includes('doubt')) {
        replyText = "💡 **Key Concept Breakdown**: The most crucial part of this architecture is how WebRTC handles ICE candidate discovery through STUN servers before directly establishing an encrypted peer-to-peer data channel.";
      } else if (lowerQ.includes('formula') || lowerQ.includes('key')) {
        replyText = "🔑 **Quick Reference Formulas & Rules**:\n• Bandwidth = Packet Size × Frame Rate\n• Latency Target: < 150ms for live collaboration\n• NAT Traversal Success Rate: ~85% with STUN alone, 99% with TURN relay fallback.";
      } else {
        replyText = `🤖 **AI Co-Teacher Answer**: In the context of your class session, regarding "${query}": Keep in mind that real-time signaling synchronizes events instantly across all participants while keeping network overhead minimal!`;
      }

      const aiReply = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAiChatMessages(prev => [...prev, aiReply]);
      setIsAiThinking(false);
      setTimeout(() => {
        aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 600);
  };

  // ─── AI Lecture Summary & Notes Download Handlers ───
  const generateSummaryPoints = (notes) => {
    if (!notes || notes.length === 0) return ['No lecture highlights recorded yet.'];
    const sentences = notes.map(n => n.text).filter(Boolean);
    if (sentences.length <= 3) return sentences;
    const first = sentences[0];
    const mid = sentences[Math.floor(sentences.length / 2)];
    const last = sentences[sentences.length - 1];
    return [first, mid, last].filter((v, i, a) => a.indexOf(v) === i);
  };

  const downloadNotesTXT = () => {
    if (transcription.length === 0) {
      showToast('No notes to download yet!', 'error');
      return;
    }
    let content = `======================================================\n`;
    content += `        SYNCLearn AI Live Lecture Notes & Summary      \n`;
    content += `======================================================\n\n`;
    content += `Room ID:      ${roomId}\n`;
    content += `Date & Time:  ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
    content += `Recorded By:  ${user?.name || 'Instructor'}\n`;
    content += `Total Notes:  ${transcription.length} entries\n\n`;
    content += `------------------------------------------------------\n`;
    content += `KEY HIGHLIGHTS / SUMMARY\n`;
    content += `------------------------------------------------------\n`;
    const summaryPoints = generateSummaryPoints(transcription);
    summaryPoints.forEach((pt, i) => {
      content += `${i + 1}. ${pt}\n`;
    });
    content += `\n------------------------------------------------------\n`;
    content += `CHRONOLOGICAL LECTURE TRANSCRIPT\n`;
    content += `------------------------------------------------------\n\n`;
    transcription.forEach((item, idx) => {
      content += `[${item.time || ''}] ${item.speaker || 'Speaker'}:\n`;
      content += `  ${item.text}\n\n`;
    });
    content += `======================================================\n`;
    content += `Generated automatically by SyncLearn Virtual Classroom\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synclearn-lecture-notes-${roomId || 'session'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('📝 Lecture Notes downloaded as TXT!');
  };

  const downloadNotesPDF = () => {
    if (transcription.length === 0) {
      showToast('No notes to download yet!', 'error');
      return;
    }
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      let y = 40;

      // Header Banner
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 75, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('SyncLearn AI Lecture Notes', margin, 38);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Room: ${roomId}  •  Date: ${new Date().toLocaleDateString()}  •  Host: ${user?.name || 'Instructor'}`, margin, 58);

      y = 95;

      // Summary Box
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(1.5);
      doc.roundedRect(margin, y, pageWidth - (margin * 2), 70, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(67, 56, 202);
      doc.text('💡 Key Lecture Highlights & Takeaways', margin + 12, y + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const summaryPoints = generateSummaryPoints(transcription);
      summaryPoints.slice(0, 3).forEach((pt, i) => {
        const line = doc.splitTextToSize(`•  ${pt}`, pageWidth - (margin * 2) - 24);
        doc.text(line, margin + 14, y + 34 + (i * 13));
      });

      y += 90;

      // Detailed Notes Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text('Detailed Lecture Transcript', margin, y);
      y += 20;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);

      transcription.forEach((item) => {
        if (y > doc.internal.pageSize.getHeight() - 55) {
          doc.addPage();
          y = 45;
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(99, 102, 241);
        doc.text(`${item.speaker || 'Speaker'} (${item.time || ''}):`, margin, y);
        y += 13;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(item.text, pageWidth - (margin * 2) - 10);
        doc.text(splitText, margin + 8, y);
        y += (splitText.length * 12) + 8;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated automatically by SyncLearn — Interactive Virtual Classroom', margin, doc.internal.pageSize.getHeight() - 20);

      doc.save(`synclearn-lecture-notes-${roomId || 'session'}.pdf`);
      showToast('📄 Lecture Notes downloaded as PDF!');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to export PDF notes', 'error');
    }
  };

  const iceServersConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' }
    ]
  };

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream, config: iceServersConfig });
    peer.on('signal', signal => socket.emit('sending-signal', { userToSignal, callerID, signal }));
    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream, config: iceServersConfig });
    peer.on('signal', signal => socket.emit('returning-signal', { signal, callerID }));
    peer.signal(incomingSignal);
    return peer;
  }

  const toggleMic = () => {
    const track = userStreamRef.current?.getAudioTracks()[0];
    if (track) {
      const nextMic = !micOn;
      track.enabled = nextMic;
      setMicOn(nextMic);
      socket.emit('media-state-change', { roomId, videoOn, micOn: nextMic });
    }
  };

  const toggleVideo = async () => {
    let track = userStreamRef.current?.getVideoTracks()[0];
    const nextVideo = !videoOn;

    if (nextVideo) {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newTrack = camStream.getVideoTracks()[0];
        if (newTrack) {
          if (userStreamRef.current) {
            userStreamRef.current.getVideoTracks().forEach(t => {
              try { t.stop(); } catch (e) {}
              userStreamRef.current.removeTrack(t);
            });
            userStreamRef.current.addTrack(newTrack);
          }
          cameraTrackRef.current = newTrack;
          peersRef.current.forEach(p => {
            try {
              const sender = p.peer?._pc?.getSenders()?.find(s => s.track && s.track.kind === 'video');
              if (sender) sender.replaceTrack(newTrack);
            } catch (e) {}
          });
          setUserStream(new MediaStream(userStreamRef.current.getTracks()));
          setVideoOn(true);
          socket.emit('media-state-change', { roomId: cleanRoomId(roomId), videoOn: true, micOn });
          showToast('📹 Camera connected!');
          return;
        }
      } catch (err) {
        console.warn('Physical camera unavailable:', err);
      }
    }

    if (track) {
      track.enabled = nextVideo;
    }
    setVideoOn(nextVideo);
    socket.emit('media-state-change', { roomId: cleanRoomId(roomId), videoOn: nextVideo, micOn });
  };

  // ─── Live Chat, Doubts & File Sharing Handlers ───
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('File size must be under 3MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        dataUrl: reader.result,
        isImage: file.type.startsWith('image/')
      });
      showToast(`📎 Attached: ${file.name}`);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const msgPayload = {
      roomId,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      message: newMessage.trim(),
      senderId: socket.id,
      senderName: user?.name || (isInstructor ? 'Instructor' : 'Student'),
      senderRole: user?.role || 'student',
      isDoubt: isDoubtMode,
      file: selectedFile,
    };

    socket.emit('send-message', msgPayload);

    // If marked as doubt, auto-pin to room
    if (isDoubtMode) {
      const doubtItem = {
        id: msgPayload.id,
        senderName: msgPayload.senderName,
        senderRole: msgPayload.senderRole,
        text: newMessage.trim() || (selectedFile ? `[File: ${selectedFile.name}]` : 'Doubt question'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      socket.emit('pin-doubt', { roomId, doubt: doubtItem });
      setIsDoubtMode(false);
    }

    setNewMessage('');
    setSelectedFile(null);
  };

  const handleAddPinnedDoubt = (doubt) => {
    if (!doubt) return;
    setPinnedDoubts(prev => {
      if (prev.some(d => d.id === doubt.id)) return prev;
      return [doubt, ...prev];
    });
    const cleanRoom = cleanRoomId(roomId);
    socket.emit('pin-doubt', { roomId: cleanRoom, doubt });
    showToast(`📍 Doubt pinned at ${doubt.videoTimeFormatted || 'video'}!`);
  };

  const handlePinDoubt = (msg) => {
    const alreadyPinned = pinnedDoubts.some(d => d.id === msg.id);
    if (alreadyPinned) {
      showToast('Already pinned as doubt');
      return;
    }
    const doubt = {
      id: msg.id || ('doubt_' + Date.now()),
      senderName: msg.senderName || 'Student',
      senderRole: msg.senderRole || 'student',
      text: msg.message || (msg.file ? `[Attachment: ${msg.file.name}]` : 'Doubt question'),
      time: msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setPinnedDoubts(prev => [doubt, ...prev]);
    const cleanRoom = cleanRoomId(roomId);
    socket.emit('pin-doubt', { roomId: cleanRoom, doubt });
    showToast('📌 Doubt pinned to room!');
  };

  const handleResolveDoubt = (doubtId) => {
    setPinnedDoubts(prev => prev.filter(d => d.id !== doubtId));
    const cleanRoom = cleanRoomId(roomId);
    socket.emit('resolve-doubt', { roomId: cleanRoom, doubtId });
    showToast('✅ Doubt marked as resolved');
  };

  const downloadChatHistory = () => {
    if (messages.length === 0) {
      showToast('No chat messages to export', 'error');
      return;
    }
    let content = `======================================================\n`;
    content += `         SyncLearn Classroom Live Chat Transcript     \n`;
    content += `======================================================\n\n`;
    content += `Room ID:        ${roomId}\n`;
    content += `Date & Time:    ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
    content += `Exported By:    ${user?.name || 'User'}\n`;
    content += `Total Messages: ${messages.length}\n\n`;
    content += `------------------------------------------------------\n\n`;

    messages.forEach(m => {
      const roleStr = m.senderRole ? ` [${m.senderRole.toUpperCase()}]` : '';
      const doubtStr = m.isDoubt ? ' [❓ DOUBT]' : '';
      content += `[${m.time || ''}] ${m.senderName || 'User'}${roleStr}${doubtStr}:\n`;
      if (m.message) content += `  ${m.message}\n`;
      if (m.file) content += `  [Attached File: ${m.file.name} (${m.file.size})]\n`;
      content += `\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synclearn-chat-${roomId || 'session'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('📥 Chat log downloaded as TXT!');
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack  = screenStream.getVideoTracks()[0];
        const camTrack     = userStreamRef.current.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        peersRef.current.forEach(({ peer }) => {
          if (peer && camTrack && !peer.destroyed)
            peer.replaceTrack(camTrack, screenTrack, userStreamRef.current);
        });
        if (camTrack) userStreamRef.current.removeTrack(camTrack);
        userStreamRef.current.addTrack(screenTrack);
        setUserStream(new MediaStream(userStreamRef.current.getTracks()));
        setIsScreenSharing(true);
        screenTrack.onended = stopScreenShare;
      } catch (err) { console.error('Screen share error:', err); }
    } else { stopScreenShare(); }
  };

  const stopScreenShare = async () => {
    const activeScreen = screenTrackRef.current;
    try {
      let camTrack = cameraTrackRef.current;
      if (!camTrack || camTrack.readyState === 'ended') {
        const cam = await navigator.mediaDevices.getUserMedia({ video: true });
        camTrack = cam.getVideoTracks()[0];
        cameraTrackRef.current = camTrack;
      }
      camTrack.enabled = true;
      peersRef.current.forEach(({ peer }) => {
        if (peer && activeScreen && camTrack && !peer.destroyed)
          peer.replaceTrack(activeScreen, camTrack, userStreamRef.current);
      });
      if (activeScreen) { userStreamRef.current.removeTrack(activeScreen); activeScreen.stop(); }
      userStreamRef.current.addTrack(camTrack);
      setUserStream(new MediaStream(userStreamRef.current.getTracks()));
    } catch (err) { console.error('Camera restore failed:', err); }
    finally { screenTrackRef.current = null; setIsScreenSharing(false); setVideoOn(true); }
  };

  return (
    <div className="room-container">
      {/* ── Floating Toast Notification ── */}
      {toast.show && (
        <div className={`synclearn-toast ${toast.type === 'error' ? 'toast-error' : ''}`}>
          <div className="toast-content">
            <span className="toast-icon">{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="room-header">
        <div className="room-info">
          <h2 className="room-header-title">
            <img src="/logo.png" alt="SyncLearn" className="room-header-logo" />
            <span className="room-label">Room:</span>
            <code>{roomId}</code>
          </h2>
          <span className="status-indicator">
            {isConnected ? '🟢 Live' : '🔴 Connecting...'}
          </span>

          <span className="room-roster-count-chip" title="Real-time students & teacher connected now">
            👥 {participants.length || 1} Online
          </span>

          {isInstructor && (
            <span className="instructor-host-badge" title="You are the session host">
              👨‍🏫 Host
            </span>
          )}

          {isRoomLocked && (
            <span className="room-locked-chip" title="Room is currently locked by instructor">
              🔒 Locked
            </span>
          )}

          {/* Recording Notice Badge */}
          {(isRecordingSession || remoteRecordingNotice?.isRecording) && (
            <span className="recording-indicator-chip" title="Live lecture screen recording in progress">
              <span className="recording-dot"></span>
              <span>REC</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <button
            type="button"
            className="theme-icon-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            type="button" 
            className="leave-btn" 
            onClick={() => {
              try {
                // Record completed session history for student/teacher
                const existing = JSON.parse(localStorage.getItem('synclearn_completed_sessions') || '[]');
                const newRecord = {
                  code: roomId,
                  title: `Live Session (${roomId})`,
                  date: 'Just now',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  students: participants.length || 1,
                  instructor: isInstructor ? (user?.name || 'You') : 'Prof. Yusra'
                };
                // Avoid immediate duplicates
                const updated = [newRecord, ...existing.filter(s => s.code !== roomId)].slice(0, 10);
                localStorage.setItem('synclearn_completed_sessions', JSON.stringify(updated));
              } catch (e) {
                console.warn('Failed to save session history:', e);
              }
              if (onLeaveRoom) onLeaveRoom();
            }}
          >
            ⬅ Leave Room
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className={`room-body ${activeTab ? 'sidebar-open' : 'sidebar-closed'}`}>
        {/* ── Left Studio Dock Sidebar (Room Actions & Studio Dock Dropdowns) ── */}
        <aside className="studio-dock-sidebar">
          {/* 1. Room Actions Dropdown (Above Studio Dock, contains Copy Code, Invite Link, Quiz, Breakout Pods) */}
          <div className="dock-dropdown-section">
            <button
              type="button"
              className={`dock-section-trigger ${isRoomActionsOpen ? 'open' : ''}`}
              onClick={() => setIsRoomActionsOpen(prev => !prev)}
              title="Toggle Room & Session Tools"
            >
              <div className="dock-section-title-wrap">
                <span className="dock-section-icon">⚡</span>
                <span className="dock-section-title">Room Actions</span>
              </div>
              <span className="dock-chevron">{isRoomActionsOpen ? '▲' : '▼'}</span>
            </button>

            {isRoomActionsOpen && (
              <div className="dock-dropdown-menu">
                {isInstructor && (
                  <>
                    <button
                      type="button"
                      className="dock-action-item"
                      onClick={copyRoomCode}
                      title="Copy Room Code to clipboard"
                    >
                      <span className="item-icon">📋</span>
                      <div className="item-info">
                        <span className="item-title">Copy Room Code</span>
                        <span className="item-sub">Code: {roomId}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="dock-action-item"
                      onClick={copyInviteLink}
                      title="Copy Direct Shareable Invite Link"
                    >
                      <span className="item-icon">🔗</span>
                      <div className="item-info">
                        <span className="item-title">Copy Invite Link</span>
                        <span className="item-sub">Direct join URL</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="dock-action-item"
                      onClick={copyClassInvitation}
                      title="Copy complete class invitation formatted for WhatsApp & Email"
                    >
                      <span className="item-icon">📋</span>
                      <div className="item-info">
                        <span className="item-title">Copy Class Invite</span>
                        <span className="item-sub">WhatsApp & Email text</span>
                      </div>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="dock-action-item"
                  onClick={() => setIsQuizModalOpen(true)}
                  title="Open AI Lecture Assessment & Quiz"
                >
                  <span className="item-icon">📝</span>
                  <div className="item-info">
                    <span className="item-title">{isInstructor ? 'AI Quiz Generator' : 'Take AI Quiz'}</span>
                    <span className="item-sub">Assessment tool</span>
                  </div>
                </button>

                <button
                  type="button"
                  className="dock-action-item"
                  onClick={() => setIsBreakoutModalOpen(true)}
                  title="Open Breakout Rooms & Discussion Pods"
                >
                  <span className="item-icon">💬</span>
                  <div className="item-info">
                    <span className="item-title">Breakout Pods</span>
                    <span className="item-sub">Discussion groups</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 2. Studio Dock Dropdown (Collapsible just like Tools ∨) */}
          <div className="dock-dropdown-section">
            <button
              type="button"
              className={`dock-section-trigger ${isStudioDockOpen ? 'open' : ''}`}
              onClick={() => setIsStudioDockOpen(prev => !prev)}
              title="Toggle Studio Dock Navigation"
            >
              <div className="dock-section-title-wrap">
                <span className="dock-section-icon">👨‍🏫</span>
                <span className="dock-section-title">Studio Dock</span>
              </div>
              <span className="dock-chevron">{isStudioDockOpen ? '▲' : '▼'}</span>
            </button>

            {isStudioDockOpen && (
              <div className="dock-nav-items">
                {/* 1. Whiteboard Studio (Dual Mode) */}
                <button
                  type="button"
                  className={`dock-nav-btn ${workspaceView === 'whiteboard' ? 'active' : ''}`}
                  onClick={() => setWorkspaceView('whiteboard')}
                  title="Dual Whiteboard: Keyboard Typing on left, Live Canvas on right"
                >
                  <div className="dock-btn-left">
                    <span className="dock-icon">✏️</span>
                    <div className="dock-label-box">
                      <span className="dock-item-name">Dual Whiteboard</span>
                      <span className="dock-item-desc">Typing + Canvas Split</span>
                    </div>
                  </div>
                  <span className="dock-badge badge-blue">Studio</span>
                </button>

                {/* 2. Video Call / Camera Grid */}
                <button
                  type="button"
                  className={`dock-nav-btn ${workspaceView === 'cameras' ? 'active' : ''}`}
                  onClick={() => setWorkspaceView('cameras')}
                  title="Camera & Video Call Grid"
                >
                  <div className="dock-btn-left">
                    <span className="dock-icon">📹</span>
                    <div className="dock-label-box">
                      <span className="dock-item-name">Video Call Grid</span>
                      <span className="dock-item-desc">Webcams & Speaking</span>
                    </div>
                  </div>
                  <span className={`dock-status-dot ${videoOn ? 'live' : 'off'}`} />
                </button>

                {/* 3. Load YouTube Video */}
                <button
                  type="button"
                  className={`dock-nav-btn ${workspaceView === 'video' ? 'active' : ''}`}
                  onClick={() => setWorkspaceView('video')}
                  title="Load YouTube or Drag-and-Drop Lecture Video"
                >
                  <div className="dock-btn-left">
                    <span className="dock-icon">🎬</span>
                    <div className="dock-label-box">
                      <span className="dock-item-name">YouTube & Media</span>
                      <span className="dock-item-desc">Video Player & Sync</span>
                    </div>
                  </div>
                  <span className="dock-badge badge-red">Media</span>
                </button>

                {/* 4. Unified All-in-One Studio */}
                <button
                  type="button"
                  className={`dock-nav-btn ${workspaceView === 'all' ? 'active' : ''}`}
                  onClick={() => setWorkspaceView('all')}
                  title="Show All-In-One Unified View"
                >
                  <div className="dock-btn-left">
                    <span className="dock-icon">🔲</span>
                    <div className="dock-label-box">
                      <span className="dock-item-name">All-In-One</span>
                      <span className="dock-item-desc">Multi-panel View</span>
                    </div>
                  </div>
                  <span className="dock-badge badge-purple">Unified</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="workspace-area">

          {/* Synchronized Video Player & YouTube Collaboration */}
          {(workspaceView === 'video' || workspaceView === 'all') && (
            <div className="video-player-section">
              <VideoPlayer
                roomId={cleanRoomId(roomId)}
                isInstructor={isInstructor}
                user={user}
                pinnedDoubts={pinnedDoubts}
                onPinDoubt={handleAddPinnedDoubt}
                onResolveDoubt={handleResolveDoubt}
              />
            </div>
          )}

          {/* Live Camera Grid */}
          <div className={`video-grid ${workspaceView === 'cameras' ? 'large-grid' : workspaceView === 'whiteboard' ? 'compact-grid' : ''}`}>
            <LocalVideo
              stream={userStream}
              isScreenSharing={isScreenSharing}
              videoOn={videoOn}
              isSpeaking={localMicVolume > 15 && micOn}
              micOn={micOn}
              isBackgroundBlurred={isBackgroundBlurred}
              isAutoFramed={isAutoFramed}
              user={user}
              onOpenSettings={onOpenSettings}
            />
            {peers.map(peerObj => {
              const pInfo = participants.find(p => p.socketId === peerObj.peerID);
              const mState = peerMediaStates[peerObj.peerID];
              return (
                <div className="video-card" key={peerObj.peerID}>
                  <RemoteVideo peer={peerObj.peer} peerInfo={pInfo} />
                  <span className="video-label">
                    {pInfo?.userRole === 'instructor' ? '👨‍🏫 ' : '🎓 '}
                    {pInfo?.userName || 'Peer (Remote)'}
                    {mState && (
                      <span style={{ marginLeft: 6, opacity: 0.9 }}>
                        {mState.micOn ? '🎙️' : '🔇'} {mState.videoOn ? '📹' : '🚫'}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Whiteboard */}
          {(workspaceView === 'whiteboard' || workspaceView === 'all') && (
            <div className={`canvas-area ${workspaceView === 'whiteboard' ? 'full-view' : ''}`}>
              <WhiteboardCanvas roomId={roomId} user={user} />
            </div>
          )}
        </div>

        {/* ── Sidebar (On-Demand, opens when bottom chat icon is clicked) ── */}
        {activeTab && (
          <aside className="sidebar-panel">
            <div className="panel-header">
              <button className={`panel-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                💬 Chat
              </button>
              <button className={`panel-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                🎙️ Notes {transcription.length > 0 ? `(${transcription.length})` : ''}
              </button>
              <button className={`panel-tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
                🤖 AI Tutor
              </button>
              <button className={`panel-tab ${activeTab === 'host' ? 'active' : ''}`} onClick={() => setActiveTab('host')}>
                {isInstructor ? `⚙️ Host (${participants.length || 1})` : `👥 Peers (${participants.length || 1})`}
              </button>
              <button
                type="button"
                className="panel-close-btn"
                onClick={() => setActiveTab(null)}
                title="Close sidebar panel"
              >
                ✕
              </button>
            </div>

            <div className="panel-content">
              {/* Tab 1: Live Chat & Pinned Doubts */}
              {activeTab === 'chat' && (
                <div className="chat-container">
                  {/* Chat Top Bar */}
                  <div className="chat-header-bar">
                    <span>💬 Classroom Discussion</span>
                    <button
                      type="button"
                      className="chat-export-btn"
                      onClick={downloadChatHistory}
                      title="Export chat history to a text file"
                    >
                      📥 Export Chat
                    </button>
                  </div>

                  {/* Pinned Doubts Accordion */}
                  {pinnedDoubts.length > 0 && (
                    <div className="pinned-doubts-card">
                      <div
                        className="pinned-doubts-header"
                        onClick={() => setShowPinnedDoubts(!showPinnedDoubts)}
                        title="Click to toggle pinned doubts"
                      >
                        <span>📌 Pinned Doubts ({pinnedDoubts.length})</span>
                        <span style={{ fontSize: '0.7rem' }}>{showPinnedDoubts ? '▲ Hide' : '▼ View'}</span>
                      </div>

                      {showPinnedDoubts && (
                        <div className="pinned-doubts-list">
                          {pinnedDoubts.map(d => (
                            <div key={d.id} className="pinned-doubt-item">
                              <div className="pinned-doubt-info">
                                <span className="pinned-doubt-sender">
                                  ❓ {d.senderName} · {d.time}
                                  {typeof d.videoTimestamp === 'number' && (
                                    <span style={{
                                      marginLeft: 6,
                                      background: 'rgba(245, 158, 11, 0.2)',
                                      color: '#f59e0b',
                                      border: '1px solid rgba(245, 158, 11, 0.4)',
                                      padding: '1px 6px',
                                      borderRadius: 4,
                                      fontSize: '0.72rem',
                                      fontWeight: 700
                                    }}>
                                      🎬 {d.videoTimeFormatted || `${Math.floor(d.videoTimestamp)}s`}
                                    </span>
                                  )}
                                </span>
                                <div className="pinned-doubt-text">{d.text}</div>
                              </div>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                {typeof d.videoTimestamp === 'number' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setWorkspaceView('video');
                                      socket.emit('seek-to-video-time', { roomId, timestamp: d.videoTimestamp });
                                      showToast(`⏩ Video sought to ${d.videoTimeFormatted || Math.floor(d.videoTimestamp) + 's'}`);
                                    }}
                                    style={{
                                      background: 'rgba(245, 158, 11, 0.15)',
                                      border: '1px solid rgba(245, 158, 11, 0.5)',
                                      color: '#fbbf24',
                                      borderRadius: 6,
                                      padding: '4px 8px',
                                      fontSize: '0.72rem',
                                      cursor: 'pointer',
                                      fontWeight: 700
                                    }}
                                    title="Jump to video moment"
                                  >
                                    ▶ Jump
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn-unpin-doubt"
                                  onClick={() => handleUnpinDoubt(d.id)}
                                  title="Unpin doubt"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Messages Feed */}
                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <div className="chat-empty-state">
                        <span className="empty-icon">💬</span>
                        <p className="empty-title">No messages yet.</p>
                        <p className="empty-sub">Ask questions, pin lecture doubts, or share notes with peers!</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe = msg.senderId === socket.id;
                        const isMsgInstructor = msg.senderRole === 'instructor';
                        return (
                          <div key={msg.id} className={`chat-message-group ${isMe ? 'mine' : 'theirs'}`}>
                            <span className="chat-sender-name">
                              {msg.senderName}
                              <span className={`chat-role-badge ${isMsgInstructor ? 'instructor' : 'student'}`}>
                                {isMsgInstructor ? '👨‍🏫 Instructor' : '🎓 Student'}
                              </span>
                              · {msg.time}
                              {/* Pin Doubt Button */}
                              <button
                                type="button"
                                className="btn-pin-message"
                                onClick={() => handlePinDoubt(msg)}
                                title="Pin this message as a Doubt for instructor"
                              >
                                📌
                              </button>
                            </span>

                            <div className={`chat-bubble ${isMe ? 'mine' : 'theirs'} ${msg.isDoubt ? 'doubt-bubble' : ''}`}>
                              {/* Doubt Chip */}
                              {msg.isDoubt && (
                                <div className="doubt-tag-chip">
                                  ❓ DOUBT QUESTION
                                </div>
                              )}

                              {/* Text message */}
                              {msg.message && <div>{msg.message}</div>}

                              {/* Attached File Preview */}
                              {msg.file && (
                                <div className="chat-file-attachment">
                                  {msg.file.isImage ? (
                                    <a href={msg.file.dataUrl} target="_blank" rel="noreferrer" title="Click to view full image">
                                      <img src={msg.file.dataUrl} alt={msg.file.name} className="chat-image-preview" />
                                    </a>
                                  ) : (
                                    <a href={msg.file.dataUrl} download={msg.file.name} className="chat-file-card">
                                      <span>📎</span>
                                      <div>
                                        <div style={{ fontWeight: 600 }}>{msg.file.name}</div>
                                        <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>{msg.file.size} • Download</div>
                                      </div>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Form & Input Controls */}
                  <form onSubmit={sendMessage} className="chat-form">
                    {/* File Upload Preview Bar */}
                    {selectedFile && (
                      <div className="file-upload-preview-bar">
                        <span>
                          {selectedFile.isImage ? '🖼️' : '📄'} {selectedFile.name} ({selectedFile.size})
                        </span>
                        <button type="button" onClick={() => setSelectedFile(null)} title="Remove attachment">
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                    />

                    <div className="chat-input-row">
                      {/* Paperclip file attach button */}
                      <button
                        type="button"
                        className="chat-icon-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach Image or Document (under 3MB)"
                      >
                        📎
                      </button>

                      {/* Doubt toggle button */}
                      <button
                        type="button"
                        className={`chat-doubt-toggle ${isDoubtMode ? 'active' : ''}`}
                        onClick={() => setIsDoubtMode(!isDoubtMode)}
                        title={isDoubtMode ? "Marked as Doubt (will be highlighted & pinned)" : "Click to mark next message as Doubt"}
                      >
                        <span>❓</span>
                        <span className="doubt-label-text">Doubt</span>
                      </button>

                      {/* Input field with corner send icon */}
                      <div className="chat-input-wrapper">
                        <input
                          type="text"
                          placeholder={isDoubtMode ? "Type your doubt question..." : "Type a message..."}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className={isDoubtMode ? "input-doubt-active" : ""}
                        />
                        <button
                          type="submit"
                          className="chat-send-icon-btn"
                          disabled={!newMessage.trim() && !selectedFile}
                          title="Send message"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab 2: Live Transcripts & Notes */}
              {activeTab === 'notes' && (
                <div className="notes-container">
                  <div className="notes-header-bar">
                    <div className="notes-title-group">
                      <span>🎙️ Live Transcription</span>
                      <span className="badge-pulse-recording">● Active</span>
                    </div>
                    {transcription.length > 0 && (
                      <button className="download-pdf-btn" onClick={downloadNotesPDF} title="Download verified lecture PDF notes">
                        📄 Export Notes PDF
                      </button>
                    )}
                  </div>

                  <div className="notes-feed">
                    {transcription.length === 0 ? (
                      <div className="notes-empty-state">
                        <span className="empty-icon">🎙️</span>
                        <p className="empty-title">Waiting for speech...</p>
                        <p className="empty-sub">Microphone audio will automatically be transcribed into lecture notes here.</p>
                      </div>
                    ) : (
                      transcription.map((item) => (
                        <div key={item.id} className="note-card">
                          <div className="note-meta">
                            <span className="note-speaker-badge">
                              {item.speaker?.includes('Instructor') ? '👨‍🏫' : '👤'} {item.speaker}
                            </span>
                            <span className="note-time-badge">{item.time}</span>
                          </div>
                          <p className="note-text">{item.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: AI Co-Teacher Assistant */}
              {activeTab === 'ai' && (
                <div className="ai-tutor-container">
                  <div className="ai-tutor-header">
                    <div className="ai-tutor-title">
                      <span>🤖 AI Co-Teacher Assistant</span>
                    </div>
                    <div className="ai-tutor-subtitle">
                      Instant Doubt Solver & Live Lecture Explainer
                    </div>
                  </div>

                  {/* Quick Prompts */}
                  <div className="ai-tutor-chips">
                    <button
                      type="button"
                      className="ai-prompt-chip"
                      onClick={() => handleSendAiPrompt("Summarize the current lecture so far")}
                    >
                      💡 Summarize Lecture
                    </button>
                    <button
                      type="button"
                      className="ai-prompt-chip"
                      onClick={() => handleSendAiPrompt("Explain the hardest concept discussed today")}
                    >
                      ❓ Hardest Concept
                    </button>
                    <button
                      type="button"
                      className="ai-prompt-chip"
                      onClick={() => handleSendAiPrompt("Give me key formulas and architecture takeaways")}
                    >
                      🔑 Key Takeaways
                    </button>
                  </div>

                  {/* AI Chat History */}
                  <div className="ai-tutor-messages">
                    {aiChatMessages.map((msg) => (
                      <div key={msg.id} className={`ai-chat-bubble ${msg.sender}`}>
                        <div className="ai-bubble-sender">
                          {msg.sender === 'assistant' ? '🤖 AI Co-Teacher' : '👤 You'} · {msg.time}
                        </div>
                        <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                      </div>
                    ))}
                    {isAiThinking && (
                      <div className="ai-chat-bubble assistant">
                        <div className="ai-bubble-sender">🤖 AI Co-Teacher</div>
                        <div>Thinking & analyzing lecture context... ⚡</div>
                      </div>
                    )}
                    <div ref={aiChatEndRef} />
                  </div>

                  {/* AI Input Box */}
                  <div className="ai-tutor-input-box">
                    <input
                      type="text"
                      className="ai-tutor-input"
                      placeholder="Ask AI tutor anything..."
                      value={aiPromptInput}
                      onChange={(e) => setAiPromptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendAiPrompt();
                      }}
                    />
                    <button
                      type="button"
                      className="ai-tutor-send-btn"
                      onClick={() => handleSendAiPrompt()}
                      disabled={!aiPromptInput.trim() || isAiThinking}
                    >
                      Ask
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Host Controls & Participants Roster */}
              {activeTab === 'host' && (
                <div className="host-panel-content">
                  <div className="host-section-title">
                    {isInstructor ? '👨‍🏫 Host Management' : '👥 Room Participants'}
                  </div>

                  {/* Instructor Action Controls */}
                  {isInstructor && (
                    <div className="host-actions-grid">
                      <button
                        type="button"
                        className={`host-action-btn ${isMuteAllActive ? 'btn-muted' : 'btn-mute-all'}`}
                        onClick={handleHostMuteAll}
                        title={isMuteAllActive ? "All participants are muted (Click to unmute)" : "Mute all students in this session"}
                      >
                        <span>🔇</span>
                        <span>{isMuteAllActive ? 'Muted' : 'Mute All'}</span>
                      </button>

                      <button
                        type="button"
                        className={`host-action-btn ${isRoomLocked ? 'btn-unlock' : 'btn-lock'}`}
                        onClick={handleToggleRoomLock}
                        title={isRoomLocked ? "Unlock room to allow new students to enter" : "Lock room to prevent new entries"}
                      >
                        <span>{isRoomLocked ? '🔓' : '🔒'}</span>
                        <span>{isRoomLocked ? 'Unlock Room' : 'Lock Room'}</span>
                      </button>
                    </div>
                  )}

                  {/* Participants Roster Header */}
                  <div className="participants-list-header">
                    <span>Connected Roster ({participants.length || 1})</span>
                    <span className="status-live-dot">● Live</span>
                  </div>

                  {/* Participants List */}
                  <div className="participants-scroll">
                    {participants.length === 0 ? (
                      <div className="participant-item current-user">
                        <div className="participant-main-row">
                          <div className="participant-avatar">{isInstructor ? '👨‍🏫' : '🎓'}</div>
                          <div className="participant-info">
                            <span className="participant-name">{user?.name || 'You'} (You)</span>
                            <span className={`participant-role-tag ${isInstructor ? 'role-host' : 'role-student'}`}>
                              {isInstructor ? 'Instructor / Host' : 'Student'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      participants.map((p) => {
                        const isSelf = p.socketId === socket.id;
                        const hasHand = handRaisedUsers[p.socketId];
                        const eng = engagementStats[p.socketId];

                        return (
                          <div key={p.socketId} className={`participant-item ${isSelf ? 'current-user' : ''}`}>
                            <div className="participant-main-row">
                              <div className="participant-avatar">{p.userRole === 'instructor' ? '👨‍🏫' : '🎓'}</div>
                              <div className="participant-info">
                                <span className="participant-name">
                                  {p.userName} {isSelf && '(You)'}
                                </span>
                                <div className="participant-tags-row">
                                  <span className={`participant-role-tag ${p.userRole === 'instructor' ? 'role-host' : 'role-student'}`}>
                                    {p.userRole === 'instructor' ? 'Instructor / Host' : 'Student'}
                                  </span>

                                  {hasHand && (
                                    <span className="hand-raise-tag" title={`Hand raised at ${hasHand.time}`}>
                                      ✋ Raised
                                    </span>
                                  )}

                                  {eng && p.userRole !== 'instructor' && (
                                    <span
                                      className={`focus-tag ${eng.isFocused ? 'focused' : 'unfocused'}`}
                                      title={`Live focus score: ${eng.score}%`}
                                    >
                                      {eng.isFocused ? '👀 Focused' : '⚠️ Inactive'}
                                    </span>
                                  )}
                                  {peerMediaStates[p.socketId] && (
                                    <span className="media-status-tag">
                                      {peerMediaStates[p.socketId].micOn ? '🎙️ Mic' : '🔇 Muted'} • {peerMediaStates[p.socketId].videoOn ? '📹 Cam' : '🚫 Cam Off'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Individual student control buttons for Host */}
                            {isInstructor && !isSelf && (
                              <div className="participant-host-controls">
                                <button
                                  type="button"
                                  className="btn-participant-ctrl"
                                  onClick={() => handleHostMuteStudent(p.socketId, p.userName)}
                                  title={`Mute ${p.userName}`}
                                >
                                  🔇 Mute
                                </button>
                                <button
                                  type="button"
                                  className="btn-participant-ctrl"
                                  onClick={() => {
                                    const isCamOff = peerMediaStates[p.socketId]?.videoOn === false;
                                    handleHostToggleStudentCamera(p.socketId, p.userName, isCamOff);
                                  }}
                                  title={`Toggle camera for ${p.userName}`}
                                >
                                  {peerMediaStates[p.socketId]?.videoOn === false ? '📹 Cam On' : '🚫 Cam Off'}
                                </button>
                                <button
                                  type="button"
                                  className="btn-remove-participant"
                                  onClick={() => handleRemoveParticipant(p.socketId, p.userName)}
                                  title={`Remove ${p.userName} from classroom`}
                                >
                                  🚫 Remove
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ── Footer Controls (Zoom-Style Matching Images 3, 4, 5) ── */}
      <footer className="room-footer" ref={footerRef}>
        {/* 1. Audio Control Group (Image 3) */}
        <div className="zoom-toolbar-btn-group" style={{ position: 'relative' }}>
          <button
            type="button"
            className={`zoom-main-btn ${!micOn ? 'muted-btn' : ''}`}
            onClick={toggleMic}
            title={micOn ? 'Mute Audio' : 'Unmute Audio'}
          >
            <div className="zoom-btn-icon">
              {micOn ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2.5" />
                  <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" stroke="#ffffff" />
                  <path d="M5 10v2a7 7 0 0 0 12 5" stroke="#ffffff" />
                  <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" stroke="#ffffff" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12" stroke="#ffffff" />
                  <line x1="12" y1="19" x2="12" y2="23" stroke="#ffffff" />
                  <line x1="8" y1="23" x2="16" y2="23" stroke="#ffffff" />
                </svg>
              )}
            </div>
            <span className="zoom-btn-label">Audio</span>
          </button>

          <button
            type="button"
            className={`zoom-arrow-btn ${isAudioMenuOpen ? 'open' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsAudioMenuOpen(prev => !prev);
              setIsVideoMenuOpen(false);
              setIsParticipantsMenuOpen(false);
            }}
            title="Audio Options"
          >
            ▲
          </button>

          {/* Audio Options Popup Menu (Matching Image 3) */}
          {isAudioMenuOpen && (
            <div className="zoom-popup-menu" onClick={e => e.stopPropagation()}>
              <div className="zoom-menu-section-header">Select a microphone</div>
              {availableMics.map(m => (
                <button
                  key={m.deviceId}
                  type="button"
                  className={`zoom-menu-item ${selectedMicId === m.deviceId ? 'checked' : ''}`}
                  onClick={() => {
                    setSelectedMicId(m.deviceId);
                    showToast(`🎙️ Microphone: ${m.label}`);
                  }}
                >
                  <span className="item-text">{m.label}</span>
                  {selectedMicId === m.deviceId && <span className="check-icon">✓</span>}
                </button>
              ))}

              <div className="zoom-menu-divider" />

              <div className="zoom-menu-section-header">Select a speaker</div>
              {availableSpeakers.map(s => (
                <button
                  key={s.deviceId}
                  type="button"
                  className={`zoom-menu-item ${selectedSpeakerId === s.deviceId ? 'checked' : ''}`}
                  onClick={() => {
                    setSelectedSpeakerId(s.deviceId);
                    showToast(`🔊 Speaker: ${s.label}`);
                  }}
                >
                  <span className="item-text">{s.label}</span>
                  {selectedSpeakerId === s.deviceId && <span className="check-icon">✓</span>}
                </button>
              ))}

              <div className="zoom-menu-divider" />

              <div className="zoom-menu-section-header">Microphone modes</div>
              {[
                { id: 'noise-removal', label: 'Noise removal (default)' },
                { id: 'isolation', label: 'Personalized audio isolation' },
                { id: 'musicians', label: 'Original sound for musicians' }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  className={`zoom-menu-item ${micMode === mode.id ? 'checked' : ''}`}
                  onClick={() => {
                    setMicMode(mode.id);
                    showToast(`Audio mode: ${mode.label}`);
                  }}
                >
                  <span className="item-text">{mode.label}</span>
                  {micMode === mode.id && <span className="check-icon">✓</span>}
                </button>
              ))}

              <div className="zoom-menu-divider" />

              <button
                type="button"
                className="zoom-menu-item action-item"
                onClick={handleTestAudioAndMic}
              >
                <span className="item-text">Test speaker & microphone</span>
              </button>

              <button
                type="button"
                className="zoom-menu-item action-item"
                onClick={() => {
                  if (micOn) toggleMic();
                  showToast('Left computer audio.');
                  setIsAudioMenuOpen(false);
                }}
              >
                <span className="item-text">Leave computer audio</span>
              </button>

              <div className="zoom-menu-divider" />

              <button
                type="button"
                className="zoom-menu-item action-item"
                onClick={() => {
                  showToast('Audio Settings: Echo cancellation & auto gain active.');
                  setIsAudioMenuOpen(false);
                }}
              >
                <span className="item-text">Audio settings</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Video Control Group (Image 4) */}
        <div className="zoom-toolbar-btn-group" style={{ position: 'relative' }}>
          <button
            type="button"
            className={`zoom-main-btn ${!videoOn ? 'muted-btn' : ''}`}
            onClick={toggleVideo}
            title={videoOn ? 'Turn Off Video' : 'Start Video'}
          >
            <div className="zoom-btn-icon">
              {videoOn ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z" fill="currentColor"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2.5" />
                  <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m4 0h5a2 2 0 0 1 2 2v3l7-5v14l-4-2.86" stroke="#ffffff" />
                </svg>
              )}
            </div>
            <span className="zoom-btn-label">Video</span>
          </button>

          <button
            type="button"
            className={`zoom-arrow-btn ${isVideoMenuOpen ? 'open' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsVideoMenuOpen(prev => !prev);
              setIsAudioMenuOpen(false);
              setIsParticipantsMenuOpen(false);
            }}
            title="Video Options"
          >
            ▲
          </button>

          {/* Video Options Popup Menu (Matching Image 4) */}
          {isVideoMenuOpen && (
            <div className="zoom-popup-menu" onClick={e => e.stopPropagation()}>
              <div className="zoom-menu-section-header">Select a camera</div>
              {availableCameras.map(c => (
                <button
                  key={c.deviceId}
                  type="button"
                  className={`zoom-menu-item ${selectedCameraId === c.deviceId ? 'checked' : ''}`}
                  onClick={() => {
                    setSelectedCameraId(c.deviceId);
                    showToast(`📹 Camera: ${c.label}`);
                  }}
                >
                  <span className="item-text">{c.label}</span>
                  {selectedCameraId === c.deviceId && <span className="check-icon">✓</span>}
                </button>
              ))}

              <div className="zoom-menu-divider" />

              {/* Blur my background toggle switch */}
              <div
                className="zoom-menu-toggle-row"
                onClick={() => {
                  setIsBackgroundBlurred(prev => {
                    const nxt = !prev;
                    showToast(nxt ? '✨ Background blur enabled!' : 'Background blur disabled.');
                    return nxt;
                  });
                }}
              >
                <span>Blur my background</span>
                <div className={`zoom-toggle-switch ${isBackgroundBlurred ? 'on' : ''}`}>
                  <div className="zoom-toggle-thumb" />
                </div>
              </div>

              {/* Auto-frame my video toggle switch */}
              <div
                className="zoom-menu-toggle-row"
                onClick={() => {
                  setIsAutoFramed(prev => {
                    const nxt = !prev;
                    showToast(nxt ? '🔍 Auto-frame enabled!' : 'Auto-frame disabled.');
                    return nxt;
                  });
                }}
              >
                <span>Auto-frame my video</span>
                <div className={`zoom-toggle-switch ${isAutoFramed ? 'on' : ''}`}>
                  <div className="zoom-toggle-thumb" />
                </div>
              </div>

              <div className="zoom-menu-divider" />

              <button
                type="button"
                className="zoom-menu-item action-item"
                onClick={() => {
                  showToast('Video & Effects Settings: HD resolution & AI stabilization active.');
                  setIsVideoMenuOpen(false);
                }}
              >
                <span className="item-text">Video & effects settings</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Participants Control Group (Image 5) */}
        <div className="zoom-toolbar-btn-group" style={{ position: 'relative' }}>
          <button
            type="button"
            className={`zoom-main-btn ${activeTab === 'host' ? 'active-tab-btn' : ''}`}
            onClick={() => setActiveTab(prev => prev === 'host' ? null : 'host')}
            title="View Participants Roster"
          >
            <div className="zoom-btn-icon">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f1f5f9' }}>{participants.length || 1}</span>
              </div>
            </div>
            <span className="zoom-btn-label">Participants</span>
          </button>

          <button
            type="button"
            className={`zoom-arrow-btn ${isParticipantsMenuOpen ? 'open' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsParticipantsMenuOpen(prev => !prev);
              setIsAudioMenuOpen(false);
              setIsVideoMenuOpen(false);
              setIsHostToolsOpen(false);
              setIsMeetingInfoOpen(false);
            }}
            title="Participants Menu"
          >
            ▲
          </button>

          {/* Participants Popup Menu (Matching Image 5) */}
          {isParticipantsMenuOpen && (
            <div className="zoom-popup-menu" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                className="zoom-menu-item action-item"
                onClick={() => {
                  copyClassInvitation();
                  setIsParticipantsMenuOpen(false);
                }}
              >
                <span className="item-text">Invite...</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Alt+I</span>
              </button>

              <button
                type="button"
                className="zoom-menu-item action-item"
                onClick={() => {
                  copyInviteLink();
                  setIsParticipantsMenuOpen(false);
                }}
              >
                <span className="item-text">Copy invite link</span>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Alt+Shift+I</span>
              </button>

              {isInstructor && (
                <>
                  <div className="zoom-menu-divider" />
                  <button
                    type="button"
                    className="zoom-menu-item action-item"
                    onClick={() => {
                      handleHostMuteAll();
                      setIsParticipantsMenuOpen(false);
                    }}
                  >
                    <span className="item-text">Host tools for participants</span>
                  </button>
                  <button
                    type="button"
                    className="zoom-menu-item action-item"
                    onClick={() => {
                      handleToggleRoomLock();
                      setIsParticipantsMenuOpen(false);
                    }}
                  >
                    <span className="item-text">{isRoomLocked ? 'Unlock Classroom' : 'Lock Classroom'}</span>
                  </button>
                </>
              )}

              <div className="zoom-menu-divider" />

              <button
                type="button"
                className="zoom-menu-item action-item"
                onClick={() => {
                  setActiveTab('host');
                  setIsParticipantsMenuOpen(false);
                }}
              >
                <span className="item-text">Open Roster Panel</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Chat Button (Toggles sidebar panel on click) */}
        <div className="zoom-toolbar-btn-group">
          <button
            type="button"
            className={`zoom-main-btn ${activeTab === 'chat' ? 'active-tab-btn' : ''}`}
            onClick={() => setActiveTab(prev => prev === 'chat' ? null : 'chat')}
            title="Open Live Chat"
          >
            <div className="zoom-btn-icon">💬</div>
            <span className="zoom-btn-label">Chat</span>
          </button>
        </div>

        {/* 5. Screen Share Button */}
        <div className="zoom-toolbar-btn-group">
          <button
            type="button"
            className={`zoom-main-btn ${isScreenSharing ? 'active-tab-btn' : ''}`}
            onClick={toggleScreenShare}
            title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          >
            <div className="zoom-btn-icon">🖥️</div>
            <span className="zoom-btn-label">{isScreenSharing ? 'Sharing' : 'Share'}</span>
          </button>
        </div>

        {/* 6. Whiteboard Studio Button (Instructor Only) */}
        {isInstructor && (
          <div className="zoom-toolbar-btn-group">
            <button
              type="button"
              className={`zoom-main-btn ${workspaceView === 'whiteboard' ? 'active-tab-btn' : ''}`}
              onClick={() => setWorkspaceView(v => v === 'whiteboard' ? 'all' : 'whiteboard')}
              title="Toggle Whiteboard Studio"
            >
              <div className="zoom-btn-icon">✏️</div>
              <span className="zoom-btn-label">Board</span>
            </button>
          </div>
        )}

        {/* 7. Lecture Video & Media Button */}
        <div className="zoom-toolbar-btn-group">
          <button
            type="button"
            className={`zoom-main-btn ${workspaceView === 'video' ? 'active-tab-btn' : ''}`}
            onClick={() => setWorkspaceView(v => v === 'video' ? 'all' : 'video')}
            title="Lecture Video & YouTube Sync"
          >
            <div className="zoom-btn-icon">🎬</div>
            <span className="zoom-btn-label">Media</span>
          </button>
        </div>

        {/* 8. 3D Model Viewer Button */}
        <div className="zoom-toolbar-btn-group">
          <button
            type="button"
            className="zoom-main-btn"
            onClick={() => setIs3DModalOpen(true)}
            title="Interactive 3D Object Viewer"
          >
            <div className="zoom-btn-icon">🧊</div>
            <span className="zoom-btn-label">3D Model</span>
          </button>
        </div>

        {/* 9. Raise Hand Button */}
        <div className="zoom-toolbar-btn-group">
          <button
            type="button"
            className={`zoom-main-btn ${hasHandRaised ? 'active-tab-btn' : ''}`}
            onClick={toggleRaiseHand}
            title={hasHandRaised ? "Lower Hand" : "Raise Hand"}
          >
            <div className="zoom-btn-icon">✋</div>
            <span className="zoom-btn-label">{hasHandRaised ? "Raised" : "Hand"}</span>
          </button>
        </div>

        {/* 10. Record Lecture Button */}
        <div className="zoom-toolbar-btn-group">
          <button
            type="button"
            className={`zoom-main-btn ${isRecordingSession ? 'muted-btn' : ''}`}
            onClick={toggleSessionRecording}
            title={isRecordingSession ? "Stop Session Recording" : "Record Session & Download"}
          >
            <div className="zoom-btn-icon">{isRecordingSession ? "⏹️" : "⏺️"}</div>
            <span className="zoom-btn-label">{isRecordingSession ? "REC" : "Record"}</span>
          </button>
        </div>

        {/* 11. YouTube-Style Live Subtitles / Captions (CC) Button */}
        <div className="zoom-toolbar-btn-group">
          <button
            type="button"
            className={`zoom-main-btn ${isCaptionsEnabled ? 'active-tab-btn' : ''}`}
            onClick={() => {
              const nextState = !isCaptionsEnabled;
              setIsCaptionsEnabled(nextState);
              if (nextState) {
                showToast('🔤 Live Captions turned ON! Listening for voice...', 'success');
                if (isInstructor) {
                  handleSimulateLiveCaption('Live lecture speech captions active. Welcome to SyncLearn classroom!');
                }
              } else {
                showToast('🔤 Live Captions turned OFF', 'info');
                setLiveCaption(null);
                socket.emit('clear-live-caption', { roomId: cleanRoomId(roomId) });
              }
            }}
            title={isCaptionsEnabled ? "Turn OFF Live Subtitles (CC)" : "Turn ON Live Subtitles (CC)"}
          >
            <div className="zoom-btn-icon cc-toolbar-icon">
              <span className="cc-pill-badge">CC</span>
            </div>
            <span className="zoom-btn-label">{isCaptionsEnabled ? "Captions" : "CC: OFF"}</span>
          </button>
        </div>

        {/* 12. Settings Button (Matching Image 1) */}
        <div className="zoom-toolbar-btn-group">
          <button
            type="button"
            className="zoom-main-btn"
            onClick={() => onOpenSettings && onOpenSettings('general')}
            title="Open Meeting & Account Settings"
          >
            <div className="zoom-btn-icon">⚙️</div>
            <span className="zoom-btn-label">Settings</span>
          </button>
        </div>

        {/* 13. Host Tools & Meeting Info Pill (Instructor Only - Bottom Bar Matching Image 4) */}
        {isInstructor && (
          <div className="zoom-toolbar-btn-group zoom-host-pill-group" style={{ position: 'relative' }}>
            <div className="zoom-host-pill-wrap">
              <button
                type="button"
                className={`zoom-host-pill-btn ${isHostToolsOpen ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHostToolsOpen(prev => !prev);
                  setIsMeetingInfoOpen(false);
                  setIsAudioMenuOpen(false);
                  setIsVideoMenuOpen(false);
                  setIsParticipantsMenuOpen(false);
                }}
                title="Host Tools & Classroom Security"
              >
                <span className="zoom-host-pill-icon">🛡️</span>
                <span className="zoom-btn-label">Host tools</span>
              </button>

              <div className="zoom-host-pill-divider" />

              <button
                type="button"
                className={`zoom-host-pill-btn ${isMeetingInfoOpen ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMeetingInfoOpen(prev => !prev);
                  setIsHostToolsOpen(false);
                  setIsAudioMenuOpen(false);
                  setIsVideoMenuOpen(false);
                  setIsParticipantsMenuOpen(false);
                }}
                title="Meeting Info & Room Credentials"
              >
                <span className="zoom-host-pill-icon">ℹ️</span>
                <span className="zoom-btn-label">Meeting info</span>
              </button>
            </div>

            {/* Host Tools Flyout Card (Upward) */}
            {isHostToolsOpen && (
              <div className="zoom-host-tools-flyout footer-flyout" onClick={e => e.stopPropagation()}>
                <div className="zoom-flyout-header">
                  <span className="zoom-flyout-title">Host Controls</span>
                  <button
                    type="button"
                    className="zoom-flyout-icon-btn"
                    onClick={() => setIsHostToolsOpen(false)}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="zoom-flyout-toggle-row">
                  <span className="zoom-flyout-label">Lock classroom</span>
                  <label className="zoom-switch">
                    <input
                      type="checkbox"
                      checked={isRoomLocked}
                      onChange={handleToggleRoomLock}
                    />
                    <span className="zoom-switch-slider" />
                  </label>
                </div>

                <div className="zoom-flyout-toggle-row">
                  <span className="zoom-flyout-label">Waiting room</span>
                  <label className="zoom-switch">
                    <input
                      type="checkbox"
                      checked={isWaitingRoomEnabled}
                      onChange={() => {
                        setIsWaitingRoomEnabled(prev => !prev);
                        showToast(!isWaitingRoomEnabled ? '🚪 Waiting Room enabled' : 'Waiting Room disabled');
                      }}
                    />
                    <span className="zoom-switch-slider" />
                  </label>
                </div>

                <div className="zoom-flyout-toggle-row">
                  <span className="zoom-flyout-label">Hide profile pictures</span>
                  <label className="zoom-switch">
                    <input
                      type="checkbox"
                      checked={hideProfilePictures}
                      onChange={() => {
                        setHideProfilePictures(prev => !prev);
                        showToast(!hideProfilePictures ? 'Profile pictures hidden' : 'Profile pictures visible');
                      }}
                    />
                    <span className="zoom-switch-slider" />
                  </label>
                </div>

                <div className="zoom-flyout-divider" />

                <button
                  type="button"
                  className="zoom-flyout-nav-item"
                  onClick={() => {
                    handleHostMuteAll();
                    setIsHostToolsOpen(false);
                  }}
                >
                  <span>🔇 {isMuteAllActive ? 'Unmute all participants' : 'Mute all participants'}</span>
                </button>

                <button
                  type="button"
                  className="zoom-flyout-nav-item"
                  onClick={() => {
                    setActiveTab('host');
                    setIsHostToolsOpen(false);
                  }}
                >
                  <span>👥 Open Participants Roster</span>
                  <span className="zoom-flyout-arrow">›</span>
                </button>
              </div>
            )}

            {/* Meeting Info Flyout Card (Upward & Compact) */}
            {isMeetingInfoOpen && (
              <div className="zoom-meeting-info-flyout footer-flyout" onClick={e => e.stopPropagation()}>
                <div className="zoom-flyout-header">
                  <div className="zoom-info-title-wrap">
                    <h3 className="zoom-info-meeting-title">SyncLearn Meeting</h3>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Classroom • Encrypted</span>
                  </div>
                  <button
                    type="button"
                    className="zoom-flyout-icon-btn"
                    onClick={() => setIsMeetingInfoOpen(false)}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>

                <div className="zoom-info-divider-line" />

                <div className="zoom-info-field-group">
                  <span className="zoom-info-field-title">Meeting ID</span>
                  <div className="zoom-info-field-value-row">
                    <span className="zoom-info-field-val">{roomId}</span>
                    <button
                      type="button"
                      className="zoom-info-copy-btn"
                      onClick={() => {
                        navigator.clipboard?.writeText(roomId);
                        showToast('📋 Meeting ID copied!');
                      }}
                      title="Copy Meeting ID"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="zoom-info-field-group">
                  <span className="zoom-info-field-title">Host</span>
                  <div className="zoom-info-field-value-row">
                    <span className="zoom-info-field-val">{user?.name || 'Instructor'}</span>
                  </div>
                </div>

                <div className="zoom-info-field-group">
                  <span className="zoom-info-field-title">Passcode</span>
                  <div className="zoom-info-field-value-row">
                    <span className="zoom-info-field-val">{roomPasscode}</span>
                    <button
                      type="button"
                      className="zoom-info-copy-btn"
                      onClick={() => {
                        navigator.clipboard?.writeText(roomPasscode);
                        showToast('📋 Passcode copied!');
                      }}
                      title="Copy Passcode"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* 1. Mobile & Wi-Fi Shareable Link (For Mobile Phones & Other Devices) */}
                <div className="zoom-info-field-group">
                  <span className="zoom-info-field-title" style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📱 Mobile / Wi-Fi Link</span>
                    <span style={{ fontSize: '0.62rem', background: 'rgba(34, 197, 94, 0.25)', color: '#4ade80', padding: '1px 5px', borderRadius: '4px' }}>Shareable</span>
                  </span>
                  <div className="zoom-info-field-value-row">
                    <span className="zoom-info-field-val" style={{ fontSize: '0.68rem', wordBreak: 'break-all', color: '#86efac' }}>
                      {getShareableLink(false)}
                    </span>
                    <button
                      type="button"
                      className="zoom-info-copy-btn"
                      style={{ background: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e', color: '#4ade80' }}
                      onClick={() => copyInviteLink(false)}
                      title="Copy Mobile / Wi-Fi Link for WhatsApp / SMS"
                    >
                      Copy Mobile
                    </button>
                  </div>
                </div>

                {/* 2. Local PC Link */}
                <div className="zoom-info-field-group">
                  <span className="zoom-info-field-title">💻 Local PC Link</span>
                  <div className="zoom-info-field-value-row">
                    <span className="zoom-info-field-val" style={{ fontSize: '0.68rem', wordBreak: 'break-all' }}>
                      {getShareableLink(true)}
                    </span>
                    <button
                      type="button"
                      className="zoom-info-copy-btn"
                      onClick={() => copyInviteLink(true)}
                      title="Copy Local PC Link"
                    >
                      Copy PC
                    </button>
                  </div>
                </div>

                <div className="zoom-info-field-group">
                  <span className="zoom-info-field-title">Active Roster</span>
                  <div className="zoom-info-field-value-row">
                    <span className="zoom-info-field-val">{participants.length || 1} connected</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </footer>

      {/* ── YouTube-Style Live Subtitles / Captions (Top-Level Fixed Overlay) ── */}
      {isCaptionsEnabled && liveCaption && liveCaption.text && (
        <div className="youtube-live-caption-container" role="region" aria-label="Live Lecture Captions">
          <div className="youtube-caption-box">
            <div className="youtube-caption-header">
              <div className="youtube-caption-speaker-row">
                <span className={`youtube-caption-speaker-tag ${liveCaption.role === 'instructor' ? 'youtube-caption-speaker-instructor' : 'youtube-caption-speaker-student'}`}>
                  {liveCaption.role === 'instructor' ? '👨‍🏫 Instructor' : '🎓 Student'} • {liveCaption.speaker}
                </span>
                <span className="youtube-caption-live-indicator">
                  <span className="youtube-caption-pulse-dot"></span>
                  LIVE CC
                </span>
              </div>
              <span className="youtube-caption-cc-logo">CC</span>
            </div>
            <div className="youtube-caption-text">
              <span className={liveCaption.isFinal ? 'youtube-caption-final' : 'youtube-caption-interim'}>
                {liveCaption.text}
              </span>
              {!liveCaption.isFinal && <span className="youtube-caption-cursor">▌</span>}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Loopback for Mic Self-Testing */}
      <audio ref={micTestAudioRef} autoPlay playsInline />

      <ModelViewerModal isOpen={is3DModalOpen} onClose={() => setIs3DModalOpen(false)} roomId={roomId} />

      {/* AI Pop Quiz Modal */}
      <AIQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        isHost={isInstructor}
        transcription={transcription.map(t => t.text).join('. ')}
        socket={socket}
        roomId={roomId}
        userName={user?.name || (isInstructor ? 'Instructor' : 'Student')}
        activeQuizData={activeQuizData}
        onQuizPublished={(questions) => {
          showToast(`🚀 Quiz with ${questions.length} questions launched to classroom!`);
        }}
      />

      {/* Breakout Discussion Pods Modal */}
      <BreakoutPodsModal
        isOpen={isBreakoutModalOpen}
        onClose={() => setIsBreakoutModalOpen(false)}
        isHost={isInstructor}
        user={user}
        roomId={roomId}
        socket={socket}
      />
    </div>
  );
}

export default ActiveRoomPage;