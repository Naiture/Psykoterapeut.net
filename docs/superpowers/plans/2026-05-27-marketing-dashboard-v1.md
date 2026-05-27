# Marketing Dashboard v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working visual skeleton of Inger Marie's marketing dashboard — fullscreen waterfall background with ultra-transparent crystal glass cards, 7 sections, password-gated, runs locally on `npm run dev`.

**Architecture:** Next.js 15 App Router project in `/dashboard/` subfolder. All data is hardcoded fixtures (no BigQuery, no DB yet). Auth via middleware reading a cookie set by a `/login` route. Visual identity: single full-viewport waterfall image with two scrim layers and crystal glass cards (`bg-white/[0.02]` + `backdrop-blur-[2px]`).

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Recharts · Geist + Cardo fonts via `next/font`

**Reference spec:** [`docs/superpowers/specs/2026-05-27-marketing-dashboard-design.md`](../specs/2026-05-27-marketing-dashboard-design.md)

---

## File Structure

```
dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx              # password-form
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # top-nav + background + period selector
│   │   ├── page.tsx                    # Oversigt (KPIs + chart + recent log)
│   │   ├── kampagner/page.tsx
│   │   ├── sogeord/page.tsx
│   │   ├── landingssider/page.tsx
│   │   ├── change-log/page.tsx
│   │   ├── ide-bank/page.tsx
│   │   └── eksperimenter/page.tsx
│   ├── api/auth/login/route.ts         # POST: sets cookie
│   ├── globals.css                     # Tailwind base + CSS vars + text-shadow helpers
│   └── layout.tsx                      # root layout (fonts)
├── components/
│   ├── ui/                             # shadcn primitives (added as needed)
│   ├── background.tsx                  # waterfall image + scrim
│   ├── top-nav.tsx                     # tabs + logo + period selector
│   ├── period-selector.tsx
│   ├── kpi-card.tsx
│   ├── section-heading.tsx
│   ├── glass-card.tsx                  # base crystal-card wrapper
│   ├── conversions-chart.tsx           # Recharts line/bar with change-log markers
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
│   ├── types.ts
│   └── utils.ts                        # cn(), formatters (kr, %, dato)
├── public/
│   └── bg/
│       └── waterfall.jpg               # 280KB optimized
├── middleware.ts                       # password-gate
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── tsconfig.json
├── package.json
├── .env.local.example
└── README.md
```

**Responsibility split (key files):**
- `background.tsx` — pure visual: image + scrim, no other logic
- `glass-card.tsx` — single source of truth for crystal styling, used by every card
- `top-nav.tsx` — navigation only, reads `usePathname()` for active state
- `middleware.ts` — auth gate, no other logic
- `lib/fixtures/*.ts` — typed dummy data, each fixture stands alone
- Page files (`page.tsx`) — compose components, no styling beyond layout

**Testing strategy:** This is a visual skeleton. No unit tests in v1 — verification is visual (run `npm run dev`, click through, check looks). Each task ends with a manual verify step + commit. When data layer arrives in fase 2, tests come with it.

---

## Task 1: Scaffold Next.js project in /dashboard/

**Files:**
- Create: `dashboard/` (whole project via `create-next-app`)
- Modify: `.gitignore` at repo root

- [ ] **Step 1: Verify Node version**

Run: `node --version`
Expected: `v20.x` or higher. If lower, install via `nvm install 20 && nvm use 20`.

- [ ] **Step 2: Scaffold Next.js**

Run from repo root:
```bash
npx create-next-app@latest dashboard \
  --typescript \
  --tailwind \
  --app \
  --src-dir false \
  --import-alias "@/*" \
  --no-eslint \
  --turbopack
```
When prompted, accept defaults. This creates `dashboard/` with Next.js 15, TS, Tailwind v4, App Router.

- [ ] **Step 3: Update root .gitignore**

Edit `/Users/chris/Documents/GitHub/psykoterapeut.net/.gitignore` — add at the end (create file if it doesn't exist):

```
# Dashboard (Next.js)
dashboard/node_modules
dashboard/.next
dashboard/.env.local
dashboard/.env*.local
dashboard/next-env.d.ts
```

- [ ] **Step 4: Verify dev server starts**

```bash
cd dashboard && npm run dev
```
Open `http://localhost:3000`. Expected: default Next.js welcome page. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add .gitignore dashboard/
git commit -m "feat(dashboard): scaffold Next.js 15 project in /dashboard/"
```

---

## Task 2: Install dependencies and configure fonts

**Files:**
- Modify: `dashboard/package.json`
- Modify: `dashboard/app/layout.tsx`
- Create: `dashboard/lib/utils.ts`

- [ ] **Step 1: Install runtime deps**

```bash
cd dashboard
npm install recharts clsx tailwind-merge
```

- [ ] **Step 2: Install shadcn CLI and init**

```bash
npx shadcn@latest init -d
```
When prompted: pick defaults (New York style, Slate base, CSS variables yes). This creates `components/ui/`, `lib/utils.ts`, and updates `tailwind.config.ts` + `globals.css`.

- [ ] **Step 3: Verify lib/utils.ts**

Read `dashboard/lib/utils.ts` — it should contain a `cn()` helper that merges Tailwind classes. If not present, create with:

```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Set up fonts in app/layout.tsx**

Replace `dashboard/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter, Cardo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cardo = Cardo({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cardo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marketing · Inger Marie",
  description: "Marketing dashboard for psykoterapeut.net",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" className={`${inter.variable} ${cardo.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Add font CSS vars to Tailwind**

Edit `dashboard/app/globals.css`. After the `@import "tailwindcss";` line, add:

```css
@theme inline {
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-serif: var(--font-cardo), Georgia, serif;
}
```

- [ ] **Step 6: Verify**

```bash
cd dashboard && npm run dev
```
Open `localhost:3000`, open DevTools → Elements → `<html>`. Expected: `class` includes `__variable_cardo` and `__variable_inter`. Stop server.

- [ ] **Step 7: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): add Recharts, shadcn, fonts (Inter + Cardo)"
```

---

## Task 3: Optimize and add waterfall background image

**Files:**
- Create: `dashboard/public/bg/waterfall.jpg`

- [ ] **Step 1: Copy reference image into project**

From repo root:
```bash
mkdir -p dashboard/public/bg
cp docs/superpowers/specs/waterfall-bg-ref.jpg dashboard/public/bg/waterfall.jpg
```

- [ ] **Step 2: Verify size**

```bash
ls -la dashboard/public/bg/waterfall.jpg
```
Expected: ~280KB. If much larger, re-optimize:
```bash
sips -Z 1100 dashboard/public/bg/waterfall.jpg --out dashboard/public/bg/waterfall.jpg -s formatOptions 70
```

- [ ] **Step 3: Commit**

```bash
git add dashboard/public/bg/
git commit -m "feat(dashboard): add waterfall background image"
```

---

## Task 4: Build the Background component

**Files:**
- Create: `dashboard/components/background.tsx`

- [ ] **Step 1: Create the component**

Create `dashboard/components/background.tsx`:

```tsx
export function Background() {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg/waterfall.jpg')",
          filter: "brightness(0.95) saturate(1.05)",
        }}
      />
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.22) 100%)",
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Render it on the default route to verify**

