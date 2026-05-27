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

**Palette (valgt mood: Light Beige, brand-aligned):**

| Token | Værdi | Brug |
|---|---|---|
| `--bg` | `#F4EBE4` | Side-baggrund |
| `--glow-1` | `rgba(116, 66, 69, 0.18)` | Top-left radial glow (brun) |
| `--glow-2` | `rgba(212, 165, 116, 0.28)` | Bottom-right radial glow (honning) |
| `--card-bg` | `rgba(255, 255, 255, 0.55)` | Glassmorphism cards |
| `--card-border` | `rgba(116, 66, 69, 0.08)` | Card border |
| `--card-shadow` | `0 4px 24px rgba(116, 66, 69, 0.06)` | Card shadow |
| `--primary` | `#744245` | Primær (brand) |
| `--accent` | `#B8732E` | Honning-accent (trends, highlights) |
| `--text` | `#2A1814` | Hovedtekst |
| `--text-muted` | `#888` | Sekundær tekst |

**Glow-baggrund:**
- Fixed-position layer bag alt indhold
- To radial gradients (top-left brun, bottom-right honning)
- 40-50px blur
- Implementeres som `<GlowBackground />` komponent i root layout

**Cards (glassmorphism):**
- `bg-white/55` + `backdrop-blur-xl`
- 1px border i `rgba(116,66,69,0.08)`
- 14-18px border-radius
- Blød skygge

**Typografi:**
- Sektions-overskrifter: Cardo italic (matcher sitet)
- Body, labels, tal: Inter
- Labels: 11px, uppercase, letter-spacing 0.08em, farve `var(--primary)`

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

- **Top-bar:** Sticky, glassmorphism, indeholder logo (Cardo), tabs, periode-vælger
- **Tabs:** Oversigt · Kampagner · Søgeord · Landingssider · Change log · Idé-bank · Eksperimenter
- **Periode-vælger:** Dummy dropdown i v1 (sidste 7d / 30d / 90d / custom)
- **Active tab:** `bg-[rgba(116,66,69,0.15)]` + `text-primary` + medium font-weight

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
├── components/
│   ├── ui/                         # shadcn primitives (Button, Card, Badge, Table, Tabs, etc.)
│   ├── glow-background.tsx         # fixed-position dual radial glow layer
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

**`<GlowBackground />`** — fixed-position layer, two radial gradients, no props.

**`<KpiCard label value trend trendDirection />`** — glassmorphism card. `trend` er string ("12%"), `trendDirection` er `"up" | "down"` (styrer farve).

**`<TopNav />`** — læser current pathname fra `usePathname()`, viser active tab. Tabs er hardcoded liste i komponenten.

**`<PeriodSelector value onChange />`** — dropdown med 4 valg. I v1 er den controlled men ændrer ikke data (dummy).

**`<SectionHeading children />`** — Cardo italic, color `var(--primary)`.

## Test/verificering for v1

Manuel test — ingen automatiserede tests for visuelt skelet:

1. `cd dashboard && npm install && npm run dev`
2. Browser åbner `localhost:3000` → redirect til `/login`
3. Indtast password → redirect tilbage til `/` (Oversigt)
4. Klik gennem alle 7 tabs — alle skal rendere uden fejl
5. Glows og glassmorphism virker (visual check)
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
