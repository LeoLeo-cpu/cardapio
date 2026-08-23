# Lista de Compras Automática Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a button that collects the ingredients of every dish across the whole week and merges the new, unique ones into the shopping list, without duplicating or disturbing existing items.

**Architecture:** A new `generateShoppingList()` function lives in `App.jsx` (it already owns both `weeklyData` and `shopping` state, following the same pattern as `addShoppingItem`/`updateGoal`). It's passed as a prop straight to `ShoppingList.jsx`, which gets a new icon button in its header that calls it.

**Tech Stack:** React 19 (function components, hooks), no test framework configured in this repo — verification is manual, via the running Vite dev server in the browser.

## Global Constraints

- Merge behavior only: never remove or overwrite existing shopping list items; never reset an item's `done` state.
- Deduplication compares ingredient/item text case-insensitively, trimmed.
- Scope is the entire `weeklyData` (all 7 days, all meals), not just the current view mode.
- Dishes created via `addDish` default `ingredients` to `''` (a string, not an array) until the user opens `DishModal` and adds one — the scan must not crash on this.
- No changes to `DishModal.jsx`, `PratoRow.jsx`, `DayCard.jsx`, `WeeklyGrid.jsx`, `TodayView.jsx`.
- Spec: `docs/superpowers/specs/2026-08-23-lista-compras-automatica-design.md`

---

### Task 1: Add `generateShoppingList` to `App.jsx`

**Files:**
- Modify: `C:\Códigos\Cardapio\src\App.jsx`

**Interfaces:**
- Consumes: existing `weeklyData` and `shopping` state, existing `setShopping` setter (all already in the file).
- Produces: `generateShoppingList()` function (no arguments, no return value — reads `weeklyData`/`shopping` from closure) passed as a prop to `<ShoppingList />`. Task 2 consumes this exact prop name.

- [ ] **Step 1: Add the function**

Find, in `C:\Códigos\Cardapio\src\App.jsx`:

```js
  const removeShoppingItem = (id) => {
    setShopping(prev => prev.filter(item => item.id !== id));
  };

  // Sticker actions
```

Replace with:

```js
  const removeShoppingItem = (id) => {
    setShopping(prev => prev.filter(item => item.id !== id));
  };

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

    const newItems = [...newTexts].map((key, i) => ({
      id: `${Date.now()}-${i}`,
      text: key,
      done: false
    }));

    setShopping(prev => [...prev, ...newItems]);
  };

  // Sticker actions
```

- [ ] **Step 2: Pass the function to `ShoppingList`**

Find:

```jsx
      <ShoppingList 
        shopping={shopping}
        addShoppingItem={addShoppingItem}
        updateShoppingItem={updateShoppingItem}
        removeShoppingItem={removeShoppingItem}
      />
```

Replace with:

```jsx
      <ShoppingList
        shopping={shopping}
        addShoppingItem={addShoppingItem}
        updateShoppingItem={updateShoppingItem}
        removeShoppingItem={removeShoppingItem}
        generateShoppingList={generateShoppingList}
      />
```

- [ ] **Step 3: Verify no console errors**

Reload `http://localhost:5173`. The app should render exactly as before (no visual change yet — `ShoppingList.jsx` doesn't use the new prop until Task 2). Confirm no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add generateShoppingList to collect dish ingredients into the shopping list"
```

---

### Task 2: Add the "generate" button to `ShoppingList.jsx`

**Files:**
- Modify: `C:\Códigos\Cardapio\src\components\ShoppingList.jsx`

**Interfaces:**
- Consumes: `generateShoppingList` prop (function, no arguments) from `App.jsx` (Task 1).
- Produces: nothing consumed by later tasks — this is the last code task.

- [ ] **Step 1: Accept the new prop**

Find:

```jsx
export default function ShoppingList({ shopping, addShoppingItem, updateShoppingItem, removeShoppingItem }) {
```

Replace with:

```jsx
export default function ShoppingList({ shopping, addShoppingItem, updateShoppingItem, removeShoppingItem, generateShoppingList }) {
```

- [ ] **Step 2: Add the button next to the existing "+"**

Find:

```jsx
        <h3 style={{ fontSize: '18px', margin: 0, flex: 1 }}>Lista de compras</h3>
        <button onClick={addShoppingItem} className="btn btn-icon btn-ghost" style={{ width: '28px', height: '28px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
```

Replace with:

```jsx
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
```

- [ ] **Step 3: Manual verification in the browser**

With the dev server running (`.claude/launch.json`, port 5173) at `http://localhost:5173`:

1. Open any day's "Café da manhã" (or any meal), add a dish, click it to open `DishModal`, add ingredients "Arroz", "Feijão", "Frango" via "+ Adicionar ingrediente", save.
2. In the "Lista de compras" card, click the new sparkle-icon button (left of the existing "+"). Confirm "arroz", "feijão", "frango" appear as new items (lowercase, per the spec's normalization).
3. Open a second dish, add ingredients "arroz" (already exists, different case) and "Tomate" (new), save. Click generate again. Confirm only "tomate" is added — "arroz" is not duplicated.
4. Check the checkbox on one shopping item to mark it done. Click generate again with no ingredient changes. Confirm that item stays checked (not reset, not duplicated).
5. Click the regular "+" button to add a manual item (e.g. "papel higiênico"), type it in. Click generate. Confirm the manual item is untouched.
6. Reload the page. Confirm all shopping items (manual + generated) persisted via localStorage.
7. Check the browser console for errors throughout — there should be none.

- [ ] **Step 4: Commit**

```bash
git add src/components/ShoppingList.jsx
git commit -m "feat: add button to generate shopping list from weekly dish ingredients"
```

---

## Self-Review Notes

- **Spec coverage:** whole-week scope via `weeklyData` traversal (Task 1, Step 1) ✅; merge-without-duplicating via `existingTexts`/`newTexts` sets (Task 1, Step 1) ✅; button in `ShoppingList.jsx` header next to existing "+" (Task 2, Step 2) ✅; safe handling of non-array `ingredients` (Task 1, Step 1, `Array.isArray` guard) ✅; manual verification covers all 6 scenarios from the spec (Task 2, Step 3) ✅; no changes to `DishModal.jsx`/`PratoRow.jsx`/`DayCard.jsx`/`WeeklyGrid.jsx`/`TodayView.jsx` (not touched by any task) ✅.
- **Placeholder scan:** no TBD/TODO; every step shows complete code.
- **Type consistency:** `generateShoppingList` is a zero-argument function in both its definition (`App.jsx`, Task 1) and its usage (`ShoppingList.jsx` `onClick={generateShoppingList}`, Task 2). Shopping item shape `{ id, text, done }` matches the existing shape used by `addShoppingItem`/`updateShoppingItem` elsewhere in `App.jsx`.
