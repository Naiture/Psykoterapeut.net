"use client";

import { useEffect, useState, DragEvent } from "react";
import { GlassCard } from "@/components/glass-card";
import type { Idea, IdeaStatus } from "@/lib/types";

const COLUMNS: { status: IdeaStatus; emoji: string; label: string }[] = [
  { status: "frø", emoji: "🌱", label: "Frø" },
  { status: "udfoldet", emoji: "🌿", label: "Udfoldet" },
  { status: "test", emoji: "⚗️", label: "Test" },
  { status: "implementeret", emoji: "✅", label: "Implementeret" },
  { status: "forkastet", emoji: "❌", label: "Forkastet" },
];

const STORAGE_KEY = "dashboard:idea-status";

const IMPACT_COLOR: Record<Idea["impact"], string> = {
  "lav": "text-white/55",
  "medium": "text-white/80",
  "høj": "text-[#ffd09a]",
};

function readOverrides(): Record<string, IdeaStatus> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeOverrides(map: Record<string, IdeaStatus>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function IdeaKanban({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [dragOverCol, setDragOverCol] = useState<IdeaStatus | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const overrides = readOverrides();
    if (Object.keys(overrides).length === 0) return;
    setIdeas((prev) =>
      prev.map((idea) =>
        overrides[idea.id] ? { ...idea, status: overrides[idea.id] } : idea
      )
    );
  }, []);

  const moveIdea = (id: string, newStatus: IdeaStatus) => {
    setIdeas((prev) => {
      const next = prev.map((idea) => (idea.id === id ? { ...idea, status: newStatus } : idea));
      const overrides = readOverrides();
      overrides[id] = newStatus;
      writeOverrides(overrides);
      return next;
    });
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIdeas(initialIdeas);
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>, status: IdeaStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== status) setDragOverCol(status);
  };

  const onDragLeave = () => setDragOverCol(null);

  const onDrop = (e: DragEvent<HTMLDivElement>, status: IdeaStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedId;
    if (id) moveIdea(id, status);
    setDragOverCol(null);
    setDraggedId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={reset}
          className="text-[11px] text-white/55 hover:text-white/85 underline drop-shadow"
        >
          Nulstil til standard
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {COLUMNS.map((col) => {
          const colIdeas = ideas.filter((i) => i.status === col.status);
          const isOver = dragOverCol === col.status;
          return (
            <div
              key={col.status}
              onDragOver={(e) => onDragOver(e, col.status)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, col.status)}
              className={`rounded-2xl border transition-colors min-h-[200px] ${
                isOver
                  ? "border-[#ffd09a] bg-white/[0.06]"
                  : "border-white/10 bg-white/[0.025]"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.emoji}</span>
                  <span className="text-xs font-medium text-white drop-shadow">{col.label}</span>
                </div>
                <span className="text-[10px] text-white/55 tabular-nums">{colIdeas.length}</span>
              </div>

              <div className="p-2 space-y-2">
                {colIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, idea.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={`cursor-grab active:cursor-grabbing transition-opacity ${
                      draggedId === idea.id ? "opacity-40" : ""
                    }`}
                  >
                    <GlassCard className="p-3 space-y-2">
                      <div className="text-xs font-medium text-white drop-shadow leading-snug">
                        {idea.title}
                      </div>
                      <div className="text-[11px] text-white/72 drop-shadow line-clamp-2 leading-relaxed">
                        {idea.description}
                      </div>
                      {idea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {idea.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-white/8 px-1.5 py-0.5 text-[9px] text-white/70"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-white/55">
                        <span>{idea.proposedBy}</span>
                        <span>
                          {idea.effortHours}t ·{" "}
                          <span className={IMPACT_COLOR[idea.impact]}>{idea.impact}</span>
                        </span>
                      </div>
                    </GlassCard>
                  </div>
                ))}

                {colIdeas.length === 0 && (
                  <div className="text-center py-6 text-[11px] text-white/35 italic">
                    Træk en idé hertil
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
