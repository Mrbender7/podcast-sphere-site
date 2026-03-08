import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPodcasts } from "@/services/PodcastService";
import { Podcast } from "@/types/podcast";
import { PodcastCard } from "@/components/PodcastCard";
import { PodcastDetailPage } from "@/pages/PodcastDetailPage";
import { MultiSelectFilter, FilterOption } from "@/components/MultiSelectFilter";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X, ArrowUp, Globe, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

const SEARCH_LANGUAGES: FilterOption[] = [
  { value: "fr", label: "🇫🇷 Français" },
  { value: "en", label: "🇬🇧 English" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "ja", label: "🇯🇵 日本語" },
  { value: "pt", label: "🇧🇷 Português" },
  { value: "it", label: "🇮🇹 Italiano" },
  { value: "ar", label: "🇸🇦 العربية" },
];

const SEARCH_CATEGORIES = [
  "Technology", "Comedy", "News", "True Crime", "Health", "Business",
  "Science", "Education", "Sports", "Music", "Society", "History",
  "Fiction", "Horror", "Video Games", "Arts", "Food", "Travel",
  "Religion", "Kids & Family", "Politics", "Nature", "Film & TV",
  "Leisure", "Self-Improvement", "Relationships",
];

interface SearchPageProps {
  initialCategory?: string;
}

export function SearchPage({ initialCategory }: SearchPageProps) {
  const [query, setQuery] = useState("");
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const { t, language } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Multi-select filters: default lang = app language
  const [selectedLangs, setSelectedLangs] = useState<string[]>([language]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  // Build translated category options
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
    queryFn: () => searchPodcasts(query, 60),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);

  // Client-side filtering: OR for langs, OR for cats, intersection of both
  const filteredResults = useMemo(() => {
    if (!results) return undefined;
    let filtered = results;

    // Filter by languages (OR)
    if (selectedLangs.length > 0) {
      filtered = filtered.filter(p => selectedLangs.includes(p.language));
    }

    // Filter by categories (OR) — match if podcast has any of the selected categories
    if (selectedCats.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.categories || p.categories.length === 0) return false;
        return selectedCats.some(cat =>
          p.categories.some(pc => pc.toLowerCase().includes(cat.toLowerCase()))
        );
      });
    }

    return filtered;
  }, [results, selectedLangs, selectedCats]);

  if (selectedPodcast) {
    return <PodcastDetailPage podcast={selectedPodcast} onBack={() => setSelectedPodcast(null)} />;
  }

  return (
    <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pb-32">
      <h1 className="text-2xl font-heading font-bold mt-6 mb-4 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent">
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

      {/* Multi-select filters */}
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
      </div>

      {!query && (
        <p className="text-sm text-muted-foreground text-center py-12">{t("search.useFilters")}</p>
      )}

      {isLoading && (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      )}

      {isError && (
        <p className="text-sm text-destructive text-center py-12">{t("search.networkError")}</p>
      )}

      {filteredResults && filteredResults.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground mb-3">{filteredResults.length} {t("search.resultsCount")}</p>
          {filteredResults.map(p => (
            <PodcastCard key={p.id} podcast={p} compact onClick={setSelectedPodcast} />
          ))}
        </div>
      )}

      {filteredResults && filteredResults.length === 0 && query.length >= 2 && (
        <p className="text-sm text-muted-foreground text-center py-12">{t("search.noResults")}</p>
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
