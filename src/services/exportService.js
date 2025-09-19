// Export service for backing up collection data

class ExportService {
  constructor() {
    console.log('ExportService initialized');
  }

  // Export collection to CSV format
  exportToCSV(cards) {
    console.log('Exporting', cards.length, 'cards to CSV');
    
    // Define CSV headers
    const headers = [
      'Name',
      'Category',
      'Set',
      'Card Number',
      'Rarity',
      'Condition',
      'Grading Company',
      'Certification Number',
      'Product Type',
      'Purchase Price',
      'Purchase Date',
      'Sale Price',
      'Sale Date',
      'Profit/Loss',
      'Status',
      'Notes',
      'Image URL'
    ];

    // Convert cards to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...cards.map(card => this.cardToCSVRow(card))
    ];

    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create and download file
    this.downloadCSV(csvContent, `pokemon-collection-${this.getCurrentDate()}.csv`);
    
    return {
      success: true,
      filename: `pokemon-collection-${this.getCurrentDate()}.csv`,
      recordCount: cards.length
    };
  }

  // Convert a single card to CSV row
  cardToCSVRow(card) {
    const profit = (card.salePrice && card.price) ? (card.salePrice - card.price) : '';
    
    const values = [
      this.escapeCSV(card.name || ''),
      this.escapeCSV(card.category || ''),
      this.escapeCSV(card.set || ''),
      this.escapeCSV(card.cardNumber || ''),
      this.escapeCSV(card.rarity || ''),
      this.escapeCSV(card.condition || ''),
      this.escapeCSV(card.gradingCompany || ''),
      this.escapeCSV(card.certificationNumber || ''),
      this.escapeCSV(card.type || ''),
      card.price || 0,
      this.escapeCSV(card.purchaseDate || ''),
      card.salePrice || '',
      this.escapeCSV(card.saleDate || ''),
      profit,
      this.escapeCSV(card.status || 'active'),
      this.escapeCSV(card.notes || ''),
      this.escapeCSV(card.image || '')
    ];

    return values.join(',');
  }

  // Escape CSV values (handle commas, quotes, newlines)
  escapeCSV(value) {
    if (typeof value !== 'string') return value;
    
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    
    return value;
  }

  // Download CSV file
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  // Get current date for filename
  getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Export by category
  exportCategoryToCSV(cards, category) {
    const filteredCards = cards.filter(card => card.category === category);
    const categoryNames = {
      'ungraded': 'ungraded-singles',
      'graded': 'graded-cards',
      'sealed': 'sealed-products'
    };
    
    const categoryName = categoryNames[category] || category;
    const filename = `pokemon-${categoryName}-${this.getCurrentDate()}.csv`;
    
    // Use same export logic but with filtered cards
    const headers = [
      'Name',
      'Category',
      'Set',
      'Card Number',
      'Rarity',
      'Condition',
      'Grading Company',
      'Certification Number',
      'Product Type',
      'Purchase Price',
      'Purchase Date',
      'Notes',
      'Image URL'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredCards.map(card => this.cardToCSVRow(card))
    ];

    const csvContent = csvRows.join('\n');
    this.downloadCSV(csvContent, filename);
    
    return {
      success: true,
      filename: filename,
      recordCount: filteredCards.length
    };
  }

  // Import from CSV (for future use)
  parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    const cards = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = this.parseCSVLine(lines[i]);
        const card = {};
        
        headers.forEach((header, index) => {
          const cleanHeader = header.replace(/"/g, '').trim();
          card[this.headerToProperty(cleanHeader)] = values[index] || '';
        });
        
        // Convert price to number
        if (card.price) card.price = parseFloat(card.price);
        
        cards.push(card);
      }
    }

    return cards;
  }

  // Parse a single CSV line (handles quoted values)
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values;
  }

  // Convert CSV header to object property
  headerToProperty(header) {
    const mapping = {
      'Name': 'name',
      'Category': 'category',
      'Set': 'set',
      'Card Number': 'cardNumber',
      'Rarity': 'rarity',
      'Condition': 'condition',
      'Grading Company': 'gradingCompany',
      'Certification Number': 'certificationNumber',
      'Product Type': 'type',
      'Purchase Price': 'price',
      'Purchase Date': 'purchaseDate',
      'Sale Price': 'salePrice',
      'Sale Date': 'saleDate',
      'Profit/Loss': 'profit',
      'Status': 'status',
      'Notes': 'notes',
      'Image URL': 'image'
    };
    
    return mapping[header] || header.toLowerCase().replace(/\s+/g, '');
  }
}

// Create singleton instance
const exportService = new ExportService();

export default exportService;

