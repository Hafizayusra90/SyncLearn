import React, { useState } from 'react';
import { isValidRealEmail, isValidRealName } from './utils/validation';
import { API_BASE } from './socket';
import './ProfilePage.css';

function ProfilePage({ user, onBackToDashboard, onNavigate }) {
  const [profileName, setProfileName] = useState(user?.name && user.name !== 'Hafiza Yusra' ? user.name : (user?.name || ''));
  const [email, setEmail] = useState(user?.email || '');
  const [recoveryEmail, setRecoveryEmail] = useState(user?.recoveryEmail || '');
  const [role] = useState(user?.role || 'Student');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saveStatus, setSaveStatus] = useState('');

  // Unified click handler for Back button
  const handleBack = (e) => {
    e.preventDefault();
    if (typeof onBackToDashboard === 'function') {
      onBackToDashboard();
    } else if (typeof onNavigate === 'function') {
      onNavigate('dashboard');
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaveStatus('');

    // Real name validation
    if (!profileName.trim() || !isValidRealName(profileName)) {
      setSaveStatus('❌ Please enter a valid real name (minimum 2 letters, no numbers).');
      return;
    }

    // Real active email validation
    if (!email.trim() || !isValidRealEmail(email)) {
      setSaveStatus('❌ Please enter a valid, active email address that exists (e.g. name@gmail.com).');
      return;
    }

    // Real recovery email validation
    if (recoveryEmail.trim() && !isValidRealEmail(recoveryEmail)) {
      setSaveStatus('❌ Please enter a valid, active recovery email address.');
      return;
    }

    if (recoveryEmail.trim() && recoveryEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
      setSaveStatus('❌ Recovery email cannot be identical to your primary email address.');
      return;
    }

    setSaveStatus('Saving...');
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || email.trim(),
          newEmail: email.trim(),
          name: profileName.trim(),
          recoveryEmail: recoveryEmail.trim(),
          avatar
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSaveStatus('✅ Profile updated successfully!');
        const updated = {
          ...(user || {}),
          name: profileName.trim(),
          email: email.trim(),
          recoveryEmail: recoveryEmail.trim(),
          avatar
        };
        localStorage.setItem('user', JSON.stringify(updated));
        setTimeout(() => setSaveStatus(''), 3500);
      } else {
        setSaveStatus('❌ Error: ' + (data.message || 'Failed to update profile'));
      }
    } catch (err) {
      setSaveStatus('❌ Connection error: ' + err.message);
    }
  };

  return (
    <div className="profile-container">
      {/* Navigation Header */}
      <nav className="profile-nav">
        <div className="logo-container">
          <img src="/logo.png" alt="SyncLearn" className="logo-img" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span className="logo-text">SyncLearn</span>
        </div>
        <button 
          type="button" 
          className="back-btn" 
          onClick={handleBack}
          style={{ cursor: 'pointer' }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="profile-content">
        <h1>Account & Hardware Settings ⚙️</h1>

        {/* User Identity Details Card */}
        <div className="profile-card">
          <h2>👤 Account Details</h2>
          <div className="user-info-grid">
            <div className="avatar-badge-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1' }}
                />
              ) : (
                <div className="avatar-badge">
                  {profileName.charAt(0).toUpperCase()}
                </div>
              )}
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#6366f1',
                  cursor: 'pointer',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(99, 102, 241, 0.25)'
                }}
              >
                📷 Change Photo
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => setAvatar(ev.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            
            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label>Recovery Email Address (For Account & Password Recovery)</label>
                <input
                  type="email"
                  placeholder="Enter recovery email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="profile-input"
                />
              </div>

              <div className="profile-field">
                <label>System Role</label>
                <input
                  type="text"
                  value={role.toUpperCase()}
                  disabled
                  className="profile-input"
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)'
                }}
              >
                Save Changes
              </button>

              {saveStatus && (
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: saveStatus.includes('✅') ? '#4ade80' : '#f87171',
                  marginTop: '0.4rem'
                }}>
                  {saveStatus}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;