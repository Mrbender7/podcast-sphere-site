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

const CATEGORIES = [
  "Technology", "Comedy", "News", "True Crime", "Health", "Business",
  "Science", "Education", "Sports", "Music", "Society", "History",
  "Fiction", "Horror", "Video Games", "Arts", "Food", "Travel",
];

const CATEGORY_STYLES: Record<string, { bg: string; color: string; glow: string }> = {
  Technology: { bg: "from-[#1c3b6d] to-[#0c204c]", color: "#00e0ff", glow: "rgba(0,224,255,0.5)" },
  Comedy: { bg: "from-[#7c4c0c] to-[#4c2c0c]", color: "#ffa500", glow: "rgba(255,165,0,0.5)" },
  News: { bg: "from-slate-700 to-gray-800", color: "#a0aec0", glow: "rgba(160,174,192,0.4)" },
  "True Crime": { bg: "from-red-900 to-[#3a0a0a]", color: "#ff4444", glow: "rgba(255,68,68,0.5)" },
  Health: { bg: "from-[#0d4a2e] to-[#062e1a]", color: "#34d399", glow: "rgba(52,211,153,0.5)" },
  Business: { bg: "from-[#1e3a5f] to-[#0f1f3a]", color: "#60a5fa", glow: "rgba(96,165,250,0.5)" },
  Science: { bg: "from-[#3b1f6e] to-[#1f0f3d]", color: "#a78bfa", glow: "rgba(167,139,250,0.5)" },
  Education: { bg: "from-[#134e4a] to-[#0a2e2b]", color: "#2dd4bf", glow: "rgba(45,212,191,0.5)" },
  Sports: { bg: "from-[#6b3a00] to-[#3a1f00]", color: "#fb923c", glow: "rgba(251,146,60,0.5)" },
  Music: { bg: "from-[#6b1d5e] to-[#3a0f32]", color: "#f472b6", glow: "rgba(244,114,182,0.5)" },
  Society: { bg: "from-[#5c4a1e] to-[#3a2e0f]", color: "#fbbf24", glow: "rgba(251,191,36,0.5)" },
  History: { bg: "from-[#4a3728] to-[#2a1f16]", color: "#d4a76a", glow: "rgba(212,167,106,0.5)" },
  Fiction: { bg: "from-[#4c1d95] to-[#2e1065]", color: "#c084fc", glow: "rgba(192,132,252,0.5)" },
  Horror: { bg: "from-[#1a1a1a] to-[#0a0a0a]", color: "#ef4444", glow: "rgba(239,68,68,0.5)" },
  "Video Games": { bg: "from-[#064e3b] to-[#022c22]", color: "#4ade80", glow: "rgba(74,222,128,0.5)" },
  Arts: { bg: "from-[#701a75] to-[#4a044e]", color: "#e879f9", glow: "rgba(232,121,249,0.5)" },
  Food: { bg: "from-[#6b3a00] to-[#3a1f00]", color: "#fb923c", glow: "rgba(251,146,60,0.5)" },
  Travel: { bg: "from-[#0c4a6e] to-[#082f49]", color: "#38bdf8", glow: "rgba(56,189,248,0.5)" },
};

