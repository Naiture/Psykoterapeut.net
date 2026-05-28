# Keyword-laboratorium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Byg en `keyword-research`-skill der finder billige, gode søgeord via superviseret Keyword Planner-browsing, scorer dem, og følger dem som et lukket laboratorium (markeds-volumen + faktisk performance + bevægelser).

**Architecture:** Skillen ligger i `.claude/skills/keyword-research/` (git-tracket projekt-skill). En testbar Python-motor (`lab/`) håndterer det deterministiske: parse Keyword Planner-CSV, score, persistér `keywords.json`, og beregn bevægelser fra daterede snapshots. SKILL.md + `references/` er LLM-instruktioner til de semantiske/browser-/BigQuery-trin. Projekt-data (keywords, snapshots, viden) ligger i `keyword-research/` i repo-roden, decoupled fra motoren via sti-argumenter.

**Tech Stack:** Python 3.14 (stdlib: csv, json, pathlib), pytest i venv, Claude in Chrome (browser), BigQuery via `bq` CLI. Ingen tredjeparts-runtime-deps.

**Spec:** `docs/superpowers/specs/2026-05-28-keyword-research-design.md`

---

## Filstruktur

```
.claude/skills/keyword-research/
  SKILL.md                          # 2 kommandoer, workflow, hvornår-brug
  references/
    seeds.md                        # seed-generering + BQ søgeterm-query
    browser-flow.md                 # superviseret Keyword Planner-flow + CSV-download
    bigquery-and-data-model.md      # monitor-query + keywords.json/snapshot-schema
  lab/
    pytest.ini
    parse_planner_csv.py            # CSV-tekst → normaliserede rækker
    score.py                        # række → score 0-100 + disqualifier-check
    store.py                        # load/save/merge keywords.json (bevar status)
    snapshot.py                     # skriv dateret snapshot + beregn bevægelser
    tests/
      conftest.py
      test_parse_planner_csv.py
      test_score.py
      test_store.py
      test_snapshot.py
    .venv/                          # gitignored

keyword-research/                   # PROJEKT-DATA (repo-rod)
  keywords.json                     # starter som []
  snapshots/                        # daterede snapshots
  online-terapi-viden.md            # seedet med start-vinkler
```

---

## Datakontrakter (bruges på tværs af tasks)

**Normaliseret keyword-række** (output fra parse, input til score/store):
```json
{
  "keyword": "online terapi",
  "volume": 1300,
  "competition": "low",
  "cpc_low": 12.40,
  "cpc_high": 28.90
}
```
`competition` ∈ {`low`, `medium`, `high`}. `volume` int. `cpc_*` float DKK.

**keywords.json-række** (persisteret tilstand):
```json
{
  "keyword": "online terapi",
  "gruppe": "online-terapi",
  "intent": "terapi",
  "volume": 1300,
  "competition": "low",
  "cpc_low": 12.40,
  "cpc_high": 28.90,
  "score": 78.5,
  "status": "kandidat",
  "noter": "",
  "dato": "2026-05-28"
}
```
`intent` ∈ {`symptom`, `research`, `terapi`, `booking`}. `status` ∈ {`kandidat`, `test`, `live`, `afvist`}.

**snapshot-fil** `snapshots/YYYY-MM-DD.json`:
```json
{
  "dato": "2026-05-28",
  "keywords": [
    {"keyword": "online terapi", "volume": 1300, "cpc_low": 12.40, "cpc_high": 28.90,
     "impressions": 540, "klik": 22, "cpc_faktisk": 18.10, "conv": 1, "cpa": 398.0}
  ]
}
```
Performance-felter (`impressions`, `klik`, `cpc_faktisk`, `conv`, `cpa`) er valgfri — kun til stede når BigQuery-data findes for keyword'et.

---

## Task 0: Scaffolding + test-miljø

**Files:**
- Create: `.claude/skills/keyword-research/lab/pytest.ini`
- Create: `.claude/skills/keyword-research/lab/tests/conftest.py`
- Create: `keyword-research/snapshots/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1: Opret mappestruktur**

```bash
mkdir -p .claude/skills/keyword-research/lab/tests
mkdir -p .claude/skills/keyword-research/references
mkdir -p keyword-research/snapshots
touch keyword-research/snapshots/.gitkeep
```

- [ ] **Step 2: Opret venv og installér pytest**

```bash
cd .claude/skills/keyword-research/lab
python3 -m venv .venv
.venv/bin/pip install --quiet --upgrade pip pytest
.venv/bin/pytest --version
```
Expected: udskriver fx `pytest 8.x.x`

- [ ] **Step 3: Skriv pytest.ini**

Fil: `.claude/skills/keyword-research/lab/pytest.ini`
```ini
[pytest]
pythonpath = .
testpaths = tests
```

- [ ] **Step 4: Skriv tom conftest.py**

Fil: `.claude/skills/keyword-research/lab/tests/conftest.py`
```python
# Sikrer at pytest finder lab-modulerne (jf. pythonpath i pytest.ini)
```

- [ ] **Step 5: Tilføj venv til .gitignore**

Tilføj denne linje til `.gitignore` (repo-rod):
```
.claude/skills/keyword-research/lab/.venv/
```

- [ ] **Step 6: Commit**

```bash
git add .gitignore .claude/skills/keyword-research/lab/pytest.ini \
  .claude/skills/keyword-research/lab/tests/conftest.py \
  keyword-research/snapshots/.gitkeep
git commit -m "chore(keyword-lab): scaffolding + pytest-miljø"
```

---

## Task 1: parse_planner_csv.py — CSV → normaliserede rækker

Keyword Planner-eksporten er typisk UTF-16, tab-separeret, med et par metadata-linjer før header. Parseren skal: detektere UTF-16/UTF-8, finde header-rækken (linjen der indeholder et keyword-kolonnenavn), og mappe både engelske og danske kolonnenavne. Tal kan have tusind-separator.

**Files:**
- Create: `.claude/skills/keyword-research/lab/parse_planner_csv.py`
- Test: `.claude/skills/keyword-research/lab/tests/test_parse_planner_csv.py`

- [ ] **Step 1: Skriv de fejlende tests**

Fil: `.claude/skills/keyword-research/lab/tests/test_parse_planner_csv.py`
```python
from parse_planner_csv import parse_planner_csv, _to_int, _to_float, _norm_competition


