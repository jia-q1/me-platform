# CB M&E Platform: context for Claude

## What this is
A web platform for the **UNDP Crisis Bureau** to track results, resources and risk across its crisis portfolio, viewed **by project, by country and by funding source**, plus an Analytics area. It links results against global framework targets to budget and expenditure, and should eventually draft quarterly report content from validated data.

- **Users:** UNDP staff only: senior management (CB/CO), C3RT, and CO staff linked to projects. The site will need a login (see Hosting).
- **Data:** a pipeline will feed the app automatically. The real data isn't known in detail yet, so the plan is **front end first with sample data, then connect data as it comes in.** Expected sources: **Quantum** (UNDP ERP: budget/expenditure, project and output IDs), **country office (CO) results submissions**, and a **master Excel** (the Mural says progress charts pull from it).
- **Owner:** not a professional developer. Explain things plainly and say what to run.

## Design sources (read these before changing screens)
- `docs/design/mural-board.pdf`: the original wireframes, 13 frames
- `docs/mural-notes.md`: **every sticky note transcribed**, including the real KPI lists per output. The notes are small in the PDF; use this file. The owner says many notes were thinking from the planning stage: keep them in mind, but they aren't strict requirements.
- `docs/design/prototype.html`: a clickable HTML prototype built from the Mural, UNDP-branded, placeholder values. The current React app follows it, **but the prototype has known errors versus the Mural** (see below).

## Stack and commands
React 19 + TypeScript + Vite + React Router 7. Charts are plain SVG (`src/components/charts.tsx`). The map uses Leaflet with an OpenStreetMap basemap (`src/components/MapPanel.tsx`). Pages only pass points to `MapPanel`, so the basemap or library can change in that one file. OpenStreetMap borders are not the UN's official ones: agree the basemap with UNDP before launch.

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

## Outputs and KPIs (from the Mural)
- Output 1 = Community infrastructure, Output 2 = Local economies and livelihoods, Output 3 = Local capacities for early recovery. The prototype numbers these differently; the Mural is correct.
- The real KPI lists are in `FRAMEWORK` at the top of `mock.ts`, worded as in `docs/mural-notes.md`. Their target and achieved figures are still made up.
- KPIs that count people have `beneficiarySplit`, `direct` and `indirect`. `achieved` is treated as direct + indirect.
- Demographics are female, male and youth only.
- The "Type of infrastructure" tab shows on Output 1 only.

## Open decisions: ask the owner, don't decide alone
- **Project page:** two Mural notes ask for a world map of participating countries instead of the "results against target by quarter" chart. Currently the chart is on the project page and the map sits behind the List/Map toggle on `/projects`.
- **What the Mural toggle means.** It's implemented as List/Map. This is a guess.
- **Clicking a location:** the Mural says it should *expand* the output section on the same page and show KPIs, **images** and progress. Currently it navigates to a separate page and there are no images.
- **RAPIDA and Impact Dashboard cards:** the Mural puts them at the bottom of the country and donor pages. Currently they're only on `/analytics`.
- **Funding coverage gap view**: suggested on the Mural, not built.
- **"Humanitarian"** appears as a project on the Mural donor frame but isn't in the data.
- **Donor attribution rule:** pro rata to funding share, or earmarked outputs only. Shown as "to be agreed".
- **Analytics as a layer:** a note suggests making Analytics "a layer not a fourth view" on the landing page. Currently it's a fourth tile, a nav item and its own page. What "layer" means in practice isn't agreed.
- **Report availability by year:** a note suggests this instead of "Report due" on `/funding-sources`. Currently that page has a Report due filter and shows the next report date on each card.
- **UXO KPI wording:** the sticky says "harzaros" (probably "hazardous"); the app says "Areas of UXO hazards areas cleared".
- **No output-level targets:** a Mural note says "We do not have output level targets", so targets may exist at KPI level only. The app still shows output-level "Achieved vs target" (`Output.achievedPct`, `OutputCountryResult.target` and `achieved`) and a project chart that adds results together (`endOfProjectTarget`, `quarterly`). All of these are sample figures with no known real source.
- **Activity level:** the purpose note says results are tracked by country, output *and activity*. The data model stops at output and KPI.
- **What "ID" means:** probably Impact Dashboard ("Analytics and linkage with ID").
- **Who sees what:** the planning board says CO staff are "linked to projects". This may mean access limited by project.
- **Direct / indirect targets:** one target per KPI, with achieved = direct + indirect, is an assumption. Confirm whether targets are set separately and whether the two can be added without double counting.
- **KPI units:** the Mural gives none for "Volume of debris…" and "Areas of UXO…", so these show as plain numbers.
- **KPI codes and framework refs:** codes like 1.1 are just list positions, and global framework refs are blank because the Mural doesn't give them.
- **Pillar vs output:** the purpose note tracks spending "by country, output and pillar", so pillars are probably a separate thing from outputs. The real pillars aren't known. The sample data reuses the output names as pillars, which is why "Expenditure by pillar" and "Expenditure by output" on the donor page show the same figures. Keep both charts until this is answered.

## Other to-dos
Impact Dashboard / Earth Engine layer on the map; approved basemap (UN boundaries); the Period selector doesn't filter data yet; "Generate report draft" buttons are stubs; RAPIDA/Impact Dashboard URLs; risk registry; trends and gaps.

## Hosting (not urgent)
Code lives in this private GitHub repo for now. When the site needs sharing: the easiest option is **Cloudflare Pages + Cloudflare Access** (email one-time code limited to `@undp.org`, free up to 50 users). The more official option is **Azure Static Web Apps + UNDP Microsoft (Entra ID) sign-in**, which needs the Standard plan and UNDP IT to register the app. Before putting real Quantum figures on a host outside UNDP, check with UNDP IT. Nothing in the code depends on this choice.

The planning board also lists **SharePoint** as a constraint, and **Power BI** and **"HTML on sharepoint"** under licences and software. Find out whether these are requirements before choosing a host. SharePoint Online often won't run an uploaded web app like this one, so check with UNDP IT early.
