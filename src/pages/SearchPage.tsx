import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPodcasts } from "@/services/PodcastService";
import { Podcast } from "@/types/podcast";
import { PodcastCard } from "@/components/PodcastCard";
import { PodcastDetailPage } from "@/pages/PodcastDetailPage";
import { MultiSelectFilter, FilterOption } from "@/components/MultiSelectFilter";
import { SearchResultsSkeleton } from "@/components/SkeletonLoaders";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X, ArrowUp, Globe, FolderOpen, Clock, Trash2, ArrowDownAZ, ArrowUpZA, TrendingUp, List, Grid2X2, Grid3X3, LayoutGrid, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { FlagIcon } from "@/components/FlagIcon";
import { CachedImage } from "@/components/CachedImage";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

const SEARCH_LANGUAGES: FilterOption[] = [
  { value: "fr", label: "Français", icon: "fr" },
  { value: "en", label: "English", icon: "en" },
  { value: "es", label: "Español", icon: "es" },
  { value: "de", label: "Deutsch", icon: "de" },
  { value: "ja", label: "日本語", icon: "ja" },
  { value: "pt", label: "Português", icon: "pt" },
  { value: "it", label: "Italiano", icon: "it" },
  { value: "ar", label: "العربية", icon: "ar" },
];

const SEARCH_CATEGORIES = [
  "Technology", "Comedy", "News", "True Crime", "Health", "Business",
  "Science", "Education", "Sports", "Music", "Society", "History",
  "Fiction", "Horror", "Video Games", "Arts", "Food", "Travel",
  "Religion", "Kids & Family", "Politics", "Nature", "Film & TV",
  "Leisure", "Self-Improvement", "Relationships",
];

type SortMode = "default" | "az" | "za";
type ViewMode = "list" | "small" | "medium" | "large";

const VIEW_MODE_KEY = "podcastsphere_search_view";
const SORT_MODE_KEY = "podcastsphere_search_sort";

interface SearchPageProps {
  initialCategory?: string;
}

export function SearchPage({ initialCategory }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const { t, language } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Sort & view mode
  const [sortMode, setSortMode] = useState<SortMode>(() => {
    try { return (localStorage.getItem(SORT_MODE_KEY) as SortMode) || "default"; } catch { return "default"; }
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try { return (localStorage.getItem(VIEW_MODE_KEY) as ViewMode) || "list"; } catch { return "list"; }
  });

  // Persist preferences
  useEffect(() => { try { localStorage.setItem(SORT_MODE_KEY, sortMode); } catch {} }, [sortMode]);
  useEffect(() => { try { localStorage.setItem(VIEW_MODE_KEY, viewMode); } catch {} }, [viewMode]);

  // Search history
  const HISTORY_KEY = "podcastsphere_search_history";
  const MAX_HISTORY = 8;
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
  });

  const saveToHistory = useCallback((term: string) => {
    if (term.length < 2) return;
    setSearchHistory(prev => {
      const updated = [term, ...prev.filter(h => h !== term)].slice(0, MAX_HISTORY);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  }, []);

  // Multi-select filters
  const [selectedLangs, setSelectedLangs] = useState<string[]>([language]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const categoryOptions: FilterOption[] = useMemo(
    () => SEARCH_CATEGORIES.map(cat => ({ value: cat, label: t(`category.${cat}`) })),
    [t]
  );

  useEffect(() => {
    if (initialCategory) {
      setQuery(initialCategory);
      setSelectedPodcast(null);
    }
  }, [initialCategory]);

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ["podcastSearch", query],
    queryFn: () => {
      saveToHistory(query);
      return searchPodcasts(query, 60);
    },
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);

  // Client-side filtering + sorting
  const filteredResults = useMemo(() => {
    if (!results) return undefined;
    let filtered = results;

    if (selectedLangs.length > 0) {
      filtered = filtered.filter(p => selectedLangs.includes(p.language));
    }

    if (selectedCats.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.categories || p.categories.length === 0) return false;
        return selectedCats.some(cat =>
          p.categories.some(pc => pc.toLowerCase().includes(cat.toLowerCase()))
        );
      });
    }

    // Sort
    if (sortMode === "az") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === "za") {
      filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));
    }
    // "default" keeps API order (relevance)

    return filtered;
  }, [results, selectedLangs, selectedCats, sortMode]);

  if (selectedPodcast) {
    return <PodcastDetailPage podcast={selectedPodcast} onBack={() => setSelectedPodcast(null)} />;
  }

  const cycleSortMode = () => {
    setSortMode(prev => prev === "default" ? "az" : prev === "az" ? "za" : "default");
  };

  const sortIcon = sortMode === "az" ? <ArrowDownAZ className="w-4 h-4" /> 
    : sortMode === "za" ? <ArrowUpZA className="w-4 h-4" /> 
    : <TrendingUp className="w-4 h-4" />;

  const sortLabel = sortMode === "az" ? "A → Z" : sortMode === "za" ? "Z → A" : t("search.relevance");

  return (
    <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pb-32">
      <h1 className="text-2xl font-heading font-bold mt-6 mb-4 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
        <Search className="w-6 h-6 text-[hsl(280,80%,60%)]" />
        {t("search.title")}
      </h1>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="pl-10 pr-9 bg-accent border-0 text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters + Sort + View Mode */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        <MultiSelectFilter
          icon={<Globe className="w-3.5 h-3.5" />}
          label={t("search.languages")}
          options={SEARCH_LANGUAGES}
          selected={selectedLangs}
          onChange={setSelectedLangs}
        />
        <MultiSelectFilter
          icon={<FolderOpen className="w-3.5 h-3.5" />}
          label={t("search.categories")}
          options={categoryOptions}
          selected={selectedCats}
          onChange={setSelectedCats}
        />

        {/* Sort button */}
        <button
          onClick={cycleSortMode}
          className={cn(
            "h-8 px-2.5 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors",
            sortMode !== "default"
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border/50 bg-accent/30 text-muted-foreground hover:text-foreground"
          )}
        >
          {sortIcon}
          {sortLabel}
        </button>

        {/* View mode buttons */}
        <div className="flex items-center border border-border/50 rounded-md overflow-hidden ml-auto shrink-0">
          {([
            { mode: "list" as ViewMode, icon: <List className="w-3.5 h-3.5" /> },
            { mode: "small" as ViewMode, icon: <Grid3X3 className="w-3.5 h-3.5" /> },
            { mode: "medium" as ViewMode, icon: <Grid2X2 className="w-3.5 h-3.5" /> },
            { mode: "large" as ViewMode, icon: <LayoutGrid className="w-3.5 h-3.5" /> },
          ]).map(({ mode, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "h-8 w-8 flex items-center justify-center transition-colors",
                viewMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/30 text-muted-foreground hover:text-foreground"
              )}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {!query && (
        <div className="py-8">
          {searchHistory.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{t("search.recentSearches") || "Recherches récentes"}</span>
                </div>
                <button onClick={clearHistory} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-foreground hover:bg-primary/20 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-2">
              <Search className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">{t("search.useFilters")}</p>
            </div>
          )}
        </div>
      )}

      {isLoading && <SearchResultsSkeleton />}

      {isError && (
        <p className="text-sm text-destructive text-center py-12">{t("search.networkError")}</p>
      )}

      {filteredResults && filteredResults.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">{filteredResults.length} {t("search.resultsCount")}</p>
          <SearchResultsGrid results={filteredResults} viewMode={viewMode} onSelect={setSelectedPodcast} />
        </div>
      )}

      {filteredResults && filteredResults.length === 0 && query.length >= 2 && (
        <p className="text-sm text-muted-foreground text-center py-12">{t("search.noResults")}</p>
      )}

      <button
        onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-10 h-10 rounded-full bg-primary/70 backdrop-blur-sm text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300",
          showScrollTop ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}

