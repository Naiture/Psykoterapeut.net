# Keyword Research-skill — Design

**Dato:** 2026-05-28
**Status:** Godkendt design, klar til implementeringsplan
**Første mål:** Søgeord + vinkler til Online Terapi-kampagnen

## Formål

En genbrugelig skill der finder gode, billige søgeord til Inger Maries Google Ads-kampagner.
Fordi Google Ads API'et (developer token) er afvist — og Keyword Planner-API'et dermed er
blokeret (`get_keyword_ideas` MCP returnerer `invalid_grant`) — henter skillen volumen/CPC/
konkurrence ved at **styre Chris' indloggede browser** i Keyword Planner via Claude in Chrome.

Researchede søgeord og akkumuleret viden gemmes som **filer i repoet**, så den bygger en
voksende videnbase om hvilke søgeord der virker, er for dyre, eller er afvist — og hvorfor.

## Scope

**I scope (research-skill):**
- Seed-generering fra domæne-viden + rigtige søgetermer + eksisterende keywords
- Browser-drevet (superviseret) opslag i Keyword Planner → CSV-download → parse
- "Billig + god"-scoring af keywords
- Lagring af keywords + viden i `keyword-research/`
- Prioriteret shortlist + test-plan (ad groups, match types, negatives) som output

**Ikke i scope (bevidst fravalgt):**
- Et fuldt "keyword-laboratorium" med automatisk performance-tracking over tid
  (datamodellen er dog struktureret så det kan bygges ovenpå senere)
- At sætte keywords i drift programmatisk — sker manuelt i Ads-UI (LPA-pluginet rører
  ikke kampagner)
- Løbende analyse af kørte keywords — det dækkes af den eksisterende `google-ads` skill
  + dashboardet (`/sogeord`, `/eksperimenter`)

## Arkitektur & workflow

Skillen hedder `keyword-research` og virker for ethvert behandlingsområde/kampagne.
Første kørsel targeter online terapi.

### 1. Seed-generering
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

Superviseret betyder: Claude udfører flowet, men Chris kigger med og griber ind ved 2FA,
captcha eller layout-ændringer i Google Ads-UI'et.

### 3. Scoring — "billig + god"
Gennemsigtig score pr. keyword, der kombinerer:
- **Høj volumen** (avg. månedlige søgninger)
- **Lav CPC** (top-of-page bid low/high som proxy)
- **Lav/mellem konkurrence**
- **Høj intent-fit** (terapi-/booking-intent vægter højere end symptom-søgning)

Bruger `google-ads` domæne-viden til at:
- Ekskludere disqualifiers: "med henvisning", "ydernummer", psykiater, børn, misbrug, akut/selvmord
- Markere national vs. lokal relevans: for online terapi er by-modifiers (fx "psykolog horsens")
  **ikke** automatisk negative — hele DK er potentielle online-klienter

### 4. Lagring (`keyword-research/`)
- **`keywords.json`** — én række pr. keyword:
  `keyword, gruppe, intent, volumen, konkurrence, cpc_low, cpc_high, score, status, noter, dato`
  - `status` ∈ {`kandidat`, `test`, `live`, `afvist`}
  - Struktureret så det senere kan JOIN'es mod faktisk performance i BigQuery `ads_KeywordStats_*`
- **`online-terapi-viden.md`** — vinkler, hypoteser, learnings, og *hvorfor* keywords blev afvist.
  Akkumuleres over tid, git-versioneret. Det er her "den ved alt om dem".

### 5. Output
Prioriteret tabel af top-kandidater + test-plan:
- Forslag til ad group-gruppering
- Anbefalede match types (PHRASE/EXACT på commercial intent, BROAD kun med strenge negatives)
- Negative keyword-kandidater

Chris tager test-planen manuelt ind i Google Ads-UI.

## Datakilder & teknik (reference)

| Felt | Værdi |
|---|---|
| GCP Project | `content-research-491611` |
| BQ Dataset | `google_ads` (EU) |
| Google Ads kunde-ID | `2169223464` |
| Søgeterm-view | `ads_SearchQueryStats_2169223464` |
| Keyword-view | `ads_Keyword_2169223464` (filtrér `ad_group_criterion_negative = FALSE`) |
| Keyword-performance | `ads_KeywordStats_2169223464` (til fremtidig JOIN) |
| Browser | Claude in Chrome (Chris indlogget på Google Ads) |
| Keyword Planner geo | Danmark; sprog dansk |

## Fremtidig udvidelse (ikke nu, men muliggjort)
Fordi `keywords.json` har `status` + `keyword`, kan en senere kørsel JOIN'e mod
`ads_KeywordStats_*` og vise hvordan kørte keywords faktisk performede (CPC, CPA, conv).
Det er kimen til "keyword-laboratoriet" hvis Chris vil bygge det senere.
