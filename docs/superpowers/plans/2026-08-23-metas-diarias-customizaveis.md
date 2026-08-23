# Metas Diárias Customizáveis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user edit the daily nutrition goals (calories, protein, carbs, fat) shown in the Nutrition Dashboard by clicking directly on the goal number, replacing the hardcoded values, with the result persisted in localStorage.

**Architecture:** A new `goals` state object lives in `App.jsx`, following the exact same load/save/update pattern already used for `weeklyData`, `shopping`, and `stickers`. It flows down as props through `TodayView.jsx` into `NutritionDashboard.jsx`, which stops hardcoding its `goals` object and instead reads props. A new small local component, `EditableGoalNumber`, is added inside `NutritionDashboard.jsx` to render each goal number as click-to-edit.

**Tech Stack:** React 19 (function components, hooks), no test framework configured in this repo — verification is manual, via the running Vite dev server in the browser (this project has no jest/vitest/testing-library dependency; do not add one for this feature).

## Global Constraints

- Goals are a single global object (not per-day, not per-meal) — spec explicitly puts per-day goals out of scope.
- No changes to `WeeklyGrid.jsx`, `DayCard.jsx`, `PratoRow.jsx`, `DishModal.jsx`.
- Follow the existing localStorage key naming pattern: `cardapio_semanal_<name>_v<n>`.
- Saved goal value must be a positive number; empty/invalid input on blur reverts to the previous value instead of saving `0`/`NaN`.
- Spec: `docs/superpowers/specs/2026-08-23-metas-diarias-customizaveis-design.md`

---

### Task 1: Add `goals` state and persistence to `App.jsx`

**Files:**
- Modify: `C:\Códigos\Cardapio\src\App.jsx`

**Interfaces:**
- Consumes: nothing new (uses existing `useState`, `useEffect`, `localStorage` patterns already in the file).
- Produces: `goals` object shape `{ cals: number, p: number, c: number, f: number }` and `updateGoal(field, value)` function, both passed as props to `<TodayView />`. Task 2 consumes these exact prop names.

- [ ] **Step 1: Add the storage key constant**

In `C:\Códigos\Cardapio\src\App.jsx`, find:

```js
const STORAGE_KEY_TITLE = 'cardapio_semanal_title_v2';
```

Add immediately after it:

```js
const STORAGE_KEY_GOALS = 'cardapio_semanal_goals_v1';
```

- [ ] **Step 2: Add the `goals` state**

Find:

```js
  const [weekLabel, setWeekLabel] = useState('Minha semana');
```

Add immediately after it:

```js
  const [goals, setGoals] = useState({ cals: 2000, p: 150, c: 200, f: 65 });
```

- [ ] **Step 3: Load saved goals from localStorage**

Find the load effect:

```js
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY_DATA);
    const savedShopping = localStorage.getItem(STORAGE_KEY_SHOPPING);
    const savedStickers = localStorage.getItem(STORAGE_KEY_STICKERS);
    const savedTitle = localStorage.getItem(STORAGE_KEY_TITLE);

    if (savedData) setWeeklyData(JSON.parse(savedData));
    if (savedShopping) setShopping(JSON.parse(savedShopping));
    if (savedStickers) setStickers(JSON.parse(savedStickers));
    if (savedTitle) setWeekLabel(savedTitle);
    
    setIsLoaded(true);
  }, []);
```

Replace with:

```js
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
```

- [ ] **Step 4: Save goals to localStorage on change**

Find the save effect:

```js
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(weeklyData));
      localStorage.setItem(STORAGE_KEY_SHOPPING, JSON.stringify(shopping));
      localStorage.setItem(STORAGE_KEY_STICKERS, JSON.stringify(stickers));
      localStorage.setItem(STORAGE_KEY_TITLE, weekLabel);
    }
  }, [weeklyData, shopping, stickers, weekLabel, isLoaded]);
```

Replace with:

```js
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(weeklyData));
      localStorage.setItem(STORAGE_KEY_SHOPPING, JSON.stringify(shopping));
      localStorage.setItem(STORAGE_KEY_STICKERS, JSON.stringify(stickers));
      localStorage.setItem(STORAGE_KEY_TITLE, weekLabel);
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    }
  }, [weeklyData, shopping, stickers, weekLabel, goals, isLoaded]);
```

- [ ] **Step 5: Add the `updateGoal` function**

