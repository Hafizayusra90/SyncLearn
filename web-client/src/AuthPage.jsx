import React, { useState } from 'react';
import './AuthPage.css';

function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student'); // 'student' | 'instructor'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      onLoginSuccess({ email: formData.email, role });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <span style={{ fontSize: '2.5rem' }}>🚀</span>
          <h1>SyncLearn</h1>
          <p>{isLogin ? 'Welcome back! Sign in to continue.' : 'Create an account to get started.'}</p>
        </div>

        {/* Student / Instructor Role Toggle */}
        <div className="role-toggle">
          <button
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            🎓 Student
          </button>
          <button
            className={`role-btn ${role === 'instructor' ? 'active' : ''}`}
            onClick={() => setRole('instructor')}
          >
            👨‍🏫 Instructor
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="auth-input"
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="name@university.edu"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="auth-input"
            />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? `Sign In as ${role === 'student' ? 'Student' : 'Instructor'}` : 'Create Account'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Social Logins */}
        <div className="social-buttons">
          <button className="social-btn" onClick={() => onLoginSuccess({ email: 'google-user@gmail.com', role })}>
            <span>🌐</span> Google
          </button>
          <button className="social-btn" onClick={() => onLoginSuccess({ email: 'github-user@github.com', role })}>
            <span>💻</span> GitHub
          </button>
        </div>

        {/* Switch Login / Sign Up */}
        <div className="auth-footer">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button className="toggle-mode-btn" onClick={() => setIsLogin(false)}>
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button className="toggle-mode-btn" onClick={() => setIsLogin(true)}>
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;