import React, { useState } from 'react';
import authService from '../services/authService';
import './LoginScreen.css';

const LoginScreen = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDefaultWarning, setShowDefaultWarning] = useState(authService.isDefaultPassword());

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    const success = authService.authenticate(password);
    if (success) {
      onLoginSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handlePasswordSetup = (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    authService.setPassword(newPassword);
    setShowPasswordSetup(false);
    setShowDefaultWarning(false);
    setNewPassword('');
    setConfirmPassword('');
    alert('✅ Password updated successfully! Please log in with your new password.');
  };

  const getPasswordStrength = () => {
    if (!newPassword) return null;
    return authService.getPasswordStrength(newPassword);
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1>🃏 Pokemon Card Collection</h1>
          <p>Enter password to access your collection</p>
        </div>

        {showDefaultWarning && (
          <div className="default-warning">
            <p>⚠️ You're using the default password. <button onClick={() => setShowPasswordSetup(true)} className="change-password-link">Change it now</button> for better security.</p>
          </div>
        )}

        {!showPasswordSetup ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="password-input"
                autoFocus
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn">
              🔓 Access Collection
            </button>

            <div className="login-footer">
              <button 
                type="button" 
                onClick={() => setShowPasswordSetup(true)}
                className="setup-password-btn"
              >
                Change Password
              </button>
              
              {authService.isDefaultPassword() && (
                <div className="default-password-hint">
                  <small>Default password: <code>pokemon123</code></small>
                </div>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSetup} className="password-setup-form">
            <h3>Set New Password</h3>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="password-input"
              />
              {newPassword && (
                <div className={`password-strength ${getPasswordStrength()?.level.toLowerCase().replace(' ', '-')}`}>
                  Strength: {getPasswordStrength()?.level}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="password-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="save-password-btn">
                💾 Save Password
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowPasswordSetup(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className="cancel-setup-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
