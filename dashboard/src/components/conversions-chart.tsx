"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { conversionsOverTime } from "@/lib/fixtures/kpis";
import { changeLog } from "@/lib/fixtures/change-log";

export function ConversionsChart() {
  const annotations = changeLog
    .map((c) => ({
      date: c.timestamp.slice(0, 10),
      title: c.title,
    }))
    .filter((a) => conversionsOverTime.some((d) => d.date === a.date));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={conversionsOverTime} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="conv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffd09a" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#ffd09a" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 10 }}
            tickFormatter={(d: string) => d.slice(5)}
            stroke="rgba(255,255,255,0.2)"
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 10 }}
            stroke="rgba(255,255,255,0.2)"
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
            }}
          />
          {annotations.map((a) => (
            <ReferenceLine
              key={a.date}
              x={a.date}
              stroke="#ffc080"
              strokeDasharray="3 3"
              label={{ value: "•", fill: "#ffc080", fontSize: 18, position: "top" }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="conversions"
            stroke="#ffd09a"
            strokeWidth={2}
            fill="url(#conv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
