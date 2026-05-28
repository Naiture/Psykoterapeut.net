# BigQuery — berigelse, monitorering + datamodel

Filtrér ALTID `ad_group_criterion_negative = FALSE`. cost i kr = `metrics_cost_micros / 1e6`.
Verificér kolonne-navne mod `~/.claude/skills/google-ads/references/bq-schema.md` ved første
kørsel — justér query'erne hvis transfer-skemaet afviger.

## Berigelses-data (benchmark-trinnet)

**Eksakt keyword-performance** — bygges til `enrich.py`'s `exact_stats` (dict keyword→stats):
```bash
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
```

**Søgetermer** — `enrich.py`'s `search_terms` (broad-match real-world data): brug søgeterm-query
fra `seeds.md` (Kilde 2). Den returnerer allerede `soegeterm, impressions, klik, cost, conv`.

## Monitor-query (trin "opdatér laboratoriet")
Samme som eksakt keyword-performance ovenfor, men med kortere vindue (fx 14 dage) for at se
seneste bevægelser i performance for `test`/`live` keywords.

## Datamodel

### keywords.json (aktuel tilstand, kilde til sandhed)
```json
[
  {"keyword": "online terapi", "gruppe": "online-terapi", "intent": "terapi",
   "volume": 1300, "competition": "low", "cpc_low": 12.40, "cpc_high": 28.90,
   "kilde": "bigquery", "klik": 22, "conv": 2, "cpc_faktisk": 18.10, "cpa": 199.0,
   "score": 82.0, "status": "kandidat", "noter": "", "dato": "2026-05-28"}
]
```
- `kilde` ∈ {bigquery (bevist), estimat (net-ny)}; ægte felter (klik/conv/cpa/cpc_faktisk) kun ved bigquery
- `intent` ∈ {symptom, research, terapi, booking}
- `status` ∈ {kandidat, test, live, afvist}

### snapshots/YYYY-MM-DD.json (historik til bevægelser)
```json
{"dato": "2026-05-28", "keywords": [
  {"keyword": "online terapi", "volume": 1300, "cpc_low": 12.40, "cpc_high": 28.90,
   "klik": 22, "cpc_faktisk": 18.10, "conv": 2, "cpa": 199.0}]}
```
Markeds-volumen (`volume`, `cpc_*`) fra Keyword Planner-re-pull; performance fra monitor-query.
Faktisk performance-time-series duplikeres IKKE — den ligger i BigQuery og queries live;
snapshots gemmer kun volumen-historik + et performance-øjebliksbillede til bevægelses-beregning.
