# Keyword-laboratorium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Byg en `keyword-research`-skill der finder billige, gode søgeord, **benchmarker dem mod ægte BigQuery-performance** (manuel Ads-test kun for net-nye), og følger dem over tid.

**Architecture:** Skillen ligger i `.claude/skills/keyword-research/` (git-tracket projekt-skill). En testbar Python-motor (`lab/`) håndterer det deterministiske: parse Keyword Planner-CSV, **berig kandidater med ægte performance fra BigQuery** (eksakt keyword + matchende søgetermer), BigQuery-først scoring, persistér `keywords.json`, og beregn bevægelser fra daterede snapshots. SKILL.md + `references/` er LLM-instruktioner til de semantiske/browser-/BigQuery-trin. Projekt-data ligger i `keyword-research/` i repo-roden, decoupled fra motoren via sti-argumenter.

**Tech Stack:** Python 3.14 (stdlib: csv, json, re, pathlib), pytest i venv, Claude in Chrome (browser), BigQuery via `bq` CLI. Ingen tredjeparts-runtime-deps.

**Spec:** `docs/superpowers/specs/2026-05-28-keyword-research-design.md`

**Grundprincip:** BigQuery er benchmarken. Har et keyword (eller en matchende søgeterm) ægte data → score på rigtige penge (`kilde="bigquery"`). Ellers → estimat fra Keyword Planner + flag som net-ny satsning (`kilde="estimat"`), kandidat til manuel test.

---

## Filstruktur

```
.claude/skills/keyword-research/
  SKILL.md                          # 2 kommandoer, workflow, hvornår-brug
  references/
    seeds.md                        # seed-generering + BQ søgeterm-query
    browser-flow.md                 # superviseret Keyword Planner-flow + CSV-download
    bigquery-and-data-model.md      # berigelse- + monitor-queries + datamodel
  lab/
    pytest.ini
    parse_planner_csv.py            # CSV-tekst → normaliserede rækker (KP-estimater)
    enrich.py                       # match mod søgetermer + ægte performance → kilde
    score.py                        # BigQuery-først score 0-100 + disqualifier
    store.py                        # load/save/merge keywords.json (bevar status)
    snapshot.py                     # skriv dateret snapshot + beregn bevægelser
    tests/
      conftest.py
      test_parse_planner_csv.py
      test_enrich.py
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

**Normaliseret keyword-række** (output fra parse — KP-estimater):
```json
{"keyword": "online terapi", "volume": 1300, "competition": "low",
 "cpc_low": 12.40, "cpc_high": 28.90}
```
`competition` ∈ {`low`, `medium`, `high`}. `volume` int. `cpc_*` float DKK.

**Performance-række fra BigQuery** (input til enrich):
```json
{"keyword": "online terapi", "impressions": 540, "klik": 22, "cost": 398.0, "conv": 1}
```
`cost` i kr. Søgeterm-rækker har `soegeterm` i stedet for `keyword`.

**Beriget række** (output fra enrich — føjer til den parsede række):
```json
{"keyword": "online terapi", "volume": 1300, "competition": "low",
 "cpc_low": 12.40, "cpc_high": 28.90, "intent": "terapi",
 "kilde": "bigquery", "klik": 22, "conv": 1, "cpc_faktisk": 18.10, "cpa": 398.0}
```
`kilde` ∈ {`bigquery`, `estimat`}. Ægte felter (`klik`, `conv`, `cpc_faktisk`, `cpa`) kun når `kilde="bigquery"`.

**keywords.json-række** (persisteret tilstand):
```json
{"keyword": "online terapi", "gruppe": "online-terapi", "intent": "terapi",
 "volume": 1300, "competition": "low", "cpc_low": 12.40, "cpc_high": 28.90,
 "kilde": "bigquery", "klik": 22, "conv": 1, "cpc_faktisk": 18.10, "cpa": 398.0,
 "score": 78.5, "status": "kandidat", "noter": "", "dato": "2026-05-28"}
```
`intent` ∈ {`symptom`, `research`, `terapi`, `booking`}. `status` ∈ {`kandidat`, `test`, `live`, `afvist`}.

**snapshot-fil** `snapshots/YYYY-MM-DD.json`:
```json
{"dato": "2026-05-28", "keywords": [
  {"keyword": "online terapi", "volume": 1300, "cpc_low": 12.40, "cpc_high": 28.90,
   "klik": 22, "cpc_faktisk": 18.10, "conv": 1, "cpa": 398.0}]}
```

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

Keyword Planner-eksporten er typisk UTF-16, tab-separeret, med et par metadata-linjer før header. Parseren skal: detektere UTF-16/UTF-8, finde header-rækken, og mappe både engelske og danske kolonnenavne. Tal kan have tusind-separator.

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


def test_parse_skips_empty_rows():
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
    if "," in value:
        cleaned = re.sub(r"[^0-9,]", "", value).replace(",", ".")
    else:
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
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/keyword-research/lab/parse_planner_csv.py \
  .claude/skills/keyword-research/lab/tests/test_parse_planner_csv.py
git commit -m "feat(keyword-lab): parse Keyword Planner CSV til normaliserede rækker"
```

---

## Task 2: enrich.py — berig kandidater med ægte BigQuery-performance

