# Keyword-laboratorium — Design

**Dato:** 2026-05-28
**Status:** Godkendt design, klar til implementeringsplan
**Første mål:** Søgeord + vinkler til Online Terapi-kampagnen

## Formål

En genbrugelig skill der finder gode, billige søgeord til Inger Maries Google Ads-kampagner —
og følger dem som et **lukket laboratorium**: discover → test → monitorér → anbefal.

Fordi Google Ads API'et (developer token) er afvist — og Keyword Planner-API'et dermed er
blokeret (`get_keyword_ideas` MCP returnerer `invalid_grant`) — henter skillen volumen/CPC/
konkurrence ved at **styre Chris' indloggede browser** i Keyword Planner via Claude in Chrome
(superviseret).

Researchede søgeord, daterede snapshots og akkumuleret viden gemmes som **filer i repoet**,
så laboratoriet bygger en voksende videnbase om hvilke søgeord der virker, er for dyre, eller
er afvist — og hvordan både markeds-efterspørgsel og faktisk performance bevæger sig over tid.

## Grundprincip: BigQuery er benchmarken

Al faktisk Google Ads-performance ligger allerede i BigQuery. Det er sandheden — hvad vi
faktisk har betalt og konverteret — og det vægter højere end Keyword Planners *estimater*.

- **Har et keyword (eller en matchende søgeterm) data i BigQuery** → vi benchmarker på ægte
  CPA/conv/CPC. Ingen manuel test nødvendig; vi *ved* om det er billigt + godt.
- **Net-nyt keyword uden data** → scores på Keyword Planner-estimat og markeres som
  "net-ny satsning". Kun disse er kandidater til **manuel** test i Ads-UI.

Broad match betyder at `ads_SearchQueryStats` indeholder masser af rigtige søgninger vi ikke
engang byder på — guld til at benchmarke kandidat-keywords uden at røre kampagnen.

## Laboratoriets løkke

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ 1. DISCOVER  │ ──► │ 2. BENCHMARK │ ──► │ 3. HANDL      │ ──► │ 4. MONITORÉR │
  │  seeds +     │     │  berig mod    │     │ bevist:skalér/│     │  volumen +   │
  │  Keyword Pl. │     │  BigQuery     │     │ pause/negative│     │  performance │
  │  (net-nye)   │     │  + scoring    │     │ net-ny:test   │     │  over tid    │
  └──────────────┘     └──────────────┘     └──────┬───────┘     └──────┬───────┘
        ▲                                          │                    │
        └──────────  ny research-runde  ◄──────────┴────────────────────┘
