import React from 'react';

export default function PratoRow({ dayId, mealId, dish, updateDish, removeDish, onRowClick }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('dayId', dayId);
    e.dataTransfer.setData('mealId', mealId);
    e.dataTransfer.setData('dishId', dish.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    updateDish({ done: !dish.done });
  };

  return (
    <div 
      onClick={onRowClick}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '7px', 
        padding: '8px 4px',
        cursor: 'pointer',
        borderRadius: '8px',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span 
        draggable
        onDragStart={handleDragStart}
        onClick={e => e.stopPropagation()}
        style={{ cursor: 'grab', touchAction: 'none', userSelect: 'none', width: '24px', height: '24px', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
          <circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
        </svg>
      </span>

      <button onClick={handleToggle} className="btn btn-icon btn-ghost" style={{ width: '20px', height: '20px', padding: 0, opacity: dish.done ? 1 : 0.3, color: dish.done ? 'var(--color-accent)' : 'inherit' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {dish.done ? <polyline points="20 6 9 17 4 12"></polyline> : <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>}
        </svg>
      </button>
      
      <span style={{ 
        flex: 1, 
        fontSize: '15px', 
        fontWeight: 600,
        textDecoration: dish.done ? 'line-through' : 'none',
        opacity: dish.done ? 0.6 : 1,
        color: 'var(--color-text)'
      }}>
        {dish.name || 'Novo prato'}
      </span>

      {dish.calories && (
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-700)', background: 'var(--color-accent-100)', padding: '2px 6px', borderRadius: '8px' }}>
          {dish.calories} kcal
        </span>
      )}

      <button onClick={(e) => { e.stopPropagation(); removeDish(); }} className="btn btn-icon btn-ghost" style={{ width: '24px', height: '24px', opacity: 0.3 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