// Results grid component supporting different view modes
function SearchResultsGrid({ results, viewMode, onSelect }: { results: Podcast[]; viewMode: ViewMode; onSelect: (p: Podcast) => void }) {
  if (viewMode === "list") {
    return (
      <div className="space-y-1">
        {results.map(p => (
          <PodcastCard key={p.id} podcast={p} compact onClick={onSelect} />
        ))}
      </div>
    );
  }

  const gridClass = viewMode === "small"
    ? "grid grid-cols-4 gap-2"
    : viewMode === "medium"
    ? "grid grid-cols-3 gap-3"
    : "grid grid-cols-2 gap-4";

  const imageSize = viewMode === "small" ? "w-full aspect-square" 
    : viewMode === "medium" ? "w-full aspect-square"
    : "w-full aspect-square";

  return (
    <div className={gridClass}>
      {results.map(p => (
        <GridPodcastCard key={p.id} podcast={p} viewMode={viewMode} onClick={onSelect} />
      ))}
    </div>
  );
}

function GridPodcastCard({ podcast, viewMode, onClick }: { podcast: Podcast; viewMode: ViewMode; onClick: (p: Podcast) => void }) {
  const { isSubscribed, toggleSubscription } = useFavoritesContext();
  const { t } = useTranslation();
  const subscribed = isSubscribed(podcast.id);

  const handleToggleSub = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSubscription(podcast);
    if (!subscribed) toast.success(`${t("podcast.subscribed")} — ${podcast.title}`);
  };

  const isSmall = viewMode === "small";

  return (
    <div
      className="cursor-pointer group relative"
      onClick={() => onClick(podcast)}
    >
      <div className="aspect-square rounded-xl overflow-hidden bg-accent mb-1.5 shadow-lg group-active:scale-95 transition-transform relative"
        style={{ boxShadow: '0 4px 15px -3px hsla(250, 80%, 50%, 0.3)' }}
      >
        <CachedImage
          src={podcast.image}
          alt={podcast.title}
          className="w-full h-full object-cover"
        />
        {!isSmall && (
          <button
            onClick={handleToggleSub}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Bookmark className={`w-3.5 h-3.5 ${subscribed ? "fill-primary text-primary" : "text-foreground"}`} />
          </button>
        )}
      </div>
      <p className={cn(
        "font-semibold text-foreground truncate",
        isSmall ? "text-[10px]" : viewMode === "medium" ? "text-xs" : "text-sm"
      )}>{podcast.title}</p>
      {!isSmall && (
        <p className={cn(
          "text-muted-foreground truncate",
          viewMode === "medium" ? "text-[10px]" : "text-xs"
        )}>{podcast.author}</p>
      )}
    </div>
  );
}
