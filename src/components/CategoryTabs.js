import React from 'react';
import './CategoryTabs.css';

const CategoryTabs = ({ categories, selectedCategory, setSelectedCategory, categoryStats }) => {
  const allStats = {
    count: categoryStats.reduce((sum, cat) => sum + cat.count, 0),
    value: categoryStats.reduce((sum, cat) => sum + cat.value, 0)
  };

  return (
    <div className="category-tabs">
      <div className="tab-list">
        <button
          className={`tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <span className="tab-icon">🔥</span>
          <span className="tab-text">
            <span className="tab-name">All Cards</span>
            <span className="tab-stats">{allStats.count} cards • ${allStats.value.toLocaleString()}</span>
          </span>
        </button>
        
        {categories.map((category) => {
          const stats = categoryStats.find(stat => stat.id === category.id);
          return (
            <button
              key={category.id}
              className={`tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="tab-icon">{category.icon}</span>
              <span className="tab-text">
                <span className="tab-name">{category.name}</span>
                <span className="tab-stats">{stats?.count || 0} cards • ${(stats?.value || 0).toLocaleString()}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;