Kernen i BigQuery-først-modellen. For hvert kandidat-keyword: brug eksakt keyword-performance hvis vi byder på det; ellers aggregér matchende søgetermer (broad-match real-world data). Sæt `kilde="bigquery"` hvis der er ægte klik, ellers `kilde="estimat"`.

**Files:**
- Create: `.claude/skills/keyword-research/lab/enrich.py`
- Test: `.claude/skills/keyword-research/lab/tests/test_enrich.py`

- [ ] **Step 1: Skriv de fejlende tests**

Fil: `.claude/skills/keyword-research/lab/tests/test_enrich.py`
```python
from enrich import matches, aggregate_performance, enrich_keyword, enrich_all


def test_matches_subset_of_tokens():
    assert matches("online terapi", "billig online terapi") is True
    assert matches("online terapi", "online terapi aarhus") is True
    assert matches("online terapi", "online psykolog") is False
    assert matches("online terapi", "terapi") is False  # mangler 'online'


def test_aggregate_performance_sums_and_computes_ratios():
    rows = [
        {"soegeterm": "online terapi", "impressions": 300, "klik": 12, "cost": 200.0, "conv": 1},
        {"soegeterm": "billig online terapi", "impressions": 240, "klik": 10, "cost": 198.0, "conv": 0},
    ]
    agg = aggregate_performance(rows)
    assert agg["klik"] == 22
    assert agg["conv"] == 1
    assert round(agg["cpc_faktisk"], 2) == round(398.0 / 22, 2)
    assert agg["cpa"] == 398.0  # cost / conv


def test_aggregate_zero_conv_gives_none_cpa():
    rows = [{"soegeterm": "x", "impressions": 100, "klik": 5, "cost": 50.0, "conv": 0}]
    agg = aggregate_performance(rows)
    assert agg["cpa"] is None


def test_enrich_uses_exact_keyword_stats_first():
    row = {"keyword": "online terapi", "volume": 1300, "competition": "low",
           "cpc_low": 12.0, "cpc_high": 28.0}
    exact = {"online terapi": {"impressions": 540, "klik": 22, "cost": 398.0, "conv": 2}}
    enriched = enrich_keyword(row, exact, search_terms=[])
    assert enriched["kilde"] == "bigquery"
    assert enriched["klik"] == 22
    assert enriched["conv"] == 2
    assert enriched["cpa"] == 199.0


def test_enrich_falls_back_to_matching_search_terms():
    row = {"keyword": "online terapi", "volume": 1300, "competition": "low",
           "cpc_low": 12.0, "cpc_high": 28.0}
    search_terms = [
        {"soegeterm": "billig online terapi", "impressions": 240, "klik": 10, "cost": 198.0, "conv": 1},
        {"soegeterm": "online psykolog", "impressions": 999, "klik": 50, "cost": 1500.0, "conv": 0},
    ]
    enriched = enrich_keyword(row, exact_stats={}, search_terms=search_terms)
    assert enriched["kilde"] == "bigquery"
    assert enriched["klik"] == 10          # kun den matchende søgeterm
    assert enriched["conv"] == 1


def test_enrich_marks_net_new_when_no_data():
    row = {"keyword": "online terapi hjemmefra", "volume": 90, "competition": "low",
           "cpc_low": 8.0, "cpc_high": 15.0}
    enriched = enrich_keyword(row, exact_stats={}, search_terms=[])
    assert enriched["kilde"] == "estimat"
    assert "klik" not in enriched


def test_enrich_all_processes_list():
    rows = [
        {"keyword": "online terapi", "volume": 1300, "competition": "low", "cpc_low": 12.0, "cpc_high": 28.0},
        {"keyword": "ny vinkel", "volume": 50, "competition": "low", "cpc_low": 5.0, "cpc_high": 9.0},
    ]
    exact = {"online terapi": {"impressions": 540, "klik": 22, "cost": 398.0, "conv": 2}}
    out = enrich_all(rows, exact, search_terms=[])
    assert out[0]["kilde"] == "bigquery"
    assert out[1]["kilde"] == "estimat"
```

- [ ] **Step 2: Kør testene og bekræft de fejler**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/test_enrich.py -v
```
Expected: FAIL — `ModuleNotFoundError: No module named 'enrich'`

- [ ] **Step 3: Implementér enrich.py**

Fil: `.claude/skills/keyword-research/lab/enrich.py`
```python
"""Berig kandidat-keywords med ægte performance fra BigQuery.

Eksakt keyword-performance foretrækkes; ellers aggregeres matchende søgetermer
(broad-match real-world data). Sætter kilde = 'bigquery' (bevist) eller 'estimat' (net-ny).
"""


def _tokens(text):
    return [t for t in (text or "").strip().lower().split() if t]


def matches(keyword, search_term):
    """En søgeterm matcher hvis alle keyword'ets ord optræder i søgetermen."""
    kw_tokens = set(_tokens(keyword))
    st_tokens = set(_tokens(search_term))
    return bool(kw_tokens) and kw_tokens.issubset(st_tokens)


def aggregate_performance(rows):
    impressions = sum(r.get("impressions", 0) or 0 for r in rows)
    klik = sum(r.get("klik", 0) or 0 for r in rows)
    cost = round(sum(r.get("cost", 0.0) or 0.0 for r in rows), 2)
    conv = sum(r.get("conv", 0) or 0 for r in rows)
    cpc_faktisk = round(cost / klik, 2) if klik else 0.0
    cpa = round(cost / conv, 2) if conv else None
    return {"impressions": impressions, "klik": klik, "cost": cost,
            "conv": conv, "cpc_faktisk": cpc_faktisk, "cpa": cpa}


