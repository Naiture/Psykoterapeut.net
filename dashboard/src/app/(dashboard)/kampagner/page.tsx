import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import { ADS_CAMPAIGNS_SNAPSHOT, ADS_SNAPSHOT_PERIOD } from "@/lib/ads/snapshot";

export const revalidate = 3600;

function StatusBadge({ status }: { status: "active" | "paused" | "other" }) {
  if (status === "active") {
    return (
      <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-200">
        Aktiv
      </span>
    );
  }
  if (status === "paused") {
    return (
      <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] text-amber-200">
        På pause
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/70">
      —
    </span>
  );
}

export default function KampagnerPage() {
  const campaigns = [...ADS_CAMPAIGNS_SNAPSHOT].sort((a, b) => b.costKr - a.costKr);
  const totals = campaigns.reduce(
    (acc, c) => ({
      clicks: acc.clicks + c.clicks,
      impressions: acc.impressions + c.impressions,
      costKr: acc.costKr + c.costKr,
      conversions: acc.conversions + c.conversions,
    }),
    { clicks: 0, impressions: 0, costKr: 0, conversions: 0 },
  );

  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Kampagner</SectionHeading>
      <p className="text-[11px] text-white/65 drop-shadow">
        Ads-snapshot · {ADS_SNAPSHOT_PERIOD} · skifter til live BigQuery når transfer'en har nok historik
      </p>

      <GlassCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/65">
              <th className="px-4 py-3 text-left">Kampagne</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Dagl. budget</th>
              <th className="px-4 py-3 text-right">Opt. score</th>
              <th className="px-4 py-3 text-right">Klik</th>
              <th className="px-4 py-3 text-right">CTR</th>
              <th className="px-4 py-3 text-right">Spend</th>
              <th className="px-4 py-3 text-right">Conv.</th>
              <th className="px-4 py-3 text-right">CPA</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const cpa = c.conversions > 0 ? c.costKr / c.conversions : 0;
              const optColor =
                c.optimizationScorePct >= 90
                  ? "text-emerald-200"
                  : c.optimizationScorePct >= 70
                    ? "text-amber-200"
                    : "text-white/65";
              return (
                <tr key={c.name} className="border-b border-white/5 last:border-0 text-white/90 drop-shadow">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {c.dailyBudgetKr > 0 ? `${c.dailyBudgetKr.toFixed(0)} kr` : "—"}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${optColor}`}>
                    {c.optimizationScorePct > 0 ? `${c.optimizationScorePct.toFixed(0)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.clicks.toLocaleString("da-DK")}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.ctrPct.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {Math.round(c.costKr).toLocaleString("da-DK")} kr
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.conversions.toFixed(0)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {cpa > 0 ? `${Math.round(cpa).toLocaleString("da-DK")} kr` : "—"}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t border-white/15 bg-white/[0.03] font-medium text-white drop-shadow">
              <td className="px-4 py-3">I alt</td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3" />
              <td className="px-4 py-3" />
              <td className="px-4 py-3 text-right tabular-nums">{totals.clicks.toLocaleString("da-DK")}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {totals.impressions > 0
                  ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {Math.round(totals.costKr).toLocaleString("da-DK")} kr
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{totals.conversions.toFixed(0)}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {totals.conversions > 0
                  ? `${Math.round(totals.costKr / totals.conversions).toLocaleString("da-DK")} kr`
                  : "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
