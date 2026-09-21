# Google Ads-kampagne: Depression (udkast 2026-09-18)

Replikerer Angst-kampagnens struktur (den eneste der konverterer) mod landingssiden
`/terapi-mod-depression/` (ID 40079, live).

## Kampagne-indstillinger

| Felt | Værdi |
|---|---|
| Navn | Depression |
| Type | Søgning (kun Søgenetværk — fravælg Display + søgepartnere) |
| Mål | Kundeemner — conversions: Book_Gratis_Samtale + Kontakter |
| Budstrategi | Maksimér konverteringer (samme som Angst) |
| Budget | Se "Budgetloft" nedenfor — afhænger af om 1.000 kr/md gælder kampagnen eller hele kontoen |
| Geografi | Aarhus (by), "Tilstedeværelse" — som sat i Ads-udkastet |
| Sprog | Dansk |
| Endelig URL | https://psykoterapeut.net/terapi-mod-depression/ |
| Status | **LIVE 2026-09-21** (kampagne-ID 24268436073). Gruppe 1 (13 søgeord) + gruppe 2 (13 søgeord, egen RSA), 54 negative, mål: Indsend kundeformularer + Kontakter. Kontoen i alt 32 kr./dag (Angst 16 · Depression 11 · Højbjerg 5). 3 depression-søgeord pauset i Angst. Opfølgning ~2026-10-19 |

## Budgetloft: maks 1.000 kr/md (krav fra Chris 2026-09-18)

Google kan bruge op til 2x dagsbudget på en enkelt dag, men aldrig mere end dagsbudget × 30,4
på en måned. Loftet styres derfor via dagsbudgettet: **sum af dagsbudgetter ≤ 32 kr** ⇒ maks ~973 kr/md.

Forbrug sidste 30 dage (BigQuery): Angst 637 kr · Psykoterapi i Højbjerg 383 kr · Online Terapi
438 kr (nu pauset) · Stress 0 (pauset). De to aktive kampagner bruger altså allerede ~1.020 kr/md.

**Scenarie A — 1.000 kr/md gælder HELE kontoen (anbefalet fordeling):**

| Kampagne | Dagsbudget | Maks/md | Begrundelse |
|---|---|---|---|
| Angst | 16 kr | ~486 kr | Eneste kampagne med dokumenterede conversions |
| Depression (ny) | 11 kr | ~334 kr | Nok til ~25-30 klik/md ved CPC ~11 kr |
| Psykoterapi i Højbjerg | 5 kr | ~152 kr | 0 conv. i 90-dages-tjekket i maj — skæres ned (verificér i Ads-UI først) |
| Online Terapi / Stress | pauset | 0 | Forbliver pauset |
| **I alt** | **32 kr** | **~973 kr** | |

OPDATERET efter Keyword Planner-tjek: gruppe 2 (symptom) skal være AKTIV fra start — den varme intent alene er for lille i Aarhus til at bruge budgettet (se nedenfor).

**Scenarie B — 1.000 kr/md gælder KUN Depression:** dagsbudget 32 kr, begge annoncegrupper aktive.

## Keyword Planner-tjek 2026-09-18 (Danmark, dansk, sep. 2025 – aug. 2026)

487 forslag hentet; de relevante er lagt i `keywords.json` (gruppe `depression`). Aarhus udgør
ca. 12 % af landets søgninger (Googles rækkevidde 718.000), så lokal volumen ≈ landstal × 0,12.

**Hovedfund:** Folk søger SYMPTOMET, ikke behandlingen. Varm intent er ca. 1.100 søgninger/md i
hele DK ≈ 130/md i Aarhus ≈ en håndfuld klik. Gruppe 1 alene kan IKKE bruge 11 kr./dag i Aarhus.
Symptom-klyngen er ca. 12.000/md i DK ≈ 1.400/md i Aarhus, og billigere (top-bud 6–13 kr.).
⇒ Gruppe 2 skal være AKTIV fra start, ellers får kampagnen næsten ingen trafik.

