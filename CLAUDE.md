# CB M&E Platform: context for Claude

## What this is
A web platform for the **UNDP Crisis Bureau** to track results, resources and risk across its crisis portfolio, viewed **by project, by country and by funding source**, plus an Analytics area. It links results against global framework targets to budget and expenditure, and should eventually draft quarterly report content from validated data.

- **Users:** UNDP staff only. The site will need a login (see Hosting).
- **Data:** a pipeline will feed the app automatically. The real data isn't known in detail yet, so the plan is **front end first with sample data, then connect data as it comes in.** Expected sources: **Quantum** (UNDP ERP: budget/expenditure, project and output IDs), **country office (CO) results submissions**, and a **master Excel** (the Mural says progress charts pull from it).
- **Owner:** not a professional developer. Explain things plainly and say what to run.

## Design sources (read these before changing screens)
- `docs/design/mural-board.pdf`: the original wireframes, 13 frames
- `docs/mural-notes.md`: **every sticky note transcribed**, including the real KPI lists per output. The notes are small in the PDF; use this file.
- `docs/design/prototype.html`: a clickable HTML prototype built from the Mural, UNDP-branded, placeholder values. The current React app follows it, **but the prototype has known errors versus the Mural** (see below).

## Stack and commands
React 19 + TypeScript + Vite + React Router 7. No chart or map library yet: charts are plain SVG (`src/components/charts.tsx`), the map is a placeholder grid (`src/components/MapPanel.tsx`).

```
npm install      # once
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

## Architecture rules
- **All data goes through `src/data/api.ts`.** Pages never import `mock.ts` directly. Switching to real data = set `VITE_DATA_SOURCE=api` + `VITE_API_BASE_URL` (see `.env.example`) and implement the fetch paths in `api.ts`.
- **`src/data/types.ts` is the contract** between the UI and the pipeline. Missing values are `null` and render as "—".
- One file per screen in `src/pages/`. Routes are listed in `src/App.tsx` with the prototype's screen codes (LP, A, C1–C3, P1–P3, F1–F3).
- Shared UI is in `src/components/` (`ui.tsx`, `blocks.tsx`, `IndicatorCard.tsx`, `charts.tsx`, `MapPanel.tsx`, `ViewToggle.tsx`).
- Styling: one stylesheet, `src/styles/global.css`, UNDP Blue `#0468B1`, Lora for headings. Light theme only.
- List-page filters live in the URL query string.
- **Never commit real data or secrets.** `.gitignore` blocks `.env`, `/data/`, `*.xlsx`, `*.xls`, `*.csv`. The repo is private, but this still applies.

## Known gaps: agreed, not yet done
These come from the Mural notes and are clear-cut. Do them first if asked to "fix the Mural differences":
1. **Output numbering is wrong** (copied from the prototype). The correct numbering is: Output 1 = Community infrastructure, Output 2 = Local economies and livelihoods, Output 3 = Local capacities for early recovery.
2. **KPIs in `mock.ts` are invented.** Replace them with the real lists in `docs/mural-notes.md`.
3. **Direct / indirect beneficiaries.** Many KPIs are split this way, and `Indicator` in `types.ts` doesn't support it yet.
4. **Demographics:** currently only **female, male and youth** are measured. The app also shows displaced and disability (inherited from the prototype). Reduce it, or show those two as "not collected".
5. The **"Type of infrastructure"** tab only makes sense for Output 1. It currently shows on every output.

## Open decisions: ask the owner, don't decide alone
- **Project page:** the Mural note prefers a world map of participating countries over the "results against target by quarter" chart. Currently the chart is on the project page and the map sits behind the List/Map toggle on `/projects`.
- **What the Mural toggle means.** It's implemented as List/Map. This is a guess.
- **Clicking a location:** the Mural says it should *expand* the output section on the same page and show KPIs, **images** and progress. Currently it navigates to a separate page and there are no images.
- **RAPIDA and Impact Dashboard cards:** the Mural puts them at the bottom of the country and donor pages. Currently they're only on `/analytics`.
- **Funding coverage gap view**: suggested on the Mural, not built.
- **"Humanitarian"** appears as a project on the Mural donor frame but isn't in the data.
- **Donor attribution rule:** pro rata to funding share, or earmarked outputs only. Shown as "to be agreed".
- Two Mural notes are cut off in the PDF and unreadable (listed in `docs/mural-notes.md`).

## Other to-dos
Real map (Leaflet/MapLibre + Impact Dashboard / Earth Engine layer, keeping `MapPanel`'s props); the Period selector doesn't filter data yet; "Generate report draft" buttons are stubs; RAPIDA/Impact Dashboard URLs; risk registry; trends and gaps.

## Hosting (not urgent)
Code lives in this private GitHub repo for now. When the site needs sharing: the easiest option is **Cloudflare Pages + Cloudflare Access** (email one-time code limited to `@undp.org`, free up to 50 users). The more official option is **Azure Static Web Apps + UNDP Microsoft (Entra ID) sign-in**, which needs the Standard plan and UNDP IT to register the app. Before putting real Quantum figures on a host outside UNDP, check with UNDP IT. Nothing in the code depends on this choice.

## History
- The first commit was written in a session without package installs, so `npm run build` had not been run against the real packages yet. If you see type errors, fix them; they're likely small.
