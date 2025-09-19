import React, { useState } from 'react';
import authService from '../services/authService';
import './LoginScreen.css';

const LoginScreen = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

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
      setAttempts(prev => prev + 1);
      setError(`Incorrect password. Please try again. (Attempt ${attempts + 1})`);
      setPassword('');
      
      // Add delay after multiple failed attempts
      if (attempts >= 2) {
        setTimeout(() => setError(''), 3000);
      }
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
          <p>Enter password to access your private collection</p>
        </div>

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

          <button type="submit" className="login-btn" disabled={attempts >= 5}>
            {attempts >= 5 ? '🔒 Too Many Attempts' : '🔓 Access Collection'}
          </button>

          {attempts >= 3 && (
            <div className="security-notice">
              <small>Multiple failed attempts detected. Please verify you have the correct password.</small>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
