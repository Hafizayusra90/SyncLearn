import React, { useState } from 'react';
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

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeRoomId, setActiveRoomId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleEnterWorkspace = () => {
    if (isLoggedIn) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('auth');
    }
  };

  const handleJoinRoom = (roomId) => {
    setActiveRoomId(roomId);
    setCurrentPage('room');
  };

  return (
    <div className="app-main">
      {currentPage === 'home' && (
        <LandingPage 
          onJoinRoom={handleJoinRoom} 
          onNavigate={handleNavigate}
          onEnterWorkspace={handleEnterWorkspace}
        />
      )}

      {currentPage === 'auth' && (
        <AuthPage 
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setCurrentPage('dashboard');
          }}
          onNavigate={handleNavigate}
        />
      )}

{currentPage === 'dashboard' && (
  <DashboardPage 
    user={{ name: 'Hafiza Yusra' }}
    onJoinRoom={handleJoinRoom}
    onNavigate={handleNavigate}
    onOpenAnalytics={() => handleNavigate('analytics')}
    onOpenProfile={() => handleNavigate('profile')}
    onBackToHome={() => {
      setIsLoggedIn(false);
      handleNavigate('home');
    }}
  />
)}

      {currentPage === 'analytics' && (
        <AnalyticsPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'profile' && (
        <ProfilePage onNavigate={handleNavigate} />
      )}
      
      {currentPage === 'features' && (
        <FeaturesPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'about' && (
        <AboutPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'demo' && (
        <DemoPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'summary' && (
        <SummaryPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'room' && (
        <ActiveRoomPage 
          roomId={activeRoomId} 
          onLeaveRoom={() => setCurrentPage('dashboard')} 
        />
      )}
    </div>
  );
}

export default App;