Edit `dashboard/app/page.tsx` (the existing welcome page) — replace its entire body with:

```tsx
import { Background } from "@/components/background";

export default function Home() {
  return (
    <>
      <Background />
      <main className="relative min-h-screen p-8 text-white">
        <h1 className="text-4xl font-serif">Background test</h1>
        <p className="mt-4 text-white/80 drop-shadow-lg">
          You should see a waterfall behind this text.
        </p>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Verify visually**

```bash
cd dashboard && npm run dev
```
Open `localhost:3000`. Expected: full-viewport waterfall image with white text on top. Resize window — image should cover viewport. Stop server.

- [ ] **Step 4: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): add fullscreen waterfall Background component"
```

---

## Task 5: Build the GlassCard primitive

**Files:**
- Create: `dashboard/components/glass-card.tsx`

- [ ] **Step 1: Create the component**

Create `dashboard/components/glass-card.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export const GlassCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function GlassCard({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/[0.12] bg-white/[0.02]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_40px_rgba(0,0,0,0.28)]",
          "backdrop-blur-[2px] backdrop-saturate-150",
          className
        )}
        {...props}
      />
    );
  }
);
```

- [ ] **Step 2: Smoke-test on home page**

Edit `dashboard/app/page.tsx` — replace its body with:

```tsx
import { Background } from "@/components/background";
import { GlassCard } from "@/components/glass-card";

export default function Home() {
  return (
    <>
      <Background />
      <main className="relative min-h-screen p-8">
        <GlassCard className="p-6 max-w-md">
          <h2 className="font-serif text-2xl text-white drop-shadow-lg">
            Crystal card test
          </h2>
          <p className="mt-2 text-white/80 drop-shadow">
            This card should be almost invisible — only a faint border.
          </p>
        </GlassCard>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Verify visually**

`npm run dev` → `localhost:3000`. Expected: a barely-visible rounded card with thin border, text readable on top of waterfall. Stop server.

- [ ] **Step 4: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): add GlassCard primitive (crystal style)"
```

---

## Task 6: Define shared TypeScript types

**Files:**
- Create: `dashboard/lib/types.ts`

- [ ] **Step 1: Create the types file**

Create `dashboard/lib/types.ts`:

```ts
export type TrendDirection = "up" | "down" | "flat";

export interface Kpi {
  label: string;
  value: string;
  trend: string;
  trendDirection: TrendDirection;
}

export type Period = "7d" | "30d" | "90d" | "custom";

export interface Campaign {
  name: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  spendKr: number;
  cpaKr: number;
  status: "active" | "paused";
}

export interface Keyword {
  term: string;
  searchVolume: number;
  clicks: number;
  conversions: number;
  spendKr: number;
}

export interface LandingPage {
  url: string;
  sessions: number;
  conversionRate: number;
  avgTimeSeconds: number;
}

export type ChangeCategory =
  | "kampagne"
  | "keyword"
  | "landing-page"
  | "seo"
  | "andet";

export interface ChangeLogEntry {
  id: string;
  timestamp: string;
  category: ChangeCategory;
  title: string;
  description: string;
  expectedImpact: string;
  author: "Chris" | "Inger Marie" | "Claude" | "Bureau";
}

export type IdeaStatus = "frø" | "udfoldet" | "test" | "implementeret" | "forkastet";

export interface Idea {
  id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  proposedBy: "Chris" | "Inger Marie" | "Claude";
  effortHours: number;
  impact: "lav" | "medium" | "høj";
  tags: string[];
}

export type ExperimentStatus = "planlagt" | "kører" | "afsluttet";

export interface Experiment {
  id: string;
  hypothesis: string;
  metric: string;
  periodStart: string;
  periodEnd: string;
  status: ExperimentStatus;
  result?: string;
  conclusion?: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): define shared TypeScript types"
```

---

## Task 7: Create fixture data

**Files:**
- Create: `dashboard/lib/fixtures/kpis.ts`
- Create: `dashboard/lib/fixtures/campaigns.ts`
- Create: `dashboard/lib/fixtures/keywords.ts`
- Create: `dashboard/lib/fixtures/landing-pages.ts`
- Create: `dashboard/lib/fixtures/change-log.ts`
- Create: `dashboard/lib/fixtures/ideas.ts`
- Create: `dashboard/lib/fixtures/experiments.ts`

- [ ] **Step 1: KPI fixtures**

Create `dashboard/lib/fixtures/kpis.ts`:

