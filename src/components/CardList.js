import React from 'react';
import Card from './Card';
import './CardList.css';

const CardList = ({ cards, onRemoveCard, onUpdateCard, onDuplicateCard }) => {
  if (cards.length === 0) {
    return (
      <div className="card-list-empty">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Cards Found</h3>
          <p>Try adjusting your search criteria or add some cards to your collection!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-list">
      <div className="card-grid">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onRemove={onRemoveCard}
            onUpdate={onUpdateCard}
            onDuplicate={onDuplicateCard}
          />
        ))}
      </div>
    </div>
  );
};

export default CardList;
