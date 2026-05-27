import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import { campaigns } from "@/lib/fixtures/campaigns";

export default function KampagnerPage() {
  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Kampagner</SectionHeading>
      <GlassCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/65">
              <th className="px-5 py-3 text-left">Kampagne</th>
              <th className="px-5 py-3 text-right">Klik</th>
              <th className="px-5 py-3 text-right">Conv.</th>
              <th className="px-5 py-3 text-right">Conv. rate</th>
              <th className="px-5 py-3 text-right">Spend</th>
              <th className="px-5 py-3 text-right">CPA</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.name} className="border-b border-white/5 last:border-0 text-white/90 drop-shadow">
                <td className="px-5 py-3 font-medium">{c.name}</td>
                <td className="px-5 py-3 text-right tabular-nums">{c.clicks.toLocaleString("da-DK")}</td>
                <td className="px-5 py-3 text-right tabular-nums">{c.conversions}</td>
                <td className="px-5 py-3 text-right tabular-nums">{c.conversionRate.toFixed(2)}%</td>
                <td className="px-5 py-3 text-right tabular-nums">{c.spendKr.toLocaleString("da-DK")} kr</td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {c.cpaKr > 0 ? `${c.cpaKr} kr` : "—"}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={
                      c.status === "active"
                        ? "rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-200"
                        : "rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/70"
                    }
                  >
                    {c.status === "active" ? "Aktiv" : "Pause"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
