# Nova Lista de Refeições + Bebidas por Refeição Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 6-meal list (Café, Almoço, Lanche, Jantar, Sobremesa, Bebidas) with 5 meals in a new order (Café da manhã, Lanche da manhã, Almoço, Lanche da tarde, Jantar), and give each of those 5 meals its own "Bebidas" sub-list of drink items (add/edit/remove, no drag & drop), alongside the existing "Pratos" list.

**Architecture:** `weeklyData[dayId][mealId]` gains a `drinks` array, sibling to the existing `dishes` array. `App.jsx`'s dish CRUD functions (`addDish`/`updateDish`/`removeDish`) are refactored into thin wrappers over three new generic helpers (`addListItem`/`updateListItem`/`removeListItem`) parameterized by a `listKey` (`'dishes'` or `'drinks'`) — their signatures and behavior for dishes stay identical, so no existing call site changes for dishes. Three new sibling functions (`addDrink`/`updateDrink`/`removeDrink`) reuse the same helpers for the `'drinks'` list. `PratoRow.jsx` gets one new optional prop (`draggable`, default `true`) so drink rows can render without a drag handle. `DayCard.jsx` gets a new 5-item `MEALS_CONFIG`, drops the now-dead `showDessertDrinks` toggle entirely, and renders a "Bebidas" sub-section per meal reusing `PratoRow`/`DishModal` unmodified (beyond the new `draggable` prop).

**Tech Stack:** React 19 (function components, hooks), no test framework configured in this repo — verification is manual, via the running Vite dev server in the browser.

## Global Constraints

- No migration: dishes previously stored under the old `dessert`/`drinks` meal ids become orphaned — never read again. Same policy already used for prior features in this app.
- Drinks are not draggable between meals/days (dishes remain draggable, unchanged).
- One shared set of meal-level macros (`calories`/`proteins`/`carbs`/`fats`, from the prior feature) covers both dishes and drinks in that meal — no separate drink macros.
- `generateShoppingList` (App.jsx) must scan ingredients from both `dishes` and `drinks`.
- No changes to `DishModal.jsx`, `MealMacrosModal.jsx`, `NutritionDashboard.jsx`, `ShoppingList.jsx`, `SubstitutionModal.jsx`, `EditableText.jsx`, `Sticker.jsx`, `StickerPad.jsx`.
- Spec: `docs/superpowers/specs/2026-08-23-refeicoes-e-bebidas-design.md`

**Correction found while planning:** the spec listed `PratoRow.jsx` as out-of-scope, but rendering a drink row with no drag handle (per the "no drag & drop for drinks" decision) requires a small, additive change to `PratoRow.jsx` — a `draggable` prop that conditionally renders the drag handle. This is included as Task 2 below; nothing else about `PratoRow.jsx` changes.

---

### Task 1: `App.jsx` — generalize dish CRUD, add drink actions, extend shopping list generation

**Files:**
- Modify: `C:\Códigos\Cardapio\src\App.jsx`

**Interfaces:**
- Consumes: existing `weeklyData`/`setWeeklyData`/`shopping` state.
- Produces: `addDish(dayId, mealId)`, `updateDish(dayId, mealId, dishId, patch)`, `removeDish(dayId, mealId, dishId)` — **signatures unchanged** from before this task. New: `addDrink(dayId, mealId)`, `updateDrink(dayId, mealId, drinkId, patch)`, `removeDrink(dayId, mealId, drinkId)` — same shape as their dish counterparts. All six passed as props to `<WeeklyGrid />` and `<TodayView />`. Tasks 3 and 4 consume these exact names.

- [ ] **Step 1: Replace the dish actions block with generalized helpers + dish/drink wrappers**

Find, in `C:\Códigos\Cardapio\src\App.jsx`:

```js
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
            dishes: [...(mealData.dishes || []), { id: Date.now().toString(), name: 'Novo prato', ingredients: '', done: false }]
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
```

Replace with:

```js
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
```

- [ ] **Step 2: Extend `generateShoppingList` to also scan drinks**

Find:

