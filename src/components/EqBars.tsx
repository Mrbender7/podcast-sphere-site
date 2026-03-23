import { cn } from "@/lib/utils";

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

  return (
    <div className={cn("flex items-end", gap, h, className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className={cn(
            w,
            "rounded-full bg-primary transition-all duration-300",
            animate ? "animate-eq-bar" : ""
          )}
          style={{
            animationDelay: animate ? `${i * 0.15}s` : undefined,
            height: animate ? undefined : "40%",
          }}
        />
      ))}
    </div>
  );
}
