import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { SUBSTITUTIONS_DB } from '../data/substitutions';

export default function SubstitutionModal({ onClose }) {
  const [search, setSearch] = useState('');

  // Filter categories based on search input
  const filteredDB = SUBSTITUTIONS_DB.map(category => {
    // If the category name matches, show all items
    if (category.category.toLowerCase().includes(search.toLowerCase())) {
      return category;
    }
    // Otherwise, filter items that match the search
    const filteredItems = category.items.filter(item => 
      item.toLowerCase().includes(search.toLowerCase())
    );
    return { ...category, items: filteredItems };
  }).filter(category => category.items.length > 0);

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        background: 'rgba(255, 255, 255, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5"></path>
              <path d="M4 20L21 3"></path>
              <path d="M21 16v5h-5"></path>
              <path d="M15 15l6 6"></path>
              <path d="M4 4l5 5"></path>
            </svg>
            Substituições
          </h2>
          <button 
            onClick={onClose}
            className="btn btn-icon btn-ghost" 
            style={{ width: '32px', height: '32px', color: 'var(--color-text)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.02)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginRight: '8px' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar alimento (ex: arroz, frango...)" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '15px',
                color: 'var(--color-text)'
              }}
              autoFocus
            />
          </div>
        </div>

        <div style={{ 
          padding: '16px 24px', 
          overflowY: 'auto',
          flex: 1
        }}>
          {filteredDB.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>
              Nenhum alimento encontrado.
            </div>
          ) : (
            filteredDB.map((category, idx) => (
              <div key={idx} style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '13px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px', 
                  color: 'var(--color-accent-900)',
                  background: 'var(--color-accent-200)',
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  margin: '0 0 12px 0'
                }}>
                  {category.category}
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {category.items.map((item, i) => (
                    <li key={i} style={{ 
                      padding: '10px 14px', 
                      background: 'rgba(255,255,255,0.6)', 
                      borderRadius: '8px',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      border: '1px solid rgba(0,0,0,0.03)'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)', flex: 'none' }}></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
