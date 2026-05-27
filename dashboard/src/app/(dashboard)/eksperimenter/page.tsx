import { ExperimentCardView } from "@/components/experiment-card";
import { SectionHeading } from "@/components/section-heading";
import { experiments } from "@/lib/fixtures/experiments";

export default function EksperimenterPage() {
  return (
    <div className="space-y-4 mt-2">
      <SectionHeading>Eksperimenter</SectionHeading>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {experiments.map((e) => (
          <ExperimentCardView key={e.id} experiment={e} />
        ))}
      </div>
    </div>
  );
}
