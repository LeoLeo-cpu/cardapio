import React, { useState, useRef, useEffect } from 'react';

export default function NutritionDashboard({ dailyDishes, goals, updateGoal }) {
  const [waterGlasses, setWaterGlasses] = useState(0);
  const totalWater = 8; // 8 glasses of 250ml = 2L

  // Calculate totals from meals
  let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;

  Object.values(dailyDishes).forEach(mealData => {
    totalCals += parseInt(mealData.calories || 0, 10);
    totalP += parseInt(mealData.proteins || 0, 10);
    totalC += parseInt(mealData.carbs || 0, 10);
    totalF += parseInt(mealData.fats || 0, 10);
  });

  const getPercent = (value, goal) => Math.min(100, Math.round((value / goal) * 100)) || 0;

  const EditableGoalNumber = ({ field, value, unit, color }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(String(value));
    const inputRef = useRef(null);

    useEffect(() => {
      if (isEditing) {
        setDraft(String(value));
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }, [isEditing]);

    const commit = () => {
      const parsed = parseFloat(draft);
      if (!isNaN(parsed) && parsed > 0) {
        updateGoal(field, parsed);
      }
      setIsEditing(false);
    };

    const cancel = () => setIsEditing(false);

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="number"
          min="1"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { e.preventDefault(); cancel(); }
          }}
          style={{
            width: '56px',
            fontSize: '13px',
            fontWeight: 600,
            color,
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: '4px',
            padding: '1px 4px',
            background: '#fff'
          }}
        />
      );
    }

    return (
      <span
        onClick={() => setIsEditing(true)}
        title="Clique para editar a meta"
        style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
      >
        {value}{unit}
      </span>
    );
  };

  const renderProgressBar = (label, current, goal, unit, color, field) => {
    const pct = getPercent(current, goal);
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
          <span style={{ color: 'var(--color-text)' }}>{label}</span>
          <span style={{ color: color }}>{current} / <EditableGoalNumber field={field} value={goal} unit={unit} color={color} /></span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-lg)', height: '100%' }}>
      
      {/* Water Tracker */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#1e3a8a' }}>Água ({(waterGlasses * 250)}ml)</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Array.from({ length: totalWater }).map((_, i) => (
            <button
              key={i}
              onClick={() => setWaterGlasses(i === waterGlasses - 1 ? i : i + 1)}
              style={{
                width: '32px',
                height: '40px',
                borderRadius: '6px 6px 12px 12px',
                border: '2px solid #93c5fd',
                background: i < waterGlasses ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: i < waterGlasses ? '0 4px 10px rgba(59, 130, 246, 0.4)' : 'none'
              }}
            />
          ))}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.05)', marginBottom: '24px' }} />

      {/* Macros */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h5l2-9 4 18 2-9h5"></path>
          </svg>
          <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--color-text)' }}>Metas Diárias</h3>
        </div>

        {renderProgressBar('Calorias', totalCals, goals.cals, 'kcal', 'var(--color-accent)', 'cals')}
        {renderProgressBar('Proteínas', totalP, goals.p, 'g', '#ef4444', 'p')}
        {renderProgressBar('Carboidratos', totalC, goals.c, 'g', '#eab308', 'c')}
        {renderProgressBar('Gorduras', totalF, goals.f, 'g', '#8b5cf6', 'f')}
      </div>

    </div>
  );
}
