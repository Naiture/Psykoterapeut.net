"use client";

import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { Evidence } from "@/lib/types";

const TREND_COLOR = {
  up: "text-emerald-300",
  down: "text-rose-300",
  flat: "text-white/70",
} as const;

export function EvidenceView({ evidence }: { evidence: Evidence }) {
  if (evidence.kind === "stats") {
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${evidence.items.length}, minmax(0, 1fr))` }}>
        {evidence.items.map((stat, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="text-[10px] uppercase tracking-wider text-white/65 drop-shadow">
              {stat.label}
            </div>
            <div className="mt-1 text-xl font-semibold text-white drop-shadow tabular-nums">
              {stat.value}
            </div>
            {stat.sub && (
              <div
                className={`mt-0.5 text-[11px] drop-shadow ${stat.trend ? TREND_COLOR[stat.trend] : "text-white/60"}`}
              >
                {stat.sub}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (evidence.kind === "sparkline") {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-white/65 drop-shadow">
            {evidence.label}
          </div>
          {evidence.caption && (
            <div className="text-[11px] text-[#ffd09a] drop-shadow">{evidence.caption}</div>
          )}
        </div>
        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evidence.data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd09a" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#ffd09a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="y"
                stroke="#ffd09a"
                strokeWidth={1.5}
                fill="url(#spark)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // bars
  const max = Math.max(...evidence.items.map((i) => i.value));
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-white/65 drop-shadow">
        {evidence.label}
      </div>
      <div className="space-y-1.5">
        {evidence.items.map((bar, i) => {
          const pct = (bar.value / max) * 100;
          return (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-32 shrink-0 truncate text-white/82 drop-shadow">
                {bar.label}
              </span>
              <div className="relative flex-1 h-5 rounded bg-white/5 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{
                    width: `${pct}%`,
                    background: bar.highlight
                      ? "linear-gradient(90deg, #ffd09a, #ffc080)"
                      : "linear-gradient(90deg, rgba(255,255,255,0.35), rgba(255,255,255,0.18))",
                  }}
                />
              </div>
              <span className="w-20 text-right tabular-nums text-white/82 drop-shadow">
                {bar.value.toLocaleString("da-DK")}
                {evidence.unit && ` ${evidence.unit}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
