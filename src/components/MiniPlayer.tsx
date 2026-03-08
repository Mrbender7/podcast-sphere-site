import { usePlayer } from "@/contexts/PlayerContext";
import { useRef, useEffect, useState } from "react";
import { Play, Pause, Loader2 } from "lucide-react";
import stationPlaceholder from "@/assets/station-placeholder.png";

const MARQUEE_SPEED = 40;

export function MiniPlayer() {
  const { currentEpisode, isPlaying, isBuffering, togglePlay, openFullScreen, progress } = usePlayer();
  const textContainerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [marqueeDuration, setMarqueeDuration] = useState(10);

  useEffect(() => {
    const check = () => {
      if (measureRef.current && textContainerRef.current) {
        const textWidth = measureRef.current.scrollWidth;
        const containerWidth = textContainerRef.current.clientWidth;
        const overflow = textWidth > containerWidth;
        setNeedsMarquee(overflow);
        if (overflow) setMarqueeDuration(textWidth / MARQUEE_SPEED);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [currentEpisode?.title]);

  if (!currentEpisode) return null;

  return (
    <div
      className="fixed left-0 right-0 z-30 flex flex-col cursor-pointer"
      style={{ bottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}
      onClick={openFullScreen}
    >
      {/* Progress bar */}
      <div className="h-[3px] bg-muted w-full">
        <div
          className="h-full bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-2 bg-secondary/80 backdrop-blur-lg border-t border-border">
        <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ boxShadow: '0 4px 15px -3px hsla(250, 80%, 50%, 0.4)' }}
        >
          <img
            src={currentEpisode.image || currentEpisode.feedImage || stationPlaceholder}
            alt={currentEpisode.title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = stationPlaceholder; }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <span ref={measureRef} className="text-sm font-heading font-bold whitespace-nowrap absolute invisible pointer-events-none">
            {currentEpisode.title}
          </span>
          <div ref={textContainerRef} className="overflow-hidden">
            <p
              className={`text-sm font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent whitespace-nowrap ${needsMarquee ? "w-fit animate-marquee" : ""}`}
              style={needsMarquee ? { animationDuration: `${marqueeDuration}s` } : undefined}
            >
              {needsMarquee
                ? <>{currentEpisode.title}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{currentEpisode.title}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</>
                : currentEpisode.title
              }
            </p>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {currentEpisode.feedAuthor || currentEpisode.feedTitle}
          </p>
        </div>

        <button
          onClick={e => { e.stopPropagation(); togglePlay(); }}
          className={`w-10 h-10 rounded-full bg-gradient-to-b from-primary to-primary/80 border-t border-white/20 flex items-center justify-center text-primary-foreground active:shadow-sm active:translate-y-0.5 transition-all flex-shrink-0 ${isPlaying ? "animate-play-breathe" : "shadow-lg shadow-primary/50"}`}
        >
          {isBuffering ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