def _attach(row, agg):
    out = dict(row)
    out["kilde"] = "bigquery"
    out["klik"] = agg["klik"]
    out["conv"] = agg["conv"]
    out["cpc_faktisk"] = agg["cpc_faktisk"]
    out["cpa"] = agg["cpa"]
    return out


def enrich_keyword(row, exact_stats, search_terms):
    kw_lower = row["keyword"].strip().lower()
    exact = exact_stats.get(kw_lower)
    if exact and (exact.get("klik", 0) or 0) > 0:
        return _attach(row, aggregate_performance([{
            "impressions": exact.get("impressions", 0), "klik": exact.get("klik", 0),
            "cost": exact.get("cost", 0.0), "conv": exact.get("conv", 0),
        }]))
    matching = [st for st in search_terms if matches(row["keyword"], st.get("soegeterm", ""))]
    matching = [st for st in matching if (st.get("klik", 0) or 0) > 0]
    if matching:
        return _attach(row, aggregate_performance(matching))
    out = dict(row)
    out["kilde"] = "estimat"
    return out


def enrich_all(rows, exact_stats, search_terms):
    return [enrich_keyword(r, exact_stats, search_terms) for r in rows]
```

- [ ] **Step 4: Kør testene og bekræft de består**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/test_enrich.py -v
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/keyword-research/lab/enrich.py \
  .claude/skills/keyword-research/lab/tests/test_enrich.py
git commit -m "feat(keyword-lab): berig kandidater med ægte BigQuery-performance"
```

---

## Task 3: score.py — BigQuery-først "billig + god"-score

To spor: **bevist** (ægte CPA/CPC/klik dominerer — konverterer billigt = kongen; klik uden conv = negative-kandidat) og **estimat** (Keyword Planner). Disqualificerede keywords = 0.

**Files:**
- Create: `.claude/skills/keyword-research/lab/score.py`
- Test: `.claude/skills/keyword-research/lab/tests/test_score.py`

- [ ] **Step 1: Skriv de fejlende tests**