def test_to_int_handles_thousand_separators():
    assert _to_int("1.300") == 1300
    assert _to_int("1,300") == 1300
    assert _to_int("12 000") == 12000
    assert _to_int("") == 0
    assert _to_int("–") == 0  # en-dash placeholder


def test_to_float_handles_danish_decimal():
    assert _to_float("12,40") == 12.40
    assert _to_float("28.90") == 28.90
    assert _to_float("") == 0.0


def test_norm_competition_maps_languages():
    assert _norm_competition("LOW") == "low"
    assert _norm_competition("Lav") == "low"
    assert _norm_competition("Medium") == "medium"
    assert _norm_competition("Mellem") == "medium"
    assert _norm_competition("HIGH") == "high"
    assert _norm_competition("Høj") == "high"
    assert _norm_competition("") == "medium"


def test_parse_english_tab_separated_with_preamble():
    csv_text = (
        "Keyword Stats report\n"
        "Some metadata line\n"
        "Keyword\tAvg. monthly searches\tCompetition\tTop of page bid (low range)\tTop of page bid (high range)\n"
        "online terapi\t1.300\tLow\t12,40\t28,90\n"
        "online psykolog\t2.400\tHigh\t31,00\t62,00\n"
    )
    rows = parse_planner_csv(csv_text)
    assert len(rows) == 2
    assert rows[0] == {
        "keyword": "online terapi", "volume": 1300, "competition": "low",
        "cpc_low": 12.40, "cpc_high": 28.90,
    }
    assert rows[1]["keyword"] == "online psykolog"
    assert rows[1]["competition"] == "high"


def test_parse_danish_headers():
    csv_text = (
        "Søgeord\tGns. månedlige søgninger\tKonkurrence\tBud øverste placering (lavt)\tBud øverste placering (højt)\n"
        "terapi over video\t320\tMellem\t9,50\t21,00\n"
    )
    rows = parse_planner_csv(csv_text)
    assert rows[0]["keyword"] == "terapi over video"
    assert rows[0]["volume"] == 320
    assert rows[0]["competition"] == "medium"
    assert rows[0]["cpc_low"] == 9.50


def test_parse_skips_empty_and_total_rows():
    csv_text = (
        "Keyword\tAvg. monthly searches\tCompetition\tTop of page bid (low range)\tTop of page bid (high range)\n"
        "\t\t\t\t\n"
        "online terapi\t1.300\tLow\t12,40\t28,90\n"
    )
    rows = parse_planner_csv(csv_text)
    assert len(rows) == 1
```

- [ ] **Step 2: Kør testene og bekræft de fejler**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/test_parse_planner_csv.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'parse_planner_csv'`

- [ ] **Step 3: Implementér parse_planner_csv.py**

Fil: `.claude/skills/keyword-research/lab/parse_planner_csv.py`
```python
"""Parse Google Keyword Planner CSV-eksport til normaliserede keyword-rækker."""
import re

# Kolonne-aliaser (lowercase substring-match) — engelsk + dansk
_KEYWORD_ALIASES = ("keyword", "søgeord", "sogeord")
_VOLUME_ALIASES = ("avg. monthly searches", "monthly searches", "månedlige søgninger", "sogninger")
_COMPETITION_ALIASES = ("competition", "konkurrence")
_CPC_LOW_ALIASES = ("top of page bid (low", "low range", "lavt", "lavt interval")
_CPC_HIGH_ALIASES = ("top of page bid (high", "high range", "højt", "hojt", "højt interval")


def _to_int(value):
    digits = re.sub(r"[^0-9]", "", value or "")
    return int(digits) if digits else 0


def _to_float(value):
    if not value:
        return 0.0
    cleaned = re.sub(r"[^0-9.,]", "", value).replace(".", "").replace(",", ".")
    # Hvis der oprindeligt var punktum som decimal (ingen komma), gendan
    if "," not in (value or "") and "." in (value or ""):
        cleaned = re.sub(r"[^0-9.]", "", value)
    try:
        return float(cleaned) if cleaned else 0.0
    except ValueError:
        return 0.0


def _norm_competition(value):
    v = (value or "").strip().lower()
    if v in ("low", "lav"):
        return "low"
    if v in ("high", "høj", "hoj"):
        return "high"
    return "medium"


def _find_header_index(headers, aliases):
    for i, h in enumerate(headers):
        hl = h.strip().lower()
        if any(alias in hl for alias in aliases):
            return i
    return None


def _decode(raw):
    if isinstance(raw, str):
        return raw
    for enc in ("utf-16", "utf-8-sig", "utf-8"):
        try:
            return raw.decode(enc)
        except (UnicodeDecodeError, LookupError):
            continue
    return raw.decode("utf-8", errors="replace")


def parse_planner_csv(raw):
    """Tag CSV-tekst (eller bytes) og returnér liste af normaliserede rækker."""
    text = _decode(raw)
    delimiter = "\t" if "\t" in text else ","
    lines = [ln for ln in text.splitlines() if ln.strip()]

    header_row = None
    header_idx = None
    for idx, line in enumerate(lines):
        cells = line.split(delimiter)
        if _find_header_index(cells, _KEYWORD_ALIASES) is not None and len(cells) >= 3:
            header_row = cells
            header_idx = idx
            break
    if header_row is None:
        return []

    col_keyword = _find_header_index(header_row, _KEYWORD_ALIASES)
    col_volume = _find_header_index(header_row, _VOLUME_ALIASES)
    col_comp = _find_header_index(header_row, _COMPETITION_ALIASES)
    col_low = _find_header_index(header_row, _CPC_LOW_ALIASES)
    col_high = _find_header_index(header_row, _CPC_HIGH_ALIASES)

    rows = []
    for line in lines[header_idx + 1:]:
        cells = line.split(delimiter)
        if col_keyword is None or col_keyword >= len(cells):
            continue
        kw = cells[col_keyword].strip()
        if not kw:
            continue
        rows.append({
            "keyword": kw,
            "volume": _to_int(cells[col_volume]) if col_volume is not None and col_volume < len(cells) else 0,
            "competition": _norm_competition(cells[col_comp]) if col_comp is not None and col_comp < len(cells) else "medium",
            "cpc_low": _to_float(cells[col_low]) if col_low is not None and col_low < len(cells) else 0.0,
            "cpc_high": _to_float(cells[col_high]) if col_high is not None and col_high < len(cells) else 0.0,
        })
    return rows
```