Find:

```js
  // Shopping list actions
  const addShoppingItem = () => {
```

Add immediately before it:

```js
  // Goals actions
  const updateGoal = (field, value) => {
    setGoals(prev => ({ ...prev, [field]: value }));
  };

```

- [ ] **Step 6: Pass `goals` and `updateGoal` to `TodayView`**

Find:

```js
      ) : (
        <TodayView 
          weeklyData={weeklyData}
          addDish={addDish}
          updateDish={updateDish}
          removeDish={removeDish}
          moveDish={moveDish}
        />
      )}
```

Replace with:

```js
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

- [ ] **Step 7: Verify the app still builds and loads**

The dev server is already running via the project's `.claude/launch.json` (`npm run dev` on port 5173). Reload `http://localhost:5173` in the browser and confirm:
- No console errors.
- The "Foco do Dia" view still renders the dashboard with `0 / 2000kcal` etc. (unchanged visually — this task only wires state, no UI change yet).

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add customizable daily goals state to App.jsx"
```

(If this project is not yet a git repository, skip this step and note it — do not run `git init` without asking the user first.)

---

### Task 2: Thread `goals`/`updateGoal` through `TodayView.jsx`

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\TodayView.jsx`

**Interfaces:**
- Consumes: `goals` (object `{ cals, p, c, f }`) and `updateGoal(field, value)` props from `App.jsx` (Task 1).
- Produces: passes the same `goals` and `updateGoal` props straight through to `<NutritionDashboard />`. Task 3 consumes these exact prop names.

- [ ] **Step 1: Accept the new props**

In `C:\Códigos\Cardapio\src\components\TodayView.jsx`, find:

```jsx
export default function TodayView({ weeklyData, updateDish, removeDish, addDish, moveDish }) {
```

Replace with:

```jsx
export default function TodayView({ weeklyData, updateDish, removeDish, addDish, moveDish, goals, updateGoal }) {
```

- [ ] **Step 2: Pass them to `NutritionDashboard`**

Find:

```jsx
      {/* Right Column: Nutrition Dashboard */}
      <div style={{ flex: '0 0 320px', minWidth: '300px', alignSelf: 'stretch' }}>
        <NutritionDashboard dailyDishes={dayData} />
      </div>
```

Replace with:

```jsx
      {/* Right Column: Nutrition Dashboard */}
      <div style={{ flex: '0 0 320px', minWidth: '300px', alignSelf: 'stretch' }}>
        <NutritionDashboard dailyDishes={dayData} goals={goals} updateGoal={updateGoal} />
      </div>
```

- [ ] **Step 3: Verify no console errors**

