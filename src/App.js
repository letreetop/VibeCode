import React, { useState, useEffect } from 'react';
import './App.css';
import CardList from './components/CardList';
import SearchBar from './components/SearchBar';
import AddCardForm from './components/AddCardForm';
import CategoryTabs from './components/CategoryTabs';
import { sampleCardData, categories, allCategories } from './data/pokemonData';
import exportService from './services/exportService';
import googleDriveService from './services/googleDriveService';
import gradingService from './services/gradingService';
import authService from './services/authService';
import repositoryStorageService from './services/repositoryStorageService';
import ApiKeyManager from './components/ApiKeyManager';
import LoginScreen from './components/LoginScreen';

function App() {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormCategory, setAddFormCategory] = useState('ungraded');
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [psaApiKey, setPsaApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on app load
  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  }, []);

  // Load data from repository or localStorage (only when authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      loadCollectionData();
    }
  }, [isAuthenticated]);

  const loadCollectionData = async () => {
    try {
      // Try to load from repository first
      const repoResult = await repositoryStorageService.loadCollection();
      
      if (repoResult.success && repoResult.data.cards?.length > 0) {
        console.log('Loaded collection from repository');
        setCards(repoResult.data.cards);
        setFilteredCards(repoResult.data.cards);
        // Also save to localStorage as backup
        localStorage.setItem('pokemonCardInventory', JSON.stringify(repoResult.data.cards));
        localStorage.setItem('collectionLastUpdated', repoResult.data.lastUpdated || new Date().toISOString());
      } else {
        // Fallback to localStorage
        const savedCards = localStorage.getItem('pokemonCardInventory');
        if (savedCards) {
          const parsedCards = JSON.parse(savedCards);
          setCards(parsedCards);
          setFilteredCards(parsedCards);
        } else {
          setCards(sampleCardData);
          setFilteredCards(sampleCardData);
        }
      }
    } catch (error) {
      console.error('Failed to load collection:', error);
      // Fallback to localStorage
      const savedCards = localStorage.getItem('pokemonCardInventory');
      if (savedCards) {
        const parsedCards = JSON.parse(savedCards);
        setCards(parsedCards);
        setFilteredCards(parsedCards);
      } else {
        setCards(sampleCardData);
        setFilteredCards(sampleCardData);
      }
    }
  };

  // Save to localStorage and repository whenever card data changes
  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem('pokemonCardInventory', JSON.stringify(cards));
      localStorage.setItem('collectionLastUpdated', new Date().toISOString());
      
      // Auto-sync to repository if available
      const syncTimeout = setTimeout(() => {
        syncToRepository();
      }, 3000); // Debounce: wait 3 seconds after last change
      
      return () => clearTimeout(syncTimeout);
    }
  }, [cards]);

  const syncToRepository = async () => {
    if (repositoryStorageService.isAvailable()) {
      try {
        const result = await repositoryStorageService.saveCollection(cards, repositoryStorageService.getStoredGitHubToken());
        if (result.success) {
          console.log('Collection auto-synced to repository');
        }
      } catch (error) {
        console.error('Auto-sync to repository failed:', error);
      }
    }
  };

  // Filter cards based on search term, set, and category
  useEffect(() => {
    let filtered = cards;

    // For main collection view, exclude sold items unless specifically viewing sales history
    if (selectedCategory === 'sold') {
      filtered = filtered.filter(card => card.status === 'sold');
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(card => card.category === selectedCategory && card.status !== 'sold');
    } else {
      // 'all' category shows only active (non-sold) items
      filtered = filtered.filter(card => card.status !== 'sold');
    }

    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.set.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.cardNumber && card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSet) {
      filtered = filtered.filter(card => card.set === selectedSet);
    }

    setFilteredCards(filtered);
  }, [cards, searchTerm, selectedSet, selectedCategory]);

  const addCard = (newCard) => {
    const cardWithId = {
      ...newCard,
      id: Date.now() // Simple ID generation
    };
    setCards([...cards, cardWithId]);
    setShowAddForm(false);
    setAddFormCategory('ungraded');
  };

  const handleAddCard = (category) => {
    setAddFormCategory(category);
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setAddFormCategory('ungraded');
  };

  const handleExportAll = () => {
    const result = exportService.exportToCSV(cards);
    if (result.success) {
      alert(`✅ Exported ${result.recordCount} cards to ${result.filename}`);
    }
  };

  const handleExportCategory = (category) => {
    const result = exportService.exportCategoryToCSV(cards, category);
    if (result.success) {
      alert(`✅ Exported ${result.recordCount} ${category} cards to ${result.filename}`);
    }
  };

  const handleGoogleDriveConnect = async () => {
    try {
      console.log('Starting Google Drive connection...');
      const success = await googleDriveService.signIn();
      if (success) {
        setIsGoogleDriveConnected(true);
        const userInfo = googleDriveService.getUserInfo();
        if (userInfo) {
          alert(`✅ Connected to Google Drive as ${userInfo.email}`);
        } else {
          alert('✅ Connected to Google Drive successfully!');
        }
      }
    } catch (error) {
      console.error('Google Drive connection error:', error);
      alert('❌ Failed to connect to Google Drive: ' + (error.message || 'Unknown error'));
    }
  };

  const handleGoogleDriveDisconnect = async () => {
    await googleDriveService.signOut();
    setIsGoogleDriveConnected(false);
    setAutoSyncEnabled(false);
    alert('✅ Disconnected from Google Drive');
  };

  const handleManualBackup = async () => {
    if (!isGoogleDriveConnected) {
      alert('Please connect to Google Drive first');
      return;
    }

    try {
      const result = await googleDriveService.uploadCollection(cards);
      alert(`✅ Collection backed up to Google Drive!\nFile: ${result.filename}\nCards: ${cards.length}`);
    } catch (error) {
      alert('❌ Backup failed: ' + error.message);
    }
  };

  const toggleAutoSync = () => {
    if (!isGoogleDriveConnected) {
      alert('Please connect to Google Drive first');
      return;
    }
    setAutoSyncEnabled(!autoSyncEnabled);
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('❌ Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target.result;
        const importedCards = exportService.parseCSV(csvContent);
        
        if (importedCards.length === 0) {
          alert('❌ No valid cards found in CSV file');
          return;
        }

        // Add unique IDs and merge with existing collection
        const cardsWithIds = importedCards.map(card => ({
          ...card,
          id: Date.now() + Math.random() // Ensure unique IDs
        }));

        // Ask user if they want to replace or merge
        const replace = window.confirm(
          `Found ${importedCards.length} cards in CSV.\n\n` +
          `Click OK to REPLACE your current collection (${cards.length} cards)\n` +
          `Click Cancel to MERGE with your current collection`
        );

        if (replace) {
          setCards(cardsWithIds);
          alert(`✅ Imported ${importedCards.length} cards (replaced existing collection)`);
        } else {
          setCards([...cards, ...cardsWithIds]);
          alert(`✅ Imported ${importedCards.length} cards (merged with existing ${cards.length} cards)`);
        }
      } catch (error) {
        console.error('CSV import error:', error);
        alert('❌ Error importing CSV: ' + error.message);
      }
    };

    reader.onerror = () => {
      alert('❌ Error reading file');
    };

    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleApiKeyChange = (newApiKey) => {
    if (newApiKey === 'skip') {
      setPsaApiKey('');
      gradingService.setApiToken('');
      console.log('PSA API skipped - graded card lookup disabled');
    } else {
      setPsaApiKey(newApiKey);
      gradingService.setApiToken(newApiKey);
      console.log('PSA API key configured');
    }
  };

  const removeCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const updateCard = (updatedCard) => {
    setCards(cards.map(card => card.id === updatedCard.id ? updatedCard : card));
  };

  const duplicateCard = (cardToDuplicate) => {
    const duplicateCard = {
      ...cardToDuplicate,
      id: Date.now() + Math.random(), // Generate new unique ID
      notes: cardToDuplicate.notes ? `${cardToDuplicate.notes} (Duplicate)` : 'Duplicate'
    };
    setCards([...cards, duplicateCard]);
  };

  // Calculate statistics (separate active collection from sales history)
  const activeCards = cards.filter(card => card.status !== 'sold');
  const soldCards = cards.filter(card => card.status === 'sold');
  
  const totalValue = activeCards.reduce((sum, card) => sum + (card.price || 0), 0);
  const totalSaleValue = soldCards.reduce((sum, card) => sum + (card.salePrice || 0), 0);
  const totalProfit = soldCards.reduce((sum, card) => {
    if (card.salePrice && card.price) {
      return sum + (card.salePrice - card.price);
    }
    return sum;
  }, 0);
  
  // Stats for active collection categories
  const categoryStats = categories.map(category => ({
    ...category,
    count: activeCards.filter(card => card.category === category.id).length,
    value: activeCards.filter(card => card.category === category.id).reduce((sum, card) => sum + (card.price || 0), 0)
  }));

  // Add sales history stats
  const allCategoryStats = [
    ...categoryStats,
    {
      id: 'sold',
      name: 'Sales History',
      icon: '💰',
      count: soldCards.length,
      value: soldCards.reduce((sum, card) => sum + (card.salePrice || 0), 0)
    }
  ];

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCards([]);
    setFilteredCards([]);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Pokemon Card Collection</h1>
          <p>Track, manage, and analyze your collection</p>
        </div>
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          🚪 Logout
        </button>
      </header>

      <main className="main-content">
        <ApiKeyManager onApiKeyChange={handleApiKeyChange} />
        
        <div className="top-section">
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSet={selectedSet}
            setSelectedSet={setSelectedSet}
          />
          
          <div className="quick-actions">
            {showAddForm ? (
              <button 
                className="cancel-add-btn"
                onClick={handleCancelAdd}
              >
                ✕ Cancel
              </button>
            ) : (
              <>
                <button 
                  className="add-card-btn ungraded"
                  onClick={() => handleAddCard('ungraded')}
                >
                  + Single
                </button>
                <button 
                  className="add-card-btn graded"
                  onClick={() => handleAddCard('graded')}
                >
                  + Graded
                </button>
                <button 
                  className="add-card-btn sealed"
                  onClick={() => handleAddCard('sealed')}
                >
                  + Sealed
                </button>
              </>
            )}
          </div>
        </div>

        <div className="utility-bar">
          <div className="backup-section">
            <button 
              className="utility-btn export"
              onClick={handleExportAll}
              title="Export collection to CSV"
            >
              💾 Export
            </button>
            
            <label className="utility-btn import" title="Import from CSV">
              📂 Import
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                style={{ display: 'none' }}
              />
            </label>
            
            <button 
              className="utility-btn sync"
              onClick={() => syncToRepository()}
              title="Sync collection to repository"
            >
              🔄 Sync
            </button>
          </div>
        </div>

        {showAddForm && (
          <AddCardForm 
            onAddCard={addCard}
            onCancel={handleCancelAdd}
            initialCategory={addFormCategory}
          />
        )}

        <div className="stats">
          {selectedCategory === 'sold' ? (
            // Sales History Stats
            <>
              <div className="stat-card total-sales">
                <h3>${totalSaleValue.toLocaleString()}</h3>
                <p>Total Sales Revenue</p>
              </div>
              <div className={`stat-card total-profit ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
                <h3>{totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}</h3>
                <p>Total Profit/Loss</p>
              </div>
              <div className="stat-card sales-count">
                <h3>{soldCards.length}</h3>
                <p>Items Sold</p>
              </div>
            </>
          ) : (
            // Active Collection Stats
            <>
              <div className="stat-card total-value">
                <h3>${totalValue.toLocaleString()}</h3>
                <p>Collection Value</p>
              </div>
              <div className="stat-card">
                <h3>{activeCards.length}</h3>
                <p>Active Items</p>
              </div>
              {soldCards.length > 0 && (
                <div className={`stat-card total-profit ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
                  <h3>{totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}</h3>
                  <p>Realized Profit</p>
                </div>
              )}
            </>
          )}
        </div>

        <CategoryTabs 
          categories={allCategories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categoryStats={allCategoryStats}
        />

        <CardList 
          cards={filteredCards}
          onRemoveCard={removeCard}
          onUpdateCard={updateCard}
          onDuplicateCard={duplicateCard}
        />
      </main>
    </div>
  );
}

export default App;
