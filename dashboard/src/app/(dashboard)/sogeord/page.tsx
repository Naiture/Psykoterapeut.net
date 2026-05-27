import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import { ADS_KEYWORDS, ADS_SNAPSHOT_PERIOD } from "@/lib/ads/snapshot";

export const revalidate = 3600;

function MatchBadge({ type }: { type: "exact" | "phrase" | "broad" }) {
  const label = type === "exact" ? "Eksakt" : type === "phrase" ? "Sætning" : "Bredt";
  const color =
    type === "exact"
      ? "bg-emerald-400/15 text-emerald-200"
      : type === "phrase"
        ? "bg-sky-400/15 text-sky-200"
        : "bg-amber-400/15 text-amber-200";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider ${color}`}>
      {label}
    </span>
  );
}

interface RowDef {
  keyword: string;
  matchType: "exact" | "phrase" | "broad";
  campaign: string;
  clicks: number;
  conversions: number;
  costKr: number;
}

function KeywordTable({ rows, emptyText }: { rows: RowDef[]; emptyText: string }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/65">
          <th className="px-4 py-2.5 text-left">Søgeord</th>
          <th className="px-4 py-2.5 text-left">Match</th>
          <th className="px-4 py-2.5 text-left">Kampagne</th>
          <th className="px-4 py-2.5 text-right">Klik</th>
          <th className="px-4 py-2.5 text-right">Conv.</th>
          <th className="px-4 py-2.5 text-right">Spend</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((k, i) => (
          <tr
            key={`${k.keyword}-${k.matchType}-${i}`}
            className="border-b border-white/5 last:border-0 text-white/90 drop-shadow"
          >
            <td className="px-4 py-2.5 font-medium">{k.keyword}</td>
            <td className="px-4 py-2.5">
              <MatchBadge type={k.matchType} />
            </td>
            <td className="px-4 py-2.5 text-white/65">{k.campaign}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.clicks}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{k.conversions}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">
              {Math.round(k.costKr).toLocaleString("da-DK")} kr
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-6 text-center text-white/60 drop-shadow">
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default function SogeordPage() {
  const topConverting: RowDef[] = [...ADS_KEYWORDS]
    .filter((k) => k.conversions > 0)
    .sort((a, b) => b.conversions - a.conversions || b.clicks - a.clicks)
    .slice(0, 12);

  const wastedSpend: RowDef[] = [...ADS_KEYWORDS]
    .filter((k) => k.conversions === 0 && k.costKr > 0)
    .sort((a, b) => b.costKr - a.costKr)
    .slice(0, 12);

  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Søgeord</SectionHeading>
      <p className="text-[11px] text-white/65 drop-shadow">
        Ads-snapshot · {ADS_SNAPSHOT_PERIOD}
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">Top performing</div>
          <p className="px-4 pb-1 text-[11px] text-white/65 drop-shadow">
            Søgeord der har konverteret — sorteret efter conversions
          </p>
          <KeywordTable rows={topConverting} emptyText="Ingen søgeord har konverteret endnu." />
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">
            Wasted spend (ingen conversions)
          </div>
          <p className="px-4 pb-1 text-[11px] text-white/65 drop-shadow">
            Har kostet penge uden at konvertere — kandidater til pause eller justering
          </p>
          <KeywordTable
            rows={wastedSpend}
            emptyText="Ingen spildt budget endnu."
          />
        </GlassCard>
      </div>
    </div>
  );
}
