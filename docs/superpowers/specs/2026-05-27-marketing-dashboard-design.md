# Marketing Dashboard — Design Spec

**Dato:** 2026-05-27
**Status:** v1 — visuelt skelet med dummy-data
**Ejer:** Chris (build) · Inger Marie (bruger)

## Formål

Et dashboard hvor Chris og Inger Marie kan se marketing-data samlet (Google Ads, GA4, GSC) og bruge det som basis for planlægnings-samtaler. v1 er et **visuelt skelet** med dummy-data, så UX og æstetik kan itereres hurtigt før data-laget kobles på.

## Scope for v1

**Inkluderet:**
- 7 sektioner med fungerende layout og hardcoded fixtures
- Visuel identitet (palette, glows, glassmorphism, typografi)
- Top-nav navigation med tabs + periode-vælger
- Password-gate via middleware
- Kører lokalt (`npm run dev`)

**Bevidst IKKE inkluderet (kommer i senere faser):**
- BigQuery / GA4 / Search Console integration (fase 2)
- Persistent storage til change log og idé-bank (fase 3 — Vercel Postgres)
- AI-insights sektion
- Vercel deploy
- Auto-detect af kampagne-ændringer
- Claude-skill der logger ændringer automatisk

## Placering & stack

- **Lokation:** `/dashboard/` subfolder i `psykoterapeut.net` repoet
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Fonte:** Inter (primær) + Cardo (serif, til overskrifter)
- **`.gitignore` tilføjelser:** `dashboard/node_modules`, `dashboard/.next`, `dashboard/.env.local`

## Visuel identitet

**Mood:** Ultra-transparent crystal glass over et fullscreen vandfalds-foto. Inspireret af Apple-style premium glassmorphism — cards er næsten usynlige, så billedet danser igennem dataen.

**Baggrunds-billede:**
- Fil: `IMG_2134-rot.jpg` (vandfald, portrait orientation) — kopieres til `dashboard/public/bg/waterfall.jpg`
- Optimeres til ~280KB JPEG, max-bredde ~1100px (originalen er 2.2MB HEIC)
- CSS: `background-size: cover; background-position: center center;`
- Filter: `brightness(0.95) saturate(1.05)` — letvejs polish, ingen blur
- Fixed position, dækker hele viewport

**Scrim (over billedet, under indhold):**
- Subtil mørk gradient: `linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.22) 100%)`
- Sikrer at lyse tekster forbliver læselige i top af viewport

**Cards (crystal glass — finale værdier valgt af bruger):**
- `background: rgba(255, 255, 255, 0.02)` — næsten usynligt
- `backdrop-filter: blur(2px) saturate(1.5)`
- `border: 1px solid rgba(255, 255, 255, 0.12)`
- `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 12px 40px rgba(0, 0, 0, 0.28)`
- Border-radius: 16px

**Tekst (alt på crystal cards skal kunne læses over varieret baggrund):**
- Alle tekster har `text-shadow: 0 1px 8px rgba(0,0,0,0.6)` for kontrast
- Tal: 32px Inter semibold + tungere shadow `0 2px 22px rgba(0,0,0,0.7)`
- Primær tekstfarve: `#FFFFFF`
- Labels: `rgba(255, 255, 255, 0.82)`, 11px uppercase, letter-spacing 0.1em
- Trend-accent (↑/↓ %): `#FFD09A` (honning, varm)
- Bar-graf: `linear-gradient(180deg, rgba(255, 208, 154, 0.85), rgba(255, 208, 154, 0.2))`

**Palette tokens (Tailwind / CSS vars):**

| Token | Værdi | Brug |
|---|---|---|
| `--card-bg` | `rgba(255, 255, 255, 0.02)` | Crystal card background |
| `--card-border` | `rgba(255, 255, 255, 0.12)` | Card border |
| `--card-blur` | `blur(2px) saturate(1.5)` | Backdrop filter |
| `--accent` | `#FFD09A` | Trend tal, bar-graf, log dots |
| `--text` | `#FFFFFF` | Primær tekst |
| `--text-muted` | `rgba(255, 255, 255, 0.78)` | Sekundær tekst |
| `--text-shadow` | `0 1px 8px rgba(0,0,0,0.6)` | Standard tekst-skygge |

