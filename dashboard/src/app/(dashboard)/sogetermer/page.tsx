import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import {
  ADS_SEARCH_TERMS,
  ADS_SNAPSHOT_PERIOD,
  type AdsSearchTermSnapshot,
} from "@/lib/ads/snapshot";

export const revalidate = 3600;

// Crude heuristic: term contains no æ/ø/å and contains common English words → likely English
const ENGLISH_HINTS = /\b(the|of|for|to|and|with|how|what|why|over|out|over|after|away|breakup|therapy|trauma|depression|anxiety|panic|stress|love|relationship|self|grief|help|book|coach|counsel)\b/i;
function looksEnglish(term: string) {
  if (/[æøåÆØÅ]/.test(term)) return false;
  return ENGLISH_HINTS.test(term);
}

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

function TermTable({ rows, emptyText }: { rows: AdsSearchTermSnapshot[]; emptyText: string }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/65">
          <th className="px-4 py-2.5 text-left">Søgeterm</th>
          <th className="px-4 py-2.5 text-left">Match</th>
          <th className="px-4 py-2.5 text-left">Kampagne</th>
          <th className="px-4 py-2.5 text-right">Eksp.</th>
          <th className="px-4 py-2.5 text-right">Klik</th>
          <th className="px-4 py-2.5 text-right">Spend</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s, i) => (
          <tr
            key={`${s.term}-${s.matchType}-${i}`}
            className="border-b border-white/5 last:border-0 text-white/90 drop-shadow"
          >
            <td className="px-4 py-2.5">{s.term}</td>
            <td className="px-4 py-2.5">
              <MatchBadge type={s.matchType} />
            </td>
            <td className="px-4 py-2.5 text-white/65">{s.campaign}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{s.impressions.toLocaleString("da-DK")}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">{s.clicks}</td>
            <td className="px-4 py-2.5 text-right tabular-nums">
              {s.costKr > 0 ? `${Math.round(s.costKr).toLocaleString("da-DK")} kr` : "—"}
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

export default function SogetermerPage() {
  const all = ADS_SEARCH_TERMS;

  const topByImpressions = [...all]
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);

  const topBySpend = [...all]
    .filter((s) => s.costKr > 0)
    .sort((a, b) => b.costKr - a.costKr)
    .slice(0, 15);

  const englishWaste = [...all]
    .filter((s) => looksEnglish(s.term) && s.impressions >= 5)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);

  const englishCount = all.filter((s) => looksEnglish(s.term)).length;
  const englishImpressions = all
    .filter((s) => looksEnglish(s.term))
    .reduce((sum, s) => sum + s.impressions, 0);
  const englishSpend = all
    .filter((s) => looksEnglish(s.term))
    .reduce((sum, s) => sum + s.costKr, 0);

  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Søgetermer</SectionHeading>
      <p className="text-[11px] text-white/65 drop-shadow">
        Hvad folk <em>faktisk</em> har søgt på · Ads-snapshot · {ADS_SNAPSHOT_PERIOD} · {all.length} termer
        med ≥1 klik eller ≥5 visninger
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">
            Top efter visninger
          </div>
          <p className="px-4 pb-1 text-[11px] text-white/65 drop-shadow">
            Hvor mange gange annonceren blev vist for hver søgeterm
          </p>
          <TermTable rows={topByImpressions} emptyText="Ingen data." />
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">
            Top efter spend
          </div>
          <p className="px-4 pb-1 text-[11px] text-white/65 drop-shadow">
            Hvilke søgetermer der har kostet flest penge — herfra finder du neg. keyword-kandidater
          </p>
          <TermTable rows={topBySpend} emptyText="Ingen spend-data." />
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="px-4 pt-4 text-sm font-medium text-white drop-shadow">
          🇬🇧 Engelsksprogede søgetermer (formodet)
        </div>
        <p className="px-4 pb-1 text-[11px] text-white/65 drop-shadow">
          Heuristisk fundet · {englishCount} termer · {englishImpressions.toLocaleString("da-DK")} visninger · {Math.round(englishSpend).toLocaleString("da-DK")} kr brugt — kandidater til negative keywords som <code className="font-mono">therapy</code>, <code className="font-mono">depression</code>, <code className="font-mono">trauma</code>
        </p>
        <TermTable rows={englishWaste} emptyText="Ingen engelsksprogede termer fundet." />
      </GlassCard>
    </div>
  );
}
