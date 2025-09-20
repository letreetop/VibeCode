// Repository storage service for persisting collection data in GitHub

class RepositoryStorageService {
  constructor() {
    this.repoOwner = 'letreetop';
    this.repoName = 'VibeCode';
    this.dataPath = 'data/collection.json';
    this.githubApiBase = 'https://api.github.com';
    
    console.log('Repository storage service initialized');
  }

  // Load collection from repository
  async loadCollection() {
    try {
      console.log('Loading collection from repository...');
      
      const response = await fetch(`${this.githubApiBase}/repos/${this.repoOwner}/${this.repoName}/contents/${this.dataPath}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Decode base64 content
        const content = atob(data.content);
        const collection = JSON.parse(content);
        
        console.log('Collection loaded from repository:', collection.cards?.length || 0, 'cards');
        return {
          success: true,
          data: collection
        };
      } else if (response.status === 404) {
        // File doesn't exist yet - return empty collection
        console.log('No collection file found - starting with empty collection');
        return {
          success: true,
          data: { cards: [], lastUpdated: null }
        };
      } else {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load collection from repository:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save collection to repository (requires GitHub token for private repos)
  async saveCollection(cards, githubToken = null) {
    if (!githubToken) {
      console.log('No GitHub token provided - using local storage only');
      return { success: false, error: 'GitHub token required for repository storage' };
    }

    try {
      console.log('Saving collection to repository...');
      
      const collection = {
        cards: cards,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
        totalCards: cards.length,
        totalValue: cards.reduce((sum, card) => sum + (card.price || 0), 0)
      };

      const content = JSON.stringify(collection, null, 2);
      const encodedContent = btoa(content);

      // Check if file exists to get SHA
      let sha = null;
      try {
        const existingResponse = await fetch(`${this.githubApiBase}/repos/${this.repoOwner}/${this.repoName}/contents/${this.dataPath}`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          sha = existingData.sha;
        }
      } catch (error) {
        // File doesn't exist yet
      }

      // Create or update file
      const payload = {
        message: `Update collection - ${cards.length} cards (${new Date().toLocaleString()})`,
        content: encodedContent,
        ...(sha && { sha })
      };

      const response = await fetch(`${this.githubApiBase}/repos/${this.repoOwner}/${this.repoName}/contents/${this.dataPath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Collection saved to repository successfully');
        return {
          success: true,
          commitSha: result.commit.sha,
          url: result.content.html_url
        };
      } else {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to save collection to repository:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a simple GitHub token manager
  getStoredGitHubToken() {
    return localStorage.getItem('githubToken');
  }

  setGitHubToken(token) {
    localStorage.setItem('githubToken', token);
    console.log('GitHub token stored');
  }

  removeGitHubToken() {
    localStorage.removeItem('githubToken');
    console.log('GitHub token removed');
  }

  // Check if repository storage is available
  isAvailable() {
    return !!this.getStoredGitHubToken();
  }

  // Sync with repository (load + save)
  async syncCollection(localCards) {
    const token = this.getStoredGitHubToken();
    if (!token) {
      return { success: false, error: 'No GitHub token configured' };
    }

    try {
      // Load from repository
      const loadResult = await this.loadCollection();
      if (!loadResult.success) {
        return loadResult;
      }

      const repoCards = loadResult.data.cards || [];
      const repoLastUpdated = loadResult.data.lastUpdated;
      
      // Simple merge strategy: use newer data
      const localLastUpdated = localStorage.getItem('collectionLastUpdated');
      
      if (!localLastUpdated || (repoLastUpdated && new Date(repoLastUpdated) > new Date(localLastUpdated))) {
        // Repository is newer - use repository data
        console.log('Repository data is newer - updating local collection');
        return {
          success: true,
          action: 'loaded',
          cards: repoCards,
          message: `Loaded ${repoCards.length} cards from repository`
        };
      } else {
        // Local is newer or same - save to repository
        console.log('Local data is newer - saving to repository');
        const saveResult = await this.saveCollection(localCards, token);
        return {
          success: saveResult.success,
          action: 'saved',
          cards: localCards,
          message: saveResult.success ? `Saved ${localCards.length} cards to repository` : saveResult.error
        };
      }
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
const repositoryStorageService = new RepositoryStorageService();

export default repositoryStorageService;
