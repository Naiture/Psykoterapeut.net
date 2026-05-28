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
