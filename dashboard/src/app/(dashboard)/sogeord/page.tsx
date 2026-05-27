import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import { getTopConverting, getWastedSpend } from "@/lib/bq/queries/keywords";
import type { Keyword } from "@/lib/types";

export const revalidate = 3600;

function KeywordTable({ keywords, emptyText }: { keywords: Keyword[]; emptyText: string }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/65">
          <th className="px-4 py-2.5 text-left">Søgeord</th>
          <th className="px-4 py-2.5 text-right">Klik</th>
          <th className="px-4 py-2.5 text-right">Conv.</th>
          <th className="px-4 py-2.5 text-right">Spend</th>
        </tr>
      </thead>
      <tbody>
        {keywords.map((k) => (
          <tr key={k.term} className="border-b border-white/5 last:border-0 text-white/90 drop-shadow">
            <td className="px-4 py-2.5">{k.term}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.clicks}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.conversions}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.spendKr} kr</td>
          </tr>
        ))}
        {keywords.length === 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-6 text-center text-white/60 drop-shadow">
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default async function SogeordPage() {
  const [topConverting, wastedSpend] = await Promise.all([
    getTopConverting(30, 10),
    getWastedSpend(30, 10),
  ]);

  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Søgeord</SectionHeading>
      <div className="grid gap-3 lg:grid-cols-2">
        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">Top performing</div>
          <p className="px-4 text-[11px] text-white/65 drop-shadow">Sidste 30 dage · sorteret efter conversions, så klik</p>
          <KeywordTable keywords={topConverting} emptyText="Ingen søgeord-data i de sidste 30 dage." />
        </GlassCard>
        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">Wasted spend (ingen conversions)</div>
          <p className="px-4 text-[11px] text-white/65 drop-shadow">Sidste 30 dage · har kostet penge uden at konvertere</p>
          <KeywordTable keywords={wastedSpend} emptyText="Ingen spildt budget — eller for lidt data endnu." />
        </GlassCard>
      </div>
    </div>
  );
}
