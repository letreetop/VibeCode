import React, { useState } from 'react';
import './Card.css';

const Card = ({ card, onRemove, onUpdate, onDuplicate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState(card);

  const handleSave = () => {
    onUpdate(editedCard);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCard(card);
    setIsEditing(false);
  };

  const handleMarkAsSold = () => {
    const salePrice = prompt('Enter sale price:');
    if (salePrice && !isNaN(parseFloat(salePrice))) {
      const soldCard = {
        ...card,
        status: 'sold',
        salePrice: parseFloat(salePrice),
        saleDate: new Date().toISOString().split('T')[0],
        originalCategory: card.category,
        category: 'sold'
      };
      onUpdate(soldCard);
    }
  };

  const handleDuplicate = () => {
    const duplicateCard = {
      ...card,
      id: undefined, // Will get new ID when added
      // Reset sale data for duplicate
      status: undefined,
      salePrice: undefined,
      saleDate: undefined,
      // Reset to original category if this was a sold item
      category: card.originalCategory || card.category,
      // Add note that this is a duplicate
      notes: card.notes ? `${card.notes} (Duplicate)` : 'Duplicate'
    };
    onDuplicate(duplicateCard);
  };

  const getRarityColor = (rarity) => {
    const rarityColors = {
      'Common': '#6c757d',
      'Uncommon': '#28a745',
      'Rare': '#007bff',
      'Rare Holo': '#6f42c1',
      'Ultra Rare': '#fd7e14',
      'Secret Rare': '#dc3545',
      'Rainbow Rare': '#e83e8c',
      'Gold Rare': '#ffc107',
      'Full Art': '#17a2b8',
      'Alternate Art': '#20c997',
      'Special Illustration Rare': '#6610f2',
      'Hyper Rare': '#fd7e14',
      'Radiant Rare': '#f8f9fa',
      'Amazing Rare': '#343a40',
      'Promo': '#6c757d',
      'Error Card': '#dc3545'
    };
    return rarityColors[rarity] || '#6c757d';
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'ungraded': return '🃏';
      case 'graded': return '💎';
      case 'sealed': return '📦';
      default: return '🃏';
    }
  };

  const formatPrice = (price) => {
    return price ? `$${price.toLocaleString()}` : 'N/A';
  };

  const calculateProfit = (card) => {
    if (!card.salePrice || !card.price) return null;
    return card.salePrice - card.price;
  };

  const formatProfit = (profit) => {
    if (profit === null || profit === undefined) return null;
    const sign = profit >= 0 ? '+' : '';
    return `${sign}$${profit.toLocaleString()}`;
  };

  if (isEditing) {
    return (
      <div className="card-item editing">
        <div className="card-header">
          <input
            type="text"
            value={editedCard.name}
            onChange={(e) => setEditedCard({...editedCard, name: e.target.value})}
            className="edit-input name-input"
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
        
        <div className="card-content">
          <div className="card-image">
            <img src={editedCard.image} alt={editedCard.name} />
          </div>
          
          <div className="card-details">
            <div className="detail-group">
              <label>Set:</label>
              <input
                type="text"
                value={editedCard.set}
                onChange={(e) => setEditedCard({...editedCard, set: e.target.value})}
                className="edit-input"
              />
            </div>
            
            <div className="detail-group">
              <label>Card Number:</label>
              <input
                type="text"
                value={editedCard.cardNumber || ''}
                onChange={(e) => setEditedCard({...editedCard, cardNumber: e.target.value})}
                className="edit-input"
              />
            </div>
            
            <div className="detail-group">
              <label>Condition:</label>
              <input
                type="text"
                value={editedCard.condition}
                onChange={(e) => setEditedCard({...editedCard, condition: e.target.value})}
                className="edit-input"
              />
            </div>
            
            <div className="detail-group">
              <label>Purchase Price:</label>
              <input
                type="number"
                step="0.01"
                value={editedCard.price || ''}
                onChange={(e) => setEditedCard({...editedCard, price: parseFloat(e.target.value)})}
                className="edit-input"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-item ${card.category}`}>
      <div className="card-header">
        <div className="card-title">
          <span className="category-icon">{getCategoryIcon(card.category)}</span>
          <h3 className="card-name">{card.name}</h3>
        </div>
        <div className="card-actions">
          <button onClick={handleDuplicate} className="duplicate-btn">Duplicate</button>
          {card.status !== 'sold' && (
            <button onClick={() => handleMarkAsSold()} className="sell-btn">Sell</button>
          )}
          <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
          <button onClick={() => onRemove(card.id)} className="remove-btn">Remove</button>
        </div>
      </div>
      
      <div className="card-content">
        <div className="card-image">
          <img src={card.image} alt={card.name} />
        </div>
        
        <div className="card-info">
          <div className="set-info">
            <span className="set-name">{card.set}</span>
            {card.cardNumber && <span className="card-number">#{card.cardNumber}</span>}
          </div>
          
          {card.rarity && (
            <div className="rarity-badge" style={{ backgroundColor: getRarityColor(card.rarity) }}>
              {card.rarity}
            </div>
          )}
        </div>
        
        <div className="card-stats">
          <div className="stat-row">
            <span className="stat-label">Condition:</span>
            <span className="stat-value">{card.condition}</span>
          </div>
          
          {card.gradingCompany && (
            <div className="stat-row">
              <span className="stat-label">Grade:</span>
              <span className="stat-value">{card.gradingCompany} {card.condition}</span>
            </div>
          )}
          
          {card.certificationNumber && (
            <div className="stat-row">
              <span className="stat-label">Cert #:</span>
              <span className="stat-value">{card.certificationNumber}</span>
            </div>
          )}
          
          <div className="stat-row price-row">
            <span className="stat-label">Purchase Price:</span>
            <span className="stat-value price">{formatPrice(card.price)}</span>
          </div>
          
          {card.salePrice && (
            <>
              <div className="stat-row sale-price-row">
                <span className="stat-label">Sale Price:</span>
                <span className="stat-value sale-price">{formatPrice(card.salePrice)}</span>
              </div>
              <div className="stat-row profit-row">
                <span className="stat-label">Profit/Loss:</span>
                <span className={`stat-value profit ${calculateProfit(card) >= 0 ? 'positive' : 'negative'}`}>
                  {formatProfit(calculateProfit(card))}
                </span>
              </div>
            </>
          )}
        </div>
        
        
        <div className="card-meta">
          <div className="meta-row">
            <span className="meta-label">Purchased:</span>
            <span className="meta-value">{card.purchaseDate}</span>
          </div>
          {card.saleDate && (
            <div className="meta-row">
              <span className="meta-label">Sold:</span>
              <span className="meta-value">{card.saleDate}</span>
            </div>
          )}
          <div className="meta-row">
            <span className="meta-label">Location:</span>
            <span className="meta-value">{card.purchaseLocation}</span>
          </div>
          {card.notes && (
            <div className="meta-row notes">
              <span className="meta-label">Notes:</span>
              <span className="meta-value">{card.notes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
