# Marketing Dashboard

Visuel skeleton (v1) — Next.js + crystal glass over fullscreen vandfald-baggrund.

## Kør lokalt

```bash
cp .env.local.example .env.local
# Ret DASHBOARD_PASSWORD til ønsket password
npm install
npm run dev
```

Åbn http://localhost:3000 og log ind.

## Sektioner

- `/` — Oversigt (KPI'er + chart + seneste ændringer)
- `/kampagner` — kampagne-performance table
- `/sogeord` — top konverterende + wasted spend
- `/landingssider` — pr. side conv rate + benchmark
- `/change-log` — tidslinje med ændringer
- `/ide-bank` — idé-kort med status (🌱 🌿 ⚗️ ✅ ❌)
- `/eksperimenter` — strukturerede tests

## Data

Alle data er hardcoded i `src/lib/fixtures/`. BigQuery + Postgres kommer i fase 2 og 3 — se [spec](../docs/superpowers/specs/2026-05-27-marketing-dashboard-design.md).

## Stack

- Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4
- shadcn/ui · Recharts
- Fonte: Inter + Cardo via `next/font`

## Auth

Simpel password-gate: `src/proxy.ts` tjekker en cookie sat af `/api/auth/login`. Login-form på `/login`. Cookie holder 30 dage.

## Noter

- Next.js 16 placerede koden i `src/app/` på trods af `--src-dir false` — det er nyt default.
- `middleware.ts` er deprecated i Next.js 16 — vi bruger `proxy.ts` med en `proxy()` funktion.
