"""Score SUS and TAM responses for the SE Lab PC Booking System user study.

Input: test/data/sus_tam_responses.csv, one row per participant session.
Columns: code, cohort, sus1..sus10 (1-5), pu1..pu4, peou1..peou4, bi1..bi2 (1-7).
  code   = session code (U01, U02, ... for real users; P01, P02, ... for PROXY users)
  cohort = REAL or PROXY

Scoring follows .docs/05-testing/test_plan.md section 12:
  SUS: odd items (r - 1), even items (5 - r), sum x 2.5 -> 0..100
  TAM: participant mean of PU (items 1-4), PEOU (5-8), BI (9-10) on 1..7
Thresholds (section 10.3 and 12.2): median SUS >= 70; PU, PEOU, BI medians >= 5.0.

Usage:
  python3 test/score_sus_tam.py                # score the CSV
  python3 test/score_sus_tam.py --selftest     # check the formulas only
REAL and PROXY results are reported separately and never mixed.
"""

import csv
import statistics
import sys
from pathlib import Path

CSV_PATH = Path(__file__).parent / "data" / "sus_tam_responses.csv"
SUS_ITEMS = [f"sus{i}" for i in range(1, 11)]
PU, PEOU, BI = ["pu1", "pu2", "pu3", "pu4"], ["peou1", "peou2", "peou3", "peou4"], ["bi1", "bi2"]


def sus_score(answers):
    """answers: list of 10 ints (1..5) in questionnaire order."""
    if len(answers) != 10 or any(a < 1 or a > 5 for a in answers):
        raise ValueError("SUS needs 10 answers between 1 and 5")
    total = sum((a - 1) if i % 2 == 0 else (5 - a) for i, a in enumerate(answers))
    return total * 2.5


def scale_mean(answers):
    if any(a < 1 or a > 7 for a in answers):
        raise ValueError("TAM answers must be between 1 and 7")
    return sum(answers) / len(answers)


def summarize(label, values, threshold):
    if not values:
        return f"  {label}: no responses"
    med = statistics.median(values)
    verdict = "meets" if med >= threshold else "below"
    return (f"  {label}: n={len(values)} median={med:.1f} range={min(values):.1f}-{max(values):.1f} "
            f"({verdict} threshold {threshold})")


def score_file(path):
    rows = list(csv.DictReader(path.open(newline="", encoding="utf-8")))
    if not rows:
        print(f"No responses in {path}. Nothing to score yet (no data has been collected).")
        return
    for cohort in ("REAL", "PROXY"):
        group = [r for r in rows if r["cohort"].strip().upper() == cohort]
        if not group:
            continue
        sus, pu, peou, bi = [], [], [], []
        print(f"\n{cohort} participants")
        for r in group:
            s = sus_score([int(r[k]) for k in SUS_ITEMS])
            p = scale_mean([int(r[k]) for k in PU])
            e = scale_mean([int(r[k]) for k in PEOU])
            b = scale_mean([int(r[k]) for k in BI])
            sus.append(s); pu.append(p); peou.append(e); bi.append(b)
            print(f"  {r['code']}: SUS {s:.1f} | PU {p:.2f} | PEOU {e:.2f} | BI {b:.2f}")
        print(summarize("SUS", sus, 70))
        print(summarize("TAM PU", pu, 5.0))
        print(summarize("TAM PEOU", peou, 5.0))
        print(summarize("TAM BI", bi, 5.0))


def selftest():
    # Formula checks only. These are constructed inputs, not participant data.
    assert sus_score([3] * 10) == 50.0          # all neutral
    assert sus_score([5, 1] * 5) == 100.0       # best possible
    assert sus_score([1, 5] * 5) == 0.0         # worst possible
    assert scale_mean([7, 7, 7, 7]) == 7.0
    assert scale_mean([1, 7]) == 4.0
    for bad in ([0] * 10, [3] * 9):
        try:
            sus_score(bad)
        except ValueError:
            pass
        else:
            raise AssertionError("invalid SUS input was accepted")
    print("selftest ok: SUS 50/100/0 and TAM means computed as specified")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        selftest()
    else:
        score_file(CSV_PATH)
