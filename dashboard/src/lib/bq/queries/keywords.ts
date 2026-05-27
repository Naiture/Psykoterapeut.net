import { bq, ADS_DATASET, ADS_CUSTOMER_ID } from "../client";
import type { Keyword } from "@/lib/types";

interface RawKeyword {
  term: string;
  clicks: number;
  conv: number | null;
  spend_kr: number | null;
}

async function queryKeywords(days: number): Promise<Keyword[]> {
  const sql = `
    WITH stats AS (
      SELECT
        ad_group_criterion_criterion_id AS crit_id,
        SUM(metrics_clicks) AS clicks,
        SUM(metrics_conversions) AS conv,
        SUM(metrics_cost_micros) / 1e6 AS spend_kr
      FROM \`${ADS_DATASET}.ads_KeywordBasicStats_${ADS_CUSTOMER_ID}\`
      WHERE segments_date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
      GROUP BY crit_id
    ),
    latest AS (
      SELECT
        ad_group_criterion_criterion_id AS crit_id,
        ANY_VALUE(ad_group_criterion_keyword_text) AS term,
        ANY_VALUE(ad_group_criterion_negative) AS is_neg
      FROM \`${ADS_DATASET}.ads_Keyword_${ADS_CUSTOMER_ID}\`
      WHERE _DATA_DATE = _LATEST_DATE
      GROUP BY crit_id
    )
    SELECT
      l.term,
      CAST(s.clicks AS INT64) AS clicks,
      s.conv,
      s.spend_kr
    FROM stats s
    LEFT JOIN latest l USING (crit_id)
    WHERE l.is_neg = FALSE AND l.term IS NOT NULL
  `;
  const [rows] = await bq().query({ query: sql, params: { days } });
  return (rows as RawKeyword[]).map((r) => ({
    term: r.term,
    searchVolume: 0,
    clicks: Number(r.clicks ?? 0),
    conversions: Math.round(Number(r.conv ?? 0) * 10) / 10,
    spendKr: Math.round(Number(r.spend_kr ?? 0)),
  }));
}

export async function getTopConverting(days = 30, limit = 10): Promise<Keyword[]> {
  const all = await queryKeywords(days);
  return all
    .sort((a, b) => b.conversions - a.conversions || b.clicks - a.clicks)
    .slice(0, limit);
}

export async function getWastedSpend(days = 30, limit = 10): Promise<Keyword[]> {
  const all = await queryKeywords(days);
  return all
    .filter((k) => k.conversions === 0 && k.spendKr > 0)
    .sort((a, b) => b.spendKr - a.spendKr)
    .slice(0, limit);
}
