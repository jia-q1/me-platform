# CB M&E Platform

A web platform for the UNDP Crisis Bureau to track **results, resources and risk** across the crisis portfolio. You can view it by **project**, by **country** and by **funding source**. It links results against global framework targets to budget and expenditure, and will draw quarterly report content from validated data.

> **Status: front end only, with sample data.** Every name and number on screen is a placeholder. The data pipeline (Quantum, CO results submissions, the master Excel) gets connected later. See [Connecting real data](#connecting-real-data).

---

## Running it on your computer

You need **Node.js 20.19 or newer** ([download](https://nodejs.org/)). To check your version, run `node -v`.

```bash
git clone https://github.com/jia-q1/me-platform.git
cd me-platform
npm install        # first time only: downloads the libraries
npm run dev        # starts the app
```

Then open the address it prints, usually **http://localhost:5173**. The page reloads by itself whenever you save a file.

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the app locally while developing |
| `npm run build` | Type-check and produce the production files in `dist/` |
| `npm run preview` | Serve the production build locally, to check it before deploying |
| `npm run typecheck` | Check for type errors only |

---

## Screens

The screens follow the Mural board and the HTML prototype. The codes match the prototype's screen list.

| Code | Screen | URL |
| --- | --- | --- |
| LP | Landing page | `/` |
| A | Analytics (RAPIDA, Impact Dashboard, risk registry, trends and gaps) | `/analytics` |
| C1 | M&E by country (list or map) | `/countries` |
| C2 | Country dashboard | `/countries/:countryId` |
| C3 | Output in a country | `/countries/:countryId/outputs/:outputId` |
| P1 | M&E by project (list or map) | `/projects` |
| P2 | Project dashboard | `/projects/:projectId` |
| P3 | Output: KPIs / Type of infrastructure / By country | `/projects/:projectId/outputs/:outputId` (+ `/infrastructure`, `/countries`) |
| F1 | M&E by funding source | `/funding-sources` |
| F2 | Funding source dashboard | `/funding-sources/:sourceId` |
| F3 | Where the funds go | `/funding-sources/:sourceId/where-funds-go` |

Filters on the list pages are saved in the URL (for example `/countries?status=late`), so a filtered view can be bookmarked or shared.

---

## How the code is organised

```
src/
├── data/
│   ├── types.ts      ← the data model: what every screen expects
│   ├── mock.ts       ← sample data (placeholders)
│   ├── api.ts        ← THE data layer: every screen gets data only from here
│   └── useData.ts    ← React hook that handles loading / error / ready
├── components/
│   ├── Layout.tsx    ← header, navigation, footer, "sample data" banner
│   ├── ui.tsx        ← badges, stat tiles, panels, filters, tabs, toasts…
│   ├── blocks.tsx    ← overview, demographics, risks, output rows
│   ├── IndicatorCard.tsx
│   ├── charts.tsx    ← quarterly chart, budget bars, sparklines (plain SVG)
│   ├── MapPanel.tsx  ← placeholder map (see "Still to do")
│   └── ViewToggle.tsx
├── pages/            ← one file per screen
├── lib/format.ts     ← number, money, date and status formatting
├── styles/global.css ← UNDP brand styles
├── App.tsx           ← every screen and its URL
└── main.tsx
```

**Tech:** React 19, TypeScript, Vite, React Router. No chart or map library yet: the charts are hand-drawn SVG to keep things light. They can be swapped for a library later without changing the pages.

---

## Connecting real data

The app is built so that connecting the pipeline means **changing one file, not the screens**.

1. **Compare the real data with `src/data/types.ts`.** That file lists every field the screens use (budget, expenditure, indicators, disaggregation, sites, risks…). Note what the real sources have, what they call it, and what is missing. A missing field can be `null`. The screen then shows "—" instead of breaking.
2. **Decide how the data reaches the app.** Two common options:
   - **Scheduled export (simplest):** a script runs on a schedule (e.g. nightly), reads Quantum exports, CO submissions and the master Excel, and writes JSON files shaped like `types.ts`. The app reads those files.
   - **Small API:** a backend serves the same JSON from a database, at the paths already written in `api.ts` (`/projects`, `/countries/:id`, `/funding-sources`, …).
3. **Switch the source.** Copy `.env.example` to `.env` and set:
   ```
   VITE_DATA_SOURCE=api
   VITE_API_BASE_URL=https://your-api-or-data-folder
   ```
   Every function in `src/data/api.ts` then fetches from there instead of using the sample data.

### Keep real data out of this repo

`.gitignore` already blocks `.env` files, a top-level `data/` folder, and `.xlsx` / `.xls` / `.csv` files. Real figures, exports and passwords should never be committed, even though the repo is private. Only code and the sample data in `src/data/mock.ts` belong here.

---

## Decisions still open

These came up when comparing the Mural with the prototype:

- **Project page: chart or map?** A Mural note suggests a world map of participating countries instead of results by quarter. The project page currently has the quarterly chart. The **Map** toggle on `/projects` shows participating countries.
- **What the toggle is for.** Every "M&E by…" screen in the Mural has an on/off toggle. Here it's implemented as a **List / Map** switch. Easy to change if it meant something else.
- **Funding coverage gap.** A Mural note suggests this view. Not built yet.
- **Attribution rule.** How results are credited to a donor: pro rata to funding share, or earmarked outputs only. Shown as "to be agreed" on funding-source pages.
- **Hosting and login.** For UNDP staff only. Options under consideration: Cloudflare Pages + Cloudflare Access (email one-time code limited to `@undp.org`), or Azure Static Web Apps with UNDP Microsoft sign-in. Nothing in the code depends on this choice.

## Still to do

- [ ] Real map: replace `MapPanel`'s placeholder grid with Leaflet or MapLibre and the Impact Dashboard / Earth Engine layer (same props, so pages don't change)
- [ ] Connect the data pipeline (see above)
- [ ] Period selector (current quarter / year to date / since start): it's on the screens, but doesn't filter the data yet
- [ ] "Generate report draft" buttons: currently say "not connected yet"
- [ ] Links to RAPIDA and the Impact Dashboard
- [ ] Risk registry and trends-and-gaps tools
- [ ] Funding coverage gap view
- [ ] Login / hosting
