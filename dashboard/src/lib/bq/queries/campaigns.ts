import { bq, ADS_DATASET, ADS_CUSTOMER_ID } from "../client";
import type { Campaign } from "@/lib/types";

export async function getCampaigns(days = 30): Promise<Campaign[]> {
  const sql = `
    WITH stats AS (
      SELECT
        campaign_id,
        SUM(metrics_clicks) AS clicks,
        SUM(metrics_conversions) AS conv,
        SUM(metrics_cost_micros) / 1e6 AS spend_kr,
        SUM(metrics_impressions) AS impressions
      FROM \`${ADS_DATASET}.ads_CampaignBasicStats_${ADS_CUSTOMER_ID}\`
      WHERE segments_date >= DATE_SUB(CURRENT_DATE(), INTERVAL @days DAY)
      GROUP BY campaign_id
    ),
    latest AS (
      SELECT
        campaign_id,
        ANY_VALUE(campaign_name) AS name,
        ANY_VALUE(campaign_status) AS status
      FROM \`${ADS_DATASET}.ads_Campaign_${ADS_CUSTOMER_ID}\`
      WHERE _DATA_DATE = _LATEST_DATE
      GROUP BY campaign_id
    )
    SELECT
      COALESCE(l.name, CAST(s.campaign_id AS STRING)) AS name,
      CAST(s.clicks AS INT64) AS clicks,
      s.conv,
      s.spend_kr,
      l.status
    FROM stats s
    LEFT JOIN latest l USING (campaign_id)
    ORDER BY s.spend_kr DESC
  `;
  const [rows] = await bq().query({ query: sql, params: { days } });
  return rows.map((r: { name: string; clicks: number; conv: number | null; spend_kr: number | null; status: string | null }) => {
    const clicks = Number(r.clicks ?? 0);
    const conv = Number(r.conv ?? 0);
    const spendKr = Number(r.spend_kr ?? 0);
    return {
      name: r.name,
      clicks,
      conversions: Math.round(conv * 10) / 10,
      conversionRate: clicks > 0 ? Math.round((conv / clicks) * 10000) / 100 : 0,
      spendKr: Math.round(spendKr),
      cpaKr: conv > 0 ? Math.round(spendKr / conv) : 0,
      status: r.status === "ENABLED" ? "active" : "paused",
    };
  });
}
