import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { u as useTranslation, s as searchPodcasts, P as PodcastDetailPage, M as MultiSelectFilter, c as cn, S as SearchResultsSkeleton, a as PodcastCard, b as useFavoritesContext, C as CachedImage } from "../main.mjs";
import { I as Input } from "./input-6XZgwDxx.js";
import { Search, X, Globe, FolderOpen, List, Grid3X3, Grid2X2, LayoutGrid, Clock, Trash2, ArrowUp, Bookmark, ArrowDownAZ, ArrowUpZA, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import "vite-react-ssg";
import "react-helmet-async";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "@radix-ui/react-tooltip";
import "@capacitor/core";
import "@radix-ui/react-slider";
import "@radix-ui/react-popover";
import "@radix-ui/react-select";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-slot";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "react-router-dom";
const SEARCH_LANGUAGES = [
  { value: "fr", label: "Français", icon: "fr" },
  { value: "en", label: "English", icon: "en" },
  { value: "es", label: "Español", icon: "es" },
  { value: "de", label: "Deutsch", icon: "de" },
  { value: "ja", label: "日本語", icon: "ja" },
  { value: "pt", label: "Português", icon: "pt" },
  { value: "it", label: "Italiano", icon: "it" },
  { value: "ar", label: "العربية", icon: "ar" }
];
const SEARCH_CATEGORIES = [
  "Technology",
  "Comedy",
  "News",
  "True Crime",
  "Health",
  "Business",
  "Science",
  "Education",
  "Sports",
  "Music",
  "Society",
  "History",
  "Fiction",
  "Horror",
  "Video Games",
  "Arts",
  "Food",
  "Travel",
  "Religion",
  "Kids & Family",
  "Politics",
  "Nature",
  "Film & TV",
  "Leisure",
  "Self-Improvement",
  "Relationships"
];
const VIEW_MODE_KEY = "podcastsphere_search_view";
const SORT_MODE_KEY = "podcastsphere_search_sort";
function SearchPage({ initialCategory }) {
  const [query, setQuery] = useState("");
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const { t, language } = useTranslation();
  const scrollContainerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sortMode, setSortMode] = useState(() => {
    try {
      return localStorage.getItem(SORT_MODE_KEY) || "default";
    } catch {
      return "default";
    }
  });
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(VIEW_MODE_KEY) || "list";
    } catch {
      return "list";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(SORT_MODE_KEY, sortMode);
    } catch {
    }
  }, [sortMode]);
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    } catch {
    }
  }, [viewMode]);
  const HISTORY_KEY = "podcastsphere_search_history";
  const MAX_HISTORY = 8;
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const saveToHistory = useCallback((term) => {
    if (term.length < 2) return;
    setSearchHistory((prev) => {
      const updated = [term, ...prev.filter((h) => h !== term)].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch {
      }
      return updated;
    });
  }, []);
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
    }
  }, []);
  const [selectedLangs, setSelectedLangs] = useState([language]);
  const [selectedCats, setSelectedCats] = useState([]);
  const categoryOptions = useMemo(
    () => SEARCH_CATEGORIES.map((cat) => ({ value: cat, label: t(`category.${cat}`) })),
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
    staleTime: 2 * 60 * 1e3
  });
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);
  const filteredResults = useMemo(() => {
    if (!results) return void 0;
    let filtered = results;
    if (selectedLangs.length > 0) {
      filtered = filtered.filter((p) => selectedLangs.includes(p.language));
    }
    if (selectedCats.length > 0) {
      filtered = filtered.filter((p) => {
        if (!p.categories || p.categories.length === 0) return false;
        return selectedCats.some(
          (cat) => p.categories.some((pc) => pc.toLowerCase().includes(cat.toLowerCase()))
        );
      });
    }
    if (sortMode === "az") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === "za") {
      filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));
    }
    return filtered;
  }, [results, selectedLangs, selectedCats, sortMode]);
  if (selectedPodcast) {
    return /* @__PURE__ */ jsx(PodcastDetailPage, { podcast: selectedPodcast, onBack: () => setSelectedPodcast(null) });
  }
  const cycleSortMode = () => {
    setSortMode((prev) => prev === "default" ? "az" : prev === "az" ? "za" : "default");
  };
  const sortIcon = sortMode === "az" ? /* @__PURE__ */ jsx(ArrowDownAZ, { className: "w-4 h-4" }) : sortMode === "za" ? /* @__PURE__ */ jsx(ArrowUpZA, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4" });
  const sortLabel = sortMode === "az" ? "A → Z" : sortMode === "za" ? "Z → A" : t("search.relevance");
  return /* @__PURE__ */ jsxs("div", { ref: scrollContainerRef, onScroll: handleScroll, className: "flex-1 overflow-y-auto px-4 pb-32", children: [
    /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-heading font-bold mt-6 mb-4 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Search, { className: "w-6 h-6 text-[hsl(280,80%,60%)]" }),
      t("search.title")
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative mb-3", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          value: query,
          onChange: (e) => setQuery(e.target.value),
          placeholder: t("search.placeholder"),
          className: "pl-10 pr-9 bg-accent border-0 text-foreground placeholder:text-muted-foreground"
        }
      ),
      query && /* @__PURE__ */ jsx("button", { onClick: () => setQuery(""), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1", children: [
      /* @__PURE__ */ jsx(
        MultiSelectFilter,
        {
          icon: /* @__PURE__ */ jsx(Globe, { className: "w-3.5 h-3.5" }),
          label: t("search.languages"),
          options: SEARCH_LANGUAGES,
          selected: selectedLangs,
          onChange: setSelectedLangs
        }
      ),
      /* @__PURE__ */ jsx(
        MultiSelectFilter,
        {
          icon: /* @__PURE__ */ jsx(FolderOpen, { className: "w-3.5 h-3.5" }),
          label: t("search.categories"),
          options: categoryOptions,
          selected: selectedCats,
          onChange: setSelectedCats
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: cycleSortMode,
          className: cn(
            "h-8 px-2.5 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors",
            sortMode !== "default" ? "border-primary/50 bg-primary/10 text-primary" : "border-border/50 bg-accent/30 text-muted-foreground hover:text-foreground"
          ),
          children: [
            sortIcon,
            sortLabel
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex items-center border border-border/50 rounded-md overflow-hidden ml-auto shrink-0", children: [
        { mode: "list", icon: /* @__PURE__ */ jsx(List, { className: "w-3.5 h-3.5" }) },
        { mode: "small", icon: /* @__PURE__ */ jsx(Grid3X3, { className: "w-3.5 h-3.5" }) },
        { mode: "medium", icon: /* @__PURE__ */ jsx(Grid2X2, { className: "w-3.5 h-3.5" }) },
        { mode: "large", icon: /* @__PURE__ */ jsx(LayoutGrid, { className: "w-3.5 h-3.5" }) }
      ].map(({ mode, icon }) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setViewMode(mode),
          className: cn(
            "h-8 w-8 flex items-center justify-center transition-colors",
            viewMode === mode ? "bg-primary text-primary-foreground" : "bg-accent/30 text-muted-foreground hover:text-foreground"
          ),
          children: icon
        },
        mode
      )) })
    ] }),
    !query && /* @__PURE__ */ jsx("div", { className: "py-8", children: searchHistory.length > 0 ? /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: t("search.recentSearches") || "Recherches récentes" })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: clearHistory, className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3 h-3" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: searchHistory.map((term) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setQuery(term),
          className: "px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-foreground hover:bg-primary/20 transition-colors",
          children: term
        },
        term
      )) })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center text-center gap-2", children: [
      /* @__PURE__ */ jsx(Search, { className: "w-10 h-10 text-muted-foreground/30" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("search.useFilters") })
    ] }) }),
    isLoading && /* @__PURE__ */ jsx(SearchResultsSkeleton, {}),
    isError && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive text-center py-12", children: t("search.networkError") }),
    filteredResults && filteredResults.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mb-3", children: [
        filteredResults.length,
        " ",
        t("search.resultsCount")
      ] }),
      /* @__PURE__ */ jsx(SearchResultsGrid, { results: filteredResults, viewMode, onSelect: setSelectedPodcast })
    ] }),
    filteredResults && filteredResults.length === 0 && query.length >= 2 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-12", children: t("search.noResults") }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          var _a;
          return (_a = scrollContainerRef.current) == null ? void 0 : _a.scrollTo({ top: 0, behavior: "smooth" });
        },
        className: cn(
          "fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-10 h-10 rounded-full bg-primary/70 backdrop-blur-sm text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300",
          showScrollTop ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        ),
        children: /* @__PURE__ */ jsx(ArrowUp, { className: "w-5 h-5" })
      }
    )
  ] });
}
function SearchResultsGrid({ results, viewMode, onSelect }) {
  if (viewMode === "list") {
    return /* @__PURE__ */ jsx("div", { className: "space-y-1", children: results.map((p) => /* @__PURE__ */ jsx(PodcastCard, { podcast: p, compact: true, onClick: onSelect }, p.id)) });
  }
  const gridClass = viewMode === "small" ? "grid grid-cols-4 gap-2" : viewMode === "medium" ? "grid grid-cols-3 gap-3" : "grid grid-cols-2 gap-4";
  return /* @__PURE__ */ jsx("div", { className: gridClass, children: results.map((p) => /* @__PURE__ */ jsx(GridPodcastCard, { podcast: p, viewMode, onClick: onSelect }, p.id)) });
}
function GridPodcastCard({ podcast, viewMode, onClick }) {
  const { isSubscribed, toggleSubscription } = useFavoritesContext();
  const { t } = useTranslation();
  const subscribed = isSubscribed(podcast.id);
  const handleToggleSub = (e) => {
    e.stopPropagation();
    toggleSubscription(podcast);
    if (!subscribed) toast.success(`${t("podcast.subscribed")} — ${podcast.title}`);
  };
  const isSmall = viewMode === "small";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "cursor-pointer group relative transition-transform duration-300 ease-out hover:scale-105",
      onClick: () => onClick(podcast),
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "aspect-square rounded-xl overflow-hidden bg-accent mb-1.5 shadow-lg group-active:scale-95 transition-all duration-300 ease-out group-hover:shadow-[0_8px_30px_-4px_hsl(var(--primary)/0.45)] relative",
            style: { boxShadow: "0 4px 15px -3px hsla(250, 80%, 50%, 0.3)" },
            children: [
              /* @__PURE__ */ jsx(
                CachedImage,
                {
                  src: podcast.image,
                  alt: podcast.title,
                  className: "w-full h-full object-cover"
                }
              ),
              !isSmall && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleToggleSub,
                  className: "absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                  children: /* @__PURE__ */ jsx(Bookmark, { className: `w-3.5 h-3.5 ${subscribed ? "fill-primary text-primary" : "text-foreground"}` })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: cn(
          "font-semibold text-foreground truncate",
          isSmall ? "text-[10px]" : viewMode === "medium" ? "text-xs" : "text-sm"
        ), children: podcast.title }),
        !isSmall && /* @__PURE__ */ jsx("p", { className: cn(
          "text-muted-foreground truncate",
          viewMode === "medium" ? "text-[10px]" : "text-xs"
        ), children: podcast.author })
      ]
    }
  );
}
export {
  SearchPage
};
