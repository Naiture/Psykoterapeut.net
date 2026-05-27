import { ChangeLogEntryView } from "@/components/change-log-entry";
import { SectionHeading } from "@/components/section-heading";
import { changeLog } from "@/lib/fixtures/change-log";

export default function ChangeLogPage() {
  return (
    <div className="space-y-4 mt-2">
      <div className="flex items-baseline justify-between">
        <SectionHeading>Change log</SectionHeading>
        <button
          disabled
          className="rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-xs text-white/60 cursor-not-allowed"
          title="Funktion kommer i fase 3"
        >
          + Tilføj entry
        </button>
      </div>
      <div className="space-y-3">
        {changeLog.map((entry) => (
          <ChangeLogEntryView key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
