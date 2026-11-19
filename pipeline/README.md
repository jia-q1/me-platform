# Data pipeline

Turns the project tracker workbooks (Excel) into one flat table the platform can use.

## Updating the data

1. Make a folder named with today's date in `data/raw/`, e.g. `data/raw/2026-12-15/`.
2. Save the latest tracker workbooks into it (one per project, see `config/projects.toml`).
3. In the terminal, run:
   ```
   npm run data
   ```
4. Open `data/out/report.md` and read it.
   - **Errors**: cells that couldn't be read. Fix them before using the data.
   - **Warnings**: figures that look wrong. Check them with the country office.
5. To check what was read, open `data/out/tidy.csv` in Excel. The `source` column gives
   the sheet and cell each figure came from.

The pipeline always reads the newest dated folder. Older folders are kept as history.
Everything in `data/` stays on your computer: git ignores it.

**First time on a new computer:** install Python 3.11 or newer, then run
`pip install -r pipeline/requirements.txt`.

## Fixing problems

Don't edit the Excel files to fix problems, because next month's version will have the same issues.
Change the settings instead:

| Problem in the report | Fix |
|---|---|
| A country spelled a new way ("row not recognised") | Add the spelling to `aliases` in `config/countries.toml` |
| "Expected the month … here" | Check `first_month` for that project in `config/projects.toml` |
| A file wasn't found | Check the `file` name pattern in `config/projects.toml` |
| A new project | Add a `[[project]]` block to `config/projects.toml` |
| "appears twice under the same indicator" (usually new additional funding, e.g. for Syria or PAPP-Gaza) | Add the label used in the tracker to `[additional_funding]` in `config/countries.toml` |

Wrong figures (a total that doesn't add up, results without a target) need fixing at the
source, by the country office.

## The tidy table

One row per figure.

| Column | Meaning |
|---|---|
| project, output_no, output | Which project and output |
| level | `project` = the project-wide indicator, `country` = a country office's own indicator |
| indicator_code, indicator | The project-wide indicator. A code ending in `*` was made up by the pipeline because the sheet has none |
| country, co_indicator_code, co_indicator | The country office and its own wording of the indicator (blank if it uses the project wording) |
| funding | Blank for the original funding. For additional funding reported on its own rows, its label (e.g. `Sudan (El Obeid)`). It is still counted under the country |
| breakdown | `total`, `female`, `male`, `youth`, or another label (a district, an infrastructure type) |
| measure | `baseline`, `target_direct`, `target_indirect`, `direct`, `indirect` |
| month | YEAR-MONTH for results, blank for baselines and targets |
| value / text_value | The number, or `yes`/`no` for Yes/No indicators |
| source | The sheet and cell in the Excel file |

Rules applied:
- Targets come from the **Master Results Tracker** sheet.
- **Monthly results come from the country rows only.** The pipeline does not use the
  sheet's own project-level result rows or its Total column, because some of their
  formulas point at the wrong cells. The platform adds up the country figures itself.
- Figures in months that haven't happened yet are ignored. The report lists them if they're not zero.
- A 0 in a past month means nothing was achieved that month. It is a real zero, not missing data.
- Additional funding (e.g. Sudan (El Obeid)) is reported under its country, with the
  label kept in the `funding` column.

## Files

- `run.py`: starts everything, writes the outputs
- `reader.py`: reads one tracker sheet
- `cleaning.py`: tidies text, numbers and country names
- `checks.py`: the sense checks behind the warnings
- `config/`: the settings above
