import React, { useState, useEffect, useRef } from 'react';
import WeeklyGrid from './components/WeeklyGrid';
import TodayView from './components/TodayView';
import { MEAL_IDS } from './components/DayCard';
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
  const fileInputRef = useRef(null);
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

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const cleanedData = {};
      Object.entries(parsedData).forEach(([dayId, dayData]) => {
        const cleanedDayData = {};
        Object.entries(dayData).forEach(([mealId, mealData]) => {
          if (MEAL_IDS.includes(mealId)) {
            cleanedDayData[mealId] = mealData;
          }
        });
        cleanedData[dayId] = cleanedDayData;
      });
      setWeeklyData(cleanedData);
    }
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

  // Dish/drink actions
  const addListItem = (dayId, mealId, listKey, item) => {
    setWeeklyData(prev => {
      const dayData = prev[dayId] || {};
      const mealData = dayData[mealId] || { dishes: [] };
      return {
        ...prev,
        [dayId]: {
          ...dayData,
          [mealId]: {
            ...mealData,
            [listKey]: [...(mealData[listKey] || []), item]
          }
        }
      };
    });
  };

  const updateListItem = (dayId, mealId, listKey, itemId, patch) => {
    setWeeklyData(prev => {
      const dayData = prev[dayId] || {};
      const mealData = dayData[mealId] || { dishes: [] };
      return {
        ...prev,
        [dayId]: {
          ...dayData,
          [mealId]: {
            ...mealData,
            [listKey]: (mealData[listKey] || []).map(item => item.id === itemId ? { ...item, ...patch } : item)
          }
        }
      };
    });
  };

  const removeListItem = (dayId, mealId, listKey, itemId) => {
    setWeeklyData(prev => {
      const dayData = prev[dayId] || {};
      const mealData = dayData[mealId] || { dishes: [] };
      return {
        ...prev,
        [dayId]: {
          ...dayData,
          [mealId]: {
            ...mealData,
            [listKey]: (mealData[listKey] || []).filter(item => item.id !== itemId)
          }
        }
      };
    });
  };

  const addDish = (dayId, mealId) => {
    addListItem(dayId, mealId, 'dishes', { id: Date.now().toString(), name: 'Novo prato', ingredients: '', done: false });
  };

  const updateDish = (dayId, mealId, dishId, patch) => {
    updateListItem(dayId, mealId, 'dishes', dishId, patch);
  };

  const removeDish = (dayId, mealId, dishId) => {
    removeListItem(dayId, mealId, 'dishes', dishId);
  };

  const addDrink = (dayId, mealId) => {
    addListItem(dayId, mealId, 'drinks', { id: Date.now().toString(), name: 'Nova bebida', ingredients: '', done: false });
  };

  const updateDrink = (dayId, mealId, drinkId, patch) => {
    updateListItem(dayId, mealId, 'drinks', drinkId, patch);
  };

  const removeDrink = (dayId, mealId, drinkId) => {
    removeListItem(dayId, mealId, 'drinks', drinkId);
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

  const updateMealMacros = (dayId, mealId, patch) => {
    setWeeklyData(prev => {
      const dayData = prev[dayId] || {};
      const mealData = dayData[mealId] || { dishes: [] };
      return {
        ...prev,
        [dayId]: {
          ...dayData,
          [mealId]: {
            ...mealData,
            ...patch
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

  const generateShoppingList = () => {
    const existingTexts = new Set(
      shopping.map(item => (item.text || '').trim().toLowerCase())
    );
    const newTexts = new Set();

    const collectIngredients = (item) => {
      const ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
      ingredients.forEach(ing => {
        const normalized = (ing.text || '').trim();
        if (!normalized) return;
        const key = normalized.toLowerCase();
        if (!existingTexts.has(key) && !newTexts.has(key)) {
          newTexts.add(key);
        }
      });
    };

    Object.values(weeklyData).forEach(dayData => {
      Object.values(dayData).forEach(mealData => {
        (mealData.dishes || []).forEach(collectIngredients);
        (mealData.drinks || []).forEach(collectIngredients);
      });
    });

    if (newTexts.size === 0) return;

    const newItems = [...newTexts].map((key, i) => ({
      id: `${Date.now()}-${i}`,
      text: key,
      done: false
    }));

    setShopping(prev => [...prev, ...newItems]);
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

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch (err) {
        alert('Arquivo inválido: não é um JSON válido.');
        e.target.value = '';
        return;
      }

      if (!window.confirm('Isso vai substituir todos os dados atuais. Continuar?')) {
        e.target.value = '';
        return;
      }

      setWeeklyData(parsed.weeklyData || {});
      setShopping(parsed.shopping || []);
      setStickers(parsed.stickers || []);
      setWeekLabel(parsed.weekLabel || 'Minha semana');
      setGoals(parsed.goals || { cals: 2000, p: 150, c: 200, f: 65 });

      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const exportBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      weeklyData,
      shopping,
      stickers,
      weekLabel,
      goals
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardapio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateWeeklyCalories = () => {
    let total = 0;
    Object.values(weeklyData).forEach(dayData => {
      Object.values(dayData).forEach(mealData => {
        const cals = parseInt(mealData.calories?.toString().replace(/\D/g, ''), 10);
        if (!isNaN(cals)) total += cals;
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
          <button
            onClick={exportBackup}
            title="Exportar backup"
            className="btn btn-ghost"
            style={{
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.5)',
              padding: '6px 10px',
              borderRadius: '20px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12"></path>
              <path d="m7 10 5 5 5-5"></path>
              <path d="M5 21h14"></path>
            </svg>
          </button>
          <button
            onClick={() => fileInputRef.current.click()}
            title="Importar backup"
            className="btn btn-ghost"
            style={{
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.5)',
              padding: '6px 10px',
              borderRadius: '20px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21V9"></path>
              <path d="m7 14 5-5 5 5"></path>
              <path d="M5 3h14"></path>
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
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
          addDrink={addDrink}
          updateDrink={updateDrink}
          removeDrink={removeDrink}
          updateMealMacros={updateMealMacros}
        />
      ) : (
        <TodayView
          weeklyData={weeklyData}
          addDish={addDish}
          updateDish={updateDish}
          removeDish={removeDish}
          moveDish={moveDish}
          addDrink={addDrink}
          updateDrink={updateDrink}
          removeDrink={removeDrink}
          goals={goals}
          updateGoal={updateGoal}
          updateMealMacros={updateMealMacros}
        />
      )}
      
      <ShoppingList
        shopping={shopping}
        addShoppingItem={addShoppingItem}
        updateShoppingItem={updateShoppingItem}
        removeShoppingItem={removeShoppingItem}
        generateShoppingList={generateShoppingList}
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
