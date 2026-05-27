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
