---
name: keyword-research
description: "Keyword-laboratorium for psykoterapeut.net's Google Ads. Finder billige, gode søgeord, benchmarker dem mod ægte BigQuery-performance (manuel Ads-test kun for net-nye), og følger dem over tid (markeds-volumen + performance + bevægelser). Brug når Chris vil finde nye søgeord/vinkler til en kampagne (fx online terapi, angst, stress), 'researche keywords', 'finde billige søgeord', 'opdatere laboratoriet', eller se hvordan kørende keywords bevæger sig. IKKE for ren performance-analyse af eksisterende kampagner — brug google-ads skill til det."
---

# Keyword-laboratorium for Psykoterapeut.net

Lukket løkke: **discover → benchmark (BigQuery) → handl → monitorér**. Markeds-volumen/CPC
hentes via Chris' indloggede browser (superviseret); ægte performance kommer fra BigQuery.

**Grundprincip:** BigQuery er benchmarken. Har et keyword (eller en matchende søgeterm) ægte
data → score på rigtige penge (`kilde="bigquery"`). Ellers → estimat + net-ny satsning
(`kilde="estimat"`), kandidat til manuel test.

Data ligger i repoet: `keyword-research/keywords.json`, `keyword-research/snapshots/`,
`keyword-research/online-terapi-viden.md`. Motoren ligger i `.claude/skills/keyword-research/lab/`.

## To kommandoer

### "research [emne]" — find + benchmark nye keywords
1. **Seeds:** Følg `references/seeds.md` — domæne-seeds + rigtige søgetermer (BigQuery) +
   eksisterende keywords. Klassificér hvert seed med intent (symptom/research/terapi/booking).
2. **Browser-opslag:** Følg `references/browser-flow.md` — superviseret Keyword Planner,
   lokation=Danmark, sprog=dansk, download CSV, parse med `lab/parse_planner_csv.py`.
3. **Sæt intent** på hver parset række (din semantiske vurdering).
4. **Benchmark mod BigQuery:** Hent eksakt keyword-performance + søgetermer fra
   `references/bigquery-and-data-model.md`, og berig med `lab/enrich.py` → hver række får
   `kilde` (bigquery/estimat) + ægte performance hvor den findes.
5. **Score + gem:** Kør motoren (se nedenfor) → score (BigQuery-først) → merge ind i `keywords.json`.
6. **Output delt i to:**
   - **Bevist (kilde=bigquery):** prioriteret tabel med ægte CPA/conv/CPC + direkte handling.
   - **Net-nye (kilde=estimat):** prioriteret tabel + test-plan (ad group-gruppering, match
     types — PHRASE/EXACT på commercial intent, BROAD kun med strenge negatives — og negatives).
     Chris vælger hvilke der testes manuelt i Ads-UI.
7. **Viden:** Notér vinkler/hypoteser i `online-terapi-viden.md`.

### "opdatér laboratoriet" — monitorér kørende keywords
1. Find keywords med status `test`/`live` i `keywords.json`.
2. **Markeds-volumen:** Re-pull deres volumen/CPC via Keyword Planner (browser-flow).
3. **Performance:** Kør monitor-query fra `references/bigquery-and-data-model.md`.
4. **Snapshot:** Skriv dateret snapshot (volumen + performance) med `lab/snapshot.py`.
5. **Bevægelser:** Beregn deltas mod forrige snapshot (`compute_movements`).
6. **Anbefal** pr. keyword: **skalér op** (godt + stabil/stigende), **pause/sænk bud** (høj CPA
   eller faldende), **gør til negative** (budget uden conv, eller efterspørgsel væk), **hold øje**.
7. Opdatér `status`/`noter` i `keywords.json` og notér learnings i viden-filen.

## Kør motoren

Efter du har sat `intent`, kørt BQ-queries og gemt dem som JSON, berig + score + merge:
```bash
cd .claude/skills/keyword-research/lab
.venv/bin/python -c "
import json, datetime
from enrich import enrich_all
from score import score_keyword
from store import load_keywords, save_keywords, merge_keywords
DATA = '/Users/chris/Documents/GitHub/psykoterapeut.net/keyword-research/keywords.json'
parsed = json.load(open('/tmp/parsed_with_intent.json'))   # rækker m. intent
exact  = json.load(open('/tmp/exact_stats.json'))          # dict keyword→stats
terms  = json.load(open('/tmp/search_terms.json'))         # liste af søgeterm-rækker
rows = enrich_all(parsed, exact, terms)
for r in rows: r['score'] = score_keyword(r)
merged = merge_keywords(load_keywords(DATA), rows, gruppe='online-terapi',
                        dato=datetime.date.today().isoformat())
merged.sort(key=lambda r: r['score'], reverse=True)
save_keywords(DATA, merged)
bevist = sum(1 for r in rows if r['kilde']=='bigquery')
print(f'{len(merged)} keywords gemt — {bevist} bevist, {len(rows)-bevist} net-nye')
"
```

## Referencer (læs ved behov)
- `references/seeds.md` — seed-generering + BQ-queries
- `references/browser-flow.md` — superviseret Keyword Planner-flow
- `references/bigquery-and-data-model.md` — berigelse/monitor-queries + datamodel

## Faste regler
- **Dansk** altid. Beløb i kr.
- **BigQuery er benchmarken** — ægte performance vægter over Keyword Planner-estimater.
- **Online terapi targeter hele DK** — by-modifiers er IKKE automatisk negative (jf. google-ads).
- Sæt aldrig keywords i drift programmatisk — lever test-planen for net-nye, Chris gør det i Ads-UI.
- Browser-delen er **superviseret** — bed Chris gribe ind ved 2FA/captcha/layout.
