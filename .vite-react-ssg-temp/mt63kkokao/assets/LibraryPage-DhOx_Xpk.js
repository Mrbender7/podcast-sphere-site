import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { u as useTranslation, b as useFavoritesContext, D as Dialog, d as DialogContent, e as DialogHeader, f as DialogTitle, g as DialogDescription, h as fetchPrivateFeed, i as usePlayer, j as useDownloads, N as NewEpisodesService, k as getListenHistory, l as isPrivateFeedId, r as refreshAllPrivateFeeds, p as preCacheImages, m as clearHistory, n as removeFromHistory, P as PodcastDetailPage, a as PodcastCard, c as cn, C as CachedImage, o as MarqueeText } from "../main.mjs";
import { Lock, ShieldCheck, Loader2, Plus, Bookmark, ChevronDown, Download, Pause, Play, X, Sparkles, Clock, Trash2, ArrowUp, CheckCircle2 } from "lucide-react";
import { I as Input } from "./input-6XZgwDxx.js";
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
import "@radix-ui/react-slider";
import "@radix-ui/react-popover";
import "@radix-ui/react-select";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-slot";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "react-router-dom";
function AddPrivateFeedDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  const { toggleSubscription, isSubscribed } = useFavoritesContext();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const isWeb = !Capacitor.isNativePlatform();
  const handleAdd = async () => {
    var _a;
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      const parsed = new URL(trimmed);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        toast.error(t("privateFeed.invalidUrl"));
        return;
      }
    } catch {
      toast.error(t("privateFeed.invalidUrl"));
      return;
    }
    setLoading(true);
    try {
      const parsed = await fetchPrivateFeed(trimmed);
      if (!isSubscribed(parsed.podcast.id)) {
        toggleSubscription(parsed.podcast);
      }
      toast.success(`${t("privateFeed.added")} — ${parsed.podcast.title}`);
      setUrl("");
      onOpenChange(false);
    } catch (err) {
      const isCorsLikely = isWeb && (((_a = err == null ? void 0 : err.message) == null ? void 0 : _a.includes("Failed to fetch")) || (err == null ? void 0 : err.name) === "TypeError");
      if (isCorsLikely) {
        toast.error(t("privateFeed.webBlocked"), { duration: 6e3 });
      } else {
        toast.error(t("privateFeed.fetchError"));
      }
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md rounded-2xl bg-background border-border", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2 text-lg font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: [
        /* @__PURE__ */ jsx(Lock, { className: "w-5 h-5 text-[hsl(280,80%,60%)]" }),
        t("privateFeed.title")
      ] }),
      /* @__PURE__ */ jsx(DialogDescription, { className: "text-xs text-muted-foreground", children: t("privateFeed.subtitle") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 mt-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 p-3 rounded-xl bg-accent/50 border border-border", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { className: "w-4 h-4 text-primary shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: t("privateFeed.privacyNote") })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "private-feed-url", className: "text-xs font-semibold text-foreground mb-1.5 block", children: t("privateFeed.urlLabel") }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "private-feed-url",
            type: "url",
            inputMode: "url",
            autoComplete: "off",
            spellCheck: false,
            value: url,
            onChange: (e) => setUrl(e.target.value),
            placeholder: "https://...",
            disabled: loading,
            onKeyDown: (e) => {
              if (e.key === "Enter" && !loading) handleAdd();
            }
          }
        )
      ] }),
      isWeb && /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-destructive leading-relaxed", children: [
        "⚠️ ",
        t("privateFeed.webWarning")
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleAdd,
          disabled: loading || !url.trim(),
          className: "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50",
          children: [
            loading ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            loading ? t("privateFeed.adding") : t("privateFeed.add")
          ]
        }
      )
    ] })
  ] }) });
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
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5 min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsx(MarqueeText, { text: entry.episode.feedTitle || "", className: "text-xs text-muted-foreground" }) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: "•" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground shrink-0", children: formatTimeAgo(entry.lastPlayedAt) })
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
  const [addPrivateOpen, setAddPrivateOpen] = useState(false);
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
    if (!Capacitor.isNativePlatform()) return;
    const privateIds = subscriptions.filter((p) => isPrivateFeedId(p.id)).map((p) => p.id);
    if (privateIds.length === 0) return;
    refreshAllPrivateFeeds(privateIds).catch(() => {
    });
  }, []);
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
    /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-heading font-bold mt-6 mb-4 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Bookmark, { className: "w-6 h-6 text-[hsl(280,80%,60%)]" }),
      t("nav.library")
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Bookmark, { className: "w-4 h-4 text-[hsl(280,80%,60%)]" }),
          t("podcast.subscribed"),
          subscriptions.length > 0 && /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none", children: subscriptions.length })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAddPrivateOpen(true),
            className: "hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent text-foreground hover:bg-primary/20 transition-colors",
            "aria-label": t("privateFeed.add"),
            title: t("privateFeed.title"),
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
              t("privateFeed.addShort")
            ]
          }
        )
      ] }),
      subscriptions.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-center", children: [
        /* @__PURE__ */ jsx(Bookmark, { className: "w-10 h-10 text-muted-foreground/30 mb-2" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("favorites.emptyDesc") })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-1", children: visibleSubs.map((p) => /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(PodcastCard, { podcast: p, compact: true, onClick: setSelectedPodcast }),
          hasNewEpisodes(p) && /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" }),
          isPrivateFeedId(p.id) && /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute top-2 right-2 w-5 h-5 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow",
              title: t("privateFeed.privateBadge"),
              children: /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" })
            }
          )
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
              /* @__PURE__ */ jsx(MarqueeText, { text: dl.episode.feedTitle || "", className: "text-xs text-muted-foreground" })
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
                /* @__PURE__ */ jsx(MarqueeText, { text: ep.feedTitle || "", className: "text-xs text-muted-foreground" })
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
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setAddPrivateOpen(true),
        className: "md:hidden fixed bottom-32 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] text-primary-foreground shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform",
        "aria-label": t("privateFeed.add"),
        children: /* @__PURE__ */ jsx(Plus, { className: "w-6 h-6" })
      }
    ),
    /* @__PURE__ */ jsx(AddPrivateFeedDialog, { open: addPrivateOpen, onOpenChange: setAddPrivateOpen })
  ] });
}
export {
  LibraryPage
};
