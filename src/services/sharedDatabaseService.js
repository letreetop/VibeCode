// Shared database service for collaborative card/product database

class SharedDatabaseService {
  constructor() {
    this.repoOwner = 'letreetop';
    this.repoName = 'VibeCode';
    this.cardDatabasePath = 'data/card-database.json';
    this.githubApiBase = 'https://api.github.com';
    
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
    
    console.log('Shared database service initialized');
  }

  // Load shared card database from repository
  async loadCardDatabase() {
    const cacheKey = 'card-database';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('Loading shared card database...');
      
      const response = await fetch(`${this.githubApiBase}/repos/${this.repoOwner}/${this.repoName}/contents/${this.cardDatabasePath}`);
      
      if (response.ok) {
        const data = await response.json();
        const content = atob(data.content);
        const database = JSON.parse(content);
        
        const result = {
          success: true,
          cards: database.cards || [],
          sealedProducts: database.sealedProducts || []
        };
        
        this.setCache(cacheKey, result);
        console.log('Loaded shared database:', result.cards.length, 'cards,', result.sealedProducts.length, 'sealed products');
        return result;
      } else if (response.status === 404) {
        console.log('No shared database found - starting with empty database');
        return {
          success: true,
          cards: [],
          sealedProducts: []
        };
      } else {
        throw new Error(`GitHub API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to load shared database:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search cards in shared database
  async searchCards(query) {
    const database = await this.loadCardDatabase();
    if (!database.success) return [];

    const searchLower = query.toLowerCase();
    return database.cards.filter(card => 
      card.name.toLowerCase().includes(searchLower) ||
      card.set.toLowerCase().includes(searchLower) ||
      (card.cardNumber && card.cardNumber.toLowerCase().includes(searchLower))
    ).slice(0, 10); // Return top 10 matches
  }

  // Search sealed products in shared database
  async searchSealedProducts(query) {
    const database = await this.loadCardDatabase();
    if (!database.success) return [];

    const searchLower = query.toLowerCase();
    return database.sealedProducts.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.set.toLowerCase().includes(searchLower)
    ).slice(0, 10);
  }

  // Add new card to shared database (requires GitHub token)
  async addCardToDatabase(cardData, githubToken) {
    if (!githubToken) {
      console.log('No GitHub token - card not added to shared database');
      return { success: false, error: 'GitHub token required' };
    }

    try {
      // Load current database
      const database = await this.loadCardDatabase();
      if (!database.success) {
        throw new Error('Failed to load current database');
      }

      // Create card entry for shared database
      const cardId = this.generateCardId(cardData);
      const newCard = {
        id: cardId,
        name: cardData.name,
        set: cardData.set,
        cardNumber: cardData.cardNumber,
        rarity: cardData.rarity,
        image: cardData.image,
        category: cardData.category,
        addedBy: 'user',
        addedDate: new Date().toISOString().split('T')[0]
      };

      // Check if card already exists
      const exists = database.cards.some(card => card.id === cardId);
      if (exists) {
        console.log('Card already exists in shared database');
        return { success: true, message: 'Card already in database' };
      }

      // Add to database
      const updatedDatabase = {
        cards: [...database.cards, newCard],
        sealedProducts: database.sealedProducts,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };

      // Save to repository
      const saveResult = await this.saveDatabaseToRepo(updatedDatabase, githubToken);
      
      if (saveResult.success) {
        // Clear cache to force reload
        this.cache.delete('card-database');
        console.log('Card added to shared database:', newCard.name);
      }

      return saveResult;
    } catch (error) {
      console.error('Failed to add card to database:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add sealed product to shared database
  async addSealedProductToDatabase(productData, githubToken) {
    if (!githubToken) {
      console.log('No GitHub token - product not added to shared database');
      return { success: false, error: 'GitHub token required' };
    }

    try {
      const database = await this.loadCardDatabase();
      if (!database.success) {
        throw new Error('Failed to load current database');
      }

      const productId = this.generateProductId(productData);
      const newProduct = {
        id: productId,
        name: productData.name,
        set: productData.set || 'N/A',
        type: productData.type,
        image: productData.image,
        description: productData.notes || '',
        addedBy: 'user',
        addedDate: new Date().toISOString().split('T')[0]
      };

      const exists = database.sealedProducts.some(product => product.id === productId);
      if (exists) {
        console.log('Product already exists in shared database');
        return { success: true, message: 'Product already in database' };
      }

      const updatedDatabase = {
        cards: database.cards,
        sealedProducts: [...database.sealedProducts, newProduct],
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };

      const saveResult = await this.saveDatabaseToRepo(updatedDatabase, githubToken);
      
      if (saveResult.success) {
        this.cache.delete('card-database');
        console.log('Product added to shared database:', newProduct.name);
      }

      return saveResult;
    } catch (error) {
      console.error('Failed to add product to database:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save database to repository
  async saveDatabaseToRepo(database, githubToken) {
    try {
      const content = JSON.stringify(database, null, 2);
      const encodedContent = btoa(content);

      // Get current file SHA
      let sha = null;
      try {
        const existingResponse = await fetch(`${this.githubApiBase}/repos/${this.repoOwner}/${this.repoName}/contents/${this.cardDatabasePath}`, {
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

      const payload = {
        message: `Update shared database - ${database.cards.length} cards, ${database.sealedProducts.length} products`,
        content: encodedContent,
        ...(sha && { sha })
      };

      const response = await fetch(`${this.githubApiBase}/repos/${this.repoOwner}/${this.repoName}/contents/${this.cardDatabasePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Failed to save database to repository:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate unique ID for cards
  generateCardId(cardData) {
    const name = cardData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const set = cardData.set.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const number = cardData.cardNumber ? `-${cardData.cardNumber.replace(/[^a-z0-9]/g, '')}` : '';
    return `${name}-${set}${number}`;
  }

  // Generate unique ID for products
  generateProductId(productData) {
    const name = productData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return name;
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Create singleton instance
const sharedDatabaseService = new SharedDatabaseService();

export default sharedDatabaseService;
