import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { CategoryAnimation } from "@/components/CategoryAnimations";
import { useQuery } from "@tanstack/react-query";
import { TrendingRowSkeleton } from "@/components/SkeletonLoaders";
import { Podcast, Episode } from "@/types/podcast";
import { getTrendingPodcasts } from "@/services/PodcastService";
import { PodcastCard } from "@/components/PodcastCard";
import { ScrollableRow } from "@/components/ScrollableRow";
import { MultiSelectFilter, FilterOption } from "@/components/MultiSelectFilter";
import { useTranslation } from "@/contexts/LanguageContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useDownloads } from "@/contexts/DownloadContext";
import { getListenHistory } from "@/services/PlaybackHistoryService";
import { NewEpisodesService } from "@/services/NewEpisodesService";
import { cn } from "@/lib/utils";
import { useCast } from "@/hooks/useCast";
import { Bookmark, TrendingUp, ArrowUp, Headphones, Globe, Play, Pause, ChevronDown, Sparkles, X, Loader2, Download, CheckCircle, Cast, Home } from "lucide-react";
import podcastSphereLogo from "@/assets/podcast-sphere-logo-new.png";
import { CachedImage } from "@/components/CachedImage";
import { MarqueeText } from "@/components/MarqueeText";
import { CATEGORY_IMAGES } from "@/components/CategoryImages";

const CATEGORIES = [
  "Technology", "Comedy", "News", "True Crime", "Health", "Business",
  "Science", "Education", "Sports", "Music", "Society", "History",
  "Fiction", "Horror", "Video Games", "Arts", "Food", "Travel",
];

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "from-cyan-800/90 to-blue-500/80",
  Comedy: "from-amber-800/90 to-yellow-600/80",
  News: "from-slate-700/90 to-gray-500/80",
  "True Crime": "from-red-900/90 to-rose-600/80",
  Health: "from-teal-800/90 to-emerald-500/80",
  Business: "from-amber-900/90 to-yellow-700/80",
  Science: "from-indigo-900/90 to-violet-500/80",
  Education: "from-cyan-800/90 to-sky-500/80",
  Sports: "from-amber-800/90 to-orange-500/80",
  Music: "from-purple-900/90 to-fuchsia-500/80",
  Society: "from-amber-800/90 to-yellow-600/80",
  History: "from-stone-800/90 to-amber-600/80",
  Fiction: "from-violet-900/90 to-purple-500/80",
  Horror: "from-gray-950/90 to-red-900/80",
  "Video Games": "from-emerald-800/90 to-lime-500/80",
  Arts: "from-fuchsia-800/90 to-pink-500/80",
  Food: "from-orange-800/90 to-amber-500/80",
  Travel: "from-sky-800/90 to-teal-500/80",
};

interface HomePageProps {
  subscriptions: Podcast[];
  onPodcastClick: (podcast: Podcast) => void;
  onCategoryClick: (category: string) => void;
}