**Typografi:**
- Sektions-overskrifter: Cardo serif (matcher sitet)
- Body, labels, tal: Inter
- Labels: 11px, uppercase, letter-spacing 0.1em, hvid 82% opacity

**Bevidst note om brand-konsistens:** Vi forlader den lyse beige paletfra hovedsitet i dashboardet — det er en bevidst beslutning. Dashboardet er et internt værktøj med en anden æstetisk rolle (atmosfærisk, fokuserende) end den offentlige psykoterapeut.net. Hvis billedet senere skal kunne ændres pr. bruger, kan baggrunden gøres til en setting i fase 3.

## Layout & navigation

**Valgt struktur:** Top-nav med tabs (mood B fra brainstorming).

```
┌─────────────────────────────────────────────────────────────┐
│  Inger Marie  │ Oversigt Kampagner ... │ Sidste 30 dage ▾ │  ← sticky top-bar (glass)
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [section content]                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

- **Top-bar:** Sticky crystal glass, indeholder logo (Cardo), tabs, periode-vælger
- **Tabs:** Oversigt · Kampagner · Søgeord · Landingssider · Change log · Idé-bank · Eksperimenter
- **Periode-vælger:** Dummy dropdown i v1 (sidste 7d / 30d / 90d / custom)
- **Active tab:** `bg-white/18` + `text-white` + medium font-weight

## Sektioner (v1 indhold)

### 1. Oversigt (`/`)
- 4 KPI-cards i grid: Sessions, Conversions, Ad spend, CPA
- Hver KPI viser: label, værdi, trend (↑/↓ % vs. forrige periode)
- Linjegraf "Conversions over tid" (Recharts)
- Change-log-annotations som vertical markers på grafen (klik → tooltip med entry-beskrivelse)

### 2. Kampagner (`/kampagner`)
- Tabel med kolonner: kampagne, klik, conv, conv rate, spend, CPA, status
- Sorter-bart pr. kolonne (client-side)
- 5-8 fixture-kampagner

### 3. Søgeord (`/sogeord`)
- To paneler: "Top konverterende" + "Bottom wasted spend"
- Hver række: keyword, søgevolumen, klik, conv, spend

### 4. Landingssider (`/landingssider`)
- Pr. side: URL, sessions, conv rate, gennemsnitlig tid
- Visuel advarsel (gul badge) hvis conv rate < benchmark (2%)

### 5. Change log (`/change-log`)
- Vertikal tidslinje, nyeste øverst
- Hver entry: timestamp, kategori-badge (kampagne/keyword/landing/SEO/andet), titel, beskrivelse, forventet effekt, author
- Filter: kategori, dato-range
- "Tilføj entry" knap (kun visuel i v1 — gemmer ikke)

### 6. Idé-bank (`/ide-bank`)
- Kort-grid med status-emoji: 🌱 Frø · 🌿 Udfoldet · ⚗️ Test · ✅ Implementeret · ❌ Forkastet
- Hver idé-kort: titel, beskrivelse, status, forventet impact/effort, tags
- Filter på status og tags

### 7. Eksperimenter (`/eksperimenter`)
- Kort pr. eksperiment: hypotese, måles på, periode (start/slut), status
- Status-badge: Planlagt / Kører / Afsluttet
- Afsluttede eksperimenter har resultat + konklusion

## Auth

- Middleware `dashboard/middleware.ts` tjekker cookie mod `DASHBOARD_PASSWORD` env-var
- `/login` route med beige password-form (samme visuelle identitet)
- Cookie sat ved succesfuld login, gyldig i 30 dage
- Middleware redirecter alle ikke-authenticated requests til `/login`
- `.env.local` indeholder `DASHBOARD_PASSWORD=<delt-password>`

## Filstruktur

```
dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # top-nav + period selector wrapper
│   │   ├── page.tsx                # Oversigt
│   │   ├── kampagner/page.tsx
│   │   ├── sogeord/page.tsx
│   │   ├── landingssider/page.tsx
│   │   ├── change-log/page.tsx
│   │   ├── ide-bank/page.tsx
│   │   └── eksperimenter/page.tsx
│   ├── globals.css                 # Tailwind base + custom CSS vars
│   └── layout.tsx                  # root layout med GlowBackground
├── public/
│   └── bg/
│       └── waterfall.jpg           # optimeret baggrunds-billede (~280KB)
├── components/
│   ├── ui/                         # shadcn primitives (Button, Card, Badge, Table, Tabs, etc.)
│   ├── background.tsx              # fullscreen waterfall image + scrim layers
│   ├── top-nav.tsx                 # sticky top-bar med tabs
│   ├── period-selector.tsx
│   ├── kpi-card.tsx
│   ├── section-heading.tsx         # Cardo italic heading
│   ├── change-log-entry.tsx
│   ├── idea-card.tsx
│   └── experiment-card.tsx
├── lib/
│   ├── fixtures/
│   │   ├── kpis.ts
│   │   ├── campaigns.ts
│   │   ├── keywords.ts
│   │   ├── landing-pages.ts
│   │   ├── change-log.ts
│   │   ├── ideas.ts
│   │   └── experiments.ts
│   ├── types.ts                    # shared TypeScript types
│   └── utils.ts                    # cn() helper, formatters
├── middleware.ts                   # password-gate
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── package.json
├── .env.local.example
└── README.md
```

## Komponent-kontrakter

**`<Background />`** — to fixed-position layers: (1) waterfall image med `background-size: cover`, (2) mørk gradient-scrim. Ingen props.

**`<KpiCard label value trend trendDirection />`** — crystal glass card (`bg-white/2` + `backdrop-blur-[2px]`). `trend` er string ("12%"), `trendDirection` er `"up" | "down"` (begge bruger samme honning-accent farve, kun arrow-glyph ændres).

**`<TopNav />`** — læser current pathname fra `usePathname()`, viser active tab. Tabs er hardcoded liste i komponenten.

**`<PeriodSelector value onChange />`** — dropdown med 4 valg. I v1 er den controlled men ændrer ikke data (dummy).

**`<SectionHeading children />`** — Cardo serif, hvid med `text-shadow` for kontrast over billedet.

## Test/verificering for v1

Manuel test — ingen automatiserede tests for visuelt skelet:

1. `cd dashboard && npm install && npm run dev`
2. Browser åbner `localhost:3000` → redirect til `/login`
3. Indtast password → redirect tilbage til `/` (Oversigt)
4. Klik gennem alle 7 tabs — alle skal rendere uden fejl
5. Baggrunds-billede og crystal-cards virker (visual check)
6. Responsiv check ved 1280px og 1440px (ikke mobile i v1)
7. Cardo og Inter fonte loader korrekt

## Faser efter v1

**Fase 2 — Data-integration**
- BigQuery client (server-side) for Google Ads + GA4
- Search Console MCP integration
- Replace fixtures sektion-for-sektion
- Caching strategy (revalidate dagligt)

**Fase 3 — Persistent state**
- Vercel Postgres (eller Supabase) for change log + idé-bank + eksperimenter
- Forms til at oprette/redigere entries
- Auto-link change log entries til KPI-grafer

**Fase 4 — Deploy & polish**
- Vercel deploy
- Domæne-navn (fx `dashboard.psykoterapeut.net` eller separat Vercel URL)
- Inger Marie onboarding

**Fase 5 — Smart features**
- AI-insights ("hvad du bør fokusere på denne uge")
- Auto-detect kampagne-ændringer fra BigQuery snapshots
- Claude-skill der logger ændringer automatisk

## Open questions parkeret til senere faser

- Auto-detect: hvor ofte og hvilke triggers? (fase 5)
- Skal Inger Marie kunne kommentere på data, eller bare se? (fase 3 — kommentar-tråde på entries)
- Hvor ofte skal data refresh? (fase 2 — start med dagligt)
- Skal Search Console-data med fra fase 2? (sandsynligvis ja)
