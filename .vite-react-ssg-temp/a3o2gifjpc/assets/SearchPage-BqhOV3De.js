import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { u as useTranslation, s as searchPodcasts, P as PodcastDetailPage, M as MultiSelectFilter, S as SearchResultsSkeleton, a as PodcastCard, c as cn } from "../main.mjs";
import { I as Input } from "./input-6XZgwDxx.js";
import { Search, X, Globe, FolderOpen, Clock, Trash2, ArrowUp } from "lucide-react";
import "vite-react-ssg";
import "react-helmet-async";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "@capacitor/core";
import "@capacitor/share";
import "@radix-ui/react-slider";
import "@radix-ui/react-popover";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-slot";
import "@radix-ui/react-select";
import "@radix-ui/react-alert-dialog";
import "react-router-dom";
const SEARCH_LANGUAGES = [
  { value: "fr", label: "🇫🇷 Français" },
  { value: "en", label: "🇬🇧 English" },
  { value: "es", label: "🇪🇸 Español" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "ja", label: "🇯🇵 日本語" },
  { value: "pt", label: "🇧🇷 Português" },
  { value: "it", label: "🇮🇹 Italiano" },
  { value: "ar", label: "🇸🇦 العربية" }
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
function SearchPage({ initialCategory }) {
  const [query, setQuery] = useState("");
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const { t, language } = useTranslation();
  const scrollContainerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
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
    return filtered;
  }, [results, selectedLangs, selectedCats]);
  if (selectedPodcast) {
    return /* @__PURE__ */ jsx(PodcastDetailPage, { podcast: selectedPodcast, onBack: () => setSelectedPodcast(null) });
  }
  return /* @__PURE__ */ jsxs("div", { ref: scrollContainerRef, onScroll: handleScroll, className: "flex-1 overflow-y-auto px-4 pb-32", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-heading font-bold mt-6 mb-4 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: t("search.title") }),
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
      )
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
    filteredResults && filteredResults.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mb-3", children: [
        filteredResults.length,
        " ",
        t("search.resultsCount")
      ] }),
      filteredResults.map((p) => /* @__PURE__ */ jsx(PodcastCard, { podcast: p, compact: true, onClick: setSelectedPodcast }, p.id))
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
export {
  SearchPage
};