## Annoncegruppe 1: DEPRESSION TERAPI + BEHANDLING (varm intent) — ligger i Ads-udkastet

| Søgeord | Match | Søgn./md DK | Konkurrence | Top-bud |
|---|---|---|---|---|
| depression behandling | sætning | 590 | Middel | 6,50–17,16 |
| behandling af depression | sætning | 590 (samme klynge) | Middel | 6,50–17,16 |
| hjælp til depression | sætning | 90 | Høj | 6,04–18,81 |
| terapi mod depression | sætning | 10 | Høj | 9,42–17,07 |
| depression terapi / samtaleterapi depression / psykoterapi depression / depression uden medicin | sætning | <10 | – | – |
| 4 × Aarhus-varianter | eksakt | <10 | – | – |

De sidste to rækker koster intet at have med (Google viser dem bare sjældent), men giver næsten ingen trafik.

**Tilføj:** `"depression hjælp"` (40/md, top-bud 15,68). Sætningsmatch på "depression behandling" fanger også
"svær depression behandling" (110/md).

**Fravalgt — `"psykolog depression"` (170/md):** Chris 2026-09-18: "psykolog"-søgeord bruges ikke — dårlige erfaringer. `psykolog` lægges ind som negativt søgeord.

## Annoncegruppe 2: DEPRESSION SYMPTOM (volumen) — oprettes efter udgivelse, AKTIV

```
"depression symptomer"
"symptomer på depression"
"tegn på depression"
"svær depression"
"kronisk depression"
"moderat depression"
"tilbagevendende depression"
"angst og depression"
"stress og depression"
"udbrændthed"
"symptomer på udbrændthed"
"udbrændt"
"udmattelsesdepression"
```

Volumen DK/md: depression symptomer 2.400 · symptomer på depression 1.000 · udbrændthed 880 ·
symptomer på udbrændthed 390 · kronisk 320 · svær 260 · moderat 210 · angst og depression 210 ·
udbrændt 170 · stress og depression 110 · tilbagevendende 90 · udmattelsesdepression 40.

Droppet fra første udkast (ingen volumen i Planner): "føler mig tom indeni", "let depression",
"belastningsdepression", "har jeg en depression".

**Bevidst IKKE med:**
- `depression` alene (6.600/md) — for bredt; trækker test/medicin/diagnose-støj. Kan testes senere som sætningsmatch.
- `vinterdepression` (590/md, stigende nu) — folk leder efter lamper og D-vitamin. Kun hvis Inger Marie vil have dem.
- `fødselsdepression` (1.000/md) — spørg Inger Marie, om hun arbejder med det. I så fald egen annoncegruppe + egen tekst.

## Negative keywords (kampagne-niveau, ét pr. linje)

```
test
gratis
medicin
piller
antidepressiv
lykkepiller
ssri
psykolog
psykologer
psykologhjælp
psykiater
psykiatere
psykiatri
psykiatrien
psykiatrisk
psykiatrifonden
skejby
linjen
linien
hotline
telefonrådgivning
depressionsforeningen
forening
selvmord
selvmordstanker
hypnose
eft
børn
teenager
hund
icd
diagnose
wiki
what
how
depressed
youtube
podcast
bog
internetpsykiatrien
bipolar
manio
manisk
psykose
psykotisk
ect
lampe
lyslampe
lysterapi
vitamin
autisme
mdi
afdeling
årsag
```

("ydernummer"/"henvisning" er IKKE negative — Inger Marie har ydernumre.)

## Flyt ud af Angst-kampagnen

Disse tre ligger i dag i Angst og bør pauses dér når Depression går live (undgå intern konkurrence):
`behandling for depression`, `hjælp depression`, `hjælp til depression og angst`

## Responsiv søgeannonce — gruppe 1