- [ ] **Step 4: Kør testene og bekræft de består**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/test_parse_planner_csv.py -v
```
Expected: PASS (alle tests)

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/keyword-research/lab/parse_planner_csv.py \
  .claude/skills/keyword-research/lab/tests/test_parse_planner_csv.py
git commit -m "feat(keyword-lab): parse Keyword Planner CSV til normaliserede rækker"
```

---

## Task 2: score.py — "billig + god"-score + disqualifier

Scoren vægter billig CPC højest (Chris vil have billige keywords). Vægte: CPC 30, volumen 25, intent 25, konkurrence 20 (sum 100). Disqualificerede keywords returnerer 0.

**Files:**
- Create: `.claude/skills/keyword-research/lab/score.py`
- Test: `.claude/skills/keyword-research/lab/tests/test_score.py`

- [ ] **Step 1: Skriv de fejlende tests**

Fil: `.claude/skills/keyword-research/lab/tests/test_score.py`
```python
from score import score_keyword, is_disqualified, DEFAULT_DISQUALIFIERS, INTENT_WEIGHTS


def test_is_disqualified_matches_substrings():
    assert is_disqualified("psykolog med henvisning") is True
    assert is_disqualified("psykolog ydernummer") is True
    assert is_disqualified("psykiater aarhus") is True
    assert is_disqualified("terapi for børn") is True
    assert is_disqualified("online terapi") is False


def test_is_disqualified_does_not_flag_cities():
    # Online terapi targeter hele DK — by-modifiers er IKKE disqualifiers
    assert is_disqualified("psykolog horsens") is False
    assert is_disqualified("terapeut roskilde") is False


def test_intent_weights_ordered():
    assert INTENT_WEIGHTS["booking"] > INTENT_WEIGHTS["terapi"]
    assert INTENT_WEIGHTS["terapi"] > INTENT_WEIGHTS["research"]
    assert INTENT_WEIGHTS["research"] > INTENT_WEIGHTS["symptom"]


def test_disqualified_keyword_scores_zero():
    row = {"keyword": "psykolog ydernummer", "volume": 5000, "competition": "low",
           "cpc_low": 5.0, "cpc_high": 8.0, "intent": "terapi"}
    assert score_keyword(row) == 0.0


def test_cheap_high_intent_beats_expensive():
    cheap = {"keyword": "online terapi billig", "volume": 800, "competition": "low",
             "cpc_low": 6.0, "cpc_high": 10.0, "intent": "booking"}
    pricey = {"keyword": "online psykolog", "volume": 800, "competition": "high",
              "cpc_low": 45.0, "cpc_high": 70.0, "intent": "booking"}
    assert score_keyword(cheap) > score_keyword(pricey)


def test_score_in_range_0_100():
    row = {"keyword": "online terapi", "volume": 1300, "competition": "low",
           "cpc_low": 12.40, "cpc_high": 28.90, "intent": "terapi"}
    s = score_keyword(row)
    assert 0.0 <= s <= 100.0


def test_missing_intent_defaults_to_research():
    row = {"keyword": "hjælp mod stress", "volume": 500, "competition": "medium",
           "cpc_low": 10.0, "cpc_high": 20.0}
    # Må ikke kaste; bruger research-vægt
    assert 0.0 <= score_keyword(row) <= 100.0
```

- [ ] **Step 2: Kør testene og bekræft de fejler**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/test_score.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'score'`

- [ ] **Step 3: Implementér score.py**

Fil: `.claude/skills/keyword-research/lab/score.py`
```python
"""Scoring af keywords: 'billig + god' (0-100) + disqualifier-check."""

# Disqualifiers fra google-ads domæne-viden. BEMÆRK: ingen by-navne —
# online terapi targeter hele DK, så byer er ikke i sig selv disqualifiers.
DEFAULT_DISQUALIFIERS = (
    "henvisning", "ydernummer", "psykiater", "psykiatri",
    "barn", "børn", "boern", "misbrug", "alkohol", "stof",
    "selvmord", "akut", "recept", "medicin",
)

INTENT_WEIGHTS = {
    "symptom": 0.3,
    "research": 0.5,
    "terapi": 0.9,
    "booking": 1.0,
}

_COMPETITION_SCORE = {"low": 1.0, "medium": 0.5, "high": 0.1}

# Vægte (sum = 100). Billig CPC vægtes højest.
_W_CPC = 30.0
_W_VOLUME = 25.0
_W_INTENT = 25.0
_W_COMPETITION = 20.0

# CPC-skala (DKK): <= 5 kr = bedst, >= 60 kr = værst
_CPC_BEST = 5.0
_CPC_WORST = 60.0
# Volumen-skala: diminishing returns, fuldt point ved 2000 søgninger/md
_VOLUME_FULL = 2000.0


def _clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def is_disqualified(keyword, disqualifiers=DEFAULT_DISQUALIFIERS):
    kw = (keyword or "").lower()
    return any(d in kw for d in disqualifiers)


