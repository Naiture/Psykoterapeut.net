import { bq, ADS_DATASET, ADS_CUSTOMER_ID } from "../client";
import type { Kpi, TrendDirection } from "@/lib/types";

interface RawTotals {
  clicks: number;
  conversions: number;
  spend_kr: number;
}

async function totalsForRange(daysAgo: number, lengthDays: number): Promise<RawTotals> {
  const sql = `
    SELECT
      COALESCE(SUM(metrics_clicks), 0) AS clicks,
      COALESCE(SUM(metrics_conversions), 0) AS conversions,
      COALESCE(SUM(metrics_cost_micros) / 1e6, 0) AS spend_kr
    FROM \`${ADS_DATASET}.ads_CampaignBasicStats_${ADS_CUSTOMER_ID}\`
    WHERE segments_date
      BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL @end DAY)
      AND DATE_SUB(CURRENT_DATE(), INTERVAL @start DAY)
  `;
  const [rows] = await bq().query({
    query: sql,
    params: { start: daysAgo, end: daysAgo + lengthDays - 1 },
  });
  const r = rows[0] ?? { clicks: 0, conversions: 0, spend_kr: 0 };
  return {
    clicks: Number(r.clicks),
    conversions: Number(r.conversions),
    spend_kr: Number(r.spend_kr),
  };
}

function formatTrend(current: number, previous: number, lowerIsBetter = false): {
  trend: string;
  trendDirection: TrendDirection;
} {
  if (previous === 0 && current === 0) return { trend: "ingen ændring", trendDirection: "flat" };
  if (previous === 0) return { trend: "ny aktivitet", trendDirection: "up" };
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(pct);
  if (rounded === 0) return { trend: "0% vs. forrige 30d", trendDirection: "flat" };
  const arrow = rounded > 0 ? "↑" : "↓";
  const goodDirection = lowerIsBetter ? rounded < 0 : rounded > 0;
  return {
    trend: `${arrow} ${Math.abs(rounded)}% vs. forrige 30d`,
    trendDirection: goodDirection ? "up" : "down",
  };
}

const dkrFmt = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 });

export async function getKpis(): Promise<Kpi[]> {
  const [current, previous] = await Promise.all([
    totalsForRange(1, 30),
    totalsForRange(31, 30),
  ]);

  const cpaCur = current.conversions > 0 ? current.spend_kr / current.conversions : 0;
  const cpaPrev = previous.conversions > 0 ? previous.spend_kr / previous.conversions : 0;

  const clicksTrend = formatTrend(current.clicks, previous.clicks);
  const convTrend = formatTrend(current.conversions, previous.conversions);
  const spendTrend = formatTrend(current.spend_kr, previous.spend_kr, true);
  const cpaTrend = formatTrend(cpaCur, cpaPrev, true);

  return [
    {
      label: "Klik",
      value: dkrFmt.format(current.clicks),
      ...clicksTrend,
    },
    {
      label: "Conversions",
      value: dkrFmt.format(Math.round(current.conversions)),
      ...convTrend,
    },
    {
      label: "Ad spend",
      value: `${dkrFmt.format(Math.round(current.spend_kr))} kr`,
      ...spendTrend,
    },
    {
      label: "CPA",
      value: cpaCur > 0 ? `${dkrFmt.format(Math.round(cpaCur))} kr` : "—",
      ...cpaTrend,
    },
  ];
}

export interface ConversionPoint {
  date: string;
  conversions: number;
}

export async function getConversionsOverTime(days = 30): Promise<ConversionPoint[]> {
  const sql = `
    SELECT
      FORMAT_DATE('%Y-%m-%d', segments_date) AS date,
      ROUND(SUM(metrics_conversions), 1) AS conversions
    FROM \`${ADS_DATASET}.ads_CampaignBasicStats_${ADS_CUSTOMER_ID}\`
    WHERE segments_date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
    GROUP BY date
    ORDER BY date
  `;
  const [rows] = await bq().query({ query: sql, params: { days } });
  return rows.map((r: { date: string; conversions: number | null }) => ({
    date: r.date,
    conversions: Number(r.conversions ?? 0),
  }));
}
