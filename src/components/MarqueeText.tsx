import { useRef, useEffect, useState } from "react";

interface MarqueeTextProps {
  text: string;
  /** Force-active marquee (e.g. when an episode is currently playing). */
  active?: boolean;
  /** Also auto-scroll when the user hovers the text on desktop. Defaults to true. */
  hoverActivates?: boolean;
  className?: string;
}

/**
 * Renders text that gracefully truncates with ellipsis when it fits, and
 * smoothly scrolls horizontally (carousel-style) when it overflows. The
 * scrolling is triggered automatically on hover/focus, or whenever the
 * `active` prop is true (used for the currently playing episode).
 */
export function MarqueeText({
  text,
  active = false,
  hoverActivates = true,
  className = "",
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [duration, setDuration] = useState(10);

  useEffect(() => {
    const check = () => {
      if (measureRef.current && containerRef.current) {
        const textW = measureRef.current.scrollWidth;
        const containerW = containerRef.current.clientWidth;
        const overflow = textW > containerW + 1;
        setNeedsMarquee(overflow);
        if (overflow) setDuration(Math.max(textW / 40, 5));
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  const shouldScroll = needsMarquee && (active || (hoverActivates && hovering));

  return (
    <div
      ref={containerRef}
      className="overflow-hidden"
      onMouseEnter={hoverActivates ? () => setHovering(true) : undefined}
      onMouseLeave={hoverActivates ? () => setHovering(false) : undefined}
      onFocus={hoverActivates ? () => setHovering(true) : undefined}
      onBlur={hoverActivates ? () => setHovering(false) : undefined}
    >
      <span ref={measureRef} className="absolute invisible pointer-events-none whitespace-nowrap text-sm">
        {text}
      </span>
      <p
        className={`whitespace-nowrap ${shouldScroll ? "w-fit animate-marquee" : "truncate"} ${className}`}
        style={shouldScroll ? { animationDuration: `${duration}s` } : undefined}
        title={needsMarquee ? text : undefined}
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
