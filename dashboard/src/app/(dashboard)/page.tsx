import { GlassCard } from "@/components/glass-card";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeading } from "@/components/section-heading";
import { CampaignConversionsChart } from "@/components/campaign-conversions-chart";
import { changeLog } from "@/lib/fixtures/change-log";
import { ADS_CAMPAIGNS_SNAPSHOT, ADS_SNAPSHOT_PERIOD } from "@/lib/ads/snapshot";
import type { Kpi } from "@/lib/types";

export const revalidate = 3600;

const dkrFmt = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 });

function getSnapshotKpis(): Kpi[] {
  const totals = ADS_CAMPAIGNS_SNAPSHOT.reduce(
    (acc, c) => ({
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + c.conversions,
      spend: acc.spend + c.costKr,
    }),
    { clicks: 0, conversions: 0, spend: 0 },
  );
  const cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  return [
    { label: "Klik", value: dkrFmt.format(totals.clicks), trend: "9 mdr snapshot", trendDirection: "flat" },
    { label: "Conversions", value: dkrFmt.format(totals.conversions), trend: "19 kontakter + 18 formularer", trendDirection: "up" },
    { label: "Ad spend", value: `${dkrFmt.format(Math.round(totals.spend))} kr`, trend: "9 mdr i alt", trendDirection: "flat" },
    { label: "CPA", value: cpa > 0 ? `${dkrFmt.format(Math.round(cpa))} kr` : "—", trend: "konto-snit", trendDirection: "flat" },
  ];
}

export default function OversigtPage() {
  const kpis = getSnapshotKpis();
  const chartData = ADS_CAMPAIGNS_SNAPSHOT.map((c) => ({
    name: c.name,
    conversions: c.conversions,
    cpa: c.conversions > 0 ? c.costKr / c.conversions : 0,
    status: c.status,
  })).sort((a, b) => b.conversions - a.conversions);

  return (
    <div className="space-y-4 mt-2">
      <p className="text-[11px] text-white/65 drop-shadow">
        Ads-snapshot · {ADS_SNAPSHOT_PERIOD} · live BigQuery overtager når daily-transfer'en har nok historik
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionHeading className="text-base">Conversions pr. kampagne</SectionHeading>
          <p className="text-[11px] text-white/72 drop-shadow mb-3">
            9 måneders snapshot · paused kampagner vist med mat farve
          </p>
          <CampaignConversionsChart data={chartData} />
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