Fil: `.claude/skills/keyword-research/lab/tests/test_score.py`
```python
from score import score_keyword, is_disqualified, INTENT_WEIGHTS


def test_is_disqualified_matches_substrings():
    assert is_disqualified("psykolog med henvisning") is True
    assert is_disqualified("psykolog ydernummer") is True
    assert is_disqualified("psykiater aarhus") is True
    assert is_disqualified("terapi for børn") is True
    assert is_disqualified("online terapi") is False


def test_is_disqualified_does_not_flag_cities():
    assert is_disqualified("psykolog horsens") is False
    assert is_disqualified("terapeut roskilde") is False


def test_intent_weights_ordered():
    assert INTENT_WEIGHTS["booking"] > INTENT_WEIGHTS["terapi"]
    assert INTENT_WEIGHTS["terapi"] > INTENT_WEIGHTS["research"]
    assert INTENT_WEIGHTS["research"] > INTENT_WEIGHTS["symptom"]


def test_disqualified_scores_zero():
    row = {"keyword": "psykolog ydernummer", "kilde": "bigquery",
           "klik": 50, "conv": 10, "cpa": 200.0, "cpc_faktisk": 8.0, "intent": "terapi"}
    assert score_keyword(row) == 0.0


def test_estimate_cheap_high_intent_beats_expensive():
    cheap = {"keyword": "online terapi billig", "kilde": "estimat", "volume": 800,
             "competition": "low", "cpc_low": 6.0, "cpc_high": 10.0, "intent": "booking"}
    pricey = {"keyword": "online psykolog dyr", "kilde": "estimat", "volume": 800,
              "competition": "high", "cpc_low": 45.0, "cpc_high": 70.0, "intent": "booking"}
    assert score_keyword(cheap) > score_keyword(pricey)


def test_proven_converting_scores_high():
    row = {"keyword": "online terapi", "kilde": "bigquery", "klik": 60, "conv": 5,
           "cpa": 350.0, "cpc_faktisk": 18.0, "intent": "terapi"}
    assert score_keyword(row) >= 75.0


def test_proven_wasted_spend_scores_low():
    # Mange klik, ingen conv = negative-kandidat
    row = {"keyword": "online terapi", "kilde": "bigquery", "klik": 40, "conv": 0,
           "cpa": None, "cpc_faktisk": 30.0, "intent": "terapi"}
    assert score_keyword(row) <= 15.0


def test_proven_beats_estimate_when_proven_is_good():
    proven = {"keyword": "online terapi", "kilde": "bigquery", "klik": 60, "conv": 5,
              "cpa": 300.0, "cpc_faktisk": 12.0, "intent": "terapi"}
    estimate = {"keyword": "online terapi", "kilde": "estimat", "volume": 1300,
                "competition": "low", "cpc_low": 12.0, "cpc_high": 28.0, "intent": "terapi"}
    assert score_keyword(proven) > score_keyword(estimate)


def test_score_in_range_0_100():
    for row in [
        {"keyword": "a", "kilde": "estimat", "volume": 1300, "competition": "low",
         "cpc_low": 12.4, "cpc_high": 28.9, "intent": "terapi"},
        {"keyword": "b", "kilde": "bigquery", "klik": 30, "conv": 2, "cpa": 500.0,
         "cpc_faktisk": 20.0, "intent": "research"},
    ]:
        assert 0.0 <= score_keyword(row) <= 100.0


def test_missing_kilde_defaults_to_estimate():
    row = {"keyword": "hjælp mod stress", "volume": 500, "competition": "medium",
           "cpc_low": 10.0, "cpc_high": 20.0, "intent": "research"}
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
"""BigQuery-først scoring: bevist (ægte data) vs estimat (Keyword Planner). 0-100."""

DEFAULT_DISQUALIFIERS = (
    "henvisning", "ydernummer", "psykiater", "psykiatri",
    "barn", "børn", "boern", "misbrug", "alkohol", "stof",
    "selvmord", "akut", "recept", "medicin",
)

INTENT_WEIGHTS = {"symptom": 0.3, "research": 0.5, "terapi": 0.9, "booking": 1.0}
_COMPETITION_SCORE = {"low": 1.0, "medium": 0.5, "high": 0.1}

# CPC-skala (DKK): <=5 kr bedst, >=60 kr værst
_CPC_BEST, _CPC_WORST = 5.0, 60.0
# CPA-skala (DKK): <=300 kr bedst, >=1500 kr værst
_CPA_BEST, _CPA_WORST = 300.0, 1500.0
_VOLUME_FULL = 2000.0
_DEMAND_FULL = 50.0  # klik for fuldt efterspørgsels-point


def _clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def is_disqualified(keyword, disqualifiers=DEFAULT_DISQUALIFIERS):
    kw = (keyword or "").lower()
    return any(d in kw for d in disqualifiers)


def _intent_norm(row):
    return INTENT_WEIGHTS.get(row.get("intent") or "research", INTENT_WEIGHTS["research"])


def _score_estimate(row):
    cpc_mid = (row.get("cpc_low", 0.0) + row.get("cpc_high", 0.0)) / 2.0
    cpc_norm = _clamp(1.0 - (cpc_mid - _CPC_BEST) / (_CPC_WORST - _CPC_BEST))
    volume_norm = _clamp(row.get("volume", 0) / _VOLUME_FULL)
    comp_norm = _COMPETITION_SCORE.get(row.get("competition", "medium"), 0.5)
    # vægte: cpc 30, volume 25, intent 25, konkurrence 20
    return cpc_norm * 30 + volume_norm * 25 + _intent_norm(row) * 25 + comp_norm * 20


def _score_proven(row):
    klik = row.get("klik", 0) or 0
    conv = row.get("conv", 0) or 0
    cpa = row.get("cpa")
    cpc_faktisk = row.get("cpc_faktisk", 0.0) or 0.0

    cpc_norm = _clamp(1.0 - (cpc_faktisk - _CPC_BEST) / (_CPC_WORST - _CPC_BEST))
    demand_norm = _clamp(klik / _DEMAND_FULL)
    if conv > 0 and cpa is not None:
        cpa_norm = _clamp(1.0 - (cpa - _CPA_BEST) / (_CPA_WORST - _CPA_BEST))
    else:
        cpa_norm = 0.0
    # vægte: cpa 40 (konverterer billigt = kongen), cpc 25, intent 25, efterspørgsel 10
    score = cpa_norm * 40 + cpc_norm * 25 + _intent_norm(row) * 25 + demand_norm * 10
    # negative-kandidat: rigtige klik uden conversions
    if conv == 0 and klik >= 10:
        score = min(score, 15.0)
    return score


def score_keyword(row, disqualifiers=DEFAULT_DISQUALIFIERS):
    if is_disqualified(row.get("keyword", ""), disqualifiers):
        return 0.0
    if row.get("kilde") == "bigquery":
        return round(_score_proven(row), 1)
    return round(_score_estimate(row), 1)
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
git commit -m "feat(keyword-lab): BigQuery-først scoring (bevist vs estimat)"
```

---

## Task 4: store.py — persistér keywords.json, bevar status

Merge: opdatér metrics+kilde+ægte performance+score for kendte keywords men bevar `status` og `noter`; nye keywords tilføjes med `status="kandidat"`.

**Files:**
- Create: `.claude/skills/keyword-research/lab/store.py`
- Test: `.claude/skills/keyword-research/lab/tests/test_store.py`

- [ ] **Step 1: Skriv de fejlende tests**

