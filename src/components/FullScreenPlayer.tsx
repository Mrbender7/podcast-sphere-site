import { usePlayer } from "@/contexts/PlayerContext";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Play, Pause, ChevronDown, Volume2, Bookmark, Loader2, Share2, RotateCcw, RotateCw } from "lucide-react";
import { EqBars } from "@/components/EqBars";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import stationPlaceholder from "@/assets/station-placeholder.png";
import { cn } from "@/lib/utils";

const PLAYBACK_RATES = [1, 1.2, 1.5, 2];

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function FullScreenPlayer() {
  const {
    currentEpisode, isPlaying, isBuffering, togglePlay,
    volume, setVolume, isFullScreen, closeFullScreen,
    currentTime, duration, seek, skipForward, skipBackward,
    playbackRate, setPlaybackRate,
  } = usePlayer();
  const { t } = useTranslation();

  if (!isFullScreen || !currentEpisode) return null;

  const handleShare = async () => {
    const text = `🎧 ${currentEpisode.title} — ${currentEpisode.feedTitle}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentEpisode.title, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied!");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied!");
      } catch {}
    }
  };

  const artwork = currentEpisode.image || currentEpisode.feedImage || stationPlaceholder;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2" style={{ paddingTop: "max(env(safe-area-inset-top, 24px), 1.5rem)" }}>
        <button onClick={closeFullScreen} className="p-2 -ml-2">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </button>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t("player.nowPlaying")}</span>
        <button onClick={handleShare} className="p-2 -mr-2">
          <Share2 className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Artwork */}
      <div className="flex-1 flex items-center justify-center px-10">
        <div
          className="aspect-square w-full max-w-[300px] rounded-2xl bg-accent shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 20px 60px -10px hsla(250, 80%, 50%, 0.5), 0 10px 30px -5px hsla(220, 90%, 60%, 0.3)' }}
        >
          <img
            src={artwork}
            alt={currentEpisode.title}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).src = stationPlaceholder; }}
          />
        </div>
      </div>

      {/* Info & Controls */}
      <div className="px-6 pb-[calc(max(env(safe-area-inset-bottom,16px),1rem)+6rem)] space-y-4">
        {/* Title + Volume */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold leading-tight bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent line-clamp-2 flex items-center gap-2">
                {isPlaying && <EqBars size="md" className="flex-shrink-0" />}
                <span>{currentEpisode.feedTitle || currentEpisode.feedAuthor}</span>
              </h2>
              <div className="mt-1 overflow-hidden">
                <p className="text-sm text-muted-foreground whitespace-nowrap animate-marquee-full w-fit">
                  {currentEpisode.title}
                </p>
              </div>
            </div>

            {/* Seekbar */}
            <div className="space-y-1">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 1}
                step={1}
                onValueChange={([v]) => seek(v)}
                className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[hsl(220,90%,60%)] [&_[role=slider]]:to-[hsl(280,80%,60%)] [&_[role=slider]]:border-0 [&_.absolute]:bg-gradient-to-r [&_.absolute]:from-[hsl(220,90%,60%)] [&_.absolute]:to-[hsl(280,80%,60%)]"
              />
              <div className="flex justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">{formatTime(currentTime)}</span>
                <span className="text-[10px] text-muted-foreground font-mono">-{formatTime(Math.max(0, duration - currentTime))}</span>
              </div>
            </div>

            {/* Transport controls */}
            <div className="flex items-center justify-center gap-6">
              <button onClick={skipBackward} className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-foreground hover:bg-accent/80 transition-colors relative">
                <RotateCcw className="w-5 h-5" />
                <span className="absolute text-[8px] font-bold mt-0.5">15</span>
              </button>

              <button
                onClick={togglePlay}
                className={`w-16 h-16 rounded-full bg-gradient-to-b from-primary to-primary/80 border-t border-white/20 flex items-center justify-center text-primary-foreground active:shadow-sm active:translate-y-0.5 transition-all ${isPlaying ? "animate-play-breathe" : "shadow-lg shadow-primary/50"}`}
              >
                {isBuffering ? <Loader2 className="w-7 h-7 animate-spin" /> : isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>

              <button onClick={skipForward} className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-foreground hover:bg-accent/80 transition-colors relative">
                <RotateCw className="w-5 h-5" />
                <span className="absolute text-[8px] font-bold mt-0.5">30</span>
              </button>
            </div>

            {/* Playback speed selector */}
            <div className="flex items-center justify-center gap-2">
              {PLAYBACK_RATES.map(rate => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                    playbackRate === rate
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Vertical volume */}
          <div className="flex flex-col items-center gap-2 pt-2 flex-shrink-0" style={{ height: '160px' }}>
            <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Slider
              value={[volume * 100]}
              onValueChange={([v]) => setVolume(v / 100)}
              max={100}
              step={1}
              orientation="vertical"
              className="h-full [&_[role=slider]]:bg-gradient-to-b [&_[role=slider]]:from-[hsl(220,90%,60%)] [&_[role=slider]]:to-[hsl(280,80%,60%)] [&_[role=slider]]:border-0 [&_.absolute]:bg-gradient-to-b [&_.absolute]:from-[hsl(220,90%,60%)] [&_.absolute]:to-[hsl(280,80%,60%)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
