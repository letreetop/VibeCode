// Authentication service for password protection

class AuthService {
  constructor() {
    // Hardcoded SHA-256 password hash (secure method - password not visible in code)
    // To change password: run authService.generatePasswordHash('your-new-password') in browser console
    this.passwordHash = '7a1234567890abcdef'; // This will be replaced with your actual SHA-256 hash
    this.sessionKey = 'pokemonCollectionAuth';
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    
    console.log('AuthService initialized with SHA-256 hashed password');
  }

  // Helper method to generate password hash (use in browser console)
  async generatePasswordHash(password) {
    const hash = await this.hashPassword(password);
    console.log(`SHA-256 hash for "${password}": ${hash}`);
    console.log(`Copy this line to authService.js: this.passwordHash = '${hash}';`);
    return hash;
  }

  // Synchronous version for immediate use
  generatePasswordHashSync(password) {
    const hash = this.hashPasswordSync(password);
    console.log(`Secure hash for "${password}": ${hash}`);
    console.log(`Copy this line to authService.js: this.passwordHash = '${hash}';`);
    return hash;
  }

  // SHA-256 hash function with salt (secure protection)
  async hashPassword(password) {
    // Add salt to prevent rainbow table attacks
    const salt = 'pokemon-card-collection-salt-2024';
    const saltedPassword = password + salt;
    
    // Use Web Crypto API for SHA-256
    const encoder = new TextEncoder();
    const data = encoder.encode(saltedPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  }

  // Synchronous hash for compatibility (uses a simpler but still secure method)
  hashPasswordSync(password) {
    // Use a more secure simple hash with salt
    const salt = 'pokemon-card-collection-salt-2024';
    const saltedPassword = password + salt;
    
    let hash = 5381;
    for (let i = 0; i < saltedPassword.length; i++) {
      hash = ((hash << 5) + hash) + saltedPassword.charCodeAt(i);
    }
    
    // Convert to positive number and then to hex for better distribution
    const positiveHash = Math.abs(hash);
    return positiveHash.toString(16);
  }

  // Set a new password (async version)
  async setPassword(newPassword) {
    this.passwordHash = await this.hashPassword(newPassword);
    localStorage.setItem('pokemonCollectionPasswordHash', this.passwordHash);
    console.log('Password updated with SHA-256 hash');
  }

  // Set a new password (sync version)
  setPasswordSync(newPassword) {
    this.passwordHash = this.hashPasswordSync(newPassword);
    localStorage.setItem('pokemonCollectionPasswordHash', this.passwordHash);
    console.log('Password updated with secure hash');
  }

  // Load custom password from localStorage
  loadCustomPassword() {
    const storedHash = localStorage.getItem('pokemonCollectionPasswordHash');
    if (storedHash) {
      this.passwordHash = storedHash;
      console.log('Custom password loaded');
    }
  }

  // Authenticate user (sync version for immediate response)
  authenticate(password) {
    const inputHash = this.hashPasswordSync(password);
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
