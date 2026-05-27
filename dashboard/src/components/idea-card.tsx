import { GlassCard } from "@/components/glass-card";
import type { Idea } from "@/lib/types";

const STATUS: Record<Idea["status"], { emoji: string; label: string }> = {
  "frø": { emoji: "🌱", label: "Frø" },
  "udfoldet": { emoji: "🌿", label: "Udfoldet" },
  "test": { emoji: "⚗️", label: "Test" },
  "implementeret": { emoji: "✅", label: "Implementeret" },
  "forkastet": { emoji: "❌", label: "Forkastet" },
};

const IMPACT_COLOR: Record<Idea["impact"], string> = {
  "lav": "text-white/55",
  "medium": "text-white/80",
  "høj": "text-[#ffd09a]",
};

export function IdeaCardView({ idea }: { idea: Idea }) {
  const status = STATUS[idea.status];
  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium text-white drop-shadow">{idea.title}</h3>
        <span className="shrink-0 text-lg" title={status.label}>{status.emoji}</span>
      </div>
      <p className="text-sm text-white/80 drop-shadow line-clamp-3">{idea.description}</p>
      <div className="flex flex-wrap gap-1">
        {idea.tags.map((t) => (
          <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/75">
            {t}
          </span>
        ))}
      </div>
      <div className="flex justify-between border-t border-white/10 pt-3 text-[11px] text-white/65 drop-shadow">
        <span>Foreslået af {idea.proposedBy}</span>
        <span>
          {idea.effortHours}h · <span className={IMPACT_COLOR[idea.impact]}>impact: {idea.impact}</span>
        </span>
      </div>
    </GlassCard>
  );
}
