"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlassCard } from "@/components/glass-card";
import { PeriodSelector } from "@/components/period-selector";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string }[] = [
  { href: "/", label: "Oversigt" },
  { href: "/raadgivning", label: "Rådgivning" },
  { href: "/kampagner", label: "Kampagner" },
  { href: "/sogeord", label: "Søgeord" },
  { href: "/sogetermer", label: "Søgetermer" },
  { href: "/landingssider", label: "Landingssider" },
  { href: "/change-log", label: "Change log" },
  { href: "/ide-bank", label: "Idé-bank" },
  { href: "/eksperimenter", label: "Eksperimenter" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <GlassCard className="sticky top-4 z-50 mx-4 flex items-center gap-6 px-5 py-3">
      <div className="font-serif text-base font-semibold text-white drop-shadow-lg">
        Inger Marie
      </div>
      <nav className="flex flex-1 gap-1">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition",
                "text-white/80 drop-shadow hover:text-white",
                active && "bg-white/18 text-white font-semibold"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <PeriodSelector />
    </GlassCard>
  );
}
