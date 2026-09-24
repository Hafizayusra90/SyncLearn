import React, { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import DashboardPage from './DashboardPage';
import ActiveRoomPage from './ActiveRoomPage';
import FeaturesPage from './FeaturesPage';
import AboutPage from './AboutPage';
import DemoPage from './DemoPage';
import SummaryPage from './SummaryPage';
import ProfilePage from './ProfilePage';
import AnalyticsPage from './AnalyticsPage';
import PreJoinModal from './PreJoinModal';
import SettingsModal from './SettingsModal';

// Single shared socket — imported from socket.js (no duplicate here)
import { socket } from './socket';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#f8fafc',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Something went wrong loading this view</h2>
          <p style={{ color: '#94a3b8', margin: '0.8rem 0 1.5rem', maxWidth: 450, fontSize: '0.9rem' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.92rem',
              boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
            }}
          >
            ← Return to SyncLearn Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('synclearn-theme-v2') || 'light');
  const [currentPage, setCurrentPage] = useState('home');
  const [activeRoomId, setActiveRoomId] = useState('');
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : { name: 'Hafiza Yusra', role: 'student' };
    } catch (e) {
      return { name: 'Hafiza Yusra', role: 'student' };
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token') || !!localStorage.getItem('user'));

  // ── Image 1: Pre-Join Preview Modal States ──
  const [isPreJoinOpen, setIsPreJoinOpen] = useState(false);
  const [preJoinRoomId, setPreJoinRoomId] = useState('');
  const [isStudentLinkJoin, setIsStudentLinkJoin] = useState(false);
  const [preJoinMediaState, setPreJoinMediaState] = useState({ micOn: true, videoOn: true, blurBackground: false });

  // ── Image 1 & 2: Settings Modal States ──
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');

  const handleOpenSettings = (tab = 'general') => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleUpdateUserRole = (newRole) => {
    setUser(prev => {
      const updated = { ...(prev || { name: 'Hafiza Yusra' }), role: newRole };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  // Sync theme with document attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('synclearn-theme-v2', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Monitor global socket connection status
  useEffect(() => {
    socket.on('connect',    () => console.log('⚡ Socket connected:', socket.id));
    socket.on('disconnect', () => console.log('❌ Socket disconnected'));
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const extractCleanRoom = (raw) => {
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
    return val.replace(/^https?:\/\/[^/]+\/?/i, '').replace(/[^a-zA-Z0-9_-]/g, '').trim() || val.trim();
  };

  // Auto-join room via invite link (?room=xxxx) -> Shows Image 1 Preview with real name input!
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomFromUrl = params.get('room');
      if (roomFromUrl && roomFromUrl.trim()) {
        const sanitizedRoom = extractCleanRoom(roomFromUrl);
        if (sanitizedRoom) {
          setPreJoinRoomId(sanitizedRoom);
          setIsStudentLinkJoin(true);
          setIsPreJoinOpen(true);
        }
      }
    } catch (err) {
      console.error('URL invite parse error:', err);
    }
  }, []);

  const handleNavigate = (page) => setCurrentPage(page);

  const handleEnterWorkspace = () => {
    setCurrentPage(isLoggedIn ? 'dashboard' : 'auth');
  };

  // When instructor or student joins a room, show Image 1 Preview first
  const handleJoinRoom = (roomId) => {
    const clean = extractCleanRoom(roomId);
    const targetRoom = clean || roomId || '849-291-034';
    setPreJoinRoomId(targetRoom);
    setIsStudentLinkJoin(user?.role !== 'instructor');
    setIsPreJoinOpen(true);
  };

  const handleLeaveRoom = () => {
    if (window.location.search.includes('room=')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setIsPreJoinOpen(false);
    setCurrentPage(isLoggedIn ? 'dashboard' : 'home');
  };

  // User requirement: Image 3 preview popup after signup/login for both instructor and student
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
    setPreJoinRoomId('849-291-034');
    setIsStudentLinkJoin(userData?.role === 'student');
    setIsPreJoinOpen(true);
  };

  const handlePreJoinConfirm = ({ name, micOn, videoOn, blurBackground }) => {
    setPreJoinMediaState({
      micOn: micOn !== false,
      videoOn: videoOn !== false,
      blurBackground: !!blurBackground,
    });
    if (name) {
      setUser(prev => {
        const updated = { ...(prev || { role: 'student' }), name };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    }
    const target = preJoinRoomId || '849-291-034';
    setActiveRoomId(target);
    setIsPreJoinOpen(false);
    setCurrentPage('room');
  };

  const handlePreJoinClose = () => {
    setIsPreJoinOpen(false);
    if (currentPage === 'auth' || !isLoggedIn) {
      setCurrentPage(isLoggedIn ? 'dashboard' : 'home');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsPreJoinOpen(false);
    setCurrentPage('home');
  };

  return (
    <div className="app-main">
      <ErrorBoundary>
        {currentPage === 'home' && (
          <LandingPage
            onNavigate={handleNavigate}
            onEnterWorkspace={handleEnterWorkspace}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            user={user || { name: 'Hafiza Yusra', role: 'student' }}
            onJoinRoom={handleJoinRoom}
            onNavigate={handleNavigate}
            onOpenAnalytics={() => handleNavigate('analytics')}
            onOpenProfile={() => handleNavigate('profile')}
            onOpenSettings={handleOpenSettings}
            onBackToHome={handleLogout}
            onLogout={handleLogout}
            theme={theme}
            onToggleTheme={toggleTheme}
            onUpdateRole={handleUpdateUserRole}
          />
        )}

        {currentPage === 'analytics' && (
          <AnalyticsPage onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} />
        )}

        {currentPage === 'profile' && (
          <ProfilePage
            user={user}
            onNavigate={handleNavigate}
            onBackToDashboard={() => handleNavigate('dashboard')}
            onOpenSettings={handleOpenSettings}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {currentPage === 'features' && (
          <FeaturesPage onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} />
        )}

        {currentPage === 'demo' && (
          <DemoPage onNavigate={handleNavigate} theme={theme} onToggleTheme={toggleTheme} />
        )}

        {currentPage === 'summary' && (
          <SummaryPage
            roomId={activeRoomId}
            onBackToDashboard={() => handleNavigate('dashboard')}
            onNavigate={handleNavigate}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}

        {currentPage === 'room' && (
          <ActiveRoomPage
            roomId={activeRoomId}
            user={user}
            onLeaveRoom={handleLeaveRoom}
            onOpenSettings={handleOpenSettings}
            theme={theme}
            onToggleTheme={toggleTheme}
            initialMicOn={preJoinMediaState.micOn}
            initialVideoOn={preJoinMediaState.videoOn}
            initialBlurBackground={preJoinMediaState.blurBackground}
          />
        )}

        {/* ── Image 1: Pre-Join Preview Screen ── */}
        <PreJoinModal
          isOpen={isPreJoinOpen}
          onClose={handlePreJoinClose}
          onJoin={handlePreJoinConfirm}
          onOpenSettings={handleOpenSettings}
          user={user}
          roomId={preJoinRoomId}
          isInstructor={user?.role === 'instructor' && !isStudentLinkJoin}
          isStudentJoinLink={isStudentLinkJoin}
        />

        {/* ── Image 2: Zoom-Style Settings Modal (Appearance, Profile Picture & Hardware) ── */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialTab={settingsTab}
          user={user}
          onUpdateUser={handleUpdateUser}
          theme={theme}
          onSetTheme={setTheme}
        />
      </ErrorBoundary>
    </div>
  );
}

export default App;