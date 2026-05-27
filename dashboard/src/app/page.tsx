import { Background } from "@/components/background";
import { GlassCard } from "@/components/glass-card";

export default function Home() {
  return (
    <>
      <Background />
      <main className="relative min-h-screen p-8">
        <GlassCard className="p-6 max-w-md">
          <h2 className="font-serif text-2xl text-white drop-shadow-lg">
            Crystal card smoke test
          </h2>
          <p className="mt-2 text-white/80 drop-shadow">
            Background + GlassCard render correctly.
          </p>
        </GlassCard>
      </main>
    </>
  );
}