```ts
import type { Kpi } from "@/lib/types";

export const kpis: Kpi[] = [
  { label: "Sessions", value: "2.847", trend: "↑ 12% vs. forrige 30d", trendDirection: "up" },
  { label: "Conversions", value: "42", trend: "↑ 8% vs. forrige 30d", trendDirection: "up" },
  { label: "Ad spend", value: "4.230 kr", trend: "↓ 3% vs. forrige 30d", trendDirection: "down" },
  { label: "CPA", value: "101 kr", trend: "↓ 11% vs. forrige 30d", trendDirection: "down" },
];

export const conversionsOverTime: { date: string; conversions: number }[] = [
  { date: "2026-04-28", conversions: 1 },
  { date: "2026-04-29", conversions: 2 },
  { date: "2026-04-30", conversions: 1 },
  { date: "2026-05-01", conversions: 3 },
  { date: "2026-05-02", conversions: 2 },
  { date: "2026-05-03", conversions: 4 },
  { date: "2026-05-04", conversions: 3 },
  { date: "2026-05-05", conversions: 2 },
  { date: "2026-05-06", conversions: 5 },
  { date: "2026-05-07", conversions: 3 },
  { date: "2026-05-08", conversions: 4 },
  { date: "2026-05-09", conversions: 3 },
  { date: "2026-05-10", conversions: 6 },
  { date: "2026-05-11", conversions: 4 },
  { date: "2026-05-12", conversions: 7 },
  { date: "2026-05-13", conversions: 5 },
  { date: "2026-05-14", conversions: 8 },
  { date: "2026-05-15", conversions: 6 },
  { date: "2026-05-16", conversions: 9 },
  { date: "2026-05-17", conversions: 7 },
];
```

- [ ] **Step 2: Campaign fixtures**

Create `dashboard/lib/fixtures/campaigns.ts`:

```ts
import type { Campaign } from "@/lib/types";

export const campaigns: Campaign[] = [
  { name: "Online Terapi DK", clicks: 1240, conversions: 18, conversionRate: 1.45, spendKr: 1820, cpaKr: 101, status: "active" },
  { name: "Stress · Aarhus", clicks: 680, conversions: 9, conversionRate: 1.32, spendKr: 920, cpaKr: 102, status: "active" },
  { name: "Depression · Aarhus", clicks: 540, conversions: 7, conversionRate: 1.30, spendKr: 780, cpaKr: 111, status: "active" },
  { name: "Angst · Aarhus", clicks: 480, conversions: 5, conversionRate: 1.04, spendKr: 620, cpaKr: 124, status: "active" },
  { name: "Traumebehandling", clicks: 220, conversions: 3, conversionRate: 1.36, spendKr: 410, cpaKr: 137, status: "active" },
  { name: "Generel · Brand", clicks: 180, conversions: 0, conversionRate: 0, spendKr: 240, cpaKr: 0, status: "paused" },
];
```

- [ ] **Step 3: Keyword fixtures**

Create `dashboard/lib/fixtures/keywords.ts`:

```ts
import type { Keyword } from "@/lib/types";

export const topConverting: Keyword[] = [
  { term: "psykolog aarhus", searchVolume: 8800, clicks: 220, conversions: 8, spendKr: 410 },
  { term: "online terapi", searchVolume: 4400, clicks: 180, conversions: 6, spendKr: 320 },
  { term: "terapi stress", searchVolume: 2900, clicks: 140, conversions: 5, spendKr: 280 },
  { term: "angstbehandling aarhus", searchVolume: 1300, clicks: 95, conversions: 4, spendKr: 210 },
  { term: "depression behandling", searchVolume: 3600, clicks: 110, conversions: 3, spendKr: 250 },
];

export const wastedSpend: Keyword[] = [
  { term: "gratis terapi", searchVolume: 1900, clicks: 87, conversions: 0, spendKr: 180 },
  { term: "psykolog uddannelse", searchVolume: 720, clicks: 42, conversions: 0, spendKr: 95 },
  { term: "terapeut løn", searchVolume: 480, clicks: 31, conversions: 0, spendKr: 72 },
  { term: "psykolog studie", searchVolume: 590, clicks: 28, conversions: 0, spendKr: 64 },
];
```

- [ ] **Step 4: Landing page fixtures**

Create `dashboard/lib/fixtures/landing-pages.ts`:

```ts
import type { LandingPage } from "@/lib/types";

export const landingPages: LandingPage[] = [
  { url: "/online-terapi/", sessions: 890, conversionRate: 3.8, avgTimeSeconds: 142 },
  { url: "/terapi-mod-stress/", sessions: 640, conversionRate: 4.2, avgTimeSeconds: 168 },
  { url: "/terapi-mod-depression/", sessions: 520, conversionRate: 3.5, avgTimeSeconds: 155 },
  { url: "/angst-behandling-i-aarhus/", sessions: 410, conversionRate: 2.9, avgTimeSeconds: 138 },
  { url: "/traumebehandling/", sessions: 220, conversionRate: 1.8, avgTimeSeconds: 124 },
  { url: "/faa-hjaelp-til/", sessions: 180, conversionRate: 1.1, avgTimeSeconds: 96 },
];
```

- [ ] **Step 5: Change log fixtures**

Create `dashboard/lib/fixtures/change-log.ts`:

```ts
import type { ChangeLogEntry } from "@/lib/types";

export const changeLog: ChangeLogEntry[] = [
  {
    id: "1",
    timestamp: "2026-05-24T10:30:00Z",
    category: "keyword",
    title: "Tilføjet 50 negatives på Online Terapi",
    description: "Filtrerede ord som 'gratis', 'uddannelse', 'studie' fra. Mål: reducere wasted spend.",
    expectedImpact: "CPA falder med 8-12%",
    author: "Claude",
  },
  {
    id: "2",
    timestamp: "2026-05-19T14:00:00Z",
    category: "landing-page",
    title: "Ny CTA på /book-samtale",
    description: "Telefon + mail-knapper øverst, før beskrivelse.",
    expectedImpact: "Conv rate +0.5 pp",
    author: "Chris",
  },
  {
    id: "3",
    timestamp: "2026-05-13T09:15:00Z",
    category: "kampagne",
    title: "Pause på Stress-kampagne",
    description: "Brand-kampagnen genererede klik uden conversions, sat på pause i 14 dage for at se baseline.",
    expectedImpact: "Spend −240 kr/uge",
    author: "Inger Marie",
  },
  {
    id: "4",
    timestamp: "2026-05-09T11:45:00Z",
    category: "seo",
    title: "Ny side: Få hjælp til",
    description: "Hub-side der linker til alle behandlingsområder.",
    expectedImpact: "Organic traffic +5% over 3 mdr",
    author: "Chris",
  },
];
```