Fil: `.claude/skills/keyword-research/lab/tests/test_store.py`
```python
from store import load_keywords, save_keywords, merge_keywords


def test_load_returns_empty_when_missing(tmp_path):
    assert load_keywords(tmp_path / "keywords.json") == []


def test_save_then_load_roundtrip(tmp_path):
    path = tmp_path / "keywords.json"
    rows = [{"keyword": "online terapi", "status": "kandidat"}]
    save_keywords(path, rows)
    assert load_keywords(path) == rows
    assert "online terapi" in path.read_text(encoding="utf-8")


def test_merge_adds_new_as_kandidat():
    scored = [{"keyword": "online terapi", "volume": 1300, "score": 78.5, "kilde": "estimat",
               "competition": "low", "cpc_low": 12.4, "cpc_high": 28.9, "intent": "terapi"}]
    merged = merge_keywords([], scored, gruppe="online-terapi", dato="2026-05-28")
    assert len(merged) == 1
    assert merged[0]["status"] == "kandidat"
    assert merged[0]["gruppe"] == "online-terapi"
    assert merged[0]["kilde"] == "estimat"
    assert merged[0]["noter"] == ""


def test_merge_carries_proven_performance_fields():
    scored = [{"keyword": "online terapi", "volume": 1300, "score": 82.0, "kilde": "bigquery",
               "competition": "low", "cpc_low": 12.4, "cpc_high": 28.9, "intent": "terapi",
               "klik": 22, "conv": 2, "cpa": 199.0, "cpc_faktisk": 18.1}]
    merged = merge_keywords([], scored, gruppe="online-terapi", dato="2026-05-28")
    assert merged[0]["kilde"] == "bigquery"
    assert merged[0]["conv"] == 2
    assert merged[0]["cpa"] == 199.0


def test_merge_preserves_status_and_notes():
    existing = [{"keyword": "online terapi", "status": "live", "noter": "topperformer",
                 "volume": 1000, "score": 70.0, "gruppe": "online-terapi", "kilde": "estimat",
                 "intent": "terapi", "competition": "low", "cpc_low": 10, "cpc_high": 20,
                 "dato": "2026-05-01"}]
    scored = [{"keyword": "online terapi", "volume": 1500, "score": 82.0, "kilde": "bigquery",
               "competition": "low", "cpc_low": 11.0, "cpc_high": 24.0, "intent": "terapi",
               "klik": 30, "conv": 3, "cpa": 250.0, "cpc_faktisk": 16.0}]
    merged = merge_keywords(existing, scored, gruppe="online-terapi", dato="2026-05-28")
    assert len(merged) == 1
    assert merged[0]["status"] == "live"          # bevaret
    assert merged[0]["noter"] == "topperformer"   # bevaret
    assert merged[0]["volume"] == 1500            # opdateret
    assert merged[0]["kilde"] == "bigquery"       # opdateret
    assert merged[0]["conv"] == 3                 # opdateret
    assert merged[0]["dato"] == "2026-05-28"


def test_merge_matches_case_insensitively():
    existing = [{"keyword": "Online Terapi", "status": "test", "noter": "", "volume": 1,
                 "score": 1, "gruppe": "g", "intent": "terapi", "kilde": "estimat",
                 "competition": "low", "cpc_low": 1, "cpc_high": 2, "dato": "2026-05-01"}]
    scored = [{"keyword": "online terapi", "volume": 1300, "score": 78.5, "kilde": "estimat",
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

# Metrics-felter der opdateres ved merge (status + noter bevares altid)
_UPDATE_FIELDS = ("volume", "competition", "cpc_low", "cpc_high", "score", "intent",
                  "kilde", "klik", "conv", "cpa", "cpc_faktisk")


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
            for f in _UPDATE_FIELDS:
                if f in s:
                    row[f] = s[f]
            row["dato"] = dato
        else:
            new_row = {
                "keyword": s["keyword"], "gruppe": gruppe,
                "intent": s.get("intent", "research"),
                "volume": s.get("volume", 0), "competition": s.get("competition", "medium"),
                "cpc_low": s.get("cpc_low", 0.0), "cpc_high": s.get("cpc_high", 0.0),
                "kilde": s.get("kilde", "estimat"), "score": s.get("score", 0.0),
                "status": "kandidat", "noter": "", "dato": dato,
            }
            for f in ("klik", "conv", "cpa", "cpc_faktisk"):
                if f in s:
                    new_row[f] = s[f]
            by_key[key] = new_row
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

## Task 5: snapshot.py — daterede snapshots + bevægelser

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
         "cpa": 350.0, "conv": 3}]}
    previous = {"dato": "2026-05-14", "keywords": [
        {"keyword": "online terapi", "volume": 1300, "cpc_low": 12.0, "cpc_high": 28.0,
         "cpa": 420.0, "conv": 2}]}
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
        {"keyword": "ny ide", "volume": 100, "cpc_low": 5, "cpc_high": 9}]}
    previous = {"dato": "2026-05-14", "keywords": []}
    moves = compute_movements(current, previous)
    assert moves[0]["volume_retning"] == "ny"


def test_compute_movements_no_previous():
    current = {"dato": "2026-05-28", "keywords": [
        {"keyword": "online terapi", "volume": 1300, "cpc_low": 12, "cpc_high": 28}]}
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

- [ ] **Step 4: Kør hele test-suiten**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/ -v
```
Expected: PASS (alle fem test-filer: parse, enrich, score, store, snapshot)

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/keyword-research/lab/snapshot.py \
  .claude/skills/keyword-research/lab/tests/test_snapshot.py