export function HomePage({ subscriptions, onPodcastClick, onCategoryClick }: HomePageProps) {
  const { t, language } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAllResume, setShowAllResume] = useState(false);
  const [trendingLang, setTrendingLang] = useState<string>(language);
  const { play, currentEpisode, isPlaying, isBuffering, togglePlay } = usePlayer();
  const { isCastAvailable, isCasting, startCast, stopCast } = useCast();
  const { isEpisodeDownloaded, downloading, startDownload } = useDownloads();

  // New episodes state
  const [newEpisodes, setNewEpisodes] = useState<Episode[]>(() => NewEpisodesService.getNewEpisodesFromCache());
  const [syncingNew, setSyncingNew] = useState(false);

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const history = getListenHistory();
  const resumeEntries = history.filter(h => !h.completed && h.progress > 0);

  const langOptions: FilterOption[] = useMemo(() => [
    { value: "fr", label: "Français", icon: "fr" },
    { value: "en", label: "English", icon: "en" },
    { value: "es", label: "Español", icon: "es" },
    { value: "de", label: "Deutsch", icon: "de" },
    { value: "ja", label: "日本語", icon: "ja" },
    { value: "pt", label: "Português", icon: "pt" },
    { value: "it", label: "Italiano", icon: "it" },
    { value: "ar", label: "العربية", icon: "ar" },
  ], []);

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending", trendingLang],
    queryFn: () => getTrendingPodcasts(20, trendingLang || undefined),
    staleTime: 10 * 60 * 1000,
  });

  // Sync new episodes on mount
  useEffect(() => {
    if (subscriptions.length === 0) return;
    let cancelled = false;
    setSyncingNew(true);
    NewEpisodesService.syncNewEpisodes(subscriptions).then((eps) => {
      if (!cancelled) {
        setNewEpisodes(eps);
        setSyncingNew(false);
      }
    }).catch(() => {
      if (!cancelled) setSyncingNew(false);
    });
    return () => { cancelled = true; };
  }, [subscriptions]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = scrollContainerRef.current;
    if (el && el.scrollTop <= 0 && !refreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= 60 && !refreshing) {
      setRefreshing(true);
      setPullDistance(60);
      try {
        const eps = await NewEpisodesService.syncNewEpisodes(subscriptions, true);
        setNewEpisodes(eps);
      } catch (e) {
        console.error("Pull-to-refresh error", e);
      }
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, refreshing, subscriptions]);

  // Play new episode and mark as seen
  const handlePlayNewEpisode = useCallback((episode: Episode) => {
    play(episode);
    NewEpisodesService.markAsSeen(episode.id);
    setNewEpisodes(prev => prev.filter(ep => ep.id !== episode.id));
  }, [play]);

  // Dismiss new episode without playing
  const handleDismissEpisode = useCallback((e: React.MouseEvent, episodeId: number) => {
    e.stopPropagation();
    NewEpisodesService.markAsSeen(episodeId);
    setNewEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-background px-4 pt-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Home className="w-6 h-6 text-[hsl(280,80%,60%)]" />
            <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent whitespace-nowrap">
              {t("nav.home")}
            </h1>
          </div>
          <button
            onClick={isCasting ? stopCast : startCast}
            disabled={!isCastAvailable}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full bg-accent transition-colors",
              isCasting ? "text-primary" : 
              isCastAvailable ? "text-muted-foreground hover:text-foreground" : 
              "text-muted-foreground/30 cursor-not-allowed"
            )}
            aria-label="Cast"
          >
            <Cast className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Pull-to-refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullDistance > 0 ? pullDistance : 0 }}
      >
        {pullDistance > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className={cn("w-4 h-4", refreshing ? "animate-spin" : pullDistance >= 60 ? "text-primary" : "")} />
            <span>{pullDistance >= 60 ? (refreshing ? "..." : t("home.pullToRefresh")) : t("home.pullToRefresh")}</span>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-y-auto px-4 pb-4"
      >
        {/* Subscriptions */}
        <section className="mb-6">
          <h2 className="text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[hsl(280,80%,60%)]" />
            {t("home.yourSubscriptions")}
            {subscriptions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none">{subscriptions.length}</span>
            )}
          </h2>
          {subscriptions.length > 0 ? (
            <ScrollableRow>
              {subscriptions.slice(0, 20).map(p => (
                <PodcastCard key={p.id} podcast={p} onClick={onPodcastClick} />
              ))}
            </ScrollableRow>
          ) : (
            <p className="text-sm text-muted-foreground">{t("home.noSubscriptions")}</p>
          )}
        </section>

        {/* Resume Listening */}
        {resumeEntries.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
              <Play className="w-4 h-4 text-[hsl(220,90%,60%)]" />
              {t("home.resumeListening")}
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(220,90%,60%)] text-white leading-none">{resumeEntries.length}</span>
            </h2>
            <div className="space-y-1">
              {(showAllResume ? resumeEntries : resumeEntries.slice(0, 3)).map(entry => {
                const isCurrent = currentEpisode?.id === entry.episode.id;
                const isThisPlaying = isCurrent && isPlaying;
                const isThisBuffering = isCurrent && isBuffering;
                return (
                  <div
                    key={entry.episode.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer"
                    onClick={() => isCurrent ? togglePlay() : play(entry.episode)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent">
                      <CachedImage
                        src={entry.episode.image || entry.episode.feedImage}
                        alt={entry.episode.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <MarqueeText
                        text={entry.episode.title}
                        active={isThisPlaying}
                        className="text-sm font-semibold text-foreground"
                      />
                      <MarqueeText
                        text={entry.episode.feedTitle || ""}
                        active={isThisPlaying}
                        className="text-xs text-muted-foreground"
                      />
                      <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)]"
                          style={{ width: `${Math.min(entry.progress * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[10px] text-primary font-semibold">{Math.round(entry.progress * 100)}%</span>
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isThisPlaying ? "bg-primary" : "bg-accent")}>
                        {isThisBuffering ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground" />
                        ) : isThisPlaying ? (
                          <Pause className="w-3.5 h-3.5 text-primary-foreground" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5 text-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {resumeEntries.length > 3 && (
              <button
                onClick={() => setShowAllResume(v => !v)}
                className="mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium text-primary hover:bg-accent/50 transition-colors"
              >
                {showAllResume ? t("library.showLess") : t("library.showMore")}
                <ChevronDown className={cn("w-4 h-4 transition-transform", showAllResume && "rotate-180")} />
              </button>
            )}
          </section>
        )}

        {/* Latest Releases */}
        {subscriptions.length > 0 && newEpisodes.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[hsl(280,80%,60%)]" />
              {t("home.latestReleases")}
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none">{newEpisodes.length}</span>
            </h2>
            <ScrollableRow>
              {newEpisodes.map(ep => {
                const isCurrent = currentEpisode?.id === ep.id;
                const isThisPlaying = isCurrent && isPlaying;
                const isThisBuffering = isCurrent && isBuffering;
                const epDownloaded = isEpisodeDownloaded(ep.id);
                const epDownloading = downloading[ep.id] !== undefined;
                return (
                  <div
                    key={ep.id}
                    className="relative flex-shrink-0 w-32 cursor-pointer group"
                    onClick={() => isCurrent ? togglePlay() : handlePlayNewEpisode(ep)}
                  >
                    {/* Dismiss button */}
                    <button
                      onClick={(e) => handleDismissEpisode(e, ep.id)}
                      className="absolute top-1 right-1 z-20 w-6 h-6 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100"
                      style={{ opacity: undefined }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <X className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    {/* Download button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!epDownloaded && !epDownloading) startDownload(ep);
                      }}
                      className="absolute top-1 left-1 z-20 w-6 h-6 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100"
                      style={{ opacity: undefined }}
                      onPointerDown={(e) => e.stopPropagation()}
                      disabled={epDownloaded || epDownloading}
                    >
                      {epDownloading ? (
                        <Loader2 className="w-3 h-3 animate-spin text-foreground" />
                      ) : epDownloaded ? (
                        <CheckCircle className="w-3 h-3 text-primary" />
                      ) : (
                        <Download className="w-3 h-3 text-foreground" />
                      )}
                    </button>
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-accent mb-1.5 relative">
                      <CachedImage
                        src={ep.image || ep.feedImage}
                        alt={ep.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Play overlay */}
                      <div className={cn(
                        "absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                        isThisPlaying ? "bg-primary" : "bg-background/80 backdrop-blur-sm"
                      )}>
                        {isThisBuffering ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-foreground" />
                        ) : isThisPlaying ? (
                          <Pause className="w-3.5 h-3.5 text-primary-foreground" />
                        ) : (
                          <Play className="w-3.5 h-3.5 ml-0.5 text-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate">{ep.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{ep.feedTitle}</p>
                  </div>
                );
              })}
            </ScrollableRow>
          </section>
        )}

        {/* Trending */}
        <section className="mb-6">
          <h2 className="text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[hsl(220,90%,60%)]" />
            {t("home.trending")}
          </h2>
          <div className="mb-2">
            <MultiSelectFilter
              icon={<Globe className="w-3.5 h-3.5" />}
              label={t("search.languages")}
              options={langOptions}
              selected={[trendingLang]}
              onChange={(vals) => setTrendingLang(vals[vals.length - 1] || language)}
              singleSelect
            />
          </div>
          {trendingLoading ? (
            <TrendingRowSkeleton />
          ) : trending && trending.length > 0 ? (
            <ScrollableRow>
              {trending.map(p => (
                <PodcastCard key={p.id} podcast={p} onClick={onPodcastClick} />
              ))}
            </ScrollableRow>
          ) : null}
        </section>

        {/* Categories */}
        <section className="mb-6">
          <h2 className="text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[hsl(220,90%,60%)]" />
            {t("home.exploreByCategory")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => {
              const catImage = CATEGORY_IMAGES[cat];
              return (
                <div
                  key={cat}
                  className={`relative rounded-xl p-4 h-24 flex items-end bg-gradient-to-br ${CATEGORY_COLORS[cat] || "from-gray-700 to-gray-500"} cursor-pointer active:scale-95 transition-all duration-300 ease-out shadow-lg border-t border-white/10 overflow-hidden group hover:scale-105 hover:shadow-[0_8px_30px_-4px_hsl(var(--primary)/0.45)]`}
                  onClick={() => onCategoryClick(cat)}
                >
                  {catImage && (
                    <div className="absolute -top-2 -right-2 w-24 h-24 pointer-events-none">
                      <CategoryAnimation category={cat} />
                      <img
                        src={catImage}
                        alt={cat}
                        className="w-full h-full object-contain opacity-85 drop-shadow-lg relative z-10 transition-transform duration-500 ease-out group-hover:scale-125"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <span className="text-sm font-heading font-bold text-white capitalize drop-shadow-md relative z-10">{t(`category.${cat}`)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <button
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-10 h-10 rounded-full bg-primary/70 backdrop-blur-sm text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300",
            showScrollTop ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          )}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