- [ ] **Step 6: Idea fixtures**

Create `dashboard/lib/fixtures/ideas.ts`:

```ts
import type { Idea } from "@/lib/types";

export const ideas: Idea[] = [
  { id: "1", title: "Video-introduktion på forside", description: "30 sek video af Inger Marie der præsenterer sig selv.", status: "frø", proposedBy: "Inger Marie", effortHours: 8, impact: "medium", tags: ["brand", "landing-page"] },
  { id: "2", title: "Flyt pris under USP", description: "Test om pris-info under USP-section reducerer bounce rate.", status: "udfoldet", proposedBy: "Chris", effortHours: 2, impact: "medium", tags: ["landing-page", "pris"] },
  { id: "3", title: "Nyhedsbrev til klienter", description: "Månedlig opdatering med refleksioner, ressourcer.", status: "frø", proposedBy: "Inger Marie", effortHours: 16, impact: "lav", tags: ["retention", "brand"] },
  { id: "4", title: "Pause Brand-kampagne", description: "Brand-kampagnen konverterer ikke. Pause i 14 dage.", status: "test", proposedBy: "Claude", effortHours: 0.5, impact: "høj", tags: ["kampagne", "spend"] },
  { id: "5", title: "Tilføj 50 negatives", description: "Filter ord som 'gratis', 'uddannelse' fra.", status: "implementeret", proposedBy: "Claude", effortHours: 1, impact: "høj", tags: ["keyword", "spend"] },
  { id: "6", title: "Facebook-annoncer", description: "Test om FB Ads kan komplementere Google.", status: "forkastet", proposedBy: "Chris", effortHours: 20, impact: "lav", tags: ["kampagne", "kanal"] },
  { id: "7", title: "FAQ-sektion på alle landingssider", description: "Top 5 spørgsmål svaret in-page.", status: "frø", proposedBy: "Chris", effortHours: 6, impact: "medium", tags: ["landing-page", "seo"] },
];
```

- [ ] **Step 7: Experiment fixtures**

Create `dashboard/lib/fixtures/experiments.ts`:

```ts
import type { Experiment } from "@/lib/types";

export const experiments: Experiment[] = [
  {
    id: "1",
    hypothesis: "Hvis vi pauser Brand-kampagnen, falder spend uden conversion-tab.",
    metric: "Spend + conversions",
    periodStart: "2026-05-13",
    periodEnd: "2026-05-27",
    status: "kører",
  },
  {
    id: "2",
    hypothesis: "Hvis vi flytter pris-info under USP på /terapi, falder bounce rate.",
    metric: "Bounce rate på /terapi",
    periodStart: "2026-06-03",
    periodEnd: "2026-06-17",
    status: "planlagt",
  },
  {
    id: "3",
    hypothesis: "Hvis vi tilføjer 50 negatives, falder CPA med 8-12%.",
    metric: "CPA på Online Terapi-kampagne",
    periodStart: "2026-05-10",
    periodEnd: "2026-05-24",
    status: "afsluttet",
    result: "CPA faldt fra 113 kr til 101 kr (−10.6%)",
    conclusion: "Hypotesen bekræftet. Permanent ændring.",
  },
];
```

- [ ] **Step 8: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): add fixture data for all 7 sections"
```

---

## Task 8: Build the password-gate (login route + middleware)

**Files:**
- Create: `dashboard/middleware.ts`
- Create: `dashboard/app/(auth)/login/page.tsx`
- Create: `dashboard/app/api/auth/login/route.ts`
- Create: `dashboard/.env.local.example`
- Create: `dashboard/.env.local` (local only — gitignored)

- [ ] **Step 1: Create .env.local.example**

Create `dashboard/.env.local.example`:

```
# Password used to access the dashboard
DASHBOARD_PASSWORD=changeme
```

- [ ] **Step 2: Create .env.local (not committed)**

Create `dashboard/.env.local`:

```
DASHBOARD_PASSWORD=vandfald2026
```

(Chris can change this password later.)

- [ ] **Step 3: Create middleware**

Create `dashboard/middleware.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const authed = req.cookies.get("dash_auth")?.value === "ok";
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|bg/).*)"],
};
```

- [ ] **Step 4: Create login API route**

Create `dashboard/app/api/auth/login/route.ts`:

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = form.get("password");

  if (typeof password !== "string" || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.redirect(new URL("/login?error=1", req.url), { status: 303 });
  }

  const cookieStore = await cookies();
  cookieStore.set("dash_auth", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
```

- [ ] **Step 5: Create login page**

Create `dashboard/app/(auth)/login/page.tsx`:

```tsx
import { Background } from "@/components/background";
import { GlassCard } from "@/components/glass-card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <Background />
      <main className="relative min-h-screen flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-sm p-8">
          <h1 className="font-serif text-2xl text-white text-center drop-shadow-lg">
            Marketing · Inger Marie
          </h1>
          <p className="mt-2 text-center text-sm text-white/75 drop-shadow">
            Indtast adgangskode
          </p>

          <form action="/api/auth/login" method="POST" className="mt-6 space-y-3">
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Adgangskode"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/40 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-lg border border-white/25 bg-white/15 px-4 py-2.5 text-white font-medium backdrop-blur-sm hover:bg-white/25 transition"
            >
              Log ind
            </button>
            {error && (
              <p className="text-center text-sm text-rose-200 drop-shadow">
                Forkert adgangskode
              </p>
            )}
          </form>
        </GlassCard>
      </main>
    </>
  );
}
```

