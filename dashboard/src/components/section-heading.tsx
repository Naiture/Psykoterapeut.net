import { cn } from "@/lib/utils";

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-serif text-2xl text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      {children}
    </h2>
  );
}
