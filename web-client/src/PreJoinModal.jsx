import React, { useState, useEffect, useRef } from 'react';
import syncLearnLogo from './assets/logo.png';
import './PreJoinModal.css';

function PreJoinModal({
  isOpen,
  onClose,
  onJoin,
  onOpenSettings,
  user,
  roomId,
  isInstructor = false,
  isStudentJoinLink = false,
}) {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [blurBackground, setBlurBackground] = useState(false);
  const [realName, setRealName] = useState(() => {
    return user?.name || (isInstructor ? 'Hafiza Yusra' : '');
  });
  const [nameError, setNameError] = useState('');

  const [availableMics, setAvailableMics] = useState([]);
  const [availableCams, setAvailableCams] = useState([]);
  const [selectedMic, setSelectedMic] = useState('');
  const [selectedCam, setSelectedCam] = useState('');

  const [alwaysShow, setAlwaysShow] = useState(() => {
    return localStorage.getItem('synclearn_always_show_preview') !== 'false';
  });

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize camera & mic preview
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function setupPreviewStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Apply initial state
        stream.getAudioTracks().forEach((t) => (t.enabled = micOn));
        stream.getVideoTracks().forEach((t) => (t.enabled = videoOn));

        // Enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === 'audioinput');
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');

        setAvailableMics(
          audioInputs.length > 0
            ? audioInputs
            : [{ deviceId: 'default', label: 'Built-in Microphone and Speakers' }]
        );
        setAvailableCams(
          videoInputs.length > 0
            ? videoInputs
            : [{ deviceId: 'default', label: 'Integrated Camera' }]
        );

        if (audioInputs[0]?.deviceId) setSelectedMic(audioInputs[0].deviceId);
        if (videoInputs[0]?.deviceId) setSelectedCam(videoInputs[0].deviceId);
      } catch (err) {
        console.warn('Pre-join preview media setup failed (camera/mic permission):', err);
        // Fallback default labels
        setAvailableMics([{ deviceId: 'default', label: 'Built-in Microphone and Speakers' }]);
        setAvailableCams([{ deviceId: 'default', label: 'Integrated Camera' }]);
      }
    }

    setupPreviewStream();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  // Update realName if user changes
  useEffect(() => {
    if (user?.name && !realName) {
      setRealName(user.name);
    }
  }, [user?.name]);

  // Toggle Mic
  const toggleMic = () => {
    setMicOn((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
      }
      return next;
    });
  };

  // Toggle Video
  const toggleVideo = () => {
    setVideoOn((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((t) => (t.enabled = next));
      }
      return next;
    });
  };

  const handleAlwaysShowChange = (e) => {
    const checked = e.target.checked;
    setAlwaysShow(checked);
    localStorage.setItem('synclearn_always_show_preview', checked ? 'true' : 'false');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // If student, require real name
    const trimmedName = realName.trim();
    if (!isInstructor && !trimmedName) {
      setNameError('Please enter your real name to join the class.');
      return;
    }

    // Stop preview stream before transferring to ActiveRoomPage
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (onJoin) {
      onJoin({
        name: trimmedName || (isInstructor ? (user?.name || 'Instructor') : 'Student'),
        micOn,
        videoOn,
        blurBackground,
      });
    }
  };

  if (!isOpen) return null;

  const meetingHostName = isInstructor
    ? (realName || user?.name || 'Hafiza Coder')
    : (user?.name || 'Class');

  const showNameField = !isInstructor || isStudentJoinLink || !user?.name;

  return (
    <div className="prejoin-overlay" onClick={onClose}>
      <div className="prejoin-window" onClick={(e) => e.stopPropagation()}>
        {/* ── Window Title Bar (Matching Image 1) ── */}
        <div className="prejoin-titlebar">
          <div className="prejoin-title-left">
            <img src={syncLearnLogo} alt="SyncLearn" className="prejoin-logo-img" />
            <span className="prejoin-title-text">{meetingHostName}'s SyncLearn Classroom</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="prejoin-close-btn"
              onClick={() => onOpenSettings && onOpenSettings('general')}
              title="Open Settings"
              style={{ fontSize: '1rem', display: 'flex', alignItems: 'center' }}
            >
              ⚙️
            </button>
            <button
              type="button"
              className="prejoin-close-btn"
              onClick={onClose}
              title="Close Preview"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="prejoin-body">
          {/* Video Preview Viewport */}
          <div className="prejoin-preview-viewport">
            {videoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`prejoin-video-feed ${blurBackground ? 'blurred' : ''}`}
              />
            ) : (
              <div
                className="prejoin-video-off-placeholder"
                onClick={() => onOpenSettings && onOpenSettings('account')}
                style={{ cursor: 'pointer', position: 'relative', width: '100%', height: '100%' }}
                title="Click to add or change profile picture"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="prejoin-avatar-circle">
                    {(meetingHostName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '62px',
                    background: 'rgba(0, 0, 0, 0.78)',
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                  }}
                >
                  📷 {user?.avatar ? 'Change Picture' : 'Add Profile Picture'}
                </span>
              </div>
            )}

            {/* Bottom-Center Floating Audio / Video Pill */}
            <div className="prejoin-overlay-pill">
              <button
                type="button"
                className={`prejoin-pill-btn ${!micOn ? 'muted' : ''}`}
                onClick={toggleMic}
                title={micOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                <div className="prejoin-pill-icon">
                  {micOn ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2.5" />
                      <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" stroke="#ffffff" />
                      <path d="M5 10v2a7 7 0 0 0 12 5" stroke="#ffffff" />
                      <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" stroke="#ffffff" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" stroke="#ffffff" />
                    </svg>
                  )}
                </div>
                <span className="prejoin-pill-label">Audio</span>
              </button>

              <button
                type="button"
                className={`prejoin-pill-btn ${!videoOn ? 'muted' : ''}`}
                onClick={toggleVideo}
                title={videoOn ? 'Stop Video' : 'Start Video'}
              >
                <div className="prejoin-pill-icon">
                  {videoOn ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" fill="currentColor" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2.5" />
                      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m4 0h7a2 2 0 0 1 2 2v3.34" stroke="#ffffff" />
                      <polygon points="23 7 16 12 23 17 23 7" stroke="#ffffff" />
                    </svg>
                  )}
                </div>
                <span className="prejoin-pill-label">Video</span>
              </button>
            </div>

            {/* Bottom-Right Floating Backgrounds Button */}
            <button
              type="button"
              className={`prejoin-backgrounds-btn ${blurBackground ? 'active' : ''}`}
              onClick={() => setBlurBackground(!blurBackground)}
              title="Toggle Blur Background Effect"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Backgrounds</span>
            </button>
          </div>

          {/* ── Dropdowns: Mic & Camera (Matching Image 1) ── */}
          <div className="prejoin-device-row">
            <div className="prejoin-select-wrap">
              <span className="prejoin-device-icon">🎙️</span>
              <select
                className="prejoin-device-select"
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
              >
                {availableMics.map((m) => (
                  <option key={m.deviceId} value={m.deviceId}>
                    {m.label || 'Built-in Microphone and Speakers'}
                  </option>
                ))}
              </select>
            </div>

            <div className="prejoin-select-wrap">
              <span className="prejoin-device-icon">📹</span>
              <select
                className="prejoin-device-select"
                value={selectedCam}
                onChange={(e) => setSelectedCam(e.target.value)}
              >
                {availableCams.map((c) => (
                  <option key={c.deviceId} value={c.deviceId}>
                    {c.label || 'Integrated Camera'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Student Real Name Input Field (User Requirement) ── */}
          {showNameField && (
            <div className="prejoin-name-section">
              <label className="prejoin-name-label">
                👤 Your Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="prejoin-name-input"
                placeholder="Enter your real name to join the class session..."
                value={realName}
                onChange={(e) => {
                  setRealName(e.target.value);
                  if (nameError) setNameError('');
                }}
                autoFocus={!isInstructor}
              />
              {nameError ? (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                  ⚠️ {nameError}
                </span>
              ) : (
                <span className="prejoin-name-hint">
                  Your instructor and peers will identify you by this name in the class session.
                </span>
              )}
            </div>
          )}

          {/* ── Bottom Controls Row (Matching Image 1) ── */}
          <div className="prejoin-footer-row">
            <label className="prejoin-checkbox-wrap">
              <input
                type="checkbox"
                checked={alwaysShow}
                onChange={handleAlwaysShowChange}
              />
              <span>Always show this preview when joining</span>
              <span className="prejoin-info-icon" title="You can always adjust mic & camera before joining any live session.">ⓘ</span>
            </label>

            <button
              type="button"
              className="prejoin-start-btn"
              onClick={handleSubmit}
            >
              {isInstructor ? 'Start' : 'Join'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreJoinModal;
