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
