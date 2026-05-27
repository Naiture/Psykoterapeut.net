import { GlassCard } from "@/components/glass-card";
import type { ChangeLogEntry } from "@/lib/types";

const CATEGORY_COLORS: Record<ChangeLogEntry["category"], string> = {
  kampagne: "bg-blue-400/20 text-blue-100",
  keyword: "bg-emerald-400/20 text-emerald-100",
  "landing-page": "bg-violet-400/20 text-violet-100",
  seo: "bg-amber-400/20 text-amber-100",
  andet: "bg-white/15 text-white/80",
};

export function ChangeLogEntryView({ entry }: { entry: ChangeLogEntry }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${CATEGORY_COLORS[entry.category]}`}
        >
          {entry.category}
        </span>
        <span className="text-xs text-white/65 drop-shadow">
          {new Date(entry.timestamp).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="ml-auto text-xs text-white/55 drop-shadow">{entry.author}</span>
      </div>
      <h3 className="mt-2 text-base font-medium text-white drop-shadow">{entry.title}</h3>
      <p className="mt-1 text-sm text-white/80 drop-shadow">{entry.description}</p>
      <div className="mt-3 text-xs text-[#ffd09a] drop-shadow">
        Forventet effekt: {entry.expectedImpact}
      </div>
    </GlassCard>
  );
}