/* SVG icon paths per category (fill-based, viewBox 0 0 24 24) */
const CATEGORY_ICONS: Record<string, string> = {
  Technology: "M20 6H16.82L13.11 2.29C12.92 2.1 12.67 2 12.41 2C12.16 2 11.91 2.1 11.72 2.29L8 6H4C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8C22 6.9 21.1 6 20 6ZM12 18C10.62 18 9.39 17.44 8.5 16.55L9.91 15.14C10.43 15.67 11.18 16 12 16C12.82 16 13.57 15.67 14.09 15.14L15.5 16.55C14.61 17.44 13.38 18 12 18ZM14 14C14 15.1 13.1 16 12 16C10.9 16 10 12.9 10 14C10 12.9 10.9 12 12 12C13.1 12 14 12.9 14 14Z",
  Comedy: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM15.5 11C16.33 11 17 10.33 17 9.5C17 8.67 16.33 8 15.5 8C14.67 8 14 8.67 14 9.5C14 10.33 14.67 11 15.5 11ZM8.5 11C9.33 11 10 10.33 10 9.5C10 8.67 9.33 8 8.5 8C7.67 8 7 8.67 7 9.5C7 10.33 7.67 11 8.5 11ZM12 17.5C14.33 17.5 16.31 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z",
  News: "M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18Z",
  "True Crime": "M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 16.11 15.72 19.78 12 20.93V12H5V6.3L12 3.19V11.99Z",
  Health: "M17 10.5V7C17 4.24 14.76 2 12 2S7 4.24 7 7V10.5C4.72 12.12 3.5 14.75 3.5 17.5C3.5 22.19 7.31 26 12 22C16.69 26 20.5 22.19 20.5 17.5C20.5 14.75 19.28 12.12 17 10.5ZM13 16H11V14H9V12H11V10H13V12H15V14H13V16Z",
  Business: "M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2 6.89 2 8V19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM10 4H14V6H10V4ZM20 19H4V8H20V19Z",
  Science: "M13 11.33L18 18H6L11 11.33V7H8V5H16V7H13V11.33ZM12 1C11.45 1 11 1.45 11 2S11.45 3 12 3S13 2.55 13 2S12.55 1 12 1ZM7 22H17C17.55 22 18 21.55 18 21S17.55 20 17 20H7C6.45 20 6 20.45 6 21S6.45 22 7 22Z",
  Education: "M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18ZM12 3L1 9L12 15L21 10.09V17H23V9L12 3Z",
  Sports: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 5.3L14.35 4.35C16.36 5.08 17.96 6.68 18.69 8.69L18.34 9.03L16.27 8.47L13 5.3ZM9.65 4.35L11 5.3L7.73 8.47L5.66 9.03L5.31 8.68C6.04 6.68 7.64 5.08 9.65 4.35ZM7.08 17.11L5.58 14.84L6.09 12.77L8.17 12.23L11 14.42V17.89C9.53 17.64 8.16 17.05 7.08 17.11ZM16.92 17.11C15.84 17.05 14.47 17.64 13 17.89V14.42L15.83 12.23L17.91 12.77L18.42 14.84L16.92 17.11Z",
  Music: "M12 3V13.55C11.41 13.21 10.73 13 10 13C7.79 13 6 14.79 6 17C6 19.21 7.79 21 10 21C12.21 21 14 19.21 14 17V7H18V3H12Z",
  Society: "M16.5 13C15.3 13 14.23 13.5 13.5 14.26C12.77 13.5 11.7 13 10.5 13C8.02 13 6 15.02 6 17.5C6 19.98 8.02 22 10.5 22H16.5C18.98 22 21 19.98 21 17.5C21 15.02 18.98 13 16.5 13ZM9 11C10.66 11 12 9.66 12 8C12 6.34 10.66 5 9 5C7.34 5 6 6.34 6 8C6 9.66 7.34 11 9 11ZM18 11C19.66 11 21 9.66 21 8C21 6.34 19.66 5 18 5C16.34 5 15 6.34 15 8C15 9.66 16.34 11 18 11Z",
  History: "M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z",
  Fiction: "M21 5C19.89 4.65 18.67 4.5 17.5 4.5C15.55 4.5 13.45 4.9 12 6C10.55 4.9 8.45 4.5 6.5 4.5C4.55 4.5 2.45 4.9 1 6V20.65C1 20.9 1.25 21.15 1.5 21.15C1.6 21.15 1.65 21.1 1.75 21.1C3.1 20.45 5.05 20 6.5 20C8.45 20 10.55 20.4 12 21.5C13.35 20.65 15.8 20 17.5 20C19.15 20 20.85 20.3 22.25 21.05C22.35 21.1 22.4 21.1 22.5 21.1C22.75 21.1 23 20.85 23 20.6V6C22.4 5.55 21.75 5.25 21 5ZM21 18.5C19.9 18.15 18.7 18 17.5 18C15.8 18 13.35 18.65 12 19.5V8C13.35 7.15 15.8 6.5 17.5 6.5C18.7 6.5 19.9 6.65 21 7V18.5Z",
  Horror: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM8 14C8 12.9 8.9 12 10 12S12 12.9 12 14H8ZM12 14C12 12.9 12.9 12 14 12S16 12.9 16 14H12ZM7 17C7 17 9 19 12 19C15 19 17 17 17 17C17 17 15 15 12 15C9 15 7 17 7 17Z",
  "Video Games": "M21 6H3C1.9 6 1 6.9 1 8V16C1 17.1 1.9 18 3 18H21C22.1 18 23 17.1 23 16V8C23 6.9 22.1 6 21 6ZM11 13H9V15H7V13H5V11H7V9H9V11H11V13ZM15.5 15C14.67 15 14 14.33 14 13.5C14 12.67 14.67 12 15.5 12C16.33 12 17 12.67 17 13.5C17 14.33 16.33 15 15.5 15ZM19.5 12C18.67 12 18 11.33 18 10.5C18 9.67 18.67 9 19.5 9C20.33 9 21 9.67 21 10.5C21 11.33 20.33 12 19.5 12Z",
  Arts: "M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2C17.51 2 22 6.04 22 11C22 14.31 19.31 17 16 17H14.23C13.95 17 13.73 17.22 13.73 17.5C13.73 17.62 13.77 17.73 13.84 17.82C14.24 18.29 14.5 18.89 14.5 19.5C14.5 20.88 13.38 22 12 22ZM12 4C7.59 4 4 7.59 4 12C4 16.41 7.59 20 12 20C12.28 20 12.5 19.78 12.5 19.5C12.5 19.34 12.42 19.2 12.33 19.1C11.93 18.64 11.73 18.09 11.73 17.5C11.73 16.12 12.85 15 14.23 15H16C18.21 15 20 13.21 20 11C20 7.14 16.41 4 12 4ZM6.5 13C5.67 13 5 12.33 5 11.5S5.67 10 6.5 10S8 10.67 8 11.5S7.33 13 6.5 13ZM9.5 9C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6S11 6.67 11 7.5S10.33 9 9.5 9ZM14.5 9C13.67 9 13 8.33 13 7.5S13.67 6 14.5 6S16 6.67 16 7.5S15.33 9 14.5 9ZM17.5 13C16.67 13 16 12.33 16 11.5S16.67 10 17.5 10S19 10.67 19 11.5S18.33 13 17.5 13Z",
  Food: "M11 9H9V2H7V9H5V2H3V9C3 11.12 4.66 12.84 6.75 12.97V22H9.25V12.97C11.34 12.84 13 11.12 13 9V2H11V9ZM16 6V14H18.5V22H21V2C18.24 2 16 4.24 16 7V6Z",
  Travel: "M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19.5L8 21V22.5L11.5 21.5L15 22.5V21L13 19.5V13.5L21 16Z",
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
                    width="52" height="52" viewBox="20 20 80 80" fill="none"
                    className="absolute top-0.5 right-0.5 animate-neon-pulse pointer-events-none"
                  >
                    <path d="M40 38C38 32 44 26 52 28L60 30L68 28C76 26 82 32 80 38L78 52C77 62 74 72 68 78C64 82 56 82 52 78C46 72 43 62 42 52Z" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
                    <path d="M46 42C47 39 50 38 53 40" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                    <path d="M67 40C70 38 73 39 74 42" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
                    <path d="M47 48C48 45 52 45 53 48" stroke="white" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />
                    <path d="M67 48C68 45 72 45 73 48" stroke="white" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />
                    <path d="M59 52L58 57L61 58" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                    <path d="M48 62C50 72 56 76 60 76C64 76 70 72 72 62" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
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
