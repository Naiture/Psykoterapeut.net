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
