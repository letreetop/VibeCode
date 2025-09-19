// Grading service for looking up card details by certification number
// This service integrates with real APIs when available

class GradingService {
  constructor() {
    // API token will be set dynamically by user (secure for public repos)
    this.apiToken = '';
    this.psaApiBaseUrl = 'https://api.psacard.com/publicapi';
    
    console.log('GradingService constructor - ready for dynamic API key');
  }

  // Set API token dynamically
  setApiToken(token) {
    this.apiToken = token;
    console.log('PSA API token updated - length:', token ? token.length : 0);
  }

  // API lookup by certification number
  async lookupByCertNumber(certNumber) {
    console.log('Starting lookup for cert number:', certNumber);

    // If we have an API token, try real PSA API lookup
    if (this.apiToken) {
      try {
        console.log('Attempting real PSA API lookup...');
        return await this.tryRealAPILookup(certNumber);
      } catch (error) {
        console.error('PSA API lookup failed:', error);
        // Return the specific error message
        return {
          success: false,
          error: error.message || 'Failed to lookup certification number'
        };
      }
    } else {
      console.error('No API token available');
      return {
        success: false,
        error: 'API token not configured. Please check your environment settings.'
      };
    }
  }

  // Real PSA API lookup
  async tryRealAPILookup(certNumber) {
    console.log('Attempting PSA API lookup for cert number:', certNumber);
    console.log('Using API token:', this.apiToken ? `Token present (length: ${this.apiToken.length})` : 'No token');
    console.log('API Base URL:', this.psaApiBaseUrl);
    console.log('Full Authorization header will be:', `Bearer ${this.apiToken}`);

    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Accept': 'application/json'
    };
    
    console.log('Request headers:', headers);

    const url = `${this.psaApiBaseUrl}/cert/GetByCertNumber/${certNumber}`;
    console.log('Making request to:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('PSA API Response:', data);
        
        // Check if PSA cert data exists
        if (data.PSACert) {
          const cert = data.PSACert;
          
          // Parse the card details from PSA response
          const cardName = cert.Subject || 'Unknown Card';
          const setName = this.parsePSABrand(cert.Brand);
          const cardNumber = cert.CardNumber || '';
          const rarity = cert.Variety || 'Unknown';
          const grade = cert.CardGrade || cert.GradeDescription || 'Unknown';
          
          console.log('Parsed card data:', { cardName, setName, cardNumber, rarity, grade });
          
          return {
            success: true,
            data: {
              company: 'PSA',
              grade: grade,
              cardName: cardName,
              set: setName,
              cardNumber: cardNumber,
              rarity: rarity,
              condition: grade,
              imageUrl: await this.getPSACardImage(certNumber),
              // Additional PSA-specific data
              certNumber: cert.CertNumber,
              specNumber: cert.SpecNumber,
              year: cert.Year,
              totalPopulation: cert.TotalPopulation,
              populationHigher: cert.PopulationHigher
            }
          };
        } else {
          console.error('No PSACert in response:', data);
          throw new Error('No PSA certification data found in response');
        }
      } else {
        const errorText = await response.text();
        console.error('PSA API Error Response:', errorText);
        
        if (response.status === 404) {
          throw new Error('Certification number not found in PSA database');
        } else if (response.status === 401) {
          throw new Error('Authentication failed - please check API token');
        } else if (response.status === 403) {
          throw new Error('Access forbidden - API token may not have required permissions');
        } else {
          throw new Error(`PSA API error (${response.status}): ${errorText}`);
        }
      }
    } catch (networkError) {
      console.error('Network error during PSA API call:', networkError);
      if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
        throw new Error('Network error - please check your internet connection');
      }
      throw networkError;
    }
  }

  // Parse PSA brand string to extract set name
  parsePSABrand(brand) {
    if (!brand) return 'Unknown Set';
    
    // PSA brand format examples:
    // "POKEMON TWM EN-TWILIGHT MASQUERADE" -> "Twilight Masquerade"
    // "POKEMON BASE SET" -> "Base Set"
    
    // Remove "POKEMON" prefix and clean up
    let setName = brand.replace(/^POKEMON\s*/i, '');
    
    // Handle EN- prefix (English)
    setName = setName.replace(/^[A-Z]+\s*EN-/i, '');
    
    // Convert to title case
    setName = setName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    
    return setName || 'Unknown Set';
  }

  // Get PSA card images from the images API
  async getPSACardImage(certNumber) {
    try {
      console.log('Fetching PSA card image for cert number:', certNumber);
      
      const headers = {
        'Authorization': `Bearer ${this.apiToken}`,
        'Accept': 'application/json'
      };
      
      console.log('Image API headers:', headers);

      const url = `${this.psaApiBaseUrl}/cert/GetImagesByCertNumber/${certNumber}`;
      console.log('Image API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('Image API response status:', response.status);

      if (response.ok) {
        const images = await response.json();
        console.log('PSA Images Response:', images);
        
        // Look for the front image first, fallback to any image
        const frontImage = images.find(img => img.IsFrontImage === true);
        if (frontImage && frontImage.ImageURL) {
          console.log('Using front image:', frontImage.ImageURL);
          return frontImage.ImageURL;
        }
        
        // If no front image, use the first available image
        if (images.length > 0 && images[0].ImageURL) {
          console.log('Using first available image:', images[0].ImageURL);
          return images[0].ImageURL;
        }
      } else {
        console.error('Image API failed with status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch PSA card image:', error);
    }
    
    // Fallback to default image if PSA image API fails
    console.log('Using fallback image');
    return 'https://images.pokemontcg.io/base1/4_hires.png';
  }

  // Detect grading company from cert number format (simplified)
  detectGradingCompany(certNumber) {
    // This is a simplified detection - real cert numbers have specific formats
    if (certNumber.length === 8 && /^\d+$/.test(certNumber)) {
      if (certNumber.startsWith('1') || certNumber.startsWith('8') || certNumber.startsWith('9')) {
        return 'PSA';
      } else if (certNumber.startsWith('2') || certNumber.startsWith('3')) {
        return 'BGS';
      } else if (certNumber.startsWith('4')) {
        return 'CGC';
      }
    }
    return 'Unknown';
  }

  // Generate mock data for unknown cert numbers (for demo purposes)
  generateMockData(certNumber) {
    const companies = ['PSA', 'BGS', 'CGC'];
    const grades = ['8', '8.5', '9', '9.5', '10'];
    const cards = [
      { name: 'Charizard', set: 'Base Set', number: '4/102', rarity: 'Holo Rare' },
      { name: 'Blastoise', set: 'Base Set', number: '2/102', rarity: 'Holo Rare' },
      { name: 'Venusaur', set: 'Base Set', number: '15/102', rarity: 'Holo Rare' },
      { name: 'Pikachu', set: 'Base Set', number: '58/102', rarity: 'Common' },
      { name: 'Alakazam', set: 'Base Set', number: '1/102', rarity: 'Holo Rare' }
    ];

    const company = companies[Math.floor(Math.random() * companies.length)];
    const grade = grades[Math.floor(Math.random() * grades.length)];
    const card = cards[Math.floor(Math.random() * cards.length)];

    return {
      company,
      grade,
      cardName: card.name,
      set: card.set,
      cardNumber: card.number,
      rarity: card.rarity,
      condition: `${company} ${grade}`,
      imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png'
    };
  }
}

// Create singleton instance
const gradingService = new GradingService();

export default gradingService;
