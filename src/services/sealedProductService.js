// Sealed product service for looking up product information
// Integrates with Pokemon TCG API and preset database

class SealedProductService {
  constructor() {
    this.pokemonTCGApiBaseUrl = 'https://api.pokemontcg.io/v2';
    
    // Common sealed products database
    this.sealedProductsDatabase = {
      // Booster Boxes
      'base-set-booster-box': {
        name: 'Base Set Booster Box',
        set: 'Base Set',
        type: 'booster_box',
        releaseDate: '1998-10-20',
        msrp: 2.99 * 36, // 36 packs
        image: 'https://images.pokemontcg.io/base1/logo.png',
        description: '36 booster packs, 11 cards per pack'
      },
      'jungle-booster-box': {
        name: 'Jungle Booster Box',
        set: 'Jungle',
        type: 'booster_box',
        releaseDate: '1999-06-16',
        msrp: 2.99 * 36,
        image: 'https://images.pokemontcg.io/base2/logo.png',
        description: '36 booster packs, 11 cards per pack'
      },
      'fossil-booster-box': {
        name: 'Fossil Booster Box',
        set: 'Fossil',
        type: 'booster_box',
        releaseDate: '1999-10-10',
        msrp: 2.99 * 36,
        image: 'https://images.pokemontcg.io/base3/logo.png',
        description: '36 booster packs, 11 cards per pack'
      },
      
      // Elite Trainer Boxes
      'evolving-skies-etb': {
        name: 'Evolving Skies Elite Trainer Box',
        set: 'Evolving Skies',
        type: 'elite_trainer_box',
        releaseDate: '2021-08-27',
        msrp: 49.99,
        image: 'https://images.pokemontcg.io/swsh7/logo.png',
        description: '10 booster packs, accessories, and more'
      },
      
      // Individual Packs
      'base-set-pack': {
        name: 'Base Set Booster Pack',
        set: 'Base Set',
        type: 'booster_pack',
        releaseDate: '1998-10-20',
        msrp: 2.99,
        image: 'https://images.pokemontcg.io/base1/logo.png',
        description: '11 cards including 1 rare'
      }
    };
    
    console.log('SealedProductService initialized with', Object.keys(this.sealedProductsDatabase).length, 'preset products');
  }

  // Search for sealed products by name or set
  async searchSealedProducts(searchTerm) {
    console.log('Searching for sealed products:', searchTerm);
    
    const results = [];
    const searchLower = searchTerm.toLowerCase();
    
    // Search preset database
    for (const [key, product] of Object.entries(this.sealedProductsDatabase)) {
      if (product.name.toLowerCase().includes(searchLower) || 
          product.set.toLowerCase().includes(searchLower)) {
        results.push({
          id: key,
          ...product
        });
      }
    }
    
    // If we have results from preset database, return them
    if (results.length > 0) {
      console.log('Found', results.length, 'preset products');
      return {
        success: true,
        data: results
      };
    }
    
    // Try Pokemon TCG API for set information
    try {
      const setData = await this.searchPokemonTCGSets(searchTerm);
      if (setData.length > 0) {
        const generatedProducts = this.generateSealedProductsFromSets(setData);
        console.log('Generated', generatedProducts.length, 'products from TCG API');
        return {
          success: true,
          data: generatedProducts
        };
      }
    } catch (error) {
      console.error('Pokemon TCG API search failed:', error);
    }
    
    return {
      success: false,
      error: 'No sealed products found for: ' + searchTerm
    };
  }

  // Search Pokemon TCG API for sets
  async searchPokemonTCGSets(searchTerm) {
    const response = await fetch(`${this.pokemonTCGApiBaseUrl}/sets?q=name:"${searchTerm}"`);
    
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
    
    throw new Error(`Pokemon TCG API responded with status: ${response.status}`);
  }

  // Generate sealed products from set data
  generateSealedProductsFromSets(sets) {
    const products = [];
    
    sets.forEach(set => {
      // Generate booster box
      products.push({
        id: `${set.id}-booster-box`,
        name: `${set.name} Booster Box`,
        set: set.name,
        type: 'booster_box',
        releaseDate: set.releaseDate,
        msrp: this.estimateMSRP(set, 'booster_box'),
        image: set.images?.logo || set.images?.symbol,
        description: `36 booster packs from ${set.name}`
      });
      
      // Generate elite trainer box (for modern sets)
      if (set.releaseDate && new Date(set.releaseDate) > new Date('2016-01-01')) {
        products.push({
          id: `${set.id}-etb`,
          name: `${set.name} Elite Trainer Box`,
          set: set.name,
          type: 'elite_trainer_box',
          releaseDate: set.releaseDate,
          msrp: this.estimateMSRP(set, 'elite_trainer_box'),
          image: set.images?.logo || set.images?.symbol,
          description: `Elite Trainer Box from ${set.name}`
        });
      }
      
      // Generate individual pack
      products.push({
        id: `${set.id}-pack`,
        name: `${set.name} Booster Pack`,
        set: set.name,
        type: 'booster_pack',
        releaseDate: set.releaseDate,
        msrp: this.estimateMSRP(set, 'booster_pack'),
        image: set.images?.logo || set.images?.symbol,
        description: `Single booster pack from ${set.name}`
      });
    });
    
    return products;
  }

  // Estimate MSRP based on set age and product type
  estimateMSRP(set, productType) {
    const releaseYear = set.releaseDate ? new Date(set.releaseDate).getFullYear() : 2020;
    
    // Base prices by type
    const basePrices = {
      'booster_pack': releaseYear < 2000 ? 2.99 : releaseYear < 2010 ? 3.99 : 4.99,
      'booster_box': 0, // Will calculate from pack price
      'elite_trainer_box': releaseYear < 2020 ? 39.99 : 49.99,
      'theme_deck': 12.99,
      'tin': 19.99
    };
    
    if (productType === 'booster_box') {
      return basePrices.booster_pack * 36; // 36 packs per box
    }
    
    return basePrices[productType] || 0;
  }

  // Get all available sealed product types
  getProductTypes() {
    return [
      { id: 'booster_box', name: 'Booster Box', icon: '📦' },
      { id: 'elite_trainer_box', name: 'Elite Trainer Box', icon: '🎁' },
      { id: 'booster_pack', name: 'Booster Pack', icon: '📄' },
      { id: 'theme_deck', name: 'Theme Deck', icon: '🃏' },
      { id: 'tin', name: 'Tin', icon: '🥫' },
      { id: 'collection_box', name: 'Collection Box', icon: '📦' },
      { id: 'bundle', name: 'Bundle', icon: '🎯' }
    ];
  }
}

// Create singleton instance
const sealedProductService = new SealedProductService();

export default sealedProductService;

