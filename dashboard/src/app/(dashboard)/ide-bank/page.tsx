import { IdeaKanban } from "@/components/idea-kanban";
import { SectionHeading } from "@/components/section-heading";
import { ideas } from "@/lib/fixtures/ideas";

export default function IdeBankPage() {
  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <SectionHeading>Idé-bank</SectionHeading>
        <div className="text-xs text-white/65 drop-shadow italic">
          Træk kort mellem kolonner for at ændre status
        </div>
      </div>
      <IdeaKanban initialIdeas={ideas} />
    </div>
  );
}