Overskrifter (maks 30 tegn):
1. Terapi mod depression i Aarhus
2. Hjælp til depression
3. Psykoterapeut MPF i Højbjerg
4. Book en gratis samtale
5. Gratis og uforpligtende møde
6. Samtaleterapi ved depression
7. Helhedsorienteret terapi
8. Når sindet føles mørkt
9. Bliv set og hørt
10. Find dig selv igen
11. Forstå rødderne til det svære
12. Krop og sind hænger sammen
13. Erfaren psykoterapeut
14. Fortroligt og individuelt
15. Ring 29 93 01 10

Beskrivelser (maks 90 tegn):
1. Kæmper du med depression? Få et trygt rum og et forløb, der tager afsæt i det, du mærker.
2. Psykoterapeut MPF Inger Marie Gravesen i Højbjerg. Book en gratis, uforpligtende samtale.
3. Helhedsorienteret terapi, hvor både krop, tanker og følelser får plads. Også online.
4. Du behøver ikke stå alene med det. Tag det første skridt, og ring eller book i dag.

Sti: `psykoterapeut.net/depression/aarhus`

## Responsiv søgeannonce — gruppe 2 (symptom)

Overskrifter:
1. Kender du tegnene?
2. Tegn på depression
3. Træt, tom og uden energi?
4. Tal med en psykoterapeut
5. Hjælp til depression i Aarhus
6. Book en gratis samtale
7. Psykoterapeut MPF i Højbjerg
8. Du behøver ikke stå alene
9. Terapi i trygge rammer
10. Gratis og uforpligtende møde

Beskrivelser:
1. Tristhed, træthed og tomhed kan være tegn på depression. Læs om tegnene, og få hjælp.
2. Få en gratis, uforpligtende samtale med psykoterapeut MPF Inger Marie Gravesen i Højbjerg.
3. Et roligt sted at begynde, når hverdagen føles tung. Fysisk i Aarhus eller online.

## Assets

### Billeder (tjekket i Ads 2026-09-18, periode 1. aug – 6. sep)

- **Lagt ind i Depression-udkastet 2026-09-18:** 5 beskæringer af 3 billeder fra aktivsamlingen — IMG_1076 (portræt, bred + kvadratisk), IngerMarie2.jpg (badebro, bred + kvadratisk), Nature_therapi.jpg (skovsti, kvadratisk). Sprunget over: det afviste portræt ("Ikke kvalificeret") og logoerne.
- Angst har 6 godkendte billeder (tilføjet 3. okt. 2025): portræt af Inger Marie (447 eksp., 23 klik, CTR 5,15 %), badebro ved sø ×2 (137/120 eksp., 1 klik), portræt med hat ×2, skovsti (52 eksp., 1 klik). Portrættet tager stort set alle klik.
- Højbjerg har 7 (portrætter), Stress har også portrætter. Online Terapi: fugle-logoet er AFVIST som billede (tekst/grafik-overlejring) — logo må kun bruges som "virksomhedslogo", ikke som billede.
- Virksomhedsnavnet "Inger Marie Gravesen" er afvist i Angst (fremtrædende placering af navn).
- Vej: annonce-editoren → Billeder → "Tilføj billeder" → fanen **Aktivsamling** (der er to faner med det navn i DOM'en — brug den i dialogen "Føj billeder til din kampagne"). Google laver selv bred + kvadratisk beskæring.

- Sitelinks: Book gratis samtale (/book-samtale/), Praktiske oplysninger, Terapi mod angst, Terapi mod stress
- Infoudvidelser: Gratis første samtale · Psykoterapeut MPF · Fortroligt · Fysisk eller online
- Opkald: 29 93 01 10
- Logo: `google-ads-assets/logo-icon-square-1200.png`

## Policy-tjek

Ingen "kurér/fjern/stop depression"-løfter, ingen før/efter. Selvmordsrelaterede termer er negative.
