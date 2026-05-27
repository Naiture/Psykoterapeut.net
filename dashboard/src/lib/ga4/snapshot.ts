/**
 * GA4 snapshot — manually exported from analytics.google.com on 2026-05-27.
 * Covers 2026-01-01 → 2026-05-27 (YTD).
 *
 * Will be replaced by live BigQuery query once the GA4→BQ export starts producing
 * data (set up in a separate session — first sync expected ~2026-05-28).
 *
 * Raw CSVs preserved in `dashboard/data/ga4-snapshot-2026-05-27/`.
 */

import type { LandingPage } from "@/lib/types";

export const SNAPSHOT_DATE = "2026-05-27";
export const SNAPSHOT_PERIOD = "1. jan – 27. maj 2026";

interface RawLandingPage {
  path: string;
  sessions: number;
  activeUsers: number;
  newUsers: number;
  avgEngagementSeconds: number;
  keyEvents: number;
  sessionKeyEventRate: number; // 0..1
}

const RAW_LANDING_PAGES: RawLandingPage[] = [
  { path: "/terapi-mod-stress", sessions: 424, activeUsers: 410, newUsers: 408, avgEngagementSeconds: 34.22, keyEvents: 1, sessionKeyEventRate: 0.00236 },
  { path: "/angst-behandling-i-aarhus-psykoterapeut-inger-marie-graversen", sessions: 322, activeUsers: 297, newUsers: 292, avgEngagementSeconds: 38.45, keyEvents: 12, sessionKeyEventRate: 0.03416 },
  { path: "/terapi", sessions: 160, activeUsers: 151, newUsers: 146, avgEngagementSeconds: 61.14, keyEvents: 9, sessionKeyEventRate: 0.025 },
  { path: "/", sessions: 138, activeUsers: 94, newUsers: 89, avgEngagementSeconds: 92.66, keyEvents: 2, sessionKeyEventRate: 0.00725 },
  { path: "/om", sessions: 64, activeUsers: 59, newUsers: 54, avgEngagementSeconds: 32.06, keyEvents: 1, sessionKeyEventRate: 0.01563 },
  { path: "/eksempel-side", sessions: 22, activeUsers: 18, newUsers: 11, avgEngagementSeconds: 6.91, keyEvents: 1, sessionKeyEventRate: 0.04545 },
  { path: "/online-terapi", sessions: 16, activeUsers: 16, newUsers: 15, avgEngagementSeconds: 24.19, keyEvents: 0, sessionKeyEventRate: 0 },
  { path: "/book-samtale", sessions: 11, activeUsers: 11, newUsers: 5, avgEngagementSeconds: 113.09, keyEvents: 2, sessionKeyEventRate: 0.18182 },
  { path: "/praktiske-oplysninger", sessions: 7, activeUsers: 5, newUsers: 2, avgEngagementSeconds: 15.86, keyEvents: 0, sessionKeyEventRate: 0 },
  { path: "/tak-for-booking", sessions: 6, activeUsers: 5, newUsers: 3, avgEngagementSeconds: 3.17, keyEvents: 6, sessionKeyEventRate: 1 },
  { path: "/klienthistorier", sessions: 5, activeUsers: 4, newUsers: 4, avgEngagementSeconds: 7, keyEvents: 0, sessionKeyEventRate: 0 },
  { path: "/relationsterapi", sessions: 4, activeUsers: 2, newUsers: 1, avgEngagementSeconds: 11.75, keyEvents: 0, sessionKeyEventRate: 0 },
  { path: "/traumebehandling", sessions: 2, activeUsers: 2, newUsers: 2, avgEngagementSeconds: 0, keyEvents: 0, sessionKeyEventRate: 0 },
  { path: "/faciliteter", sessions: 1, activeUsers: 1, newUsers: 1, avgEngagementSeconds: 0, keyEvents: 0, sessionKeyEventRate: 0 },
];

