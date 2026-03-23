import { useRef, useEffect, useState } from "react";

interface MarqueeTextProps {
  text: string;
  active?: boolean;
  className?: string;
}

export function MarqueeText({ text, active = false, className = "" }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [duration, setDuration] = useState(10);

  useEffect(() => {
    const check = () => {
      if (measureRef.current && containerRef.current) {
        const textW = measureRef.current.scrollWidth;
        const containerW = containerRef.current.clientWidth;
        const overflow = textW > containerW;
        setNeedsMarquee(overflow);
        if (overflow) setDuration(Math.max(textW / 40, 5));
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  const shouldScroll = active && needsMarquee;

  return (
    <div ref={containerRef} className="overflow-hidden">
      <span ref={measureRef} className="absolute invisible pointer-events-none whitespace-nowrap text-sm">
        {text}
      </span>
      <p
        className={`whitespace-nowrap ${shouldScroll ? "w-fit animate-marquee" : "truncate"} ${className}`}
        style={shouldScroll ? { animationDuration: `${duration}s` } : undefined}
      >
        {shouldScroll ? (
          <>{text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</>
        ) : (
          text
        )}
      </p>
    </div>
  );
}