git commit -m "feat(keyword-lab): daterede snapshots + bevægelses-beregning"
```

---

## Task 6: references/seeds.md — seed-generering

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
Hent faktiske søgninger der har trigget kontoen — ægte dansk sprogbrug, og samtidig grundlag
for berigelse i benchmark-trinnet:

\`\`\`bash
bq query --use_legacy_sql=false --project_id=content-research-491611 '
SELECT search_term_view_search_term AS soegeterm,
       SUM(metrics_impressions) AS impressions,
       SUM(metrics_clicks) AS klik,
       SUM(metrics_cost_micros)/1e6 AS cost,
       SUM(metrics_conversions) AS conv
FROM `content-research-491611.google_ads.ads_SearchQueryStats_2169223464`
WHERE segments_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
GROUP BY soegeterm
ORDER BY impressions DESC
LIMIT 500'
\`\`\`

Gem resultatet som JSON (`soegeterm, impressions, klik, cost, conv`) — det bruges direkte af
`enrich.py` til at benchmarke kandidater.

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

## Task 7: references/browser-flow.md — superviseret Keyword Planner

**Files:**
- Create: `.claude/skills/keyword-research/references/browser-flow.md`

- [ ] **Step 1: Skriv browser-flow.md**

Fil: `.claude/skills/keyword-research/references/browser-flow.md`
```markdown
# Superviseret Keyword Planner-flow (Claude in Chrome)

Google Ads API'et er blokeret, så markeds-volumen/CPC hentes via Chris' indloggede browser.
**Superviseret:** udfør flowet, men bed Chris gribe ind ved 2FA, captcha eller layout-ændringer.
Bruges til net-nye keywords + til at re-pulle markeds-volumen ved "opdatér laboratoriet".

## Forudsætninger
- Chris er logget ind på Google Ads (konto 216-922-3464) i Chrome
- Claude in Chrome MCP er forbundet (`mcp__claude-in-chrome__*`). Hvis ikke: bed Chris
  åbne extension-forbindelsen.

## Skridt
1. Naviger til Keyword Planner: `https://ads.google.com/aw/keywordplanner/home`
2. Vælg **"Find nye søgeord" / "Discover new keywords"**
3. Indsæt seed-listen (kommasepareret eller én pr. linje)
4. Sæt indstillinger: **Lokation: Danmark**, **Sprog: Dansk**, **Søgenetværk: Google**
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
håndterer det. Hvis kolonnerne ikke genkendes: åbn header-linjen og udvid alias-listerne i
`parse_planner_csv.py` (`_*_ALIASES`) med de faktiske kolonnenavne.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/keyword-research/references/browser-flow.md
git commit -m "docs(keyword-lab): superviseret Keyword Planner browser-flow"
```

---

## Task 8: references/bigquery-and-data-model.md

**Files:**
- Create: `.claude/skills/keyword-research/references/bigquery-and-data-model.md`

- [ ] **Step 1: Skriv bigquery-and-data-model.md**

Fil: `.claude/skills/keyword-research/references/bigquery-and-data-model.md`
```markdown
# BigQuery — berigelse, monitorering + datamodel

Filtrér ALTID `ad_group_criterion_negative = FALSE`. cost i kr = `metrics_cost_micros / 1e6`.
Verificér kolonne-navne mod `~/.claude/skills/google-ads/references/bq-schema.md` ved første
kørsel — justér query'erne hvis transfer-skemaet afviger.

## Berigelses-data (benchmark-trinnet)

**Eksakt keyword-performance** — bygges til `enrich.py`'s `exact_stats` (dict keyword→stats):
\`\`\`bash
bq query --use_legacy_sql=false --project_id=content-research-491611 '
SELECT k.ad_group_criterion_keyword_text AS keyword,
       SUM(s.metrics_impressions) AS impressions,
       SUM(s.metrics_clicks) AS klik,
       SUM(s.metrics_cost_micros)/1e6 AS cost,
       SUM(s.metrics_conversions) AS conv
FROM `content-research-491611.google_ads.ads_KeywordStats_2169223464` s
JOIN `content-research-491611.google_ads.ads_Keyword_2169223464` k
  ON s.ad_group_criterion_criterion_id = k.ad_group_criterion_criterion_id
 AND k._DATA_DATE = k._LATEST_DATE
WHERE k.ad_group_criterion_negative = FALSE
  AND s.segments_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
GROUP BY keyword'
\`\`\`

**Søgetermer** — `enrich.py`'s `search_terms` (broad-match real-world data): brug søgeterm-query
fra `seeds.md` (Kilde 2). Den returnerer allerede `soegeterm, impressions, klik, cost, conv`.

## Monitor-query (trin "opdatér laboratoriet")
Samme som eksakt keyword-performance ovenfor, men med kortere vindue (fx 14 dage) for at se
seneste bevægelser i performance for `test`/`live` keywords.

## Datamodel

### keywords.json (aktuel tilstand, kilde til sandhed)
\`\`\`json
[
  {"keyword": "online terapi", "gruppe": "online-terapi", "intent": "terapi",
   "volume": 1300, "competition": "low", "cpc_low": 12.40, "cpc_high": 28.90,
   "kilde": "bigquery", "klik": 22, "conv": 2, "cpc_faktisk": 18.10, "cpa": 199.0,
   "score": 82.0, "status": "kandidat", "noter": "", "dato": "2026-05-28"}
]
\`\`\`
- `kilde` ∈ {bigquery (bevist), estimat (net-ny)}; ægte felter (klik/conv/cpa/cpc_faktisk) kun ved bigquery
- `intent` ∈ {symptom, research, terapi, booking}
- `status` ∈ {kandidat, test, live, afvist}

### snapshots/YYYY-MM-DD.json (historik til bevægelser)
\`\`\`json
{"dato": "2026-05-28", "keywords": [
  {"keyword": "online terapi", "volume": 1300, "cpc_low": 12.40, "cpc_high": 28.90,
   "klik": 22, "cpc_faktisk": 18.10, "conv": 2, "cpa": 199.0}]}
\`\`\`
Markeds-volumen (`volume`, `cpc_*`) fra Keyword Planner-re-pull; performance fra monitor-query.
Faktisk performance-time-series duplikeres IKKE — den ligger i BigQuery og queries live;
snapshots gemmer kun volumen-historik + et performance-øjebliksbillede til bevægelses-beregning.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/keyword-research/references/bigquery-and-data-model.md
git commit -m "docs(keyword-lab): BigQuery berigelse/monitor-queries + datamodel"
```

