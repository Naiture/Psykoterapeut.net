import { Background } from "@/components/background";
import { GlassCard } from "@/components/glass-card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <Background />
      <main className="relative min-h-screen flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-sm p-8">
          <h1 className="font-serif text-2xl text-white text-center drop-shadow-lg">
            Marketing · Inger Marie
          </h1>
          <p className="mt-2 text-center text-sm text-white/75 drop-shadow">
            Indtast adgangskode
          </p>

          <form action="/api/auth/login" method="POST" className="mt-6 space-y-3">
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Adgangskode"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/50 backdrop-blur-sm focus:border-white/40 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-lg border border-white/25 bg-white/15 px-4 py-2.5 text-white font-medium backdrop-blur-sm hover:bg-white/25 transition"
            >
              Log ind
            </button>
            {error && (
              <p className="text-center text-sm text-rose-200 drop-shadow">
                Forkert adgangskode
              </p>
            )}
          </form>
        </GlassCard>
      </main>
    </>
  );
}