def score_keyword(row, disqualifiers=DEFAULT_DISQUALIFIERS):
    if is_disqualified(row.get("keyword", ""), disqualifiers):
        return 0.0

    cpc_mid = (row.get("cpc_low", 0.0) + row.get("cpc_high", 0.0)) / 2.0
    cpc_norm = _clamp(1.0 - (cpc_mid - _CPC_BEST) / (_CPC_WORST - _CPC_BEST))

    volume_norm = _clamp(row.get("volume", 0) / _VOLUME_FULL)

    intent = row.get("intent") or "research"
    intent_norm = INTENT_WEIGHTS.get(intent, INTENT_WEIGHTS["research"])

    comp_norm = _COMPETITION_SCORE.get(row.get("competition", "medium"), 0.5)

    score = (
        cpc_norm * _W_CPC
        + volume_norm * _W_VOLUME
        + intent_norm * _W_INTENT
        + comp_norm * _W_COMPETITION
    )
    return round(score, 1)
```

- [ ] **Step 4: Kør testene og bekræft de består**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/test_score.py -v
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/keyword-research/lab/score.py \
  .claude/skills/keyword-research/lab/tests/test_score.py
git commit -m "feat(keyword-lab): billig+god scoring + disqualifier-check"
```

---

## Task 3: store.py — persistér keywords.json, bevar status

Merge: opdatér metrics+score for kendte keywords men bevar `status` og `noter`; nye keywords tilføjes med `status="kandidat"`.

**Files:**
- Create: `.claude/skills/keyword-research/lab/store.py`
- Test: `.claude/skills/keyword-research/lab/tests/test_store.py`

- [ ] **Step 1: Skriv de fejlende tests**

Fil: `.claude/skills/keyword-research/lab/tests/test_store.py`
```python
import json
from store import load_keywords, save_keywords, merge_keywords


def test_load_returns_empty_when_missing(tmp_path):
    assert load_keywords(tmp_path / "keywords.json") == []


def test_save_then_load_roundtrip(tmp_path):
    path = tmp_path / "keywords.json"
    rows = [{"keyword": "online terapi", "status": "kandidat"}]
    save_keywords(path, rows)
    assert load_keywords(path) == rows
    # gemt som læsbar UTF-8 med æøå
    text = path.read_text(encoding="utf-8")
    assert "online terapi" in text


def test_merge_adds_new_as_kandidat():
    existing = []
    scored = [{"keyword": "online terapi", "volume": 1300, "score": 78.5,
               "competition": "low", "cpc_low": 12.4, "cpc_high": 28.9, "intent": "terapi"}]
    merged = merge_keywords(existing, scored, gruppe="online-terapi", dato="2026-05-28")
    assert len(merged) == 1
    assert merged[0]["status"] == "kandidat"
    assert merged[0]["gruppe"] == "online-terapi"
    assert merged[0]["dato"] == "2026-05-28"
    assert merged[0]["noter"] == ""


def test_merge_preserves_status_and_notes():
    existing = [{"keyword": "online terapi", "status": "live", "noter": "topperformer",
                 "volume": 1000, "score": 70.0, "gruppe": "online-terapi",
                 "intent": "terapi", "competition": "low", "cpc_low": 10, "cpc_high": 20,
                 "dato": "2026-05-01"}]
    scored = [{"keyword": "online terapi", "volume": 1500, "score": 82.0,
               "competition": "low", "cpc_low": 11.0, "cpc_high": 24.0, "intent": "terapi"}]
    merged = merge_keywords(existing, scored, gruppe="online-terapi", dato="2026-05-28")
    assert len(merged) == 1
    assert merged[0]["status"] == "live"          # bevaret
    assert merged[0]["noter"] == "topperformer"   # bevaret
    assert merged[0]["volume"] == 1500            # opdateret
    assert merged[0]["score"] == 82.0             # opdateret
    assert merged[0]["dato"] == "2026-05-28"      # opdateret


def test_merge_matches_case_insensitively():
    existing = [{"keyword": "Online Terapi", "status": "test", "noter": "",
                 "volume": 1, "score": 1, "gruppe": "g", "intent": "terapi",
                 "competition": "low", "cpc_low": 1, "cpc_high": 2, "dato": "2026-05-01"}]
    scored = [{"keyword": "online terapi", "volume": 1300, "score": 78.5,
               "competition": "low", "cpc_low": 12.4, "cpc_high": 28.9, "intent": "terapi"}]
    merged = merge_keywords(existing, scored, gruppe="online-terapi", dato="2026-05-28")
    assert len(merged) == 1
    assert merged[0]["status"] == "test"
```

- [ ] **Step 2: Kør testene og bekræft de fejler**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/test_store.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'store'`

- [ ] **Step 3: Implementér store.py**

Fil: `.claude/skills/keyword-research/lab/store.py`
```python
"""Persistens for keywords.json med status-bevarende merge."""
import json
from pathlib import Path


def load_keywords(path):
    p = Path(path)
    if not p.exists():
        return []
    return json.loads(p.read_text(encoding="utf-8"))


def save_keywords(path, rows):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def merge_keywords(existing, scored, gruppe, dato):
    by_key = {r["keyword"].strip().lower(): r for r in existing}
    for s in scored:
        key = s["keyword"].strip().lower()
        if key in by_key:
            row = by_key[key]
            # opdatér metrics, bevar status + noter
            row["volume"] = s.get("volume", row.get("volume"))
            row["competition"] = s.get("competition", row.get("competition"))
            row["cpc_low"] = s.get("cpc_low", row.get("cpc_low"))
            row["cpc_high"] = s.get("cpc_high", row.get("cpc_high"))
            row["score"] = s.get("score", row.get("score"))
            row["intent"] = s.get("intent", row.get("intent"))
            row["dato"] = dato
        else:
            by_key[key] = {
                "keyword": s["keyword"],
                "gruppe": gruppe,
                "intent": s.get("intent", "research"),
                "volume": s.get("volume", 0),
                "competition": s.get("competition", "medium"),
                "cpc_low": s.get("cpc_low", 0.0),
                "cpc_high": s.get("cpc_high", 0.0),
                "score": s.get("score", 0.0),
                "status": "kandidat",
                "noter": "",
                "dato": dato,
            }
    return list(by_key.values())
```

- [ ] **Step 4: Kør testene og bekræft de består**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/test_store.py -v
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/keyword-research/lab/store.py \
  .claude/skills/keyword-research/lab/tests/test_store.py
git commit -m "feat(keyword-lab): keywords.json store med status-bevarende merge"
```

