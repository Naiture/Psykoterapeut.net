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