```js
  const generateShoppingList = () => {
    const existingTexts = new Set(
      shopping.map(item => (item.text || '').trim().toLowerCase())
    );
    const newTexts = new Set();

    Object.values(weeklyData).forEach(dayData => {
      Object.values(dayData).forEach(mealData => {
        (mealData.dishes || []).forEach(dish => {
          const ingredients = Array.isArray(dish.ingredients) ? dish.ingredients : [];
          ingredients.forEach(ing => {
            const normalized = (ing.text || '').trim();
            if (!normalized) return;
            const key = normalized.toLowerCase();
            if (!existingTexts.has(key) && !newTexts.has(key)) {
              newTexts.add(key);
            }
          });
        });
      });
    });

    if (newTexts.size === 0) return;
```

Replace with:

```js
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
```

- [ ] **Step 3: Pass the three new drink actions to `WeeklyGrid` and `TodayView`**

Find:

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

Replace with:

```jsx
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
```

- [ ] **Step 4: Verify no console errors**

Reload `http://localhost:5173`. Existing dishes, shopping list, and meal macros should render exactly as before (no visual change yet — `DayCard.jsx` doesn't use the new props until Task 5). Confirm no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: generalize dish CRUD into dish/drink actions, scan drinks in shopping list"
```

---

### Task 2: `PratoRow.jsx` — optional `draggable` prop

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\PratoRow.jsx`

**Interfaces:**
- Consumes: nothing new from earlier tasks.
- Produces: `PratoRow` accepts a new optional prop `draggable` (boolean, default `true`). When `false`, the drag-handle span (and its `onDragStart`) is not rendered. Task 5 (`DayCard.jsx`) passes `draggable={false}` for drink rows.

- [ ] **Step 1: Add the prop and make the drag handle conditional**

Find, in `C:\Códigos\Cardapio\src\components\PratoRow.jsx`:

```jsx
export default function PratoRow({ dayId, mealId, dish, updateDish, removeDish, onRowClick }) {
```

Replace with:

```jsx
export default function PratoRow({ dayId, mealId, dish, updateDish, removeDish, onRowClick, draggable = true }) {
```

Find:

```jsx
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
```

Replace with:

```jsx
      {draggable && (
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
      )}

      <button onClick={handleToggle} className="btn btn-icon btn-ghost" style={{ width: '20px', height: '20px', padding: 0, opacity: dish.done ? 1 : 0.3, color: dish.done ? 'var(--color-accent)' : 'inherit' }}>
```

- [ ] **Step 2: Manual verification in the browser**

Reload the app. Every existing dish row (which doesn't pass `draggable` yet, so it defaults to `true`) should look and behave exactly as before — drag handle visible, drag-and-drop between meals still works. No visual change expected at this point (nothing renders `draggable={false}` until Task 5).

- [ ] **Step 3: Commit**

```bash
git add src/components/PratoRow.jsx
git commit -m "feat: add optional draggable prop to PratoRow for non-draggable rows"
```

---

### Task 3: `WeeklyGrid.jsx` — thread drink actions to `DayCard`

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\WeeklyGrid.jsx`

**Interfaces:**
- Consumes: `addDrink`, `updateDrink`, `removeDrink` props from `App.jsx` (Task 1).
- Produces: passes them straight through to every `<DayCard />` it renders. Task 5 consumes these exact prop names.

- [ ] **Step 1: Accept and pass the three new props**

Find, in `C:\Códigos\Cardapio\src\components\WeeklyGrid.jsx`:

```jsx
export default function WeeklyGrid({ weeklyData, updateDish, removeDish, addDish, moveDish, updateMealMacros }) {
  return (
    <main style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
      {DAYS.map(day => (
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
      ))}
    </main>
  );
}
```

Replace with:

```jsx
export default function WeeklyGrid({ weeklyData, updateDish, removeDish, addDish, moveDish, addDrink, updateDrink, removeDrink, updateMealMacros }) {
  return (
    <main style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
      {DAYS.map(day => (
        <DayCard 
          key={day.id} 
          dayId={day.id}
          dayName={day.name} 
          data={weeklyData[day.id] || {}} 
          updateDish={updateDish}
          removeDish={removeDish}
          addDish={addDish}
          moveDish={moveDish}
          addDrink={addDrink}
          updateDrink={updateDrink}
          removeDrink={removeDrink}
          updateMealMacros={updateMealMacros}
        />
      ))}
    </main>
  );
}
```

- [ ] **Step 2: Verify no console errors**

Reload, switch to "Semana Completa". No visual change yet. Confirm no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/WeeklyGrid.jsx
git commit -m "feat: thread drink actions through WeeklyGrid"
```

---

### Task 4: `TodayView.jsx` — thread drink actions, drop `showDessertDrinks`

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\TodayView.jsx`

**Interfaces:**
- Consumes: `addDrink`, `updateDrink`, `removeDrink` props from `App.jsx` (Task 1).
- Produces: passes them through to `<DayCard />`. Task 5 consumes these exact prop names.

- [ ] **Step 1: Accept and pass the three new props; stop passing `showDessertDrinks`**

Find, in `C:\Códigos\Cardapio\src\components\TodayView.jsx`:

```jsx
export default function TodayView({ weeklyData, updateDish, removeDish, addDish, moveDish, goals, updateGoal, updateMealMacros }) {
```

Replace with:

```jsx
export default function TodayView({ weeklyData, updateDish, removeDish, addDish, moveDish, addDrink, updateDrink, removeDrink, goals, updateGoal, updateMealMacros }) {
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
          updateMealMacros={updateMealMacros}
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
          addDrink={addDrink}
          updateDrink={updateDrink}
          removeDrink={removeDrink}
          updateMealMacros={updateMealMacros}
        />
```

- [ ] **Step 2: Verify no console errors**

Reload, stay on "Foco do Dia". No visual change yet (`DayCard.jsx` still has the old `MEALS_CONFIG` and ignores the new props until Task 5). Confirm no console errors — in particular, no warning about `showDessertDrinks` being an unknown prop (it's simply not passed anymore, which is fine since Task 5 removes it from `DayCard.jsx` too).

- [ ] **Step 3: Commit**

```bash
git add src/components/TodayView.jsx
git commit -m "feat: thread drink actions through TodayView, stop passing showDessertDrinks"
```

---

### Task 5: `DayCard.jsx` — new meal list, drinks sub-section

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\DayCard.jsx`

**Interfaces:**
- Consumes: `addDrink`, `updateDrink`, `removeDrink` props (Tasks 3/4); `draggable` prop on `PratoRow` (Task 2).
- Produces: nothing consumed by later tasks — this is the last code task.

- [ ] **Step 1: Replace `MEALS_CONFIG` with the new 5-meal list**

Find, in `C:\Códigos\Cardapio\src\components\DayCard.jsx`:

```jsx
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
```

Replace with:

```jsx
const MEALS_CONFIG = [
  { 
    id: 'breakfast', 
    name: 'Café da manhã', 
    iconColor: 'var(--color-accent-100)', 
    iconTextColor: 'var(--color-accent-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>
  },
  { 
    id: 'morning_snack', 
    name: 'Lanche da manhã', 
    iconColor: 'var(--color-accent-2-100)', 
    iconTextColor: 'var(--color-accent-2-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M8.5 8.5v.01"></path><path d="M15.5 12v.01"></path><path d="M11 15.5v.01"></path></svg>
  },
  { 
    id: 'lunch', 
    name: 'Almoço', 
    iconColor: 'var(--color-accent-100)', 
    iconTextColor: 'var(--color-accent-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
  },
  { 
    id: 'afternoon_snack', 
    name: 'Lanche da tarde', 
    iconColor: 'var(--color-accent-2-100)', 
    iconTextColor: 'var(--color-accent-2-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M8.5 8.5v.01"></path><path d="M15.5 12v.01"></path><path d="M11 15.5v.01"></path></svg>
  },
  { 
    id: 'dinner', 
    name: 'Jantar', 
    iconColor: 'var(--color-accent-100)', 
    iconTextColor: 'var(--color-accent-700)',
    iconSvg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a7 7 0 1 0 9 9 9 9 0 0 1-9-9Z"></path></svg>
  }
];
```

- [ ] **Step 2: Accept the three new props, remove `showDessertDrinks`**

Find:

```jsx
export default function DayCard({ dayId, dayName, data, updateDish, removeDish, addDish, moveDish, updateMealMacros, showDessertDrinks = true }) {
```

Replace with:

```jsx
export default function DayCard({ dayId, dayName, data, updateDish, removeDish, addDish, moveDish, addDrink, updateDrink, removeDrink, updateMealMacros }) {
```

- [ ] **Step 3: Drop the `showDessertDrinks` guard from the day-total calculation**

Find:

```jsx
  const totalCalories = MEALS_CONFIG.reduce((total, meal) => {
    if (!showDessertDrinks && (meal.id === 'dessert' || meal.id === 'drinks')) return total;
    const cals = parseInt(data[meal.id]?.calories?.toString().replace(/\D/g, ''), 10);
    return total + (isNaN(cals) ? 0 : cals);
  }, 0);
```

Replace with:

```jsx
  const totalCalories = MEALS_CONFIG.reduce((total, meal) => {
    const cals = parseInt(data[meal.id]?.calories?.toString().replace(/\D/g, ''), 10);
    return total + (isNaN(cals) ? 0 : cals);
  }, 0);
```

- [ ] **Step 4: Drop the `showDessertDrinks` guard from the meal loop, add the drinks sub-section**

Find:

```jsx
      {MEALS_CONFIG.map(meal => {
        if (!showDessertDrinks && (meal.id === 'dessert' || meal.id === 'drinks')) return null;
        
        const mealData = data[meal.id] || {};
        const dishes = mealData.dishes || [];
        const isEmpty = dishes.length === 0;
        const mealCaloriesRaw = parseInt(mealData.calories?.toString().replace(/\D/g, ''), 10);
        const mealCalories = isNaN(mealCaloriesRaw) ? 0 : mealCaloriesRaw;
```

Replace with:

```jsx
      {MEALS_CONFIG.map(meal => {
        const mealData = data[meal.id] || {};
        const dishes = mealData.dishes || [];
        const drinks = mealData.drinks || [];
        const isEmpty = dishes.length === 0;
        const isDrinksEmpty = drinks.length === 0;
        const mealCaloriesRaw = parseInt(mealData.calories?.toString().replace(/\D/g, ''), 10);
        const mealCalories = isNaN(mealCaloriesRaw) ? 0 : mealCaloriesRaw;
```

- [ ] **Step 5: Add the "Bebidas" sub-section after the dishes list**

Find:

```jsx
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
```

Replace with:

```jsx
              {dishes.map(dish => (
                <PratoRow 
                  key={dish.id} 
                  dayId={dayId}
                  mealId={meal.id}
                  dish={dish} 
                  updateDish={(patch) => updateDish(dayId, meal.id, dish.id, patch)}
                  removeDish={() => removeDish(dayId, meal.id, dish.id)}
                  onRowClick={() => setActiveDish({ ...dish, mealId: meal.id, listKey: 'dishes' })}
                />
              ))}
              {isEmpty && (
                <div style={{ fontSize: '12px', opacity: 0.4, padding: '4px 4px' }}>nenhum prato ainda</div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 5px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', opacity: 0.7, flex: 1 }}>Bebidas</span>
              <button onClick={() => addDrink(dayId, meal.id)} className="btn btn-icon btn-ghost" style={{ width: '24px', height: '24px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <div style={{ padding: '5px' }}>
              {drinks.map(drink => (
                <PratoRow 
                  key={drink.id} 
                  dayId={dayId}
                  mealId={meal.id}
                  dish={drink} 
                  draggable={false}
                  updateDish={(patch) => updateDrink(dayId, meal.id, drink.id, patch)}
                  removeDish={() => removeDrink(dayId, meal.id, drink.id)}
                  onRowClick={() => setActiveDish({ ...drink, mealId: meal.id, listKey: 'drinks' })}
                />
              ))}
              {isDrinksEmpty && (
                <div style={{ fontSize: '12px', opacity: 0.4, padding: '4px 4px' }}>nenhuma bebida ainda</div>
              )}
            </div>
          </div>
        );
      })}
```

- [ ] **Step 6: Route `DishModal`'s save to `updateDish` or `updateDrink` based on `listKey`**

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
```

Replace with:

```jsx
      {activeDish && (
        <DishModal
          dish={activeDish}
          onClose={() => setActiveDish(null)}
          onSave={(updatedItem) => {
            if (activeDish.listKey === 'drinks') {
              updateDrink(dayId, activeDish.mealId, activeDish.id, updatedItem);
            } else {
              updateDish(dayId, activeDish.mealId, activeDish.id, updatedItem);
            }
          }}
        />
      )}
```

- [ ] **Step 7: Manual verification in the browser**

With the dev server running at `http://localhost:5173`:

1. Go to "Foco do Dia". Confirm exactly 5 meal sections appear, in order: Café da manhã, Lanche da manhã, Almoço, Lanche da tarde, Jantar. No Sobremesa, no standalone Bebidas section.
2. Inside "Café da manhã", confirm a "Bebidas" label with its own "+" button appears below the dishes list (below the "nenhum prato ainda"/dish list), showing "nenhuma bebida ainda" when empty.
3. Click that "+" — a new drink row ("Nova bebida") appears in the Bebidas sub-list. Confirm it has **no drag handle** (compare visually/structurally to a dish row, which has one).
4. Click the new drink row — `DishModal` opens (same modal as dishes). Rename it and add an ingredient (e.g. "Suco de laranja", ingredient "Laranja"), save. Confirm the drink row now shows the new name, and it's still in the Bebidas sub-list (not the Pratos list).
5. Go to "Lista de compras", click "Gerar lista da semana" — confirm "laranja" appears as a new item (proves `generateShoppingList` now scans drinks too).
6. Remove the drink (click its remove button) — confirm it disappears from Bebidas without touching any dish in the same meal.
7. Add a dish in the same meal, confirm it still has its drag handle and can still be dragged to another meal (dish drag-and-drop still works, unaffected by the drinks feature).
8. Switch to "Semana Completa" — confirm the same 5-meal structure with Bebidas sub-sections appears for every day.
9. Reload the page — confirm any drinks added persist (localStorage, same `cardapio_semanal_data_v2` key, new `drinks` field inside meal objects).
10. Check the browser console for errors throughout — there should be none.

- [ ] **Step 8: Commit**

```bash
git add src/components/DayCard.jsx
git commit -m "feat: new 5-meal list with per-meal Bebidas sub-section"
```

---

## Self-Review Notes

- **Spec coverage:** new 5-meal order (Task 5, Step 1) ✅; drinks sub-list per meal reusing `PratoRow`/`DishModal` (Task 5, Steps 5-6) ✅; no drag & drop for drinks (Task 2 + Task 5 Step 5 `draggable={false}`) ✅; `generateShoppingList` scans drinks (Task 1, Step 2) ✅; `addDish`/`updateDish`/`removeDish` signatures unchanged, no existing dish call sites touched beyond prop-threading (Task 1, Step 1) ✅; `showDessertDrinks` removed entirely from `DayCard.jsx`/`TodayView.jsx` (Task 4 Step 1, Task 5 Steps 2-4) ✅; no migration for old Sobremesa/Bebidas dishes (not addressed by any task — correct, per spec, they're simply never read since those meal ids no longer exist in `MEALS_CONFIG`) ✅; shared meal-level macros cover dishes+drinks together (no task adds separate drink macros — correct, per spec) ✅.
- **Placeholder scan:** no TBD/TODO; every step shows complete code.
- **Type consistency:** `addDrink(dayId, mealId)` / `updateDrink(dayId, mealId, drinkId, patch)` / `removeDrink(dayId, mealId, drinkId)` signatures match across definition (Task 1), threading (Tasks 3/4), and usage (Task 5). `PratoRow`'s new `draggable` prop (Task 2) matches its usage in Task 5 Step 5 (`draggable={false}` for drinks, omitted — defaults `true` — for dishes). `activeDish.listKey` (`'dishes'` | `'drinks'`) is set consistently in both `onRowClick` handlers (Task 5, Step 5) and read the same way in the `onSave` router (Task 5, Step 6). Meal ids referenced (`breakfast`, `morning_snack`, `lunch`, `afternoon_snack`, `dinner`) are consistent between `MEALS_CONFIG` (Task 5, Step 1) and everywhere else in `DayCard.jsx` (nothing else hardcodes a meal id).
