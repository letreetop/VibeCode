import React, { useState, useEffect } from 'react';
import './ApiKeyManager.css';

const ApiKeyManager = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Check if API key is stored in localStorage or if user skipped
    const storedKey = localStorage.getItem('psaApiKey');
    const wasConfigured = localStorage.getItem('psaApiConfigured');
    
    if (storedKey) {
      setApiKey(storedKey);
      setIsConfigured(true);
      onApiKeyChange(storedKey);
    } else if (wasConfigured === 'true') {
      // User previously configured (either with key or skip)
      setIsConfigured(true);
      onApiKeyChange('skip');
    }
  }, [onApiKeyChange]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('psaApiKey', apiKey.trim());
      localStorage.setItem('psaApiConfigured', 'true');
      setIsConfigured(true);
      setShowSetup(false);
      onApiKeyChange(apiKey.trim());
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('psaApiKey');
    setApiKey('');
    setIsConfigured(false);
    onApiKeyChange('');
  };

  if (!isConfigured) {
    return (
      <div className="api-key-setup">
        <div className="setup-card">
          <h3>🔑 PSA API Setup</h3>
          <p>To use PSA graded card lookup, please enter your PSA API key:</p>
          
          <div className="key-input-group">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your PSA API key"
              className="key-input"
            />
            <button onClick={handleSaveKey} className="save-key-btn">
              Save Key
            </button>
          </div>
          
          <div className="setup-help">
            <details>
              <summary>How to get a PSA API key</summary>
              <ol>
                <li>Go to <a href="https://www.psacard.com/publicapi/documentation" target="_blank" rel="noopener noreferrer">PSA API Documentation</a></li>
                <li>Sign up or log in to your PSA account</li>
                <li>Generate an API access token</li>
                <li>Copy and paste it above</li>
              </ol>
              <p><strong>Note:</strong> Your API key is stored locally in your browser and never shared.</p>
            </details>
          </div>
          
          <button 
            onClick={() => {
              localStorage.setItem('psaApiConfigured', 'true');
              setIsConfigured(true);
              onApiKeyChange('skip');
            }} 
            className="skip-btn"
          >
            Skip (Use without PSA lookup)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="api-key-status">
      <div className="status-indicator">
        <span className="status-icon">✅</span>
        <span>PSA API Configured</span>
        <button onClick={() => setShowSetup(true)} className="change-key-btn">
          Change Key
        </button>
      </div>
      
      {showSetup && (
        <div className="key-change-modal">
          <div className="modal-content">
            <h4>Update PSA API Key</h4>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter new PSA API key"
              className="key-input"
            />
            <div className="modal-actions">
              <button onClick={handleSaveKey} className="save-key-btn">
                Update Key
              </button>
              <button onClick={handleRemoveKey} className="remove-key-btn">
                Remove Key
              </button>
              <button onClick={() => setShowSetup(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
