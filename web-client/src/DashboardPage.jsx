import React, { useState, useRef, useEffect } from 'react';
import './DashboardPage.css';
import logoImg from './assets/logo.png';

// ─── Zoom Meeting Helpers ──────────────────────────────────────────────────
const generateZoomMeetingId = () => {
  const p1 = Math.floor(100 + Math.random() * 900);
  const p2 = Math.floor(100 + Math.random() * 900);
  const p3 = Math.floor(100 + Math.random() * 900);
  return `${p1}-${p2}-${p3}`;
};

const getShareableHost = () => {
  if (typeof window === 'undefined') return '10.216.84.64';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '10.216.84.64';
  }
  return window.location.hostname;
};

const buildZoomInvitationText = (topic, roomId, instructorName) => {
  const host = getShareableHost();
  const port = window.location.port || '5173';
  const joinUrl = `${window.location.protocol}//${host}:${port}?room=${encodeURIComponent(roomId)}`;
  const displayId = roomId ? roomId.replace(/-/g, ' ') : '';
  const nowStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return `🎓 SyncLearn Live Classroom Invitation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍🏫 Instructor: ${instructorName || 'Teacher'}
📚 Topic: ${topic || 'Live Interactive Class Session'}
📅 Date: ${nowStr} (Live In Session)

🔗 Join Live Class (Mobile & PC):
${joinUrl}

🆔 Meeting ID: ${displayId}
🔐 Passcode: Direct Verified Access (No password required)

💡 Student Guidelines:
1. Click the link above or open SyncLearn and enter Meeting ID: ${displayId}
2. Please join 5 minutes early with your camera and microphone enabled.
3. Access real-time dual whiteboard, lecture typing pad, and AI quizzes.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
};

// ─── Zoom-Style Invitation Preview Modal ─────────────────────────────────────
function ClassInviteModal({
  isOpen,
  onClose,
  topic,
  roomId,
  instructorName,
  onCopyInvite,
  onCopyLink,
  onShareWhatsApp,
  onShareEmail
}) {
  if (!isOpen) return null;
  const displayId = roomId ? roomId.replace(/-/g, ' ') : '';
  const joinUrl = `${window.location.origin}?room=${encodeURIComponent(roomId)}`;

  return (
    <div className="invite-modal-overlay" onClick={onClose}>
      <div className="invite-modal-card" onClick={e => e.stopPropagation()}>
        <div className="invite-modal-header">
          <div className="invite-modal-header-left">
            <span className="invite-brand-icon">🎓</span>
            <div>
              <h3>Classroom Meeting Invitation</h3>
              <p>Ready to share with students via WhatsApp, Slack, or Email before class</p>
            </div>
          </div>
          <button type="button" className="invite-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <div className="invite-card-preview">
          <div className="preview-top-badge">
            <span className="pulse-dot">●</span> SyncLearn Virtual Classroom
          </div>
          <h4 className="preview-topic">{topic || 'Live Interactive Class Session'}</h4>
          <div className="preview-meta-row">
            <span>👨‍🏫 Host: <strong>{instructorName || 'Instructor'}</strong></span>
            <span className="preview-live-pill">🟢 Live Session</span>
          </div>

          <div className="preview-box">
            <div className="preview-box-row">
              <span className="preview-box-label">🆔 Meeting ID:</span>
              <span className="preview-box-val">{displayId}</span>
            </div>
            <div className="preview-box-row">
              <span className="preview-box-label">🔗 Direct URL:</span>
              <span className="preview-box-url">{joinUrl}</span>
            </div>
            <div className="preview-box-row">
              <span className="preview-box-label">🔐 Security:</span>
              <span className="preview-box-val" style={{ color: '#4ade80' }}>Direct Verified Access</span>
            </div>
          </div>
        </div>

        <div className="invite-modal-actions">
          <button type="button" className="dash-btn dash-primary-btn" onClick={onCopyInvite}>
            📋 Copy Class Invitation
          </button>
          <button type="button" className="dash-btn dash-secondary-btn" onClick={onCopyLink}>
            🔗 Copy Direct Link Only
          </button>
          <button type="button" className="dash-btn dash-whatsapp-btn" onClick={onShareWhatsApp}>
            💬 Share to WhatsApp
          </button>
          <button type="button" className="dash-btn dash-email-btn" onClick={onShareEmail}>
            ✉️ Email to Students
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Instructor Dashboard ─────────────────────────────────────────────────────
function InstructorDashboard({
  user,
  createdRoomId,
  setCreatedRoomId,
  meetingTopic,
  setMeetingTopic,
  handleCreateRoom,
  handleRegenerateCode,
  handleCopyCreatedCode,
  handleCopyCreatedInvite,
  handleCopyZoomInvitation,
  handleShareWhatsApp,
  handleShareEmail,
  onOpenInviteModal,
  handleCopyHistoryLink,
  onJoinRoom,
  onOpenSettings,
  completedSessions = []
}) {
  const sessionCount = completedSessions.length;
  const totalStudentsTaught = completedSessions.reduce((acc, curr) => acc + (curr.students || 1), 0);

  return (
    <>
      <div className="role-welcome-banner instructor-banner">
        <div
          className="role-banner-avatar-wrap"
          onClick={() => onOpenSettings && onOpenSettings('account')}
          title="Click to view & change profile picture"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="role-banner-avatar-img" />
          ) : (
            <div className="role-banner-avatar-circle">
              {(user?.name || 'I').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="role-banner-avatar-edit-badge" title="Change Photo">📷</span>
        </div>
        <div>
          <h2>{user?.name || 'Instructor'}</h2>
          <p>You are logged in as <span className="role-chip role-instructor">Instructor</span> — manage live sessions, track students, and conduct interactive classes.</p>
        </div>
      </div>

      <div className="role-stats-row">
        {[
          { icon: '📚', value: sessionCount > 0 ? 1 : 0, label: 'Active Live Room' },
          { icon: '👥', value: totalStudentsTaught, label: 'Students Connected' },
          { icon: '🎙️', value: sessionCount, label: 'Classes Completed' },
          { icon: '📊', value: sessionCount > 0 ? '98%' : '0%', label: 'Attendance Rate' },
        ].map((s, i) => (
          <div className="role-stat-card" key={i}>
            <span className="stat-icon">{s.icon}</span>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="role-section-title">🚀 Launch a Live Session</div>
      <div className="action-card instructor-card zoom-class-card">
        <div className="zoom-card-top-bar">
          <span className="card-badge badge-purple">👨‍🏫 Instructor Classroom Hub</span>
          <span className="zoom-live-badge">
            <span className="pulse-dot">●</span> Ready to Host
          </span>
        </div>

        <div className="zoom-card-heading-wrap">
          <h2>Create & Schedule Live Classroom</h2>
          <p>Customize your lecture topic, generate a secure 9-digit meeting ID, and broadcast the invite link to students before class.</p>
        </div>

        {/* Meeting Topic Input */}
        <div className="meeting-form-group">
          <label className="room-code-label">📚 Class Topic / Lecture Title:</label>
          <input
            type="text"
            className="dash-input topic-input"
            value={meetingTopic}
            onChange={(e) => setMeetingTopic(e.target.value)}
            placeholder="e.g. CS101: Web Engineering & Interactive Whiteboard"
          />
        </div>

        {/* Meeting ID Input & Generation */}
        <div className="room-create-box">
          <label className="room-code-label">🆔 Class Meeting ID / Room Code:</label>
          <div className="room-code-input-row">
            <div className="zoom-id-display">
              <span className="zoom-id-hash">#</span>
              <input
                type="text"
                value={createdRoomId}
                onChange={(e) => setCreatedRoomId(e.target.value)}
                className="dash-input zoom-code-input"
                placeholder="e.g. 849-291-034"
              />
            </div>
            <button type="button" className="code-action-btn" onClick={handleRegenerateCode} title="Generate new 9-digit Meeting ID">🎲 New ID</button>
            <button type="button" className="code-action-btn" onClick={handleCopyCreatedCode} title="Copy Meeting ID only">📋 Copy ID</button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="zoom-action-buttons-row">
          <button type="button" className="dash-btn dash-primary-btn launch-btn" onClick={handleCreateRoom}>
            🚀 Launch Classroom
          </button>
          <button type="button" className="dash-btn dash-zoom-btn" onClick={handleCopyZoomInvitation} title="Copy complete class invitation formatted for WhatsApp & Email">
            📋 Copy Class Invitation
          </button>
          <button type="button" className="dash-btn dash-whatsapp-btn" onClick={handleShareWhatsApp} title="Share directly to WhatsApp group">
            💬 WhatsApp
          </button>
          <button type="button" className="dash-btn dash-email-btn" onClick={handleShareEmail} title="Email invitation to students">
            ✉️ Email
          </button>
        </div>
      </div>

      <div className="role-section-title">⚙️ Instructor Tools</div>
      <div className="instructor-features-grid">
        {['✏️ Whiteboard Control','🎙️ AI Live Notes','🖥️ Screen Share','📍 Doubt Pinning','🔇 Mute Students','📊 Analytics','🎬 Video Sync','💬 Live Chat'].map(f => (
          <div className="feature-pill" key={f}>{f}</div>
        ))}
      </div>

      <div className="role-section-title">🕐 Completed Live Sessions ({sessionCount})</div>
      <div className="history-section">
        {sessionCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.75rem', color: '#64748b', fontSize: '0.88rem' }}>
            No sessions completed yet. Launch a room above to conduct your first online class!
          </div>
        ) : (
          <div className="history-list">
            {completedSessions.map(s => (
              <div className="history-item" key={s.code}>
                <div className="history-info">
                  <h4>{s.title}</h4>
                  <p>Room: <code>{s.code}</code> • {s.date} ({s.time || ''}) • <span style={{fontSize:'0.75rem',borderRadius:'99px',padding:'2px 8px',background:'rgba(34,197,94,0.12)',color:'#4ade80'}}>👥 {s.students} participants</span></p>
                </div>
                <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
                  <button type="button" className="room-copy-btn" onClick={() => handleCopyHistoryLink(s.code)}>🔗 Copy Link</button>
                  <button type="button" className="rejoin-btn" onClick={() => onJoinRoom && onJoinRoom(s.code)}>▶ Re-enter</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({
  user, inputRoomId, setInputRoomId,
  handleJoinSubmit, handlePasteIntoJoin, handleCopyHistoryLink, onJoinRoom,
  onOpenSettings,
  completedSessions = []
}) {
  const attendedCount = completedSessions.length;

  return (
    <>
      <div className="role-welcome-banner student-banner">
        <div
          className="role-banner-avatar-wrap"
          onClick={() => onOpenSettings && onOpenSettings('account')}
          title="Click to view & change profile picture"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="role-banner-avatar-img" />
          ) : (
            <div className="role-banner-avatar-circle">
              {(user?.name || 'S').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="role-banner-avatar-edit-badge" title="Change Photo">📷</span>
        </div>
        <div>
          <h2>{user?.name || 'Student'}</h2>
          <p>You are logged in as <span className="role-chip role-student">Student</span> — join your instructor's live room, ask doubts, and access your session notes.</p>
        </div>
      </div>

      <div className="role-stats-row">
        {[
          { icon: '📅', value: attendedCount, label: 'Sessions Attended' },
          { icon: '📝', value: attendedCount > 0 ? 1 : 0, label: 'Notes Saved' },
          { icon: '❓', value: 0, label: 'Doubts Pinned' },
          { icon: '⭐', value: attendedCount > 0 ? '92%' : '0%', label: 'Engagement Score' },
        ].map((s, i) => (
          <div className="role-stat-card" key={i}>
            <span className="stat-icon">{s.icon}</span>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="role-section-title">🔗 Join a Live Class</div>
      <div className="action-card student-card zoom-class-card">
        <div className="zoom-card-top-bar">
          <span className="card-badge badge-green">🎓 Student Classroom Hub</span>
          <span className="zoom-live-badge live-green">
            <span className="pulse-dot">●</span> Live Rooms Open
          </span>
        </div>
        <div className="zoom-card-heading-wrap">
          <h2>Enter Online Classroom</h2>
          <p>Enter the 9-digit Meeting ID (e.g. <code>849-291-034</code>) or paste the complete class invite link sent by your instructor.</p>
        </div>
        <form onSubmit={handleJoinSubmit} className="join-form-custom">
          <label className="room-code-label">🆔 Meeting ID or Direct Join Link:</label>
          <div className="room-code-input-row">
            <div className="zoom-id-display">
              <span className="zoom-id-hash">#</span>
              <input
                type="text"
                placeholder="e.g. 849-291-034  or  paste full invite link"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                className="dash-input zoom-code-input"
              />
            </div>
            <button type="button" className="code-action-btn paste-btn" onClick={handlePasteIntoJoin} title="Paste from clipboard">
              📋 Paste
            </button>
          </div>
          <button type="submit" className="dash-btn dash-primary-btn launch-btn">
            🎓 Enter Classroom →
          </button>
        </form>
      </div>

      <div className="role-section-title">🛠️ What You Can Do in a Session</div>
      <div className="instructor-features-grid">
        {['🎥 Live Video Call','👀 Live Whiteboard View','💬 Live Chat','📍 Pin Doubts','📝 AI Notes','🎬 Watch Video','🧊 3D Model View','📊 View Analytics'].map(f => (
          <div className="feature-pill" key={f}>{f}</div>
        ))}
      </div>

      <div className="role-section-title">🕐 My Completed Sessions ({attendedCount})</div>
      <div className="history-section">
        {attendedCount === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.75rem', color: '#64748b', fontSize: '0.88rem' }}>
            You haven't attended any online classes yet. Join using a Room Code or invite link above!
          </div>
        ) : (
          <div className="history-list">
            {completedSessions.map(s => (
              <div className="history-item" key={s.code}>
                <div className="history-info">
                  <h4>{s.title}</h4>
                  <p>Room: <code>{s.code}</code> • {s.date} ({s.time || ''}) • <span style={{color:'#94a3b8'}}>Instructor: {s.instructor || 'Teacher'}</span></p>
                </div>
                <div style={{ display:'flex', gap:'0.6rem', alignItems:'center' }}>
                  <button type="button" className="room-copy-btn" onClick={() => handleCopyHistoryLink(s.code)}>🔗 Copy Link</button>
                  <button type="button" className="rejoin-btn" onClick={() => onJoinRoom && onJoinRoom(s.code)}>↩ Rejoin</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

function DashboardPage({ 
  user, 
  onNavigate, 
  onBackToHome, 
  onJoinRoom, 
  onOpenProfile, 
  onOpenAnalytics, 
  onOpenSettings,
  onLogout,
  theme,
  onToggleTheme
}) {
  const [inputRoomId, setInputRoomId] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState(() => generateZoomMeetingId());
  const [meetingTopic, setMeetingTopic] = useState('SyncLearn Live Interactive Classroom');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const toastTimeoutRef = useRef(null);

  const [dbStatus, setDbStatus] = useState({ connected: true, database: 'synclearn_db', usersCount: 5, roomsCount: 0 });

  useEffect(() => {
    const checkDb = () => {
      fetch('http://localhost:5000/api/v1/db-status')
        .then(res => res.json())
        .then(data => {
          if (data && data.connected) {
            setDbStatus(data);
          }
        })
        .catch(e => console.warn('DB status check:', e));
    };
    checkDb();
    const interval = setInterval(checkDb, 8000);
    return () => clearInterval(interval);
  }, []);

  // Real-time completed sessions from actual class attendance (0 by default if no class attended yet)
  const [completedSessions, setCompletedSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('synclearn_completed_sessions') || '[]');
    } catch {
      return [];
    }
  });

  // Keep dashboard stats up-to-date in real-time when returning from classroom
  useEffect(() => {
    const refreshSessions = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('synclearn_completed_sessions') || '[]');
        setCompletedSessions(stored);
      } catch (err) {
        console.error('Session sync error:', err);
      }
    };

    refreshSessions();
    window.addEventListener('storage', refreshSessions);
    window.addEventListener('focus', refreshSessions);
    return () => {
      window.removeEventListener('storage', refreshSessions);
      window.removeEventListener('focus', refreshSessions);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3200);
  };

  const handleRegenerateCode = () => {
    const newCode = generateZoomMeetingId();
    setCreatedRoomId(newCode);
    showToast(`🎲 Generated new Class Meeting ID: ${newCode}`);
  };

  const handleCopyCreatedCode = () => {
    if (!createdRoomId) return;
    navigator.clipboard.writeText(createdRoomId)
      .then(() => showToast(`📋 Meeting ID "${createdRoomId}" copied!`))
      .catch(() => showToast('Failed to copy code', 'error'));
  };

  const handleCopyCreatedInvite = () => {
    if (!createdRoomId) return;
    const host = getShareableHost();
    const port = window.location.port || '5173';
    const inviteUrl = `${window.location.protocol}//${host}:${port}?room=${encodeURIComponent(createdRoomId)}`;
    navigator.clipboard.writeText(inviteUrl)
      .then(() => showToast(`🔗 Shareable Mobile & Wi-Fi invite link copied: ${inviteUrl}`, 'success'))
      .catch(() => showToast('Failed to copy link', 'error'));
  };

  const handleCopyZoomInvitation = () => {
    if (!createdRoomId) return;
    const text = buildZoomInvitationText(meetingTopic, createdRoomId, user?.name);
    navigator.clipboard.writeText(text)
      .then(() => showToast('📋 Class invitation copied! Ready to paste in WhatsApp/Email.'))
      .catch(() => showToast('Failed to copy invitation', 'error'));
  };

  const handleShareWhatsApp = () => {
    const text = buildZoomInvitationText(meetingTopic, createdRoomId, user?.name);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast('💬 Opening WhatsApp to share class invitation!');
  };

  const handleShareEmail = () => {
    const text = buildZoomInvitationText(meetingTopic, createdRoomId, user?.name);
    const subject = `Live Class Invitation: ${meetingTopic || 'SyncLearn Online Session'}`;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = mailto;
    showToast('✉️ Opening email client to send invitation!');
  };

  const handlePasteIntoJoin = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (text.includes('room=')) {
          const params = new URLSearchParams(text.split('?')[1]);
          const roomVal = params.get('room');
          if (roomVal) {
            setInputRoomId(roomVal.trim());
            showToast(`📋 Pasted room code: ${roomVal.trim()}`);
            return;
          }
        }
        setInputRoomId(text.trim());
        showToast(`📋 Pasted code: ${text.trim()}`);
      }
    } catch (err) {
      showToast('Please paste manually into the input box', 'error');
    }
  };

  const handleCopyHistoryLink = (rId) => {
    const inviteUrl = `${window.location.origin}?room=${encodeURIComponent(rId)}`;
    navigator.clipboard.writeText(inviteUrl)
      .then(() => showToast(`🔗 Invite link for ${rId} copied!`))
      .catch(() => showToast('Failed to copy link', 'error'));
  };

  const extractRoomCode = (raw) => {
    if (!raw) return '';
    let val = String(raw).trim();
    if (val.includes('room=')) {
      try {
        const queryPart = val.includes('?') ? val.split('?')[1] : val;
        const params = new URLSearchParams(queryPart);
        const parsed = params.get('room');
        if (parsed) return parsed.trim();
      } catch (e) {}
    }
    val = val.replace(/^https?:\/\/[^/]+\/?/i, '');
    // Replace spaces in 9-digit format "849 291 034" -> "849-291-034"
    if (/^\d{3}\s+\d{3}\s+\d{3}$/.test(val.trim())) {
      return val.trim().replace(/\s+/g, '-');
    }
    return val.replace(/[^a-zA-Z0-9_-]/g, '').trim() || val.trim();
  };

  const handleCreateRoom = () => {
    const targetRoom = extractRoomCode(createdRoomId) || generateZoomMeetingId();
    if (onJoinRoom) onJoinRoom(targetRoom);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const cleanRoom = extractRoomCode(inputRoomId);
    if (cleanRoom && onJoinRoom) {
      onJoinRoom(cleanRoom);
    }
  };

  // Safe navigation handlers
  const handleAnalytics = () => {
    if (onOpenAnalytics) onOpenAnalytics();
    else if (onNavigate) onNavigate('analytics');
  };

  const handleProfile = () => {
    if (onOpenProfile) onOpenProfile();
    else if (onNavigate) onNavigate('profile');
  };

  const handleHome = () => {
    if (onLogout) onLogout();
    else if (onBackToHome) onBackToHome();
    else if (onNavigate) onNavigate('home');
  };

  const isInstructor = (user?.role === 'instructor');

  return (
    <div className="dashboard-container">
      {/* Floating Toast Notification */}
      {toast.show && (
        <div className={`dash-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Top Header Navigation */}
      <nav className="dashboard-nav">
        <div className="logo-container">
          <img
            src={logoImg}
            alt="SyncLearn Logo"
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
          />
          <span className="logo-text">SyncLearn</span>
          <span className={`nav-role-chip ${isInstructor ? 'role-instructor' : 'role-student'}`}>
            {isInstructor ? '👨‍🏫 Instructor' : '🎓 Student'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {isInstructor && (
            <button type="button" className="back-btn" onClick={handleAnalytics} style={{ backgroundColor: '#334155', color: '#ffffff' }}>
              📊 Analytics
            </button>
          )}

          <button type="button" className="back-btn" onClick={handleProfile} style={{ backgroundColor: '#6366f1', color: '#ffffff' }}>
            👤 Profile
          </button>

          <button
            type="button"
            className="back-btn"
            onClick={() => onOpenSettings && onOpenSettings('general')}
            style={{ backgroundColor: '#334155', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Appearance, Audio/Video & Account Settings"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              '⚙️'
            )}
            <span>Settings</span>
          </button>

          <button
            type="button"
            className="back-btn logout-nav-btn"
            onClick={onLogout || handleHome}
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.22)', borderColor: 'rgba(239, 68, 68, 0.45)', color: '#fca5a5' }}
            title="Log out of SyncLearn session"
          >
            🚪 Logout
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

      {/* Role-based Dashboard Content */}
      <div className="dashboard-content">
        {isInstructor ? (
          <InstructorDashboard
            user={user}
            createdRoomId={createdRoomId}
            setCreatedRoomId={setCreatedRoomId}
            meetingTopic={meetingTopic}
            setMeetingTopic={setMeetingTopic}
            handleCreateRoom={handleCreateRoom}
            handleRegenerateCode={handleRegenerateCode}
            handleCopyCreatedCode={handleCopyCreatedCode}
            handleCopyCreatedInvite={handleCopyCreatedInvite}
            handleCopyZoomInvitation={handleCopyZoomInvitation}
            handleShareWhatsApp={handleShareWhatsApp}
            handleShareEmail={handleShareEmail}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            handleCopyHistoryLink={handleCopyHistoryLink}
            onJoinRoom={onJoinRoom}
            onOpenSettings={onOpenSettings}
            completedSessions={completedSessions}
          />
        ) : (
          <StudentDashboard
            user={user}
            inputRoomId={inputRoomId}
            setInputRoomId={setInputRoomId}
            handleJoinSubmit={handleJoinSubmit}
            handlePasteIntoJoin={handlePasteIntoJoin}
            handleCopyHistoryLink={handleCopyHistoryLink}
            onJoinRoom={onJoinRoom}
            onOpenSettings={onOpenSettings}
            completedSessions={completedSessions}
          />
        )}
      </div>

      {/* Zoom-Style Invitation Modal */}
      <ClassInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        topic={meetingTopic}
        roomId={createdRoomId}
        instructorName={user?.name}
        onCopyInvite={handleCopyZoomInvitation}
        onCopyLink={handleCopyCreatedInvite}
        onShareWhatsApp={handleShareWhatsApp}
        onShareEmail={handleShareEmail}
      />

      {/* ── Image 1: Bottom Settings Option ── */}
      <div className="dashboard-bottom-settings-bar">
        <button
          type="button"
          className="zoom-settings-trigger-btn"
          onClick={() => onOpenSettings && onOpenSettings('general')}
          title="Account, Profile Picture & Hardware Settings"
        >
          <div className="zoom-settings-icon-square">⚙️</div>
          <span className="zoom-settings-trigger-label">Settings</span>
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;