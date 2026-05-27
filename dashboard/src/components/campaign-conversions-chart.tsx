"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface CampaignBar {
  name: string;
  conversions: number;
  cpa: number;
  status: "active" | "paused" | "other";
}

interface Props {
  data: CampaignBar[];
}

export function CampaignConversionsChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{
              background: "rgba(10,10,15,0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              fontSize: 12,
              color: "white",
            }}
            formatter={(value: number, _name, ctx) => {
              const cpa = (ctx.payload as CampaignBar).cpa;
              return [`${value} conv · CPA ${cpa > 0 ? Math.round(cpa) + " kr" : "—"}`, ""];
            }}
          />
          <Bar dataKey="conversions" radius={[4, 4, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.status === "paused" ? "rgba(255,208,154,0.35)" : "#ffd09a"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
