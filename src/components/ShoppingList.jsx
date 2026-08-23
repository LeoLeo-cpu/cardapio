import React from 'react';
import EditableText from './EditableText';

export default function ShoppingList({ shopping, addShoppingItem, updateShoppingItem, removeShoppingItem, generateShoppingList }) {
  const isEmpty = shopping.length === 0;

  return (
    <section className="glass-panel" style={{
      position: 'relative',
      zIndex: 1,
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      marginTop: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{
          display: 'inline-flex',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'var(--color-accent-2-100)',
          color: 'var(--color-accent-2-700)',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </span>
        <h3 style={{ fontSize: '18px', margin: 0, flex: 1 }}>Lista de compras</h3>
        <button onClick={generateShoppingList} title="Gerar lista da semana" className="btn btn-icon btn-ghost" style={{ width: '28px', height: '28px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"></path>
          </svg>
        </button>
        <button onClick={addShoppingItem} title="Adicionar item" className="btn btn-icon btn-ghost" style={{ width: '28px', height: '28px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {shopping.map(item => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 2px', borderBottom: '1px solid var(--color-divider)' }}>
          <input 
            type="checkbox" 
            checked={item.done || false} 
            onChange={(e) => updateShoppingItem(item.id, { done: e.target.checked })}
            style={{ width: '19px', height: '19px', accentColor: 'var(--color-accent-2)', flex: 'none' }} 
          />
          <EditableText 
            tagName="span"
            value={item.text || ''} 
            onChange={(val) => updateShoppingItem(item.id, { text: val })}
            placeholder="item"
            style={item.done ? 
              { flex: 1, minWidth: 0, fontSize: '14px', textDecoration: 'line-through', opacity: 0.5 } : 
              { flex: 1, minWidth: 0, fontSize: '14px' }
            }
          />
          <button onClick={() => removeShoppingItem(item.id)} className="btn btn-icon btn-ghost" style={{ width: '24px', height: '24px', flex: 'none', padding: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ))}
      {isEmpty && (
        <div style={{ fontSize: '13px', opacity: 0.45, padding: '6px 2px' }}>nenhum item ainda — toque no + para adicionar</div>
      )}
    </section>
  );
}
