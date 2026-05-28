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
