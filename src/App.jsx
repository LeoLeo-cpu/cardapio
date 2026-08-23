import React, { useState, useEffect } from 'react';
import WeeklyGrid from './components/WeeklyGrid';
import TodayView from './components/TodayView';
import ShoppingList from './components/ShoppingList';
import StickerPad from './components/StickerPad';
import Sticker from './components/Sticker';
import EditableText from './components/EditableText';
import SubstitutionModal from './components/SubstitutionModal';

const STORAGE_KEY_DATA = 'cardapio_semanal_data_v2';
const STORAGE_KEY_SHOPPING = 'cardapio_semanal_shopping_v2';
const STORAGE_KEY_STICKERS = 'cardapio_semanal_stickers';
const STORAGE_KEY_TITLE = 'cardapio_semanal_title_v2';
const STORAGE_KEY_GOALS = 'cardapio_semanal_goals_v1';

function App() {
  const [weeklyData, setWeeklyData] = useState({});
  const [shopping, setShopping] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [weekLabel, setWeekLabel] = useState('Minha semana');
  const [goals, setGoals] = useState({ cals: 2000, p: 150, c: 200, f: 65 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'week'

  // Load from LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY_DATA);
    const savedShopping = localStorage.getItem(STORAGE_KEY_SHOPPING);
    const savedStickers = localStorage.getItem(STORAGE_KEY_STICKERS);
    const savedTitle = localStorage.getItem(STORAGE_KEY_TITLE);
    const savedGoals = localStorage.getItem(STORAGE_KEY_GOALS);

    if (savedData) setWeeklyData(JSON.parse(savedData));
    if (savedShopping) setShopping(JSON.parse(savedShopping));
    if (savedStickers) setStickers(JSON.parse(savedStickers));
    if (savedTitle) setWeekLabel(savedTitle);
    if (savedGoals) setGoals(JSON.parse(savedGoals));

    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(weeklyData));
      localStorage.setItem(STORAGE_KEY_SHOPPING, JSON.stringify(shopping));
      localStorage.setItem(STORAGE_KEY_STICKERS, JSON.stringify(stickers));
      localStorage.setItem(STORAGE_KEY_TITLE, weekLabel);
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    }
  }, [weeklyData, shopping, stickers, weekLabel, goals, isLoaded]);

  // Dish actions
  const addDish = (dayId, mealId) => {
    setWeeklyData(prev => {
      const dayData = prev[dayId] || {};
      const mealData = dayData[mealId] || { dishes: [] };
      return {
        ...prev,
        [dayId]: {
          ...dayData,
          [mealId]: {
            ...mealData,
            dishes: [...(mealData.dishes || []), { id: Date.now().toString(), name: 'Novo prato', ingredients: '', calories: '', done: false }]
          }
        }
      };
    });
  };

  const updateDish = (dayId, mealId, dishId, patch) => {
    setWeeklyData(prev => {
      const dayData = prev[dayId] || {};
      const mealData = dayData[mealId] || { dishes: [] };
      return {
        ...prev,
        [dayId]: {
          ...dayData,
          [mealId]: {
            ...mealData,
            dishes: mealData.dishes.map(d => d.id === dishId ? { ...d, ...patch } : d)
          }
        }
      };
    });
  };

  const removeDish = (dayId, mealId, dishId) => {
    setWeeklyData(prev => {
      const dayData = prev[dayId] || {};
      const mealData = dayData[mealId] || { dishes: [] };
      return {
        ...prev,
        [dayId]: {
          ...dayData,
          [mealId]: {
            ...mealData,
            dishes: mealData.dishes.filter(d => d.id !== dishId)
          }
        }
      };
    });
  };

  const moveDish = (sourceDayId, sourceMealId, targetDayId, targetMealId, dishId) => {
    setWeeklyData(prev => {
      const sourceDishes = prev[sourceDayId]?.[sourceMealId]?.dishes || [];
      const dishToMove = sourceDishes.find(d => d.id === dishId);
      if (!dishToMove) return prev;

      if (sourceDayId === targetDayId && sourceMealId === targetMealId) return prev;

      const newSourceDishes = sourceDishes.filter(d => d.id !== dishId);
      const targetDishes = prev[targetDayId]?.[targetMealId]?.dishes || [];
      const newTargetDishes = [...targetDishes, dishToMove];

      return {
        ...prev,
        [sourceDayId]: {
          ...prev[sourceDayId],
          [sourceMealId]: {
            ...(prev[sourceDayId]?.[sourceMealId] || {}),
            dishes: newSourceDishes
          }
        },
        [targetDayId]: {
          ...prev[targetDayId],
          [targetMealId]: {
            ...(prev[targetDayId]?.[targetMealId] || {}),
            dishes: newTargetDishes
          }
        }
      };
    });
  };

  // Goals actions
  const updateGoal = (field, value) => {
    setGoals(prev => ({ ...prev, [field]: value }));
  };

  // Shopping list actions
  const addShoppingItem = () => {
    setShopping(prev => [...prev, { id: Date.now().toString(), text: 'novo item', done: false }]);
  };

  const updateShoppingItem = (id, patch) => {
    setShopping(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const removeShoppingItem = (id) => {
    setShopping(prev => prev.filter(item => item.id !== id));
  };

  // Sticker actions
  const addSticker = (emoji, x, y) => {
    setStickers(prev => [
      ...prev,
      { id: Date.now().toString(), emoji, x, y }
    ]);
  };

  const updateStickerPosition = (id, x, y) => {
    setStickers(prev => prev.map(st => st.id === id ? { ...st, x, y } : st));
  };

  const removeSticker = (id) => {
    setStickers(prev => prev.filter(st => st.id !== id));
  };

  const calculateWeeklyCalories = () => {
    let total = 0;
    Object.values(weeklyData).forEach(dayData => {
      Object.values(dayData).forEach(mealData => {
        (mealData.dishes || []).forEach(dish => {
          const cals = parseInt(dish.calories?.toString().replace(/\D/g, ''), 10);
          if (!isNaN(cals)) total += cals;
        });
      });
    });
    return total;
  };
  
  const weeklyCalories = calculateWeeklyCalories();

  if (!isLoaded) return null;

  return (
    <div style={{ minHeight: '100vh', width: '100%' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 24px 70px', position: 'relative' }}>

      <header style={{ position: 'relative', zIndex: 1, marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ display: 'inline-flex', width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-accent)', alignItems: 'center', justifyContent: 'center', color: 'var(--color-bg)', flex: 'none' }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
          </span>
          <h1 style={{ fontSize: '30px', margin: 0 }}>Meu Cardápio</h1>
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="btn btn-ghost"
            style={{
              marginLeft: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.5)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text)'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5"></path>
              <path d="M4 20L21 3"></path>
              <path d="M21 16v5h-5"></path>
              <path d="M15 15l6 6"></path>
              <path d="M4 4l5 5"></path>
            </svg>
            Substituições
          </button>
          {weeklyCalories > 0 && (
            <span style={{
              marginLeft: 'auto',
              fontSize: '14px',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.8)',
              color: 'var(--color-accent-800)',
              padding: '6px 14px',
              borderRadius: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              Total: {weeklyCalories} kcal
            </span>
          )}
        </div>
        
        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            onClick={() => setViewMode('today')}
            className="btn"
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
              background: viewMode === 'today' ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
              color: viewMode === 'today' ? '#fff' : 'var(--color-text)',
              transition: 'all 0.2s'
            }}
          >
            Foco do Dia
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className="btn"
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
              background: viewMode === 'week' ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
              color: viewMode === 'week' ? '#fff' : 'var(--color-text)',
              transition: 'all 0.2s'
            }}
          >
            Semana Completa
          </button>
        </div>

        {viewMode === 'week' && (
          <EditableText
            tagName="span"
            value={weekLabel} 
            onChange={setWeekLabel} 
            placeholder="Minha semana" 
            style={{ fontSize: '14px', opacity: 0.6, color: 'var(--color-text)', display: 'inline-block' }}
          />
        )}
      </header>

      {viewMode === 'week' ? (
        <WeeklyGrid 
          weeklyData={weeklyData} 
          addDish={addDish}
          updateDish={updateDish} 
          removeDish={removeDish}
          moveDish={moveDish}
        />
      ) : (
        <TodayView
          weeklyData={weeklyData}
          addDish={addDish}
          updateDish={updateDish}
          removeDish={removeDish}
          moveDish={moveDish}
          goals={goals}
          updateGoal={updateGoal}
        />
      )}
      
      <ShoppingList 
        shopping={shopping}
        addShoppingItem={addShoppingItem}
        updateShoppingItem={updateShoppingItem}
        removeShoppingItem={removeShoppingItem}
      />
      
      <StickerPad onAddSticker={addSticker} />

      {stickers.map(st => (
        <Sticker
          key={st.id}
          id={st.id}
          emoji={st.emoji}
          initialX={st.x}
          initialY={st.y}
          onUpdatePosition={updateStickerPosition}
          onRemove={removeSticker}
        />
      ))}
      </div>

      {isSubModalOpen && (
        <SubstitutionModal onClose={() => setIsSubModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
