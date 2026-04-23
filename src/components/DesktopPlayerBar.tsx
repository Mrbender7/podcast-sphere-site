import { usePlayer } from "@/contexts/PlayerContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Play, Pause, Loader2, Volume2, VolumeX, Headphones, Maximize2, SkipBack, SkipForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { CachedImage } from "@/components/CachedImage";
import { MarqueeText } from "@/components/MarqueeText";

export function DesktopPlayerBar() {
  const {
    currentEpisode, isPlaying, isBuffering, togglePlay,
    volume, setVolume, openFullScreen, playNext, playPrevious,
  } = usePlayer();
  const { t } = useTranslation();

  if (!currentEpisode) {
    return (
      <div className="hidden lg:flex items-center justify-center h-20 bg-secondary/60 backdrop-blur-lg border-t border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Headphones className="w-5 h-5" />
          <span className="text-sm">{t("player.selectEpisode")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center h-20 bg-secondary/60 backdrop-blur-lg border-t border-border px-6 gap-6">
      {/* Left: Episode info */}
      <button
        type="button"
        onClick={openFullScreen}
        aria-label={t("player.openFullScreen") || "Open full player"}
        className="flex items-center gap-4 w-80 flex-shrink-0 text-left cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
      >
        <div
          className="w-14 h-14 rounded-lg bg-accent overflow-hidden flex-shrink-0 group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow"
          style={{ boxShadow: '0 4px 20px -4px hsla(250, 80%, 50%, 0.4)' }}
        >
          <CachedImage
            src={currentEpisode.image || currentEpisode.feedImage || ""}
            alt={currentEpisode.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <MarqueeText
            text={currentEpisode.title}
            active={isPlaying}
            className="text-sm font-heading font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(280,80%,60%)] bg-clip-text text-transparent"
          />
          <MarqueeText
            text={currentEpisode.feedTitle || ""}
            active={isPlaying}
            className="text-xs text-muted-foreground"
          />
        </div>
      </button>

      {/* Center: Controls */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <button onClick={playPrevious} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full bg-gradient-to-b from-primary to-primary/80 border-t border-white/20 flex items-center justify-center text-primary-foreground transition-all ${isPlaying ? "" : "shadow-lg shadow-primary/50"}`}
        >
          {isBuffering ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button onClick={playNext} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Volume */}
      <div className="flex items-center gap-3 w-64 flex-shrink-0 justify-end">
        <div className="flex items-center gap-2 w-36">
          <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Slider
            value={[volume * 100]}
            onValueChange={([v]) => setVolume(v / 100)}
            max={100}
            step={1}
            className="flex-1 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[hsl(var(--primary))] [&_[role=slider]]:to-[hsl(280,80%,60%)] [&_[role=slider]]:border-0 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_.absolute]:bg-gradient-to-r [&_.absolute]:from-[hsl(var(--primary))] [&_.absolute]:to-[hsl(280,80%,60%)]"
          />
        </div>
      </div>
    </div>
  );
}
