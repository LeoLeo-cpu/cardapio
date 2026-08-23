# Calorias e Macros por Refeição Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move calorie/macro entry from the dish level to the meal level — one set of kcal/protein/carbs/fat per meal (Café, Almoço, etc.), editable via a modal opened by clicking the meal header, instead of per individual dish.

**Architecture:** `weeklyData[dayId][mealId]` gains four new sibling fields (`calories`, `proteins`, `carbs`, `fats`) next to the existing `dishes` array. A new `updateMealMacros(dayId, mealId, patch)` action in `App.jsx` (mirroring the existing `updateDish` pattern) is threaded down through `TodayView.jsx`/`WeeklyGrid.jsx` into `DayCard.jsx`, which opens a new `MealMacrosModal.jsx` (a trimmed-down sibling of `DishModal.jsx` — same visual pattern, only the 4 numeric fields) when the meal header is clicked. All calorie aggregation (`DayCard`'s day total, `NutritionDashboard`'s dashboard totals, `App.jsx`'s weekly total) switches from summing `dish.calories` to summing `mealData.calories` directly. `DishModal.jsx` and `PratoRow.jsx` lose their macro fields/badge since dishes no longer carry that data.

**Tech Stack:** React 19 (function components, hooks), no test framework configured in this repo — verification is manual, via the running Vite dev server in the browser.

## Global Constraints

- No data migration: old per-dish macro values (e.g., already-saved dishes with `calories`/`proteins`/`carbs`/`fats`) are simply never read again — every meal starts at 0/empty.
- Ingredients stay per-dish, unchanged — only calories/macros move to the meal level.
- No changes to `ShoppingList.jsx`, `generateShoppingList` (App.jsx), `SubstitutionModal.jsx`, `EditableText.jsx`, `Sticker.jsx`, `StickerPad.jsx`, the `goals`/`updateGoal` daily-goals feature, or the `localStorage` key names (`STORAGE_KEY_DATA` etc. — the shape under that key changes, but the key itself doesn't).
- New modals must use `createPortal(..., document.body)` with `zIndex: 9999`, matching the existing pattern in `DishModal.jsx`/`SubstitutionModal.jsx` (this codebase has a known z-index bug when modals aren't portaled — see prior fix).
- Spec: `docs/superpowers/specs/2026-08-23-macros-por-refeicao-design.md`

---

### Task 1: `App.jsx` — meal-level macro state and actions

**Files:**
- Modify: `C:\Códigos\Cardapio\src\App.jsx`

**Interfaces:**
- Consumes: existing `weeklyData`/`setWeeklyData` state.
- Produces: `updateMealMacros(dayId, mealId, patch)` — merges `patch` (e.g. `{ calories: '400', proteins: '20' }`) into `weeklyData[dayId][mealId]`, creating the day/meal entry if absent. Passed as a prop to both `<WeeklyGrid />` and `<TodayView />`. Tasks 2 and 4 consume this exact prop name and signature.

- [ ] **Step 1: Stop defaulting `calories` on new dishes**

Find, in `C:\Códigos\Cardapio\src\App.jsx`:

```js
            dishes: [...(mealData.dishes || []), { id: Date.now().toString(), name: 'Novo prato', ingredients: '', calories: '', done: false }]
```

Replace with:

```js
            dishes: [...(mealData.dishes || []), { id: Date.now().toString(), name: 'Novo prato', ingredients: '', done: false }]
```

- [ ] **Step 2: Add `updateMealMacros`**

Find:

```js
  // Goals actions
  const updateGoal = (field, value) => {
```

Add immediately before it:

```js
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
```

- [ ] **Step 3: Sum weekly total from meals, not dishes**

Find:

```js
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
```

Replace with:

```js
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
```

- [ ] **Step 4: Pass `updateMealMacros` to `WeeklyGrid` and `TodayView`**

Find:

```jsx
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
```

Replace with:

```jsx
      {viewMode === 'week' ? (
        <WeeklyGrid 
          weeklyData={weeklyData} 
          addDish={addDish}
          updateDish={updateDish} 
          removeDish={removeDish}
          moveDish={moveDish}
          updateMealMacros={updateMealMacros}
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
          updateMealMacros={updateMealMacros}
        />
      )}
```

- [ ] **Step 5: Verify no console errors**

Reload `http://localhost:5173`. The app should render exactly as before (no visual change yet — `DayCard.jsx` doesn't use the new prop until Task 4). Confirm no console errors. Note: the weekly "Total: X kcal" badge in the header will now show 0/disappear if it was only reflecting old per-dish data — that's expected, since `calculateWeeklyCalories` now reads meal-level fields that don't exist yet.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add updateMealMacros action, sum weekly calories from meals"
```

---

### Task 2: Thread `updateMealMacros` through `TodayView.jsx` and `WeeklyGrid.jsx`

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\TodayView.jsx`
- Modify: `C:\Códigos\Cardapio\src\components\WeeklyGrid.jsx`

**Interfaces:**
- Consumes: `updateMealMacros` prop from `App.jsx` (Task 1).
- Produces: passes `updateMealMacros` straight through to every `<DayCard />` it renders. Task 4 (`DayCard.jsx`) consumes this exact prop name.

- [ ] **Step 1: `TodayView.jsx` — accept and pass the prop**

Find, in `C:\Códigos\Cardapio\src\components\TodayView.jsx`:

```jsx
export default function TodayView({ weeklyData, updateDish, removeDish, addDish, moveDish, goals, updateGoal }) {
```

Replace with:

```jsx
export default function TodayView({ weeklyData, updateDish, removeDish, addDish, moveDish, goals, updateGoal, updateMealMacros }) {
```

Find:

```jsx
        <DayCard 
          dayId={currentDayId}
          dayName={`Hoje (${dayNames[currentDayId]})`}
          data={dayData}
          updateDish={updateDish}
          removeDish={removeDish}
          addDish={addDish}
          moveDish={moveDish}
          showDessertDrinks={true}
        />
```

Replace with:

```jsx
        <DayCard 
          dayId={currentDayId}
          dayName={`Hoje (${dayNames[currentDayId]})`}
          data={dayData}
          updateDish={updateDish}
          removeDish={removeDish}
          addDish={addDish}
          moveDish={moveDish}
          updateMealMacros={updateMealMacros}
          showDessertDrinks={true}
        />
```

- [ ] **Step 2: `WeeklyGrid.jsx` — accept and pass the prop**

Find, in `C:\Códigos\Cardapio\src\components\WeeklyGrid.jsx`:

```jsx
export default function WeeklyGrid({ weeklyData, updateDish, removeDish, addDish, moveDish }) {
```

Replace with:

```jsx
export default function WeeklyGrid({ weeklyData, updateDish, removeDish, addDish, moveDish, updateMealMacros }) {
```

Find:

```jsx
        <DayCard 
          key={day.id} 
          dayId={day.id}
          dayName={day.name} 
          data={weeklyData[day.id] || {}} 
          updateDish={updateDish}
          removeDish={removeDish}
          addDish={addDish}
          moveDish={moveDish}
        />
```

Replace with:

```jsx
        <DayCard 
          key={day.id} 
          dayId={day.id}
          dayName={day.name} 
          data={weeklyData[day.id] || {}} 
          updateDish={updateDish}
          removeDish={removeDish}
          addDish={addDish}
          moveDish={moveDish}
          updateMealMacros={updateMealMacros}
        />
```

- [ ] **Step 3: Verify no console errors**

Reload the app in both "Foco do Dia" and "Semana Completa" modes. No visual change yet (`DayCard.jsx` still doesn't use the prop). Confirm no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/TodayView.jsx src/components/WeeklyGrid.jsx
git commit -m "feat: thread updateMealMacros through TodayView and WeeklyGrid"
```

---

### Task 3: New `MealMacrosModal.jsx` component

**Files:**
- Create: `C:\Códigos\Cardapio\src\components\MealMacrosModal.jsx`

**Interfaces:**
- Consumes: nothing from earlier tasks directly (self-contained component).
- Produces: `MealMacrosModal({ mealName, macros, onClose, onSave })` — `macros` is `{ calories, proteins, carbs, fats }` (any may be undefined); `onSave` is called with the full edited `{ calories, proteins, carbs, fats }` object on save. Task 4 (`DayCard.jsx`) consumes this exact component and prop shape.

- [ ] **Step 1: Create the file**

```jsx
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
```

- [ ] **Step 2: Verify no console errors**

This component isn't imported/used anywhere yet, so there's nothing to see in the browser. Just confirm the dev server doesn't report a syntax error for the new file (check `preview_logs` or the browser console for a Vite overlay).

- [ ] **Step 3: Commit**

```bash
git add src/components/MealMacrosModal.jsx
git commit -m "feat: add MealMacrosModal component for per-meal macro editing"
```

---

### Task 4: Wire `MealMacrosModal` into `DayCard.jsx`

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\DayCard.jsx`

**Interfaces:**
- Consumes: `updateMealMacros` prop (Task 1/2), `MealMacrosModal` component (Task 3).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Import `MealMacrosModal` and accept the new prop**

Find, in `C:\Códigos\Cardapio\src\components\DayCard.jsx`:

```jsx
import React from 'react';
import PratoRow from './PratoRow';
import DishModal from './DishModal';
```

Replace with:

```jsx
import React from 'react';
import PratoRow from './PratoRow';
import DishModal from './DishModal';
import MealMacrosModal from './MealMacrosModal';
```

Find:

```jsx
export default function DayCard({ dayId, dayName, data, updateDish, removeDish, addDish, moveDish, showDessertDrinks = true }) {
  const [dragOverMeal, setDragOverMeal] = React.useState(null);
  const [activeDish, setActiveDish] = React.useState(null);
```

Replace with:

```jsx
export default function DayCard({ dayId, dayName, data, updateDish, removeDish, addDish, moveDish, updateMealMacros, showDessertDrinks = true }) {
  const [dragOverMeal, setDragOverMeal] = React.useState(null);
  const [activeDish, setActiveDish] = React.useState(null);
  const [activeMealMacros, setActiveMealMacros] = React.useState(null);
```

- [ ] **Step 2: Sum the day total from meal-level calories, not dish-level**

Find:

```jsx
  const totalCalories = MEALS_CONFIG.reduce((total, meal) => {
    if (!showDessertDrinks && (meal.id === 'dessert' || meal.id === 'drinks')) return total;
    const dishes = data[meal.id]?.dishes || [];
    const mealCals = dishes.reduce((sum, dish) => {
      const cals = parseInt(dish.calories?.toString().replace(/\D/g, ''), 10);
      return sum + (isNaN(cals) ? 0 : cals);
    }, 0);
    return total + mealCals;
  }, 0);
```

Replace with:

```jsx
  const totalCalories = MEALS_CONFIG.reduce((total, meal) => {
    if (!showDessertDrinks && (meal.id === 'dessert' || meal.id === 'drinks')) return total;
    const cals = parseInt(data[meal.id]?.calories?.toString().replace(/\D/g, ''), 10);
    return total + (isNaN(cals) ? 0 : cals);
  }, 0);
```

- [ ] **Step 3: Make the meal header clickable, add a per-meal kcal badge**

Find:

```jsx
        const dishes = data[meal.id]?.dishes || [];
        const isEmpty = dishes.length === 0;

        return (
          <div key={meal.id} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
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
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', flex: 1 }}>{meal.name}</span>
              <button onClick={() => addDish(dayId, meal.id)} className="btn btn-icon btn-ghost" style={{ width: '28px', height: '28px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
```

Replace with:

```jsx
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
```

- [ ] **Step 4: Render `MealMacrosModal` when a meal is active**

Find:

```jsx
      {activeDish && (
        <DishModal 
          dish={activeDish} 
          onClose={() => setActiveDish(null)}
          onSave={(updatedDish) => {
            updateDish(dayId, activeDish.mealId, activeDish.id, updatedDish);
          }}
        />
      )}
    </section>
  );
}
```

Replace with:

```jsx
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
```

- [ ] **Step 5: Manual verification in the browser**

With the dev server running at `http://localhost:5173`:

1. Go to "Foco do Dia". Click the "Café da manhã" header (icon or name, not the "+" button). Confirm `MealMacrosModal` opens with the title "Macros — Café da manhã" and 4 empty fields.
2. Fill Calorias=400, Proteínas=20, Carboidratos=50, Gorduras=10. Click "Salvar". Confirm a "400 kcal" badge now appears next to "Café da manhã" in the header, and the day's total badge (top of the `DayCard`, next to "Hoje (...)") also shows 400 kcal (assuming it was the only meal with data).
3. Click the same meal header again — confirm the modal reopens pre-filled with 400/20/50/10 (not reset to empty).
4. Open a dish inside that meal (click its row) — confirm `DishModal` no longer shows any calorie/macro fields (this depends on Task 6, which hasn't run yet at this point in the plan — if run out of order, expect the old fields still present; that's fine, this specific check should be repeated after Task 6).
5. Add macros to a second meal (e.g. Almoço, 600 kcal). Confirm the day total badge updates to 1000 kcal.
6. Switch to "Semana Completa" — confirm the same meal (today's day) shows its kcal badges there too (shared `weeklyData`).
7. Check the browser console for errors throughout.

- [ ] **Step 6: Commit**

```bash
git add src/components/DayCard.jsx
git commit -m "feat: open MealMacrosModal from meal header, sum day total from meals"
```

---

### Task 5: `NutritionDashboard.jsx` — sum from meals, not dishes

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\NutritionDashboard.jsx`

**Interfaces:**
- Consumes: `dailyDishes` prop (unchanged shape — it's `weeklyData[currentDayId]`, i.e. an object keyed by meal id).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Change the totals calculation**

Find:

```js
  // Calculate totals from dishes
  let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;
  
  Object.values(dailyDishes).forEach(mealData => {
    (mealData.dishes || []).forEach(dish => {
      totalCals += parseInt(dish.calories || 0, 10);
      totalP += parseInt(dish.proteins || 0, 10);
      totalC += parseInt(dish.carbs || 0, 10);
      totalF += parseInt(dish.fats || 0, 10);
    });
  });
```

Replace with:

```js
  // Calculate totals from meals
  let totalCals = 0, totalP = 0, totalC = 0, totalF = 0;
  
  Object.values(dailyDishes).forEach(mealData => {
    totalCals += parseInt(mealData.calories || 0, 10);
    totalP += parseInt(mealData.proteins || 0, 10);
    totalC += parseInt(mealData.carbs || 0, 10);
    totalF += parseInt(mealData.fats || 0, 10);
  });
```

- [ ] **Step 2: Manual verification in the browser**

On "Foco do Dia", with the meal macros entered in Task 4 (Café da manhã 400/20/50/10, Almoço 600/-/-/-), confirm the "Metas Diárias" panel (right column) shows Calorias as `1000 / <goal>kcal`, Proteínas `20 / <goal>g`, Carboidratos `50 / <goal>g`, Gorduras `10 / <goal>g` — matching the sum of the two meals' macros, not any dish-level value.

- [ ] **Step 3: Commit**

```bash
git add src/components/NutritionDashboard.jsx
git commit -m "feat: sum nutrition dashboard totals from meal-level macros"
```

---

### Task 6: `DishModal.jsx` — remove macro fields

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\DishModal.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Remove the "Macros" block**

Find:

```jsx
          {/* Macros */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-accent-900)', marginBottom: '8px' }}>INFORMAÇÕES NUTRICIONAIS</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Calorias (kcal)</span>
                <input type="number" value={localDish.calories || ''} onChange={e => handleChange('calories', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Proteínas (g)</span>
                <input type="number" value={localDish.proteins || ''} onChange={e => handleChange('proteins', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Carboidratos (g)</span>
                <input type="number" value={localDish.carbs || ''} onChange={e => handleChange('carbs', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: '#666' }}>Gorduras (g)</span>
                <input type="number" value={localDish.fats || ''} onChange={e => handleChange('fats', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
            </div>
          </div>

          {/* Ingredientes */}
```

Replace with:

```jsx
          {/* Ingredientes */}
```

- [ ] **Step 2: Manual verification in the browser**

Open any dish's detail modal (click its row). Confirm it shows only "NOME DO PRATO" and "INGREDIENTES" — no "INFORMAÇÕES NUTRICIONAIS" section. Edit the name, add/remove an ingredient, save — confirm it still works exactly as before.

- [ ] **Step 3: Commit**

```bash
git add src/components/DishModal.jsx
git commit -m "feat: remove per-dish macro fields from DishModal"
```

---

### Task 7: `PratoRow.jsx` — remove the per-dish kcal badge

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\PratoRow.jsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks — this is the last code task.

- [ ] **Step 1: Remove the kcal badge**

Find:

```jsx
      {dish.calories && (
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent-700)', background: 'var(--color-accent-100)', padding: '2px 6px', borderRadius: '8px' }}>
          {dish.calories} kcal
        </span>
      )}

      <button onClick={(e) => { e.stopPropagation(); removeDish(); }} className="btn btn-icon btn-ghost" style={{ width: '24px', height: '24px', opacity: 0.3 }}>
```

Replace with:

```jsx
      <button onClick={(e) => { e.stopPropagation(); removeDish(); }} className="btn btn-icon btn-ghost" style={{ width: '24px', height: '24px', opacity: 0.3 }}>
```

- [ ] **Step 2: Full end-to-end manual verification**

With the dev server running at `http://localhost:5173`:

1. Confirm no dish row shows a kcal badge anymore, even for the old "Ovo com Pão Integral" dish that still has `calories: 300` saved in its data (orphaned field, per spec — should simply not render).
2. Repeat the full Task 4 verification sequence (steps 1-7) now that Tasks 6-7 are also done: meal header click → modal → save → badge appears on meal header and day total; dish detail modal has no macro fields; dish row has no kcal badge.
3. Reload the page — confirm meal-level macros persisted (same `cardapio_semanal_data_v2` localStorage key, new shape).
4. Check the browser console for errors throughout — there should be none.

- [ ] **Step 3: Commit**

```bash
git add src/components/PratoRow.jsx
git commit -m "feat: remove per-dish kcal badge from PratoRow"
```

---

## Self-Review Notes

- **Spec coverage:** meal-level data model (Task 1, Step 2) ✅; `MealMacrosModal` popover-style editing via meal header click (Task 3, Task 4 Step 3) ✅; `DishModal` loses macro fields (Task 6) ✅; `PratoRow` loses kcal badge (Task 7) ✅; day total sums meals not dishes (Task 4, Step 2) ✅; `NutritionDashboard` sums meals not dishes (Task 5) ✅; weekly total (App.jsx header) sums meals not dishes (Task 1, Step 3) ✅; no migration — old dish-level values simply orphaned (Task 7, Step 2.1 explicitly verifies this) ✅; no changes to `ShoppingList`/`generateShoppingList`/`SubstitutionModal`/`goals` (not touched by any task) ✅.
- **Placeholder scan:** no TBD/TODO; every step shows complete code.
- **Type consistency:** `updateMealMacros(dayId, mealId, patch)` signature matches across its definition (`App.jsx`, Task 1), threading (`TodayView.jsx`/`WeeklyGrid.jsx`, Task 2), and usage (`DayCard.jsx`, Task 4: `onSave={(patch) => updateMealMacros(dayId, activeMealMacros, patch)}`). `MealMacrosModal({ mealName, macros, onClose, onSave })` props match between its definition (Task 3) and usage (Task 4). Meal-level field names (`calories`, `proteins`, `carbs`, `fats`) are consistent across `App.jsx`, `DayCard.jsx`, `NutritionDashboard.jsx`, and `MealMacrosModal.jsx`.
