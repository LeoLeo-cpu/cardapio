import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function MealMacrosModal({ mealName, macros, onClose, onSave }) {
  const [localMacros, setLocalMacros] = useState(macros || {});

  useEffect(() => {
    setLocalMacros(macros || {});
  }, [macros]);

  const handleChange = (field, value) => {
    setLocalMacros(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(localMacros);
    onClose();
  };

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
        maxWidth: '360px',
        background: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Macros — {mealName}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ width: '32px', height: '32px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-accent-900)', marginBottom: '8px' }}>INFORMAÇÕES NUTRICIONAIS</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Calorias (kcal)</span>
                <input type="number" value={localMacros.calories || ''} onChange={e => handleChange('calories', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Proteínas (g)</span>
                <input type="number" value={localMacros.proteins || ''} onChange={e => handleChange('proteins', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Carboidratos (g)</span>
                <input type="number" value={localMacros.carbs || ''} onChange={e => handleChange('carbs', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Gorduras (g)</span>
                <input type="number" value={localMacros.fats || ''} onChange={e => handleChange('fats', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px 16px' }}>Cancelar</button>
          <button onClick={handleSave} className="btn" style={{ background: 'var(--color-accent)', color: '#fff', padding: '8px 20px', borderRadius: '8px' }}>Salvar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
