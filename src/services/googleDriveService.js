// Google Drive service for automatic cloud backup

class GoogleDriveService {
  constructor() {
    // Google Drive API configuration (safe for public repos - these are public client credentials)
    this.clientId = '621823898188-301emnsfbgc0gb7r2h3gjs30cf1b54ai.apps.googleusercontent.com';
    this.apiKey = 'AIzaSyAIBjkPqzSynnyOzzhLuPqmv-Ya5nUjgt8';
    this.discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    this.scopes = 'https://www.googleapis.com/auth/drive.file';
    
    this.isInitialized = false;
    this.isSignedIn = false;
    this.gapi = null;
    
    console.log('GoogleDriveService initialized with hardcoded credentials');
    console.log('Client ID length:', this.clientId.length);
    console.log('API Key length:', this.apiKey.length);
    console.log('Ready for Google Drive integration!');
  }

  // Initialize Google API
  async initialize() {
    if (this.isInitialized) return true;

    // Check if we have required credentials
    if (!this.clientId || !this.apiKey) {
      console.error('Google Drive credentials not configured');
      throw new Error('Google Drive credentials not configured. Please check your environment variables.');
    }

    try {
      console.log('Loading Google API script...');
      // Load Google API script
      await this.loadGoogleAPI();
      
      console.log('Initializing Google API client...');
      // Initialize gapi
      await new Promise((resolve, reject) => {
        window.gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject
        });
      });

      console.log('Configuring Google API client...');
      // Initialize the client
      await window.gapi.client.init({
        apiKey: this.apiKey,
        clientId: this.clientId,
        discoveryDocs: [this.discoveryDoc],
        scope: this.scopes
      });

      this.gapi = window.gapi;
      this.isInitialized = true;
      
      // Check if user is already signed in
      const authInstance = this.gapi.auth2.getAuthInstance();
      this.isSignedIn = authInstance.isSignedIn.get();
      
      console.log('Google Drive API initialized successfully');
      console.log('User signed in:', this.isSignedIn);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  // Load Google API script dynamically
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        console.log('Google API already loaded');
        resolve();
        return;
      }

      console.log('Loading Google API script...');
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        console.log('Google API script loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('Failed to load Google API script:', error);
        reject(new Error('Failed to load Google API script'));
      };
      document.head.appendChild(script);
    });
  }

  // Sign in to Google
  async signIn() {
    try {
      console.log('Starting Google Drive sign-in process...');
      
      if (!this.isInitialized) {
        console.log('Initializing Google API...');
        await this.initialize();
      }

      console.log('Getting auth instance...');
      const authInstance = this.gapi.auth2.getAuthInstance();
      
      if (!authInstance) {
        throw new Error('Failed to get Google auth instance');
      }

      console.log('Attempting sign-in...');
      const user = await authInstance.signIn();
      
      if (user && user.isSignedIn()) {
        this.isSignedIn = true;
        console.log('Successfully signed in to Google Drive');
        return true;
      } else {
        throw new Error('Sign-in was cancelled or failed');
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      console.error('Error details:', error.message, error.stack);
      throw error; // Re-throw so the UI can show the specific error
    }
  }

  // Sign out from Google
  async signOut() {
    if (!this.isInitialized) return;

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.isSignedIn = false;
      console.log('Signed out from Google Drive');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  }

  // Upload collection data to Google Drive
  async uploadCollection(cards) {
    if (!this.isSignedIn) {
      const signedIn = await this.signIn();
      if (!signedIn) {
        throw new Error('Failed to sign in to Google Drive');
      }
    }

    try {
      // Convert cards to JSON
      const collectionData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalCards: cards.length,
        totalValue: cards.reduce((sum, card) => sum + (card.price || 0), 0),
        cards: cards
      };

      const jsonContent = JSON.stringify(collectionData, null, 2);
      const filename = `pokemon-collection-backup-${this.getCurrentDate()}.json`;

      // Create file metadata
      const fileMetadata = {
        name: filename,
        parents: await this.getOrCreateBackupFolder()
      };

      // Upload file
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], {type: 'application/json'}));
      form.append('file', new Blob([jsonContent], {type: 'application/json'}));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({
          'Authorization': `Bearer ${this.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
        }),
        body: form
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Collection uploaded to Google Drive:', result);
        return {
          success: true,
          fileId: result.id,
          filename: filename,
          url: `https://drive.google.com/file/d/${result.id}/view`
        };
      } else {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to upload to Google Drive:', error);
      throw error;
    }
  }

  // Get or create backup folder in Google Drive
  async getOrCreateBackupFolder() {
    const folderName = 'Pokemon Card Collection Backups';
    
    try {
      // Search for existing folder
      const response = await this.gapi.client.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)'
      });

      if (response.result.files.length > 0) {
        console.log('Using existing backup folder:', response.result.files[0].id);
        return [response.result.files[0].id];
      }

      // Create new folder
      const folderResponse = await this.gapi.client.drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        }
      });

      console.log('Created new backup folder:', folderResponse.result.id);
      return [folderResponse.result.id];
    } catch (error) {
      console.error('Failed to get/create backup folder:', error);
      return []; // Upload to root if folder creation fails
    }
  }

  // Auto-sync functionality
  async autoSync(cards) {
    if (!this.isSignedIn) {
      console.log('Auto-sync skipped - not signed in to Google Drive');
      return false;
    }

    try {
      console.log('Auto-syncing collection to Google Drive...');
      const result = await this.uploadCollection(cards);
      console.log('Auto-sync completed:', result.filename);
      return true;
    } catch (error) {
      console.error('Auto-sync failed:', error);
      return false;
    }
  }

  // Get current date for filename
  getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}-${hours}${minutes}`;
  }

  // Check if user is signed in
  isUserSignedIn() {
    return this.isSignedIn;
  }

  // Get user info
  getUserInfo() {
    if (!this.isSignedIn || !this.gapi) return null;
    
    const user = this.gapi.auth2.getAuthInstance().currentUser.get();
    const profile = user.getBasicProfile();
    
    return {
      name: profile.getName(),
      email: profile.getEmail(),
      imageUrl: profile.getImageUrl()
    };
  }
}

// Create singleton instance
const googleDriveService = new GoogleDriveService();

export default googleDriveService;
