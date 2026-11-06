# Mural board: frames and sticky notes

Transcribed from `docs/design/mural-board.pdf` (13 frames). The PDF is the source of truth; this file exists because the notes are small and easy to miss.

## Frames on the board

| Frame | What it shows |
| --- | --- |
| Landing page | Hero "CB M&E platform", "Responsible" (person + avatar), "Hyperlink to map" button, 4 tiles: M&E per projects, M&E per country, M&E per donor, Analytics ID |
| M&E by project (list) | Dropdown, search, toggle; cards: REVIVE I, REVIVE II, Global JSB 2025-2026, Funding Windows, Stabilization, + 2 blank; large chart/map area below |
| M&E by country (list) | Dropdown, search, toggle; cards Country 1, Country 2I, Country 3, 7, 8; large map area below |
| M&E by funding source (list) | Dropdown, search, toggle; cards RoK, Country 2I, Country 3, 7, 8; large area below |
| Funding source (tabs 1–3) | Cards: ROK, Japan, FW, + blanks |
| M&E by project (dashboard) | Map, Overview, Demographics, output 1/2/3 rows |
| M&E by country (dashboard) | Country map with project locations, Overview, Demographics, output 1/2/3 rows, RAPIDA + Impact Dashboard cards at the bottom |
| M&E by Country Output 1 | Map of where outputs happen, Overview, Demographics, output 1/2/3 rows, RAPIDA + Impact Dashboard cards |
| M&E by Donor | Map ("Countries"), "ROK Overview", "Total contribution", rows REVIVE 1 (contributions), REVIVE 2, Humanitarian; RAPIDA + Impact Dashboard cards |
| Output #1, #2, #3 | Tabs 1–3; cards KPIs, Type of infrastructure, KPI, Card titles |
| Analysis | Tabs 1–3; cards Rapida, Impact Dashboard, KPI, Card titles |

Every "M&E by …" frame has a **dropdown, a search box and an on/off toggle** in the top bar.

## Sticky notes, verbatim

### Output definitions (green notes on M&E by project / by country)
- **Output 1 → Community Infrastructure**
- **Output 2 → Local economies and Livelihood**
- **Output 3 → Local capacities for early recovery**

> Note: the HTML prototype numbers these differently (it calls Output 1 "livelihoods restored"). The Mural is correct.

### KPIs per output (green notes at the top of each Output frame)

**Output #1: Community infrastructure**
- Number of community infrastructure
- Number of people benefitting from improved community infrastructure (direct; indirect)
- Number of people access clean and renewable energy (direct; indirect)
- Number of grids or networks rehabilitated
- Volume of debris and solid waste cleared
- Volume of debris recycled
- Number of people benefitting from areas cleared (direct only)
- Number of people benefitting from EORE (direct; indirect)
- Areas of UXO hazards areas cleared

**Output #2: Local economies and livelihoods**
- Number of people benefitting from emergency employment and/or cash-based assistance (direct; indirect)
- Number of productive assets and markets restored to operation
- Number of people benefitting from productive units (direct; indirect)
- Number of households and micro- and small businesses supported to restore livelihoods
- Number of people trained in essential economic skills (direct; indirect)

**Output #3: Local capacities for early recovery**
- Number of people participating in community engagement processes for early recovery planning and implementation (direct; indirect)
- Number of local officials and community leaders with strengthened capacities to support humanitarian response and recovery efforts (direct; indirect)
- Number of people benefitting from civic and administrative services that facilitate crisis response and recovery (direct; indirect)

### Other notes
- **Output frames, KPI card:** "Progress chart pull data from master excel" (on Output #1, #2, #3 and Analysis)
- **M&E by project, map area:** "Rather than results against target, by quarter, it would be useful to have the world map indicating participating countries"
- **M&E by project, Demographics:** "Currently with demographics, we are measuring female, male and youth"
- **M&E by country, map:** "Country map with project locations"
- **M&E by Country Output 1, map:** "Country map where outputs are happening"
- **M&E by Country Output 1, map and output 1 row:** "Clicking on locations will expand the output section and will show kpis, images and progress"
- **M&E by Donor, map:** "Countries"
- **M&E by Donor, REVIVE 1 row:** "Clicking here will take you to M&E per project"
- **Analysis, Impact Dashboard area:** "We could also add a funding coverage gap"
- Orange notes on output 2/3 and REVIVE 2/Humanitarian rows are blank (same action as the labelled one).

### Notes on the HTML prototype screens (from owner screenshots, not in the PDF)
- **Landing page, on the Analytics tile:** "Suggest to make Analytics a layer not a fourth view in the landing page."
- **Funding sources list, by the "Report due" filter:** "Rather than report due, it could be report availability by year"
- **Funding source page (Republic of Korea), top of page:** "It would be good to list the projects that donor supports that would take us to the project"
- **Project page, on the quarterly chart:** same world map note as above
- **Country page, on Demographics:** same female, male and youth note as above
- **Analytics page, top of page:** same funding coverage gap note as above
- **Output page:** the same three KPI lists as above. The sticky spells the last Output 1 KPI "Areas of UXO harzaros areas cleared", probably meaning "hazardous"; this file and the app say "hazards". Wording to be confirmed.

### More notes from owner screenshots of the Mural board
- **M&E by project, beside output 1:** "We do not have output level targets" (this is the note that was cut off in the PDF, which showed only "We have… level…")
- **M&E by project, orange note with an arrow to the main map area:** "World map indicating participating project countries"

### Planning board (not in the PDF)
The owner describes these notes as thinking from the planning stage: useful background, not fixed requirements.

- **Users:** Senior management CB/CO; C3RT; CO staff linked to projects
- **Purpose:**
  - "Track results against global framework targets by country, output and activity, with consistent disaggregation."
  - "Reduce reporting burden by generating quarterly and final report content directly from validated data."
  - "Link results to resources by tracking budget and expenditure by country, output and pillar, including the USD 10 million set-aside."
  - SM to consult country status
  - Analytics and linkage with ID
- **Constraints:** sharepoint; Lack of data input from CO; Use info from Quantum
- **Licenses and software:** Power BI; HTML on sharepoint
- **Content:** Results tracker per indicator; Monitoring progress; Trends and gap; Geospatial view; Risk registry; Map with countries; Link to ID for analysis; "Financal?" (with a question mark on the board)

"ID" probably means Impact Dashboard. To be confirmed.
