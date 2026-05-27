"use client";

import { useEffect, useState, DragEvent } from "react";
import { GlassCard } from "@/components/glass-card";
import type { Idea, IdeaStatus } from "@/lib/types";

const COLUMNS: { status: IdeaStatus; emoji: string; label: string }[] = [
  { status: "idé", emoji: "💡", label: "Idé" },
  { status: "planlagt", emoji: "🗓️", label: "Planlagt" },
  { status: "test", emoji: "⚗️", label: "Test" },
  { status: "implementeret", emoji: "✅", label: "Implementeret" },
];

const STORAGE_KEY = "dashboard:idea-board:v1";

type Board = Record<IdeaStatus, string[]>;

const IMPACT_COLOR: Record<Idea["impact"], string> = {
  "lav": "text-white/55",
  "medium": "text-white/80",
  "høj": "text-[#ffd09a]",
};

function emptyBoard(): Board {
  return { idé: [], planlagt: [], test: [], implementeret: [] };
}

function boardFromIdeas(list: Idea[]): Board {
  const b = emptyBoard();
  for (const i of list) b[i.status].push(i.id);
  return b;
}

function readBoard(): Board | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeBoard(b: Board) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}

type DropTarget =
  | { col: IdeaStatus; index: number } // index in the column
  | null;

export function IdeaKanban({ initialIdeas }: { initialIdeas: Idea[] }) {
  const byId = Object.fromEntries(initialIdeas.map((i) => [i.id, i])) as Record<string, Idea>;
  const [board, setBoard] = useState<Board>(() => boardFromIdeas(initialIdeas));
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  // Add any new ideas (from fixture) that aren't in stored board yet
  useEffect(() => {
    const stored = readBoard();
    if (!stored) return;
    const merged: Board = emptyBoard();
    const known = new Set<string>();
    for (const col of COLUMNS.map((c) => c.status)) {
      merged[col] = (stored[col] || []).filter((id) => byId[id]);
      merged[col].forEach((id) => known.add(id));
    }
    for (const idea of initialIdeas) {
      if (!known.has(idea.id)) merged[idea.status].push(idea.id);
    }
    setBoard(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (next: Board) => {
    setBoard(next);
    writeBoard(next);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBoard(boardFromIdeas(initialIdeas));
  };

  const moveCard = (id: string, target: { col: IdeaStatus; index: number }) => {
    const next: Board = { ...board };
    // remove from current position
    for (const col of COLUMNS.map((c) => c.status)) {
      const idx = next[col].indexOf(id);
      if (idx !== -1) {
        next[col] = [...next[col]];
        next[col].splice(idx, 1);
        // if same column and we're inserting AFTER the original position, adjust
        if (col === target.col && idx < target.index) {
          target = { col: target.col, index: target.index - 1 };
        }
      }
    }
    next[target.col] = [...next[target.col]];
    next[target.col].splice(target.index, 0, id);
    persist(next);
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const onDragOverCard = (
    e: DragEvent<HTMLDivElement>,
    col: IdeaStatus,
    cardIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const beforeHalf = e.clientY < rect.top + rect.height / 2;
    const target = { col, index: beforeHalf ? cardIndex : cardIndex + 1 };
    if (!dropTarget || dropTarget.col !== target.col || dropTarget.index !== target.index) {
      setDropTarget(target);
    }
  };

  const onDragOverColumn = (e: DragEvent<HTMLDivElement>, col: IdeaStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // Only set drop target to "end of column" if no card-level handler set it
    if (!dropTarget || dropTarget.col !== col) {
      setDropTarget({ col, index: board[col].length });
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = draggedId || e.dataTransfer.getData("text/plain");
    if (id && dropTarget) moveCard(id, dropTarget);
    setDraggedId(null);
    setDropTarget(null);
  };

  const onDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {COLUMNS.map((col) => {
          const colIds = board[col.status];
          const isOver = dropTarget?.col === col.status;
          return (
            <div
              key={col.status}
              onDragOver={(e) => onDragOverColumn(e, col.status)}
              onDrop={onDrop}
              className={`rounded-2xl border transition-colors min-h-[240px] flex flex-col ${
                isOver
                  ? "border-[#ffd09a]/70 bg-white/[0.05]"
                  : "border-white/10 bg-white/[0.025]"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.emoji}</span>
                  <span className="text-xs font-medium text-white drop-shadow">{col.label}</span>
                </div>
                <span className="text-[10px] text-white/55 tabular-nums">{colIds.length}</span>
              </div>

              <div className="p-2 space-y-2 flex-1">
                {/* drop indicator at position 0 */}
                {dropTarget?.col === col.status && dropTarget.index === 0 && (
                  <DropIndicator />
                )}

                {colIds.map((id, idx) => {
                  const idea = byId[id];
                  if (!idea) return null;
                  return (
                    <div key={id}>
                      <div
                        draggable
                        onDragStart={(e) => onDragStart(e, id)}
                        onDragEnd={onDragEnd}
                        onDragOver={(e) => onDragOverCard(e, col.status, idx)}
                        onDrop={onDrop}
                        className={`cursor-grab active:cursor-grabbing transition-opacity ${
                          draggedId === id ? "opacity-30" : ""
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

                      {/* drop indicator AFTER this card */}
                      {dropTarget?.col === col.status && dropTarget.index === idx + 1 && (
                        <div className="mt-2"><DropIndicator /></div>
                      )}
                    </div>
                  );
                })}

                {colIds.length === 0 && (
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

function DropIndicator() {
  return (
    <div
      className="h-1 rounded-full bg-[#ffd09a] shadow-[0_0_10px_rgba(255,208,154,0.7)]"
      aria-hidden
    />
  );
}
