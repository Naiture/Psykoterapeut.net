import { Background } from "@/components/background";
import { TopNav } from "@/components/top-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Background />
      <div className="relative min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 px-4 py-4">{children}</main>
      </div>
    </>
  );
}
