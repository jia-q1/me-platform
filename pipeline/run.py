"""Reads the project trackers and writes the tidy table and a report.

Run from the project folder:   npm run data
Or for one project only:       npm run data -- jsb

Reads:   the newest dated folder in data/raw/ (e.g. data/raw/2026-11-19/),
         or data/raw/ itself if there are no dated folders
Writes:  data/out/tidy.csv    every figure, one per row, with the cell it came from
         data/out/report.md   problems found, for a person to check
"""
from __future__ import annotations

import csv
import sys
import tomllib
from datetime import date
from pathlib import Path

from checks import run_checks
from cleaning import Countries
from reader import COLUMNS, read_tracker

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "pipeline" / "config"
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "out"


def pick_raw_folder() -> Path:
    dated = sorted(p for p in RAW.iterdir() if p.is_dir() and any(p.glob("*.xlsx")))
    return dated[-1] if dated else RAW


def main(only: list[str]) -> int:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    projects = tomllib.loads((CONFIG / "projects.toml").read_text("utf-8"))["project"]
    countries = Countries(tomllib.loads((CONFIG / "countries.toml").read_text("utf-8")))
    if only:
        projects = [p for p in projects if p["id"] in only]
    folder = pick_raw_folder()
    today = date.today()
    print(f"Reading from {folder.relative_to(ROOT)}")

    rows, issues = [], []
    for p in projects:
        matches = [f for f in folder.glob(p["file"]) if not f.name.startswith("~$")]
        if len(matches) != 1:
            print(f"  {p['name']}: expected 1 file matching {p['file']!r}, found {len(matches)}. Skipped.")
            continue
        p_rows, p_issues = read_tracker(matches[0], p, countries, today)
        rows += p_rows
        issues += p_issues
        print(f"  {p['name']}: {len(p_rows)} figures read from {matches[0].name}")

    issues += run_checks(rows)

    OUT.mkdir(parents=True, exist_ok=True)
    # utf-8-sig so Excel shows accented characters correctly.
    with open(OUT / "tidy.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(rows)
    write_report(issues, folder, today)

    errors = sum(i.level == "error" for i in issues)
    warnings = len(issues) - errors
    print(f"\n{errors} errors, {warnings} warnings. Details: data/out/report.md")
    print("Tidy table: data/out/tidy.csv")
    return 1 if errors else 0


def write_report(issues, folder: Path, today: date) -> None:
    lines = [
        f"# Data report, {today.isoformat()}",
        "",
        f"Read from `{folder.relative_to(ROOT).as_posix()}`.",
        "",
        "**Errors** are cells that could not be read. **Warnings** are figures that look wrong "
        "and need a person to check them. The location is the sheet and cell in the Excel file.",
        "",
    ]
    for project in sorted({i.project for i in issues}):
        lines += [f"## {project}", "", "| | Where | Problem |", "|---|---|---|"]
        for i in sorted((i for i in issues if i.project == project), key=lambda i: (i.level != "error", i.where)):
            lines.append(f"| {i.level} | {i.where} | {i.message.replace('|', '/')} |")
        lines.append("")
    if not issues:
        lines.append("No problems found.")
    (OUT / "report.md").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
