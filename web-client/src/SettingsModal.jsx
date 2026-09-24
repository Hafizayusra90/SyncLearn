import React, { useState, useRef, useEffect } from 'react';
import './SettingsModal.css';

function SettingsModal({
  isOpen,
  onClose,
  initialTab = 'general',
  user,
  onUpdateUser,
  theme = 'dark',
  onSetTheme,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [recoveryEmail, setRecoveryEmail] = useState(user?.recoveryEmail || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Appearance & Theme States
  const [activeThemeAccent, setActiveThemeAccent] = useState('classic');
  const [selectedEmojiTone, setSelectedEmojiTone] = useState(0);

  // Media Settings
  const [blurSetting, setBlurSetting] = useState(false);
  const [autoFrameSetting, setAutoFrameSetting] = useState(false);

  // ── Recording States (Dual-Mode: PC Download & App Save) ──
  const [saveToPc, setSaveToPc] = useState(() => {
    try {
      const saved = localStorage.getItem('synclearn_recording_prefs');
      return saved ? JSON.parse(saved).saveToPc !== false : true;
    } catch { return true; }
  });
  const [saveToApp, setSaveToApp] = useState(() => {
    try {
      const saved = localStorage.getItem('synclearn_recording_prefs');
      return saved ? JSON.parse(saved).saveToApp !== false : true;
    } catch { return true; }
  });
  const [storagePath, setStoragePath] = useState(() => {
    try {
      const saved = localStorage.getItem('synclearn_recording_prefs');
      return (saved && JSON.parse(saved).storagePath) || 'C:\\Users\\PMLS\\Documents\\Zoom';
    } catch { return 'C:\\Users\\PMLS\\Documents\\Zoom'; }
  });
  const [selectLocationAfterMeeting, setSelectLocationAfterMeeting] = useState(false);
  const [showParticipantsNames, setShowParticipantsNames] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [recordVideoScreenSharing, setRecordVideoScreenSharing] = useState(true);
  const [showSideBySide, setShowSideBySide] = useState(false);
  const [showAdvancedRecording, setShowAdvancedRecording] = useState(false);
  const [savedRecordingsList, setSavedRecordingsList] = useState([]);
  const [activePlaybackRec, setActivePlaybackRec] = useState(null);

  // ── Notifications & Sounds States (Image 2/3) ──
  const [ringtoneVolume, setRingtoneVolume] = useState(70);
  const [videoCallRingtone, setVideoCallRingtone] = useState('Default');
  const [isPlayingRingtone, setIsPlayingRingtone] = useState(false);
  const [playChatMessageSound, setPlayChatMessageSound] = useState(true);
  const [dndHoursEnabled, setDndHoursEnabled] = useState(false);

  // ── Accessibility States (Image 1) ──
  const [chatDisplaySize, setChatDisplaySize] = useState('100%');
  const [dimFlashingVideo, setDimFlashingVideo] = useState(false);
  const [disableGifAnimations, setDisableGifAnimations] = useState(false);
  const [captionFontSize, setCaptionFontSize] = useState(25);
  const [selectedCaptionColor, setSelectedCaptionColor] = useState(0);
  const [captionFontType, setCaptionFontType] = useState('Arial');

  const fileInputRef = useRef(null);

  // Sync user state when opened or user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setRecoveryEmail(user.recoveryEmail || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Persist Recording Preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('synclearn_recording_prefs', JSON.stringify({
        saveToPc,
        saveToApp,
        storagePath,
        selectLocationAfterMeeting,
        showParticipantsNames,
        includeTimestamp,
        recordVideoScreenSharing,
        showSideBySide
      }));
    } catch (e) {
      console.warn('Failed to save recording prefs:', e);
    }
  }, [saveToPc, saveToApp, storagePath, selectLocationAfterMeeting, showParticipantsNames, includeTimestamp, recordVideoScreenSharing, showSideBySide]);

  // Load Saved Recordings for In-App Playback
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = JSON.parse(localStorage.getItem('synclearn_saved_recordings') || '[]');
        if (stored.length > 0) {
          setSavedRecordingsList(stored);
        } else {
          setSavedRecordingsList([
            {
              id: 'demo-rec-1',
              title: 'Lecture: Data Structures & WebRTC Systems',
              roomId: 'CS-101',
              date: 'Today, 11:30 AM',
              duration: '38m 20s',
              size: '154.2 MB',
              recordedBy: user?.name || 'Instructor',
              isSample: true
            }
          ]);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Handle Photo Upload (Converts to Data URL)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target.result;
      setAvatar(base64Url);
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Avatar selection
  const handleSelectPresetAvatar = (url) => {
    setAvatar(url);
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('Saving profile...');

    const updatedUser = {
      ...(user || {}),
      name: name.trim() || user?.name,
      recoveryEmail: recoveryEmail.trim(),
      avatar: avatar || ''
    };

    try {
      if (user?.email) {
        await fetch('http://localhost:5000/api/v1/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: updatedUser.name,
            recoveryEmail: updatedUser.recoveryEmail,
            avatar: updatedUser.avatar
          })
        });
      }

      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdateUser) onUpdateUser(updatedUser);

      setSaveMessage('✅ Profile & Picture saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.warn('Profile save warning:', err);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUpdateUser) onUpdateUser(updatedUser);
      setSaveMessage('✅ Saved locally!');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Audio Chime Test for Ringtone (Synthesizer Web Audio API)
  const handleTestRingtone = () => {
    if (isPlayingRingtone) return;
    setIsPlayingRingtone(true);
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime((ringtoneVolume / 100) * 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
      setTimeout(() => setIsPlayingRingtone(false), 550);
    } catch {
      setIsPlayingRingtone(false);
    }
  };

  // Delete In-App Saved Recording
  const handleDeleteSavedRecording = (id) => {
    const updated = savedRecordingsList.filter(item => item.id !== id);
    setSavedRecordingsList(updated);
    try {
      localStorage.setItem('synclearn_saved_recordings', JSON.stringify(updated.filter(i => !i.isSample)));
    } catch (e) {
      console.warn(e);
    }
  };

  // Download In-App Saved Recording to PC
  const handleDownloadSavedRecording = (rec) => {
    if (rec.url) {
      const a = document.createElement('a');
      a.href = rec.url;
      a.download = `${rec.title.replace(/\s+/g, '_')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(`⬇️ Downloading "${rec.title}" (${rec.size}) to PC: ${storagePath}`);
    }
  };

  // Caption Color Presets (Matching Image 1)
  const captionColorPresets = [
    { id: 0, bg: '#18181b', text: '#ffffff', label: 'Dark / White' },
    { id: 1, bg: '#ffffff', text: '#0f172a', label: 'Light / Dark' },
    { id: 2, bg: '#042f2e', text: '#2dd4bf', label: 'Teal' },
    { id: 3, bg: '#ccfbf1', text: '#115e59', label: 'Mint' },
    { id: 4, bg: '#172554', text: '#93c5fd', label: 'Navy' },
    { id: 5, bg: '#eff6ff', text: '#1e40af', label: 'Soft Blue' },
    { id: 6, bg: '#4c0519', text: '#f43f5e', label: 'Maroon' },
    { id: 7, bg: '#ffe4e6', text: '#9f1239', label: 'Soft Pink' }
  ];

  // Navigation Items matching Image 4/5 ("Meetings & webinars" removed per user request)
  const navItems = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'video', label: 'Video & effects', icon: '📹' },
    { id: 'audio', label: 'Audio', icon: '🎧' },
    { id: 'notifications', label: 'Notifications & sounds', icon: '🔔' },
    { id: 'recording', label: 'Recording', icon: '⏺' },
    { id: 'share', label: 'Share screen', icon: '⬆' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'accessibility', label: 'Accessibility', icon: '🚶' },
    { id: 'shortcuts', label: 'Keyboard shortcuts', icon: '⌨' },
    { id: 'statistics', label: 'Statistics', icon: '📊' },
    { id: 'account', label: 'My account', icon: '👤' }
  ];

  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="zoom-settings-overlay" onClick={onClose}>
      <div className="zoom-settings-dialog" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="zoom-settings-header">
          <span className="zoom-settings-title">⚙️ Settings</span>
          <button
            type="button"
            className="zoom-settings-close-btn"
            onClick={onClose}
            title="Close Settings"
          >
            ✕
          </button>
        </div>

        {/* Layout */}
        <div className="zoom-settings-layout">
          {/* Left Sidebar (Matching Image 2) */}
          <aside className="zoom-settings-sidebar">
            <div className="zoom-settings-search-wrap">
              <span className="zoom-settings-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="zoom-settings-search-input"
              />
            </div>

            <nav className="zoom-settings-nav-list">
              {filteredNavItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`zoom-settings-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="zoom-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Content Panel */}
          <main className="zoom-settings-content">
            {/* ── 1. General Tab (Matching Image 2 Appearance) ── */}
            {activeTab === 'general' && (
              <div>
                <h2 className="zoom-content-header">Appearance</h2>

                {/* Color Mode Section */}
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Color mode</div>
                  <div className="zoom-color-modes-grid">
                    {/* Light Mode */}
                    <div
                      className={`zoom-color-mode-card ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => onSetTheme && onSetTheme('light')}
                    >
                      <div className="zoom-mode-preview-box zoom-preview-light">
                        <div className="zoom-preview-fake-bar"></div>
                        <div className="zoom-preview-fake-body"></div>
                      </div>
                      <span className="zoom-mode-card-label">Light</span>
                    </div>

                    {/* Dark Mode */}
                    <div
                      className={`zoom-color-mode-card ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => onSetTheme && onSetTheme('dark')}
                    >
                      <div className="zoom-mode-preview-box zoom-preview-dark">
                        <div className="zoom-preview-fake-bar" style={{ background: '#64748b' }}></div>
                        <div className="zoom-preview-fake-body"></div>
                      </div>
                      <span className="zoom-mode-card-label">Dark</span>
                    </div>

                    {/* System Setting */}
                    <div
                      className="zoom-color-mode-card"
                      onClick={() => onSetTheme && onSetTheme('dark')}
                    >
                      <div className="zoom-mode-preview-box zoom-preview-system">
                        <div className="zoom-preview-split-light">
                          <div className="zoom-preview-fake-bar"></div>
                        </div>
                        <div className="zoom-preview-split-dark">
                          <div className="zoom-preview-fake-bar" style={{ background: '#64748b' }}></div>
                        </div>
                      </div>
                      <span className="zoom-mode-card-label">System setting</span>
                    </div>
                  </div>
                </div>

                {/* Theme Accent Swatches (Image 2) */}
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Theme</div>
                  <p className="zoom-section-card-desc">Apply an accent color when using light or dark mode.</p>
                  <div className="zoom-themes-row">
                    {[
                      { id: 'cyan', label: 'Cyber Tech', bg: 'linear-gradient(135deg, #00d2ff 0%, #0891b2 100%)' },
                      { id: 'classic', label: 'Classic', bg: 'linear-gradient(135deg, #64748b 50%, #cbd5e1 50%)' },
                      { id: 'bloom', label: 'Bloom', bg: '#1d4ed8' },
                      { id: 'agave', label: 'Agave', bg: '#0f766e' },
                      { id: 'rose', label: 'Rose', bg: '#9f1239' }
                    ].map(swatch => (
                      <div
                        key={swatch.id}
                        className={`zoom-theme-swatch-wrap ${activeThemeAccent === swatch.id ? 'active' : ''}`}
                        onClick={() => setActiveThemeAccent(swatch.id)}
                      >
                        <div className="zoom-theme-swatch" style={{ background: swatch.bg }} />
                        <span className="zoom-swatch-label">{swatch.label}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.88rem', color: '#64748b' }}>SyncLearn Chat sidebar</span>
                    <select
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: 'transparent',
                        color: 'inherit',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="light">Light contrast</option>
                      <option value="dark">Dark contrast</option>
                    </select>
                  </div>
                </div>

                {/* Emoji Reactions Skin Tone (Image 2) */}
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Emoji and reactions skin tone</div>
                  <div className="zoom-emojis-row">
                    {['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿'].map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`zoom-emoji-btn ${selectedEmojiTone === idx ? 'active' : ''}`}
                        onClick={() => setSelectedEmojiTone(idx)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. My Account / Profile Tab (Image 3 Profile Picture) ── */}
            {activeTab === 'account' && (
              <div>
                <h2 className="zoom-content-header">My Account & Profile</h2>

                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Profile Picture</div>
                  <p className="zoom-section-card-desc">
                    This picture will display to classmates & teachers when your video camera is turned off (Image 3).
                  </p>

                  <div className="zoom-profile-header-area">
                    {avatar ? (
                      <img src={avatar} alt="Profile" className="zoom-profile-avatar-large" />
                    ) : (
                      <div className="zoom-profile-avatar-placeholder">
                        {(name || user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="zoom-profile-actions">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePhotoUpload}
                      />
                      <button
                        type="button"
                        className="zoom-btn-upload-photo"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📷 Upload Photo
                      </button>

                      {avatar && (
                        <button
                          type="button"
                          className="zoom-btn-remove-photo"
                          onClick={() => setAvatar('')}
                        >
                          🗑️ Remove Photo
                        </button>
                      )}

                      <div className="zoom-preset-avatars-row">
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quick:</span>
                        {[
                          '🎓', '👩‍💻', '👨‍🏫', '🚀', '🌟', '📚'
                        ].map((emoji, i) => (
                          <button
                            key={i}
                            type="button"
                            className="zoom-preset-avatar-btn"
                            onClick={() => {
                              // SVG canvas generator for preset emoji
                              const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0e71eb"/><text x="50%" y="62%" font-size="52" text-anchor="middle">${emoji}</text></svg>`;
                              const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
                              setAvatar(dataUri);
                            }}
                            title={`Choose ${emoji} avatar`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="zoom-profile-form">
                    <div className="zoom-form-row">
                      <label className="zoom-form-label">Full Name (Real Name)</label>
                      <input
                        type="text"
                        className="zoom-form-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Hafiza Yusra / Student Name"
                      />
                    </div>

                    <div className="zoom-form-row">
                      <label className="zoom-form-label">Email Address</label>
                      <input
                        type="email"
                        className="zoom-form-input"
                        value={user?.email || 'user@synclearn.edu'}
                        disabled
                      />
                    </div>

                    <div className="zoom-form-row">
                      <label className="zoom-form-label">Recovery Email</label>
                      <input
                        type="email"
                        className="zoom-form-input"
                        value={recoveryEmail}
                        onChange={e => setRecoveryEmail(e.target.value)}
                        placeholder="recovery@example.com"
                      />
                    </div>

                    <div className="zoom-form-row">
                      <label className="zoom-form-label">Account Role</label>
                      <input
                        type="text"
                        className="zoom-form-input"
                        value={(user?.role || 'Student').toUpperCase()}
                        disabled
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="zoom-save-profile-btn"
                    >
                      {isSaving ? 'Saving...' : '💾 Save Profile & Picture'}
                    </button>

                    {saveMessage && (
                      <span style={{ fontSize: '0.86rem', color: '#4ade80', fontWeight: 600 }}>
                        {saveMessage}
                      </span>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* ── 3. Video & Effects Tab ── */}
            {activeTab === 'video' && (
              <div>
                <h2 className="zoom-content-header">Video & Effects</h2>
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Camera Preview</div>
                  <div style={{
                    width: '100%',
                    height: '220px',
                    background: '#111827',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    overflow: 'hidden'
                  }}>
                    {avatar ? (
                      <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>📷 Integrated HD Camera Active</span>
                    )}
                  </div>
                </div>

                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Video Features</div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={blurSetting}
                      onChange={e => setBlurSetting(e.target.checked)}
                    />
                    <span>Blur my background in meetings</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoFrameSetting}
                      onChange={e => setAutoFrameSetting(e.target.checked)}
                    />
                    <span>Auto-frame camera zoom</span>
                  </label>
                </div>
              </div>
            )}

            {/* ── 3. Audio Tab ── */}
            {activeTab === 'audio' && (
              <div>
                <h2 className="zoom-content-header">Audio Settings</h2>
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Microphone & Speaker</div>
                  <div className="zoom-form-row" style={{ marginBottom: '10px' }}>
                    <label className="zoom-form-label">Speaker</label>
                    <select className="zoom-form-input">
                      <option>Speakers (Realtek(R) Audio)</option>
                      <option>Same as System</option>
                    </select>
                  </div>
                  <div className="zoom-form-row" style={{ marginBottom: '14px' }}>
                    <label className="zoom-form-label">Microphone</label>
                    <select className="zoom-form-input">
                      <option>Microphone Array (Realtek(R) Audio)</option>
                      <option>Same as System</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className="zoom-btn-upload-photo"
                    onClick={() => alert('🔊 Audio Test Chime Played!')}
                  >
                    🔊 Test Speaker & Microphone
                  </button>
                </div>
              </div>
            )}

            {/* ── 4. Notifications & Sounds Tab (Matching Image 2/3) ── */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="zoom-content-header">Sounds</h2>

                {/* Sounds Volume Card */}
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Volume</div>
                  <div style={{ marginBottom: '6px', fontSize: '0.86rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Ringtone volume</span>
                    <span title="Adjust incoming call ringtone volume" style={{ cursor: 'help', color: '#94a3b8' }}>ℹ️</span>
                  </div>
                  <div className="zoom-volume-slider-row">
                    <span style={{ fontSize: '1rem', color: '#64748b' }}>🔈</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ringtoneVolume}
                      onChange={e => setRingtoneVolume(Number(e.target.value))}
                      className="zoom-range-input"
                    />
                    <span style={{ fontSize: '1.1rem', color: '#0e71eb' }}>🔊</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: '36px', color: '#64748b' }}>
                      {ringtoneVolume}%
                    </span>
                  </div>
                </div>

                {/* Ringtones Card */}
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Ringtones</div>
                  <div className="zoom-ringtone-row">
                    <span style={{ fontSize: '0.88rem' }}>Video calls</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        className="zoom-form-input"
                        style={{ width: '160px', padding: '5px 10px' }}
                        value={videoCallRingtone}
                        onChange={e => setVideoCallRingtone(e.target.value)}
                      >
                        <option value="Default">Default</option>
                        <option value="Chime">Chime</option>
                        <option value="Soft Bell">Soft Bell</option>
                        <option value="Marimba">Marimba</option>
                      </select>
                      <button
                        type="button"
                        className="zoom-play-ringtone-btn"
                        onClick={handleTestRingtone}
                        title="Play test ringtone"
                      >
                        {isPlayingRingtone ? '⏹️' : '▶'}
                      </button>
                    </div>
                  </div>

                  <div className="zoom-ringtone-row" style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '0.88rem' }}>Custom contact ringtones</span>
                    <button
                      type="button"
                      className="zoom-subtle-btn"
                      onClick={() => alert('Custom contact ringtone manager is active.')}
                    >
                      Manage
                    </button>
                  </div>
                </div>

                {/* Notification Sounds Card */}
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Notification sounds</div>
                  <div className="zoom-toggle-row">
                    <span>Play new chat message sound</span>
                    <label className="zoom-switch">
                      <input
                        type="checkbox"
                        checked={playChatMessageSound}
                        onChange={e => setPlayChatMessageSound(e.target.checked)}
                      />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Desktop Notifications */}
                <h2 className="zoom-content-header" style={{ marginTop: '24px' }}>Desktop notifications</h2>
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Notification preferences</div>
                  <div className="zoom-toggle-row">
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Set "Do not disturb" hours</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Mutes chat and call notifications during the selected hours.
                      </div>
                    </div>
                    <label className="zoom-switch">
                      <input
                        type="checkbox"
                        checked={dndHoursEnabled}
                        onChange={e => setDndHoursEnabled(e.target.checked)}
                      />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── 5. RECORDING TAB (Matching Image 4 & 5 + Dual Save Mode) ── */}
            {activeTab === 'recording' && (
              <div>
                {/* Dual-Mode Destination Card (Requested by User: PC download & application save) */}
                <h2 className="zoom-content-header">Recording Destinations</h2>
                <div className="zoom-setting-section-card" style={{ borderLeft: '4px solid #0e71eb' }}>
                  <div className="zoom-section-card-title">Choose Recording Save Mode</div>
                  <p className="zoom-section-card-desc">
                    Choose where lecture recordings are saved upon completion: download directly to your PC, or store inside the SyncLearn application library (both can be active simultaneously).
                  </p>

                  <div className="zoom-destinations-grid">
                    {/* Option 1: PC Download */}
                    <div
                      className={`zoom-destination-card ${saveToPc ? 'active' : ''}`}
                      onClick={() => setSaveToPc(!saveToPc)}
                    >
                      <div className="zoom-dest-icon">💻</div>
                      <div className="zoom-dest-info">
                        <div className="zoom-dest-title">1. Download to Computer / PC</div>
                        <div className="zoom-dest-desc">
                          The recorded video file (.webm / .mp4) will download directly to your local computer's storage folder.
                        </div>
                      </div>
                      <label className="zoom-switch" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={saveToPc}
                          onChange={e => setSaveToPc(e.target.checked)}
                        />
                        <span className="zoom-switch-slider"></span>
                      </label>
                    </div>

                    {/* Option 2: Save in Application */}
                    <div
                      className={`zoom-destination-card ${saveToApp ? 'active' : ''}`}
                      onClick={() => setSaveToApp(!saveToApp)}
                    >
                      <div className="zoom-dest-icon">📂</div>
                      <div className="zoom-dest-info">
                        <div className="zoom-dest-title">2. Save in Application Library</div>
                        <div className="zoom-dest-desc">
                          Video recordings are saved securely in the SyncLearn in-app library so students and instructors can play them back anytime within the browser.
                        </div>
                      </div>
                      <label className="zoom-switch" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={saveToApp}
                          onChange={e => setSaveToApp(e.target.checked)}
                        />
                        <span className="zoom-switch-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Local Recording Storage (Matching Image 4/5) */}
                <h2 className="zoom-content-header" style={{ marginTop: '22px' }}>Local recording storage</h2>
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Storage location</div>
                  <p className="zoom-section-card-desc">
                    Recordings will be stored locally at the selected location.
                  </p>

                  <div className="zoom-storage-path-box">
                    <div className="zoom-path-input-group">
                      <span className="zoom-folder-icon">📁</span>
                      <input
                        type="text"
                        className="zoom-path-text-field"
                        value={storagePath}
                        onChange={e => setStoragePath(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="zoom-path-action-btn"
                      onClick={() => alert(`📂 Storage Folder Location:\n\n${storagePath}\n\nRecordings are safely accessible in this PC folder.`)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="zoom-path-action-btn"
                      onClick={() => {
                        const newPath = prompt('Change local storage directory path:', storagePath);
                        if (newPath && newPath.trim()) setStoragePath(newPath.trim());
                      }}
                    >
                      Change
                    </button>
                  </div>

                  <div className="zoom-disk-space-text">
                    💾 20.2 GB remaining
                  </div>

                  <div className="zoom-toggle-row" style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.88rem' }}>Select local storage location after every meeting</span>
                    <label className="zoom-switch">
                      <input
                        type="checkbox"
                        checked={selectLocationAfterMeeting}
                        onChange={e => setSelectLocationAfterMeeting(e.target.checked)}
                      />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Recording Preferences (Matching Image 4/5) */}
                <h2 className="zoom-content-header" style={{ marginTop: '22px' }}>Recording preferences</h2>
                <div className="zoom-setting-section-card">
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '14px', color: '#1e293b' }}>
                    In my recordings:
                  </div>

                  <div className="zoom-toggle-row">
                    <span style={{ fontSize: '0.88rem' }}>Show participants names</span>
                    <label className="zoom-switch">
                      <input
                        type="checkbox"
                        checked={showParticipantsNames}
                        onChange={e => setShowParticipantsNames(e.target.checked)}
                      />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>

                  <div className="zoom-toggle-row">
                    <span style={{ fontSize: '0.88rem' }}>Include timestamp</span>
                    <label className="zoom-switch">
                      <input
                        type="checkbox"
                        checked={includeTimestamp}
                        onChange={e => setIncludeTimestamp(e.target.checked)}
                      />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>

                  <div className="zoom-toggle-row">
                    <span style={{ fontSize: '0.88rem' }}>Record video during screen sharing</span>
                    <label className="zoom-switch">
                      <input
                        type="checkbox"
                        checked={recordVideoScreenSharing}
                        onChange={e => setRecordVideoScreenSharing(e.target.checked)}
                      />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', cursor: 'pointer', fontSize: '0.88rem', color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={showSideBySide}
                      onChange={e => setShowSideBySide(e.target.checked)}
                    />
                    <span>Show video and screen share side-by-side</span>
                  </label>

                  <div style={{ marginTop: '18px' }}>
                    <button
                      type="button"
                      className="zoom-subtle-btn"
                      onClick={() => setShowAdvancedRecording(!showAdvancedRecording)}
                    >
                      {showAdvancedRecording ? 'Hide Advanced' : 'Advanced'}
                    </button>
                  </div>

                  {showAdvancedRecording && (
                    <div style={{ marginTop: '14px', padding: '12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.84rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '6px' }}>⚙️ Advanced Video & Audio Codec Specs:</div>
                      <div>• Video Format: WebM (VP9 / H.264 Baseline)</div>
                      <div>• Audio Format: Opus 48kHz Stereo (Lossless)</div>
                      <div>• Frame Rate: 30 FPS Hardware Accelerated</div>
                      <div>• Auto-split long recordings: 4GB segments</div>
                    </div>
                  )}
                </div>

                {/* Application Saved Recordings Library */}
                <h2 className="zoom-content-header" style={{ marginTop: '22px' }}>
                  Application Saved Recordings ({savedRecordingsList.length})
                </h2>
                <div className="zoom-setting-section-card">
                  <p className="zoom-section-card-desc">
                    These lectures are saved within your SyncLearn application library. You can watch them directly in the built-in video player or download them to your computer:
                  </p>

                  <div className="zoom-recordings-list">
                    {savedRecordingsList.map(rec => (
                      <div key={rec.id} className="zoom-recording-item-card">
                        <div className="zoom-rec-icon">🎬</div>
                        <div className="zoom-rec-info">
                          <div className="zoom-rec-title">{rec.title}</div>
                          <div className="zoom-rec-meta">
                            <span>🆔 Room: {rec.roomId}</span>
                            <span>📅 {rec.date}</span>
                            <span>⏱️ {rec.duration}</span>
                            <span>💾 {rec.size}</span>
                          </div>
                        </div>
                        <div className="zoom-rec-actions">
                          <button
                            type="button"
                            className="zoom-rec-btn-play"
                            onClick={() => setActivePlaybackRec(rec)}
                            title="Play inside App"
                          >
                            ▶ Watch in App
                          </button>
                          <button
                            type="button"
                            className="zoom-rec-btn-download"
                            onClick={() => handleDownloadSavedRecording(rec)}
                            title="Download to PC"
                          >
                            ⬇ PC Download
                          </button>
                          <button
                            type="button"
                            className="zoom-rec-btn-delete"
                            onClick={() => handleDeleteSavedRecording(rec.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In-App Video Playback Modal */}
                {activePlaybackRec && (
                  <div className="zoom-video-player-modal" onClick={() => setActivePlaybackRec(null)}>
                    <div className="zoom-video-player-box" onClick={e => e.stopPropagation()}>
                      <div className="zoom-video-player-header">
                        <span>🎬 In-App Video Player: {activePlaybackRec.title}</span>
                        <button type="button" onClick={() => setActivePlaybackRec(null)}>✕</button>
                      </div>
                      <div className="zoom-video-screen">
                        {activePlaybackRec.url ? (
                          <video src={activePlaybackRec.url} controls autoPlay style={{ width: '100%', height: '340px' }} />
                        ) : (
                          <div className="zoom-simulated-video">
                            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎓</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>SyncLearn Recorded Lecture</div>
                            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Playing directly inside application without external player</div>
                            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                              <span className="badge">⏱️ {activePlaybackRec.duration}</span>
                              <span className="badge">1080p HD</span>
                              <span className="badge">Opus Audio</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 6. Accessibility Tab (Matching Image 1) ── */}
            {activeTab === 'accessibility' && (
              <div>
                {/* Chat and Video Section */}
                <h2 className="zoom-content-header">Chat and video</h2>
                <div className="zoom-setting-section-card">
                  <div className="zoom-form-row" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label className="zoom-form-label" style={{ margin: 0 }}>Chat display size (ctrl+/-)</label>
                    <select
                      className="zoom-form-input"
                      style={{ width: '120px' }}
                      value={chatDisplaySize}
                      onChange={e => setChatDisplaySize(e.target.value)}
                    >
                      <option value="80%">80%</option>
                      <option value="90%">90%</option>
                      <option value="100%">100%</option>
                      <option value="110%">110%</option>
                      <option value="125%">125%</option>
                      <option value="150%">150%</option>
                    </select>
                  </div>

                  <div className="zoom-toggle-row">
                    <span style={{ fontSize: '0.88rem', maxWidth: '80%' }}>
                      Automatically dim video when flashing images or visual patterns (such as stripes) are detected.
                    </span>
                    <label className="zoom-switch">
                      <input
                        type="checkbox"
                        checked={dimFlashingVideo}
                        onChange={e => setDimFlashingVideo(e.target.checked)}
                      />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>

                  <div className="zoom-toggle-row" style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '0.88rem' }}>Disable GIF Animations</span>
                    <label className="zoom-switch">
                      <input
                        type="checkbox"
                        checked={disableGifAnimations}
                        onChange={e => setDisableGifAnimations(e.target.checked)}
                      />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>
                </div>

                {/* Closed Captioning Section (Matching Image 1) */}
                <h2 className="zoom-content-header" style={{ marginTop: '24px' }}>Closed captioning</h2>
                <div className="zoom-setting-section-card">
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px' }}>Font size</div>
                    <div className="zoom-caption-font-slider-row">
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Small</span>
                      <input
                        type="range"
                        min="14"
                        max="36"
                        value={captionFontSize}
                        onChange={e => setCaptionFontSize(Number(e.target.value))}
                        className="zoom-range-input"
                      />
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Large</span>
                    </div>
                  </div>

                  {/* Caption Color Swatches (Image 1) */}
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '8px' }}>Caption color:</div>
                    <div className="zoom-caption-swatches-grid">
                      {captionColorPresets.map(preset => (
                        <button
                          key={preset.id}
                          type="button"
                          className={`zoom-caption-swatch-btn ${selectedCaptionColor === preset.id ? 'active' : ''}`}
                          style={{ background: preset.bg, color: preset.text }}
                          onClick={() => setSelectedCaptionColor(preset.id)}
                          title={preset.label}
                        >
                          Aa
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Type */}
                  <div className="zoom-form-row">
                    <label className="zoom-form-label">Font type</label>
                    <select
                      className="zoom-form-input"
                      value={captionFontType}
                      onChange={e => setCaptionFontType(e.target.value)}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Segoe UI">Segoe UI</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Open Sans">Open Sans</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── 7. Share Screen Tab ── */}
            {activeTab === 'share' && (
              <div>
                <h2 className="zoom-content-header">Share Screen</h2>
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Screen Capture Quality</div>
                  <div className="zoom-toggle-row">
                    <span>Optimize for full screen video clip</span>
                    <label className="zoom-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>
                  <div className="zoom-toggle-row">
                    <span>Share system audio with screen</span>
                    <label className="zoom-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── 8. Chat Tab ── */}
            {activeTab === 'chat' && (
              <div>
                <h2 className="zoom-content-header">In-Meeting Chat</h2>
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">Chat Display & Preferences</div>
                  <div className="zoom-toggle-row">
                    <span>Show message preview banner in class</span>
                    <label className="zoom-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>
                  <div className="zoom-toggle-row">
                    <span>Auto-scroll to latest incoming messages</span>
                    <label className="zoom-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="zoom-switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── 9. Keyboard Shortcuts Tab ── */}
            {activeTab === 'shortcuts' && (
              <div>
                <h2 className="zoom-content-header">Keyboard Shortcuts</h2>
                <div className="zoom-setting-section-card">
                  <div className="zoom-shortcuts-table">
                    <div className="zoom-shortcut-row">
                      <span>Mute / Unmute Audio</span>
                      <kbd className="zoom-kbd">Alt + A</kbd>
                    </div>
                    <div className="zoom-shortcut-row">
                      <span>Start / Stop Video</span>
                      <kbd className="zoom-kbd">Alt + V</kbd>
                    </div>
                    <div className="zoom-shortcut-row">
                      <span>Start / Stop Session Recording</span>
                      <kbd className="zoom-kbd">Alt + R</kbd>
                    </div>
                    <div className="zoom-shortcut-row">
                      <span>Share / Stop Screen</span>
                      <kbd className="zoom-kbd">Alt + S</kbd>
                    </div>
                    <div className="zoom-shortcut-row">
                      <span>Show / Hide In-Class Chat</span>
                      <kbd className="zoom-kbd">Alt + H</kbd>
                    </div>
                    <div className="zoom-shortcut-row">
                      <span>Raise / Lower Hand</span>
                      <kbd className="zoom-kbd">Alt + Y</kbd>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 10. Statistics Tab ── */}
            {activeTab === 'statistics' && (
              <div>
                <h2 className="zoom-content-header">Statistics</h2>
                <div className="zoom-setting-section-card">
                  <div className="zoom-section-card-title">WebRTC & Audio/Video Status</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                    <div>Latency: <strong>22 ms</strong></div>
                    <div>Audio Bitrate: <strong>64 kbps (Opus)</strong></div>
                    <div>Video Resolution: <strong>1080p @ 30 FPS</strong></div>
                    <div>Security: <strong>DTLS-SRTP 256-bit Encrypted</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Tabs Fallback */}
            {!['general', 'account', 'video', 'audio', 'notifications', 'recording', 'accessibility', 'share', 'chat', 'shortcuts', 'statistics'].includes(activeTab) && (
              <div>
                <h2 className="zoom-content-header">{navItems.find(i => i.id === activeTab)?.label}</h2>
                <div className="zoom-setting-section-card">
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Settings for {navItems.find(i => i.id === activeTab)?.label} are configured with standard optimal defaults.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
