import { IdeaCardView } from "@/components/idea-card";
import { SectionHeading } from "@/components/section-heading";
import { ideas } from "@/lib/fixtures/ideas";

export default function IdeBankPage() {
  const counts = ideas.reduce<Record<string, number>>((acc, i) => {
    acc[i.status] = (acc[i.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <SectionHeading>Idé-bank</SectionHeading>
        <div className="flex gap-3 text-xs text-white/70 drop-shadow">
          <span>🌱 {counts["frø"] ?? 0}</span>
          <span>🌿 {counts["udfoldet"] ?? 0}</span>
          <span>⚗️ {counts["test"] ?? 0}</span>
          <span>✅ {counts["implementeret"] ?? 0}</span>
          <span>❌ {counts["forkastet"] ?? 0}</span>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <IdeaCardView key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}
