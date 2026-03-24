import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from "react";
import { u as useTranslation, b as usePlayer, C as CachedImage, d as useFavoritesContext, e as useDownloads, N as NewEpisodesService, g as getListenHistory, p as preCacheImages, f as clearHistory, r as removeFromHistory, P as PodcastDetailPage, a as PodcastCard, c as cn, h as MarqueeText } from "../main.mjs";
import { Scissors, Play, Share2, Trash2, Bookmark, ChevronDown, Download, Loader2, Pause, X, Sparkles, Clock, ArrowUp, CheckCircle2 } from "lucide-react";
import { Share } from "@capacitor/share";
import { toast } from "sonner";
import "vite-react-ssg";
import "react-helmet-async";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "@radix-ui/react-tooltip";
import "@tanstack/react-query";
import "@capacitor/core";
import "@radix-ui/react-slider";
import "@radix-ui/react-popover";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-slot";
import "@radix-ui/react-select";
import "@radix-ui/react-alert-dialog";
import "react-router-dom";
const SNIPPETS_STORAGE_KEY = "ps_premium_snippets";
const SnippetService = {
  getAllSnippets() {
    try {
      const data = localStorage.getItem(SNIPPETS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erreur lors de la lecture des snippets locaux:", error);
      return [];
    }
  },
  saveSnippet(episode, currentTime, duration = 30, customTitle) {
    if (!episode || currentTime <= 0) return null;
    const snippets = this.getAllSnippets();
    const startTime = Math.max(0, currentTime - duration);
    const newSnippet = {
      id: `snippet_${Date.now()}`,
      episodeId: episode.id,
      episodeTitle: episode.title,
      podcastTitle: episode.feedTitle || "Podcast Inconnu",
      artwork: episode.feedImage || episode.image || "",
      startTime,
      endTime: currentTime,
      duration,
      createdAt: Date.now(),
      customTitle
    };
    snippets.unshift(newSnippet);
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(snippets));
    return newSnippet;
  },
  deleteSnippet(snippetId) {
    const snippets = this.getAllSnippets();
    const filtered = snippets.filter((s) => s.id !== snippetId);
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(filtered));
  },
  async shareSnippet(snippet, enclosureUrl) {
    const shareText = `Écoute cet extrait de "${snippet.podcastTitle}" ! 🎧

Épisode : ${snippet.episodeTitle}
Extrait de ${this.formatTime(snippet.startTime)} à ${this.formatTime(snippet.endTime)}.

Lien pour écouter : ${enclosureUrl || "Lien indisponible"}`;
    try {
      await Share.share({
        title: `Extrait : ${snippet.podcastTitle}`,
        text: shareText,
        dialogTitle: "Partager cet extrait sonore"
      });
    } catch (error) {
      console.error("Erreur lors de l'appel au partage natif :", error);
    }
  },
  formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
};
function ClipsPage() {
  useTranslation();
  const { currentEpisode, seek, play } = usePlayer();
  const [snippets, setSnippets] = useState(() => SnippetService.getAllSnippets());
  const handleDelete = (id) => {
    SnippetService.deleteSnippet(id);
    setSnippets(SnippetService.getAllSnippets());
    toast.success("Clip supprimé");
  };
  const handlePlay = (snippet) => {
    if (currentEpisode && currentEpisode.id === snippet.episodeId) {
      seek(snippet.startTime);
    } else {
      toast.info("Lance d'abord l'épisode, puis reviens ici pour réécouter le clip.");
    }
  };
  const handleShare = async (snippet) => {
    try {
      await SnippetService.shareSnippet(snippet);
    } catch {
      toast.error("Erreur lors du partage");
    }
  };
  if (snippets.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center px-6", children: [
      /* @__PURE__ */ jsx(Scissors, { className: "w-12 h-12 text-muted-foreground/30 mb-3" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Aucun clip sauvegardé. Utilise le bouton ✂️ dans le lecteur pour créer un clip." })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-2", children: snippets.map((snippet) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors",
      children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent", children: /* @__PURE__ */ jsx(
          CachedImage,
          {
            src: snippet.artwork,
            alt: snippet.podcastTitle,
            className: "w-full h-full object-cover"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: snippet.customTitle || snippet.podcastTitle }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: snippet.episodeTitle }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground font-mono mt-0.5", children: [
            SnippetService.formatTime(snippet.startTime),
            " → ",
            SnippetService.formatTime(snippet.endTime),
            " (",
            snippet.duration,
            "s)"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePlay(snippet),
              className: "w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors",
              "aria-label": "Play clip",
              children: /* @__PURE__ */ jsx(Play, { className: "w-3.5 h-3.5 ml-0.5 text-foreground" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleShare(snippet),
              className: "w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors",
              "aria-label": "Share clip",
              children: /* @__PURE__ */ jsx(Share2, { className: "w-3.5 h-3.5 text-foreground" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDelete(snippet.id),
              className: "w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
              "aria-label": "Delete clip",
              children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
            }
          )
        ] })
      ]
    },
    snippet.id
  )) });
}
const INITIAL_VISIBLE = 3;
function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 6e4);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}
function HistoryRow({
  entry,
  onPlay,
  onRemove,
  isCurrent,
  isCurrentPlaying,
  isCurrentBuffering,
  onTogglePlay
}) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer group", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center gap-3 flex-1 min-w-0",
        onClick: () => isCurrent ? onTogglePlay() : onPlay(entry),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent relative", children: [
            /* @__PURE__ */ jsx(
              CachedImage,
              {
                src: entry.episode.image || entry.episode.feedImage,
                alt: entry.episode.title,
                className: `w-full h-full object-cover ${entry.completed ? "opacity-50" : ""}`
              }
            ),
            entry.completed && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-background/40", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-primary" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx(
              MarqueeText,
              {
                text: entry.episode.title,
                active: isCurrentPlaying,
                className: `text-sm font-semibold ${entry.completed ? "text-muted-foreground" : "text-foreground"}`
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground truncate", children: entry.episode.feedTitle }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "•" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatTimeAgo(entry.lastPlayedAt) })
            ] }),
            !entry.completed && entry.progress > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1.5 h-1 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full rounded-full bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)]",
                style: { width: `${Math.min(entry.progress * 100, 100)}%` }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
            !entry.completed && entry.progress > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-primary font-semibold", children: [
              Math.round(entry.progress * 100),
              "%"
            ] }),
            /* @__PURE__ */ jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center", isCurrentPlaying ? "bg-primary" : "bg-accent"), children: isCurrentBuffering ? /* @__PURE__ */ jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin text-foreground" }) : isCurrentPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3.5 h-3.5 text-primary-foreground" }) : /* @__PURE__ */ jsx(Play, { className: "w-3.5 h-3.5 ml-0.5 text-foreground" }) })
          ] })
        ]
      }
    ),
    onRemove && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          onRemove(entry.episode.id);
        },
        className: "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100",
        "aria-label": t("history.clear"),
        children: /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5" })
      }
    )
  ] });
}
function LibraryPage() {
  const { t } = useTranslation();
  const { subscriptions, hasNewEpisodes } = useFavoritesContext();
  const { play, currentEpisode, isPlaying, isBuffering, togglePlay } = usePlayer();
  const { downloaded, removeDownload, isEpisodeDownloaded, downloading, startDownload } = useDownloads();
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const scrollContainerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [showAllSubs, setShowAllSubs] = useState(false);
  const [showAllInProgress, setShowAllInProgress] = useState(false);
  const [showAllNewEpisodes, setShowAllNewEpisodes] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllDownloads, setShowAllDownloads] = useState(false);
  const [newEpisodes, setNewEpisodes] = useState(() => NewEpisodesService.getNewEpisodesFromCache());
  const history = getListenHistory();
  const inProgress = history.filter((h) => !h.completed && h.progress > 0);
  const completed = history;
  useEffect(() => {
    if (subscriptions.length === 0) return;
    let cancelled = false;
    NewEpisodesService.syncNewEpisodes(subscriptions).then((eps) => {
      if (!cancelled) setNewEpisodes(eps);
    });
    return () => {
      cancelled = true;
    };
  }, [subscriptions]);
  useEffect(() => {
    const urls = subscriptions.map((p) => p.image).filter(Boolean);
    if (urls.length) preCacheImages(urls, 3);
  }, [subscriptions]);
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);
  const handlePlayFromHistory = useCallback(
    (entry) => {
      play(entry.episode);
    },
    [play]
  );
  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistoryVersion((v) => v + 1);
  }, []);
  const handleRemoveHistoryEntry = useCallback((episodeId) => {
    removeFromHistory(episodeId);
    setHistoryVersion((v) => v + 1);
  }, []);
  if (selectedPodcast) {
    return /* @__PURE__ */ jsx(PodcastDetailPage, { podcast: selectedPodcast, onBack: () => setSelectedPodcast(null) });
  }
  const visibleSubs = showAllSubs ? subscriptions : subscriptions.slice(0, INITIAL_VISIBLE);
  const visibleInProgress = showAllInProgress ? inProgress : inProgress.slice(0, INITIAL_VISIBLE);
  const visibleNewEpisodes = showAllNewEpisodes ? newEpisodes : newEpisodes.slice(0, INITIAL_VISIBLE);
  const visibleHistory = showAllHistory ? completed : completed.slice(0, INITIAL_VISIBLE);
  const visibleDownloads = showAllDownloads ? downloaded : downloaded.slice(0, INITIAL_VISIBLE);
  return /* @__PURE__ */ jsxs("div", { ref: scrollContainerRef, onScroll: handleScroll, className: "flex-1 overflow-y-auto px-4 pb-32", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-heading font-bold mt-6 mb-4 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: t("favorites.title") }),
    /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Bookmark, { className: "w-4 h-4 text-[hsl(280,80%,60%)]" }),
        t("podcast.subscribed"),
        subscriptions.length > 0 && /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none", children: subscriptions.length })
      ] }),
      subscriptions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [
        /* @__PURE__ */ jsx(Bookmark, { className: "w-10 h-10 text-muted-foreground/30 mb-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("favorites.emptyDesc") })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-1", children: visibleSubs.map((p) => /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(PodcastCard, { podcast: p, compact: true, onClick: setSelectedPodcast }),
          hasNewEpisodes(p) && /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" })
        ] }, p.id)) }),
        subscriptions.length > INITIAL_VISIBLE && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowAllSubs((v) => !v),
            className: "mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium text-primary hover:bg-accent/50 transition-colors",
            children: [
              showAllSubs ? t("library.showLess") : t("library.showMore"),
              /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-4 h-4 transition-transform", showAllSubs && "rotate-180") })
            ]
          }
        )
      ] })
    ] }),
    downloaded.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Download, { className: "w-4 h-4 text-[hsl(220,90%,60%)]" }),
        t("download.downloads"),
        /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(220,90%,60%)] text-white leading-none", children: downloaded.length })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1", children: visibleDownloads.map((dl) => {
        const isCurrent = (currentEpisode == null ? void 0 : currentEpisode.id) === dl.episode.id;
        const isThisPlaying = isCurrent && isPlaying;
        const isThisBuffering = isCurrent && isBuffering;
        return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors group", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0 cursor-pointer", onClick: () => isCurrent ? togglePlay() : play(dl.episode), children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent", children: /* @__PURE__ */ jsx(
              CachedImage,
              {
                src: dl.episode.image || dl.episode.feedImage,
                alt: dl.episode.title,
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx(MarqueeText, { text: dl.episode.title, active: isThisPlaying, className: "text-sm font-semibold text-foreground" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground truncate block", children: dl.episode.feedTitle })
            ] }),
            /* @__PURE__ */ jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", isThisPlaying ? "bg-primary" : "bg-accent"), children: isThisBuffering ? /* @__PURE__ */ jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin text-foreground" }) : isThisPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3.5 h-3.5 text-primary-foreground" }) : /* @__PURE__ */ jsx(Play, { className: "w-3.5 h-3.5 ml-0.5 text-foreground" }) })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => removeDownload(dl.episode.id),
              className: "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors sm:opacity-0 sm:group-hover:opacity-100",
              "aria-label": t("history.clear"),
              children: /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5" })
            }
          )
        ] }, dl.episode.id);
      }) }),
      downloaded.length > INITIAL_VISIBLE && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowAllDownloads((v) => !v),
          className: "mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium text-primary hover:bg-accent/50 transition-colors",
          children: [
            showAllDownloads ? t("library.showLess") : t("library.showMore"),
            /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-4 h-4 transition-transform", showAllDownloads && "rotate-180") })
          ]
        }
      )
    ] }),
    inProgress.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 text-[hsl(220,90%,60%)]" }),
        t("history.inProgress"),
        /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(220,90%,60%)] text-white leading-none", children: inProgress.length })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1", children: visibleInProgress.map((entry) => /* @__PURE__ */ jsx(
        HistoryRow,
        {
          entry,
          onPlay: handlePlayFromHistory,
          isCurrent: (currentEpisode == null ? void 0 : currentEpisode.id) === entry.episode.id,
          isCurrentPlaying: (currentEpisode == null ? void 0 : currentEpisode.id) === entry.episode.id && isPlaying,
          isCurrentBuffering: (currentEpisode == null ? void 0 : currentEpisode.id) === entry.episode.id && isBuffering,
          onTogglePlay: togglePlay
        },
        entry.episode.id
      )) }),
      inProgress.length > INITIAL_VISIBLE && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowAllInProgress((v) => !v),
          className: "mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium text-primary hover:bg-accent/50 transition-colors",
          children: [
            showAllInProgress ? t("library.showLess") : t("library.showMore"),
            /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-4 h-4 transition-transform", showAllInProgress && "rotate-180") })
          ]
        }
      )
    ] }),
    newEpisodes.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-[hsl(280,80%,60%)]" }),
        t("home.latestReleases"),
        /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none", children: newEpisodes.length })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-1", children: visibleNewEpisodes.map((ep) => {
        const isCurrent = (currentEpisode == null ? void 0 : currentEpisode.id) === ep.id;
        const isThisPlaying = isCurrent && isPlaying;
        const isThisBuffering = isCurrent && isBuffering;
        const epDownloaded = isEpisodeDownloaded(ep.id);
        const epDownloading = downloading[ep.id] !== void 0;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer group",
            onClick: () => {
              if (isCurrent) {
                togglePlay();
                return;
              }
              play(ep);
              NewEpisodesService.markAsSeen(ep.id);
              setNewEpisodes((prev) => prev.filter((e) => e.id !== ep.id));
            },
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent", children: /* @__PURE__ */ jsx(
                CachedImage,
                {
                  src: ep.image || ep.feedImage,
                  alt: ep.title,
                  className: "w-full h-full object-cover"
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx(MarqueeText, { text: ep.title, active: isThisPlaying, className: "text-sm font-semibold text-foreground" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground truncate block", children: ep.feedTitle })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      if (!epDownloaded && !epDownloading) startDownload(ep);
                    },
                    className: "w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-colors",
                    disabled: epDownloaded || epDownloading,
                    children: epDownloading ? /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : epDownloaded ? /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5 text-primary" }) : /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      NewEpisodesService.markAsSeen(ep.id);
                      setNewEpisodes((prev) => prev.filter((item) => item.id !== ep.id));
                    },
                    className: "w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-colors sm:opacity-0 sm:group-hover:opacity-100",
                    children: /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5" })
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center", isThisPlaying ? "bg-primary" : "bg-accent"), children: isThisBuffering ? /* @__PURE__ */ jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin text-foreground" }) : isThisPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3.5 h-3.5 text-primary-foreground" }) : /* @__PURE__ */ jsx(Play, { className: "w-3.5 h-3.5 ml-0.5 text-foreground" }) })
              ] })
            ]
          },
          ep.id
        );
      }) }),
      newEpisodes.length > INITIAL_VISIBLE && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setShowAllNewEpisodes((v) => !v),
          className: "mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium text-primary hover:bg-accent/50 transition-colors",
          children: [
            showAllNewEpisodes ? t("library.showLess") : t("library.showMore"),
            /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-4 h-4 transition-transform", showAllNewEpisodes && "rotate-180") })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-1 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-[hsl(280,80%,60%)]" }),
        t("history.title"),
        history.length > 0 && /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none", children: history.length })
      ] }),
      history.length > 0 && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleClearHistory,
          className: "flex items-center gap-1 mb-3 px-2 py-1 rounded-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Trash2, { className: "w-3 h-3" }),
            t("history.clear")
          ]
        }
      ),
      history.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: t("history.empty") }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-1", children: visibleHistory.map((entry) => /* @__PURE__ */ jsx(
          HistoryRow,
          {
            entry,
            onPlay: handlePlayFromHistory,
            onRemove: handleRemoveHistoryEntry,
            isCurrent: (currentEpisode == null ? void 0 : currentEpisode.id) === entry.episode.id,
            isCurrentPlaying: (currentEpisode == null ? void 0 : currentEpisode.id) === entry.episode.id && isPlaying,
            isCurrentBuffering: (currentEpisode == null ? void 0 : currentEpisode.id) === entry.episode.id && isBuffering,
            onTogglePlay: togglePlay
          },
          entry.episode.id
        )) }),
        completed.length > INITIAL_VISIBLE && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowAllHistory((v) => !v),
            className: "mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium text-primary hover:bg-accent/50 transition-colors",
            children: [
              showAllHistory ? t("library.showLess") : t("library.showMore"),
              /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-4 h-4 transition-transform", showAllHistory && "rotate-180") })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Scissors, { className: "w-4 h-4 text-[hsl(280,80%,60%)]" }),
        "Mes Clips",
        /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none", children: "Premium" })
      ] }),
      /* @__PURE__ */ jsx(ClipsPage, {})
    ] }),
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
  LibraryPage
};