---

## Task 4: snapshot.py — daterede snapshots + bevægelser

**Files:**
- Create: `.claude/skills/keyword-research/lab/snapshot.py`
- Test: `.claude/skills/keyword-research/lab/tests/test_snapshot.py`

- [ ] **Step 1: Skriv de fejlende tests**

Fil: `.claude/skills/keyword-research/lab/tests/test_snapshot.py`
```python
import json
from snapshot import write_snapshot, latest_two_snapshots, compute_movements


def test_write_snapshot_creates_dated_file(tmp_path):
    rows = [{"keyword": "online terapi", "volume": 1300, "cpc_low": 12.4, "cpc_high": 28.9}]
    path = write_snapshot(tmp_path, "2026-05-28", rows)
    assert path.name == "2026-05-28.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["dato"] == "2026-05-28"
    assert data["keywords"][0]["keyword"] == "online terapi"


def test_latest_two_returns_newest_first(tmp_path):
    write_snapshot(tmp_path, "2026-05-01", [])
    write_snapshot(tmp_path, "2026-05-28", [])
    write_snapshot(tmp_path, "2026-05-14", [])
    current, previous = latest_two_snapshots(tmp_path)
    assert current["dato"] == "2026-05-28"
    assert previous["dato"] == "2026-05-14"


def test_latest_two_handles_single_snapshot(tmp_path):
    write_snapshot(tmp_path, "2026-05-28", [])
    current, previous = latest_two_snapshots(tmp_path)
    assert current["dato"] == "2026-05-28"
    assert previous is None


def test_compute_movements_volume_and_performance():
    current = {"dato": "2026-05-28", "keywords": [
        {"keyword": "online terapi", "volume": 1500, "cpc_low": 12.0, "cpc_high": 26.0,
         "cpa": 350.0, "conv": 3},
    ]}
    previous = {"dato": "2026-05-14", "keywords": [
        {"keyword": "online terapi", "volume": 1300, "cpc_low": 12.0, "cpc_high": 28.0,
         "cpa": 420.0, "conv": 2},
    ]}
    moves = compute_movements(current, previous)
    assert len(moves) == 1
    m = moves[0]
    assert m["keyword"] == "online terapi"
    assert m["volume_delta"] == 200
    assert m["volume_retning"] == "op"
    assert m["cpa_delta"] == -70.0
    assert m["cpa_retning"] == "ned"


def test_compute_movements_new_keyword_marked():
    current = {"dato": "2026-05-28", "keywords": [
        {"keyword": "ny ide", "volume": 100, "cpc_low": 5, "cpc_high": 9},
    ]}
    previous = {"dato": "2026-05-14", "keywords": []}
    moves = compute_movements(current, previous)
    assert moves[0]["volume_retning"] == "ny"


def test_compute_movements_no_previous():
    current = {"dato": "2026-05-28", "keywords": [
        {"keyword": "online terapi", "volume": 1300, "cpc_low": 12, "cpc_high": 28},
    ]}
    moves = compute_movements(current, None)
    assert moves[0]["volume_retning"] == "ny"
```

- [ ] **Step 2: Kør testene og bekræft de fejler**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/test_snapshot.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'snapshot'`

- [ ] **Step 3: Implementér snapshot.py**

Fil: `.claude/skills/keyword-research/lab/snapshot.py`
```python
"""Daterede snapshots af markeds-volumen + performance, og bevægelses-beregning."""
import json
from pathlib import Path

_FLAT = 0.0001  # tærskel for "uændret"


