import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface EqBarsProps {
  className?: string;
  barCount?: number;
  size?: "sm" | "md";
  animate?: boolean;
}

export function EqBars({ className, barCount = 4, size = "sm", animate = true }: EqBarsProps) {
  const h = size === "sm" ? "h-3" : "h-5";
  const w = size === "sm" ? "w-[3px]" : "w-[3px]";
  const gap = size === "sm" ? "gap-[2px]" : "gap-[3px]";

  // Random durations & delays per bar for organic feel
  const barStyles = useMemo(
    () =>
      Array.from({ length: barCount }).map(() => ({
        duration: 0.4 + Math.random() * 0.6, // 0.4s–1.0s
        delay: Math.random() * 0.5,
      })),
    [barCount]
  );

  return (
    <div className={cn("flex items-end", gap, h, className)}>
      {barStyles.map((style, i) => (
        <span
          key={i}
          className={cn(
            w,
            "rounded-full transition-all duration-300",
            animate ? "animate-eq-bar" : ""
          )}
          style={{
            background: animate
              ? "linear-gradient(to top, hsl(220,90%,60%), hsl(280,80%,60%))"
              : "hsl(var(--muted-foreground) / 0.3)",
            animationDuration: animate ? `${style.duration}s` : undefined,
            animationDelay: animate ? `${style.delay}s` : undefined,
            height: animate ? undefined : "40%",
          }}
        />
      ))}
    </div>
  );
}
