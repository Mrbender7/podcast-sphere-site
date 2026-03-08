import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Podcast } from "@/types/podcast";
import { getTrendingPodcasts } from "@/services/PodcastService";
import { PodcastCard } from "@/components/PodcastCard";
import { ScrollableRow } from "@/components/ScrollableRow";
import { MultiSelectFilter, FilterOption } from "@/components/MultiSelectFilter";
import { useTranslation } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Bookmark, TrendingUp, ArrowUp, Headphones, Globe, ChevronDown } from "lucide-react";
import podcastSphereLogo from "@/assets/podcast-sphere-logo-new.png";

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
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [trendingLang, setTrendingLang] = useState<string>(language);

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

        {/* Categories — collapsible */}
        <section className="mb-6" ref={categorySectionRef}>
          <button
            onClick={() => {
              const willOpen = !categoriesOpen;
              setCategoriesOpen(willOpen);
              if (willOpen) {
                setTimeout(() => {
                  const container = scrollContainerRef.current;
                  const section = categorySectionRef.current;
                  if (container && section) {
                    container.scrollTo({
                      top: section.offsetTop - container.offsetTop,
                      behavior: "smooth",
                    });
                  }
                }, 80);
              }
            }}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h2 className="text-lg font-heading font-semibold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[hsl(220,90%,60%)]" />
              {t("home.exploreByCategory")}
            </h2>
            <ChevronDown className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-300",
              categoriesOpen && "rotate-180"
            )} />
          </button>
          <div className={cn(
            "grid grid-cols-2 gap-3 overflow-hidden transition-all duration-500 ease-in-out",
            categoriesOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          )}>
            {CATEGORIES.map(cat => (
              <div
                key={cat}
                className={`rounded-xl p-4 h-20 flex items-end bg-gradient-to-br ${CATEGORY_COLORS[cat] || "from-gray-700 to-gray-500"} cursor-pointer active:scale-95 transition-all shadow-lg border-t border-white/10`}
                onClick={() => onCategoryClick(cat)}
              >
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
