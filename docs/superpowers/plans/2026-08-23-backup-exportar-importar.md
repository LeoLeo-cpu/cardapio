# Backup: Exportar/Importar Dados Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user export their entire app state (weekly menu, shopping list, stickers, week title, goals) to a downloadable JSON file, and later restore it by importing that file back in.

**Architecture:** Two new functions in `App.jsx` — `exportBackup` (builds a JSON blob from current state, triggers a browser download) and a file-input change handler that reads, validates, confirms, and applies an imported backup — plus two new icon buttons in the header, next to the existing "Substituições" button, and a hidden `<input type="file">` wired via `useRef` for the import flow.

**Tech Stack:** React 19 (function components, hooks), browser `Blob`/`URL.createObjectURL`/`FileReader` APIs — no new dependencies.

## Global Constraints

- Import fully replaces state (no merging) and requires a `window.confirm` before applying, since it's destructive.
- Invalid JSON on import shows an `alert` and leaves current state untouched.
- Missing fields in an imported backup fall back to the app's existing defaults (empty object/array, or the current default goals).
- The updated state after import is persisted to `localStorage` automatically by the existing save `useEffect` in `App.jsx` — no new persistence code needed.
- No changes to any file other than `App.jsx`.
- Spec: `docs/superpowers/specs/2026-08-23-backup-exportar-importar-design.md`

---

### Task 1: Export backup

**Files:**
- Modify: `C:\Códigos\Cardapio\src\App.jsx`

**Interfaces:**
- Consumes: existing `weeklyData`, `shopping`, `stickers`, `weekLabel`, `goals` state.
- Produces: `exportBackup()` function wired to a new header button. Nothing consumed by Task 2.

- [ ] **Step 1: Add the `exportBackup` function**

Find, in `C:\Códigos\Cardapio\src\App.jsx`:

```js
  const calculateWeeklyCalories = () => {
```

Add immediately before it:

```js
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
```

- [ ] **Step 2: Add the export button in the header**

Find:

```jsx
            Substituições
          </button>
          {weeklyCalories > 0 && (
```

Replace with:

```jsx
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
          {weeklyCalories > 0 && (
```

- [ ] **Step 3: Manual verification in the browser**

With the dev server running at `http://localhost:5173` and some data already present (at least one dish or shopping item):

1. Click the new download-icon button in the header.
2. Confirm the browser downloads a file named `cardapio-backup-<today's date>.json`.
3. Open the downloaded file (e.g. in a text editor) — confirm it contains `exportedAt`, `weeklyData`, `shopping`, `stickers`, `weekLabel`, `goals`, matching the app's current state.
4. Check the browser console for errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add export backup button (downloads app state as JSON)"
```

---

### Task 2: Import backup

**Files:**
- Modify: `C:\Códigos\Cardapio\src\App.jsx`

**Interfaces:**
- Consumes: nothing from Task 1 beyond the shared file (no functional dependency — could be implemented independently, but follows Task 1 for a natural export-then-import verification flow).
- Produces: nothing consumed elsewhere — last task.

- [ ] **Step 1: Import `useRef`**

Find:

```js
import React, { useState, useEffect } from 'react';
```

Replace with:

```js
import React, { useState, useEffect, useRef } from 'react';
```

- [ ] **Step 2: Add the file input ref and the import handler**

Find:

```js
function App() {
  const [weeklyData, setWeeklyData] = useState({});
```

Replace with:

```js
function App() {
  const fileInputRef = useRef(null);
  const [weeklyData, setWeeklyData] = useState({});
```

Find:

```js
  const exportBackup = () => {
```

Add immediately before it:

```js
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
```

- [ ] **Step 3: Add the import button and hidden file input in the header**

Find:

```jsx
              <path d="M5 21h14"></path>
            </svg>
          </button>
          {weeklyCalories > 0 && (
```

Replace with:

```jsx
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
```

- [ ] **Step 4: Manual verification in the browser**

Using the backup file downloaded in Task 1's verification:

1. Add a new dish somewhere (change the current state away from what's in the backup file).
2. Click the new upload-icon button — confirm the system file picker opens.
3. Select the backup `.json` file — confirm a confirmation dialog appears ("Isso vai substituir todos os dados atuais. Continuar?").
4. Confirm it — the app should revert to exactly the state captured in the backup (the dish added in step 1 should be gone; everything from the backup should be back).
5. Reload the page — confirm the imported state persisted (via the existing `localStorage` save effect).
6. Click import again, this time pick a `.json` file with unrelated content (e.g. create a scratch file containing `{"foo":"bar"}`) — confirm it applies without crashing (empty/default state for every field, since none of the expected keys are present), and the browser console shows no errors.
7. Click import again, pick a non-JSON file (e.g. a `.txt` file with random text) — confirm an `alert` appears saying the file is invalid, and the app's state is unchanged after dismissing it.
8. Click import, then cancel the file picker without selecting anything — confirm nothing changes.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add import backup button (restores app state from JSON file)"
```

---

## Self-Review Notes

- **Spec coverage:** export button next to "Substituições" (Task 1, Step 2) ✅; full-state JSON with `exportedAt` (Task 1, Step 1) ✅; import replaces all state with confirmation (Task 2, Step 2) ✅; invalid JSON shows alert, no state change (Task 2, Step 2, catch block) ✅; missing fields fall back to defaults (Task 2, Step 2, `||` fallbacks matching each field's actual default type/value used elsewhere in `App.jsx`) ✅; persistence handled by existing save effect, no new code (not touched by either task) ✅; manual verification covers all 8 spec scenarios, split across Task 1 Step 3 (export) and Task 2 Step 4 (import + edge cases) ✅.
- **Placeholder scan:** no TBD/TODO; every step shows complete code.
- **Type consistency:** `goals` fallback `{ cals: 2000, p: 150, c: 200, f: 65 }` in Task 2 Step 2 matches the app's actual default goals state (`App.jsx` line 22, unchanged by this plan). `weekLabel` fallback `'Minha semana'` matches its existing default. `handleImportFile` and `exportBackup` are both defined before their first JSX usage (Task 2 Step 2 inserts `handleImportFile` right before `exportBackup`, both above the `return` statement).
