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
import { CATEGORY_ICON_MAP } from "@/components/CategoryIcons";

const CATEGORIES = [
  "Technology", "Comedy", "News", "True Crime", "Health", "Business",
  "Science", "Education", "Sports", "Music", "Society", "History",
  "Fiction", "Horror", "Video Games", "Arts", "Food", "Travel",
];

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "from-cyan-700 to-blue-400",
  Comedy: "from-yellow-600 to-amber-400",
  News: "from-slate-700 to-gray-400",
  "True Crime": "from-red-800 to-rose-500",
  Health: "from-green-700 to-emerald-400",
  Business: "from-indigo-700 to-blue-400",
  Science: "from-purple-700 to-violet-400",
  Education: "from-teal-700 to-cyan-400",
  Sports: "from-orange-600 to-yellow-400",
  Music: "from-pink-600 to-rose-400",
  Society: "from-amber-700 to-yellow-500",
  History: "from-stone-700 to-amber-500",
  Fiction: "from-violet-700 to-fuchsia-400",
  Horror: "from-gray-900 to-red-700",
  "Video Games": "from-emerald-600 to-lime-400",
  Arts: "from-fuchsia-700 to-pink-400",
  Food: "from-orange-700 to-amber-400",
  Travel: "from-sky-600 to-teal-400",
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
            {CATEGORIES.map(cat => (
              <div
                key={cat}
                className={`relative rounded-xl p-4 h-20 flex items-end bg-gradient-to-br ${CATEGORY_COLORS[cat] || "from-gray-700 to-gray-500"} cursor-pointer active:scale-95 transition-all shadow-lg border-t border-white/10 overflow-hidden`}
                onClick={() => onCategoryClick(cat)}
              >
                {cat === "Comedy" && (
                  <svg
                    width="44" height="44" viewBox="0 0 120 120" fill="none"
                    className="absolute top-1 right-1 animate-neon-pulse pointer-events-none"
                  >
                    <circle cx="60" cy="60" r="54" stroke="white" strokeWidth="1.5" opacity="0.6" />
                    <path d="M40 38C38 32 44 26 52 28L60 30L68 28C76 26 82 32 80 38L78 52C77 62 74 72 68 78C64 82 56 82 52 78C46 72 43 62 42 52Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
                    <path d="M46 42C47 39 50 38 53 40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    <path d="M67 40C70 38 73 39 74 42" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                    <path d="M47 48C48 45 52 45 53 48" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
                    <path d="M67 48C68 45 72 45 73 48" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
                    <path d="M59 52L58 57L61 58" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                    <path d="M48 62C50 72 56 76 60 76C64 76 70 72 72 62" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
                  </svg>
                )}
                <span className="text-sm font-heading font-bold text-white capitalize drop-shadow-md">{t(`category.${cat}`)}</span>
              </div>
            ))}
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