Reload `http://localhost:5173`, stay on "Foco do Dia". No visual change expected yet (NutritionDashboard doesn't use the new props until Task 3). Confirm no React prop-type warnings in the console.

- [ ] **Step 4: Commit**

```bash
git add src/components/TodayView.jsx
git commit -m "feat: pass goals props through TodayView to NutritionDashboard"
```

---

### Task 3: Editable goal numbers in `NutritionDashboard.jsx`

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\NutritionDashboard.jsx`

**Interfaces:**
- Consumes: `goals` (`{ cals: number, p: number, c: number, f: number }`) and `updateGoal(field, value)` props (Task 2). `dailyDishes` prop is unchanged from current behavior.
- Produces: nothing consumed by later tasks — this is the last code task.

- [ ] **Step 1: Update the React import**

Find, at the top of `C:\Códigos\Cardapio\src\components\NutritionDashboard.jsx`:

```jsx
import React, { useState } from 'react';
```

Replace with:

```jsx
import React, { useState, useRef, useEffect } from 'react';
```

- [ ] **Step 2: Accept props and remove the hardcoded goals object**

Find:

```jsx
export default function NutritionDashboard({ dailyDishes }) {
  const [waterGlasses, setWaterGlasses] = useState(0);
  const totalWater = 8; // 8 glasses of 250ml = 2L

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

  // Mock goals
  const goals = {
    cals: 2000,
    p: 150,
    c: 200,
    f: 65
  };

  const getPercent = (value, goal) => Math.min(100, Math.round((value / goal) * 100)) || 0;
```

Replace with:

```jsx
export default function NutritionDashboard({ dailyDishes, goals, updateGoal }) {
  const [waterGlasses, setWaterGlasses] = useState(0);
  const totalWater = 8; // 8 glasses of 250ml = 2L

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

  const getPercent = (value, goal) => Math.min(100, Math.round((value / goal) * 100)) || 0;
```

- [ ] **Step 3: Add the `EditableGoalNumber` local component**

Find:

```jsx
  const renderProgressBar = (label, current, goal, unit, color) => {
```

Add immediately before it (still inside `NutritionDashboard`, before `renderProgressBar`):

```jsx
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

```

- [ ] **Step 4: Wire `EditableGoalNumber` into `renderProgressBar` and its call sites**

Find:

```jsx
  const renderProgressBar = (label, current, goal, unit, color) => {
    const pct = getPercent(current, goal);
    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>
          <span style={{ color: 'var(--color-text)' }}>{label}</span>
          <span style={{ color: color }}>{current} / {goal}{unit}</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
        </div>
      </div>
    );
  };
```

Replace with:

```jsx
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
```

Find:

```jsx
        {renderProgressBar('Calorias', totalCals, goals.cals, 'kcal', 'var(--color-accent)')}
        {renderProgressBar('Proteínas', totalP, goals.p, 'g', '#ef4444')}
        {renderProgressBar('Carboidratos', totalC, goals.c, 'g', '#eab308')}
        {renderProgressBar('Gorduras', totalF, goals.f, 'g', '#8b5cf6')}
```

Replace with:

```jsx
        {renderProgressBar('Calorias', totalCals, goals.cals, 'kcal', 'var(--color-accent)', 'cals')}
        {renderProgressBar('Proteínas', totalP, goals.p, 'g', '#ef4444', 'p')}
        {renderProgressBar('Carboidratos', totalC, goals.c, 'g', '#eab308', 'c')}
        {renderProgressBar('Gorduras', totalF, goals.f, 'g', '#8b5cf6', 'f')}
```

- [ ] **Step 5: Manual verification in the browser**

The dev server runs via `.claude/launch.json` (`npm run dev`, port 5173). With the app open at `http://localhost:5173`:

1. Go to "Foco do Dia".
2. Click the "2000" in "0 / 2000kcal" (Calorias row). It should turn into a number input, focused and selected.
3. Type `2500`, press Enter. The text should return to display mode showing "... / 2500kcal", and the progress bar percentage should recompute.
4. Reload the page. Confirm "2500" is still shown (persisted via localStorage key `cardapio_semanal_goals_v1`).
5. Click the calories goal again, clear the field, click away (blur) without typing a new value. Confirm it reverts to "2500" (not "0" or blank).
6. Click the calories goal again, type `0`, press Enter. Confirm it reverts to "2500" (rejected as not `> 0`).
7. Click the calories goal again, type `1800`, press Escape. Confirm it reverts to "2500" (cancelled, not saved).
8. Repeat steps 2-3 for Proteínas, Carboidratos, and Gorduras (fields `p`, `c`, `f`) to confirm each is wired to the correct field.
9. Check the browser console for errors throughout — there should be none.

- [ ] **Step 6: Commit**

```bash
git add src/components/NutritionDashboard.jsx
git commit -m "feat: make daily nutrition goals editable inline"
```

---

## Self-Review Notes

- **Spec coverage:** inline click-to-edit (Task 3, Step 3) ✅; global single goal object, no per-day (Task 1, Step 2) ✅; localStorage persistence with `cardapio_semanal_goals_v1` key (Task 1, Steps 1/3/4) ✅; validation rejecting empty/`0`/negative on blur (Task 3, Step 3 `commit()`) ✅; no changes to `WeeklyGrid`/`DayCard`/`PratoRow`/`DishModal` (not touched by any task) ✅; manual verification plan matches spec's four listed checks, expanded with the 0/Escape/blur edge cases (Task 3, Step 5) ✅.
- **Placeholder scan:** no TBD/TODO; every step shows complete code, not descriptions.
- **Type consistency:** `goals` shape `{ cals, p, c, f }` is identical across `App.jsx` (Task 1), `TodayView.jsx` (Task 2), and `NutritionDashboard.jsx` (Task 3). `updateGoal(field, value)` signature matches at every call site (`App.jsx` definition, `NutritionDashboard.jsx` `EditableGoalNumber` usage). Field string literals (`'cals'`, `'p'`, `'c'`, `'f'`) match the keys of the `goals` object defined in Task 1, Step 2.