// Excluded from display: /tag/* archives, /wp-login, /checkout, /our-doctors,
// /eksempel-side, (not set). Tracked here for transparency.
const EXCLUDED_PATHS = new Set<string>([
  "/eksempel-side",
  "/tak-for-booking",
  "(not set)",
]);

const EXCLUDED_PREFIXES = ["/tag/", "/wp-", "/checkout", "/our-doctors"];

export function getLandingPagesFromSnapshot(): LandingPage[] {
  return RAW_LANDING_PAGES
    .filter((r) => !EXCLUDED_PATHS.has(r.path))
    .filter((r) => !EXCLUDED_PREFIXES.some((p) => r.path.startsWith(p)))
    .map((r) => ({
      url: r.path,
      sessions: r.sessions,
      conversionRate: Math.round(r.sessionKeyEventRate * 1000) / 10, // -> percent with 1 decimal
      avgTimeSeconds: Math.round(r.avgEngagementSeconds),
    }));
}

interface RawEvent {
  name: string;
  count: number;
  totalUsers: number;
  keyEvents: number;
}

export const RAW_EVENTS: RawEvent[] = [
  { name: "page_view", count: 2212, totalUsers: 1050, keyEvents: 0 },
  { name: "user_engagement", count: 1665, totalUsers: 639, keyEvents: 0 },
  { name: "session_start", count: 1225, totalUsers: 1050, keyEvents: 0 },
  { name: "first_visit", count: 1044, totalUsers: 1044, keyEvents: 0 },
  { name: "scroll", count: 664, totalUsers: 268, keyEvents: 0 },
  { name: "click", count: 62, totalUsers: 46, keyEvents: 0 },
  { name: "Book_Gratis_Samtale", count: 21, totalUsers: 15, keyEvents: 21 },
  { name: "Click Phone Number", count: 13, totalUsers: 10, keyEvents: 13 },
  { name: "Click Mail Links", count: 3, totalUsers: 3, keyEvents: 0 },
];

interface RawSource {
  sourceMedium: string;
  campaign: string;
  sessions: number;
  engagedSessions: number;
  engagementRate: number;
  keyEvents: number;
}

export const RAW_TRAFFIC_SOURCES: RawSource[] = [
  { sourceMedium: "google / cpc", campaign: "Stress", sessions: 430, engagedSessions: 172, engagementRate: 0.4, keyEvents: 1 },
  { sourceMedium: "google / cpc", campaign: "Angst", sessions: 336, engagedSessions: 187, engagementRate: 0.5565, keyEvents: 16 },
  { sourceMedium: "(direct) / (none)", campaign: "(direct)", sessions: 173, engagedSessions: 63, engagementRate: 0.3642, keyEvents: 8 },
  { sourceMedium: "google / cpc", campaign: "Psykoterapi i Højbjerg", sessions: 136, engagedSessions: 86, engagementRate: 0.6324, keyEvents: 9 },
  { sourceMedium: "google / organic", campaign: "(organic)", sessions: 92, engagedSessions: 59, engagementRate: 0.6413, keyEvents: 0 },
  { sourceMedium: "ads.google.com / referral", campaign: "(referral)", sessions: 12, engagedSessions: 6, engagementRate: 0.5, keyEvents: 0 },
  { sourceMedium: "(data not available)", campaign: "(cross-network)", sessions: 8, engagedSessions: 5, engagementRate: 0.625, keyEvents: 0 },
  { sourceMedium: "google / cpc", campaign: "(organic)", sessions: 8, engagedSessions: 8, engagementRate: 1, keyEvents: 0 },
  { sourceMedium: "(not set)", campaign: "(not set)", sessions: 7, engagedSessions: 2, engagementRate: 0.2857, keyEvents: 0 },
  { sourceMedium: "google / cpc", campaign: "Online Terapi", sessions: 7, engagedSessions: 7, engagementRate: 1, keyEvents: 0 },
];
