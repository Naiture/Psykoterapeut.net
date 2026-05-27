import { GlassCard } from "@/components/glass-card";
import { KpiCard } from "@/components/kpi-card";
import { SectionHeading } from "@/components/section-heading";
import { ConversionsChart } from "@/components/conversions-chart";
import { changeLog } from "@/lib/fixtures/change-log";
import { getKpis, getConversionsOverTime } from "@/lib/bq/queries/kpis";

export const revalidate = 3600;

export default async function OversigtPage() {
  const [kpis, conversionsOverTime] = await Promise.all([
    getKpis(),
    getConversionsOverTime(30),
  ]);

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
          <ConversionsChart data={conversionsOverTime} />
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
