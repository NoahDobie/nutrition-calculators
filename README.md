# Nutrition Calculators

One site, many chains. A landing page plus a per-chain nutrition calculator at each
route, all in a single Vite + React + React Router app on one domain
(`nutrition.noahdobie.com`, `…/dominos`, `…/tims`, …). By Noah Dobie.

```
src/
  main.tsx            router: "/" → Landing, "/<slug>" → chain calculator
  index.css           Tailwind v4 entry + base styles
  pages/Landing.tsx   landing page (cards generated from the chain registry)
  chains/
    registry.ts       single source of truth: slug, name, brand, icon, status, Component
    dominos/          Domino's page (pizza builder + menu) + data + extract scripts
    tims/             Tim Hortons page (menu + drink customizer) + data
    _template/        copy this to start a new chain
  core/               shared UI + logic (imported as "@nutrition/core")
```

`@nutrition/core` (in `src/core`, aliased in `vite.config.ts` + `tsconfig.json`)
provides the `Nutrition` model + math (`add/sum/scale/wholeInfo/DV`), the enlarged
`NutritionLabel`, the searchable `MenuSearch`, and `OrderPanel` (quantity steppers +
macro strip). Each chain page scopes its **brand colors** via `--brand*` CSS variables
on its root wrapper, so one app supports many themes.

## Develop

```bash
npm install
npm run dev        # http://localhost:5180  ( /, /dominos, /tims )
npm run build      # static SPA → dist/
npm run lint       # tsc --noEmit
```

## Deploy (Vercel)

Single project, framework **Vite**, root = repo root. `vercel.json` rewrites every
path to `/index.html` so client routes like `/tims` resolve. Point the domain
`nutrition.noahdobie.com` at the project.

## Add a chain

See **[CLAUDE.md](./CLAUDE.md)**. Short version: `cp -r src/chains/_template
src/chains/<slug>`, drop the chain's nutrition PDF + an `extract_*.py`, generate the
data JSON, set brand colors + icons, then register it in `src/chains/registry.ts`.
