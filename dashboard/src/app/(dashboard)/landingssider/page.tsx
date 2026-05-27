import { GlassCard } from "@/components/glass-card";
import { SectionHeading } from "@/components/section-heading";
import {
  getLandingPagesFromSnapshot,
  SNAPSHOT_PERIOD,
} from "@/lib/ga4/snapshot";

export const revalidate = 3600;

const BENCHMARK = 2.0;

export default function LandingssiderPage() {
  const landingPages = getLandingPagesFromSnapshot();

  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Landingssider</SectionHeading>

      <p className="text-[11px] text-white/65 drop-shadow">
        GA4-snapshot · {SNAPSHOT_PERIOD} · skifter til live BigQuery-data når GA4-export'en
        begynder at fylde
      </p>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {landingPages.map((p) => {
          const belowBenchmark = p.conversionRate < BENCHMARK;
          return (
            <GlassCard key={p.url} className="p-5">
              <div className="text-xs text-white/70 drop-shadow break-all">{p.url}</div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-semibold text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)]">
                  {p.conversionRate.toFixed(1)}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-white/65 drop-shadow">conv. rate</span>
              </div>
              <div className="mt-3 flex justify-between text-xs text-white/75 drop-shadow">
                <span>{p.sessions.toLocaleString("da-DK")} sessions</span>
                <span>{Math.round((p.avgTimeSeconds / 60) * 10) / 10} min snit</span>
              </div>
              {belowBenchmark && (
                <div className="mt-3 inline-flex rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] text-amber-200">
                  Under benchmark ({BENCHMARK}%)
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
