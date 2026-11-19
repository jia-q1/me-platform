"""Sense checks on the tidy table. They produce warnings for a person to look at."""
from __future__ import annotations

from collections import defaultdict

from cleaning import fmt
from reader import Issue


def run_checks(rows: list[dict]) -> list[Issue]:
    issues: list[Issue] = []

    # Index the figures we need.
    targets = {}                    # (project, output, code, country, co_code, breakdown, measure) -> value
    results = defaultdict(float)    # (project, output, code, country, co_code) -> total direct + indirect
    sources = {}
    for r in rows:
        key = (r["project"], r["output"], r["indicator_code"], r["country"], r["co_indicator_code"])
        if r["measure"].startswith("target") and r["value"] is not None:
            targets[key + (r["breakdown"], r["measure"])] = r["value"]
            sources[key + (r["breakdown"], r["measure"])] = r["source"]
        if r["measure"] in ("direct", "indirect") and r["breakdown"] == "total" and r["value"]:
            results[key] += r["value"]

    # 1. Results reported against an indicator that has no target.
    for key, total in results.items():
        if not any(targets.get(key + ("total", m)) for m in ("target_direct", "target_indirect")):
            project, _, code, country, co_code = key
            who = f"{country} {co_code or ''}".strip() if country else f"project indicator {code}"
            issues.append(Issue("warning", project, who,
                                f"Results reported ({fmt(total)}) but no target, or a target of 0."))

    # 2. A project-level target should equal the sum of its countries' targets.
    country_sum = defaultdict(float)
    has_country = set()
    for (project, output, code, country, co_code, breakdown, measure), v in targets.items():
        if country and code and breakdown == "total":
            country_sum[(project, output, code, measure)] += v
            has_country.add((project, output, code, measure))
    for (project, output, code, country, co_code, breakdown, measure), v in targets.items():
        k = (project, output, code, measure)
        if country is None and breakdown == "total" and k in has_country:
            if abs(v - country_sum[k]) > 0.5:
                issues.append(Issue("warning", project, sources[(project, output, code, None, None, "total", measure)],
                                    f"Project target {fmt(v)} for indicator {code} ({measure.replace('_', ' ')}) "
                                    f"is not the sum of the country targets ({fmt(country_sum[k])})."))

    # 3. Female + male targets should add up to the total target.
    for key, v in targets.items():
        *ind, breakdown, measure = key
        if breakdown != "total" or not v:
            continue
        f = targets.get(tuple(ind) + ("female", measure))
        m = targets.get(tuple(ind) + ("male", measure))
        if f is not None and m is not None and (f or m) and abs(f + m - v) > 0.5:
            issues.append(Issue("warning", ind[0], sources[key],
                                f"Female ({fmt(f)}) + male ({fmt(m)}) target = {fmt(f + m)}, "
                                f"but the total target is {fmt(v)} ({measure.replace('_', ' ')})."))
    return issues
