"use client";

import { useState } from "react";

const PERIODS: { value: string; label: string }[] = [
  { value: "7d", label: "Sidste 7 dage" },
  { value: "30d", label: "Sidste 30 dage" },
  { value: "90d", label: "Sidste 90 dage" },
];

export function PeriodSelector() {
  const [value, setValue] = useState("30d");
  const [open, setOpen] = useState(false);
  const current = PERIODS.find((p) => p.value === value) ?? PERIODS[1];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-white/22 px-3 py-1.5 text-xs text-white drop-shadow hover:bg-white/10"
      >
        {current.label} ▾
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-lg border border-white/20 bg-black/60 backdrop-blur-xl shadow-xl z-50">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => {
                setValue(p.value);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-xs text-white/85 hover:bg-white/10"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
