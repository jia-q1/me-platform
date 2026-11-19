"""Reads one project's Master Results Tracker sheet into flat rows (the "tidy table").

How the sheet is laid out (all three projects use the same template):

  Row 2      month names over pairs of columns ("April" over Direct | Indirect), then "Total"
  Row 3      column headers: Expected Results | Indicator | Baseline | Target (Direct...) | ...
  Row 4+     column A: the output, written once at the top of its block
             column B: one of
               - a project-level indicator            "1.1.3 Number of people benefitting..."
               - a country indicator under it         "Afghanistan (1.1.2.2 - Number of ...)"
                                                      or just "Afghanistan"
               - a sex/age breakdown of the row above "Female", "Male", "Youth", "Total"
               - another breakdown of the country row "Water infrastructure", "Kunar"
               - "Others": country indicators that don't roll up to a project indicator

Each figure in the sheet becomes one row of the tidy table, with the cell it came from.

Monthly results are taken from country rows only. The project-level rows are formulas
adding up the countries, and some of those formulas point at the wrong rows (JSB rows
5-7 add up each country's Male row into "Female", and so on), so the app adds up the
country figures itself. Project-level baselines and targets are kept.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date

import openpyxl
from openpyxl.utils import get_column_letter

from cleaning import (
    DEMOGRAPHIC,
    MONTHS,
    Countries,
    first_line,
    fmt,
    parse_value,
    split_code,
    starts_with_code,
    tidy_text,
)

COLUMNS = [
    "project", "output_no", "output", "level", "indicator_code", "indicator",
    "country", "funding", "co_indicator_code", "co_indicator", "breakdown",
    "measure", "month", "value", "text_value", "source",
]


@dataclass
class Issue:
    level: str  # "error" or "warning"
    project: str
    where: str
    message: str


@dataclass
class Indicator:
    """The indicator a run of rows belongs to."""
    level: str  # "project" or "country"
    code: str | None
    title: str | None
    country: str | None = None
    co_code: str | None = None
    co_title: str | None = None
    funding: str | None = None  # additional-funding label, e.g. "Sudan (El Obeid)"


def month_label(first_month: str, offset: int) -> str:
    y, m = (int(x) for x in first_month.split("-"))
    m += offset
    y += (m - 1) // 12
    m = (m - 1) % 12 + 1
    return f"{y:04d}-{m:02d}"


def read_tracker(path, project: dict, countries: Countries, today: date):
    name = project["name"]
    sheet = project["sheet"]
    rows: list[dict] = []
    issues: list[Issue] = []

    def issue(level, cell, message):
        issues.append(Issue(level, name, f"{sheet}!{cell}" if cell else sheet, message))

    wb = openpyxl.load_workbook(path, data_only=True)
    if sheet not in wb.sheetnames:
        issue("error", None, f"Sheet not found. Sheets in the file: {', '.join(wb.sheetnames)}")
        return rows, issues
    ws = wb[sheet]

    # ---- Find the columns from the headers, rather than assuming fixed letters ----
    cols: dict[str, int] = {}
    for c in range(1, ws.max_column + 1):
        h = tidy_text(ws.cell(3, c).value or "").lower()
        if h.startswith("baseline"):
            cols["baseline"] = c
        elif h.startswith("target") and "indirect" in h:
            cols["target_indirect"] = c
        elif h.startswith("target"):
            cols["target_direct"] = c
    month_cols: list[tuple[str, int]] = []  # (YYYY-MM, column of the Direct figure)
    total_col = None
    for c in range(1, ws.max_column + 1):
        h = tidy_text(ws.cell(2, c).value or "").lower()
        if not h:
            continue
        if h == "total":
            total_col = c
            break
        if h[:3] in MONTHS:
            expected = month_label(project["first_month"], len(month_cols))
            if MONTHS.index(h[:3]) + 1 != int(expected[5:]):
                issue("error", f"{get_column_letter(c)}2",
                      f"Expected the month {expected} here but the header says {h!r}. "
                      f"Check first_month in pipeline/config/projects.toml.")
                return rows, issues
            month_cols.append((expected, c))
    missing = [k for k in ("baseline", "target_direct", "target_indirect") if k not in cols]
    if missing or not month_cols:
        issue("error", "A2:AI3", f"Could not find the header columns ({', '.join(missing) or 'months'}).")
        return rows, issues
    this_month = f"{today.year:04d}-{today.month:02d}"

    # ---- Walk down the rows ----
    output_no = output = None
    project_ind: Indicator | None = None  # the current project-level indicator
    current: Indicator | None = None      # the indicator the next breakdown rows belong to
    seq = 0                               # numbers uncoded project indicators
    seen: dict[tuple, int] = {}           # country rows already read, to spot repeats

    for r in range(4, ws.max_row + 1):
        a = ws.cell(r, 1).value
        if a is not None and str(a).strip():
            output = first_line(a)
            m = re.match(r"output\s*(\d+)", output, re.I)
            output_no = int(m.group(1)) if m else None
            project_ind = current = None
            seq = 0

        b = ws.cell(r, 2).value
        if b is None or not str(b).strip():
            continue
        if isinstance(b, (int, float)):
            issue("warning", f"B{r}", f"Indicator column contains the number {b}. Row skipped.")
            continue
        text = tidy_text(b)

        breakdown = "total"
        country, funding, rest = countries.match_prefix(text)
        if DEMOGRAPHIC.match(text):
            if current is None:
                issue("warning", f"B{r}", f"{text!r} is not under any indicator. Row skipped.")
                continue
            label = text.lower()
            breakdown = label if label in ("female", "male", "youth", "total", "girls", "boys") else text
            ind = current
        elif text.lower() == "others":
            project_ind = current = None  # country indicators below don't roll up
            continue
        elif country:
            code, title = split_code(rest)
            current = Indicator(
                "country",
                project_ind.code if project_ind else None,
                project_ind.title if project_ind else None,
                country, code, title or None, funding,
            )
            ind = current
            # The same country twice under one indicator usually means a new
            # additional-funding label that countries.toml doesn't know yet.
            key = (output, current.code, country, code, (title or "").lower(), funding)
            if key in seen:
                issue("warning", f"B{r}",
                      f"{country} appears twice under the same indicator (also row {seen[key]}). "
                      f"If this is additional funding, add its label to [additional_funding] "
                      f"in pipeline/config/countries.toml.")
            seen[key] = r
        elif starts_with_code(text) or project["uncoded_rows"] == "indicator":
            code, title = split_code(text)
            if code is None:
                seq += 1
                code = f"{output_no or 'X'}.{seq}*"  # * = made-up code, not in the sheet
            project_ind = current = Indicator("project", code, title)
            ind = current
        else:
            if current is None:
                issue("warning", f"B{r}", f"Row {text!r} not recognised and not under any indicator. Skipped.")
                continue
            breakdown = text
            ind = current

        base = {
            "project": name, "output_no": output_no, "output": output, "level": ind.level,
            "indicator_code": ind.code, "indicator": ind.title, "country": ind.country,
            "funding": ind.funding,
            "co_indicator_code": ind.co_code, "co_indicator": ind.co_title, "breakdown": breakdown,
        }

        def emit(measure, col, month=None):
            ref = f"{get_column_letter(col)}{r}"
            number, text_value, problem = parse_value(ws.cell(r, col).value)
            if problem:
                issue("error", ref, problem)
                return None
            if number is None and text_value is None:
                return None
            if month and month > this_month:
                if number:
                    issue("warning", ref, f"A figure ({fmt(number)}) is entered for {month}, which hasn't happened yet. Not used.")
                return None
            rows.append({**base, "measure": measure, "month": month, "value": number,
                         "text_value": text_value, "source": f"{sheet}!{ref}"})
            return number

        emit("baseline", cols["baseline"])
        emit("target_direct", cols["target_direct"])
        emit("target_indirect", cols["target_indirect"])
        if ind.level == "project":
            continue  # results come from the country rows (see top of file)
        sums = {"direct": 0.0, "indirect": 0.0}
        for month, c in month_cols:
            for measure, col in (("direct", c), ("indirect", c + 1)):
                v = emit(measure, col, month)
                sums[measure] += v or 0

        # The sheet's own Total column should equal the sum of the months.
        if total_col:
            for measure, col in (("direct", total_col), ("indirect", total_col + 1)):
                tv, _, _ = parse_value(ws.cell(r, col).value)
                if tv is not None and abs(tv - sums[measure]) > 0.5:
                    issue("warning", f"{get_column_letter(col)}{r}",
                          f"The sheet's Total for {measure} is {fmt(tv)}, but the months add up to "
                          f"{fmt(sums[measure])}. The pipeline uses the months.")

    return rows, issues
