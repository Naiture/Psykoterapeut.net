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