- [ ] **Step 6: Verify**

```bash
cd dashboard && npm run dev
```
1. Open `localhost:3000` → expect redirect to `/login`
2. Submit wrong password → expect "Forkert adgangskode"
3. Submit `vandfald2026` → expect redirect to `/` (currently shows the test card from Task 5)
4. Refresh `/` → no redirect (cookie set)

Stop server.

- [ ] **Step 7: Commit**

```bash
git add dashboard/middleware.ts dashboard/app/ dashboard/.env.local.example
git commit -m "feat(dashboard): add password-gate (middleware + login route)"
```

---

## Task 9: Build the top navigation

**Files:**
- Create: `dashboard/components/top-nav.tsx`
- Create: `dashboard/components/period-selector.tsx`

- [ ] **Step 1: Create PeriodSelector**

Create `dashboard/components/period-selector.tsx`:

```tsx
"use client";

import { useState } from "react";

const PERIODS: { value: string; label: string }[] = [
  { value: "7d", label: "Sidste 7 dage" },
  { value: "30d", label: "Sidste 30 dage" },
  { value: "90d", label: "Sidste 90 dage" },
];

export function PeriodSelector() {
  const [value, setValue] = useState("30d");
  const [open, setOpen] = useState(false);
  const current = PERIODS.find((p) => p.value === value) ?? PERIODS[1];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-white/22 px-3 py-1.5 text-xs text-white drop-shadow hover:bg-white/10"
      >
        {current.label} ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-lg border border-white/20 bg-black/60 backdrop-blur-xl shadow-xl">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => {
                setValue(p.value);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-xs text-white/85 hover:bg-white/10"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create TopNav**

Create `dashboard/components/top-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlassCard } from "@/components/glass-card";
import { PeriodSelector } from "@/components/period-selector";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string }[] = [
  { href: "/", label: "Oversigt" },
  { href: "/kampagner", label: "Kampagner" },
  { href: "/sogeord", label: "Søgeord" },
  { href: "/landingssider", label: "Landingssider" },
  { href: "/change-log", label: "Change log" },
  { href: "/ide-bank", label: "Idé-bank" },
  { href: "/eksperimenter", label: "Eksperimenter" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <GlassCard className="sticky top-4 z-50 mx-4 flex items-center gap-6 px-5 py-3">
      <div className="font-serif text-base font-semibold text-white drop-shadow-lg">
        Inger Marie
      </div>
      <nav className="flex flex-1 gap-1">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition",
                "text-white/80 drop-shadow hover:text-white",
                active && "bg-white/18 text-white font-semibold"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <PeriodSelector />
    </GlassCard>
  );
}
```

- [ ] **Step 3: Create dashboard layout**

Create `dashboard/app/(dashboard)/layout.tsx`:

```tsx
import { Background } from "@/components/background";
import { TopNav } from "@/components/top-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Background />
      <div className="relative min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 px-4 py-4">{children}</main>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Move home page into the (dashboard) route group**

Delete the current `dashboard/app/page.tsx` (the test card from Task 5):
```bash
rm dashboard/app/page.tsx
```

Create `dashboard/app/(dashboard)/page.tsx` as a placeholder for now:

```tsx
import { GlassCard } from "@/components/glass-card";

export default function OversigtPage() {
  return (
    <GlassCard className="p-6">
      <h2 className="font-serif text-2xl text-white drop-shadow-lg">Oversigt</h2>
      <p className="mt-2 text-white/75 drop-shadow">KPIs and chart kommer i næste task.</p>
    </GlassCard>
  );
}
```

- [ ] **Step 5: Verify**

`npm run dev` → log in → see top nav with 7 tabs, periode-vælger på højre side. Klik på tabs → de andre routes findes ikke endnu (404 forventet, ok). Stop server.

- [ ] **Step 6: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): add TopNav, PeriodSelector, dashboard layout"
```

---

## Task 10: Build KpiCard and Oversigt page

**Files:**
- Create: `dashboard/components/kpi-card.tsx`
- Create: `dashboard/components/section-heading.tsx`
- Create: `dashboard/components/conversions-chart.tsx`
- Modify: `dashboard/app/(dashboard)/page.tsx`

- [ ] **Step 1: Create SectionHeading**

Create `dashboard/components/section-heading.tsx`:

```tsx
import { cn } from "@/lib/utils";

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-serif text-2xl text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      {children}
    </h2>
  );
}
```

- [ ] **Step 2: Create KpiCard**

Create `dashboard/components/kpi-card.tsx`:

```tsx
import { GlassCard } from "@/components/glass-card";
import type { Kpi } from "@/lib/types";

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <GlassCard className="p-5">
      <div className="text-[11px] uppercase tracking-[0.1em] text-white/82 font-medium drop-shadow">
        {kpi.label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)]">
        {kpi.value}
      </div>
      <div className="mt-1 text-xs text-[#ffd09a] drop-shadow">{kpi.trend}</div>
    </GlassCard>
  );
}
```

- [ ] **Step 3: Create ConversionsChart**

Create `dashboard/components/conversions-chart.tsx`:

```tsx
"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { conversionsOverTime } from "@/lib/fixtures/kpis";
import { changeLog } from "@/lib/fixtures/change-log";

