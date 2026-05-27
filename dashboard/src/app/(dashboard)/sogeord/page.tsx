import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import { topConverting, wastedSpend } from "@/lib/fixtures/keywords";
import type { Keyword } from "@/lib/types";

function KeywordTable({ keywords }: { keywords: Keyword[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/65">
          <th className="px-4 py-2.5 text-left">Søgeord</th>
          <th className="px-4 py-2.5 text-right">Volumen</th>
          <th className="px-4 py-2.5 text-right">Klik</th>
          <th className="px-4 py-2.5 text-right">Conv.</th>
          <th className="px-4 py-2.5 text-right">Spend</th>
        </tr>
      </thead>
      <tbody>
        {keywords.map((k) => (
          <tr key={k.term} className="border-b border-white/5 last:border-0 text-white/90 drop-shadow">
            <td className="px-4 py-2.5">{k.term}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.searchVolume.toLocaleString("da-DK")}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.clicks}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.conversions}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.spendKr} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function SogeordPage() {
  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Søgeord</SectionHeading>
      <div className="grid gap-3 lg:grid-cols-2">
        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">Top konverterende</div>
          <KeywordTable keywords={topConverting} />
        </GlassCard>
        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">Wasted spend (ingen conversions)</div>
          <KeywordTable keywords={wastedSpend} />
        </GlassCard>
      </div>
    </div>
  );
}
