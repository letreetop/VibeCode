import React, { useState } from 'react';
import { cardSets, cardRarities, cardConditions, gradingCompanies, sealedTypes, categories } from '../data/pokemonData';
import gradingService from '../services/gradingService';
import './AddCardForm.css';

const AddCardForm = ({ onAddCard, onCancel, initialCategory = 'ungraded' }) => {
  const [formData, setFormData] = useState({
    name: '',
    set: '',
    cardNumber: '',
    rarity: '',
    condition: '',
    category: initialCategory,
    type: 'single',
    price: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseLocation: '',
    gradingCompany: '',
    certificationNumber: '',
    notes: '',
    image: ''
  });

  const [errors, setErrors] = useState({});
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle certification number lookup
  const handleCertLookup = async () => {
    const certNumber = formData.certificationNumber.trim();
    if (!certNumber) {
      setLookupMessage('Please enter a certification number');
      return;
    }

    setIsLookingUp(true);
    setLookupMessage('Looking up certification number...');

    try {
      const result = await gradingService.lookupByCertNumber(certNumber);
      
      if (result.success) {
        // Auto-populate form with looked up data
        setFormData(prev => ({
          ...prev,
          name: result.data.cardName,
          set: result.data.set,
          cardNumber: result.data.cardNumber,
          rarity: result.data.rarity,
          condition: result.data.condition,
          gradingCompany: result.data.company,
          image: result.data.imageUrl
        }));
        setLookupMessage('✅ Card data found and populated! You can now set the purchase price and submit.');
      } else {
        setLookupMessage('❌ ' + result.error);
      }
    } catch (error) {
      setLookupMessage('❌ Error looking up certification number');
      console.error('Lookup error:', error);
    } finally {
      setIsLookingUp(false);
      // Clear message after 3 seconds
      setTimeout(() => setLookupMessage(''), 3000);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // For graded cards, only require certification number
    if (formData.category === 'graded') {
      if (!formData.certificationNumber.trim()) {
        newErrors.certificationNumber = 'Certification number is required for graded cards';
      }
      // Don't require other fields for graded cards - they'll be populated by API
    } else {
      // For ungraded and sealed cards, require name field
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (formData.category === 'ungraded' && !formData.set.trim()) newErrors.set = 'Set is required';
      if (formData.category === 'ungraded' && !formData.condition.trim()) newErrors.condition = 'Condition is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const cardData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
        // For sealed products, set default values for card-specific fields
        // For graded cards, ensure we have a name from the API lookup
        name: formData.category === 'graded' ? (formData.name || 'Unknown Card') : formData.name,
        set: formData.category === 'sealed' ? (formData.set || 'N/A') : formData.set,
        cardNumber: formData.category === 'sealed' ? '' : formData.cardNumber,
        rarity: formData.category === 'sealed' ? '' : formData.rarity,
        condition: formData.category === 'sealed' ? 'Factory Sealed' : formData.condition,
        image: formData.image || (formData.category === 'sealed' ? 
          'https://images.pokemontcg.io/base1/logo.png' : 
          'https://images.pokemontcg.io/base1/4_hires.png')
      };
      
      onAddCard(cardData);
    }
  };

  const getCategoryTitle = () => {
    switch(initialCategory) {
      case 'graded': return 'Add Graded Card';
      case 'sealed': return 'Add Sealed Product';
      default: return 'Add Single Card';
    }
  };

  const getCategoryIcon = () => {
    switch(initialCategory) {
      case 'graded': return '💎';
      case 'sealed': return '📦';
      default: return '🃏';
    }
  };

  return (
    <div className="add-card-form-container">
      <form onSubmit={handleSubmit} className="add-card-form">
        <h3>{getCategoryIcon()} {getCategoryTitle()}</h3>
        
        <div className="form-grid">
          {formData.category !== 'graded' && (
            <div className="form-group">
              <label htmlFor="name">{formData.category === 'sealed' ? 'Product Name *' : 'Card Name *'}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder={formData.category === 'sealed' ? 'e.g., Base Set Booster Box, Evolving Skies Elite Trainer Box' : 'e.g., Charizard'}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          {formData.category === 'ungraded' && (
            <>
              <div className="form-group">
                <label htmlFor="set">Set *</label>
                <select
                  id="set"
                  name="set"
                  value={formData.set}
                  onChange={handleChange}
                  className={errors.set ? 'error' : ''}
                >
                  <option value="">Select Set</option>
                  {cardSets.map((set) => (
                    <option key={set} value={set}>
                      {set}
                    </option>
                  ))}
                </select>
                {errors.set && <span className="error-message">{errors.set}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="e.g., 4/102"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={true}
              className="category-locked"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <small className="category-note">Category is set based on the button you clicked</small>
          </div>

          {formData.category === 'ungraded' && (
            <div className="form-group">
              <label htmlFor="rarity">Rarity</label>
              <select
                id="rarity"
                name="rarity"
                value={formData.rarity}
                onChange={handleChange}
              >
                <option value="">Select Rarity</option>
                {cardRarities.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.category === 'ungraded' && (
            <div className="form-group">
              <label htmlFor="condition">Condition *</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className={errors.condition ? 'error' : ''}
              >
                <option value="">Select Condition</option>
                {cardConditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
              {errors.condition && <span className="error-message">{errors.condition}</span>}
            </div>
          )}

          {formData.category === 'graded' && (
            <div className="form-group full-width">
              <label htmlFor="certificationNumber">Certification Number *</label>
              <div className="cert-input-group">
                <input
                  type="text"
                  id="certificationNumber"
                  name="certificationNumber"
                  value={formData.certificationNumber}
                  onChange={handleChange}
                  placeholder="Enter PSA, BGS, or CGC certification number"
                  className="cert-input"
                />
                <button
                  type="button"
                  onClick={handleCertLookup}
                  disabled={isLookingUp || !formData.certificationNumber.trim()}
                  className="lookup-btn"
                >
                  {isLookingUp ? '🔍' : 'Lookup & Fill'}
                </button>
              </div>
              {lookupMessage && (
                <div className={`lookup-message ${lookupMessage.includes('✅') ? 'success' : lookupMessage.includes('❌') ? 'error' : 'info'}`}>
                  {lookupMessage}
                </div>
              )}
              <small className="field-note">Enter certification number - all card details will be populated automatically</small>
              {errors.certificationNumber && <span className="error-message">{errors.certificationNumber}</span>}
            </div>
          )}

          {formData.category === 'sealed' && (
            <div className="form-group">
              <label htmlFor="type">Product Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">Select Type (Optional)</option>
                {sealedTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <small className="field-note">Optional - helps categorize your sealed products</small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="price">Purchase Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="purchaseDate">Purchase Date</label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
            />
          </div>


          {formData.category !== 'graded' && (
            <div className="form-group full-width">
              <label htmlFor="image">Image URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/card-image.png"
              />
            </div>
          )}

          <div className="form-group full-width">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Additional notes about the card..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Add Card
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCardForm;