---

## Task 9: SKILL.md — hovedinstruktioner

**Files:**
- Create: `.claude/skills/keyword-research/SKILL.md`

- [ ] **Step 1: Skriv SKILL.md**

Fil: `.claude/skills/keyword-research/SKILL.md`
```markdown
---
name: keyword-research
description: "Keyword-laboratorium for psykoterapeut.net's Google Ads. Finder billige, gode søgeord, benchmarker dem mod ægte BigQuery-performance (manuel Ads-test kun for net-nye), og følger dem over tid (markeds-volumen + performance + bevægelser). Brug når Chris vil finde nye søgeord/vinkler til en kampagne (fx online terapi, angst, stress), 'researche keywords', 'finde billige søgeord', 'opdatere laboratoriet', eller se hvordan kørende keywords bevæger sig. IKKE for ren performance-analyse af eksisterende kampagner — brug google-ads skill til det."
---

# Keyword-laboratorium for Psykoterapeut.net

Lukket løkke: **discover → benchmark (BigQuery) → handl → monitorér**. Markeds-volumen/CPC
hentes via Chris' indloggede browser (superviseret); ægte performance kommer fra BigQuery.

**Grundprincip:** BigQuery er benchmarken. Har et keyword (eller en matchende søgeterm) ægte
data → score på rigtige penge (`kilde="bigquery"`). Ellers → estimat + net-ny satsning
(`kilde="estimat"`), kandidat til manuel test.

Data ligger i repoet: `keyword-research/keywords.json`, `keyword-research/snapshots/`,
`keyword-research/online-terapi-viden.md`. Motoren ligger i `.claude/skills/keyword-research/lab/`.

## To kommandoer

### "research [emne]" — find + benchmark nye keywords
1. **Seeds:** Følg `references/seeds.md` — domæne-seeds + rigtige søgetermer (BigQuery) +
   eksisterende keywords. Klassificér hvert seed med intent (symptom/research/terapi/booking).
2. **Browser-opslag:** Følg `references/browser-flow.md` — superviseret Keyword Planner,
   lokation=Danmark, sprog=dansk, download CSV, parse med `lab/parse_planner_csv.py`.
3. **Sæt intent** på hver parset række (din semantiske vurdering).
4. **Benchmark mod BigQuery:** Hent eksakt keyword-performance + søgetermer fra
   `references/bigquery-and-data-model.md`, og berig med `lab/enrich.py` → hver række får
   `kilde` (bigquery/estimat) + ægte performance hvor den findes.
5. **Score + gem:** Kør motoren (se nedenfor) → score (BigQuery-først) → merge ind i `keywords.json`.
6. **Output delt i to:**
   - **Bevist (kilde=bigquery):** prioriteret tabel med ægte CPA/conv/CPC + direkte handling.
   - **Net-nye (kilde=estimat):** prioriteret tabel + test-plan (ad group-gruppering, match
     types — PHRASE/EXACT på commercial intent, BROAD kun med strenge negatives — og negatives).
     Chris vælger hvilke der testes manuelt i Ads-UI.
7. **Viden:** Notér vinkler/hypoteser i `online-terapi-viden.md`.

### "opdatér laboratoriet" — monitorér kørende keywords
1. Find keywords med status `test`/`live` i `keywords.json`.
2. **Markeds-volumen:** Re-pull deres volumen/CPC via Keyword Planner (browser-flow).
3. **Performance:** Kør monitor-query fra `references/bigquery-and-data-model.md`.
4. **Snapshot:** Skriv dateret snapshot (volumen + performance) med `lab/snapshot.py`.
5. **Bevægelser:** Beregn deltas mod forrige snapshot (`compute_movements`).
6. **Anbefal** pr. keyword: **skalér op** (godt + stabil/stigende), **pause/sænk bud** (høj CPA
   eller faldende), **gør til negative** (budget uden conv, eller efterspørgsel væk), **hold øje**.
7. Opdatér `status`/`noter` i `keywords.json` og notér learnings i viden-filen.

## Kør motoren

Efter du har sat `intent`, kørt BQ-queries og gemt dem som JSON, berig + score + merge:
\`\`\`bash
cd .claude/skills/keyword-research/lab
.venv/bin/python -c "
import json, datetime
from enrich import enrich_all
from score import score_keyword
from store import load_keywords, save_keywords, merge_keywords
DATA = '/Users/chris/Documents/GitHub/psykoterapeut.net/keyword-research/keywords.json'
parsed = json.load(open('/tmp/parsed_with_intent.json'))   # rækker m. intent
exact  = json.load(open('/tmp/exact_stats.json'))          # dict keyword→stats
terms  = json.load(open('/tmp/search_terms.json'))         # liste af søgeterm-rækker
rows = enrich_all(parsed, exact, terms)
for r in rows: r['score'] = score_keyword(r)
merged = merge_keywords(load_keywords(DATA), rows, gruppe='online-terapi',
                        dato=datetime.date.today().isoformat())
merged.sort(key=lambda r: r['score'], reverse=True)
save_keywords(DATA, merged)
bevist = sum(1 for r in rows if r['kilde']=='bigquery')
print(f'{len(merged)} keywords gemt — {bevist} bevist, {len(rows)-bevist} net-nye')
"
\`\`\`

## Referencer (læs ved behov)
- `references/seeds.md` — seed-generering + BQ-queries
- `references/browser-flow.md` — superviseret Keyword Planner-flow
- `references/bigquery-and-data-model.md` — berigelse/monitor-queries + datamodel

## Faste regler
- **Dansk** altid. Beløb i kr.
- **BigQuery er benchmarken** — ægte performance vægter over Keyword Planner-estimater.
- **Online terapi targeter hele DK** — by-modifiers er IKKE automatisk negative (jf. google-ads).
- Sæt aldrig keywords i drift programmatisk — lever test-planen for net-nye, Chris gør det i Ads-UI.
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
git commit -m "feat(keyword-lab): SKILL.md med BigQuery-først research + monitor"
```

