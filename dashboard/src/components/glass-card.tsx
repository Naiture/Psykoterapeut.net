import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export const GlassCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function GlassCard({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/[0.12] bg-white/[0.02]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_40px_rgba(0,0,0,0.28)]",
          "backdrop-blur-[2px] backdrop-saturate-150",
          className
        )}
        {...props}
      />
    );
  }
);