export function ConversionsChart() {
  const annotations = changeLog
    .map((c) => ({
      date: c.timestamp.slice(0, 10),
      title: c.title,
    }))
    .filter((a) => conversionsOverTime.some((d) => d.date === a.date));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={conversionsOverTime} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="conv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd09a" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#ffd09a" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 10 }}
            tickFormatter={(d: string) => d.slice(5)}
            stroke="rgba(255,255,255,0.2)"
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 10 }}
            stroke="rgba(255,255,255,0.2)"
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
            }}
          />
          {annotations.map((a) => (
            <ReferenceLine
              key={a.date}
              x={a.date}
              stroke="#ffc080"
              strokeDasharray="3 3"
              label={{ value: "•", fill: "#ffc080", fontSize: 18, position: "top" }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="conversions"
            stroke="#ffd09a"
            strokeWidth={2}
            fill="url(#conv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Update Oversigt page**

Replace `dashboard/app/(dashboard)/page.tsx`:

```tsx
import { GlassCard } from "@/components/glass-card";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeading } from "@/components/section-heading";
import { ConversionsChart } from "@/components/conversions-chart";
import { kpis } from "@/lib/fixtures/kpis";
import { changeLog } from "@/lib/fixtures/change-log";

export default function OversigtPage() {
  return (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionHeading className="text-base">Conversions over tid</SectionHeading>
          <p className="text-[11px] text-white/72 drop-shadow mb-3">
            Daglige conversions med change-log markører
          </p>
          <ConversionsChart />
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeading className="text-base">Seneste ændringer</SectionHeading>
          <ul className="mt-3 divide-y divide-white/10">
            {changeLog.slice(0, 4).map((entry) => (
              <li key={entry.id} className="flex gap-2 py-2.5">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffc080] shadow-[0_0_10px_rgba(255,192,128,0.7)]" />
                <div>
                  <div className="text-[10px] text-white/65 drop-shadow">
                    {new Date(entry.timestamp).toLocaleDateString("da-DK")} · {entry.category}
                  </div>
                  <div className="text-xs text-white drop-shadow">{entry.title}</div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify**

`npm run dev` → log in → Oversigt-siden viser 4 KPI-cards i toppen, en Recharts area-graf med honning-fyld og prikker for change-log markører, og en sidebar med 4 seneste ændringer. Stop server.

- [ ] **Step 6: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): build Oversigt page (KPIs + chart + recent log)"
```

---

## Task 11: Build Kampagner page

**Files:**
- Create: `dashboard/app/(dashboard)/kampagner/page.tsx`

- [ ] **Step 1: Create the page**

Create `dashboard/app/(dashboard)/kampagner/page.tsx`:

```tsx
import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import { campaigns } from "@/lib/fixtures/campaigns";

export default function KampagnerPage() {
  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Kampagner</SectionHeading>
      <GlassCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/65">
              <th className="px-5 py-3 text-left">Kampagne</th>
              <th className="px-5 py-3 text-right">Klik</th>
              <th className="px-5 py-3 text-right">Conv.</th>
              <th className="px-5 py-3 text-right">Conv. rate</th>
              <th className="px-5 py-3 text-right">Spend</th>
              <th className="px-5 py-3 text-right">CPA</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.name} className="border-b border-white/5 last:border-0 text-white/90 drop-shadow">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-right tabular-nums">{c.clicks.toLocaleString("da-DK")}</td>
                <td className="px-5 py-3 text-right tabular-nums">{c.conversions}</td>
                <td className="px-5 py-3 text-right tabular-nums">{c.conversionRate.toFixed(2)}%</td>
                <td className="px-5 py-3 text-right tabular-nums">{c.spendKr.toLocaleString("da-DK")} kr</td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {c.cpaKr > 0 ? `${c.cpaKr} kr` : "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={
                      c.status === "active"
                        ? "rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-200"
                        : "rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/70"
                    }
                  >
                    {c.status === "active" ? "Aktiv" : "Pause"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

`npm run dev` → navigate to /kampagner → table med 6 rækker, tal højrejusterede, status-badges. Stop server.

- [ ] **Step 3: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): build Kampagner page (table)"
```

---

## Task 12: Build Søgeord page

**Files:**
- Create: `dashboard/app/(dashboard)/sogeord/page.tsx`

- [ ] **Step 1: Create the page**

Create `dashboard/app/(dashboard)/sogeord/page.tsx`:

```tsx
import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import { topConverting, wastedSpend } from "@/lib/fixtures/keywords";
import type { Keyword } from "@/lib/types";

function KeywordTable({ keywords }: { keywords: Keyword[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/65">
          <th className="px-4 py-2.5 text-left">Søgeord</th>
          <th className="px-4 py-2.5 text-right">Volumen</th>
          <th className="px-4 py-2.5 text-right">Klik</th>
          <th className="px-4 py-2.5 text-right">Conv.</th>
          <th className="px-4 py-2.5 text-right">Spend</th>
        </tr>
      </thead>
      <tbody>
        {keywords.map((k) => (
          <tr key={k.term} className="border-b border-white/5 last:border-0 text-white/90 drop-shadow">
            <td className="px-4 py-2.5">{k.term}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.searchVolume.toLocaleString("da-DK")}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.clicks}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.conversions}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.spendKr} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function SogeordPage() {
  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Søgeord</SectionHeading>
      <div className="grid gap-3 lg:grid-cols-2">
        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">Top konverterende</div>
          <KeywordTable keywords={topConverting} />
        </GlassCard>
        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">Wasted spend (ingen conversions)</div>
          <KeywordTable keywords={wastedSpend} />
        </GlassCard>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

`npm run dev` → /sogeord → to glass-paneler side om side med tables. Stop.

- [ ] **Step 3: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): build Søgeord page (top + wasted tables)"
```

---

## Task 13: Build Landingssider page

**Files:**
- Create: `dashboard/app/(dashboard)/landingssider/page.tsx`

- [ ] **Step 1: Create the page**

Create `dashboard/app/(dashboard)/landingssider/page.tsx`:

```tsx
import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import { landingPages } from "@/lib/fixtures/landing-pages";

const BENCHMARK = 2.0;

export default function LandingssiderPage() {
  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Landingssider</SectionHeading>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {landingPages.map((p) => {
          const belowBenchmark = p.conversionRate < BENCHMARK;
          return (
            <GlassCard key={p.url} className="p-5">
              <div className="text-xs text-white/70 drop-shadow">{p.url}</div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)]">
                  {p.conversionRate.toFixed(1)}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/65 drop-shadow">conv. rate</span>
              </div>
              <div className="mt-3 flex justify-between text-xs text-white/75 drop-shadow">
                <span>{p.sessions.toLocaleString("da-DK")} sessions</span>
                <span>{Math.round(p.avgTimeSeconds / 60 * 10) / 10} min snit</span>
              </div>
              {belowBenchmark && (
                <div className="mt-3 inline-flex rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] text-amber-200">
                  Under benchmark ({BENCHMARK}%)
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

/landingssider → grid med 6 cards, sider under 2% conv har gul "Under benchmark" badge. Stop.

- [ ] **Step 3: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): build Landingssider page (grid med benchmark)"
```

---

## Task 14: Build Change log page

**Files:**
- Create: `dashboard/components/change-log-entry.tsx`
- Create: `dashboard/app/(dashboard)/change-log/page.tsx`

- [ ] **Step 1: Create ChangeLogEntryView component**

Create `dashboard/components/change-log-entry.tsx`:

```tsx
import { GlassCard } from "@/components/glass-card";
import type { ChangeLogEntry } from "@/lib/types";

const CATEGORY_COLORS: Record<ChangeLogEntry["category"], string> = {
  kampagne: "bg-blue-400/20 text-blue-100",
  keyword: "bg-emerald-400/20 text-emerald-100",
  "landing-page": "bg-violet-400/20 text-violet-100",
  seo: "bg-amber-400/20 text-amber-100",
  andet: "bg-white/15 text-white/80",
};

export function ChangeLogEntryView({ entry }: { entry: ChangeLogEntry }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${CATEGORY_COLORS[entry.category]}`}
        >
          {entry.category}
        </span>
        <span className="text-xs text-white/65 drop-shadow">
          {new Date(entry.timestamp).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="ml-auto text-xs text-white/55 drop-shadow">{entry.author}</span>
      </div>
      <h3 className="mt-2 text-base font-medium text-white drop-shadow">{entry.title}</h3>
      <p className="mt-1 text-sm text-white/80 drop-shadow">{entry.description}</p>
      <div className="mt-3 text-xs text-[#ffd09a] drop-shadow">
        Forventet effekt: {entry.expectedImpact}
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Create the page**

Create `dashboard/app/(dashboard)/change-log/page.tsx`:

```tsx
import { ChangeLogEntryView } from "@/components/change-log-entry";
import { SectionHeading } from "@/components/section-heading";
import { changeLog } from "@/lib/fixtures/change-log";

export default function ChangeLogPage() {
  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-baseline justify-between">
        <SectionHeading>Change log</SectionHeading>
        <button
          disabled
          className="rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-xs text-white/60 cursor-not-allowed"
          title="Funktion kommer i fase 3"
        >
          + Tilføj entry
        </button>
      </div>
      <div className="space-y-3">
        {changeLog.map((entry) => (
          <ChangeLogEntryView key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

/change-log → 4 entries i vertikal stack, hver med kategori-badge i farve, dato, author, beskrivelse, forventet effekt i honning. "Tilføj entry"-knap er disabled. Stop.

- [ ] **Step 4: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): build Change log page (tidslinje)"
```

---

## Task 15: Build Idé-bank page

**Files:**
- Create: `dashboard/components/idea-card.tsx`
- Create: `dashboard/app/(dashboard)/ide-bank/page.tsx`

- [ ] **Step 1: Create IdeaCardView**

Create `dashboard/components/idea-card.tsx`:

```tsx
import { GlassCard } from "@/components/glass-card";
import type { Idea } from "@/lib/types";

const STATUS: Record<Idea["status"], { emoji: string; label: string }> = {
  "frø": { emoji: "🌱", label: "Frø" },
  "udfoldet": { emoji: "🌿", label: "Udfoldet" },
  "test": { emoji: "⚗️", label: "Test" },
  "implementeret": { emoji: "✅", label: "Implementeret" },
  "forkastet": { emoji: "❌", label: "Forkastet" },
};

const IMPACT_COLOR: Record<Idea["impact"], string> = {
  "lav": "text-white/55",
  "medium": "text-white/80",
  "høj": "text-[#ffd09a]",
};

export function IdeaCardView({ idea }: { idea: Idea }) {
  const status = STATUS[idea.status];
  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium text-white drop-shadow">{idea.title}</h3>
        <span className="shrink-0 text-lg" title={status.label}>{status.emoji}</span>
      </div>
      <p className="text-sm text-white/80 drop-shadow line-clamp-3">{idea.description}</p>
      <div className="flex flex-wrap gap-1">
        {idea.tags.map((t) => (
          <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/75">
            {t}
          </span>
        ))}
      </div>
      <div className="flex justify-between border-t border-white/10 pt-3 text-[11px] text-white/65 drop-shadow">
        <span>Foreslået af {idea.proposedBy}</span>
        <span>
          {idea.effortHours}h · <span className={IMPACT_COLOR[idea.impact]}>impact: {idea.impact}</span>
        </span>
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Create the page**

Create `dashboard/app/(dashboard)/ide-bank/page.tsx`:

```tsx
import { IdeaCardView } from "@/components/idea-card";
import { SectionHeading } from "@/components/section-heading";
import { ideas } from "@/lib/fixtures/ideas";

export default function IdeBankPage() {
  const counts = ideas.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <SectionHeading>Idé-bank</SectionHeading>
        <div className="flex gap-3 text-xs text-white/70 drop-shadow">
          <span>🌱 {counts["frø"] ?? 0}</span>
          <span>🌿 {counts["udfoldet"] ?? 0}</span>
          <span>⚗️ {counts["test"] ?? 0}</span>
          <span>✅ {counts["implementeret"] ?? 0}</span>
          <span>❌ {counts["forkastet"] ?? 0}</span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <IdeaCardView key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

/ide-bank → status-tæller øverst højre, grid med 7 idé-cards, hver med emoji, beskrivelse, tags, effort+impact. Stop.

- [ ] **Step 4: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): build Idé-bank page (kort-grid med status)"
```

---

## Task 16: Build Eksperimenter page

**Files:**
- Create: `dashboard/components/experiment-card.tsx`
- Create: `dashboard/app/(dashboard)/eksperimenter/page.tsx`

- [ ] **Step 1: Create ExperimentCardView**

Create `dashboard/components/experiment-card.tsx`:

```tsx
import { GlassCard } from "@/components/glass-card";
import type { Experiment } from "@/lib/types";

const STATUS_STYLES: Record<Experiment["status"], string> = {
  planlagt: "bg-white/15 text-white/75",
  kører: "bg-amber-400/20 text-amber-100",
  afsluttet: "bg-emerald-400/20 text-emerald-100",
};

export function ExperimentCardView({ experiment }: { experiment: Experiment }) {
  return (
    <GlassCard className="p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLES[experiment.status]}`}
        >
          {experiment.status}
        </span>
        <span className="text-[11px] text-white/65 drop-shadow">
          {new Date(experiment.periodStart).toLocaleDateString("da-DK")} → {new Date(experiment.periodEnd).toLocaleDateString("da-DK")}
        </span>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/65 drop-shadow">Hypotese</div>
        <p className="mt-1 text-sm text-white drop-shadow">{experiment.hypothesis}</p>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/65 drop-shadow">Måles på</div>
        <p className="mt-1 text-sm text-white/85 drop-shadow">{experiment.metric}</p>
      </div>
      {experiment.result && (
        <div className="border-t border-white/10 pt-3">
          <div className="text-[10px] uppercase tracking-wider text-[#ffd09a] drop-shadow">Resultat</div>
          <p className="mt-1 text-sm text-white drop-shadow">{experiment.result}</p>
        </div>
      )}
      {experiment.conclusion && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/65 drop-shadow">Konklusion</div>
          <p className="mt-1 text-sm text-white/85 drop-shadow">{experiment.conclusion}</p>
        </div>
      )}
    </GlassCard>
  );
}
```

- [ ] **Step 2: Create the page**

Create `dashboard/app/(dashboard)/eksperimenter/page.tsx`:

```tsx
import { ExperimentCardView } from "@/components/experiment-card";
import { SectionHeading } from "@/components/section-heading";
import { experiments } from "@/lib/fixtures/experiments";

export default function EksperimenterPage() {
  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Eksperimenter</SectionHeading>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {experiments.map((e) => (
          <ExperimentCardView key={e.id} experiment={e} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

/eksperimenter → 3 cards: ét "kører" (amber), ét "planlagt" (grå), ét "afsluttet" (emerald) med resultat + konklusion. Stop.

- [ ] **Step 4: Commit**

```bash
git add dashboard/
git commit -m "feat(dashboard): build Eksperimenter page"
```

---

## Task 17: Polish and README

**Files:**
- Create: `dashboard/README.md`
- Modify: `dashboard/app/globals.css` (add overflow-x-hidden if needed)

- [ ] **Step 1: Smoke test full flow**

```bash
cd dashboard && npm run dev
```

Click through every tab. Check:
- Top nav active state highlights correctly
- All 7 routes render without errors
- Logout doesn't exist yet — that's OK for v1
- Window resize: 1280px and 1440px both look fine

If a section has horizontal overflow (e.g. wide tables), edit `dashboard/app/globals.css` and add inside the `body` selector:

```css
body { overflow-x: hidden; }
```

Stop server.

- [ ] **Step 2: Write README**

Create `dashboard/README.md`:

```markdown
# Marketing Dashboard

Visuel skeleton (v1) — Next.js + crystal glass over fullscreen vandfald-baggrund.

## Kør lokalt

\`\`\`bash
cp .env.local.example .env.local
# Ret DASHBOARD_PASSWORD til ønsket password
npm install
npm run dev
\`\`\`

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

Alle data er hardcoded i `lib/fixtures/`. BigQuery + Postgres kommer i fase 2 og 3 — se [spec](../docs/superpowers/specs/2026-05-27-marketing-dashboard-design.md).

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind v4
- shadcn/ui · Recharts
- Fonte: Inter + Cardo via `next/font`
```

- [ ] **Step 3: Commit**

```bash
git add dashboard/
git commit -m "docs(dashboard): add README + final polish"
```

---

## Task 18: Final verification

- [ ] **Step 1: Fresh clone test**

```bash
cd dashboard
rm -rf node_modules .next
npm install
npm run dev
```

- [ ] **Step 2: Walk through entire flow**

1. `localhost:3000` → redirect to `/login`
2. Type wrong password → "Forkert adgangskode"
3. Type `vandfald2026` → redirect to `/`
4. Klik gennem alle 7 tabs i top-nav
5. Verify each section renders complete, no console errors

- [ ] **Step 3: Check git status is clean**

```bash
git status
```
Expected: working tree clean. If any uncommitted files, decide whether to commit or discard.

- [ ] **Step 4: Tell Chris**

Dashboard v1 er færdig. Han kan starte med `cd dashboard && npm run dev` og se det selv. Når han har klikket sig igennem, kan vi diskutere fase 2 (BigQuery-integration).

---

## Self-review notes

**Spec coverage:**
- Visual identity (waterfall + crystal glass): Tasks 3, 4, 5 ✓
- Layout (top-nav + tabs + period selector): Task 9 ✓
- All 7 sections: Tasks 10-16 ✓
- Auth (password gate): Task 8 ✓
- File structure matches spec: ✓
- Bevidst IKKE i v1 (BigQuery, Postgres, AI-insights, deploy): not implemented, correctly deferred ✓

**Type consistency:** All types defined in Task 6 are used identically in Tasks 7-16. KPI fields (`label`, `value`, `trend`, `trendDirection`), Campaign fields, etc. all match.

**Placeholders:** None — every step has concrete code or commands.