```

Bevist (har BigQuery-data) → direkte anbefaling. Net-ny (kun estimat) → valgfri manuel test
i Ads-UI, hvorefter den får data og indgår i benchmark ved næste kørsel.

## Scope

**I scope (fuldt laboratorium):**
- Seed-generering fra domæne-viden + rigtige søgetermer + eksisterende keywords
- Browser-drevet (superviseret) opslag i Keyword Planner → CSV-download → parse
- **Berigelse mod BigQuery:** match hvert kandidat-keyword mod ægte performance
  (eksakt keyword i `ads_KeywordStats` + matchende søgetermer i `ads_SearchQueryStats`)
- **BigQuery-først "billig + god"-scoring:** bevist score på ægte CPA/conv/CPC når data findes,
  ellers estimat-score fra Keyword Planner + flag som "net-ny satsning"
- Lagring af keywords + daterede snapshots + viden i `keyword-research/`
- Output delt i **bevist** (direkte anbefaling) vs **net-ny** (valgfri manuel test-plan:
  ad groups, match types, negatives)
- **Monitorering** af keywords vi kører på:
  - Markeds-søgevolumen fra Keyword Planner over tid (browser, superviseret)
  - Faktisk annonce-performance fra BigQuery (impressions, klik, CPC, conv, CPA)
  - Beregning af **bevægelser** (denne periode vs. forrige) for både volumen og performance
- **Anbefalinger** baseret på bevægelser: skalér op, sæt på pause, gør til negative

**Ikke i scope (bevidst fravalgt nu, men muliggjort):**
- At sætte keywords i drift programmatisk — sker manuelt i Ads-UI (LPA-pluginet rører
  ikke kampagner). Laboratoriet leverer test-planen for **net-nye** keywords og registrerer
  status. For keywords der allerede har BigQuery-data er manuel test unødvendig.
- Planlagt/automatisk kørsel — kører **on-demand** nu ("opdatér laboratoriet"). Datamodellen
  gemmer daterede snapshots, så en planlagt kørsel (cron/`schedule`) kan tilføjes senere uden
  omskrivning. Browser-delen er superviseret, så fuld automatik kræver alligevel Chris med.
- Visualisering i dashboardet — data ligger struktureret, så `/sogeord` eller en ny side
  senere kan læse `keyword-research/`-filerne.

## Arkitektur & workflow

Skillen hedder `keyword-research` og virker for ethvert behandlingsområde/kampagne.
Første kørsel targeter online terapi. To hovedkommandoer:

- **"research [emne]"** — kør trin 1 (discover + scoring) og opdatér kandidat-listen
- **"opdatér laboratoriet"** — kør trin 3 (monitorér) + trin 4 (anbefal) for test/live keywords

### 1. Seed-generering (discover)
Saml seeds fra tre kilder, grupperet efter intent (symptom → research → terapi-søgning → booking):
- **Domæne-viden** om online terapi: synonymer, intent-varianter, dansk frasering
- **Rigtige søgetermer** fra BigQuery `ads_SearchQueryStats_2169223464` — faktiske søgninger
  der har trigget kontoen (de mest værdifulde seeds, fordi det er ægte dansk sprogbrug)
- **Eksisterende keywords** fra `ads_Keyword_2169223464` (filtreret `ad_group_criterion_negative = FALSE`)

### 2. Browser-opslag (superviseret)
Claude in Chrome styrer Chris' indloggede Google Ads → Keyword Planner:
- Åbn "Find nye søgeord" / "Discover new keywords"
- Sæt **lokation = Danmark**, **sprog = dansk**
- Indtast seeds
- **Download resultatet som CSV** (robust mod layout-ændringer — undgår DOM-scraping af tabellen)
- Parse CSV lokalt

Superviseret = Claude udfører flowet, Chris kigger med og griber ind ved 2FA, captcha eller
layout-ændringer i Google Ads-UI'et.

### 2b. Berigelse mod BigQuery
For hvert kandidat-keyword, hent ægte performance fra BigQuery:
- **Eksakt match** i `ads_KeywordStats_2169223464` (hvis vi byder på det)
- **Matchende søgetermer** i `ads_SearchQueryStats_2169223464` — en søgeterm matcher hvis alle
  keyword'ets ord optræder i søgetermen; aggregér deres impressions/klik/cost/conv

Sæt `kilde = "bigquery"` + ægte felter (klik, conv, cpa, cpc_faktisk) hvis data findes,
ellers `kilde = "estimat"` (net-ny satsning).

### 3. Scoring — BigQuery-først "billig + god"
Gennemsigtig score 0-100 pr. keyword. **Bevist score** (når BigQuery-data findes) vægter ægte
økonomi; **estimat-score** (net-ny) bruger Keyword Planner.

- **Bevist** (`kilde = "bigquery"`): ægte CPA (konverterer billigt = kongen), ægte CPC,
  ægte efterspørgsel (klik). Klik uden conv → lav score (negative-kandidat).
- **Estimat** (`kilde = "estimat"`): Keyword Planner-volumen + CPC-interval + konkurrence + intent.

Begge bruger `google-ads` domæne-viden til at:
- Ekskludere disqualifiers: "med henvisning", "ydernummer", psykiater, børn, misbrug, akut/selvmord
- Markere national vs. lokal relevans: for online terapi er by-modifiers (fx "psykolog horsens")
  **ikke** automatisk negative — hele DK er potentielle online-klienter

### 4. Monitorering (lukker løkken)
For keywords med status `test` eller `live`:

**a) Markeds-søgevolumen (browser, superviseret)**
Re-pull søgevolumen + CPC fra Keyword Planner for de aktive keywords. Gem som dateret snapshot.

**b) Faktisk performance (BigQuery, automatisk)**
Query `ads_KeywordStats_2169223464` JOIN `ads_Keyword_2169223464`
(filtrér `ad_group_criterion_negative = FALSE`, `_DATA_DATE = _LATEST_DATE`):
impressions, klik, CPC, conv, CPA. cost i kr = `metrics_cost_micros / 1e6`.

**c) Bevægelser**
Sammenlign nyeste snapshot mod forrige (volumen) og denne periode mod forrige (performance):
- Stiger/falder markeds-efterspørgslen?
- Stiger/falder CPC, conv, CPA?
- Flag pludselige skift.

### 5. Anbefalinger (output)
**Efter research + benchmark (trin 1-3):** output delt i to:
- **Bevist (BigQuery-data):** prioriteret tabel med ægte CPA/conv/CPC + direkte handling
  (skalér op, hold, pause, gør til negative). Ingen manuel test nødvendig.
- **Net-nye satsninger (kun estimat):** prioriteret tabel + test-plan (ad group-gruppering,
  match types — PHRASE/EXACT på commercial intent, BROAD kun med strenge negatives —
  og negative keyword-kandidater). Chris vælger hvilke der testes manuelt i Ads-UI.

**Efter monitorering (trin 4):** handlings-anbefalinger pr. aktivt keyword:
- **Skalér op** — performer godt + stabil/stigende efterspørgsel
- **Sæt på pause / sænk bud** — høj CPA eller faldende performance
- **Gør til negative** — bruger budget uden konvertering, eller efterspørgsel forsvundet
- **Hold øje** — for tidligt at konkludere

## Datamodel & lagring (`keyword-research/`)

- **`keywords.json`** — aktuel tilstand pr. keyword (kilde til sandhed):
  `keyword, gruppe, intent, volumen, konkurrence, cpc_low, cpc_high, score, kilde, status, noter, dato`
  + ægte performance når `kilde = "bigquery"`: `klik, conv, cpa, cpc_faktisk`
  - `kilde` ∈ {`bigquery` (bevist), `estimat` (net-ny)}
  - `status` ∈ {`kandidat`, `test`, `live`, `afvist`}
- **`snapshots/YYYY-MM-DD.json`** — dateret snapshot pr. monitorerings-kørsel:
  søgevolumen + CPC pr. aktivt keyword (markeds-data fra Keyword Planner) + nøgle-performance
  (fra BigQuery på det tidspunkt). Grundlaget for at beregne bevægelser. Git-versioneret =
  fuld historik gratis.
- **`online-terapi-viden.md`** — vinkler, hypoteser, learnings, og *hvorfor* keywords blev
  afvist eller skaleret. Akkumuleres over tid. Det er her "den ved alt om dem".

Faktisk performance-time-series duplikeres **ikke** ind i filer — den ligger allerede i
BigQuery `ads_KeywordStats_*` og queries live. Filerne gemmer kun det Keyword Planner ikke
selv husker (markeds-volumen-historik) + den menneskelige viden.

## Datakilder & teknik (reference)

| Felt | Værdi |
|---|---|
| GCP Project | `content-research-491611` |
| BQ Dataset | `google_ads` (EU) |
| Google Ads kunde-ID | `2169223464` |
| Søgeterm-view | `ads_SearchQueryStats_2169223464` |
| Keyword-view | `ads_Keyword_2169223464` (filtrér `ad_group_criterion_negative = FALSE`) |
| Keyword-performance | `ads_KeywordStats_2169223464` (JOIN på keyword-id, `_DATA_DATE = _LATEST_DATE`) |
| Browser | Claude in Chrome (Chris indlogget på Google Ads), superviseret |
| Keyword Planner geo | Danmark; sprog dansk |
| cost → kr | `metrics_cost_micros / 1e6` |

## Fremtidig udvidelse (ikke nu, men muliggjort)
- **Planlagt kørsel:** daterede snapshots + on-demand-kommando gør at en `schedule`/cron-kørsel
  kan tilføjes senere. BigQuery-delen kan køre fuldt automatisk; Keyword Planner-delen forbliver
  semi-automatisk pga. supervision.
- **Dashboard-visualisering:** `keyword-research/`-filerne kan læses af `/sogeord` eller en ny
  laboratorie-side i dashboardet, så bevægelser vises som grafer.
