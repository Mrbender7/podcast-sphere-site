import { Episode } from "@/types/podcast";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Loader2 } from "lucide-react";
import stationPlaceholder from "@/assets/station-placeholder.png";

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}`;
  return `${m} min`;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

interface EpisodeRowProps {
  episode: Episode;
}

export function EpisodeRow({ episode }: EpisodeRowProps) {
  const { currentEpisode, isPlaying, isBuffering, play, togglePlay } = usePlayer();
  const isCurrent = currentEpisode?.id === episode.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      play(episode);
    }
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${isCurrent ? "bg-primary/10" : "hover:bg-accent/50"}`}>
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent">
        <img
          src={episode.image || episode.feedImage || stationPlaceholder}
          alt={episode.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = stationPlaceholder; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCurrent ? "text-primary" : "text-foreground"}`}>{episode.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatDate(episode.datePublished)}</span>
          {episode.duration > 0 && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatDuration(episode.duration)}</span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={handlePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          isCurrent && isPlaying
            ? "bg-primary text-primary-foreground"
            : "bg-accent hover:bg-primary/20 text-foreground"
        }`}
      >
        {isCurrent && isBuffering ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isCurrent && isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
    </div>
  );
}
