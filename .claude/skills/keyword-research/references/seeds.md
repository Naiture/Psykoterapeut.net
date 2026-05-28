# Seed-generering

Saml seeds fra tre kilder og gruppér efter intent før Keyword Planner-opslag.

## Intent-grupper (lav→høj købsintent)
1. **symptom** — "kan ikke sove", "føler mig trist", "konstant bekymret"
2. **research** — "hvad er angst", "hjælp mod stress", "hvordan virker terapi"
3. **terapi** — "terapi mod angst", "online psykoterapeut", "samtaleterapi"
4. **booking** — "book online terapi", "online terapi pris", "tid hos terapeut online"

## Kilde 1: Domæne-seeds (online terapi)
online terapi, online psykolog, online psykoterapeut, terapi over video,
videoterapi, terapi hjemmefra, fjernterapi, online samtaleterapi,
online angstbehandling, online stressbehandling, online depression terapi,
online parterapi, terapi online danmark.

Tilpas seed-listen til kampagnens emne (fx angst, stress, traumer) ved nye kørsler.

## Kilde 2: Rigtige søgetermer fra BigQuery
Hent faktiske søgninger der har trigget kontoen — ægte dansk sprogbrug, og samtidig grundlag
for berigelse i benchmark-trinnet:

```bash
bq query --use_legacy_sql=false --project_id=content-research-491611 '
SELECT search_term_view_search_term AS soegeterm,
       SUM(metrics_impressions) AS impressions,
       SUM(metrics_clicks) AS klik,
       SUM(metrics_cost_micros)/1e6 AS cost,
       SUM(metrics_conversions) AS conv
FROM `content-research-491611.google_ads.ads_SearchQueryStats_2169223464`
WHERE segments_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
GROUP BY soegeterm
ORDER BY impressions DESC
LIMIT 500'
```

Gem resultatet som JSON (`soegeterm, impressions, klik, cost, conv`) — det bruges direkte af
`enrich.py` til at benchmarke kandidater.

## Kilde 3: Eksisterende keywords
```bash
bq query --use_legacy_sql=false --project_id=content-research-491611 '
SELECT ad_group_criterion_keyword_text AS keyword,
       ad_group_criterion_keyword_match_type AS match_type
FROM `content-research-491611.google_ads.ads_Keyword_2169223464`
WHERE _DATA_DATE = _LATEST_DATE
  AND ad_group_criterion_negative = FALSE'
```

Brug til at undgå dubletter og se hvilke vinkler der allerede køres.

## Output af seed-trinnet
En dedupliceret seed-liste (typisk 15-40 seeds) klar til Keyword Planner.
Klassificér hvert seed med en intent-label — den bruges senere i scoringen.