---

## Task 10: Seed projekt-data + viden-fil

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
- BigQuery er benchmarken: vi stoler på ægte CPA/conv frem for Keyword Planner-estimater.

## Vinkler at teste
- **Pris/lav friktion:** "online terapi pris", "billig online terapi", "gratis første samtale online"
- **Format-fordel:** "terapi hjemmefra", "terapi over video", "fjernterapi"
- **Lidelse + online:** "online angstbehandling", "online stressbehandling"
- **Intent-stige:** prioritér booking-intent, udvid til terapi-intent.

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

## Task 11: Verifikation — fuld test-suite + skill-discovery

- [ ] **Step 1: Kør hele test-suiten**

```bash
cd .claude/skills/keyword-research/lab && .venv/bin/pytest tests/ -v
```
Expected: alle tests PASS (parse, enrich, score, store, snapshot)

- [ ] **Step 2: Verificér filstruktur**

```bash
cd /Users/chris/Documents/GitHub/psykoterapeut.net
ls .claude/skills/keyword-research/ .claude/skills/keyword-research/references/ \
   .claude/skills/keyword-research/lab/ keyword-research/
```
Expected: SKILL.md, references/ (3 filer), lab/ (5 .py + tests + pytest.ini),
keyword-research/ (keywords.json, snapshots/, online-terapi-viden.md)

- [ ] **Step 3: Smoke-test motoren end-to-end (bevist vs estimat)**

```bash
cd .claude/skills/keyword-research/lab
.venv/bin/python -c "
from parse_planner_csv import parse_planner_csv
from enrich import enrich_all
from score import score_keyword
csv = 'Keyword\tAvg. monthly searches\tCompetition\tTop of page bid (low range)\tTop of page bid (high range)\nonline terapi\t1.300\tLow\t12,40\t28,90\nny vinkel test\t90\tLow\t6,00\t11,00\n'
rows = parse_planner_csv(csv)
for r in rows: r['intent'] = 'terapi'
exact = {'online terapi': {'impressions': 540, 'klik': 22, 'cost': 398.0, 'conv': 2}}
enriched = enrich_all(rows, exact, [])
for r in enriched:
    r['score'] = score_keyword(r)
    print(r['keyword'], '→ kilde:', r['kilde'], 'score:', r['score'])
"
```
Expected: "online terapi" → kilde: bigquery (med score baseret på cpa 199 kr);
"ny vinkel test" → kilde: estimat. Begge scores mellem 0 og 100.

- [ ] **Step 4: Bed Chris verificere skill-discovery**

Bed Chris bekræfte at `keyword-research` dukker op som tilgængelig skill (projekt-skills i
`.claude/skills/` opdages af Claude Code). Hvis ikke synlig: ny session kan være nødvendig.

- [ ] **Step 5: Ingen commit** (kun verifikation)

---

## Self-review noter
- Spec-dækning: discover (Task 6,9), browser (Task 7), berigelse/BigQuery-først (Task 2,3,8),
  scoring bevist+estimat (Task 3), lagring m. kilde+perf (Task 4,10), monitorering (Task 5,8),
  bevægelser (Task 5), anbefalinger bevist vs net-ny (Task 9), datamodel (Task 8).
- Funktions-navne konsistente: `parse_planner_csv`; `matches`/`aggregate_performance`/
  `enrich_keyword`/`enrich_all`; `score_keyword`/`is_disqualified`/`INTENT_WEIGHTS`;
  `load_keywords`/`save_keywords`/`merge_keywords`; `write_snapshot`/`latest_two_snapshots`/`compute_movements`.
- Felt-navne konsistente på tværs: `kilde`, `klik`, `conv`, `cpa`, `cpc_faktisk`, `cost`, `soegeterm`.
- Browser/BigQuery/seed-trin er LLM-drevne (ikke unit-testet) — verificeret via references + smoke-test.
```
