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
