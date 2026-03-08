import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Podcast } from "@/types/podcast";
import { getTrendingPodcasts } from "@/services/PodcastService";
import { PodcastCard } from "@/components/PodcastCard";
import { ScrollableRow } from "@/components/ScrollableRow";
import { MultiSelectFilter, FilterOption } from "@/components/MultiSelectFilter";
import { useTranslation } from "@/contexts/LanguageContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { getListenHistory, HistoryEntry } from "@/services/PlaybackHistoryService";
import { cn } from "@/lib/utils";
import { Bookmark, TrendingUp, ArrowUp, Headphones, Globe, Play, ChevronDown, CheckCircle2 } from "lucide-react";
import podcastSphereLogo from "@/assets/podcast-sphere-logo-new.png";
import stationPlaceholder from "@/assets/station-placeholder.png";
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
  const { play } = usePlayer();

  const history = getListenHistory();
  const resumeEntries = history.filter(h => !h.completed && h.progress > 0);

  const langOptions: FilterOption[] = useMemo(() => [
    { value: "fr", label: "🇫🇷 Français" },
    { value: "en", label: "🇬🇧 English" },
    { value: "es", label: "🇪🇸 Español" },
    { value: "de", label: "🇩🇪 Deutsch" },
    { value: "ja", label: "🇯🇵 日本語" },
    { value: "pt", label: "🇧🇷 Português" },
    { value: "it", label: "🇮🇹 Italiano" },
    { value: "ar", label: "🇸🇦 العربية" },
  ], []);

  const { data: trending } = useQuery({
    queryKey: ["trending", trendingLang],
    queryFn: () => getTrendingPodcasts(20, trendingLang || undefined),
    staleTime: 10 * 60 * 1000,
  });

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-background px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <img src={podcastSphereLogo} alt="Podcast Sphere" className="w-12 h-12 rounded-xl mix-blend-screen animate-logo-glow" />
          <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent whitespace-nowrap">
            Podcast Sphere
          </h1>
        </div>
      </div>

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Trending */}
        {trending && trending.length > 0 && (
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
            <ScrollableRow>
              {trending.map(p => (
                <PodcastCard key={p.id} podcast={p} onClick={onPodcastClick} />
              ))}
            </ScrollableRow>
          </section>
        )}

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
              {(showAllResume ? resumeEntries : resumeEntries.slice(0, 3)).map(entry => (
                <div
                  key={entry.episode.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer"
                  onClick={() => play(entry.episode)}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent">
                    <img
                      src={entry.episode.image || entry.episode.feedImage || stationPlaceholder}
                      alt={entry.episode.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).src = stationPlaceholder; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{entry.episode.title}</p>
                    <span className="text-xs text-muted-foreground truncate block">{entry.episode.feedTitle}</span>
                    <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)]"
                        style={{ width: `${Math.min(entry.progress * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[10px] text-primary font-semibold">{Math.round(entry.progress * 100)}%</span>
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 ml-0.5 text-foreground" />
                    </div>
                  </div>
                </div>
              ))}
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
        {/* Categories */}
        <section className="mb-6">
          <h2 className="text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[hsl(220,90%,60%)]" />
            {t("home.exploreByCategory")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(cat => {
              const catImage = CATEGORY_IMAGES[cat];
              return (
                <div
                  key={cat}
                  className={`relative rounded-xl p-4 h-24 flex items-end bg-gradient-to-br ${CATEGORY_COLORS[cat] || "from-gray-700 to-gray-500"} cursor-pointer active:scale-95 transition-all shadow-lg border-t border-white/10 overflow-hidden`}
                  onClick={() => onCategoryClick(cat)}
                >
                  {catImage && (
                    <div className={`absolute -top-2 -right-2 w-24 h-24 pointer-events-none ${cat === "Travel" ? "travel-logo-wrapper" : ""}`}>
                      <img
                        src={catImage}
                        alt={cat}
                        className="w-full h-full object-contain opacity-85 pointer-events-none drop-shadow-lg relative z-10"
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
            "fixed bottom-48 right-4 z-50 w-10 h-10 rounded-full bg-primary/70 backdrop-blur-sm text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300",
            showScrollTop ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          )}
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
