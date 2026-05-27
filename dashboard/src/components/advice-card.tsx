"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/glass-card";
import type { Advice } from "@/lib/types";

const TONE_STYLES: Record<Advice["tone"], { label: string; color: string }> = {
  observation: { label: "Observation", color: "bg-sky-400/20 text-sky-100" },
  anbefaling: { label: "Anbefaling", color: "bg-emerald-400/20 text-emerald-100" },
  advarsel: { label: "Advarsel", color: "bg-rose-400/20 text-rose-100" },
  mulighed: { label: "Mulighed", color: "bg-amber-400/20 text-amber-100" },
};

const IMPACT_LABEL: Record<Advice["estimatedImpact"], string> = {
  lav: "Lav impact",
  medium: "Medium impact",
  høj: "Høj impact",
};

type Status = "open" | "accepted" | "later" | "dismissed";

const STORAGE_KEY = "dashboard:advice-status";

function readStatus(): Record<string, Status> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStatus(map: Record<string, Status>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function AdviceCard({ advice }: { advice: Advice }) {
  const [status, setStatus] = useState<Status>("open");
  const tone = TONE_STYLES[advice.tone];

  useEffect(() => {
    const map = readStatus();
    if (map[advice.id]) setStatus(map[advice.id]);
  }, [advice.id]);

  const update = (next: Status) => {
    setStatus(next);
    const map = readStatus();
    map[advice.id] = next;
    writeStatus(map);
  };

  if (status === "dismissed") return null;

  return (
    <GlassCard className="p-7 space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${tone.color}`}>
          {tone.label}
        </span>
        <span className="text-[11px] text-white/55 drop-shadow">{IMPACT_LABEL[advice.estimatedImpact]}</span>
        {advice.estimatedEffortHours > 0 && (
          <span className="text-[11px] text-white/55 drop-shadow">
            ~{advice.estimatedEffortHours}t arbejde
          </span>
        )}
      </div>

      <h3 className="font-serif text-xl text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] leading-snug">
        {advice.headline}
      </h3>

      <p className="text-[15px] leading-relaxed text-white/85 drop-shadow">
        {advice.body}
      </p>

      <div className="rounded-xl border border-white/15 bg-white/5 p-4 space-y-1">
        <div className="text-[10px] uppercase tracking-wider text-[#ffd09a] drop-shadow">Anbefalet handling</div>
        <div className="text-sm font-medium text-white drop-shadow">{advice.actionTitle}</div>
        <div className="text-xs text-white/72 drop-shadow">{advice.actionDescription}</div>
      </div>

      {status === "open" && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => update("accepted")}
            className="rounded-lg border border-emerald-300/40 bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-50 backdrop-blur-sm hover:bg-emerald-400/25 transition"
          >
            Ja tak — føj til idé-banken
          </button>
          <button
            onClick={() => update("later")}
            className="rounded-lg border border-white/20 bg-white/8 px-4 py-2 text-sm text-white/85 hover:bg-white/15 transition"
          >
            Senere
          </button>
          <button
            onClick={() => update("dismissed")}
            className="rounded-lg px-4 py-2 text-sm text-white/55 hover:text-white/85 transition"
          >
            Forkast
          </button>
        </div>
      )}

      {status === "accepted" && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-sm text-emerald-200 drop-shadow">
            ✓ Tilføjet til idé-banken som <span className="italic">&ldquo;{advice.actionTitle}&rdquo;</span>
          </div>
          <button
            onClick={() => update("open")}
            className="text-xs text-white/55 hover:text-white/85 underline"
          >
            Fortryd
          </button>
        </div>
      )}

      {status === "later" && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-sm text-white/65 drop-shadow">Gemt til senere</div>
          <button
            onClick={() => update("open")}
            className="text-xs text-white/55 hover:text-white/85 underline"
          >
            Tag op igen
          </button>
        </div>
      )}
    </GlassCard>
  );
}
