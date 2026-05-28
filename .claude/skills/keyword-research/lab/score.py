"""BigQuery-først scoring: bevist (ægte data) vs estimat (Keyword Planner). 0-100."""

# OBS: substring-match — fx 'barn' rammer også 'barndomstraume'
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
