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
