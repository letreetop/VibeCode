// Authentication service for password protection

class AuthService {
  constructor() {
    // You can change this password - it's hashed for basic security
    this.passwordHash = this.hashPassword('pokemon123'); // Default password
    this.sessionKey = 'pokemonCollectionAuth';
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    
    console.log('AuthService initialized');
  }

  // Simple hash function (for basic protection)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Set a new password
  setPassword(newPassword) {
    this.passwordHash = this.hashPassword(newPassword);
    localStorage.setItem('pokemonCollectionPasswordHash', this.passwordHash);
    console.log('Password updated');
  }

  // Load custom password from localStorage
  loadCustomPassword() {
    const storedHash = localStorage.getItem('pokemonCollectionPasswordHash');
    if (storedHash) {
      this.passwordHash = storedHash;
      console.log('Custom password loaded');
    }
  }

  // Authenticate user
  authenticate(password) {
    const inputHash = this.hashPassword(password);
    const isValid = inputHash === this.passwordHash;
    
    if (isValid) {
      const session = {
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + this.sessionTimeout
      };
      
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      console.log('Authentication successful');
      return true;
    }
    
    console.log('Authentication failed');
    return false;
  }

  // Check if user is currently authenticated
  isAuthenticated() {
    try {
      const session = localStorage.getItem(this.sessionKey);
      if (!session) return false;
      
      const sessionData = JSON.parse(session);
      const now = Date.now();
      
      // Check if session is expired
      if (now > sessionData.expires) {
        this.logout();
        return false;
      }
      
      // Extend session on activity
      if (now > sessionData.timestamp + (60 * 60 * 1000)) { // Extend if older than 1 hour
        sessionData.timestamp = now;
        sessionData.expires = now + this.sessionTimeout;
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
      }
      
      return sessionData.authenticated;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem(this.sessionKey);
    console.log('User logged out');
  }

  // Get session info
  getSessionInfo() {
    try {
      const session = localStorage.getItem(this.sessionKey);
      if (!session) return null;
      
      const sessionData = JSON.parse(session);
      return {
        authenticated: sessionData.authenticated,
        loginTime: new Date(sessionData.timestamp),
        expiresAt: new Date(sessionData.expires),
        timeRemaining: sessionData.expires - Date.now()
      };
    } catch (error) {
      return null;
    }
  }

  // Check if password is the default
  isDefaultPassword() {
    const defaultHash = this.hashPassword('pokemon123');
    return this.passwordHash === defaultHash;
  }

  // Get password strength
  getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return {
      score: strength,
      level: levels[Math.min(strength, 4)]
    };
  }
}

// Create singleton instance
const authService = new AuthService();

// Load any custom password on initialization
authService.loadCustomPassword();

export default authService;