def write_snapshot(snapshot_dir, dato, keyword_rows):
    d = Path(snapshot_dir)
    d.mkdir(parents=True, exist_ok=True)
    path = d / f"{dato}.json"
    path.write_text(
        json.dumps({"dato": dato, "keywords": keyword_rows}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return path


def latest_two_snapshots(snapshot_dir):
    d = Path(snapshot_dir)
    files = sorted(d.glob("*.json"), key=lambda p: p.stem, reverse=True)
    snaps = [json.loads(p.read_text(encoding="utf-8")) for p in files[:2]]
    current = snaps[0] if snaps else None
    previous = snaps[1] if len(snaps) > 1 else None
    return current, previous


def _direction(delta):
    if delta > _FLAT:
        return "op"
    if delta < -_FLAT:
        return "ned"
    return "uændret"


def _delta_fields(cur, prev, move):
    for field in ("volume", "cpc_low", "cpc_high", "cpa", "conv", "cpc_faktisk", "impressions", "klik"):
        if field in cur:
            cur_v = cur.get(field, 0) or 0
            prev_v = prev.get(field, 0) or 0
            delta = round(cur_v - prev_v, 2)
            move[f"{field}_delta"] = delta
            move[f"{field}_retning"] = _direction(delta)


def compute_movements(current, previous):
    cur_keywords = current.get("keywords", []) if current else []
    prev_by_key = {}
    if previous:
        prev_by_key = {k["keyword"].strip().lower(): k for k in previous.get("keywords", [])}

    moves = []
    for cur in cur_keywords:
        key = cur["keyword"].strip().lower()
        move = {"keyword": cur["keyword"]}
        if key not in prev_by_key:
            move["volume_retning"] = "ny"
            moves.append(move)
            continue
        _delta_fields(cur, prev_by_key[key], move)
        moves.append(move)
    return moves
```

- [ ] **Step 4: Kør testene og bekræft de består**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/ -v
```
Expected: PASS (alle fire test-filer)

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/keyword-research/lab/snapshot.py \
  .claude/skills/keyword-research/lab/tests/test_snapshot.py
git commit -m "feat(keyword-lab): daterede snapshots + bevægelses-beregning"
```

---

## Task 5: references/seeds.md — seed-generering

**Files:**
- Create: `.claude/skills/keyword-research/references/seeds.md`

- [ ] **Step 1: Skriv seeds.md**

Fil: `.claude/skills/keyword-research/references/seeds.md`
```markdown
# Seed-generering

Saml seeds fra tre kilder og gruppér efter intent før Keyword Planner-opslag.

## Intent-grupper (lav→høj købsintent)
1. **symptom** — "kan ikke sove", "føler mig trist", "konstant bekymret"
2. **research** — "hvad er angst", "hjælp mod stress", "hvordan virker terapi"
3. **terapi** — "terapi mod angst", "online psykoterapeut", "samtaleterapi"
4. **booking** — "book online terapi", "online terapi pris", "tid hos terapeut online"

## Kilde 1: Domæne-seeds (online terapi)
online terapi, online psykolog, online psykoterapeut, terapi over video,
videoterapi, terapi hjemmefra, fjernterapi, online samtaleterapi,
online angstbehandling, online stressbehandling, online depression terapi,
online parterapi, terapi online danmark.

Tilpas seed-listen til kampagnens emne (fx angst, stress, traumer) ved nye kørsler.

## Kilde 2: Rigtige søgetermer fra BigQuery
Hent faktiske søgninger der har trigget kontoen — det er ægte dansk sprogbrug:

\`\`\`bash
bq query --use_legacy_sql=false --project_id=content-research-491611 '
SELECT search_term_view_search_term AS soegeterm,
       SUM(metrics_impressions) AS impressions,
       SUM(metrics_clicks) AS klik
FROM `content-research-491611.google_ads.ads_SearchQueryStats_2169223464`
WHERE segments_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
GROUP BY soegeterm
ORDER BY impressions DESC
LIMIT 200'
\`\`\`

Tag de online-relevante søgetermer med som seeds (filtrér evt. lokale-kun manuelt).

## Kilde 3: Eksisterende keywords
\`\`\`bash
bq query --use_legacy_sql=false --project_id=content-research-491611 '
SELECT ad_group_criterion_keyword_text AS keyword,
       ad_group_criterion_keyword_match_type AS match_type
FROM `content-research-491611.google_ads.ads_Keyword_2169223464`
WHERE _DATA_DATE = _LATEST_DATE
  AND ad_group_criterion_negative = FALSE'
\`\`\`

Brug til at undgå dubletter og se hvilke vinkler der allerede køres.

## Output af seed-trinnet
En dedupliceret seed-liste (typisk 15-40 seeds) klar til Keyword Planner.
Klassificér hvert seed med en intent-label — den bruges senere i scoringen.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/keyword-research/references/seeds.md
git commit -m "docs(keyword-lab): seed-generering reference"
```

---

## Task 6: references/browser-flow.md — superviseret Keyword Planner

**Files:**
- Create: `.claude/skills/keyword-research/references/browser-flow.md`

- [ ] **Step 1: Skriv browser-flow.md**

Fil: `.claude/skills/keyword-research/references/browser-flow.md`
```markdown
# Superviseret Keyword Planner-flow (Claude in Chrome)

Google Ads API'et er blokeret, så volumen/CPC hentes via Chris' indloggede browser.
**Superviseret:** udfør flowet, men bed Chris gribe ind ved 2FA, captcha eller layout-ændringer.

## Forudsætninger
- Chris er logget ind på Google Ads (konto 216-922-3464) i Chrome
- Claude in Chrome MCP er forbundet (`mcp__claude-in-chrome__*`). Hvis ikke: bed Chris
  åbne extension-forbindelsen.

## Skridt
1. Naviger til Keyword Planner: `https://ads.google.com/aw/keywordplanner/home`
2. Vælg **"Find nye søgeord" / "Discover new keywords"**
3. Indsæt seed-listen (kommasepareret eller én pr. linje)
4. Sæt indstillinger:
   - **Lokation:** Danmark
   - **Sprog:** Dansk
   - **Søgenetværk:** Google
5. Kør søgningen. Vent på resultat-tabellen.
6. Klik **"Download søgeordsforslag" / "Download keyword ideas"** → vælg **.csv**
7. Filen lander i `~/Downloads/`. Bekræft filnavn (typisk `Keyword Stats *.csv`).

## Hvorfor CSV-download frem for DOM-scraping
Tabellen er stor og lazy-loaded; CSV'en indeholder ALLE rækker i ét format og er robust
mod UI-ændringer. Parse den med `lab/parse_planner_csv.py`.

## Parse den downloadede fil
\`\`\`bash
cd .claude/skills/keyword-research/lab
.venv/bin/python -c "
import sys, json
from parse_planner_csv import parse_planner_csv
raw = open(sys.argv[1], 'rb').read()
print(json.dumps(parse_planner_csv(raw), ensure_ascii=False, indent=2))
" ~/Downloads/'Keyword Stats 2026-05-28 at ...csv'
\`\`\`

## Hvis formatet afviger
Keyword Planner-CSV er ofte UTF-16 tab-separeret med metadata-linjer øverst — parseren
håndterer det. Hvis kolonnerne ikke genkendes: åbn filens header-linje, og udvid alias-
listerne i `parse_planner_csv.py` (`_*_ALIASES`) med de faktiske kolonnenavne.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/keyword-research/references/browser-flow.md
git commit -m "docs(keyword-lab): superviseret Keyword Planner browser-flow"
```

---

## Task 7: references/bigquery-and-data-model.md

**Files:**
- Create: `.claude/skills/keyword-research/references/bigquery-and-data-model.md`

- [ ] **Step 1: Skriv bigquery-and-data-model.md**

Fil: `.claude/skills/keyword-research/references/bigquery-and-data-model.md`
```markdown
# BigQuery-performance + datamodel

## Monitor-query: faktisk performance pr. keyword
Bruges i "opdatér laboratoriet" til at hente performance for `test`/`live` keywords.
Filtrér ALTID `ad_group_criterion_negative = FALSE`. cost i kr = `metrics_cost_micros / 1e6`.

\`\`\`bash
bq query --use_legacy_sql=false --project_id=content-research-491611 '
SELECT
  k.ad_group_criterion_keyword_text AS keyword,
  SUM(s.metrics_impressions) AS impressions,
  SUM(s.metrics_clicks) AS klik,
  SAFE_DIVIDE(SUM(s.metrics_cost_micros)/1e6, SUM(s.metrics_clicks)) AS cpc_faktisk,
  SUM(s.metrics_conversions) AS conv,
  SAFE_DIVIDE(SUM(s.metrics_cost_micros)/1e6, SUM(s.metrics_conversions)) AS cpa
FROM `content-research-491611.google_ads.ads_KeywordStats_2169223464` s
JOIN `content-research-491611.google_ads.ads_Keyword_2169223464` k
  ON s.ad_group_criterion_criterion_id = k.ad_group_criterion_criterion_id
 AND k._DATA_DATE = k._LATEST_DATE
WHERE k.ad_group_criterion_negative = FALSE
  AND s.segments_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
GROUP BY keyword
ORDER BY klik DESC'
\`\`\`

> Verificér kolonne-navne mod `~/.claude/skills/google-ads/references/bq-schema.md` ved
> første kørsel — transfer-skemaet kan have lidt andre felt-navne. Justér query'en hvis nødvendigt.

## Datamodel

### keywords.json (aktuel tilstand, kilde til sandhed)
\`\`\`json
[
  {"keyword": "online terapi", "gruppe": "online-terapi", "intent": "terapi",
   "volume": 1300, "competition": "low", "cpc_low": 12.40, "cpc_high": 28.90,
   "score": 78.5, "status": "kandidat", "noter": "", "dato": "2026-05-28"}
]
\`\`\`
- `intent` ∈ {symptom, research, terapi, booking}
- `status` ∈ {kandidat, test, live, afvist}

### snapshots/YYYY-MM-DD.json (historik til bevægelser)
\`\`\`json
{"dato": "2026-05-28", "keywords": [
  {"keyword": "online terapi", "volume": 1300, "cpc_low": 12.40, "cpc_high": 28.90,
   "impressions": 540, "klik": 22, "cpc_faktisk": 18.10, "conv": 1, "cpa": 398.0}
]}
\`\`\`
Performance-felter er kun til stede for keywords med BigQuery-data. Markeds-volumen
(`volume`, `cpc_*`) kommer fra Keyword Planner-re-pull; performance fra monitor-query.

Faktisk performance-time-series duplikeres IKKE i filer — den ligger i BigQuery og queries live.
Snapshots gemmer kun det Keyword Planner ikke selv husker (volumen-historik) + et øjebliksbillede
af performance til bevægelses-beregning.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/keyword-research/references/bigquery-and-data-model.md
git commit -m "docs(keyword-lab): BigQuery monitor-query + datamodel reference"
```

---

## Task 8: SKILL.md — hovedinstruktioner

**Files:**
- Create: `.claude/skills/keyword-research/SKILL.md`

- [ ] **Step 1: Skriv SKILL.md**

Fil: `.claude/skills/keyword-research/SKILL.md`
```markdown
---
name: keyword-research
description: "Keyword-laboratorium for psykoterapeut.net's Google Ads. Finder billige, gode søgeord via superviseret Keyword Planner-browsing, scorer dem, og følger dem over tid (markeds-volumen + faktisk performance + bevægelser). Brug når Chris vil finde nye søgeord/vinkler til en kampagne (fx online terapi, angst, stress), vil 'researche keywords', 'finde billige søgeord', 'opdatere laboratoriet', eller se hvordan kørende keywords bevæger sig. IKKE for ren performance-analyse af eksisterende kampagner — brug google-ads skill til det."
---

# Keyword-laboratorium for Psykoterapeut.net

Lukket løkke: **discover → test → monitorér → anbefal**. Fordi Google Ads API'et er
blokeret hentes volumen/CPC via Chris' indloggede browser (superviseret).

Data ligger i repoet: `keyword-research/keywords.json`, `keyword-research/snapshots/`,
`keyword-research/online-terapi-viden.md`. Motoren (parse/score/store/snapshot) ligger i
`.claude/skills/keyword-research/lab/`.

## To kommandoer

### "research [emne]" — find nye keywords
1. **Seeds:** Følg `references/seeds.md` — domæne-seeds + rigtige søgetermer (BigQuery) +
   eksisterende keywords. Klassificér hvert seed med intent (symptom/research/terapi/booking).
2. **Browser-opslag:** Følg `references/browser-flow.md` — superviseret Keyword Planner,
   lokation=Danmark, sprog=dansk, download CSV, parse med `lab/parse_planner_csv.py`.
3. **Klassificér:** Tilføj `intent` til hver parset række (din semantiske vurdering).
4. **Score + gem:** Kør motoren (se nedenfor) → merge ind i `keywords.json`.
5. **Output:** Prioriteret tabel af top-kandidater (sortér på score) + test-plan:
   ad group-gruppering, match types (PHRASE/EXACT på commercial intent, BROAD kun med
   strenge negatives), og negative keyword-kandidater. Chris tager det manuelt ind i Ads-UI.
6. **Viden:** Notér vinkler/hypoteser i `online-terapi-viden.md`.

### "opdatér laboratoriet" — monitorér kørende keywords
1. Find keywords med status `test`/`live` i `keywords.json`.
2. **Markeds-volumen:** Re-pull deres volumen/CPC via Keyword Planner (browser-flow).
3. **Performance:** Kør monitor-query fra `references/bigquery-and-data-model.md`.
4. **Snapshot:** Skriv dateret snapshot (volumen + performance) med `lab/snapshot.py`.
5. **Bevægelser:** Beregn deltas mod forrige snapshot (`compute_movements`).
6. **Anbefal** pr. keyword:
   - **Skalér op** — godt + stabil/stigende efterspørgsel
   - **Pause / sænk bud** — høj CPA eller faldende performance
   - **Gør til negative** — budget uden konvertering, eller efterspørgsel forsvundet
   - **Hold øje** — for tidligt
7. Opdatér `status`/`noter` i `keywords.json` og notér learnings i viden-filen.

## Kør motoren

Eksempel: score parsede rækker og merge ind i keywords.json (efter du har sat `intent`):
\`\`\`bash
cd .claude/skills/keyword-research/lab
.venv/bin/python -c "
import json, sys, datetime
from score import score_keyword
from store import load_keywords, save_keywords, merge_keywords
DATA = '$PWD/../../../../keyword-research/keywords.json'
parsed = json.load(open(sys.argv[1]))   # rækker med intent tilføjet
for r in parsed: r['score'] = score_keyword(r)
merged = merge_keywords(load_keywords(DATA), parsed, gruppe='online-terapi',
                        dato=datetime.date.today().isoformat())
merged.sort(key=lambda r: r['score'], reverse=True)
save_keywords(DATA, merged)
print(f'{len(merged)} keywords gemt')
" /tmp/parsed_with_intent.json
\`\`\`
Brug den absolutte sti til `keyword-research/keywords.json` i repo-roden — justér efter
hvor repoet ligger (`/Users/chris/Documents/GitHub/psykoterapeut.net/keyword-research/`).

## Referencer (læs ved behov)
- `references/seeds.md` — seed-generering + BQ-queries
- `references/browser-flow.md` — superviseret Keyword Planner-flow
- `references/bigquery-and-data-model.md` — monitor-query + datamodel

## Faste regler
- **Dansk** altid. Beløb i kr.
- **Online terapi targeter hele DK** — by-modifiers er IKKE automatisk negative (jf. google-ads).
- Sæt aldrig keywords i drift programmatisk — lever test-planen, Chris gør det i Ads-UI.
- Browser-delen er **superviseret** — bed Chris gribe ind ved 2FA/captcha/layout.
```

- [ ] **Step 2: Verificér frontmatter er gyldig**

```bash
cd .claude/skills/keyword-research && head -3 SKILL.md
```
Expected: starter med `---`, har `name: keyword-research`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/keyword-research/SKILL.md
git commit -m "feat(keyword-lab): SKILL.md med research + opdatér-laboratoriet kommandoer"
```

---

## Task 9: Seed projekt-data + viden-fil

**Files:**
- Create: `keyword-research/keywords.json`
- Create: `keyword-research/online-terapi-viden.md`

- [ ] **Step 1: Opret tom keywords.json**

Fil: `keyword-research/keywords.json`
```json
[]
```

- [ ] **Step 2: Opret viden-filen med start-vinkler**

Fil: `keyword-research/online-terapi-viden.md`
```markdown
# Online Terapi — keyword-viden

Akkumuleret viden om søgeord for Online Terapi-kampagnen. Opdateres ved hver kørsel.

## Baggrund
- Online Terapi-kampagnen targeter **hele Danmark** (ikke kun Aarhus).
- `/online-terapi` landingsside får trafik men få conversions — keyword-kvalitet og
  intent-match er afgørende.

## Vinkler at teste
- **Pris/lav friktion:** "online terapi pris", "billig online terapi", "gratis første samtale online"
- **Format-fordel:** "terapi hjemmefra", "terapi over video", "fjernterapi"
- **Lidelse + online:** "online angstbehandling", "online stressbehandling"
- **Intent-stige:** test booking-intent først (højest score), udvid til terapi-intent.

## Disqualifiers (ikke kunder)
henvisning, ydernummer, psykiater, børn, misbrug, akut/selvmord, recept/medicin.
BEMÆRK: by-navne er IKKE disqualifiers for online — hele DK er potentielle klienter.

## Learnings
(tilføjes løbende — hvad blev skaleret, hvad blev pauset, hvorfor)

## Afviste keywords
(tilføjes løbende — keyword + årsag)
```

- [ ] **Step 3: Commit**

```bash
git add keyword-research/keywords.json keyword-research/online-terapi-viden.md
git commit -m "feat(keyword-lab): seed projekt-data + online-terapi viden-fil"
```

---

## Task 10: Verifikation — skill-discovery + fuld test-suite

- [ ] **Step 1: Kør hele test-suiten**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/ -v
```
Expected: alle tests PASS (parse, score, store, snapshot)

- [ ] **Step 2: Verificér filstruktur**

```bash
cd /Users/chris/Documents/GitHub/psykoterapeut.net
ls .claude/skills/keyword-research/ .claude/skills/keyword-research/references/ \
   .claude/skills/keyword-research/lab/ keyword-research/
```
Expected: SKILL.md, references/ (3 filer), lab/ (4 .py + tests + pytest.ini),
keyword-research/ (keywords.json, snapshots/, online-terapi-viden.md)

- [ ] **Step 3: Smoke-test motoren end-to-end**

```bash
cd .claude/skills/keyword-research/lab
.venv/bin/python -c "
from parse_planner_csv import parse_planner_csv
from score import score_keyword
csv = 'Keyword\tAvg. monthly searches\tCompetition\tTop of page bid (low range)\tTop of page bid (high range)\nonline terapi\t1.300\tLow\t12,40\t28,90\n'
rows = parse_planner_csv(csv)
rows[0]['intent'] = 'terapi'
print('parsed:', rows[0])
print('score:', score_keyword(rows[0]))
"
```
Expected: udskriver parset række + en score mellem 0 og 100

- [ ] **Step 4: Bed Chris genstarte/verificere skill-discovery**

Bed Chris bekræfte at `keyword-research` dukker op som tilgængelig skill (projekt-skills i
`.claude/skills/` opdages af Claude Code). Hvis ikke synlig: ny session kan være nødvendig.

- [ ] **Step 5: Ingen commit** (kun verifikation)

---

## Self-review noter
- Spec-dækning: discover (Task 5,8), browser (Task 6), score (Task 2), lagring (Task 3,9),
  monitorering (Task 4,7), bevægelser (Task 4), anbefalinger (Task 8 SKILL.md), datamodel (Task 7).
- Funktions-navne konsistente: `parse_planner_csv`, `score_keyword`, `is_disqualified`,
  `load_keywords`/`save_keywords`/`merge_keywords`, `write_snapshot`/`latest_two_snapshots`/`compute_movements`.
- Browser/BigQuery/seed-trin er LLM-drevne (ikke unit-testet) — verificeret via references + smoke-test.
```
