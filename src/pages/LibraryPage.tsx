import { useState, useRef, useCallback } from "react";
import { Podcast } from "@/types/podcast";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { PodcastCard } from "@/components/PodcastCard";
import { PodcastDetailPage } from "@/pages/PodcastDetailPage";
import { getListenHistory, clearHistory, HistoryEntry } from "@/services/PlaybackHistoryService";
import { Bookmark, ArrowUp, Clock, CheckCircle2, Play, Trash2 } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import stationPlaceholder from "@/assets/station-placeholder.png";

function formatTimeAgo(timestamp: number, t: (k: string) => string): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

function HistoryRow({ entry, onPlay }: { entry: HistoryEntry; onPlay: (entry: HistoryEntry) => void }) {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer"
      onClick={() => onPlay(entry)}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent relative">
        <img
          src={entry.episode.image || entry.episode.feedImage || stationPlaceholder}
          alt={entry.episode.title}
          className={`w-full h-full object-cover ${entry.completed ? "opacity-50" : ""}`}
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = stationPlaceholder; }}
        />
        {entry.completed && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${entry.completed ? "text-muted-foreground" : "text-foreground"}`}>
          {entry.episode.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{entry.episode.feedTitle}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{formatTimeAgo(entry.lastPlayedAt, t)}</span>
        </div>
        {/* Progress bar */}
        {!entry.completed && entry.progress > 0 && (
          <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)]"
              style={{ width: `${Math.min(entry.progress * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {!entry.completed && entry.progress > 0 && (
          <span className="text-[10px] text-primary font-semibold">{Math.round(entry.progress * 100)}%</span>
        )}
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <Play className="w-3.5 h-3.5 ml-0.5 text-foreground" />
        </div>
      </div>
    </div>
  );
}

export function LibraryPage() {
  const { t } = useTranslation();
  const { subscriptions, hasNewEpisodes } = useFavoritesContext();
  const { play } = usePlayer();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);

  const history = getListenHistory();

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);

  const handlePlayFromHistory = useCallback((entry: HistoryEntry) => {
    play(entry.episode);
  }, [play]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistoryVersion(v => v + 1);
  }, []);

  if (selectedPodcast) {
    return <PodcastDetailPage podcast={selectedPodcast} onBack={() => setSelectedPodcast(null)} />;
  }

  // Split history into in-progress and completed
  const inProgress = history.filter(h => !h.completed && h.progress > 0);
  const completed = history.filter(h => h.completed);

  return (
    <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pb-32">
      <h1 className="text-2xl font-heading font-bold mt-6 mb-2 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
        {t("favorites.title")}
        {subscriptions.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none">{subscriptions.length}</span>
        )}
      </h1>

      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bookmark className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <h2 className="text-base font-semibold text-foreground mb-1">{t("favorites.empty")}</h2>
          <p className="text-sm text-muted-foreground max-w-[250px]">{t("favorites.emptyDesc")}</p>
        </div>
      ) : (
        <div className="space-y-1 mt-2">
          {subscriptions.map(p => (
            <div key={p.id} className="relative">
              <PodcastCard podcast={p} compact onClick={setSelectedPodcast} />
              {hasNewEpisodes(p) && (
                <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
            <Play className="w-4 h-4 text-[hsl(220,90%,60%)]" />
            {t("history.inProgress")}
          </h2>
          <div className="space-y-1">
            {inProgress.map(entry => (
              <HistoryRow key={entry.episode.id} entry={entry} onPlay={handlePlayFromHistory} />
            ))}
          </div>
        </section>
      )}

      {/* Listening History */}
      {history.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-heading font-semibold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
              <Clock className="w-4 h-4 text-[hsl(280,80%,60%)]" />
              {t("history.title")}
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none">{history.length}</span>
            </h2>
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t("history.clear")}
            </button>
          </div>
          <div className="space-y-1">
            {history.map(entry => (
              <HistoryRow key={entry.episode.id} entry={entry} onPlay={handlePlayFromHistory} />
            ))}
          </div>
        </section>
      )}

      {history.length === 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
            <Clock className="w-4 h-4 text-[hsl(280,80%,60%)]" />
            {t("history.title")}
          </h2>
          <p className="text-sm text-muted-foreground text-center py-8">{t("history.empty")}</p>
        </section>
      )}

      <button
        onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-48 right-4 z-50 w-10 h-10 rounded-full bg-primary/70 backdrop-blur-sm text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300",
          showScrollTop ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
