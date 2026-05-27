import { GlassCard } from "@/components/glass-card";
import { AdviceCard } from "@/components/advice-card";
import { currentBriefing } from "@/lib/fixtures/briefing";

export default function RaadgivningPage() {
  const briefingDate = new Date(currentBriefing.date).toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 mt-4">
      <GlassCard className="p-8 space-y-4">
        <div className="text-[11px] uppercase tracking-[0.15em] text-[#ffd09a] drop-shadow">
          Briefing · {briefingDate}
        </div>
        <h1 className="font-serif text-3xl text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] leading-tight">
          Hvad jeg ville bruge denne uge på
        </h1>
        <p className="text-[15px] leading-relaxed text-white/85 drop-shadow">
          {currentBriefing.summary}
        </p>
      </GlassCard>

      <div className="space-y-4">
        {currentBriefing.insights.map((advice) => (
          <AdviceCard key={advice.id} advice={advice} />
        ))}
      </div>

      <GlassCard className="p-6 text-center">
        <p className="text-sm text-white/65 drop-shadow">
          Næste briefing kommer mandag. I mellemtiden — kig forbi{" "}
          <span className="font-medium text-white">Idé-banken</span> for de anbefalinger du har sagt ja til.
        </p>
      </GlassCard>
    </div>
  );
}
