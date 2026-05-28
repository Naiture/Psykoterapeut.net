# Superviseret Keyword Planner-flow (Claude in Chrome)

Google Ads API'et er blokeret, så markeds-volumen/CPC hentes via Chris' indloggede browser.
**Superviseret:** udfør flowet, men bed Chris gribe ind ved 2FA, captcha eller layout-ændringer.
Bruges til net-nye keywords + til at re-pulle markeds-volumen ved "opdatér laboratoriet".

## Forudsætninger
- Chris er logget ind på Google Ads (konto 216-922-3464) i Chrome
- Claude in Chrome MCP er forbundet (`mcp__claude-in-chrome__*`). Hvis ikke: bed Chris
  åbne extension-forbindelsen.

## Skridt
1. Naviger til Keyword Planner: `https://ads.google.com/aw/keywordplanner/home`
2. Vælg **"Find nye søgeord" / "Discover new keywords"**
3. Indsæt seed-listen (kommasepareret eller én pr. linje)
4. Sæt indstillinger: **Lokation: Danmark**, **Sprog: Dansk**, **Søgenetværk: Google**
5. Kør søgningen. Vent på resultat-tabellen.
6. Klik **"Download søgeordsforslag" / "Download keyword ideas"** → vælg **.csv**
7. Filen lander i `~/Downloads/`. Bekræft filnavn (typisk `Keyword Stats *.csv`).

## Hvorfor CSV-download frem for DOM-scraping
Tabellen er stor og lazy-loaded; CSV'en indeholder ALLE rækker i ét format og er robust
mod UI-ændringer. Parse den med `lab/parse_planner_csv.py`.

## Parse den downloadede fil
```bash
cd .claude/skills/keyword-research/lab
.venv/bin/python -c "
import sys, json
from parse_planner_csv import parse_planner_csv
raw = open(sys.argv[1], 'rb').read()
print(json.dumps(parse_planner_csv(raw), ensure_ascii=False, indent=2))
" ~/Downloads/'Keyword Stats 2026-05-28 at ...csv'
```

## Hvis formatet afviger
Keyword Planner-CSV er ofte UTF-16 tab-separeret med metadata-linjer øverst — parseren
håndterer det. Hvis kolonnerne ikke genkendes: åbn header-linjen og udvid alias-listerne i
`parse_planner_csv.py` (`_*_ALIASES`) med de faktiske kolonnenavne.
