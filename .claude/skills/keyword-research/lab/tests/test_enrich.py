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
