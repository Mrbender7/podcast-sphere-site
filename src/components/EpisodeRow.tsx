import { Episode } from "@/types/podcast";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Loader2, CheckCircle2 } from "lucide-react";
import { getEpisodeProgress } from "@/services/PlaybackHistoryService";
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
  podcastTitle?: string;
  podcastAuthor?: string;
}

export function EpisodeRow({ episode, podcastTitle, podcastAuthor }: EpisodeRowProps) {
  const { currentEpisode, isPlaying, isBuffering, play, togglePlay } = usePlayer();
  const isCurrent = currentEpisode?.id === episode.id;

  const saved = getEpisodeProgress(episode.id);
  const progressRatio = saved && saved.duration > 0 ? saved.currentTime / saved.duration : 0;
  const isCompleted = saved?.completed || false;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const episodeForPlayback: Episode = {
      ...episode,
      feedTitle: episode.feedTitle || podcastTitle || "",
      feedAuthor: episode.feedAuthor || podcastAuthor || "",
    };

    if (isCurrent) {
      togglePlay();
    } else {
      play(episodeForPlayback);
    }
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${isCurrent ? "bg-primary/10" : "hover:bg-accent/50"}`}>
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent relative">
        <img
          src={episode.image || episode.feedImage || stationPlaceholder}
          alt={episode.title}
          className={`w-full h-full object-cover ${isCompleted && !isCurrent ? "opacity-50" : ""}`}
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = stationPlaceholder; }}
        />
        {isCompleted && !isCurrent && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isCompleted && !isCurrent ? "text-muted-foreground" : isCurrent ? "text-primary" : "text-foreground"}`}>
          {episode.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{formatDate(episode.datePublished)}</span>
          {episode.duration > 0 && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatDuration(episode.duration)}</span>
            </>
          )}
        </div>
        {/* Progress bar */}
        {progressRatio > 0 && !isCompleted && !isCurrent && (
          <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)]"
              style={{ width: `${Math.min(progressRatio * 100, 100)}%` }}
            />
          </div>
        )}
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
