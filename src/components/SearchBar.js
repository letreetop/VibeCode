import React from 'react';
import { cardSets } from '../data/pokemonData';
import './SearchBar.css';

const SearchBar = ({ searchTerm, setSearchTerm, selectedSet, setSelectedSet }) => {
  return (
    <div className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search cards by name, set, or card number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>
      
      <div className="filter-container">
        <select
          value={selectedSet}
          onChange={(e) => setSelectedSet(e.target.value)}
          className="set-filter"
        >
          <option value="">All Sets</option>
          {cardSets.map((set) => (
            <option key={set} value={set}>
              {set}
            </option>
          ))}
        </select>
      </div>
      
      {(searchTerm || selectedSet) && (
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedSet('');
          }}
          className="clear-filters-btn"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default SearchBar;
