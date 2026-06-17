# Playbook: building a nutrition calculator

This is **one** Vite + React SPA. A landing page lives at `/`, and each fast-food
chain is a page at `/<slug>` (e.g. `/dominos`, `/tims`). All chains share
`@nutrition/core`. This file is the guide for adding a new chain (Subway, Quesada, …).
Read it fully, then follow the **Checklist**.

## Architecture

- **Single app, client-side routing.** `src/main.tsx` renders `<BrowserRouter>` with
  `"/"` → `Landing` and one `/<slug>` route per chain. Routes are generated from
  `src/chains/registry.ts`. A `vercel.json` rewrite (`/(.*)` → `/index.html`) makes
  deep links like `/tims` work on refresh.
- **`@nutrition/core`** = `src/core`, aliased in `vite.config.ts` and `tsconfig.json`
  so imports read `from '@nutrition/core'`. Exports:
  - `Nutrition` (10 macro fields + optional `weight`), `MenuItem`, `MenuCategory`,
    `MenuSubcategory`, `OrderEntry`.
  - math: `EMPTY`, `add`, `sum`, `scale`, `DV`, `calculateDV`, `wholeInfo`.
  - components: `NutritionLabel`, `MenuSearch`, `OrderPanel`; hook `useHorizontalWheel`.
- **Core gives you for free:** the enlarged bilingual Nutrition Facts label, the
  searchable menu (category + optional subcategory chips + search), and the order panel
  (per-line **quantity steppers**, remove/clear, macro strip). Don't reimplement these.
- **A chain page** (`src/chains/<slug>/<Chain>Calculator.tsx`) is a normal component
  that composes those. It owns its data adapter, icon maps, brand colors, and any
  chain-specific *builder* / customization modal.
- **Tailwind v4** auto-scans `src`, so no `@source` is needed; class names from core
  and every chain are picked up automatically.

## Data model conventions

- Values are **per serving** exactly as the chain's guide prints them.
- `Nutrition` keys: `calories, fat, saturatedFat, transFat, cholesterol, sodium,
  carbohydrates, fibre, sugars, protein` (+ optional `weight`). Missing → 0.
- `MenuItem` carries nutrition flat on the object plus `id, name, category,
  subcategory, serving?, size?, baseName?, customizable?`.
- **Serving vs whole:** `wholeInfo(serving)` turns `"1/8 of pizza"` / `"1/4 order"`
  into `{ multiplier, noun }`; `scale(nutrition, multiplier)` gives the whole-item
  totals. `src/chains/dominos/components/AddChoiceModal.tsx` is the reference for the
  "add a serving vs the whole thing" prompt.

## Data extraction (PDF → JSON)

Guides are PDFs with column-aligned tables. **Don't** trust `pdftotext` for the
numbers — narrow columns merge digits (`"00"`, `"10"`). Use `pdftotext -layout` only to
eyeball structure.

**Use `pdfplumber` and bucket numbers by x-coordinate** (each column has a stable x).
Worked references: `src/chains/dominos/extract_pizza.py` (per size/crust component
tables) and `extract_items.py` (standalone items; multi-line names resolved by
nearest-row assignment).

Recipe:
1. Print `page.extract_words()` with `x0/x1/top` to find each numeric column's x.
2. Group words into rows by rounded `top`; map the numeric tokens (x ≥ first value
   column) in order to the columns.
3. Emit JSON shaped like `src/chains/_template/src/data/menu.json` (`{ items: [{ id,
   name, category, subcategory, serving, nutrition: { calories_kcal, … } }] }`).
4. Spot-check totals against the printed guide.

Keep `extract_*.py` + generated JSON in the chain folder. Don't commit the PDF (git-ignored).

## Two UI archetypes

1. **Searchable menu (every chain).** Build `MenuItem[]` + `MenuCategory[]` in a data
   module, pass to `<MenuSearch>`, render `<OrderPanel>` + `<NutritionLabel>`.
   `src/chains/_template` and `src/chains/tims` are the references. One-level chains
   pass categories with `items`; two-level chains pass `subcategories`.
2. **Builder (customizable chains).** For "pick your X" chains — Domino's pizza,
   **Subway** subs (bread → protein → cheese → veggies → sauces), **Quesada**
   burritos/bowls — add a chain-specific builder beside the menu, modeled on
   `src/chains/dominos/components/PizzaBuilder.tsx`: hold a `Selection`, compute live
   nutrition by `add()`-ing chosen components, push an `OrderEntry` on add.

## Theming

Each chain page sets `--brand*` on its root wrapper (NOT global CSS), so themes are
scoped per route:
```tsx
const BRAND = { '--brand': '#006491', '--brand-accent': '#e31837', '--brand-soft': '#e0f0f7' } as React.CSSProperties;
return <div style={BRAND} className="min-h-screen …">…</div>;
```
`--brand` = primary (chips, buttons, qty +), `--brand-accent` = remove/danger,
`--brand-soft` = light tint. App chrome (header) can use hard-coded brand classes.

## Checklist for a new chain

1. `cp -r src/chains/_template src/chains/<slug>`.
2. Rename `TemplateCalculator.tsx` → `<Chain>Calculator.tsx`; rename the exported
   function; set `CHAIN`, the `BRAND` vars, and `iconForItem`/`categoryIcon`
   (Iconify names — see `src/chains/dominos/lib/icons.ts` /
   `src/chains/tims/lib/emoji.ts`).
3. Drop the chain's nutrition PDF in the folder; write/adapt `extract_*.py`
   (pdfplumber) → generate `src/data/menu.json` (+ component JSON if it has a builder);
   adjust `src/data/menu.ts` (raw→`Nutrition` map + `CATEGORY_ORDER`).
4. Customizable chain? Add a builder component (copy PizzaBuilder's shape) and an
   `AddChoiceModal` if servings are fractions of a whole.
5. **Register it** in `src/chains/registry.ts`: add `{ slug, name, tagline, brand,
   icon, status: 'live', Component: <Chain>Calculator }`. This wires both the route and
   the landing card. (Use `status: 'soon'` with no `Component` for a teaser card.)
6. `npm run lint && npm run build`, then verify (below).

## Verification

- `npm run lint` → tsc clean. `npm run build` → Vite build OK (if brand colors look
  unstyled, a `var(--brand)` wrapper is missing).
- `npm run dev`, then headless-screenshot `/`, `/<slug>`:
  `chrome --headless=new --screenshot=out.png --window-size=1280,1024 http://localhost:5180/<slug>`
  Confirm: landing card present + linking, route renders with correct brand, search +
  chips, quantity steppers, the large label, and the back-to-home chevron.
- Spot-check totals against the printed guide (e.g. `cal × qty`).
