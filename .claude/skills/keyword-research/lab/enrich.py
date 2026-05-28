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
