import React from 'react';
import PratoRow from './PratoRow';
import DishModal from './DishModal';
import MealMacrosModal from './MealMacrosModal';

const MEALS_CONFIG = [
  { 
    id: 'breakfast', 
    name: 'Café da manhã', 
    iconColor: 'var(--color-accent-100)', 
    iconTextColor: 'var(--color-accent-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>
  },
  { 
    id: 'lunch', 
    name: 'Almoço', 
    iconColor: 'var(--color-accent-2-100)', 
    iconTextColor: 'var(--color-accent-2-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
  },
  { 
    id: 'snack', 
    name: 'Lanche', 
    iconColor: 'var(--color-accent-100)', 
    iconTextColor: 'var(--color-accent-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M8.5 8.5v.01"></path><path d="M15.5 12v.01"></path><path d="M11 15.5v.01"></path></svg>
  },
  { 
    id: 'dinner', 
    name: 'Jantar', 
    iconColor: 'var(--color-accent-2-100)', 
    iconTextColor: 'var(--color-accent-2-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a7 7 0 1 0 9 9 9 9 0 0 1-9-9Z"></path></svg>
  },
  { 
    id: 'dessert', 
    name: 'Sobremesa', 
    iconColor: 'var(--color-accent-100)', 
    iconTextColor: 'var(--color-accent-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M8.5 12 12 21l3.5-9"></path></svg>
  },
  { 
    id: 'drinks', 
    name: 'Bebidas', 
    iconColor: 'var(--color-accent-2-100)', 
    iconTextColor: 'var(--color-accent-2-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8h12l-1 11.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.5Z"></path><path d="M6 8 5 4h14l-1 4"></path><path d="m8 12 4-3 4 3"></path></svg>
  }
];

export default function DayCard({ dayId, dayName, data, updateDish, removeDish, addDish, moveDish, updateMealMacros, showDessertDrinks = true }) {
  const [dragOverMeal, setDragOverMeal] = React.useState(null);
  const [activeDish, setActiveDish] = React.useState(null);
  const [activeMealMacros, setActiveMealMacros] = React.useState(null);

  const totalCalories = MEALS_CONFIG.reduce((total, meal) => {
    if (!showDessertDrinks && (meal.id === 'dessert' || meal.id === 'drinks')) return total;
    const cals = parseInt(data[meal.id]?.calories?.toString().replace(/\D/g, ''), 10);
    return total + (isNaN(cals) ? 0 : cals);
  }, 0);

  return (
    <section className="glass-panel" style={{
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      flex: '1 1 300px',
      minWidth: '280px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '21px', margin: 0 }}>{dayName}</h2>
          {totalCalories > 0 && (
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 600, 
              background: 'var(--color-accent-200)', 
              color: 'var(--color-accent-900)', 
              padding: '2px 8px', 
              borderRadius: '12px' 
            }}>
              {totalCalories} kcal
            </span>
          )}
        </div>
        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: totalCalories > 0 ? 'var(--color-accent)' : 'var(--color-accent-2)' }}></span>
      </div>

      {MEALS_CONFIG.map(meal => {
        if (!showDessertDrinks && (meal.id === 'dessert' || meal.id === 'drinks')) return null;
        
        const mealData = data[meal.id] || {};
        const dishes = mealData.dishes || [];
        const isEmpty = dishes.length === 0;
        const mealCaloriesRaw = parseInt(mealData.calories?.toString().replace(/\D/g, ''), 10);
        const mealCalories = isNaN(mealCaloriesRaw) ? 0 : mealCaloriesRaw;

        return (
          <div key={meal.id} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <div
                onClick={() => setActiveMealMacros(meal.id)}
                title="Clique para editar calorias e macros"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, cursor: 'pointer' }}
              >
                <span style={{
                  display: 'inline-flex',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: meal.iconColor,
                  color: meal.iconTextColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 'none'
                }}>
                  {meal.iconSvg}
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px' }}>{meal.name}</span>
                {mealCalories > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-700)', background: 'var(--color-accent-100)', padding: '2px 6px', borderRadius: '8px' }}>
                    {mealCalories} kcal
                  </span>
                )}
              </div>
              <button onClick={() => addDish(dayId, meal.id)} className="btn btn-icon btn-ghost" style={{ width: '28px', height: '28px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div 
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverMeal(meal.id);
              }}
              onDragLeave={() => setDragOverMeal(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverMeal(null);
                const sourceDayId = e.dataTransfer.getData('dayId');
                const sourceMealId = e.dataTransfer.getData('mealId');
                const dishId = e.dataTransfer.getData('dishId');
                if (sourceDayId && sourceMealId && dishId) {
                  moveDish(sourceDayId, sourceMealId, dayId, meal.id, dishId);
                }
              }}
              style={{ 
                padding: '5px', 
                minHeight: '44px',
                borderRadius: '12px',
                background: dragOverMeal === meal.id ? 'rgba(0,0,0,0.05)' : 'transparent',
                outline: dragOverMeal === meal.id ? '2px dashed var(--color-accent)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {dishes.map(dish => (
                <PratoRow 
                  key={dish.id} 
                  dayId={dayId}
                  mealId={meal.id}
                  dish={dish} 
                  updateDish={(patch) => updateDish(dayId, meal.id, dish.id, patch)}
                  removeDish={() => removeDish(dayId, meal.id, dish.id)}
                  onRowClick={() => setActiveDish({ ...dish, mealId: meal.id })}
                />
              ))}
              {isEmpty && (
                <div style={{ fontSize: '12px', opacity: 0.4, padding: '4px 4px' }}>nenhum prato ainda</div>
              )}
            </div>
          </div>
        );
      })}

      {activeDish && (
        <DishModal
          dish={activeDish}
          onClose={() => setActiveDish(null)}
          onSave={(updatedDish) => {
            updateDish(dayId, activeDish.mealId, activeDish.id, updatedDish);
          }}
        />
      )}

      {activeMealMacros && (
        <MealMacrosModal
          mealName={MEALS_CONFIG.find(m => m.id === activeMealMacros)?.name}
          macros={data[activeMealMacros] || {}}
          onClose={() => setActiveMealMacros(null)}
          onSave={(patch) => updateMealMacros(dayId, activeMealMacros, patch)}
        />
      )}
    </section>
  );
}
