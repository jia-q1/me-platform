"""Small helpers that turn messy cell contents into clean values."""
from __future__ import annotations

import re

MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

# Values that mean "nothing reported".
EMPTY = {"", "-", "–", "—", "n/a", "na", "none"}

# Breakdown rows by sex and age. Anything else under an indicator (a district, an
# infrastructure type...) keeps its own label.
DEMOGRAPHIC = re.compile(r"^(female|male|youth|girls|boys|total)\b", re.I)

# A code like 1.1.3, 2.1, 1.1.2.1(a) at the start of a label, optionally after
# "Indicator", with the punctuation around it.
CODE = re.compile(
    r"^[\s.(\-–:]*(?:indicator\s+)?(\d+(?:\.\d+)*(?:\s*\([a-z]\))?)\.?[\s:.)\-–]*",
    re.I,
)


def fmt(n: float) -> str:
    """1096993.0 -> '1,096,993'; 0.8 -> '0.8'"""
    return f"{n:,.0f}" if float(n).is_integer() else f"{n:,.2f}".rstrip("0").rstrip(".")


def tidy_text(value) -> str:
    """One line, single spaces."""
    return re.sub(r"\s+", " ", str(value)).strip()


def first_line(value) -> str:
    for line in str(value).splitlines():
        if line.strip():
            return tidy_text(line)
    return ""


def split_code(text: str) -> tuple[str | None, str]:
    """'(1.1.2.2 - Number of people...)' -> ('1.1.2.2', 'Number of people...')"""
    m = CODE.match(text)
    if m:
        code, title = m.group(1).replace(" ", ""), text[m.end():]
    else:
        code, title = None, re.sub(r"^[\s.(\-–:]+", "", text)
    title = title.strip()
    # Drop a closing bracket left over from "Country (code title)".
    if title.endswith(")") and title.count(")") > title.count("("):
        title = title[:-1].rstrip()
    return code, title


def starts_with_code(text: str) -> bool:
    return bool(re.match(r"^\s*(indicator\s+|activity\s+)?\d+(\.\d+)*", text, re.I))


def parse_value(raw):
    """Returns (number, text, problem).

    number   a float, or None
    text     'yes' / 'no' for Yes/No indicators, otherwise None
    problem  a plain-language description if the cell could not be read, else None
    """
    if raw is None:
        return None, None, None
    if isinstance(raw, bool):
        return None, "yes" if raw else "no", None
    if isinstance(raw, (int, float)):
        return float(raw), None, None
    s = str(raw).strip()
    low = s.lower()
    if low in EMPTY:
        return None, None, None
    if low in ("yes", "no"):
        return None, low, None
    if s.startswith("#"):
        return None, None, f"Excel error {s} (a broken formula)"
    # 1,200 or 1,200.5 (commas as thousands separators)
    if re.fullmatch(r"-?\d{1,3}(,\d{3})+(\.\d+)?|-?\d+(\.\d+)?", s):
        return float(s.replace(",", "")), None, None
    if re.fullmatch(r"-?\d+(\.\d+)?\s*%", s):
        return float(s.rstrip("% ")) / 100, None, None
    return None, None, f"Could not read {s!r} as a number"


class Countries:
    """Recognises a country name (or any alias) at the start of a label.

    Additional-funding labels such as "Sudan (El Obeid)" resolve to their country,
    with the label kept as the funding tranche.
    """

    def __init__(self, config: dict):
        self.iso3 = {}
        pairs = []  # (alias, country, funding label or None)
        for name, info in config.get("countries", {}).items():
            self.iso3[name] = info.get("iso3")
            for alias in [name, *info.get("aliases", [])]:
                pairs.append((alias.lower(), name, None))
        for label, info in config.get("additional_funding", {}).items():
            for alias in [label, *info.get("aliases", [])]:
                pairs.append((alias.lower(), info["country"], label))
        # Longest first, so "South Sudan" wins over "Sudan", and
        # "Sudan (El Obeid)" wins over "Sudan".
        self._pairs = sorted(pairs, key=lambda p: -len(p[0]))

    def match_prefix(self, text: str) -> tuple[str | None, str | None, str]:
        """Returns (country, funding label, rest of the text)."""
        low = text.lower()
        for alias, name, funding in self._pairs:
            if low.startswith(alias):
                rest = text[len(alias):]
                if rest and rest[0].isalnum():  # "Iraqi..." is not "Iraq"
                    continue
                return name, funding, rest
        return None, None, text
