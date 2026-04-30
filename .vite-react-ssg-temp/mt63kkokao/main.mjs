var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ViteReactSSG } from "vite-react-ssg";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { HelmetProvider, Helmet } from "react-helmet-async";
import * as React from "react";
import React__default, { useState, useEffect, useCallback, createContext, useContext, useRef, memo, useMemo, lazy, Suspense } from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X, AlertTriangle, RefreshCw, CheckCircle2, CheckCircle, Loader2, Download, Pause, Play, ArrowLeft, Bookmark, Globe, ArrowDownUp, ArrowUp, ChevronDown, Home, Search, Settings, Cast, Share2, RotateCcw, RotateCw, Volume2, ChevronUp, Check, Mail, ChevronRight, ChevronLeft, Headphones, SkipBack, SkipForward, VolumeX, ShieldCheck, ExternalLink, Sparkles, TrendingUp, Radio, Heart, Music, Moon } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "next-themes";
import { Toaster as Toaster$2, toast as toast$1 } from "sonner";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Capacitor, CapacitorHttp, registerPlugin } from "@capacitor/core";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Slot } from "@radix-ui/react-slot";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { useLocation } from "react-router-dom";
const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 6e3;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsx(ToastPrimitives.Root, { ref, className: cn(toastVariants({ variant }), className), ...props });
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Close,
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Title, { ref, className: cn("text-sm font-semibold", className), ...props }));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Description, { ref, className: cn("text-sm opacity-90", className), ...props }));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
function Toaster$1() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
    Toaster$2,
    {
      theme,
      position: "top-center",
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
class ErrorBoundary extends React__default.Component {
  constructor(props) {
    super(props);
    __publicField(this, "handleReload", () => {
      window.location.reload();
    });
    __publicField(this, "handleClearCacheAndReload", async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
      }
      try {
        const dbs = await window.indexedDB.databases();
        for (const db of dbs) {
          if (db.name) window.indexedDB.deleteDatabase(db.name);
        }
      } catch {
      }
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {
      }
      window.location.reload();
    });
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen bg-background px-6 text-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-8 h-8 text-destructive" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-heading font-bold text-foreground text-center", children: "Oups, quelque chose s'est mal passé" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-xs", children: "Une erreur inattendue est survenue. Essayez de recharger l'application." }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-3 mt-2", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: this.handleReload,
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
                "Recharger"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: this.handleClearCacheAndReload,
              className: "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors",
              children: "Vider le cache & recharger"
            }
          )
        ] })
      ] });
    }
    return this.props.children;
  }
}
const BASE_URL = "https://api.podcastindex.org/api/1.0";
function _d(s) {
  return atob(s);
}
const _k = "RUdDSkRGTjRSRkJQUllMUE1QTlQ=";
const _s = "OSNiTWVUeTl2cWREUWY1aGhVTjc0VnJmVmdkY0toU1JHXmprU3Zycw==";
const API_KEY = _d(_k);
const API_SECRET = _d(_s);
async function generateAuthHeaders() {
  const ts = Math.floor(Date.now() / 1e3);
  const data = API_KEY + API_SECRET + String(ts);
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-1", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return {
    "X-Auth-Date": String(ts),
    "X-Auth-Key": API_KEY,
    Authorization: hashHex,
    "User-Agent": "PodcastSphere/1.0"
  };
}
async function apiFetch(path, params) {
  const headers = await generateAuthHeaders();
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const url = `${BASE_URL}${path}${query}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Podcast Index API error: ${res.status}`);
  return res.json();
}
function normalizePodcast(raw) {
  const categories = raw.categories ? Object.values(raw.categories).filter(Boolean) : [];
  return {
    id: raw.id || raw.feedId || 0,
    title: raw.title || "Unknown",
    author: raw.author || raw.ownerName || "",
    image: raw.image || raw.artwork || "",
    description: raw.description || "",
    url: raw.url || raw.originalUrl || "",
    categories,
    lastEpisodeDate: raw.newestItemPublishTime || raw.newestItemPubdate || raw.lastUpdateTime || 0,
    language: (raw.language || "").split("-")[0].toLowerCase(),
    link: raw.link || ""
  };
}
function normalizeEpisode(raw, feedMeta) {
  return {
    id: raw.id || 0,
    title: raw.title || "Untitled",
    description: raw.description || "",
    datePublished: raw.datePublished || 0,
    duration: raw.duration || 0,
    enclosureUrl: raw.enclosureUrl || "",
    enclosureType: raw.enclosureType || "audio/mpeg",
    image: raw.image || raw.feedImage || (feedMeta == null ? void 0 : feedMeta.image) || "",
    feedId: raw.feedId || 0,
    feedTitle: raw.feedTitle || (feedMeta == null ? void 0 : feedMeta.title) || "",
    feedAuthor: raw.feedAuthor || (feedMeta == null ? void 0 : feedMeta.author) || "",
    feedImage: raw.feedImage || (feedMeta == null ? void 0 : feedMeta.image) || ""
  };
}
async function searchPodcasts(term, max = 20) {
  const data = await apiFetch("/search/byterm", { q: term, max: String(max) });
  return (data.feeds || []).map(normalizePodcast);
}
async function getTrendingPodcasts(max = 20, lang) {
  const params = { max: String(max) };
  if (lang) {
    params.lang = lang;
  }
  const data = await apiFetch("/podcasts/trending", params);
  return (data.feeds || []).map(normalizePodcast);
}
async function getPodcastById(feedId) {
  const data = await apiFetch("/podcasts/byfeedid", { id: String(feedId) });
  if (data.feed) return normalizePodcast(data.feed);
  return null;
}
async function getEpisodesByFeedId(feedId, max = 1e3, before) {
  const params = { id: String(feedId), max: String(max) };
  if (before) params.before = String(before);
  const data = await apiFetch("/episodes/byfeedid", params);
  const feed = data.feed || {};
  const items = data.items || [];
  const episodes = items.map(
    (e) => normalizeEpisode(e, { title: feed.title, author: feed.author, image: feed.image || feed.artwork })
  );
  return {
    episodes,
    hasMore: items.length >= max
  };
}
const PRIVATE_EPISODES_KEY = "podcastsphere_private_episodes";
function hashUrlToId(url) {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (h << 5) - h + url.charCodeAt(i);
    h |= 0;
  }
  return h < 0 ? h : -Math.abs(h);
}
function getText(node, tag) {
  var _a;
  if (!node) return "";
  const el = node.getElementsByTagName(tag)[0];
  return ((_a = el == null ? void 0 : el.textContent) == null ? void 0 : _a.trim()) || "";
}
function getAttr(node, tag, attr) {
  if (!node) return "";
  const el = node.getElementsByTagName(tag)[0];
  return (el == null ? void 0 : el.getAttribute(attr)) || "";
}
function parseDuration(raw) {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  const parts = trimmed.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}
function parseDate(raw) {
  if (!raw) return 0;
  const ts = Date.parse(raw);
  return isNaN(ts) ? 0 : Math.floor(ts / 1e3);
}
async function fetchFeedXml(url) {
  if (Capacitor.isNativePlatform()) {
    const res2 = await CapacitorHttp.get({
      url,
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "PodcastSphere/1.0"
      },
      responseType: "text"
    });
    if (res2.status >= 400) throw new Error(`HTTP ${res2.status}`);
    return typeof res2.data === "string" ? res2.data : String(res2.data ?? "");
  }
  const res = await fetch(url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}
function parseRssXml(xml, feedUrl) {
  var _a;
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) throw new Error("Invalid RSS XML");
  const channel = doc.getElementsByTagName("channel")[0];
  if (!channel) throw new Error("No <channel> found in feed");
  const id = hashUrlToId(feedUrl);
  const title = getText(channel, "title") || "Untitled";
  let image = "";
  const imageEl = channel.getElementsByTagName("image")[0];
  if (imageEl) image = getText(imageEl, "url");
  if (!image) {
    const itunesImage = Array.from(channel.children).find(
      (c) => c.localName === "image" && (c.namespaceURI || "").includes("itunes")
    );
    if (itunesImage) image = itunesImage.getAttribute("href") || "";
  }
  if (!image) {
    const all = channel.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "image" && all[i].getAttribute("href")) {
        image = all[i].getAttribute("href") || "";
        break;
      }
    }
  }
  let author = "";
  const allChildren = channel.getElementsByTagName("*");
  for (let i = 0; i < allChildren.length; i++) {
    if (allChildren[i].localName === "author" && allChildren[i].parentNode === channel) {
      author = ((_a = allChildren[i].textContent) == null ? void 0 : _a.trim()) || "";
      break;
    }
  }
  if (!author) author = getText(channel, "managingEditor");
  const description = getText(channel, "description") || getText(channel, "summary");
  const link = getText(channel, "link");
  const language = (getText(channel, "language") || "").split("-")[0].toLowerCase();
  const podcast = {
    id,
    title,
    author,
    image,
    description,
    url: feedUrl,
    feedUrl,
    categories: [],
    lastEpisodeDate: 0,
    language,
    link,
    isPrivate: true
  };
  const items = Array.from(channel.getElementsByTagName("item"));
  const episodes = items.map((item, idx) => {
    var _a2;
    const epTitle = getText(item, "title") || "Untitled";
    const epDescription = getText(item, "description") || getText(item, "summary");
    const pubDate = parseDate(getText(item, "pubDate"));
    const enclosureUrl = getAttr(item, "enclosure", "url");
    const enclosureType = getAttr(item, "enclosure", "type") || "audio/mpeg";
    let durationRaw = "";
    const itemAll = item.getElementsByTagName("*");
    for (let i = 0; i < itemAll.length; i++) {
      if (itemAll[i].localName === "duration") {
        durationRaw = ((_a2 = itemAll[i].textContent) == null ? void 0 : _a2.trim()) || "";
        break;
      }
    }
    const duration = parseDuration(durationRaw);
    let epImage = image;
    for (let i = 0; i < itemAll.length; i++) {
      if (itemAll[i].localName === "image" && itemAll[i].getAttribute("href")) {
        epImage = itemAll[i].getAttribute("href") || epImage;
        break;
      }
    }
    const guid = getText(item, "guid") || enclosureUrl || `${idx}`;
    let epId = id * 1e4 - idx;
    let h = 0;
    for (let i = 0; i < guid.length; i++) {
      h = (h << 5) - h + guid.charCodeAt(i);
      h |= 0;
    }
    epId = -Math.abs(h) - 1;
    return {
      id: epId,
      title: epTitle,
      description: epDescription,
      datePublished: pubDate,
      duration,
      enclosureUrl,
      enclosureType,
      image: epImage,
      feedId: id,
      feedTitle: title,
      feedAuthor: author,
      feedImage: image
    };
  });
  if (episodes.length > 0) {
    podcast.lastEpisodeDate = Math.max(...episodes.map((e) => e.datePublished));
  }
  return { podcast, episodes };
}
async function fetchPrivateFeed(url) {
  const xml = await fetchFeedXml(url);
  const parsed = parseRssXml(xml, url);
  saveFeedCache(parsed);
  return parsed;
}
function loadFeedsMap() {
  try {
    const raw = localStorage.getItem(PRIVATE_EPISODES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveFeedsMap(map) {
  try {
    localStorage.setItem(PRIVATE_EPISODES_KEY, JSON.stringify(map));
  } catch {
  }
}
function saveFeedCache(parsed) {
  const map = loadFeedsMap();
  map[String(parsed.podcast.id)] = {
    podcast: parsed.podcast,
    episodes: parsed.episodes,
    lastFetchedAt: Date.now()
  };
  saveFeedsMap(map);
}
function getCachedPrivateFeed(podcastId) {
  const map = loadFeedsMap();
  return map[String(podcastId)] || null;
}
function getCachedPrivateEpisodes(podcastId) {
  var _a;
  return ((_a = getCachedPrivateFeed(podcastId)) == null ? void 0 : _a.episodes) || [];
}
async function refreshAllPrivateFeeds(podcastIds) {
  const map = loadFeedsMap();
  let refreshed = 0;
  await Promise.allSettled(
    podcastIds.map(async (pid) => {
      const entry = map[String(pid)];
      if (!(entry == null ? void 0 : entry.podcast.feedUrl)) return;
      try {
        await fetchPrivateFeed(entry.podcast.feedUrl);
        refreshed++;
      } catch {
      }
    })
  );
  return refreshed;
}
function isPrivateFeedId(id) {
  return id < 0;
}
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("animate-pulse rounded-md bg-muted", className), ...props });
}
function PodcastCardSkeleton() {
  return /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 w-[105px]", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "aspect-square rounded-xl mb-2" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-4/5 mb-1" }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-2.5 w-3/5" })
  ] });
}
function PodcastRowSkeleton() {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "w-14 h-14 rounded-lg flex-shrink-0" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3.5 w-3/4" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-2.5 w-1/2" })
    ] })
  ] });
}
function EpisodeRowSkeleton() {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 p-3", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "w-12 h-12 rounded-lg flex-shrink-0" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-2", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3.5 w-4/5" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-2.5 w-full" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-2.5 w-2/5" })
    ] }),
    /* @__PURE__ */ jsx(Skeleton, { className: "w-10 h-10 rounded-full flex-shrink-0" })
  ] });
}
function TrendingRowSkeleton() {
  return /* @__PURE__ */ jsx("div", { className: "flex gap-3 overflow-hidden", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(PodcastCardSkeleton, {}, i)) });
}
function SearchResultsSkeleton() {
  return /* @__PURE__ */ jsx("div", { className: "space-y-1", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(PodcastRowSkeleton, {}, i)) });
}
const SUBSCRIPTIONS_KEY = "podcastsphere_subscriptions";
const RECENT_KEY = "podcastsphere_recent_episodes";
const LAST_SEEN_KEY = "podcastsphere_last_seen";
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState(
    () => loadFromStorage(SUBSCRIPTIONS_KEY, []).sort((a, b) => a.title.localeCompare(b.title))
  );
  const [lastSeen, setLastSeen] = useState(
    () => loadFromStorage(LAST_SEEN_KEY, {})
  );
  useEffect(() => {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);
  useEffect(() => {
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(lastSeen));
  }, [lastSeen]);
  const toggleSubscription = useCallback((podcast) => {
    setSubscriptions((prev) => {
      const exists = prev.some((p) => p.id === podcast.id);
      const next = exists ? prev.filter((p) => p.id !== podcast.id) : [...prev, podcast];
      return next.sort((a, b) => a.title.localeCompare(b.title));
    });
  }, []);
  const importSubscriptions = useCallback((podcasts) => {
    let addedCount = 0;
    setSubscriptions((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newPodcasts = podcasts.filter((p) => {
        if (!existingIds.has(p.id)) {
          addedCount++;
          return true;
        }
        return false;
      });
      return [...prev, ...newPodcasts].sort((a, b) => a.title.localeCompare(b.title));
    });
    return addedCount;
  }, []);
  const isSubscribed = useCallback((id) => subscriptions.some((p) => p.id === id), [subscriptions]);
  const markAsSeen = useCallback((podcastId, episodeDate) => {
    setLastSeen((prev) => ({ ...prev, [podcastId]: episodeDate }));
  }, []);
  const hasNewEpisodes = useCallback((podcast) => {
    const seen = lastSeen[podcast.id];
    if (!seen) return podcast.lastEpisodeDate > 0;
    return podcast.lastEpisodeDate > seen;
  }, [lastSeen]);
  return { subscriptions, toggleSubscription, isSubscribed, markAsSeen, hasNewEpisodes, importSubscriptions };
}
function useRecentEpisodes() {
  const [recent, setRecent] = useState(() => loadFromStorage(RECENT_KEY, []));
  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }, [recent]);
  const addRecent = useCallback((episode) => {
    setRecent((prev) => {
      const filtered = prev.filter((e) => e.id !== episode.id);
      return [episode, ...filtered].slice(0, 20);
    });
  }, []);
  return { recent, addRecent };
}
const noop = async () => {
};
const noopListener = async (_event, _handler) => ({ remove: noop });
const PodcastAutoPlugin = {
  instance: new Proxy({}, { get: () => noop }),
  addListener: noopListener
};
const syncEpisodeListToNative = (_feedId, _episodes) => {
};
const FavoritesContext = createContext(null);
function FavoritesProvider({ children }) {
  const { subscriptions, toggleSubscription, isSubscribed, markAsSeen, hasNewEpisodes, importSubscriptions } = useSubscriptions();
  const { recent, addRecent } = useRecentEpisodes();
  useEffect(() => {
    subscriptions.map((p) => ({
      id: p.id,
      title: p.title,
      author: p.author,
      image: p.image
    }));
  }, [subscriptions]);
  return /* @__PURE__ */ jsx(FavoritesContext.Provider, { value: { subscriptions, toggleSubscription, isSubscribed, markAsSeen, hasNewEpisodes, importSubscriptions, recent, addRecent }, children });
}
function useFavoritesContext() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavoritesContext must be used within FavoritesProvider");
  return ctx;
}
const LANGUAGE_OPTIONS = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
  { value: "it", label: "Italiano" },
  { value: "nl", label: "Nederlands" },
  { value: "pt", label: "Português" },
  { value: "pl", label: "Polski" },
  { value: "zh", label: "中文" },
  { value: "tr", label: "Türkçe" },
  { value: "ru", label: "Русский" },
  { value: "id", label: "Indonesia" }
];
const translations = {
  fr: {
    "nav.home": "Accueil",
    "nav.search": "Recherche",
    "nav.library": "Bibliothèque",
    "nav.settings": "Réglages",
    "home.trending": "Tendances",
    "home.yourSubscriptions": "Vos abonnements",
    "home.noSubscriptions": "Abonnez-vous à des podcasts pour les retrouver ici",
    "home.exploreByCategory": "Explorer par catégorie",
    "home.resumeListening": "Reprendre la lecture",
    "home.latestReleases": "Dernières sorties",
    "home.pullToRefresh": "Tirer pour actualiser",
    "settings.podcastIndexTitle": "Propulsé par Podcast Index",
    "settings.podcastIndexDesc": "Les données de podcasts sont fournies par Podcast Index, un index de podcasts ouvert et gratuit. Merci à eux pour leur travail incroyable !",
    "search.title": "Recherche",
    "search.placeholder": "Rechercher un podcast...",
    "search.noResults": "Aucun résultat trouvé",
    "search.networkError": "Erreur réseau. Impossible de contacter le serveur.",
    "search.useFilters": "Recherchez un podcast par nom ou sujet",
    "search.resultsCount": "podcasts trouvés",
    "search.languages": "Langues",
    "search.categories": "Catégories",
    "search.recentSearches": "Recherches récentes",
    "search.relevance": "Pertinence",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Bibliothèque",
    "favorites.empty": "Aucun abonnement",
    "favorites.emptyDesc": "Abonnez-vous à un podcast pour le retrouver ici",
    "favorites.manage": "Gérer les abonnements",
    "favorites.export": "Exporter en CSV",
    "favorites.import": "Importer un CSV",
    "favorites.exported": "Abonnements exportés !",
    "favorites.imported": "abonnement(s) importé(s)",
    "favorites.noFavoritesToExport": "Aucun abonnement à exporter",
    "favorites.importError": "Erreur lors de l'importation",
    "history.title": "Historique d'écoute",
    "history.empty": "Aucun épisode écouté",
    "history.resume": "Reprendre",
    "history.completed": "Terminé",
    "history.clear": "Effacer l'historique",
    "history.inProgress": "En cours",
    "library.showMore": "Voir la suite",
    "library.showLess": "Réduire",
    "podcast.subscribe": "S'abonner",
    "podcast.subscribed": "Abonné",
    "podcast.episodes": "Épisodes",
    "podcast.noEpisodes": "Aucun épisode disponible",
    "podcast.newEpisodes": "Nouveaux épisodes",
    "podcast.newest": "Récents",
    "podcast.oldest": "Anciens",
    "podcast.loadMore": "Charger plus d'épisodes",
    "podcast.website": "Site web",
    "privateFeed.title": "Ajouter un flux RSS privé",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "URL du flux RSS privé",
    "privateFeed.add": "Ajouter le flux",
    "privateFeed.addShort": "Ajouter un flux privé",
    "privateFeed.adding": "Ajout en cours...",
    "privateFeed.added": "Flux privé ajouté",
    "privateFeed.invalidUrl": "URL invalide",
    "privateFeed.fetchError": "Impossible de récupérer ce flux. Vérifiez l'URL.",
    "privateFeed.webBlocked": "Pour des raisons de sécurité et de confidentialité, l'ajout de flux privés n'est possible que depuis l'application mobile Podcast Sphere.",
    "privateFeed.webWarning": "Sur le web, l'ajout de flux privés est bloqué par votre navigateur. Utilisez l'application mobile pour un support complet.",
    "privateFeed.privacyNote": "Votre token reste strictement sur votre appareil. Podcast Sphere n'envoie jamais votre lien privé vers le cloud.",
    "privateFeed.refresh": "Actualiser le flux",
    "privateFeed.refreshed": "Flux actualisé",
    "privateFeed.privateBadge": "Flux privé",
    "guide.premium": "Ajouter un podcast Premium / Privé",
    "guide.premiumContent": "Vous soutenez vos créateurs favoris et disposez d'un flux audio privé ? Podcast Sphere lit directement vos contenus sans rien envoyer sur le cloud. Allez dans vos Abonnements, cliquez sur le bouton [+], et collez votre lien secret.\n\nVoici comment trouver votre lien selon votre plateforme :\n\n• Patreon : allez sur la page du créateur > Onglet 'Mon abonnement' > cliquez sur 'Obtenir le lien RSS audio' et copiez-le.\n\n• Supercast : cliquez sur le lien reçu par e-mail lors de votre inscription, choisissez 'Copier le lien RSS manuel'.\n\n• Substack : sur la page du podcast, cliquez sur 'Listen on', puis sélectionnez 'Copy link' dans la section RSS.\n\n• Memberful : dans votre compte d'abonné, cherchez la section 'Podcasts' et copiez l'URL de votre flux personnel.",
    "player.nowPlaying": "En cours de lecture",
    "player.streamError": "Erreur de lecture",
    "player.streamErrorDesc": "Impossible de lire cet épisode. Essayez-en un autre.",
    "player.error": "Erreur",
    "player.streamUnavailable": "Cet épisode n'a pas d'URL audio.",
    "player.speed": "Vitesse",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "L'expérience podcast ultime",
    "premium.active": "Premium actif",
    "premium.sleepTimer": "Minuterie de sommeil",
    "premium.sleepTimerDesc": "Arrêt automatique de la lecture après un délai configurable",
    "premium.monthly": "Achat unique — 9,99€",
    "premium.cancel": "Restaurer l'achat",
    "premium.disclaimer": "Achat unique, accès à vie. Pas d'abonnement.",
    "premium.comingSoon": "Arrive bientôt",
    "premium.passwordPlaceholder": "Entrez le code d'accès",
    "premium.unlock": "Déverrouiller",
    "premium.lock": "Verrouiller Premium",
    "premium.wrongPassword": "Code incorrect",
    "premium.unlocked": "Premium déverrouillé !",
    "premium.restorePurchases": "Restaurer les achats",
    "premium.restoreSuccess": "Achats restaurés avec succès",
    "premium.restoreNone": "Aucun achat à restaurer",
    "sleepTimer.title": "Minuterie de sommeil",
    "sleepTimer.desc": "Arrête automatiquement la lecture après un délai",
    "sleepTimer.off": "Désactivée",
    "sleepTimer.active": "Actif",
    "sleepTimer.remaining": "Restant",
    "sleepTimer.cancel": "Annuler la minuterie",
    "sleepTimer.stopped": "La lecture a été mise en pause automatiquement.",
    "sleepTimer.custom": "Personnalisé",
    "sleepTimer.customPlaceholder": "Minutes",
    "sleepTimer.customGo": "Go",
    "sleepTimer.15": "15 min",
    "sleepTimer.30": "30 min",
    "sleepTimer.45": "45 min",
    "sleepTimer.60": "1 heure",
    "sleepTimer.90": "1h30",
    "sleepTimer.120": "2 heures",
    "exit.title": "Fermer l'application ?",
    "exit.description": "Appuyez une fois de plus pour quitter.",
    "exit.confirm": "Quitter",
    "common.cancel": "Annuler",
    "settings.title": "Réglages",
    "settings.language": "Langue",
    "settings.languageDesc": "Choisissez la langue de l'interface",
    "settings.dataWarning": "Utilisation des données",
    "settings.dataWarningDesc": "L'écoute de podcasts utilise votre connexion internet et peut consommer des données mobiles.",
    "settings.dataDisclaimer": "Données locales",
    "settings.dataDisclaimerDesc": "Vos abonnements et préférences sont stockés localement sur votre appareil.",
    "settings.privacyPolicy": "Politique de confidentialité",
    "settings.copyright": "Podcast Sphere est un produit de la famille RadioSphere.be",
    "settings.reopenWelcome": "Revoir la page de bienvenue",
    "settings.resetApp": "Réinitialiser l'application",
    "settings.resetAppDesc": "Supprimer tous les abonnements et préférences",
    "settings.resetConfirm": "Êtes-vous sûr ? Cette action est irréversible.",
    "settings.resetDone": "Application réinitialisée",
    "settings.resetButton": "Tout supprimer",
    "guide.title": "Mode d'emploi",
    "guide.button": "Mode d'emploi",
    "guide.home": "Accueil",
    "guide.homeContent": "L'écran d'accueil affiche les podcasts tendances, vos abonnements et les catégories populaires.",
    "guide.search": "Recherche",
    "guide.searchContent": "Recherchez un podcast par nom. Cliquez sur un résultat pour voir la liste des épisodes.",
    "guide.favorites": "Bibliothèque",
    "guide.favoritesContent": "Vos podcasts abonnés apparaissent ici avec un indicateur de nouveaux épisodes.",
    "guide.settings": "Réglages",
    "guide.settingsContent": "Changez la langue, activez la minuterie de sommeil et gérez vos préférences.",
    "guide.permissions": "Autorisations",
    "guide.permissionsContent": "Les notifications permettent d'afficher les contrôles de lecture sur l'écran verrouillé.",
    "guide.permissionsReRequest": "Redemander les autorisations",
    "guide.permissionsReopenWelcome": "Recharger la page de bienvenue",
    "guide.sleepTimer": "Minuterie de sommeil",
    "guide.sleepTimerContent": "Programmez l'arrêt automatique de la lecture.",
    "guide.snippets": "Clips audio",
    "guide.snippetsContent": "Sauvegardez les 30 dernières secondes d'un épisode en cours de lecture. Renommez, réécoutez ou partagez vos extraits depuis la page Mes Clips.",
    "guide.voiceEnhancer": "Voix Claire",
    "guide.voiceEnhancerContent": "Améliore la clarté vocale en boostant les fréquences de la voix et en compressant la dynamique. Active-le depuis le lecteur plein écran.",
    "premium.snippets": "Clips audio",
    "premium.snippetsDesc": "Sauvegardez des extraits de 30 secondes de vos épisodes préférés",
    "premium.voiceEnhancer": "Voix Claire",
    "premium.voiceEnhancerDesc": "Améliore la clarté vocale pour une meilleure écoute",
    "welcome.subtitle": "Les podcasts du monde entier",
    "welcome.chooseLanguage": "Choisissez la langue",
    "welcome.start": "Commencer",
    "welcome.stations": "Milliers de podcasts",
    "welcome.search": "Recherche avancée",
    "welcome.favExport": "Abonnements",
    "welcome.genres": "Catégories variées",
    "category.Technology": "Technologie",
    "category.Comedy": "Comédie",
    "category.News": "Actualités",
    "category.True Crime": "True Crime",
    "category.Health": "Santé",
    "category.Business": "Business",
    "category.Science": "Science",
    "category.Education": "Éducation",
    "category.Sports": "Sports",
    "category.Music": "Musique",
    "category.Society": "Société",
    "category.History": "Histoire",
    "category.Fiction": "Fiction",
    "category.Horror": "Horreur",
    "category.Video Games": "Jeux Vidéos",
    "category.Arts": "Arts",
    "category.Food": "Cuisine",
    "category.Travel": "Voyage",
    "category.Religion": "Religion",
    "category.Kids & Family": "Enfants & Famille",
    "category.Politics": "Politique",
    "category.Nature": "Nature",
    "category.Film & TV": "Cinéma & TV",
    "category.Leisure": "Loisirs",
    "category.Self-Improvement": "Développement personnel",
    "category.Relationships": "Relations",
    "download.download": "Télécharger",
    "download.downloaded": "Téléchargé",
    "download.downloading": "Téléchargement…",
    "download.delete": "Supprimer le téléchargement",
    "download.deleted": "Téléchargement supprimé",
    "download.success": "Épisode téléchargé",
    "download.error": "Échec du téléchargement",
    "download.downloads": "Téléchargements",
    "download.noDownloads": "Aucun épisode téléchargé",
    "download.destination": "Destination des téléchargements",
    "download.internal": "Stockage interne",
    "download.external": "Stockage externe (SD)",
    "download.destinationDesc": "Choisissez où enregistrer les épisodes téléchargés",
    "auto.drivingWarning": "Attention : Ne naviguez jamais dans les menus en conduisant",
    "auto.drivingWarningSubtitle": "Laissez cette tâche au passager",
    "auto.subscriptions": "Abonnements",
    "auto.inProgress": "En cours de lecture",
    "sidebar.description": "Découvrez et écoutez des milliers de podcasts du monde entier.",
    "sidebar.radioDescription": "Écoutez la radio en direct",
    "footer.createdBy": "Un produit de radiosphere.be",
    "footer.poweredBy": "Propulsé par Podcast Index",
    "player.selectEpisode": "Sélectionnez un épisode pour commencer"
  },
  en: {
    "nav.home": "Home",
    "nav.search": "Search",
    "nav.library": "Library",
    "nav.settings": "Settings",
    "home.trending": "Trending",
    "home.yourSubscriptions": "Your subscriptions",
    "home.noSubscriptions": "Subscribe to podcasts to see them here",
    "home.exploreByCategory": "Explore by category",
    "home.resumeListening": "Resume listening",
    "home.latestReleases": "Latest Releases",
    "home.pullToRefresh": "Pull to refresh",
    "settings.podcastIndexTitle": "Powered by Podcast Index",
    "settings.podcastIndexDesc": "Podcast data is provided by Podcast Index, a free and open podcast index. Thanks to them for their incredible work!",
    "search.title": "Search",
    "search.placeholder": "Search for a podcast...",
    "search.noResults": "No results found",
    "search.networkError": "Network error. Unable to reach the server.",
    "search.useFilters": "Search for a podcast by name or topic",
    "search.resultsCount": "podcasts found",
    "search.languages": "Languages",
    "search.categories": "Categories",
    "search.recentSearches": "Recent searches",
    "search.relevance": "Relevance",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Library",
    "favorites.empty": "No subscriptions",
    "favorites.emptyDesc": "Subscribe to a podcast to see it here",
    "favorites.manage": "Manage subscriptions",
    "favorites.export": "Export as CSV",
    "favorites.import": "Import a CSV",
    "favorites.exported": "Subscriptions exported!",
    "favorites.imported": "subscription(s) imported",
    "favorites.noFavoritesToExport": "No subscriptions to export",
    "favorites.importError": "Error during import",
    "history.title": "Listening History",
    "history.empty": "No episodes listened",
    "history.resume": "Resume",
    "history.completed": "Completed",
    "history.clear": "Clear history",
    "history.inProgress": "In progress",
    "library.showMore": "Show more",
    "library.showLess": "Show less",
    "podcast.subscribe": "Subscribe",
    "podcast.subscribed": "Subscribed",
    "podcast.episodes": "Episodes",
    "podcast.noEpisodes": "No episodes available",
    "podcast.newEpisodes": "New episodes",
    "podcast.newest": "Newest",
    "podcast.oldest": "Oldest",
    "podcast.loadMore": "Load more episodes",
    "podcast.website": "Website",
    "privateFeed.title": "Add a private RSS feed",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "Private RSS feed URL",
    "privateFeed.add": "Add feed",
    "privateFeed.addShort": "Add private feed",
    "privateFeed.adding": "Adding...",
    "privateFeed.added": "Private feed added",
    "privateFeed.invalidUrl": "Invalid URL",
    "privateFeed.fetchError": "Unable to fetch this feed. Check the URL.",
    "privateFeed.webBlocked": "For security and privacy reasons, adding private feeds only works in the Podcast Sphere mobile app.",
    "privateFeed.webWarning": "On the web, adding private feeds is blocked by your browser. Use the mobile app for full support.",
    "privateFeed.privacyNote": "Your token stays strictly on your device. Podcast Sphere never sends your private link to any cloud service.",
    "privateFeed.refresh": "Refresh feed",
    "privateFeed.refreshed": "Feed refreshed",
    "privateFeed.privateBadge": "Private feed",
    "guide.premium": "Add a Premium / Private podcast",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "Now playing",
    "player.streamError": "Playback error",
    "player.streamErrorDesc": "Unable to play this episode. Try another one.",
    "player.error": "Error",
    "player.streamUnavailable": "This episode has no audio URL.",
    "player.speed": "Speed",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "The ultimate podcast experience",
    "premium.active": "Premium active",
    "premium.sleepTimer": "Sleep Timer",
    "premium.sleepTimerDesc": "Automatically stops playback after a configurable delay",
    "premium.monthly": "One-time purchase — €9.99",
    "premium.cancel": "Restore purchase",
    "premium.disclaimer": "One-time purchase, lifetime access. No subscription.",
    "premium.comingSoon": "Coming soon",
    "premium.passwordPlaceholder": "Enter access code",
    "premium.unlock": "Unlock",
    "premium.lock": "Lock Premium",
    "premium.wrongPassword": "Wrong code",
    "premium.unlocked": "Premium unlocked!",
    "premium.restorePurchases": "Restore purchases",
    "premium.restoreSuccess": "Purchases restored successfully",
    "premium.restoreNone": "No purchases to restore",
    "sleepTimer.title": "Sleep Timer",
    "sleepTimer.desc": "Automatically stops playback after a set time",
    "sleepTimer.off": "Off",
    "sleepTimer.active": "Active",
    "sleepTimer.remaining": "Remaining",
    "sleepTimer.cancel": "Cancel timer",
    "sleepTimer.stopped": "Playback was automatically paused.",
    "sleepTimer.custom": "Custom",
    "sleepTimer.customPlaceholder": "Minutes",
    "sleepTimer.customGo": "Go",
    "sleepTimer.15": "15 min",
    "sleepTimer.30": "30 min",
    "sleepTimer.45": "45 min",
    "sleepTimer.60": "1 hour",
    "sleepTimer.90": "1h30",
    "sleepTimer.120": "2 hours",
    "exit.title": "Close app?",
    "exit.description": "Press back one more time to exit.",
    "exit.confirm": "Exit",
    "common.cancel": "Cancel",
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.languageDesc": "Choose the interface language",
    "settings.dataWarning": "Data usage",
    "settings.dataWarningDesc": "Listening to podcasts uses your internet connection and may consume mobile data.",
    "settings.dataDisclaimer": "Local data",
    "settings.dataDisclaimerDesc": "Your subscriptions and preferences are stored locally on your device.",
    "settings.privacyPolicy": "Privacy Policy",
    "settings.copyright": "Podcast Sphere is a product of the RadioSphere.be family",
    "settings.reopenWelcome": "Reopen welcome page",
    "settings.resetApp": "Reset application",
    "settings.resetAppDesc": "Delete all subscriptions and preferences",
    "settings.resetConfirm": "Are you sure? This action cannot be undone.",
    "settings.resetDone": "Application reset",
    "settings.resetButton": "Delete everything",
    "guide.title": "User Guide",
    "guide.button": "User Guide",
    "guide.home": "Home",
    "guide.homeContent": "The home screen shows trending podcasts, your subscriptions, and popular categories.",
    "guide.search": "Search",
    "guide.searchContent": "Search for a podcast by name. Click a result to see the episode list.",
    "guide.favorites": "Library",
    "guide.favoritesContent": "Your subscribed podcasts appear here with a new episodes indicator.",
    "guide.settings": "Settings",
    "guide.settingsContent": "Change language, enable sleep timer, and manage preferences.",
    "guide.permissions": "Permissions",
    "guide.permissionsContent": "Notifications allow playback controls on your lock screen.",
    "guide.permissionsReRequest": "Re-request permissions",
    "guide.permissionsReopenWelcome": "Reload welcome page",
    "guide.sleepTimer": "Sleep Timer",
    "guide.sleepTimerContent": "Schedule automatic playback stop.",
    "guide.snippets": "Audio Clips",
    "guide.snippetsContent": "Save the last 30 seconds of an episode. Rename, replay or share your clips from the My Clips page.",
    "guide.voiceEnhancer": "Voice Enhancer",
    "guide.voiceEnhancerContent": "Boosts voice clarity by enhancing vocal frequencies and compressing dynamics. Toggle it from the full-screen player.",
    "premium.snippets": "Audio Clips",
    "premium.snippetsDesc": "Save 30-second snippets from your favorite episodes",
    "premium.voiceEnhancer": "Voice Enhancer",
    "premium.voiceEnhancerDesc": "Enhances voice clarity for a better listening experience",
    "welcome.subtitle": "World podcasts at your fingertips",
    "welcome.chooseLanguage": "Choose language",
    "welcome.start": "Get started",
    "welcome.stations": "Thousands of podcasts",
    "welcome.search": "Advanced search",
    "welcome.favExport": "Subscriptions",
    "welcome.genres": "Various categories",
    "category.Technology": "Technology",
    "category.Comedy": "Comedy",
    "category.News": "News",
    "category.True Crime": "True Crime",
    "category.Health": "Health",
    "category.Business": "Business",
    "category.Science": "Science",
    "category.Education": "Education",
    "category.Sports": "Sports",
    "category.Music": "Music",
    "category.Society": "Society",
    "category.History": "History",
    "category.Fiction": "Fiction",
    "category.Horror": "Horror",
    "category.Video Games": "Video Games",
    "category.Arts": "Arts",
    "category.Food": "Food",
    "category.Travel": "Travel",
    "category.Religion": "Religion",
    "category.Kids & Family": "Kids & Family",
    "category.Politics": "Politics",
    "category.Nature": "Nature",
    "category.Film & TV": "Film & TV",
    "category.Leisure": "Leisure",
    "category.Self-Improvement": "Self-Improvement",
    "category.Relationships": "Relationships",
    "download.download": "Download",
    "download.downloaded": "Downloaded",
    "download.downloading": "Downloading…",
    "download.delete": "Delete download",
    "download.deleted": "Download deleted",
    "download.success": "Episode downloaded",
    "download.error": "Download failed",
    "download.downloads": "Downloads",
    "download.noDownloads": "No downloaded episodes",
    "download.destination": "Download destination",
    "download.internal": "Internal storage",
    "download.external": "External storage (SD)",
    "download.destinationDesc": "Choose where to save downloaded episodes",
    "auto.drivingWarning": "Warning: Never browse menus while driving",
    "auto.drivingWarningSubtitle": "Leave this task to the passenger",
    "auto.subscriptions": "Subscriptions",
    "auto.inProgress": "In progress",
    "sidebar.description": "Discover and listen to thousands of podcasts from around the world.",
    "sidebar.radioDescription": "Listen to live radio",
    "footer.createdBy": "A product of radiosphere.be",
    "footer.poweredBy": "Powered by Podcast Index",
    "player.selectEpisode": "Select an episode to start listening"
  },
  es: {
    "nav.home": "Inicio",
    "nav.search": "Buscar",
    "nav.library": "Biblioteca",
    "nav.settings": "Ajustes",
    "home.trending": "Tendencias",
    "home.yourSubscriptions": "Tus suscripciones",
    "home.noSubscriptions": "Suscríbete a podcasts para verlos aquí",
    "home.exploreByCategory": "Explorar por categoría",
    "home.resumeListening": "Retomar la escucha",
    "home.latestReleases": "Últimos lanzamientos",
    "home.pullToRefresh": "Desliza para actualizar",
    "settings.podcastIndexTitle": "Desarrollado por Podcast Index",
    "settings.podcastIndexDesc": "Los datos de podcasts son proporcionados por Podcast Index, un índice de podcasts abierto y gratuito. ¡Gracias por su increíble trabajo!",
    "search.title": "Buscar",
    "search.placeholder": "Buscar un podcast...",
    "search.noResults": "Sin resultados",
    "search.networkError": "Error de red.",
    "search.useFilters": "Busca un podcast por nombre o tema",
    "search.resultsCount": "podcasts encontrados",
    "search.languages": "Idiomas",
    "search.categories": "Categorías",
    "search.recentSearches": "Búsquedas recientes",
    "search.relevance": "Relevancia",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Biblioteca",
    "favorites.empty": "Sin suscripciones",
    "favorites.emptyDesc": "Suscríbete a un podcast para verlo aquí",
    "favorites.manage": "Gestionar suscripciones",
    "favorites.export": "Exportar como CSV",
    "favorites.import": "Importar un CSV",
    "favorites.exported": "¡Suscripciones exportadas!",
    "favorites.imported": "suscripción(es) importada(s)",
    "favorites.noFavoritesToExport": "No hay suscripciones para exportar",
    "favorites.importError": "Error durante la importación",
    "history.title": "Historial de escucha",
    "history.empty": "Ningún episodio escuchado",
    "history.resume": "Reanudar",
    "history.completed": "Completado",
    "history.clear": "Borrar historial",
    "history.inProgress": "En curso",
    "library.showMore": "Ver más",
    "library.showLess": "Ver menos",
    "podcast.subscribe": "Suscribirse",
    "podcast.subscribed": "Suscrito",
    "podcast.episodes": "Episodios",
    "podcast.noEpisodes": "No hay episodios disponibles",
    "podcast.newEpisodes": "Nuevos episodios",
    "podcast.newest": "Recientes",
    "podcast.oldest": "Antiguos",
    "podcast.loadMore": "Cargar más episodios",
    "podcast.website": "Sitio web",
    "privateFeed.title": "Añadir un feed RSS privado",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "URL del feed RSS privado",
    "privateFeed.add": "Añadir feed",
    "privateFeed.addShort": "Añadir feed privado",
    "privateFeed.adding": "Añadiendo...",
    "privateFeed.added": "Feed privado añadido",
    "privateFeed.invalidUrl": "URL no válida",
    "privateFeed.fetchError": "No se puede obtener este feed. Verifica la URL.",
    "privateFeed.webBlocked": "Por razones de seguridad y privacidad, añadir feeds privados solo funciona en la aplicación móvil de Podcast Sphere.",
    "privateFeed.webWarning": "En la web, añadir feeds privados está bloqueado por tu navegador. Usa la aplicación móvil.",
    "privateFeed.privacyNote": "Tu token permanece estrictamente en tu dispositivo. Podcast Sphere nunca envía tu enlace privado a la nube.",
    "privateFeed.refresh": "Actualizar feed",
    "privateFeed.refreshed": "Feed actualizado",
    "privateFeed.privateBadge": "Feed privado",
    "guide.premium": "Añadir un podcast Premium / Privado",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "Reproduciendo",
    "player.streamError": "Error de reproducción",
    "player.streamErrorDesc": "No se pudo reproducir este episodio.",
    "player.error": "Error",
    "player.streamUnavailable": "Este episodio no tiene URL de audio.",
    "player.speed": "Velocidad",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "La experiencia podcast definitiva",
    "premium.active": "Premium activo",
    "premium.sleepTimer": "Temporizador",
    "premium.sleepTimerDesc": "Detiene la reproducción automáticamente",
    "premium.monthly": "Compra única — 9,99€",
    "premium.cancel": "Restaurar compra",
    "premium.disclaimer": "Compra única, acceso de por vida.",
    "premium.comingSoon": "Próximamente",
    "premium.passwordPlaceholder": "Código de acceso",
    "premium.unlock": "Desbloquear",
    "premium.lock": "Bloquear Premium",
    "premium.wrongPassword": "Código incorrecto",
    "premium.unlocked": "¡Premium desbloqueado!",
    "premium.restorePurchases": "Restaurar compras",
    "premium.restoreSuccess": "Compras restauradas",
    "premium.restoreNone": "No hay compras",
    "sleepTimer.title": "Temporizador",
    "sleepTimer.desc": "Detiene la reproducción automáticamente",
    "sleepTimer.off": "Desactivado",
    "sleepTimer.active": "Activo",
    "sleepTimer.remaining": "Restante",
    "sleepTimer.cancel": "Cancelar",
    "sleepTimer.stopped": "Reproducción pausada automáticamente.",
    "sleepTimer.custom": "Personalizado",
    "sleepTimer.customPlaceholder": "Minutos",
    "sleepTimer.customGo": "Ir",
    "sleepTimer.15": "15 min",
    "sleepTimer.30": "30 min",
    "sleepTimer.45": "45 min",
    "sleepTimer.60": "1 hora",
    "sleepTimer.90": "1h30",
    "sleepTimer.120": "2 horas",
    "exit.title": "¿Cerrar?",
    "exit.description": "Pulsa atrás una vez más para salir.",
    "exit.confirm": "Salir",
    "common.cancel": "Cancelar",
    "settings.title": "Ajustes",
    "settings.language": "Idioma",
    "settings.languageDesc": "Elige el idioma",
    "settings.dataWarning": "Uso de datos",
    "settings.dataWarningDesc": "Escuchar podcasts consume datos.",
    "settings.dataDisclaimer": "Datos locales",
    "settings.dataDisclaimerDesc": "Tus datos se almacenan localmente.",
    "settings.privacyPolicy": "Política de privacidad",
    "settings.copyright": "Podcast Sphere es un producto de la familia RadioSphere.be",
    "settings.reopenWelcome": "Reabrir bienvenida",
    "settings.resetApp": "Restablecer",
    "settings.resetAppDesc": "Eliminar todo",
    "settings.resetConfirm": "¿Estás seguro?",
    "settings.resetDone": "Restablecido",
    "settings.resetButton": "Eliminar todo",
    "guide.title": "Guía",
    "guide.button": "Guía",
    "guide.home": "Inicio",
    "guide.homeContent": "Podcasts tendencia, suscripciones y categorías.",
    "guide.search": "Buscar",
    "guide.searchContent": "Busca podcasts por nombre.",
    "guide.favorites": "Biblioteca",
    "guide.favoritesContent": "Tus podcasts suscritos.",
    "guide.settings": "Ajustes",
    "guide.settingsContent": "Idioma, temporizador y preferencias.",
    "guide.permissions": "Permisos",
    "guide.permissionsContent": "Notificaciones para controles en pantalla de bloqueo.",
    "guide.permissionsReRequest": "Solicitar permisos",
    "guide.permissionsReopenWelcome": "Recargar bienvenida",
    "guide.sleepTimer": "Temporizador",
    "guide.sleepTimerContent": "Parada automática programada.",
    "guide.snippets": "Clips de audio",
    "guide.snippetsContent": "Guarda los últimos 30 segundos de un episodio. Renombra, reproduce o comparte desde Mis Clips.",
    "guide.voiceEnhancer": "Voz Clara",
    "guide.voiceEnhancerContent": "Mejora la claridad vocal potenciando frecuencias de voz y comprimiendo la dinámica.",
    "premium.snippets": "Clips de audio",
    "premium.snippetsDesc": "Guarda fragmentos de 30 segundos de tus episodios favoritos",
    "premium.voiceEnhancer": "Voz Clara",
    "premium.voiceEnhancerDesc": "Mejora la claridad vocal para una mejor escucha",
    "welcome.subtitle": "Podcasts del mundo entero",
    "welcome.chooseLanguage": "Elige el idioma",
    "welcome.start": "Comenzar",
    "welcome.stations": "Miles de podcasts",
    "welcome.search": "Búsqueda avanzada",
    "welcome.favExport": "Suscripciones",
    "welcome.genres": "Categorías variadas",
    "category.Technology": "Tecnología",
    "category.Comedy": "Comedia",
    "category.News": "Noticias",
    "category.True Crime": "True Crime",
    "category.Health": "Salud",
    "category.Business": "Negocios",
    "category.Science": "Ciencia",
    "category.Education": "Educación",
    "category.Sports": "Deportes",
    "category.Music": "Música",
    "category.Society": "Sociedad",
    "category.History": "Historia",
    "category.Fiction": "Ficción",
    "category.Horror": "Terror",
    "category.Video Games": "Videojuegos",
    "category.Arts": "Artes",
    "category.Food": "Gastronomía",
    "category.Travel": "Viajes",
    "category.Religion": "Religión",
    "category.Kids & Family": "Niños y Familia",
    "category.Politics": "Política",
    "category.Nature": "Naturaleza",
    "category.Film & TV": "Cine y TV",
    "category.Leisure": "Ocio",
    "category.Self-Improvement": "Superación personal",
    "category.Relationships": "Relaciones",
    "download.download": "Descargar",
    "download.downloaded": "Descargado",
    "download.downloading": "Descargando…",
    "download.delete": "Eliminar descarga",
    "download.deleted": "Descarga eliminada",
    "download.success": "Episodio descargado",
    "download.error": "Error de descarga",
    "download.downloads": "Descargas",
    "download.noDownloads": "Sin descargas",
    "download.destination": "Destino de descargas",
    "download.internal": "Almacenamiento interno",
    "download.external": "Almacenamiento externo (SD)",
    "download.destinationDesc": "Elige dónde guardar los episodios",
    "auto.drivingWarning": "Atención: Nunca navegue por los menús mientras conduce",
    "auto.drivingWarningSubtitle": "Deje esta tarea al pasajero",
    "auto.subscriptions": "Suscripciones",
    "auto.inProgress": "En curso",
    "sidebar.description": "Descubre y escucha miles de podcasts de todo el mundo.",
    "sidebar.radioDescription": "Escucha la radio en directo",
    "footer.createdBy": "Un producto de radiosphere.be",
    "footer.poweredBy": "Desarrollado por Podcast Index",
    "player.selectEpisode": "Selecciona un episodio para empezar"
  },
  de: {
    "nav.home": "Startseite",
    "nav.search": "Suche",
    "nav.library": "Bibliothek",
    "nav.settings": "Einstellungen",
    "home.trending": "Trends",
    "home.yourSubscriptions": "Deine Abonnements",
    "home.noSubscriptions": "Abonniere Podcasts, um sie hier zu sehen",
    "home.exploreByCategory": "Nach Kategorie entdecken",
    "home.resumeListening": "Weiterhören",
    "home.latestReleases": "Neueste Folgen",
    "home.pullToRefresh": "Zum Aktualisieren ziehen",
    "settings.podcastIndexTitle": "Unterstützt von Podcast Index",
    "settings.podcastIndexDesc": "Podcast-Daten werden von Podcast Index bereitgestellt, einem freien und offenen Podcast-Verzeichnis. Vielen Dank für ihre großartige Arbeit!",
    "search.title": "Suche",
    "search.placeholder": "Podcast suchen...",
    "search.noResults": "Keine Ergebnisse",
    "search.networkError": "Netzwerkfehler.",
    "search.useFilters": "Suche einen Podcast nach Name oder Thema",
    "search.resultsCount": "Podcasts gefunden",
    "search.languages": "Sprachen",
    "search.categories": "Kategorien",
    "search.recentSearches": "Letzte Suchen",
    "search.relevance": "Relevanz",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Bibliothek",
    "favorites.empty": "Keine Abonnements",
    "favorites.emptyDesc": "Abonniere einen Podcast, um ihn hier zu sehen",
    "favorites.manage": "Abonnements verwalten",
    "favorites.export": "Als CSV exportieren",
    "favorites.import": "CSV importieren",
    "favorites.exported": "Abonnements exportiert!",
    "favorites.imported": "Abonnement(e) importiert",
    "favorites.noFavoritesToExport": "Keine Abonnements zum Exportieren",
    "favorites.importError": "Fehler beim Importieren",
    "history.title": "Hörverlauf",
    "history.empty": "Keine Folgen gehört",
    "history.resume": "Fortsetzen",
    "history.completed": "Abgeschlossen",
    "history.clear": "Verlauf löschen",
    "history.inProgress": "Läuft",
    "library.showMore": "Mehr anzeigen",
    "library.showLess": "Weniger",
    "podcast.subscribe": "Abonnieren",
    "podcast.subscribed": "Abonniert",
    "podcast.episodes": "Folgen",
    "podcast.noEpisodes": "Keine Folgen verfügbar",
    "podcast.newEpisodes": "Neue Folgen",
    "podcast.newest": "Neueste",
    "podcast.oldest": "Älteste",
    "podcast.loadMore": "Mehr Folgen laden",
    "podcast.website": "Webseite",
    "privateFeed.title": "Privaten RSS-Feed hinzufügen",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "Privater RSS-Feed-URL",
    "privateFeed.add": "Feed hinzufügen",
    "privateFeed.addShort": "Privaten Feed hinzufügen",
    "privateFeed.adding": "Wird hinzugefügt...",
    "privateFeed.added": "Privater Feed hinzugefügt",
    "privateFeed.invalidUrl": "Ungültige URL",
    "privateFeed.fetchError": "Feed konnte nicht abgerufen werden.",
    "privateFeed.webBlocked": "Aus Sicherheits- und Datenschutzgründen funktioniert das Hinzufügen privater Feeds nur in der mobilen App.",
    "privateFeed.webWarning": "Im Web ist das Hinzufügen privater Feeds blockiert. Nutze die mobile App.",
    "privateFeed.privacyNote": "Dein Token bleibt strikt auf deinem Gerät. Podcast Sphere sendet deinen privaten Link niemals an die Cloud.",
    "privateFeed.refresh": "Feed aktualisieren",
    "privateFeed.refreshed": "Feed aktualisiert",
    "privateFeed.privateBadge": "Privater Feed",
    "guide.premium": "Premium / Privates Podcast hinzufügen",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "Wird abgespielt",
    "player.streamError": "Wiedergabefehler",
    "player.streamErrorDesc": "Diese Folge konnte nicht abgespielt werden.",
    "player.error": "Fehler",
    "player.streamUnavailable": "Keine Audio-URL.",
    "player.speed": "Geschwindigkeit",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "Das ultimative Podcast-Erlebnis",
    "premium.active": "Premium aktiv",
    "premium.sleepTimer": "Schlaf-Timer",
    "premium.sleepTimerDesc": "Stoppt Wiedergabe automatisch",
    "premium.monthly": "Einmalkauf — 9,99€",
    "premium.cancel": "Kauf wiederherstellen",
    "premium.disclaimer": "Einmalkauf, lebenslang.",
    "premium.comingSoon": "Demnächst",
    "premium.passwordPlaceholder": "Zugangscode",
    "premium.unlock": "Freischalten",
    "premium.lock": "Sperren",
    "premium.wrongPassword": "Falscher Code",
    "premium.unlocked": "Premium freigeschaltet!",
    "premium.restorePurchases": "Käufe wiederherstellen",
    "premium.restoreSuccess": "Wiederhergestellt",
    "premium.restoreNone": "Keine Käufe",
    "sleepTimer.title": "Schlaf-Timer",
    "sleepTimer.desc": "Stoppt automatisch nach einer Zeit",
    "sleepTimer.off": "Aus",
    "sleepTimer.active": "Aktiv",
    "sleepTimer.remaining": "Verbleibend",
    "sleepTimer.cancel": "Abbrechen",
    "sleepTimer.stopped": "Wiedergabe pausiert.",
    "sleepTimer.custom": "Benutzerdefiniert",
    "sleepTimer.customPlaceholder": "Minuten",
    "sleepTimer.customGo": "Los",
    "sleepTimer.15": "15 Min",
    "sleepTimer.30": "30 Min",
    "sleepTimer.45": "45 Min",
    "sleepTimer.60": "1 Stunde",
    "sleepTimer.90": "1h30",
    "sleepTimer.120": "2 Stunden",
    "exit.title": "App schließen?",
    "exit.description": "Noch einmal drücken zum Beenden.",
    "exit.confirm": "Beenden",
    "common.cancel": "Abbrechen",
    "settings.title": "Einstellungen",
    "settings.language": "Sprache",
    "settings.languageDesc": "Sprache wählen",
    "settings.dataWarning": "Datenverbrauch",
    "settings.dataWarningDesc": "Podcasts verbrauchen Daten.",
    "settings.dataDisclaimer": "Lokale Daten",
    "settings.dataDisclaimerDesc": "Daten werden lokal gespeichert.",
    "settings.privacyPolicy": "Datenschutz",
    "settings.copyright": "Podcast Sphere ist ein Produkt der RadioSphere.be-Familie",
    "settings.reopenWelcome": "Willkommen erneut öffnen",
    "settings.resetApp": "Zurücksetzen",
    "settings.resetAppDesc": "Alles löschen",
    "settings.resetConfirm": "Bist du sicher?",
    "settings.resetDone": "Zurückgesetzt",
    "settings.resetButton": "Alles löschen",
    "guide.title": "Anleitung",
    "guide.button": "Anleitung",
    "guide.home": "Startseite",
    "guide.homeContent": "Trends, Abonnements und Kategorien.",
    "guide.search": "Suche",
    "guide.searchContent": "Podcasts nach Name suchen.",
    "guide.favorites": "Bibliothek",
    "guide.favoritesContent": "Deine abonnierten Podcasts.",
    "guide.settings": "Einstellungen",
    "guide.settingsContent": "Sprache, Timer und Einstellungen.",
    "guide.permissions": "Berechtigungen",
    "guide.permissionsContent": "Benachrichtigungen für Sperrbildschirm-Steuerung.",
    "guide.permissionsReRequest": "Erneut anfordern",
    "guide.permissionsReopenWelcome": "Willkommen neu laden",
    "guide.sleepTimer": "Schlaf-Timer",
    "guide.sleepTimerContent": "Automatischer Stopp.",
    "guide.snippets": "Audio-Clips",
    "guide.snippetsContent": "Speichere die letzten 30 Sekunden einer Folge. Benenne um, spiele ab oder teile deine Clips.",
    "guide.voiceEnhancer": "Stimmverstärker",
    "guide.voiceEnhancerContent": "Verbessert die Sprachklarheit durch Anhebung der Stimmfrequenzen und dynamische Kompression.",
    "premium.snippets": "Audio-Clips",
    "premium.snippetsDesc": "30-Sekunden-Ausschnitte deiner Lieblingsfolgen speichern",
    "premium.voiceEnhancer": "Stimmverstärker",
    "premium.voiceEnhancerDesc": "Verbessert die Sprachklarheit für ein besseres Hörerlebnis",
    "welcome.subtitle": "Podcasts aus aller Welt",
    "welcome.chooseLanguage": "Sprache wählen",
    "welcome.start": "Loslegen",
    "welcome.stations": "Tausende Podcasts",
    "welcome.search": "Erweiterte Suche",
    "welcome.favExport": "Abonnements",
    "welcome.genres": "Verschiedene Kategorien",
    "category.Technology": "Technologie",
    "category.Comedy": "Comedy",
    "category.News": "Nachrichten",
    "category.True Crime": "True Crime",
    "category.Health": "Gesundheit",
    "category.Business": "Wirtschaft",
    "category.Science": "Wissenschaft",
    "category.Education": "Bildung",
    "category.Sports": "Sport",
    "category.Music": "Musik",
    "category.Society": "Gesellschaft",
    "category.History": "Geschichte",
    "category.Fiction": "Fiktion",
    "category.Horror": "Horror",
    "category.Video Games": "Videospiele",
    "category.Arts": "Kunst",
    "category.Food": "Essen",
    "category.Travel": "Reisen",
    "category.Religion": "Religion",
    "category.Kids & Family": "Kinder & Familie",
    "category.Politics": "Politik",
    "category.Nature": "Natur",
    "category.Film & TV": "Film & TV",
    "category.Leisure": "Freizeit",
    "category.Self-Improvement": "Selbstverbesserung",
    "category.Relationships": "Beziehungen",
    "download.download": "Herunterladen",
    "download.downloaded": "Heruntergeladen",
    "download.downloading": "Wird heruntergeladen…",
    "download.delete": "Download löschen",
    "download.deleted": "Download gelöscht",
    "download.success": "Folge heruntergeladen",
    "download.error": "Download fehlgeschlagen",
    "download.downloads": "Downloads",
    "download.noDownloads": "Keine Downloads",
    "download.destination": "Download-Ziel",
    "download.internal": "Interner Speicher",
    "download.external": "Externer Speicher (SD)",
    "download.destinationDesc": "Speicherort für heruntergeladene Folgen",
    "auto.drivingWarning": "Achtung: Navigieren Sie niemals während der Fahrt in Menüs",
    "auto.drivingWarningSubtitle": "Überlassen Sie diese Aufgabe dem Beifahrer",
    "auto.subscriptions": "Abonnements",
    "auto.inProgress": "Läuft",
    "sidebar.description": "Entdecken und hören Sie Tausende von Podcasts aus der ganzen Welt.",
    "sidebar.radioDescription": "Radio live hören",
    "footer.createdBy": "Ein Produkt von radiosphere.be",
    "footer.poweredBy": "Unterstützt von Podcast Index",
    "player.selectEpisode": "Wählen Sie eine Folge zum Abspielen"
  },
  ja: {
    "nav.home": "ホーム",
    "nav.search": "検索",
    "nav.library": "ライブラリ",
    "nav.settings": "設定",
    "home.trending": "トレンド",
    "home.yourSubscriptions": "登録済み",
    "home.noSubscriptions": "ポッドキャストを登録するとここに表示されます",
    "home.exploreByCategory": "カテゴリで探す",
    "home.resumeListening": "再生を再開",
    "home.latestReleases": "最新リリース",
    "home.pullToRefresh": "引っ張って更新",
    "settings.podcastIndexTitle": "Podcast Index 提供",
    "settings.podcastIndexDesc": "ポッドキャストデータはPodcast Indexによって提供されています。無料でオープンなポッドキャストインデックスです。素晴らしい活動に感謝します！",
    "search.title": "検索",
    "search.placeholder": "ポッドキャストを検索...",
    "search.noResults": "結果なし",
    "search.networkError": "ネットワークエラー",
    "search.useFilters": "名前やトピックで検索",
    "search.resultsCount": "件のポッドキャスト",
    "search.languages": "言語",
    "search.categories": "カテゴリ",
    "search.recentSearches": "最近の検索",
    "search.relevance": "関連性",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "ライブラリ",
    "favorites.empty": "登録なし",
    "favorites.emptyDesc": "ポッドキャストを登録するとここに表示されます",
    "favorites.manage": "登録を管理",
    "favorites.export": "CSVでエクスポート",
    "favorites.import": "CSVをインポート",
    "favorites.exported": "登録をエクスポートしました！",
    "favorites.imported": "件の登録をインポートしました",
    "favorites.noFavoritesToExport": "エクスポートする登録がありません",
    "favorites.importError": "インポート中にエラーが発生しました",
    "history.title": "再生履歴",
    "history.empty": "再生したエピソードはありません",
    "history.resume": "再開",
    "history.completed": "完了",
    "history.clear": "履歴を消去",
    "history.inProgress": "再生中",
    "library.showMore": "もっと見る",
    "library.showLess": "折りたたむ",
    "podcast.subscribe": "登録",
    "podcast.subscribed": "登録済み",
    "podcast.episodes": "エピソード",
    "podcast.noEpisodes": "エピソードなし",
    "podcast.newEpisodes": "新しいエピソード",
    "podcast.newest": "新しい順",
    "podcast.oldest": "古い順",
    "podcast.loadMore": "もっと読み込む",
    "podcast.website": "ウェブサイト",
    "privateFeed.title": "プライベートRSSフィードを追加",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "プライベートRSSフィードURL",
    "privateFeed.add": "フィードを追加",
    "privateFeed.addShort": "プライベートフィードを追加",
    "privateFeed.adding": "追加中...",
    "privateFeed.added": "プライベートフィードを追加しました",
    "privateFeed.invalidUrl": "無効なURL",
    "privateFeed.fetchError": "フィードを取得できません。",
    "privateFeed.webBlocked": "セキュリティとプライバシーのため、プライベートフィードの追加はモバイルアプリでのみ機能します。",
    "privateFeed.webWarning": "ウェブではプライベートフィードの追加はブラウザによりブロックされます。モバイルアプリをご利用ください。",
    "privateFeed.privacyNote": "トークンは厳密にお使いのデバイス内に留まります。Podcast Sphereはプライベートリンクをクラウドに送信しません。",
    "privateFeed.refresh": "フィードを更新",
    "privateFeed.refreshed": "フィードを更新しました",
    "privateFeed.privateBadge": "プライベートフィード",
    "guide.premium": "プレミアム / プライベートポッドキャストを追加",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "再生中",
    "player.streamError": "再生エラー",
    "player.streamErrorDesc": "再生できません。",
    "player.error": "エラー",
    "player.streamUnavailable": "音声URLがありません。",
    "player.speed": "速度",
    "premium.title": "Podcast Sphere プレミアム",
    "premium.subtitle": "究極のポッドキャスト体験",
    "premium.active": "プレミアム有効",
    "premium.sleepTimer": "スリープタイマー",
    "premium.sleepTimerDesc": "自動停止",
    "premium.monthly": "買い切り — €9.99",
    "premium.cancel": "復元",
    "premium.disclaimer": "買い切り、永久アクセス。",
    "premium.comingSoon": "近日公開",
    "premium.passwordPlaceholder": "コードを入力",
    "premium.unlock": "解除",
    "premium.lock": "ロック",
    "premium.wrongPassword": "コードが違います",
    "premium.unlocked": "解除済み！",
    "premium.restorePurchases": "購入を復元",
    "premium.restoreSuccess": "復元成功",
    "premium.restoreNone": "復元なし",
    "sleepTimer.title": "スリープタイマー",
    "sleepTimer.desc": "自動停止",
    "sleepTimer.off": "オフ",
    "sleepTimer.active": "有効",
    "sleepTimer.remaining": "残り",
    "sleepTimer.cancel": "解除",
    "sleepTimer.stopped": "自動停止しました。",
    "sleepTimer.custom": "カスタム",
    "sleepTimer.customPlaceholder": "分",
    "sleepTimer.customGo": "開始",
    "sleepTimer.15": "15分",
    "sleepTimer.30": "30分",
    "sleepTimer.45": "45分",
    "sleepTimer.60": "1時間",
    "sleepTimer.90": "1時間30分",
    "sleepTimer.120": "2時間",
    "exit.title": "閉じますか？",
    "exit.description": "もう一度押すと終了します。",
    "exit.confirm": "終了",
    "common.cancel": "キャンセル",
    "settings.title": "設定",
    "settings.language": "言語",
    "settings.languageDesc": "言語を選択",
    "settings.dataWarning": "データ使用量",
    "settings.dataWarningDesc": "ポッドキャストの視聴にはデータを使用します。",
    "settings.dataDisclaimer": "ローカルデータ",
    "settings.dataDisclaimerDesc": "データは端末にローカル保存されます。",
    "settings.privacyPolicy": "プライバシーポリシー",
    "settings.copyright": "Podcast Sphere は RadioSphere.be ファミリーの製品です",
    "settings.reopenWelcome": "ウェルカムページ再表示",
    "settings.resetApp": "リセット",
    "settings.resetAppDesc": "すべて削除",
    "settings.resetConfirm": "本当によろしいですか？",
    "settings.resetDone": "リセット完了",
    "settings.resetButton": "すべて削除",
    "guide.title": "ガイド",
    "guide.button": "ガイド",
    "guide.home": "ホーム",
    "guide.homeContent": "トレンド、登録済み、カテゴリ。",
    "guide.search": "検索",
    "guide.searchContent": "名前で検索。",
    "guide.favorites": "ライブラリ",
    "guide.favoritesContent": "登録済みポッドキャスト。",
    "guide.settings": "設定",
    "guide.settingsContent": "言語、タイマー、設定。",
    "guide.permissions": "権限",
    "guide.permissionsContent": "ロック画面の再生コントロール。",
    "guide.permissionsReRequest": "再リクエスト",
    "guide.permissionsReopenWelcome": "ウェルカム再表示",
    "guide.sleepTimer": "スリープタイマー",
    "guide.sleepTimerContent": "自動停止。",
    "guide.snippets": "オーディオクリップ",
    "guide.snippetsContent": "エピソードの最後の30秒を保存。名前変更、再生、共有が可能です。",
    "guide.voiceEnhancer": "ボイスエンハンサー",
    "guide.voiceEnhancerContent": "音声周波数を強化し、ダイナミクスを圧縮して音声の明瞭度を向上させます。",
    "premium.snippets": "オーディオクリップ",
    "premium.snippetsDesc": "お気に入りのエピソードから30秒のスニペットを保存",
    "premium.voiceEnhancer": "ボイスエンハンサー",
    "premium.voiceEnhancerDesc": "より良いリスニング体験のための音声明瞭度向上",
    "welcome.subtitle": "世界のポッドキャスト",
    "welcome.chooseLanguage": "言語を選択",
    "welcome.start": "開始",
    "welcome.stations": "多数のポッドキャスト",
    "welcome.search": "高度な検索",
    "welcome.favExport": "登録",
    "welcome.genres": "さまざまなカテゴリ",
    "category.Technology": "テクノロジー",
    "category.Comedy": "コメディ",
    "category.News": "ニュース",
    "category.True Crime": "トゥルークライム",
    "category.Health": "健康",
    "category.Business": "ビジネス",
    "category.Science": "科学",
    "category.Education": "教育",
    "category.Sports": "スポーツ",
    "category.Music": "音楽",
    "category.Society": "社会",
    "category.History": "歴史",
    "category.Fiction": "フィクション",
    "category.Horror": "ホラー",
    "category.Video Games": "ゲーム",
    "category.Arts": "アート",
    "category.Food": "フード",
    "category.Travel": "旅行",
    "category.Religion": "宗教",
    "category.Kids & Family": "キッズ＆ファミリー",
    "category.Politics": "政治",
    "category.Nature": "自然",
    "category.Film & TV": "映画＆TV",
    "category.Leisure": "レジャー",
    "category.Self-Improvement": "自己啓発",
    "category.Relationships": "人間関係",
    "download.download": "ダウンロード",
    "download.downloaded": "ダウンロード済み",
    "download.downloading": "ダウンロード中…",
    "download.delete": "ダウンロードを削除",
    "download.deleted": "削除しました",
    "download.success": "ダウンロード完了",
    "download.error": "ダウンロード失敗",
    "download.downloads": "ダウンロード",
    "download.noDownloads": "ダウンロードなし",
    "download.destination": "保存先",
    "download.internal": "内部ストレージ",
    "download.external": "外部ストレージ (SD)",
    "download.destinationDesc": "ダウンロード先を選択",
    "auto.drivingWarning": "警告：運転中にメニューを操作しないでください",
    "auto.drivingWarningSubtitle": "この操作は同乗者に任せてください",
    "auto.subscriptions": "登録済み",
    "auto.inProgress": "再生中",
    "sidebar.description": "世界中の何千ものポッドキャストを発見して聴きましょう。",
    "sidebar.radioDescription": "ラジオをライブで聴く",
    "footer.createdBy": "radiosphere.beの製品",
    "footer.poweredBy": "Podcast Indexを利用",
    "player.selectEpisode": "エピソードを選択して再生を開始"
  },
  it: {
    "nav.home": "Home",
    "nav.search": "Cerca",
    "nav.library": "Libreria",
    "nav.settings": "Impostazioni",
    "home.trending": "Tendenze",
    "home.yourSubscriptions": "I tuoi abbonamenti",
    "home.noSubscriptions": "Abbonati ai podcast per vederli qui",
    "home.exploreByCategory": "Esplora per categoria",
    "home.resumeListening": "Riprendi l'ascolto",
    "home.latestReleases": "Ultime uscite",
    "home.pullToRefresh": "Trascina per aggiornare",
    "settings.podcastIndexTitle": "Offerto da Podcast Index",
    "settings.podcastIndexDesc": "I dati dei podcast sono forniti da Podcast Index, un indice di podcast aperto e gratuito. Grazie per il loro incredibile lavoro!",
    "search.title": "Cerca",
    "search.placeholder": "Cerca un podcast...",
    "search.noResults": "Nessun risultato",
    "search.networkError": "Errore di rete.",
    "search.useFilters": "Cerca un podcast per nome o argomento",
    "search.resultsCount": "podcast trovati",
    "search.languages": "Lingue",
    "search.categories": "Categorie",
    "search.recentSearches": "Ricerche recenti",
    "search.relevance": "Rilevanza",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Libreria",
    "favorites.empty": "Nessun abbonamento",
    "favorites.emptyDesc": "Abbonati a un podcast per vederlo qui",
    "favorites.manage": "Gestisci abbonamenti",
    "favorites.export": "Esporta come CSV",
    "favorites.import": "Importa un CSV",
    "favorites.exported": "Abbonamenti esportati!",
    "favorites.imported": "abbonamento/i importato/i",
    "favorites.noFavoritesToExport": "Nessun abbonamento da esportare",
    "favorites.importError": "Errore durante l'importazione",
    "history.title": "Cronologia ascolti",
    "history.empty": "Nessun episodio ascoltato",
    "history.resume": "Riprendi",
    "history.completed": "Completato",
    "history.clear": "Cancella cronologia",
    "history.inProgress": "In corso",
    "library.showMore": "Mostra di più",
    "library.showLess": "Mostra meno",
    "podcast.subscribe": "Abbonati",
    "podcast.subscribed": "Abbonato",
    "podcast.episodes": "Episodi",
    "podcast.noEpisodes": "Nessun episodio disponibile",
    "podcast.newEpisodes": "Nuovi episodi",
    "podcast.newest": "Recenti",
    "podcast.oldest": "Meno recenti",
    "podcast.loadMore": "Carica altri episodi",
    "podcast.website": "Sito web",
    "privateFeed.title": "Aggiungi un feed RSS privato",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "URL del feed RSS privato",
    "privateFeed.add": "Aggiungi feed",
    "privateFeed.addShort": "Aggiungi feed privato",
    "privateFeed.adding": "Aggiunta in corso...",
    "privateFeed.added": "Feed privato aggiunto",
    "privateFeed.invalidUrl": "URL non valido",
    "privateFeed.fetchError": "Impossibile recuperare questo feed.",
    "privateFeed.webBlocked": "Per motivi di sicurezza e privacy, l'aggiunta di feed privati funziona solo nell'app mobile.",
    "privateFeed.webWarning": "Sul web, l'aggiunta di feed privati è bloccata dal browser. Usa l'app mobile.",
    "privateFeed.privacyNote": "Il tuo token resta rigorosamente sul tuo dispositivo. Podcast Sphere non invia mai il tuo link privato al cloud.",
    "privateFeed.refresh": "Aggiorna feed",
    "privateFeed.refreshed": "Feed aggiornato",
    "privateFeed.privateBadge": "Feed privato",
    "guide.premium": "Aggiungi un podcast Premium / Privato",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "In riproduzione",
    "player.streamError": "Errore di riproduzione",
    "player.streamErrorDesc": "Impossibile riprodurre questo episodio.",
    "player.error": "Errore",
    "player.streamUnavailable": "Questo episodio non ha un URL audio.",
    "player.speed": "Velocità",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "L'esperienza podcast definitiva",
    "premium.active": "Premium attivo",
    "premium.sleepTimer": "Timer sonno",
    "premium.sleepTimerDesc": "Ferma automaticamente la riproduzione",
    "premium.monthly": "Acquisto unico — 9,99€",
    "premium.cancel": "Ripristina acquisto",
    "premium.disclaimer": "Acquisto unico, accesso a vita.",
    "premium.comingSoon": "Prossimamente",
    "premium.passwordPlaceholder": "Codice di accesso",
    "premium.unlock": "Sblocca",
    "premium.lock": "Blocca Premium",
    "premium.wrongPassword": "Codice errato",
    "premium.unlocked": "Premium sbloccato!",
    "premium.restorePurchases": "Ripristina acquisti",
    "premium.restoreSuccess": "Acquisti ripristinati",
    "premium.restoreNone": "Nessun acquisto",
    "sleepTimer.title": "Timer sonno",
    "sleepTimer.desc": "Ferma la riproduzione automaticamente",
    "sleepTimer.off": "Disattivato",
    "sleepTimer.active": "Attivo",
    "sleepTimer.remaining": "Rimanente",
    "sleepTimer.cancel": "Annulla",
    "sleepTimer.stopped": "Riproduzione messa in pausa automaticamente.",
    "sleepTimer.custom": "Personalizzato",
    "sleepTimer.customPlaceholder": "Minuti",
    "sleepTimer.customGo": "Vai",
    "sleepTimer.15": "15 min",
    "sleepTimer.30": "30 min",
    "sleepTimer.45": "45 min",
    "sleepTimer.60": "1 ora",
    "sleepTimer.90": "1h30",
    "sleepTimer.120": "2 ore",
    "exit.title": "Chiudere?",
    "exit.description": "Premi indietro ancora una volta per uscire.",
    "exit.confirm": "Esci",
    "common.cancel": "Annulla",
    "settings.title": "Impostazioni",
    "settings.language": "Lingua",
    "settings.languageDesc": "Scegli la lingua dell'interfaccia",
    "settings.dataWarning": "Utilizzo dati",
    "settings.dataWarningDesc": "L'ascolto dei podcast utilizza dati.",
    "settings.dataDisclaimer": "Dati locali",
    "settings.dataDisclaimerDesc": "I tuoi dati sono memorizzati localmente.",
    "settings.privacyPolicy": "Informativa sulla privacy",
    "settings.copyright": "Podcast Sphere è un prodotto della famiglia RadioSphere.be",
    "settings.reopenWelcome": "Riapri la pagina di benvenuto",
    "settings.resetApp": "Ripristina",
    "settings.resetAppDesc": "Elimina tutto",
    "settings.resetConfirm": "Sei sicuro?",
    "settings.resetDone": "Ripristinato",
    "settings.resetButton": "Elimina tutto",
    "guide.title": "Guida",
    "guide.button": "Guida",
    "guide.home": "Home",
    "guide.homeContent": "Tendenze, abbonamenti e categorie.",
    "guide.search": "Cerca",
    "guide.searchContent": "Cerca podcast per nome.",
    "guide.favorites": "Libreria",
    "guide.favoritesContent": "I tuoi podcast abbonati.",
    "guide.settings": "Impostazioni",
    "guide.settingsContent": "Lingua, timer e preferenze.",
    "guide.permissions": "Autorizzazioni",
    "guide.permissionsContent": "Notifiche per i controlli sullo schermo di blocco.",
    "guide.permissionsReRequest": "Richiedi autorizzazioni",
    "guide.permissionsReopenWelcome": "Ricarica benvenuto",
    "guide.sleepTimer": "Timer sonno",
    "guide.sleepTimerContent": "Arresto automatico programmato.",
    "guide.snippets": "Clip audio",
    "guide.snippetsContent": "Salva gli ultimi 30 secondi di un episodio. Rinomina, riascolta o condividi i tuoi clip.",
    "guide.voiceEnhancer": "Voce Chiara",
    "guide.voiceEnhancerContent": "Migliora la chiarezza vocale potenziando le frequenze vocali e comprimendo la dinamica.",
    "premium.snippets": "Clip audio",
    "premium.snippetsDesc": "Salva frammenti di 30 secondi dai tuoi episodi preferiti",
    "premium.voiceEnhancer": "Voce Chiara",
    "premium.voiceEnhancerDesc": "Migliora la chiarezza vocale per un ascolto migliore",
    "welcome.subtitle": "Podcast da tutto il mondo",
    "welcome.chooseLanguage": "Scegli la lingua",
    "welcome.start": "Inizia",
    "welcome.stations": "Migliaia di podcast",
    "welcome.search": "Ricerca avanzata",
    "welcome.favExport": "Abbonamenti",
    "welcome.genres": "Categorie varie",
    "category.Technology": "Tecnologia",
    "category.Comedy": "Commedia",
    "category.News": "Notizie",
    "category.True Crime": "True Crime",
    "category.Health": "Salute",
    "category.Business": "Business",
    "category.Science": "Scienza",
    "category.Education": "Educazione",
    "category.Sports": "Sport",
    "category.Music": "Musica",
    "category.Society": "Società",
    "category.History": "Storia",
    "category.Fiction": "Narrativa",
    "category.Horror": "Horror",
    "category.Video Games": "Videogiochi",
    "category.Arts": "Arti",
    "category.Food": "Cucina",
    "category.Travel": "Viaggi",
    "category.Religion": "Religione",
    "category.Kids & Family": "Bambini e Famiglia",
    "category.Politics": "Politica",
    "category.Nature": "Natura",
    "category.Film & TV": "Cinema e TV",
    "category.Leisure": "Tempo libero",
    "category.Self-Improvement": "Crescita personale",
    "category.Relationships": "Relazioni",
    "download.download": "Scarica",
    "download.downloaded": "Scaricato",
    "download.downloading": "Download in corso…",
    "download.delete": "Elimina download",
    "download.deleted": "Download eliminato",
    "download.success": "Episodio scaricato",
    "download.error": "Download fallito",
    "download.downloads": "Download",
    "download.noDownloads": "Nessun download",
    "download.destination": "Destinazione download",
    "download.internal": "Memoria interna",
    "download.external": "Memoria esterna (SD)",
    "download.destinationDesc": "Scegli dove salvare gli episodi",
    "auto.drivingWarning": "Attenzione: Non navigare nei menu durante la guida",
    "auto.drivingWarningSubtitle": "Lascia questo compito al passeggero",
    "auto.subscriptions": "Abbonamenti",
    "auto.inProgress": "In corso",
    "sidebar.description": "Scopri e ascolta migliaia di podcast da tutto il mondo.",
    "sidebar.radioDescription": "Ascolta la radio in diretta",
    "footer.createdBy": "Un prodotto di radiosphere.be",
    "footer.poweredBy": "Offerto da Podcast Index",
    "player.selectEpisode": "Seleziona un episodio per iniziare"
  },
  nl: {
    "nav.home": "Home",
    "nav.search": "Zoeken",
    "nav.library": "Bibliotheek",
    "nav.settings": "Instellingen",
    "home.trending": "Trending",
    "home.yourSubscriptions": "Jouw abonnementen",
    "home.noSubscriptions": "Abonneer je op podcasts om ze hier te zien",
    "home.exploreByCategory": "Ontdek per categorie",
    "home.resumeListening": "Verder luisteren",
    "home.latestReleases": "Nieuwste afleveringen",
    "home.pullToRefresh": "Trek om te vernieuwen",
    "settings.podcastIndexTitle": "Aangedreven door Podcast Index",
    "settings.podcastIndexDesc": "Podcastgegevens worden geleverd door Podcast Index, een gratis en open podcastindex. Bedankt voor hun geweldige werk!",
    "search.title": "Zoeken",
    "search.placeholder": "Zoek een podcast...",
    "search.noResults": "Geen resultaten",
    "search.networkError": "Netwerkfout.",
    "search.useFilters": "Zoek een podcast op naam of onderwerp",
    "search.resultsCount": "podcasts gevonden",
    "search.languages": "Talen",
    "search.categories": "Categorieën",
    "search.recentSearches": "Recente zoekopdrachten",
    "search.relevance": "Relevantie",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Bibliotheek",
    "favorites.empty": "Geen abonnementen",
    "favorites.emptyDesc": "Abonneer je op een podcast om deze hier te zien",
    "favorites.manage": "Abonnementen beheren",
    "favorites.export": "Exporteer als CSV",
    "favorites.import": "Importeer een CSV",
    "favorites.exported": "Abonnementen geëxporteerd!",
    "favorites.imported": "abonnement(en) geïmporteerd",
    "favorites.noFavoritesToExport": "Geen abonnementen om te exporteren",
    "favorites.importError": "Fout bij importeren",
    "history.title": "Luistergeschiedenis",
    "history.empty": "Geen afleveringen beluisterd",
    "history.resume": "Hervatten",
    "history.completed": "Voltooid",
    "history.clear": "Geschiedenis wissen",
    "history.inProgress": "Bezig",
    "library.showMore": "Meer tonen",
    "library.showLess": "Minder tonen",
    "podcast.subscribe": "Abonneren",
    "podcast.subscribed": "Geabonneerd",
    "podcast.episodes": "Afleveringen",
    "podcast.noEpisodes": "Geen afleveringen beschikbaar",
    "podcast.newEpisodes": "Nieuwe afleveringen",
    "podcast.newest": "Nieuwste",
    "podcast.oldest": "Oudste",
    "podcast.loadMore": "Meer afleveringen laden",
    "podcast.website": "Website",
    "privateFeed.title": "Privé RSS-feed toevoegen",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "Privé RSS-feed URL",
    "privateFeed.add": "Feed toevoegen",
    "privateFeed.addShort": "Privéfeed toevoegen",
    "privateFeed.adding": "Toevoegen...",
    "privateFeed.added": "Privéfeed toegevoegd",
    "privateFeed.invalidUrl": "Ongeldige URL",
    "privateFeed.fetchError": "Kan deze feed niet ophalen.",
    "privateFeed.webBlocked": "Om veiligheids- en privacyredenen werkt het toevoegen van privéfeeds alleen in de mobiele app.",
    "privateFeed.webWarning": "Op het web is het toevoegen van privéfeeds geblokkeerd. Gebruik de mobiele app.",
    "privateFeed.privacyNote": "Je token blijft strikt op je apparaat. Podcast Sphere stuurt je privélink nooit naar de cloud.",
    "privateFeed.refresh": "Feed verversen",
    "privateFeed.refreshed": "Feed ververst",
    "privateFeed.privateBadge": "Privéfeed",
    "guide.premium": "Een Premium / Privé podcast toevoegen",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "Nu aan het spelen",
    "player.streamError": "Afspeelfout",
    "player.streamErrorDesc": "Kan deze aflevering niet afspelen.",
    "player.error": "Fout",
    "player.streamUnavailable": "Deze aflevering heeft geen audio-URL.",
    "player.speed": "Snelheid",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "De ultieme podcastervaring",
    "premium.active": "Premium actief",
    "premium.sleepTimer": "Slaaptimer",
    "premium.sleepTimerDesc": "Stopt het afspelen automatisch",
    "premium.monthly": "Eenmalige aankoop — €9,99",
    "premium.cancel": "Aankoop herstellen",
    "premium.disclaimer": "Eenmalige aankoop, levenslange toegang.",
    "premium.comingSoon": "Binnenkort",
    "premium.passwordPlaceholder": "Toegangscode",
    "premium.unlock": "Ontgrendelen",
    "premium.lock": "Premium vergrendelen",
    "premium.wrongPassword": "Verkeerde code",
    "premium.unlocked": "Premium ontgrendeld!",
    "premium.restorePurchases": "Aankopen herstellen",
    "premium.restoreSuccess": "Aankopen hersteld",
    "premium.restoreNone": "Geen aankopen",
    "sleepTimer.title": "Slaaptimer",
    "sleepTimer.desc": "Stopt automatisch na een ingestelde tijd",
    "sleepTimer.off": "Uit",
    "sleepTimer.active": "Actief",
    "sleepTimer.remaining": "Resterend",
    "sleepTimer.cancel": "Annuleren",
    "sleepTimer.stopped": "Afspelen automatisch gepauzeerd.",
    "sleepTimer.custom": "Aangepast",
    "sleepTimer.customPlaceholder": "Minuten",
    "sleepTimer.customGo": "Start",
    "sleepTimer.15": "15 min",
    "sleepTimer.30": "30 min",
    "sleepTimer.45": "45 min",
    "sleepTimer.60": "1 uur",
    "sleepTimer.90": "1u30",
    "sleepTimer.120": "2 uur",
    "exit.title": "App sluiten?",
    "exit.description": "Druk nog een keer op terug om af te sluiten.",
    "exit.confirm": "Afsluiten",
    "common.cancel": "Annuleren",
    "settings.title": "Instellingen",
    "settings.language": "Taal",
    "settings.languageDesc": "Kies de taal van de interface",
    "settings.dataWarning": "Datagebruik",
    "settings.dataWarningDesc": "Podcasts luisteren verbruikt data.",
    "settings.dataDisclaimer": "Lokale data",
    "settings.dataDisclaimerDesc": "Je gegevens worden lokaal opgeslagen.",
    "settings.privacyPolicy": "Privacybeleid",
    "settings.copyright": "Podcast Sphere is een product van de RadioSphere.be-familie",
    "settings.reopenWelcome": "Welkomstpagina heropenen",
    "settings.resetApp": "Resetten",
    "settings.resetAppDesc": "Alles verwijderen",
    "settings.resetConfirm": "Weet je het zeker?",
    "settings.resetDone": "Gereset",
    "settings.resetButton": "Alles verwijderen",
    "guide.title": "Handleiding",
    "guide.button": "Handleiding",
    "guide.home": "Home",
    "guide.homeContent": "Trending, abonnementen en categorieën.",
    "guide.search": "Zoeken",
    "guide.searchContent": "Zoek podcasts op naam.",
    "guide.favorites": "Bibliotheek",
    "guide.favoritesContent": "Je geabonneerde podcasts.",
    "guide.settings": "Instellingen",
    "guide.settingsContent": "Taal, timer en voorkeuren.",
    "guide.permissions": "Machtigingen",
    "guide.permissionsContent": "Meldingen voor bedieningselementen op vergrendelscherm.",
    "guide.permissionsReRequest": "Machtigingen opnieuw vragen",
    "guide.permissionsReopenWelcome": "Welkom herladen",
    "guide.sleepTimer": "Slaaptimer",
    "guide.sleepTimerContent": "Automatisch stoppen gepland.",
    "guide.snippets": "Audioclips",
    "guide.snippetsContent": "Sla de laatste 30 seconden van een aflevering op. Hernoem, speel af of deel je clips.",
    "guide.voiceEnhancer": "Stemversterker",
    "guide.voiceEnhancerContent": "Verbetert de spraakhelderheid door stemfrequenties te versterken en dynamiek te comprimeren.",
    "premium.snippets": "Audioclips",
    "premium.snippetsDesc": "Sla 30-seconden fragmenten op van je favoriete afleveringen",
    "premium.voiceEnhancer": "Stemversterker",
    "premium.voiceEnhancerDesc": "Verbetert de spraakhelderheid voor een betere luisterervaring",
    "welcome.subtitle": "Podcasts van over de hele wereld",
    "welcome.chooseLanguage": "Kies taal",
    "welcome.start": "Beginnen",
    "welcome.stations": "Duizenden podcasts",
    "welcome.search": "Geavanceerd zoeken",
    "welcome.favExport": "Abonnementen",
    "welcome.genres": "Diverse categorieën",
    "category.Technology": "Technologie",
    "category.Comedy": "Komedie",
    "category.News": "Nieuws",
    "category.True Crime": "True Crime",
    "category.Health": "Gezondheid",
    "category.Business": "Business",
    "category.Science": "Wetenschap",
    "category.Education": "Onderwijs",
    "category.Sports": "Sport",
    "category.Music": "Muziek",
    "category.Society": "Maatschappij",
    "category.History": "Geschiedenis",
    "category.Fiction": "Fictie",
    "category.Horror": "Horror",
    "category.Video Games": "Videogames",
    "category.Arts": "Kunst",
    "category.Food": "Eten",
    "category.Travel": "Reizen",
    "category.Religion": "Religie",
    "category.Kids & Family": "Kinderen & Familie",
    "category.Politics": "Politiek",
    "category.Nature": "Natuur",
    "category.Film & TV": "Film & TV",
    "category.Leisure": "Vrije tijd",
    "category.Self-Improvement": "Zelfverbetering",
    "category.Relationships": "Relaties",
    "download.download": "Downloaden",
    "download.downloaded": "Gedownload",
    "download.downloading": "Downloaden…",
    "download.delete": "Download verwijderen",
    "download.deleted": "Download verwijderd",
    "download.success": "Aflevering gedownload",
    "download.error": "Download mislukt",
    "download.downloads": "Downloads",
    "download.noDownloads": "Geen downloads",
    "download.destination": "Downloadbestemming",
    "download.internal": "Interne opslag",
    "download.external": "Externe opslag (SD)",
    "download.destinationDesc": "Kies waar afleveringen opgeslagen worden",
    "auto.drivingWarning": "Waarschuwing: Blader nooit door menu's tijdens het rijden",
    "auto.drivingWarningSubtitle": "Laat dit over aan de passagier",
    "auto.subscriptions": "Abonnementen",
    "auto.inProgress": "Bezig",
    "sidebar.description": "Ontdek en luister naar duizenden podcasts van over de hele wereld.",
    "sidebar.radioDescription": "Luister naar live radio",
    "footer.createdBy": "Een product van radiosphere.be",
    "footer.poweredBy": "Aangedreven door Podcast Index",
    "player.selectEpisode": "Selecteer een aflevering om te beginnen"
  },
  pt: {
    "nav.home": "Início",
    "nav.search": "Pesquisa",
    "nav.library": "Biblioteca",
    "nav.settings": "Configurações",
    "home.trending": "Tendências",
    "home.yourSubscriptions": "Suas assinaturas",
    "home.noSubscriptions": "Assine podcasts para vê-los aqui",
    "home.exploreByCategory": "Explorar por categoria",
    "home.resumeListening": "Continuar ouvindo",
    "home.latestReleases": "Lançamentos recentes",
    "home.pullToRefresh": "Puxe para atualizar",
    "settings.podcastIndexTitle": "Desenvolvido por Podcast Index",
    "settings.podcastIndexDesc": "Os dados de podcasts são fornecidos pelo Podcast Index, um índice de podcasts aberto e gratuito. Obrigado pelo incrível trabalho!",
    "search.title": "Pesquisa",
    "search.placeholder": "Pesquisar um podcast...",
    "search.noResults": "Nenhum resultado",
    "search.networkError": "Erro de rede.",
    "search.useFilters": "Pesquise um podcast por nome ou tópico",
    "search.resultsCount": "podcasts encontrados",
    "search.languages": "Idiomas",
    "search.categories": "Categorias",
    "search.recentSearches": "Pesquisas recentes",
    "search.relevance": "Relevância",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Biblioteca",
    "favorites.empty": "Sem assinaturas",
    "favorites.emptyDesc": "Assine um podcast para vê-lo aqui",
    "favorites.manage": "Gerenciar assinaturas",
    "favorites.export": "Exportar como CSV",
    "favorites.import": "Importar um CSV",
    "favorites.exported": "Assinaturas exportadas!",
    "favorites.imported": "assinatura(s) importada(s)",
    "favorites.noFavoritesToExport": "Nenhuma assinatura para exportar",
    "favorites.importError": "Erro ao importar",
    "history.title": "Histórico de escuta",
    "history.empty": "Nenhum episódio ouvido",
    "history.resume": "Retomar",
    "history.completed": "Concluído",
    "history.clear": "Limpar histórico",
    "history.inProgress": "Em andamento",
    "library.showMore": "Ver mais",
    "library.showLess": "Ver menos",
    "podcast.subscribe": "Assinar",
    "podcast.subscribed": "Assinado",
    "podcast.episodes": "Episódios",
    "podcast.noEpisodes": "Nenhum episódio disponível",
    "podcast.newEpisodes": "Novos episódios",
    "podcast.newest": "Recentes",
    "podcast.oldest": "Antigos",
    "podcast.loadMore": "Carregar mais episódios",
    "podcast.website": "Site",
    "privateFeed.title": "Adicionar um feed RSS privado",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "URL do feed RSS privado",
    "privateFeed.add": "Adicionar feed",
    "privateFeed.addShort": "Adicionar feed privado",
    "privateFeed.adding": "Adicionando...",
    "privateFeed.added": "Feed privado adicionado",
    "privateFeed.invalidUrl": "URL inválido",
    "privateFeed.fetchError": "Não foi possível obter este feed.",
    "privateFeed.webBlocked": "Por razões de segurança e privacidade, adicionar feeds privados só funciona no aplicativo móvel.",
    "privateFeed.webWarning": "Na web, adicionar feeds privados é bloqueado pelo navegador. Use o aplicativo móvel.",
    "privateFeed.privacyNote": "Seu token permanece estritamente no seu dispositivo. Podcast Sphere nunca envia seu link privado para a nuvem.",
    "privateFeed.refresh": "Atualizar feed",
    "privateFeed.refreshed": "Feed atualizado",
    "privateFeed.privateBadge": "Feed privado",
    "guide.premium": "Adicionar um podcast Premium / Privado",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "Reproduzindo",
    "player.streamError": "Erro de reprodução",
    "player.streamErrorDesc": "Não foi possível reproduzir este episódio.",
    "player.error": "Erro",
    "player.streamUnavailable": "Este episódio não tem URL de áudio.",
    "player.speed": "Velocidade",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "A experiência podcast definitiva",
    "premium.active": "Premium ativo",
    "premium.sleepTimer": "Timer de sono",
    "premium.sleepTimerDesc": "Para a reprodução automaticamente",
    "premium.monthly": "Compra única — €9,99",
    "premium.cancel": "Restaurar compra",
    "premium.disclaimer": "Compra única, acesso vitalício.",
    "premium.comingSoon": "Em breve",
    "premium.passwordPlaceholder": "Código de acesso",
    "premium.unlock": "Desbloquear",
    "premium.lock": "Bloquear Premium",
    "premium.wrongPassword": "Código incorreto",
    "premium.unlocked": "Premium desbloqueado!",
    "premium.restorePurchases": "Restaurar compras",
    "premium.restoreSuccess": "Compras restauradas",
    "premium.restoreNone": "Nenhuma compra",
    "sleepTimer.title": "Timer de sono",
    "sleepTimer.desc": "Para a reprodução automaticamente",
    "sleepTimer.off": "Desativado",
    "sleepTimer.active": "Ativo",
    "sleepTimer.remaining": "Restante",
    "sleepTimer.cancel": "Cancelar",
    "sleepTimer.stopped": "Reprodução pausada automaticamente.",
    "sleepTimer.custom": "Personalizado",
    "sleepTimer.customPlaceholder": "Minutos",
    "sleepTimer.customGo": "Ir",
    "sleepTimer.15": "15 min",
    "sleepTimer.30": "30 min",
    "sleepTimer.45": "45 min",
    "sleepTimer.60": "1 hora",
    "sleepTimer.90": "1h30",
    "sleepTimer.120": "2 horas",
    "exit.title": "Fechar?",
    "exit.description": "Pressione voltar mais uma vez para sair.",
    "exit.confirm": "Sair",
    "common.cancel": "Cancelar",
    "settings.title": "Configurações",
    "settings.language": "Idioma",
    "settings.languageDesc": "Escolha o idioma da interface",
    "settings.dataWarning": "Uso de dados",
    "settings.dataWarningDesc": "Ouvir podcasts consome dados.",
    "settings.dataDisclaimer": "Dados locais",
    "settings.dataDisclaimerDesc": "Seus dados são armazenados localmente.",
    "settings.privacyPolicy": "Política de privacidade",
    "settings.copyright": "Podcast Sphere é um produto da família RadioSphere.be",
    "settings.reopenWelcome": "Reabrir boas-vindas",
    "settings.resetApp": "Redefinir",
    "settings.resetAppDesc": "Excluir tudo",
    "settings.resetConfirm": "Tem certeza?",
    "settings.resetDone": "Redefinido",
    "settings.resetButton": "Excluir tudo",
    "guide.title": "Guia",
    "guide.button": "Guia",
    "guide.home": "Início",
    "guide.homeContent": "Tendências, assinaturas e categorias.",
    "guide.search": "Pesquisa",
    "guide.searchContent": "Pesquise podcasts por nome.",
    "guide.favorites": "Biblioteca",
    "guide.favoritesContent": "Seus podcasts assinados.",
    "guide.settings": "Configurações",
    "guide.settingsContent": "Idioma, timer e preferências.",
    "guide.permissions": "Permissões",
    "guide.permissionsContent": "Notificações para controles na tela de bloqueio.",
    "guide.permissionsReRequest": "Solicitar permissões",
    "guide.permissionsReopenWelcome": "Recarregar boas-vindas",
    "guide.sleepTimer": "Timer de sono",
    "guide.sleepTimerContent": "Parada automática programada.",
    "guide.snippets": "Clipes de áudio",
    "guide.snippetsContent": "Salve os últimos 30 segundos de um episódio. Renomeie, reproduza ou compartilhe seus clipes.",
    "guide.voiceEnhancer": "Voz Clara",
    "guide.voiceEnhancerContent": "Melhora a clareza vocal potencializando frequências de voz e comprimindo a dinâmica.",
    "premium.snippets": "Clipes de áudio",
    "premium.snippetsDesc": "Salve trechos de 30 segundos dos seus episódios favoritos",
    "premium.voiceEnhancer": "Voz Clara",
    "premium.voiceEnhancerDesc": "Melhora a clareza vocal para uma melhor escuta",
    "welcome.subtitle": "Podcasts do mundo inteiro",
    "welcome.chooseLanguage": "Escolha o idioma",
    "welcome.start": "Começar",
    "welcome.stations": "Milhares de podcasts",
    "welcome.search": "Pesquisa avançada",
    "welcome.favExport": "Assinaturas",
    "welcome.genres": "Categorias variadas",
    "category.Technology": "Tecnologia",
    "category.Comedy": "Comédia",
    "category.News": "Notícias",
    "category.True Crime": "True Crime",
    "category.Health": "Saúde",
    "category.Business": "Negócios",
    "category.Science": "Ciência",
    "category.Education": "Educação",
    "category.Sports": "Esportes",
    "category.Music": "Música",
    "category.Society": "Sociedade",
    "category.History": "História",
    "category.Fiction": "Ficção",
    "category.Horror": "Terror",
    "category.Video Games": "Videogames",
    "category.Arts": "Artes",
    "category.Food": "Culinária",
    "category.Travel": "Viagem",
    "category.Religion": "Religião",
    "category.Kids & Family": "Crianças e Família",
    "category.Politics": "Política",
    "category.Nature": "Natureza",
    "category.Film & TV": "Cinema e TV",
    "category.Leisure": "Lazer",
    "category.Self-Improvement": "Autodesenvolvimento",
    "category.Relationships": "Relacionamentos",
    "download.download": "Baixar",
    "download.downloaded": "Baixado",
    "download.downloading": "Baixando…",
    "download.delete": "Excluir download",
    "download.deleted": "Download excluído",
    "download.success": "Episódio baixado",
    "download.error": "Falha no download",
    "download.downloads": "Downloads",
    "download.noDownloads": "Sem downloads",
    "download.destination": "Destino do download",
    "download.internal": "Armazenamento interno",
    "download.external": "Armazenamento externo (SD)",
    "download.destinationDesc": "Escolha onde salvar os episódios",
    "auto.drivingWarning": "Atenção: Nunca navegue nos menus enquanto dirige",
    "auto.drivingWarningSubtitle": "Deixe esta tarefa para o passageiro",
    "auto.subscriptions": "Assinaturas",
    "auto.inProgress": "Em andamento",
    "sidebar.description": "Descubra e ouça milhares de podcasts de todo o mundo.",
    "sidebar.radioDescription": "Ouça rádio ao vivo",
    "footer.createdBy": "Um produto de radiosphere.be",
    "footer.poweredBy": "Desenvolvido por Podcast Index",
    "player.selectEpisode": "Selecione um episódio para começar"
  },
  pl: {
    "nav.home": "Strona główna",
    "nav.search": "Szukaj",
    "nav.library": "Biblioteka",
    "nav.settings": "Ustawienia",
    "home.trending": "Na topie",
    "home.yourSubscriptions": "Twoje subskrypcje",
    "home.noSubscriptions": "Zasubskrybuj podcasty, aby je tu zobaczyć",
    "home.exploreByCategory": "Przeglądaj wg kategorii",
    "home.resumeListening": "Kontynuuj słuchanie",
    "home.latestReleases": "Najnowsze wydania",
    "home.pullToRefresh": "Pociągnij, aby odświeżyć",
    "settings.podcastIndexTitle": "Obsługiwane przez Podcast Index",
    "settings.podcastIndexDesc": "Dane podcastów są dostarczane przez Podcast Index, otwarty i darmowy indeks podcastów. Dziękujemy za ich wspaniałą pracę!",
    "search.title": "Szukaj",
    "search.placeholder": "Szukaj podcastu...",
    "search.noResults": "Brak wyników",
    "search.networkError": "Błąd sieci.",
    "search.useFilters": "Szukaj podcastu po nazwie lub temacie",
    "search.resultsCount": "podcastów znaleziono",
    "search.languages": "Języki",
    "search.categories": "Kategorie",
    "search.recentSearches": "Ostatnie wyszukiwania",
    "search.relevance": "Trafność",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Biblioteka",
    "favorites.empty": "Brak subskrypcji",
    "favorites.emptyDesc": "Zasubskrybuj podcast, aby go tu zobaczyć",
    "favorites.manage": "Zarządzaj subskrypcjami",
    "favorites.export": "Eksportuj jako CSV",
    "favorites.import": "Importuj CSV",
    "favorites.exported": "Subskrypcje wyeksportowane!",
    "favorites.imported": "subskrypcja(e) zaimportowana(e)",
    "favorites.noFavoritesToExport": "Brak subskrypcji do eksportu",
    "favorites.importError": "Błąd podczas importu",
    "history.title": "Historia słuchania",
    "history.empty": "Brak odsłuchanych odcinków",
    "history.resume": "Wznów",
    "history.completed": "Ukończone",
    "history.clear": "Wyczyść historię",
    "history.inProgress": "W toku",
    "library.showMore": "Pokaż więcej",
    "library.showLess": "Pokaż mniej",
    "podcast.subscribe": "Subskrybuj",
    "podcast.subscribed": "Subskrybowano",
    "podcast.episodes": "Odcinki",
    "podcast.noEpisodes": "Brak dostępnych odcinków",
    "podcast.newEpisodes": "Nowe odcinki",
    "podcast.newest": "Najnowsze",
    "podcast.oldest": "Najstarsze",
    "podcast.loadMore": "Załaduj więcej odcinków",
    "podcast.website": "Strona",
    "privateFeed.title": "Dodaj prywatny kanał RSS",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "URL prywatnego kanału RSS",
    "privateFeed.add": "Dodaj kanał",
    "privateFeed.addShort": "Dodaj prywatny kanał",
    "privateFeed.adding": "Dodawanie...",
    "privateFeed.added": "Prywatny kanał dodany",
    "privateFeed.invalidUrl": "Nieprawidłowy URL",
    "privateFeed.fetchError": "Nie można pobrać tego kanału.",
    "privateFeed.webBlocked": "Ze względów bezpieczeństwa i prywatności, dodawanie prywatnych kanałów działa tylko w aplikacji mobilnej.",
    "privateFeed.webWarning": "W przeglądarce dodawanie prywatnych kanałów jest zablokowane. Użyj aplikacji mobilnej.",
    "privateFeed.privacyNote": "Twój token pozostaje wyłącznie na Twoim urządzeniu. Podcast Sphere nigdy nie wysyła Twojego prywatnego linku do chmury.",
    "privateFeed.refresh": "Odśwież kanał",
    "privateFeed.refreshed": "Kanał odświeżony",
    "privateFeed.privateBadge": "Prywatny kanał",
    "guide.premium": "Dodaj Premium / prywatny podcast",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "Teraz odtwarzane",
    "player.streamError": "Błąd odtwarzania",
    "player.streamErrorDesc": "Nie można odtworzyć tego odcinka.",
    "player.error": "Błąd",
    "player.streamUnavailable": "Ten odcinek nie ma URL audio.",
    "player.speed": "Prędkość",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "Najlepsze doświadczenie podcastowe",
    "premium.active": "Premium aktywny",
    "premium.sleepTimer": "Timer snu",
    "premium.sleepTimerDesc": "Automatycznie zatrzymuje odtwarzanie",
    "premium.monthly": "Jednorazowy zakup — 9,99€",
    "premium.cancel": "Przywróć zakup",
    "premium.disclaimer": "Jednorazowy zakup, dożywotni dostęp.",
    "premium.comingSoon": "Wkrótce",
    "premium.passwordPlaceholder": "Kod dostępu",
    "premium.unlock": "Odblokuj",
    "premium.lock": "Zablokuj Premium",
    "premium.wrongPassword": "Błędny kod",
    "premium.unlocked": "Premium odblokowany!",
    "premium.restorePurchases": "Przywróć zakupy",
    "premium.restoreSuccess": "Zakupy przywrócone",
    "premium.restoreNone": "Brak zakupów",
    "sleepTimer.title": "Timer snu",
    "sleepTimer.desc": "Automatycznie zatrzymuje odtwarzanie",
    "sleepTimer.off": "Wyłączony",
    "sleepTimer.active": "Aktywny",
    "sleepTimer.remaining": "Pozostało",
    "sleepTimer.cancel": "Anuluj",
    "sleepTimer.stopped": "Odtwarzanie automatycznie wstrzymane.",
    "sleepTimer.custom": "Niestandardowy",
    "sleepTimer.customPlaceholder": "Minuty",
    "sleepTimer.customGo": "Start",
    "sleepTimer.15": "15 min",
    "sleepTimer.30": "30 min",
    "sleepTimer.45": "45 min",
    "sleepTimer.60": "1 godz.",
    "sleepTimer.90": "1h30",
    "sleepTimer.120": "2 godz.",
    "exit.title": "Zamknąć?",
    "exit.description": "Naciśnij wstecz jeszcze raz, aby wyjść.",
    "exit.confirm": "Wyjdź",
    "common.cancel": "Anuluj",
    "settings.title": "Ustawienia",
    "settings.language": "Język",
    "settings.languageDesc": "Wybierz język interfejsu",
    "settings.dataWarning": "Użycie danych",
    "settings.dataWarningDesc": "Słuchanie podcastów zużywa dane.",
    "settings.dataDisclaimer": "Dane lokalne",
    "settings.dataDisclaimerDesc": "Twoje dane są przechowywane lokalnie.",
    "settings.privacyPolicy": "Polityka prywatności",
    "settings.copyright": "Podcast Sphere jest produktem rodziny RadioSphere.be",
    "settings.reopenWelcome": "Otwórz ponownie stronę powitalną",
    "settings.resetApp": "Zresetuj",
    "settings.resetAppDesc": "Usuń wszystko",
    "settings.resetConfirm": "Czy na pewno?",
    "settings.resetDone": "Zresetowano",
    "settings.resetButton": "Usuń wszystko",
    "guide.title": "Przewodnik",
    "guide.button": "Przewodnik",
    "guide.home": "Strona główna",
    "guide.homeContent": "Trendy, subskrypcje i kategorie.",
    "guide.search": "Szukaj",
    "guide.searchContent": "Szukaj podcastów po nazwie.",
    "guide.favorites": "Biblioteka",
    "guide.favoritesContent": "Twoje subskrybowane podcasty.",
    "guide.settings": "Ustawienia",
    "guide.settingsContent": "Język, timer i preferencje.",
    "guide.permissions": "Uprawnienia",
    "guide.permissionsContent": "Powiadomienia dla kontrolek na ekranie blokady.",
    "guide.permissionsReRequest": "Poproś o uprawnienia",
    "guide.permissionsReopenWelcome": "Przeładuj stronę powitalną",
    "guide.sleepTimer": "Timer snu",
    "guide.sleepTimerContent": "Zaplanowane automatyczne zatrzymanie.",
    "guide.snippets": "Klipy audio",
    "guide.snippetsContent": "Zapisz ostatnie 30 sekund odcinka. Zmień nazwę, odtwórz lub udostępnij swoje klipy.",
    "guide.voiceEnhancer": "Wzmacniacz głosu",
    "guide.voiceEnhancerContent": "Poprawia czytelność mowy poprzez wzmocnienie częstotliwości głosowych i kompresję dynamiki.",
    "premium.snippets": "Klipy audio",
    "premium.snippetsDesc": "Zapisz 30-sekundowe fragmenty ulubionych odcinków",
    "premium.voiceEnhancer": "Wzmacniacz głosu",
    "premium.voiceEnhancerDesc": "Poprawia czytelność mowy dla lepszego słuchania",
    "welcome.subtitle": "Podcasty z całego świata",
    "welcome.chooseLanguage": "Wybierz język",
    "welcome.start": "Rozpocznij",
    "welcome.stations": "Tysiące podcastów",
    "welcome.search": "Zaawansowane wyszukiwanie",
    "welcome.favExport": "Subskrypcje",
    "welcome.genres": "Różnorodne kategorie",
    "category.Technology": "Technologia",
    "category.Comedy": "Komedia",
    "category.News": "Wiadomości",
    "category.True Crime": "True Crime",
    "category.Health": "Zdrowie",
    "category.Business": "Biznes",
    "category.Science": "Nauka",
    "category.Education": "Edukacja",
    "category.Sports": "Sport",
    "category.Music": "Muzyka",
    "category.Society": "Społeczeństwo",
    "category.History": "Historia",
    "category.Fiction": "Fikcja",
    "category.Horror": "Horror",
    "category.Video Games": "Gry wideo",
    "category.Arts": "Sztuka",
    "category.Food": "Kuchnia",
    "category.Travel": "Podróże",
    "category.Religion": "Religia",
    "category.Kids & Family": "Dzieci i Rodzina",
    "category.Politics": "Polityka",
    "category.Nature": "Natura",
    "category.Film & TV": "Film i TV",
    "category.Leisure": "Rozrywka",
    "category.Self-Improvement": "Samorozwój",
    "category.Relationships": "Relacje",
    "download.download": "Pobierz",
    "download.downloaded": "Pobrano",
    "download.downloading": "Pobieranie…",
    "download.delete": "Usuń pobranie",
    "download.deleted": "Pobranie usunięte",
    "download.success": "Odcinek pobrany",
    "download.error": "Pobieranie nie powiodło się",
    "download.downloads": "Pobrania",
    "download.noDownloads": "Brak pobrań",
    "download.destination": "Cel pobierania",
    "download.internal": "Pamięć wewnętrzna",
    "download.external": "Pamięć zewnętrzna (SD)",
    "download.destinationDesc": "Wybierz, gdzie zapisywać odcinki",
    "auto.drivingWarning": "Uwaga: Nigdy nie przeglądaj menu podczas jazdy",
    "auto.drivingWarningSubtitle": "Zostaw to zadanie pasażerowi",
    "auto.subscriptions": "Subskrypcje",
    "auto.inProgress": "W toku",
    "sidebar.description": "Odkrywaj i słuchaj tysięcy podcastów z całego świata.",
    "sidebar.radioDescription": "Słuchaj radia na żywo",
    "footer.createdBy": "Produkt radiosphere.be",
    "footer.poweredBy": "Obsługiwane przez Podcast Index",
    "player.selectEpisode": "Wybierz odcinek, aby rozpocząć"
  },
  zh: {
    "nav.home": "首页",
    "nav.search": "搜索",
    "nav.library": "媒体库",
    "nav.settings": "设置",
    "home.trending": "热门趋势",
    "home.yourSubscriptions": "您的订阅",
    "home.noSubscriptions": "订阅播客以在此处查看",
    "home.exploreByCategory": "按类别浏览",
    "home.resumeListening": "继续收听",
    "home.latestReleases": "最新发布",
    "home.pullToRefresh": "下拉刷新",
    "settings.podcastIndexTitle": "由 Podcast Index 提供支持",
    "settings.podcastIndexDesc": "播客数据由 Podcast Index 提供，这是一个免费开放的播客索引。感谢他们的出色工作！",
    "search.title": "搜索",
    "search.placeholder": "搜索播客...",
    "search.noResults": "无结果",
    "search.networkError": "网络错误。",
    "search.useFilters": "按名称或主题搜索播客",
    "search.resultsCount": "个播客",
    "search.languages": "语言",
    "search.categories": "类别",
    "search.recentSearches": "最近搜索",
    "search.relevance": "相关性",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "媒体库",
    "favorites.empty": "无订阅",
    "favorites.emptyDesc": "订阅播客以在此处查看",
    "favorites.manage": "管理订阅",
    "favorites.export": "导出为 CSV",
    "favorites.import": "导入 CSV",
    "favorites.exported": "订阅已导出！",
    "favorites.imported": "个订阅已导入",
    "favorites.noFavoritesToExport": "没有可导出的订阅",
    "favorites.importError": "导入时出错",
    "history.title": "收听历史",
    "history.empty": "没有已收听的剧集",
    "history.resume": "继续",
    "history.completed": "已完成",
    "history.clear": "清除历史",
    "history.inProgress": "进行中",
    "library.showMore": "显示更多",
    "library.showLess": "收起",
    "podcast.subscribe": "订阅",
    "podcast.subscribed": "已订阅",
    "podcast.episodes": "剧集",
    "podcast.noEpisodes": "暂无剧集",
    "podcast.newEpisodes": "新剧集",
    "podcast.newest": "最新",
    "podcast.oldest": "最旧",
    "podcast.loadMore": "加载更多剧集",
    "podcast.website": "网站",
    "privateFeed.title": "添加私人RSS订阅",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "私人RSS订阅URL",
    "privateFeed.add": "添加订阅",
    "privateFeed.addShort": "添加私人订阅",
    "privateFeed.adding": "添加中...",
    "privateFeed.added": "已添加私人订阅",
    "privateFeed.invalidUrl": "URL无效",
    "privateFeed.fetchError": "无法获取此订阅。",
    "privateFeed.webBlocked": "出于安全和隐私原因,添加私人订阅仅在移动应用中有效。",
    "privateFeed.webWarning": "在网页上,添加私人订阅被浏览器阻止。请使用移动应用。",
    "privateFeed.privacyNote": "您的令牌严格保留在您的设备上。Podcast Sphere绝不会将您的私人链接发送到云端。",
    "privateFeed.refresh": "刷新订阅",
    "privateFeed.refreshed": "订阅已刷新",
    "privateFeed.privateBadge": "私人订阅",
    "guide.premium": "添加高级 / 私人播客",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "正在播放",
    "player.streamError": "播放错误",
    "player.streamErrorDesc": "无法播放此剧集。",
    "player.error": "错误",
    "player.streamUnavailable": "此剧集没有音频链接。",
    "player.speed": "速度",
    "premium.title": "Podcast Sphere 高级版",
    "premium.subtitle": "终极播客体验",
    "premium.active": "高级版已激活",
    "premium.sleepTimer": "睡眠定时器",
    "premium.sleepTimerDesc": "自动停止播放",
    "premium.monthly": "一次性购买 — €9.99",
    "premium.cancel": "恢复购买",
    "premium.disclaimer": "一次性购买，终身使用。",
    "premium.comingSoon": "即将推出",
    "premium.passwordPlaceholder": "输入访问码",
    "premium.unlock": "解锁",
    "premium.lock": "锁定高级版",
    "premium.wrongPassword": "代码错误",
    "premium.unlocked": "高级版已解锁！",
    "premium.restorePurchases": "恢复购买",
    "premium.restoreSuccess": "购买已恢复",
    "premium.restoreNone": "无购买记录",
    "sleepTimer.title": "睡眠定时器",
    "sleepTimer.desc": "自动停止播放",
    "sleepTimer.off": "关闭",
    "sleepTimer.active": "已激活",
    "sleepTimer.remaining": "剩余",
    "sleepTimer.cancel": "取消",
    "sleepTimer.stopped": "播放已自动暂停。",
    "sleepTimer.custom": "自定义",
    "sleepTimer.customPlaceholder": "分钟",
    "sleepTimer.customGo": "开始",
    "sleepTimer.15": "15分钟",
    "sleepTimer.30": "30分钟",
    "sleepTimer.45": "45分钟",
    "sleepTimer.60": "1小时",
    "sleepTimer.90": "1小时30分",
    "sleepTimer.120": "2小时",
    "exit.title": "关闭？",
    "exit.description": "再按一次返回键退出。",
    "exit.confirm": "退出",
    "common.cancel": "取消",
    "settings.title": "设置",
    "settings.language": "语言",
    "settings.languageDesc": "选择界面语言",
    "settings.dataWarning": "数据使用",
    "settings.dataWarningDesc": "收听播客会消耗数据。",
    "settings.dataDisclaimer": "本地数据",
    "settings.dataDisclaimerDesc": "您的数据存储在本地设备上。",
    "settings.privacyPolicy": "隐私政策",
    "settings.copyright": "Podcast Sphere 是 RadioSphere.be 家族的产品",
    "settings.reopenWelcome": "重新打开欢迎页",
    "settings.resetApp": "重置",
    "settings.resetAppDesc": "删除所有数据",
    "settings.resetConfirm": "确定吗？",
    "settings.resetDone": "已重置",
    "settings.resetButton": "全部删除",
    "guide.title": "使用指南",
    "guide.button": "使用指南",
    "guide.home": "首页",
    "guide.homeContent": "热门趋势、订阅和类别。",
    "guide.search": "搜索",
    "guide.searchContent": "按名称搜索播客。",
    "guide.favorites": "媒体库",
    "guide.favoritesContent": "您订阅的播客。",
    "guide.settings": "设置",
    "guide.settingsContent": "语言、定时器和偏好设置。",
    "guide.permissions": "权限",
    "guide.permissionsContent": "通知用于锁屏播放控制。",
    "guide.permissionsReRequest": "重新请求权限",
    "guide.permissionsReopenWelcome": "重新加载欢迎页",
    "guide.sleepTimer": "睡眠定时器",
    "guide.sleepTimerContent": "定时自动停止。",
    "guide.snippets": "音频剪辑",
    "guide.snippetsContent": "保存剧集的最后30秒。重命名、重播或分享您的剪辑。",
    "guide.voiceEnhancer": "语音增强",
    "guide.voiceEnhancerContent": "通过增强语音频率和压缩动态来提高语音清晰度。",
    "premium.snippets": "音频剪辑",
    "premium.snippetsDesc": "保存喜爱剧集的30秒片段",
    "premium.voiceEnhancer": "语音增强",
    "premium.voiceEnhancerDesc": "提高语音清晰度以获得更好的收听体验",
    "welcome.subtitle": "全球播客尽在掌中",
    "welcome.chooseLanguage": "选择语言",
    "welcome.start": "开始",
    "welcome.stations": "数千个播客",
    "welcome.search": "高级搜索",
    "welcome.favExport": "订阅",
    "welcome.genres": "多种类别",
    "category.Technology": "科技",
    "category.Comedy": "喜剧",
    "category.News": "新闻",
    "category.True Crime": "真实犯罪",
    "category.Health": "健康",
    "category.Business": "商业",
    "category.Science": "科学",
    "category.Education": "教育",
    "category.Sports": "体育",
    "category.Music": "音乐",
    "category.Society": "社会",
    "category.History": "历史",
    "category.Fiction": "小说",
    "category.Horror": "恐怖",
    "category.Video Games": "电子游戏",
    "category.Arts": "艺术",
    "category.Food": "美食",
    "category.Travel": "旅行",
    "category.Religion": "宗教",
    "category.Kids & Family": "儿童与家庭",
    "category.Politics": "政治",
    "category.Nature": "自然",
    "category.Film & TV": "电影与电视",
    "category.Leisure": "休闲",
    "category.Self-Improvement": "自我提升",
    "category.Relationships": "人际关系",
    "download.download": "下载",
    "download.downloaded": "已下载",
    "download.downloading": "下载中…",
    "download.delete": "删除下载",
    "download.deleted": "下载已删除",
    "download.success": "剧集已下载",
    "download.error": "下载失败",
    "download.downloads": "下载",
    "download.noDownloads": "暂无下载",
    "download.destination": "下载位置",
    "download.internal": "内部存储",
    "download.external": "外部存储 (SD)",
    "download.destinationDesc": "选择保存剧集的位置",
    "auto.drivingWarning": "警告：驾驶时请勿浏览菜单",
    "auto.drivingWarningSubtitle": "请让乘客操作",
    "auto.subscriptions": "订阅",
    "auto.inProgress": "进行中",
    "sidebar.description": "发现并收听来自世界各地的数千个播客。",
    "sidebar.radioDescription": "收听直播电台",
    "footer.createdBy": "radiosphere.be 出品",
    "footer.poweredBy": "由 Podcast Index 提供支持",
    "player.selectEpisode": "选择一个剧集开始收听"
  },
  tr: {
    "nav.home": "Ana Sayfa",
    "nav.search": "Ara",
    "nav.library": "Kütüphane",
    "nav.settings": "Ayarlar",
    "home.trending": "Trendler",
    "home.yourSubscriptions": "Abonelikleriniz",
    "home.noSubscriptions": "Burada görmek için podcast'lere abone olun",
    "home.exploreByCategory": "Kategoriye göre keşfet",
    "home.resumeListening": "Dinlemeye devam et",
    "home.latestReleases": "Son Yayınlar",
    "home.pullToRefresh": "Yenilemek için çekin",
    "settings.podcastIndexTitle": "Podcast Index tarafından desteklenmektedir",
    "settings.podcastIndexDesc": "Podcast verileri, ücretsiz ve açık bir podcast dizini olan Podcast Index tarafından sağlanmaktadır. Harika çalışmaları için teşekkürler!",
    "search.title": "Ara",
    "search.placeholder": "Podcast ara...",
    "search.noResults": "Sonuç bulunamadı",
    "search.networkError": "Ağ hatası.",
    "search.useFilters": "Ada veya konuya göre podcast arayın",
    "search.resultsCount": "podcast bulundu",
    "search.languages": "Diller",
    "search.categories": "Kategoriler",
    "search.recentSearches": "Son aramalar",
    "search.relevance": "Alaka",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Kütüphane",
    "favorites.empty": "Abonelik yok",
    "favorites.emptyDesc": "Burada görmek için bir podcast'e abone olun",
    "favorites.manage": "Abonelikleri yönet",
    "favorites.export": "CSV olarak dışa aktar",
    "favorites.import": "CSV içe aktar",
    "favorites.exported": "Abonelikler dışa aktarıldı!",
    "favorites.imported": "abonelik içe aktarıldı",
    "favorites.noFavoritesToExport": "Dışa aktarılacak abonelik yok",
    "favorites.importError": "İçe aktarma hatası",
    "history.title": "Dinleme Geçmişi",
    "history.empty": "Dinlenen bölüm yok",
    "history.resume": "Devam Et",
    "history.completed": "Tamamlandı",
    "history.clear": "Geçmişi temizle",
    "history.inProgress": "Devam ediyor",
    "library.showMore": "Daha fazla göster",
    "library.showLess": "Daha az göster",
    "podcast.subscribe": "Abone Ol",
    "podcast.subscribed": "Abone",
    "podcast.episodes": "Bölümler",
    "podcast.noEpisodes": "Mevcut bölüm yok",
    "podcast.newEpisodes": "Yeni bölümler",
    "podcast.newest": "En yeni",
    "podcast.oldest": "En eski",
    "podcast.loadMore": "Daha fazla bölüm yükle",
    "podcast.website": "Web sitesi",
    "privateFeed.title": "Özel RSS akışı ekle",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "Özel RSS akışı URL'si",
    "privateFeed.add": "Akış ekle",
    "privateFeed.addShort": "Özel akış ekle",
    "privateFeed.adding": "Ekleniyor...",
    "privateFeed.added": "Özel akış eklendi",
    "privateFeed.invalidUrl": "Geçersiz URL",
    "privateFeed.fetchError": "Bu akış alınamadı.",
    "privateFeed.webBlocked": "Güvenlik ve gizlilik nedeniyle, özel akış ekleme yalnızca mobil uygulamada çalışır.",
    "privateFeed.webWarning": "Web'de özel akış ekleme tarayıcınız tarafından engellendi. Mobil uygulamayı kullanın.",
    "privateFeed.privacyNote": "Token'ınız kesinlikle cihazınızda kalır. Podcast Sphere özel bağlantınızı asla buluta göndermez.",
    "privateFeed.refresh": "Akışı yenile",
    "privateFeed.refreshed": "Akış yenilendi",
    "privateFeed.privateBadge": "Özel akış",
    "guide.premium": "Premium / Özel podcast ekle",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "Şimdi çalıyor",
    "player.streamError": "Oynatma hatası",
    "player.streamErrorDesc": "Bu bölüm oynatılamadı.",
    "player.error": "Hata",
    "player.streamUnavailable": "Bu bölümün ses URL'si yok.",
    "player.speed": "Hız",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "En iyi podcast deneyimi",
    "premium.active": "Premium aktif",
    "premium.sleepTimer": "Uyku Zamanlayıcı",
    "premium.sleepTimerDesc": "Oynatmayı otomatik olarak durdurur",
    "premium.monthly": "Tek seferlik satın alma — €9,99",
    "premium.cancel": "Satın almayı geri yükle",
    "premium.disclaimer": "Tek seferlik satın alma, ömür boyu erişim.",
    "premium.comingSoon": "Yakında",
    "premium.passwordPlaceholder": "Erişim kodu",
    "premium.unlock": "Kilidi Aç",
    "premium.lock": "Premium'u Kilitle",
    "premium.wrongPassword": "Yanlış kod",
    "premium.unlocked": "Premium açıldı!",
    "premium.restorePurchases": "Satın almaları geri yükle",
    "premium.restoreSuccess": "Satın almalar geri yüklendi",
    "premium.restoreNone": "Satın alma yok",
    "sleepTimer.title": "Uyku Zamanlayıcı",
    "sleepTimer.desc": "Otomatik olarak durdurur",
    "sleepTimer.off": "Kapalı",
    "sleepTimer.active": "Aktif",
    "sleepTimer.remaining": "Kalan",
    "sleepTimer.cancel": "İptal",
    "sleepTimer.stopped": "Oynatma otomatik olarak duraklatıldı.",
    "sleepTimer.custom": "Özel",
    "sleepTimer.customPlaceholder": "Dakika",
    "sleepTimer.customGo": "Başla",
    "sleepTimer.15": "15 dk",
    "sleepTimer.30": "30 dk",
    "sleepTimer.45": "45 dk",
    "sleepTimer.60": "1 saat",
    "sleepTimer.90": "1s30",
    "sleepTimer.120": "2 saat",
    "exit.title": "Kapatılsın mı?",
    "exit.description": "Çıkmak için geri tuşuna bir kez daha basın.",
    "exit.confirm": "Çıkış",
    "common.cancel": "İptal",
    "settings.title": "Ayarlar",
    "settings.language": "Dil",
    "settings.languageDesc": "Arayüz dilini seçin",
    "settings.dataWarning": "Veri kullanımı",
    "settings.dataWarningDesc": "Podcast dinlemek veri tüketir.",
    "settings.dataDisclaimer": "Yerel veri",
    "settings.dataDisclaimerDesc": "Verileriniz yerel olarak saklanır.",
    "settings.privacyPolicy": "Gizlilik Politikası",
    "settings.copyright": "Podcast Sphere, RadioSphere.be ailesinin bir ürünüdür",
    "settings.reopenWelcome": "Karşılama sayfasını yeniden aç",
    "settings.resetApp": "Sıfırla",
    "settings.resetAppDesc": "Her şeyi sil",
    "settings.resetConfirm": "Emin misiniz?",
    "settings.resetDone": "Sıfırlandı",
    "settings.resetButton": "Her şeyi sil",
    "guide.title": "Kullanım Kılavuzu",
    "guide.button": "Kullanım Kılavuzu",
    "guide.home": "Ana Sayfa",
    "guide.homeContent": "Trendler, abonelikler ve kategoriler.",
    "guide.search": "Ara",
    "guide.searchContent": "Ada göre podcast arayın.",
    "guide.favorites": "Kütüphane",
    "guide.favoritesContent": "Abone olduğunuz podcast'ler.",
    "guide.settings": "Ayarlar",
    "guide.settingsContent": "Dil, zamanlayıcı ve tercihler.",
    "guide.permissions": "İzinler",
    "guide.permissionsContent": "Kilit ekranı kontrolleri için bildirimler.",
    "guide.permissionsReRequest": "İzinleri yeniden iste",
    "guide.permissionsReopenWelcome": "Karşılamayı yeniden yükle",
    "guide.sleepTimer": "Uyku Zamanlayıcı",
    "guide.sleepTimerContent": "Programlanmış otomatik durdurma.",
    "guide.snippets": "Ses Klipleri",
    "guide.snippetsContent": "Bir bölümün son 30 saniyesini kaydedin. Kliplerinizi yeniden adlandırın, dinleyin veya paylaşın.",
    "guide.voiceEnhancer": "Ses Geliştirici",
    "guide.voiceEnhancerContent": "Ses frekanslarını güçlendirerek ve dinamikleri sıkıştırarak ses netliğini artırır.",
    "premium.snippets": "Ses Klipleri",
    "premium.snippetsDesc": "Favori bölümlerinizden 30 saniyelik parçalar kaydedin",
    "premium.voiceEnhancer": "Ses Geliştirici",
    "premium.voiceEnhancerDesc": "Daha iyi bir dinleme deneyimi için ses netliğini artırır",
    "welcome.subtitle": "Dünyanın dört bir yanından podcast'ler",
    "welcome.chooseLanguage": "Dil seçin",
    "welcome.start": "Başla",
    "welcome.stations": "Binlerce podcast",
    "welcome.search": "Gelişmiş arama",
    "welcome.favExport": "Abonelikler",
    "welcome.genres": "Çeşitli kategoriler",
    "category.Technology": "Teknoloji",
    "category.Comedy": "Komedi",
    "category.News": "Haberler",
    "category.True Crime": "Gerçek Suç",
    "category.Health": "Sağlık",
    "category.Business": "İş Dünyası",
    "category.Science": "Bilim",
    "category.Education": "Eğitim",
    "category.Sports": "Spor",
    "category.Music": "Müzik",
    "category.Society": "Toplum",
    "category.History": "Tarih",
    "category.Fiction": "Kurgu",
    "category.Horror": "Korku",
    "category.Video Games": "Video Oyunları",
    "category.Arts": "Sanat",
    "category.Food": "Yemek",
    "category.Travel": "Seyahat",
    "category.Religion": "Din",
    "category.Kids & Family": "Çocuklar ve Aile",
    "category.Politics": "Politika",
    "category.Nature": "Doğa",
    "category.Film & TV": "Film ve TV",
    "category.Leisure": "Eğlence",
    "category.Self-Improvement": "Kişisel Gelişim",
    "category.Relationships": "İlişkiler",
    "download.download": "İndir",
    "download.downloaded": "İndirildi",
    "download.downloading": "İndiriliyor…",
    "download.delete": "İndirmeyi sil",
    "download.deleted": "İndirme silindi",
    "download.success": "Bölüm indirildi",
    "download.error": "İndirme başarısız",
    "download.downloads": "İndirmeler",
    "download.noDownloads": "İndirme yok",
    "download.destination": "İndirme hedefi",
    "download.internal": "Dahili depolama",
    "download.external": "Harici depolama (SD)",
    "download.destinationDesc": "Bölümlerin kaydedileceği yeri seçin",
    "auto.drivingWarning": "Uyarı: Araç kullanırken menülere göz atmayın",
    "auto.drivingWarningSubtitle": "Bu görevi yolcuya bırakın",
    "auto.subscriptions": "Abonelikler",
    "auto.inProgress": "Devam ediyor",
    "sidebar.description": "Dünyanın dört bir yanından binlerce podcast keşfedin ve dinleyin.",
    "sidebar.radioDescription": "Canlı radyo dinle",
    "footer.createdBy": "radiosphere.be ürünüdür",
    "footer.poweredBy": "Podcast Index tarafından desteklenmektedir",
    "player.selectEpisode": "Dinlemeye başlamak için bir bölüm seçin"
  },
  ru: {
    "nav.home": "Главная",
    "nav.search": "Поиск",
    "nav.library": "Библиотека",
    "nav.settings": "Настройки",
    "home.trending": "В тренде",
    "home.yourSubscriptions": "Ваши подписки",
    "home.noSubscriptions": "Подпишитесь на подкасты, чтобы видеть их здесь",
    "home.exploreByCategory": "Обзор по категориям",
    "home.resumeListening": "Продолжить прослушивание",
    "home.latestReleases": "Последние выпуски",
    "home.pullToRefresh": "Потяните для обновления",
    "settings.podcastIndexTitle": "При поддержке Podcast Index",
    "settings.podcastIndexDesc": "Данные подкастов предоставлены Podcast Index — бесплатным и открытым индексом подкастов. Спасибо за их невероятную работу!",
    "search.title": "Поиск",
    "search.placeholder": "Найти подкаст...",
    "search.noResults": "Ничего не найдено",
    "search.networkError": "Ошибка сети.",
    "search.useFilters": "Ищите подкаст по названию или теме",
    "search.resultsCount": "подкастов найдено",
    "search.languages": "Языки",
    "search.categories": "Категории",
    "search.recentSearches": "Недавние поиски",
    "search.relevance": "Релевантность",
    "search.sortAZ": "А → Я",
    "search.sortZA": "Я → А",
    "favorites.title": "Библиотека",
    "favorites.empty": "Нет подписок",
    "favorites.emptyDesc": "Подпишитесь на подкаст, чтобы видеть его здесь",
    "favorites.manage": "Управление подписками",
    "favorites.export": "Экспорт в CSV",
    "favorites.import": "Импорт CSV",
    "favorites.exported": "Подписки экспортированы!",
    "favorites.imported": "подписка(и) импортирована(ы)",
    "favorites.noFavoritesToExport": "Нет подписок для экспорта",
    "favorites.importError": "Ошибка при импорте",
    "history.title": "История прослушивания",
    "history.empty": "Нет прослушанных выпусков",
    "history.resume": "Продолжить",
    "history.completed": "Завершено",
    "history.clear": "Очистить историю",
    "history.inProgress": "В процессе",
    "library.showMore": "Показать ещё",
    "library.showLess": "Свернуть",
    "podcast.subscribe": "Подписаться",
    "podcast.subscribed": "Подписан",
    "podcast.episodes": "Выпуски",
    "podcast.noEpisodes": "Нет доступных выпусков",
    "podcast.newEpisodes": "Новые выпуски",
    "podcast.newest": "Новые",
    "podcast.oldest": "Старые",
    "podcast.loadMore": "Загрузить ещё",
    "podcast.website": "Сайт",
    "privateFeed.title": "Добавить приватный RSS-канал",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "URL приватного RSS-канала",
    "privateFeed.add": "Добавить канал",
    "privateFeed.addShort": "Добавить приватный канал",
    "privateFeed.adding": "Добавление...",
    "privateFeed.added": "Приватный канал добавлен",
    "privateFeed.invalidUrl": "Неверный URL",
    "privateFeed.fetchError": "Не удалось получить этот канал.",
    "privateFeed.webBlocked": "По соображениям безопасности и конфиденциальности добавление приватных каналов работает только в мобильном приложении.",
    "privateFeed.webWarning": "В вебе добавление приватных каналов заблокировано браузером. Используйте мобильное приложение.",
    "privateFeed.privacyNote": "Ваш токен остаётся строго на вашем устройстве. Podcast Sphere никогда не отправляет вашу приватную ссылку в облако.",
    "privateFeed.refresh": "Обновить канал",
    "privateFeed.refreshed": "Канал обновлён",
    "privateFeed.privateBadge": "Приватный канал",
    "guide.premium": "Добавить Premium / приватный подкаст",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "Сейчас играет",
    "player.streamError": "Ошибка воспроизведения",
    "player.streamErrorDesc": "Невозможно воспроизвести этот выпуск.",
    "player.error": "Ошибка",
    "player.streamUnavailable": "У этого выпуска нет аудио-ссылки.",
    "player.speed": "Скорость",
    "premium.title": "Podcast Sphere Премиум",
    "premium.subtitle": "Лучший опыт подкастов",
    "premium.active": "Премиум активен",
    "premium.sleepTimer": "Таймер сна",
    "premium.sleepTimerDesc": "Автоматическая остановка воспроизведения",
    "premium.monthly": "Разовая покупка — €9,99",
    "premium.cancel": "Восстановить покупку",
    "premium.disclaimer": "Разовая покупка, пожизненный доступ.",
    "premium.comingSoon": "Скоро",
    "premium.passwordPlaceholder": "Код доступа",
    "premium.unlock": "Разблокировать",
    "premium.lock": "Заблокировать Премиум",
    "premium.wrongPassword": "Неверный код",
    "premium.unlocked": "Премиум разблокирован!",
    "premium.restorePurchases": "Восстановить покупки",
    "premium.restoreSuccess": "Покупки восстановлены",
    "premium.restoreNone": "Нет покупок",
    "sleepTimer.title": "Таймер сна",
    "sleepTimer.desc": "Автоматическая остановка",
    "sleepTimer.off": "Выкл.",
    "sleepTimer.active": "Активен",
    "sleepTimer.remaining": "Осталось",
    "sleepTimer.cancel": "Отмена",
    "sleepTimer.stopped": "Воспроизведение автоматически приостановлено.",
    "sleepTimer.custom": "Свой",
    "sleepTimer.customPlaceholder": "Минуты",
    "sleepTimer.customGo": "Пуск",
    "sleepTimer.15": "15 мин",
    "sleepTimer.30": "30 мин",
    "sleepTimer.45": "45 мин",
    "sleepTimer.60": "1 час",
    "sleepTimer.90": "1ч30",
    "sleepTimer.120": "2 часа",
    "exit.title": "Закрыть?",
    "exit.description": "Нажмите назад ещё раз для выхода.",
    "exit.confirm": "Выход",
    "common.cancel": "Отмена",
    "settings.title": "Настройки",
    "settings.language": "Язык",
    "settings.languageDesc": "Выберите язык интерфейса",
    "settings.dataWarning": "Использование данных",
    "settings.dataWarningDesc": "Прослушивание подкастов потребляет данные.",
    "settings.dataDisclaimer": "Локальные данные",
    "settings.dataDisclaimerDesc": "Ваши данные хранятся локально.",
    "settings.privacyPolicy": "Политика конфиденциальности",
    "settings.copyright": "Podcast Sphere — продукт семьи RadioSphere.be",
    "settings.reopenWelcome": "Снова открыть приветствие",
    "settings.resetApp": "Сброс",
    "settings.resetAppDesc": "Удалить всё",
    "settings.resetConfirm": "Вы уверены?",
    "settings.resetDone": "Сброшено",
    "settings.resetButton": "Удалить всё",
    "guide.title": "Руководство",
    "guide.button": "Руководство",
    "guide.home": "Главная",
    "guide.homeContent": "Тренды, подписки и категории.",
    "guide.search": "Поиск",
    "guide.searchContent": "Поиск подкастов по названию.",
    "guide.favorites": "Библиотека",
    "guide.favoritesContent": "Ваши подписки на подкасты.",
    "guide.settings": "Настройки",
    "guide.settingsContent": "Язык, таймер и настройки.",
    "guide.permissions": "Разрешения",
    "guide.permissionsContent": "Уведомления для управления на экране блокировки.",
    "guide.permissionsReRequest": "Запросить разрешения",
    "guide.permissionsReopenWelcome": "Перезагрузить приветствие",
    "guide.sleepTimer": "Таймер сна",
    "guide.sleepTimerContent": "Запланированная автоостановка.",
    "guide.snippets": "Аудиоклипы",
    "guide.snippetsContent": "Сохраняйте последние 30 секунд выпуска. Переименовывайте, воспроизводите или делитесь клипами.",
    "guide.voiceEnhancer": "Улучшение голоса",
    "guide.voiceEnhancerContent": "Улучшает чёткость голоса путём усиления голосовых частот и сжатия динамики.",
    "premium.snippets": "Аудиоклипы",
    "premium.snippetsDesc": "Сохраняйте 30-секундные фрагменты любимых выпусков",
    "premium.voiceEnhancer": "Улучшение голоса",
    "premium.voiceEnhancerDesc": "Улучшает чёткость голоса для лучшего прослушивания",
    "welcome.subtitle": "Подкасты со всего мира",
    "welcome.chooseLanguage": "Выберите язык",
    "welcome.start": "Начать",
    "welcome.stations": "Тысячи подкастов",
    "welcome.search": "Расширенный поиск",
    "welcome.favExport": "Подписки",
    "welcome.genres": "Разнообразные категории",
    "category.Technology": "Технологии",
    "category.Comedy": "Комедия",
    "category.News": "Новости",
    "category.True Crime": "Криминал",
    "category.Health": "Здоровье",
    "category.Business": "Бизнес",
    "category.Science": "Наука",
    "category.Education": "Образование",
    "category.Sports": "Спорт",
    "category.Music": "Музыка",
    "category.Society": "Общество",
    "category.History": "История",
    "category.Fiction": "Художественная литература",
    "category.Horror": "Ужасы",
    "category.Video Games": "Видеоигры",
    "category.Arts": "Искусство",
    "category.Food": "Еда",
    "category.Travel": "Путешествия",
    "category.Religion": "Религия",
    "category.Kids & Family": "Дети и Семья",
    "category.Politics": "Политика",
    "category.Nature": "Природа",
    "category.Film & TV": "Кино и ТВ",
    "category.Leisure": "Досуг",
    "category.Self-Improvement": "Саморазвитие",
    "category.Relationships": "Отношения",
    "download.download": "Скачать",
    "download.downloaded": "Скачано",
    "download.downloading": "Загрузка…",
    "download.delete": "Удалить загрузку",
    "download.deleted": "Загрузка удалена",
    "download.success": "Выпуск скачан",
    "download.error": "Ошибка загрузки",
    "download.downloads": "Загрузки",
    "download.noDownloads": "Нет загрузок",
    "download.destination": "Место загрузки",
    "download.internal": "Внутренняя память",
    "download.external": "Внешняя память (SD)",
    "download.destinationDesc": "Выберите место сохранения выпусков",
    "auto.drivingWarning": "Внимание: Не просматривайте меню за рулём",
    "auto.drivingWarningSubtitle": "Оставьте эту задачу пассажиру",
    "auto.subscriptions": "Подписки",
    "auto.inProgress": "В процессе",
    "sidebar.description": "Откройте для себя и слушайте тысячи подкастов со всего мира.",
    "sidebar.radioDescription": "Слушайте радио в прямом эфире",
    "footer.createdBy": "Продукт radiosphere.be",
    "footer.poweredBy": "При поддержке Podcast Index",
    "player.selectEpisode": "Выберите выпуск для прослушивания"
  },
  id: {
    "nav.home": "Beranda",
    "nav.search": "Cari",
    "nav.library": "Perpustakaan",
    "nav.settings": "Pengaturan",
    "home.trending": "Tren",
    "home.yourSubscriptions": "Langganan Anda",
    "home.noSubscriptions": "Berlangganan podcast untuk melihatnya di sini",
    "home.exploreByCategory": "Jelajahi berdasarkan kategori",
    "home.resumeListening": "Lanjutkan mendengarkan",
    "home.latestReleases": "Rilis Terbaru",
    "home.pullToRefresh": "Tarik untuk menyegarkan",
    "settings.podcastIndexTitle": "Didukung oleh Podcast Index",
    "settings.podcastIndexDesc": "Data podcast disediakan oleh Podcast Index, indeks podcast gratis dan terbuka. Terima kasih atas kerja luar biasa mereka!",
    "search.title": "Cari",
    "search.placeholder": "Cari podcast...",
    "search.noResults": "Tidak ada hasil",
    "search.networkError": "Kesalahan jaringan.",
    "search.useFilters": "Cari podcast berdasarkan nama atau topik",
    "search.resultsCount": "podcast ditemukan",
    "search.languages": "Bahasa",
    "search.categories": "Kategori",
    "search.recentSearches": "Pencarian terbaru",
    "search.relevance": "Relevansi",
    "search.sortAZ": "A → Z",
    "search.sortZA": "Z → A",
    "favorites.title": "Perpustakaan",
    "favorites.empty": "Tidak ada langganan",
    "favorites.emptyDesc": "Berlangganan podcast untuk melihatnya di sini",
    "favorites.manage": "Kelola langganan",
    "favorites.export": "Ekspor sebagai CSV",
    "favorites.import": "Impor CSV",
    "favorites.exported": "Langganan diekspor!",
    "favorites.imported": "langganan diimpor",
    "favorites.noFavoritesToExport": "Tidak ada langganan untuk diekspor",
    "favorites.importError": "Kesalahan saat mengimpor",
    "history.title": "Riwayat Mendengarkan",
    "history.empty": "Tidak ada episode yang didengarkan",
    "history.resume": "Lanjutkan",
    "history.completed": "Selesai",
    "history.clear": "Hapus riwayat",
    "history.inProgress": "Sedang berlangsung",
    "library.showMore": "Tampilkan lebih",
    "library.showLess": "Tampilkan kurang",
    "podcast.subscribe": "Berlangganan",
    "podcast.subscribed": "Berlangganan",
    "podcast.episodes": "Episode",
    "podcast.noEpisodes": "Tidak ada episode tersedia",
    "podcast.newEpisodes": "Episode baru",
    "podcast.newest": "Terbaru",
    "podcast.oldest": "Terlama",
    "podcast.loadMore": "Muat lebih banyak episode",
    "podcast.website": "Situs web",
    "privateFeed.title": "Tambahkan feed RSS pribadi",
    "privateFeed.subtitle": "Premium / Patreon / Supercast / Substack / Memberful",
    "privateFeed.urlLabel": "URL feed RSS pribadi",
    "privateFeed.add": "Tambah feed",
    "privateFeed.addShort": "Tambah feed pribadi",
    "privateFeed.adding": "Menambahkan...",
    "privateFeed.added": "Feed pribadi ditambahkan",
    "privateFeed.invalidUrl": "URL tidak valid",
    "privateFeed.fetchError": "Tidak dapat mengambil feed ini.",
    "privateFeed.webBlocked": "Untuk alasan keamanan dan privasi, menambahkan feed pribadi hanya berfungsi di aplikasi seluler.",
    "privateFeed.webWarning": "Di web, penambahan feed pribadi diblokir oleh browser. Gunakan aplikasi seluler.",
    "privateFeed.privacyNote": "Token Anda tetap sepenuhnya di perangkat Anda. Podcast Sphere tidak pernah mengirim tautan pribadi Anda ke cloud.",
    "privateFeed.refresh": "Segarkan feed",
    "privateFeed.refreshed": "Feed disegarkan",
    "privateFeed.privateBadge": "Feed pribadi",
    "guide.premium": "Tambahkan podcast Premium / Pribadi",
    "guide.premiumContent": "You support your favorite creators and have a private audio feed? Podcast Sphere reads your content directly without sending anything to the cloud. Go to your Subscriptions, tap the [+] button, and paste your secret link.\n\nHere is how to find your link by platform:\n\n• Patreon: go to the creator page > 'My membership' tab > tap 'Get audio RSS link' and copy it.\n\n• Supercast: open the email you received when subscribing, then choose 'Copy manual RSS link'.\n\n• Substack: on the podcast page, tap 'Listen on', then select 'Copy link' in the RSS section.\n\n• Memberful: in your member account, find the 'Podcasts' section and copy the URL of your personal feed.",
    "player.nowPlaying": "Sedang diputar",
    "player.streamError": "Kesalahan pemutaran",
    "player.streamErrorDesc": "Tidak dapat memutar episode ini.",
    "player.error": "Kesalahan",
    "player.streamUnavailable": "Episode ini tidak memiliki URL audio.",
    "player.speed": "Kecepatan",
    "premium.title": "Podcast Sphere Premium",
    "premium.subtitle": "Pengalaman podcast terbaik",
    "premium.active": "Premium aktif",
    "premium.sleepTimer": "Timer Tidur",
    "premium.sleepTimerDesc": "Menghentikan pemutaran secara otomatis",
    "premium.monthly": "Pembelian sekali — €9,99",
    "premium.cancel": "Pulihkan pembelian",
    "premium.disclaimer": "Pembelian sekali, akses seumur hidup.",
    "premium.comingSoon": "Segera hadir",
    "premium.passwordPlaceholder": "Kode akses",
    "premium.unlock": "Buka Kunci",
    "premium.lock": "Kunci Premium",
    "premium.wrongPassword": "Kode salah",
    "premium.unlocked": "Premium terbuka!",
    "premium.restorePurchases": "Pulihkan pembelian",
    "premium.restoreSuccess": "Pembelian dipulihkan",
    "premium.restoreNone": "Tidak ada pembelian",
    "sleepTimer.title": "Timer Tidur",
    "sleepTimer.desc": "Berhenti otomatis setelah waktu tertentu",
    "sleepTimer.off": "Mati",
    "sleepTimer.active": "Aktif",
    "sleepTimer.remaining": "Tersisa",
    "sleepTimer.cancel": "Batalkan",
    "sleepTimer.stopped": "Pemutaran otomatis dijeda.",
    "sleepTimer.custom": "Kustom",
    "sleepTimer.customPlaceholder": "Menit",
    "sleepTimer.customGo": "Mulai",
    "sleepTimer.15": "15 mnt",
    "sleepTimer.30": "30 mnt",
    "sleepTimer.45": "45 mnt",
    "sleepTimer.60": "1 jam",
    "sleepTimer.90": "1j30",
    "sleepTimer.120": "2 jam",
    "exit.title": "Tutup?",
    "exit.description": "Tekan kembali sekali lagi untuk keluar.",
    "exit.confirm": "Keluar",
    "common.cancel": "Batal",
    "settings.title": "Pengaturan",
    "settings.language": "Bahasa",
    "settings.languageDesc": "Pilih bahasa antarmuka",
    "settings.dataWarning": "Penggunaan data",
    "settings.dataWarningDesc": "Mendengarkan podcast menggunakan data.",
    "settings.dataDisclaimer": "Data lokal",
    "settings.dataDisclaimerDesc": "Data Anda disimpan secara lokal.",
    "settings.privacyPolicy": "Kebijakan Privasi",
    "settings.copyright": "Podcast Sphere adalah produk dari keluarga RadioSphere.be",
    "settings.reopenWelcome": "Buka kembali halaman selamat datang",
    "settings.resetApp": "Reset",
    "settings.resetAppDesc": "Hapus semuanya",
    "settings.resetConfirm": "Apakah Anda yakin?",
    "settings.resetDone": "Direset",
    "settings.resetButton": "Hapus semuanya",
    "guide.title": "Panduan",
    "guide.button": "Panduan",
    "guide.home": "Beranda",
    "guide.homeContent": "Tren, langganan, dan kategori.",
    "guide.search": "Cari",
    "guide.searchContent": "Cari podcast berdasarkan nama.",
    "guide.favorites": "Perpustakaan",
    "guide.favoritesContent": "Podcast yang Anda langgani.",
    "guide.settings": "Pengaturan",
    "guide.settingsContent": "Bahasa, timer, dan preferensi.",
    "guide.permissions": "Izin",
    "guide.permissionsContent": "Notifikasi untuk kontrol layar kunci.",
    "guide.permissionsReRequest": "Minta ulang izin",
    "guide.permissionsReopenWelcome": "Muat ulang selamat datang",
    "guide.sleepTimer": "Timer Tidur",
    "guide.sleepTimerContent": "Berhenti otomatis terjadwal.",
    "guide.snippets": "Klip Audio",
    "guide.snippetsContent": "Simpan 30 detik terakhir dari sebuah episode. Ganti nama, putar ulang, atau bagikan klip Anda.",
    "guide.voiceEnhancer": "Peningkat Suara",
    "guide.voiceEnhancerContent": "Meningkatkan kejelasan suara dengan memperkuat frekuensi vokal dan mengompresi dinamika.",
    "premium.snippets": "Klip Audio",
    "premium.snippetsDesc": "Simpan potongan 30 detik dari episode favorit",
    "premium.voiceEnhancer": "Peningkat Suara",
    "premium.voiceEnhancerDesc": "Meningkatkan kejelasan suara untuk pengalaman mendengarkan yang lebih baik",
    "welcome.subtitle": "Podcast dari seluruh dunia",
    "welcome.chooseLanguage": "Pilih bahasa",
    "welcome.start": "Mulai",
    "welcome.stations": "Ribuan podcast",
    "welcome.search": "Pencarian lanjutan",
    "welcome.favExport": "Langganan",
    "welcome.genres": "Berbagai kategori",
    "category.Technology": "Teknologi",
    "category.Comedy": "Komedi",
    "category.News": "Berita",
    "category.True Crime": "Kriminal Nyata",
    "category.Health": "Kesehatan",
    "category.Business": "Bisnis",
    "category.Science": "Sains",
    "category.Education": "Pendidikan",
    "category.Sports": "Olahraga",
    "category.Music": "Musik",
    "category.Society": "Masyarakat",
    "category.History": "Sejarah",
    "category.Fiction": "Fiksi",
    "category.Horror": "Horor",
    "category.Video Games": "Video Game",
    "category.Arts": "Seni",
    "category.Food": "Makanan",
    "category.Travel": "Perjalanan",
    "category.Religion": "Agama",
    "category.Kids & Family": "Anak & Keluarga",
    "category.Politics": "Politik",
    "category.Nature": "Alam",
    "category.Film & TV": "Film & TV",
    "category.Leisure": "Rekreasi",
    "category.Self-Improvement": "Pengembangan Diri",
    "category.Relationships": "Hubungan",
    "download.download": "Unduh",
    "download.downloaded": "Terunduh",
    "download.downloading": "Mengunduh…",
    "download.delete": "Hapus unduhan",
    "download.deleted": "Unduhan dihapus",
    "download.success": "Episode terunduh",
    "download.error": "Unduhan gagal",
    "download.downloads": "Unduhan",
    "download.noDownloads": "Tidak ada unduhan",
    "download.destination": "Tujuan unduhan",
    "download.internal": "Penyimpanan internal",
    "download.external": "Penyimpanan eksternal (SD)",
    "download.destinationDesc": "Pilih tempat menyimpan episode",
    "auto.drivingWarning": "Peringatan: Jangan menelusuri menu saat berkendara",
    "auto.drivingWarningSubtitle": "Serahkan tugas ini kepada penumpang",
    "auto.subscriptions": "Langganan",
    "auto.inProgress": "Sedang berlangsung",
    "sidebar.description": "Temukan dan dengarkan ribuan podcast dari seluruh dunia.",
    "sidebar.radioDescription": "Dengarkan radio langsung",
    "footer.createdBy": "Produk dari radiosphere.be",
    "footer.poweredBy": "Didukung oleh Podcast Index",
    "player.selectEpisode": "Pilih episode untuk mulai mendengarkan"
  }
};
const LanguageContext = createContext(void 0);
const VALID_LANGS = ["fr", "en", "es", "de", "ja", "it", "nl", "pt", "pl", "zh", "tr", "ru", "id"];
function detectInitialLanguage() {
  var _a;
  try {
    const stored = localStorage.getItem("podcastsphere_language");
    if (stored && VALID_LANGS.includes(stored)) return stored;
    const nav = (_a = navigator.language) == null ? void 0 : _a.toLowerCase();
    if (nav == null ? void 0 : nav.startsWith("fr")) return "fr";
    if (nav == null ? void 0 : nav.startsWith("es")) return "es";
    if (nav == null ? void 0 : nav.startsWith("de")) return "de";
    if (nav == null ? void 0 : nav.startsWith("ja")) return "ja";
    if (nav == null ? void 0 : nav.startsWith("it")) return "it";
    if (nav == null ? void 0 : nav.startsWith("nl")) return "nl";
    if (nav == null ? void 0 : nav.startsWith("pt")) return "pt";
    if (nav == null ? void 0 : nav.startsWith("pl")) return "pl";
    if (nav == null ? void 0 : nav.startsWith("zh")) return "zh";
    if (nav == null ? void 0 : nav.startsWith("tr")) return "tr";
    if (nav == null ? void 0 : nav.startsWith("ru")) return "ru";
    if ((nav == null ? void 0 : nav.startsWith("id")) || (nav == null ? void 0 : nav.startsWith("ms"))) return "id";
    return "en";
  } catch {
    return "en";
  }
}
const HTML_LANG_MAP = {
  fr: "fr",
  en: "en",
  es: "es",
  de: "de",
  ja: "ja",
  it: "it",
  nl: "nl",
  pt: "pt",
  pl: "pl",
  zh: "zh-CN",
  tr: "tr",
  ru: "ru",
  id: "id"
};
function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectInitialLanguage);
  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("podcastsphere_language", lang);
    } catch {
    }
  }, []);
  useEffect(() => {
  }, [language]);
  useEffect(() => {
    document.documentElement.lang = HTML_LANG_MAP[language] || language;
    const t2 = translations[language];
    document.title = `Podcast Sphere — ${t2["welcome.subtitle"] || "Podcasts"}`;
  }, [language]);
  const t = useCallback((key) => {
    return translations[language][key] ?? key;
  }, [language]);
  return /* @__PURE__ */ jsx(LanguageContext.Provider, { value: { language, setLanguage, t }, children });
}
function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
const PROGRESS_KEY = "ps_episode_progress";
const HISTORY_KEY = "ps_listen_history";
const MAX_HISTORY = 100;
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
  }
}
function getEpisodeProgress(episodeId) {
  const map = loadJSON(PROGRESS_KEY, {});
  return map[String(episodeId)] || null;
}
function saveEpisodeProgress(episodeId, currentTime, duration) {
  const map = loadJSON(PROGRESS_KEY, {});
  const completed = duration > 0 && currentTime / duration > 0.95;
  map[String(episodeId)] = {
    episodeId,
    currentTime,
    duration,
    updatedAt: Date.now(),
    completed
  };
  saveJSON(PROGRESS_KEY, map);
}
function markEpisodeCompleted(episodeId) {
  const map = loadJSON(PROGRESS_KEY, {});
  const existing = map[String(episodeId)];
  if (existing) {
    existing.completed = true;
    existing.updatedAt = Date.now();
  } else {
    map[String(episodeId)] = {
      episodeId,
      currentTime: 0,
      duration: 0,
      updatedAt: Date.now(),
      completed: true
    };
  }
  saveJSON(PROGRESS_KEY, map);
}
function getListenHistory() {
  return loadJSON(HISTORY_KEY, []);
}
function addToHistory(episode, currentTime, duration) {
  let history = loadJSON(HISTORY_KEY, []);
  const progress = duration > 0 ? currentTime / duration : 0;
  const completed = progress > 0.95;
  history = history.filter((h) => h.episode.id !== episode.id);
  history.unshift({
    episode,
    lastPlayedAt: Date.now(),
    progress,
    completed
  });
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  saveJSON(HISTORY_KEY, history);
}
function clearHistory() {
  saveJSON(HISTORY_KEY, []);
}
function removeFromHistory(episodeId) {
  let history = loadJSON(HISTORY_KEY, []);
  history = history.filter((h) => h.episode.id !== episodeId);
  saveJSON(HISTORY_KEY, history);
}
const startSilentLoop = () => {
};
const requestWakeLock = () => {
};
class VoiceEnhancer {
  constructor() {
    __publicField(this, "audioContext", null);
    __publicField(this, "sourceNode", null);
    __publicField(this, "compressorNode", null);
    __publicField(this, "eqNode", null);
    __publicField(this, "highPassNode", null);
    __publicField(this, "gainNode", null);
    __publicField(this, "attachedElement", null);
    __publicField(this, "sourceSupportCache", /* @__PURE__ */ new Map());
    __publicField(this, "isEnabled", false);
    __publicField(this, "isSupported", false);
  }
  getSourceUrl(audioElement) {
    return audioElement.currentSrc || audioElement.src || "";
  }
  isUrlLocallySafe(sourceUrl) {
    if (!sourceUrl) return false;
    try {
      const parsedUrl = new URL(sourceUrl, window.location.href);
      return parsedUrl.origin === window.location.origin || parsedUrl.protocol === "blob:" || parsedUrl.protocol === "data:" || parsedUrl.protocol === "file:" || parsedUrl.protocol === "capacitor:" || parsedUrl.protocol === "content:" || parsedUrl.protocol === "filesystem:";
    } catch {
      return false;
    }
  }
  async canProcessSource(audioElement) {
    const sourceUrl = this.getSourceUrl(audioElement);
    if (!sourceUrl) return false;
    if (this.sourceSupportCache.has(sourceUrl)) {
      return this.sourceSupportCache.get(sourceUrl) ?? false;
    }
    if (this.isUrlLocallySafe(sourceUrl)) {
      this.sourceSupportCache.set(sourceUrl, true);
      return true;
    }
    try {
      const headResponse = await fetch(sourceUrl, {
        method: "HEAD",
        mode: "cors",
        cache: "no-store"
      });
      const supported = headResponse.ok;
      this.sourceSupportCache.set(sourceUrl, supported);
      return supported;
    } catch {
      try {
        const rangedResponse = await fetch(sourceUrl, {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: {
            Range: "bytes=0-1"
          }
        });
        const supported = rangedResponse.ok || rangedResponse.status === 206;
        this.sourceSupportCache.set(sourceUrl, supported);
        return supported;
      } catch {
        this.sourceSupportCache.set(sourceUrl, false);
        return false;
      }
    }
  }
  resetNodes() {
    var _a, _b, _c, _d2, _e;
    this.isEnabled = false;
    this.isSupported = false;
    this.attachedElement = null;
    try {
      (_a = this.sourceNode) == null ? void 0 : _a.disconnect();
      (_b = this.highPassNode) == null ? void 0 : _b.disconnect();
      (_c = this.compressorNode) == null ? void 0 : _c.disconnect();
      (_d2 = this.eqNode) == null ? void 0 : _d2.disconnect();
      (_e = this.gainNode) == null ? void 0 : _e.disconnect();
    } catch {
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      void this.audioContext.close().catch(() => {
      });
    }
    this.audioContext = null;
    this.sourceNode = null;
    this.compressorNode = null;
    this.eqNode = null;
    this.highPassNode = null;
    this.gainNode = null;
  }
  async init(audioElement) {
    if (this.audioContext && this.isSupported && this.attachedElement === audioElement) return true;
    if (!await this.canProcessSource(audioElement)) {
      console.warn("[VoiceEnhancer] Flux non compatible avec le traitement local", this.getSourceUrl(audioElement));
      this.resetNodes();
      return false;
    }
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      this.audioContext = new AudioContextClass();
      this.attachedElement = audioElement;
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      this.compressorNode = this.audioContext.createDynamicsCompressor();
      this.eqNode = this.audioContext.createBiquadFilter();
      this.highPassNode = this.audioContext.createBiquadFilter();
      this.gainNode = this.audioContext.createGain();
      this.eqNode.type = "peaking";
      this.eqNode.frequency.value = 3e3;
      this.eqNode.Q.value = 1.2;
      this.highPassNode.type = "highpass";
      this.highPassNode.frequency.value = 85;
      this.highPassNode.Q.value = 0.7;
      this.sourceNode.connect(this.highPassNode);
      this.highPassNode.connect(this.compressorNode);
      this.compressorNode.connect(this.eqNode);
      this.eqNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      this.applyDisabledSettings();
      this.isSupported = true;
      console.log("[VoiceEnhancer] Initialisé avec succès");
      return true;
    } catch (e) {
      this.resetNodes();
      console.error("[VoiceEnhancer] Non disponible sur ce flux/appareil", e);
      return false;
    }
  }
  applyDisabledSettings() {
    if (!this.compressorNode || !this.eqNode || !this.gainNode || !this.highPassNode) return;
    this.compressorNode.threshold.value = 0;
    this.compressorNode.knee.value = 0;
    this.compressorNode.ratio.value = 1;
    this.compressorNode.attack.value = 3e-3;
    this.compressorNode.release.value = 0.25;
    this.eqNode.gain.value = 0;
    this.gainNode.gain.value = 1;
  }
  applyEnabledSettings() {
    if (!this.compressorNode || !this.eqNode || !this.gainNode || !this.highPassNode) return;
    this.compressorNode.threshold.value = -18;
    this.compressorNode.knee.value = 10;
    this.compressorNode.ratio.value = 4;
    this.compressorNode.attack.value = 3e-3;
    this.compressorNode.release.value = 0.25;
    this.eqNode.gain.value = 4;
    this.highPassNode.frequency.value = 85;
    this.gainNode.gain.value = 1.3;
  }
  async toggle(enable) {
    if (!this.isSupported || !this.audioContext || !this.sourceNode || !this.compressorNode || !this.eqNode || !this.gainNode) {
      this.isEnabled = false;
      return false;
    }
    try {
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      this.isEnabled = enable;
      if (enable) {
        this.applyEnabledSettings();
        console.log("[VoiceEnhancer] Activé");
      } else {
        this.applyDisabledSettings();
        console.log("[VoiceEnhancer] Désactivé");
      }
      return this.isEnabled;
    } catch (e) {
      this.isEnabled = false;
      this.applyDisabledSettings();
      console.error("[VoiceEnhancer] Échec du basculement", e);
      return false;
    }
  }
  getState() {
    return this.isEnabled;
  }
  release() {
    this.resetNodes();
  }
  canUse() {
    return this.isSupported;
  }
}
const voiceEnhancer = new VoiceEnhancer();
const safeNativeCall = async (method, data) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await PodcastAutoPlugin.instance[method](data);
  } catch (e) {
    console.warn("[PodcastAutoPlugin]", method, "failed:", e);
  }
};
const createManagedAudio = () => {
  if (typeof window === "undefined") return null;
  const audio = new Audio();
  audio.playsInline = true;
  audio.preload = "auto";
  return audio;
};
const globalAudio = createManagedAudio();
const PlayerContext = createContext(null);
function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}
function playWithTimeout(audio, timeoutMs = 15e3) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      fn();
    };
    const timeout = setTimeout(() => {
      settle(() => {
        const lastChance = audio.play();
        if (lastChance && typeof lastChance.then === "function") {
          const abortTimer = setTimeout(() => reject(new Error("Playback timeout")), 3e3);
          lastChance.then(() => {
            clearTimeout(abortTimer);
            resolve();
          }).catch(() => {
            clearTimeout(abortTimer);
            reject(new Error("Playback timeout"));
          });
        } else {
          reject(new Error("Playback timeout"));
        }
      });
    }, timeoutMs);
    const onCanPlay = () => {
      settle(() => {
        audio.play().then(resolve).catch(reject);
      });
    };
    const onError = () => {
      settle(() => reject(new Error("Audio load error")));
    };
    if (audio.readyState >= 3) {
      settle(() => {
        audio.play().then(resolve).catch(reject);
      });
    } else {
      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("error", onError);
    }
  });
}
function PlayerProvider({ children, onEpisodePlay }) {
  const { t } = useTranslation();
  const [audioElement, setAudioElement] = useState(() => globalAudio);
  const audioRef = useRef(audioElement);
  const [state, setState] = useState({
    currentEpisode: null,
    isPlaying: false,
    isBuffering: false,
    volume: 0.8,
    isFullScreen: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    isVoiceBoostEnabled: false
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(false);
  isPlayingRef.current = state.isPlaying;
  const playTokenRef = useRef(0);
  const saveCounterRef = useRef(0);
  const feedEpisodesRef = useRef([]);
  const playRef = useRef(() => {
  });
  useEffect(() => {
    audioRef.current = audioElement;
  }, [audioElement]);
  const syncMediaSessionPosition = useCallback(() => {
    const audio = audioRef.current;
    if (!("mediaSession" in navigator)) return;
    const dur = audio.duration;
    const pos = audio.currentTime;
    if (!isNaN(dur) && dur > 0 && !isNaN(pos)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: dur,
          playbackRate: audio.playbackRate || 1,
          position: Math.max(0, Math.min(pos, dur))
        });
      } catch (e) {
        console.error("[Player] Sync position error:", e);
      }
    }
  }, []);
  const rollbackPlayback = useCallback(() => {
    const audio = audioRef.current;
    try {
      audio.pause();
    } catch {
    }
    isPlayingRef.current = false;
    setState((s) => ({ ...s, isPlaying: false, isBuffering: false }));
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
    safeNativeCall("updatePlaybackState", { isPlaying: false, position: 0 });
  }, []);
  const replaceAudioElement = useCallback(() => {
    const previousAudio = audioRef.current;
    const freshAudio = createManagedAudio();
    freshAudio.volume = stateRef.current.volume;
    freshAudio.playbackRate = stateRef.current.playbackRate;
    try {
      previousAudio.pause();
      previousAudio.removeAttribute("src");
      previousAudio.load();
    } catch {
    }
    audioRef.current = freshAudio;
    setAudioElement(freshAudio);
    voiceEnhancer.release();
    return freshAudio;
  }, []);
  const toggleVoiceBoost = useCallback(async () => {
    const next = !stateRef.current.isVoiceBoostEnabled;
    if (next) {
      const initialized = await voiceEnhancer.init(audioRef.current);
      if (!initialized) {
        setState((s) => ({ ...s, isVoiceBoostEnabled: false }));
        toast({ title: "Voice Enhancer indisponible", description: "Ce flux ou cet appareil ne permet pas l'amélioration vocale locale.", variant: "destructive" });
        return;
      }
    }
    const enabled = await voiceEnhancer.toggle(next);
    setState((s) => ({ ...s, isVoiceBoostEnabled: enabled }));
  }, []);
  useEffect(() => {
    const audio = audioElement;
    audio.volume = state.volume;
    const onTimeUpdate = () => {
      const ct = audio.currentTime;
      const dur = audio.duration || 0;
      setState((s) => ({ ...s, currentTime: ct, duration: dur }));
      if ("mediaSession" in navigator && !isNaN(dur) && dur > 0 && !isNaN(ct)) {
        try {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: audio.playbackRate || 1,
            position: Math.max(0, Math.min(ct, dur))
          });
        } catch (e) {
        }
      }
      saveCounterRef.current++;
      if (saveCounterRef.current % 5 === 0 && stateRef.current.currentEpisode) {
        saveEpisodeProgress(stateRef.current.currentEpisode.id, ct, dur);
        addToHistory(stateRef.current.currentEpisode, ct, dur);
      }
    };
    const onLoadedMetadata = () => {
      setState((s) => ({ ...s, duration: audio.duration || 0, isBuffering: false }));
      syncMediaSessionPosition();
    };
    const onEnded = () => {
      setState((s) => ({ ...s, isPlaying: false }));
      isPlayingRef.current = false;
      if (stateRef.current.currentEpisode) {
        markEpisodeCompleted(stateRef.current.currentEpisode.id);
        addToHistory(stateRef.current.currentEpisode, audio.duration || 0, audio.duration || 0);
        safeNativeCall("updatePlaybackState", { isPlaying: false, position: Math.round((audio.duration || 0) * 1e3) });
      }
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    };
    const onError = () => {
      console.error("[Player] Stream error encountered.");
      rollbackPlayback();
      toast({ title: t("player.streamError"), description: t("player.streamErrorDesc"), variant: "destructive" });
    };
    const onWaiting = () => setState((s) => ({ ...s, isBuffering: true }));
    const onCanPlay = () => setState((s) => ({ ...s, isBuffering: false }));
    let stallTimer = null;
    const onStalled = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => {
        if (stateRef.current.isBuffering && isPlayingRef.current) {
          console.warn("[Player] Stall watchdog triggered after 20s");
          rollbackPlayback();
          toast({ title: t("player.streamError"), description: t("player.streamErrorDesc"), variant: "destructive" });
        }
      }, 2e4);
    };
    const onPlaying = () => {
      if (stallTimer) {
        clearTimeout(stallTimer);
        stallTimer = null;
      }
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("stalled", onStalled);
    audio.addEventListener("playing", onPlaying);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("stalled", onStalled);
      audio.removeEventListener("playing", onPlaying);
      if (stallTimer) clearTimeout(stallTimer);
    };
  }, [audioElement, rollbackPlayback, syncMediaSessionPosition, t, state.volume]);
  const updateMediaSession = useCallback((episode, playing) => {
    if (!("mediaSession" in navigator)) return;
    const artworkUrl = episode.feedImage || episode.image || new URL("/android-chrome-512x512.png", window.location.origin).href;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: episode.feedAuthor || episode.feedTitle,
      album: episode.feedTitle,
      artwork: [{ src: artworkUrl, sizes: "512x512", type: "image/png" }]
    });
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, []);
  const togglePlayRef = useRef(() => {
  });
  const hydrateEpisodeMetadata = useCallback(async (episode) => {
    if (episode.feedTitle || episode.feedAuthor || !episode.feedId) return episode;
    try {
      const feed = await getPodcastById(episode.feedId);
      if (!feed) return episode;
      return {
        ...episode,
        feedTitle: feed.title || episode.feedTitle,
        feedAuthor: feed.author || episode.feedAuthor,
        feedImage: episode.feedImage || feed.image || episode.image
      };
    } catch {
      return episode;
    }
  }, []);
  const pausePlayback = useCallback(() => {
    const audio = audioRef.current;
    const currentEpisode = stateRef.current.currentEpisode;
    if (!currentEpisode) return;
    isPlayingRef.current = false;
    audio.pause();
    saveEpisodeProgress(currentEpisode.id, audio.currentTime, audio.duration || 0);
    addToHistory(currentEpisode, audio.currentTime, audio.duration || 0);
    setState((s) => ({ ...s, isPlaying: false, isBuffering: false }));
    updateMediaSession(currentEpisode, false);
    syncMediaSessionPosition();
    void safeNativeCall("updatePlaybackState", {
      isPlaying: false,
      position: Math.round((audio.currentTime || 0) * 1e3)
    });
  }, [updateMediaSession, syncMediaSessionPosition]);
  const resumePlayback = useCallback(async () => {
    const audio = audioRef.current;
    const currentEpisode = stateRef.current.currentEpisode;
    if (!currentEpisode) return;
    setState((s) => ({ ...s, isBuffering: true }));
    try {
      await playWithTimeout(audio);
      isPlayingRef.current = true;
      setState((s) => ({ ...s, isPlaying: true, isBuffering: false }));
      updateMediaSession(currentEpisode, true);
      syncMediaSessionPosition();
      startSilentLoop();
      requestWakeLock();
      await safeNativeCall("updatePlaybackState", {
        isPlaying: true,
        position: Math.round((audio.currentTime || 0) * 1e3)
      });
    } catch (e) {
      console.error("[Player] Resume/toggle play error:", e);
      rollbackPlayback();
    }
  }, [updateMediaSession, syncMediaSessionPosition, rollbackPlayback]);
  const togglePlay = useCallback(() => {
    if (!stateRef.current.currentEpisode) return;
    if (stateRef.current.isPlaying) {
      pausePlayback();
      return;
    }
    void resumePlayback();
  }, [pausePlayback, resumePlayback]);
  togglePlayRef.current = togglePlay;
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const playNextRef_current = () => {
      const eps = feedEpisodesRef.current;
      const current = stateRef.current.currentEpisode;
      if (!current || eps.length === 0) return;
      const idx = eps.findIndex((e) => e.id === current.id);
      if (idx < 0 || idx >= eps.length - 1) return;
      playRef.current(eps[idx + 1]);
    };
    const playPrevRef_current = () => {
      const eps = feedEpisodesRef.current;
      const current = stateRef.current.currentEpisode;
      if (!current || eps.length === 0) return;
      const idx = eps.findIndex((e) => e.id === current.id);
      if (idx <= 0) return;
      playRef.current(eps[idx - 1]);
    };
    navigator.mediaSession.setActionHandler("play", () => {
      void resumePlayback();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      pausePlayback();
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
      syncMediaSessionPosition();
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      audioRef.current.currentTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 30);
      syncMediaSessionPosition();
    });
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null && !isNaN(details.seekTime)) {
        audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || 0, details.seekTime));
        syncMediaSessionPosition();
      }
    });
    navigator.mediaSession.setActionHandler("nexttrack", playNextRef_current);
    navigator.mediaSession.setActionHandler("previoustrack", playPrevRef_current);
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
      navigator.mediaSession.setActionHandler("seekto", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
    };
  }, [pausePlayback, resumePlayback, syncMediaSessionPosition]);
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let mediaToggleListener;
    let vehicleDisconnectListener;
    let mediaCommandListener;
    (async () => {
      try {
        mediaToggleListener = await PodcastAutoPlugin.addListener("mediaToggle", () => {
          togglePlayRef.current();
        });
        vehicleDisconnectListener = await PodcastAutoPlugin.addListener("vehicleDisconnected", () => {
          if (isPlayingRef.current) {
            pausePlayback();
          }
        });
        mediaCommandListener = await PodcastAutoPlugin.addListener(
          "mediaCommand",
          async (data) => {
            switch (data.action) {
              case "play":
                if (!isPlayingRef.current) {
                  await resumePlayback();
                }
                break;
              case "pause":
                if (isPlayingRef.current) {
                  pausePlayback();
                }
                break;
              case "toggle":
                togglePlayRef.current();
                break;
              case "seek":
                if (audioRef.current && data.position != null) {
                  audioRef.current.currentTime = data.position / 1e3;
                  syncMediaSessionPosition();
                  await safeNativeCall("updatePlaybackState", {
                    isPlaying: isPlayingRef.current,
                    position: Math.round(audioRef.current.currentTime * 1e3)
                  });
                }
                break;
              case "next": {
                const eps = feedEpisodesRef.current;
                const cur = stateRef.current.currentEpisode;
                if (cur && eps.length > 0) {
                  const idx = eps.findIndex((e) => e.id === cur.id);
                  if (idx >= 0 && idx < eps.length - 1) playRef.current(eps[idx + 1]);
                }
                break;
              }
              case "previous": {
                const eps = feedEpisodesRef.current;
                const cur = stateRef.current.currentEpisode;
                if (cur && eps.length > 0) {
                  const idx = eps.findIndex((e) => e.id === cur.id);
                  if (idx > 0) playRef.current(eps[idx - 1]);
                }
                break;
              }
              case "autoplay": {
                if (!stateRef.current.currentEpisode) {
                  const history = getListenHistory();
                  const inProgress = history.find((h) => !h.completed);
                  if (inProgress) {
                    playRef.current(inProgress.episode);
                  }
                } else if (!isPlayingRef.current) {
                  await resumePlayback();
                }
                break;
              }
              case "playMediaId": {
                if (data.mediaId) {
                  const parts = data.mediaId.split(":");
                  if (parts.length >= 3) {
                    const episodeId = parseInt(parts[1], 10);
                    const feedId = parseInt(parts[2], 10);
                    try {
                      const result = await getEpisodesByFeedId(feedId, 50);
                      if (result.episodes.length > 0) {
                        feedEpisodesRef.current = result.episodes;
                        const ep = result.episodes.find((e) => e.id === episodeId);
                        if (ep) playRef.current(ep);
                      }
                    } catch (e) {
                      console.warn("[Player] playMediaId fetch failed:", e);
                    }
                  }
                }
                break;
              }
              case "stop":
                if (isPlayingRef.current) pausePlayback();
                break;
            }
          }
        );
      } catch (e) {
        console.log("[Player] Native listeners not available:", e);
      }
    })();
    return () => {
      var _a, _b, _c;
      try {
        (_a = mediaToggleListener == null ? void 0 : mediaToggleListener.remove) == null ? void 0 : _a.call(mediaToggleListener);
        (_b = vehicleDisconnectListener == null ? void 0 : vehicleDisconnectListener.remove) == null ? void 0 : _b.call(vehicleDisconnectListener);
        (_c = mediaCommandListener == null ? void 0 : mediaCommandListener.remove) == null ? void 0 : _c.call(mediaCommandListener);
      } catch {
      }
    };
  }, [pausePlayback, resumePlayback, syncMediaSessionPosition]);
  const play = useCallback(async (episode) => {
    if (!episode.enclosureUrl) {
      toast({ title: t("player.error"), description: t("player.streamUnavailable"), variant: "destructive" });
      return;
    }
    const token = ++playTokenRef.current;
    let audio = audioRef.current;
    audio.pause();
    let audioSrc = episode.enclosureUrl;
    try {
      const { isDownloaded: isDownloaded2, getLocalFileUri: getLocalFileUri2 } = await Promise.resolve().then(() => DownloadService);
      if (isDownloaded2(episode.id)) {
        const localUri = await getLocalFileUri2(episode.id);
        if (localUri) audioSrc = localUri;
      }
    } catch {
      console.warn("[Player] Local check failed, falling back to stream.");
    }
    if (token !== playTokenRef.current) return;
    if (voiceEnhancer.canUse()) {
      audio = replaceAudioElement();
      setState((s) => ({ ...s, isVoiceBoostEnabled: false }));
    }
    audio.src = audioSrc;
    audio.playbackRate = stateRef.current.playbackRate;
    audio.load();
    const saved = getEpisodeProgress(episode.id);
    const resumeTime = saved && !saved.completed && saved.currentTime > 5 ? saved.currentTime - 2 : 0;
    setState((s) => ({ ...s, currentEpisode: episode, isBuffering: true, isPlaying: false, currentTime: resumeTime, duration: 0 }));
    updateMediaSession(episode, true);
    void hydrateEpisodeMetadata(episode).then((hydratedEpisode) => {
      if (hydratedEpisode === episode) return;
      setState((s) => {
        var _a;
        if (((_a = s.currentEpisode) == null ? void 0 : _a.id) !== episode.id) return s;
        return { ...s, currentEpisode: hydratedEpisode };
      });
      updateMediaSession(hydratedEpisode, stateRef.current.isPlaying);
      addToHistory(hydratedEpisode, audio.currentTime || resumeTime, audio.duration || (saved == null ? void 0 : saved.duration) || 0);
    });
    try {
      await playWithTimeout(audio);
      if (token !== playTokenRef.current) {
        audio.pause();
        return;
      }
      if (resumeTime > 0) audio.currentTime = resumeTime;
      isPlayingRef.current = true;
      setState((s) => ({ ...s, isPlaying: true, isBuffering: false }));
      syncMediaSessionPosition();
      startSilentLoop();
      requestWakeLock();
      onEpisodePlay == null ? void 0 : onEpisodePlay(episode);
      addToHistory(episode, resumeTime, (saved == null ? void 0 : saved.duration) || 0);
      await safeNativeCall("updateNowPlaying", {
        title: episode.title ?? "",
        author: episode.feedAuthor ?? episode.feedTitle ?? "",
        artworkUrl: episode.feedImage ?? episode.image ?? "",
        duration: (episode.duration ?? 0) * 1e3
      });
      await safeNativeCall("updatePlaybackState", {
        isPlaying: true,
        position: Math.round(resumeTime * 1e3)
      });
    } catch (e) {
      console.warn("[Player] First play attempt failed, retrying...", e);
      if (token === playTokenRef.current) {
        try {
          audio = replaceAudioElement();
          audio.src = audioSrc;
          audio.playbackRate = stateRef.current.playbackRate;
          audio.load();
          await playWithTimeout(audio);
          if (token !== playTokenRef.current) {
            audio.pause();
            return;
          }
          if (resumeTime > 0) audio.currentTime = resumeTime;
          isPlayingRef.current = true;
          setState((s) => ({ ...s, isPlaying: true, isBuffering: false }));
          syncMediaSessionPosition();
          startSilentLoop();
          requestWakeLock();
          onEpisodePlay == null ? void 0 : onEpisodePlay(episode);
        } catch (retryErr) {
          console.error("[Player] Retry also failed:", retryErr);
          if (token === playTokenRef.current) {
            rollbackPlayback();
            toast({ title: t("player.streamError"), description: t("player.streamErrorDesc"), variant: "destructive" });
          }
        }
      }
    }
  }, [hydrateEpisodeMetadata, updateMediaSession, onEpisodePlay, syncMediaSessionPosition, rollbackPlayback, replaceAudioElement, t]);
  const setVolume = useCallback((v) => {
    audioRef.current.volume = v;
    setState((s) => ({ ...s, volume: v }));
  }, []);
  const seek = useCallback((seconds) => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, seconds));
    syncMediaSessionPosition();
  }, [syncMediaSessionPosition]);
  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30);
    syncMediaSessionPosition();
  }, [syncMediaSessionPosition]);
  const skipBackward = useCallback(() => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, audio.currentTime - 15);
    syncMediaSessionPosition();
  }, [syncMediaSessionPosition]);
  const setPlaybackRate = useCallback((rate) => {
    audioRef.current.playbackRate = rate;
    setState((s) => ({ ...s, playbackRate: rate }));
    syncMediaSessionPosition();
  }, [syncMediaSessionPosition]);
  const openFullScreen = useCallback(() => setState((s) => ({ ...s, isFullScreen: true })), []);
  const closeFullScreen = useCallback(() => setState((s) => ({ ...s, isFullScreen: false })), []);
  playRef.current = play;
  const setCurrentFeedEpisodes = useCallback((episodes) => {
    var _a;
    feedEpisodesRef.current = episodes;
    if (episodes.length > 0 && ((_a = episodes[0]) == null ? void 0 : _a.feedId)) {
      syncEpisodeListToNative(episodes[0].feedId);
    }
  }, []);
  const playNext = useCallback(() => {
    const eps = feedEpisodesRef.current;
    const current = stateRef.current.currentEpisode;
    if (!current || eps.length === 0) return;
    const idx = eps.findIndex((e) => e.id === current.id);
    if (idx < 0 || idx >= eps.length - 1) return;
    playRef.current(eps[idx + 1]);
  }, []);
  const playPrevious = useCallback(() => {
    const eps = feedEpisodesRef.current;
    const current = stateRef.current.currentEpisode;
    if (!current || eps.length === 0) return;
    const idx = eps.findIndex((e) => e.id === current.id);
    if (idx <= 0) return;
    playRef.current(eps[idx - 1]);
  }, []);
  useEffect(() => {
    if (!state.isPlaying) return;
    const interval = setInterval(() => {
      var _a;
      safeNativeCall("updatePlaybackState", {
        isPlaying: true,
        position: Math.round((((_a = audioRef.current) == null ? void 0 : _a.currentTime) ?? 0) * 1e3)
      });
    }, 5e3);
    return () => clearInterval(interval);
  }, [state.isPlaying]);
  useEffect(() => {
    if (!state.isPlaying) return;
    const syncHistory = () => {
      getListenHistory();
    };
    syncHistory();
    const interval = setInterval(syncHistory, 3e4);
    return () => clearInterval(interval);
  }, [state.isPlaying]);
  const progress = state.duration > 0 ? state.currentTime / state.duration : 0;
  return /* @__PURE__ */ jsx(PlayerContext.Provider, { value: { ...state, play, togglePlay, setVolume, openFullScreen, closeFullScreen, seek, skipForward, skipBackward, setPlaybackRate, toggleVoiceBoost, playNext, playPrevious, setCurrentFeedEpisodes, progress }, children });
}
const downloadEpisode = async (_episode, _onProgress) => false;
const deleteDownload = async (_episodeId) => {
};
const isDownloaded = (_episodeId) => false;
const getDownloadedEpisodes = () => [];
const getLocalFileUri = async (_episodeId) => null;
const DownloadService = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  deleteDownload,
  downloadEpisode,
  getDownloadedEpisodes,
  getLocalFileUri,
  isDownloaded
}, Symbol.toStringTag, { value: "Module" }));
const DownloadContext = createContext(null);
function useDownloads() {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error("useDownloads must be inside DownloadProvider");
  return ctx;
}
function DownloadProvider({ children }) {
  const [downloading, setDownloading] = useState({});
  const [downloaded, setDownloaded] = useState(getDownloadedEpisodes);
  const downloadingRef = useRef(downloading);
  downloadingRef.current = downloading;
  const refreshDownloaded = useCallback(() => {
    setDownloaded(getDownloadedEpisodes());
  }, []);
  const isEpisodeDownloaded = useCallback((id) => {
    return isDownloaded();
  }, [downloaded]);
  const startDownload = useCallback(async (episode) => {
    if (isDownloaded(episode.id) || downloadingRef.current[episode.id] !== void 0) return false;
    setDownloading((prev) => ({ ...prev, [episode.id]: 0 }));
    const ok = await downloadEpisode();
    setDownloading((prev) => {
      const next = { ...prev };
      delete next[episode.id];
      return next;
    });
    if (ok) refreshDownloaded();
    return ok;
  }, [refreshDownloaded]);
  const removeDownload = useCallback(async (id) => {
    await deleteDownload();
    refreshDownloaded();
  }, [refreshDownloaded]);
  const getPlaybackUri = useCallback(async (id) => {
    return getLocalFileUri();
  }, []);
  return /* @__PURE__ */ jsx(
    DownloadContext.Provider,
    {
      value: {
        downloading,
        isEpisodeDownloaded,
        startDownload,
        removeDownload,
        downloaded,
        refreshDownloaded,
        getPlaybackUri
      },
      children
    }
  );
}
const DB_NAME = "ps_image_cache";
const DB_VERSION = 1;
const STORE_NAME = "artworks";
const MAX_ENTRIES = 500;
const MAX_CONCURRENT = 2;
const STARTUP_DELAY_MS = 3e3;
let dbPromise = null;
const startTime = Date.now();
function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "url" });
        store.createIndex("cachedAt", "cachedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}
async function getCachedImage(url) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(url);
      req.onsuccess = () => {
        var _a;
        if ((_a = req.result) == null ? void 0 : _a.blob) {
          resolve(URL.createObjectURL(req.result.blob));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
async function isCached(url) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.count(url);
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
async function cacheImage(url) {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.size) return null;
    const db = await openDB();
    const entry = { url, blob, cachedAt: Date.now() };
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(entry);
      tx.oncomplete = () => resolve(URL.createObjectURL(blob));
      tx.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
let queue = [];
let processing = false;
let activeDownloads = 0;
const requestIdle = typeof window !== "undefined" && "requestIdleCallback" in window ? window.requestIdleCallback : (cb) => setTimeout(cb, 50);
async function processQueue() {
  if (processing || queue.length === 0) return;
  const elapsed = Date.now() - startTime;
  if (elapsed < STARTUP_DELAY_MS) {
    setTimeout(() => processQueue(), STARTUP_DELAY_MS - elapsed);
    return;
  }
  processing = true;
  queue.sort((a, b) => b.priority - a.priority);
  while (queue.length > 0) {
    while (activeDownloads >= MAX_CONCURRENT && queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    const job = queue.shift();
    if (!job) break;
    await new Promise((resolve) => requestIdle(() => resolve()));
    const already = await isCached(job.url);
    if (!already) {
      activeDownloads++;
      cacheImage(job.url).finally(() => {
        activeDownloads--;
      });
    }
  }
  processing = false;
}
function enqueue(urls, priority) {
  const existing = new Set(queue.map((j) => j.url));
  for (const url of urls) {
    if (url && !existing.has(url)) {
      queue.push({ url, priority });
      existing.add(url);
    }
  }
  if (!processing) {
    requestIdle(() => processQueue());
  }
}
function preCacheImages(urls, priority = 2) {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return;
  enqueue(unique, priority);
}
async function evictOldEntries() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result <= MAX_ENTRIES) return;
      const toDelete = countReq.result - MAX_ENTRIES;
      const idx = store.index("cachedAt");
      let deleted = 0;
      const cursor = idx.openCursor();
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c && deleted < toDelete) {
          c.delete();
          deleted++;
          c.continue();
        }
      };
    };
  } catch {
  }
}
const stationPlaceholder = "/assets/station-placeholder-BXC9QBJx.png";
const CachedImage = memo(function CachedImage2({
  src,
  alt,
  className = "",
  loading = "lazy"
}) {
  const [displaySrc, setDisplaySrc] = useState(stationPlaceholder);
  useEffect(() => {
    if (!src) {
      setDisplaySrc(stationPlaceholder);
      return;
    }
    let revoke = null;
    getCachedImage(src).then((cached) => {
      if (cached) {
        revoke = cached;
        setDisplaySrc(cached);
      } else {
        setDisplaySrc(src);
        preCacheImages([src], 1);
      }
    });
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [src]);
  const handleError = () => {
    setDisplaySrc(stationPlaceholder);
  };
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: displaySrc,
      alt,
      className,
      loading,
      onError: handleError
    }
  );
});
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}`;
  return `${m} min`;
}
function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1e3);
  return date.toLocaleDateString(void 0, { day: "numeric", month: "short", year: "numeric" });
}
function EpisodeRow({ episode, podcastTitle, podcastAuthor }) {
  const { currentEpisode, isPlaying, isBuffering, play, togglePlay } = usePlayer();
  const { isEpisodeDownloaded, downloading, startDownload } = useDownloads();
  const { t } = useTranslation();
  const isCurrent = (currentEpisode == null ? void 0 : currentEpisode.id) === episode.id;
  const saved = getEpisodeProgress(episode.id);
  const progressRatio = saved && saved.duration > 0 ? saved.currentTime / saved.duration : 0;
  const isCompleted = (saved == null ? void 0 : saved.completed) || false;
  const dlProgress = downloading[episode.id];
  const isDownloading = dlProgress !== void 0;
  const downloaded = isEpisodeDownloaded(episode.id);
  const handlePlay = (e) => {
    e.stopPropagation();
    const episodeForPlayback = {
      ...episode,
      feedTitle: episode.feedTitle || podcastTitle || "",
      feedAuthor: episode.feedAuthor || podcastAuthor || ""
    };
    if (isCurrent) {
      togglePlay();
    } else {
      play(episodeForPlayback);
    }
  };
  const handleDownload = async (e) => {
    e.stopPropagation();
    if (downloaded || isDownloading) return;
    const ok = await startDownload(episode);
    if (ok) {
      toast$1.success(t("download.success"));
    } else {
      toast$1.error(t("download.error"));
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-3 p-3 rounded-xl transition-colors ${isCurrent ? "bg-primary/10" : "hover:bg-accent/50"}`, children: [
    /* @__PURE__ */ jsxs("div", { className: "w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent relative", children: [
      /* @__PURE__ */ jsx(
        CachedImage,
        {
          src: episode.image || episode.feedImage,
          alt: episode.title,
          className: `w-full h-full object-cover ${isCompleted && !isCurrent ? "opacity-50" : ""}`
        }
      ),
      isCompleted && !isCurrent && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-background/40", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-primary" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: `text-sm font-semibold truncate ${isCompleted && !isCurrent ? "text-muted-foreground" : isCurrent ? "text-primary" : "text-foreground"}`, children: episode.title }),
      episode.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed", children: episode.description.replace(/<[^>]*>/g, "").slice(0, 200) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatDate(episode.datePublished) }),
        episode.duration > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "•" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatDuration(episode.duration) })
        ] }),
        downloaded && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "•" }),
          /* @__PURE__ */ jsx(CheckCircle, { className: "w-3 h-3 text-primary" })
        ] })
      ] }),
      isDownloading && /* @__PURE__ */ jsx("div", { className: "mt-1.5 h-1 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all",
          style: { width: `${Math.min((dlProgress || 0) * 100, 100)}%` }
        }
      ) }),
      !isDownloading && progressRatio > 0 && !isCompleted && !isCurrent && /* @__PURE__ */ jsx("div", { className: "mt-1.5 h-1 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full rounded-full bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)]",
          style: { width: `${Math.min(progressRatio * 100, 100)}%` }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleDownload,
        disabled: downloaded || isDownloading,
        className: `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${downloaded ? "text-primary" : isDownloading ? "text-muted-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`,
        title: downloaded ? t("download.downloaded") : t("download.download"),
        children: isDownloading ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : downloaded ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Download, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handlePlay,
        className: `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isCurrent && isPlaying ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-primary/20 text-foreground"}`,
        children: isCurrent && isBuffering ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : isCurrent && isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 ml-0.5" })
      }
    )
  ] });
}
function PodcastDescription({ description, t }) {
  const [expanded, setExpanded] = useState(false);
  const clean = description.replace(/<[^>]*>/g, "").trim();
  if (!clean) return null;
  return /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
    /* @__PURE__ */ jsx("p", { className: `text-sm text-muted-foreground leading-relaxed ${expanded ? "" : "line-clamp-3"}`, children: clean }),
    clean.length > 150 && /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setExpanded((v) => !v),
        className: "flex items-center gap-1 mt-1 text-xs text-primary font-medium",
        children: [
          expanded ? t("library.showLess") : t("library.showMore"),
          /* @__PURE__ */ jsx(ChevronDown, { className: `w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}` })
        ]
      }
    )
  ] });
}
function PodcastDetailPage({ podcast, onBack }) {
  const { t } = useTranslation();
  const { isSubscribed, toggleSubscription, markAsSeen } = useFavoritesContext();
  const { setCurrentFeedEpisodes } = usePlayer();
  const subscribed = isSubscribed(podcast.id);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollContainerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const isPrivate = isPrivateFeedId(podcast.id);
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);
  const loadPrivateFeed = useCallback(async (forceRefresh) => {
    const feedUrl = podcast.feedUrl || podcast.url;
    if (!feedUrl) return;
    const cached = getCachedPrivateEpisodes(podcast.id);
    if (cached.length > 0 && !forceRefresh) {
      setEpisodes(cached);
      setCurrentFeedEpisodes(cached);
      setIsLoading(false);
    }
    const isNative2 = Capacitor.isNativePlatform();
    const shouldFetch = forceRefresh || !isNative2 || cached.length === 0;
    if (!shouldFetch) return;
    if (cached.length === 0) setIsLoading(true);
    try {
      const parsed = await fetchPrivateFeed(feedUrl);
      setEpisodes(parsed.episodes);
      setCurrentFeedEpisodes(parsed.episodes);
      const urls = parsed.episodes.map((e) => e.image || e.feedImage).filter(Boolean);
      if (urls.length) preCacheImages(urls.slice(0, 20), 1);
    } catch (err) {
      if (cached.length === 0) {
        toast$1.error(t("privateFeed.fetchError"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [podcast.id, podcast.feedUrl, podcast.url, setCurrentFeedEpisodes, t]);
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setEpisodes([]);
    setHasMore(false);
    if (isPrivate) {
      loadPrivateFeed(false);
      return;
    }
    getEpisodesByFeedId(podcast.id, 1e3).then((page) => {
      if (cancelled) return;
      setEpisodes(page.episodes);
      setCurrentFeedEpisodes(page.episodes);
      setHasMore(page.hasMore);
      const urls = page.episodes.map((e) => e.image || e.feedImage).filter(Boolean);
      if (urls.length) preCacheImages(urls.slice(0, 20), 1);
    }).catch(() => {
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [podcast.id, isPrivate, loadPrivateFeed]);
  const handleRefreshPrivate = useCallback(async () => {
    setRefreshing(true);
    await loadPrivateFeed(true);
    setRefreshing(false);
    toast$1.success(t("privateFeed.refreshed"));
  }, [loadPrivateFeed, t]);
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || episodes.length === 0) return;
    setLoadingMore(true);
    const oldest = Math.min(...episodes.map((e) => e.datePublished));
    try {
      const page = await getEpisodesByFeedId(podcast.id, 1e3, oldest);
      const existingIds = new Set(episodes.map((e) => e.id));
      const newEps = page.episodes.filter((e) => !existingIds.has(e.id));
      setEpisodes((prev) => [...prev, ...newEps]);
      setHasMore(page.hasMore && newEps.length > 0);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, episodes, podcast.id]);
  const sortedEpisodes = useMemo(() => {
    if (!episodes.length) return [];
    return [...episodes].sort(
      (a, b) => sortNewestFirst ? b.datePublished - a.datePublished : a.datePublished - b.datePublished
    );
  }, [episodes, sortNewestFirst]);
  useEffect(() => {
    if (episodes.length > 0) {
      const newest = Math.max(...episodes.map((e) => e.datePublished));
      if (newest > 0) markAsSeen(podcast.id, newest);
    }
  }, [episodes, podcast.id, markAsSeen]);
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "px-4 pt-4 pb-2", children: [
      /* @__PURE__ */ jsxs("button", { onClick: onBack, className: "flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: t("common.cancel") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-accent shadow-lg",
            style: { boxShadow: "0 8px 30px -5px hsla(250, 80%, 50%, 0.4)" },
            children: /* @__PURE__ */ jsx(
              CachedImage,
              {
                src: podcast.image,
                alt: podcast.title,
                className: "w-full h-full object-cover",
                loading: "eager"
              }
            )
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex flex-col justify-center", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-heading font-bold text-foreground leading-tight line-clamp-2", children: podcast.title }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: podcast.author }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-3 flex-wrap", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => {
                  toggleSubscription(podcast);
                  if (!subscribed) toast$1.success(`${t("podcast.subscribed")} — ${podcast.title}`);
                },
                className: `px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit transition-all ${subscribed ? "bg-primary text-primary-foreground" : "bg-accent text-foreground hover:bg-primary/20"}`,
                children: [
                  /* @__PURE__ */ jsx(Bookmark, { className: `w-4 h-4 ${subscribed ? "fill-current" : ""}` }),
                  subscribed ? t("podcast.subscribed") : t("podcast.subscribe")
                ]
              }
            ),
            podcast.link && /* @__PURE__ */ jsxs(
              "a",
              {
                href: podcast.link,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 bg-accent text-foreground hover:bg-primary/20 transition-all",
                "aria-label": t("podcast.website"),
                title: t("podcast.website"),
                children: [
                  /* @__PURE__ */ jsx(Globe, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: t("podcast.website") })
                ]
              }
            ),
            isPrivate && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleRefreshPrivate,
                disabled: refreshing,
                className: "px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 bg-accent text-foreground hover:bg-primary/20 transition-all disabled:opacity-50",
                "aria-label": t("privateFeed.refresh"),
                title: t("privateFeed.refresh"),
                children: /* @__PURE__ */ jsx(RefreshCw, { className: cn("w-4 h-4", refreshing && "animate-spin") })
              }
            )
          ] })
        ] })
      ] }),
      podcast.description && /* @__PURE__ */ jsx(PodcastDescription, { description: podcast.description, t })
    ] }),
    /* @__PURE__ */ jsxs("div", { ref: scrollContainerRef, onScroll: handleScroll, className: "flex-1 overflow-y-auto px-4 pb-32 mt-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: [
          t("podcast.episodes"),
          " ",
          episodes.length > 0 && `(${episodes.length})`
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSortNewestFirst((prev) => !prev),
            className: "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent/50 text-muted-foreground hover:bg-accent transition-colors",
            children: [
              /* @__PURE__ */ jsx(ArrowDownUp, { className: "w-3.5 h-3.5" }),
              sortNewestFirst ? t("podcast.newest") : t("podcast.oldest")
            ]
          }
        )
      ] }),
      isLoading && /* @__PURE__ */ jsx("div", { className: "space-y-1", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(EpisodeRowSkeleton, {}, i)) }),
      sortedEpisodes.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-1", children: sortedEpisodes.map((ep) => /* @__PURE__ */ jsx(EpisodeRow, { episode: ep, podcastTitle: podcast.title, podcastAuthor: podcast.author }, ep.id)) }),
      hasMore && !isLoading && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: loadMore,
          disabled: loadingMore,
          className: "mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-accent text-foreground hover:bg-accent/80 transition-colors disabled:opacity-50",
          children: [
            loadingMore ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : null,
            loadingMore ? t("download.downloading") : t("podcast.loadMore")
          ]
        }
      ),
      !isLoading && sortedEpisodes.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-8", children: t("podcast.noEpisodes") })
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
const BillingPlugin = {
  queryPurchases: async () => ({ isPremium: false }),
  purchasePremium: async () => ({ purchased: false }),
  restorePurchases: async () => ({ isPremium: false })
};
const PREMIUM_HASH = "a3f2b8c1d4e5";
const PremiumContext = createContext(void 0);
const isNative = Capacitor.isNativePlatform();
function verifyPassword(input) {
  return input === "TESTPREMIUM007";
}
function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(() => {
    return true;
  });
  const [isLoading, setIsLoading] = useState(isNative);
  useEffect(() => {
    if (!isNative) return;
    BillingPlugin.queryPurchases().then(({ isPremium: purchased }) => {
      setIsPremium(purchased);
      try {
        localStorage.setItem("podcastsphere_premium", purchased ? PREMIUM_HASH : "false");
      } catch {
      }
    }).catch(() => {
      try {
        const stored = localStorage.getItem("podcastsphere_premium");
        setIsPremium(stored === PREMIUM_HASH);
      } catch {
      }
    }).finally(() => setIsLoading(false));
  }, []);
  const purchasePremium = useCallback(async () => {
    if (isNative) {
      try {
        const { purchased } = await BillingPlugin.purchasePremium();
        if (purchased) {
          setIsPremium(true);
          try {
            localStorage.setItem("podcastsphere_premium", PREMIUM_HASH);
          } catch {
          }
        }
      } catch (err) {
        console.error("BillingPlugin.purchasePremium error:", err);
        toast({ title: "❌ Erreur d'achat", description: String(err) });
      }
    } else {
      setIsPremium(true);
      try {
        localStorage.setItem("podcastsphere_premium", PREMIUM_HASH);
      } catch {
      }
    }
  }, []);
  const restorePurchases = useCallback(async () => {
    if (isNative) {
      try {
        const { isPremium: purchased } = await BillingPlugin.restorePurchases();
        setIsPremium(purchased);
        try {
          localStorage.setItem("podcastsphere_premium", purchased ? PREMIUM_HASH : "false");
        } catch {
        }
        return;
      } catch (err) {
        console.error("BillingPlugin.restorePurchases error:", err);
        try {
          const stored = localStorage.getItem("podcastsphere_premium");
          setIsPremium(stored === PREMIUM_HASH);
        } catch {
        }
      }
    } else {
      try {
        const stored = localStorage.getItem("podcastsphere_premium");
        setIsPremium(stored === PREMIUM_HASH);
      } catch {
      }
    }
  }, []);
  const unlockWithPassword = useCallback((password) => {
    if (verifyPassword(password.trim())) {
      setIsPremium(true);
      try {
        localStorage.setItem("podcastsphere_premium", PREMIUM_HASH);
      } catch {
      }
      return true;
    }
    return false;
  }, []);
  const lockPremium = useCallback(() => {
    setIsPremium(false);
    try {
      localStorage.setItem("podcastsphere_premium", "false");
    } catch {
    }
  }, []);
  return /* @__PURE__ */ jsx(PremiumContext.Provider, { value: { isPremium, isLoading, purchasePremium, restorePurchases, unlockWithPassword, lockPremium }, children });
}
const SLEEP_TIMER_OPTIONS = [
  { minutes: 15 },
  { minutes: 30 },
  { minutes: 45 },
  { minutes: 60 },
  { minutes: 90 },
  { minutes: 120 }
];
const SleepTimerContext = createContext(null);
function useSleepTimer() {
  const ctx = useContext(SleepTimerContext);
  if (!ctx) throw new Error("useSleepTimer must be inside SleepTimerProvider");
  return ctx;
}
function formatTime$1(totalSeconds) {
  if (totalSeconds <= 0) return "0:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor(totalSeconds % 3600 / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function SleepTimerProvider({ children }) {
  const { togglePlay, isPlaying } = usePlayer();
  const { t } = useTranslation();
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef(null);
  const wasActiveRef = useRef(false);
  const clearInterval_ = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  const cancelTimer = useCallback(() => {
    clearInterval_();
    wasActiveRef.current = false;
    setRemainingSeconds(0);
  }, [clearInterval_]);
  const startTimer = useCallback((minutes) => {
    clearInterval_();
    const totalSeconds = minutes * 60;
    setRemainingSeconds(totalSeconds);
    wasActiveRef.current = true;
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval_();
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
  }, [clearInterval_]);
  useEffect(() => {
    if (remainingSeconds === 0 && wasActiveRef.current) {
      wasActiveRef.current = false;
      if (isPlaying) {
        togglePlay();
      }
      toast({
        title: "💤 " + t("sleepTimer.title"),
        description: t("sleepTimer.stopped")
      });
    }
  }, [remainingSeconds, isPlaying, togglePlay]);
  useEffect(() => {
    return () => clearInterval_();
  }, [clearInterval_]);
  const formattedTime = formatTime$1(remainingSeconds);
  const isActive = remainingSeconds > 0;
  return /* @__PURE__ */ jsx(SleepTimerContext.Provider, { value: { remainingSeconds, isActive, startTimer, cancelTimer, formattedTime }, children });
}
const tabConfig = [
  { id: "home", labelKey: "nav.home", icon: Home },
  { id: "search", labelKey: "nav.search", icon: Search },
  { id: "library", labelKey: "nav.library", icon: Bookmark },
  { id: "settings", labelKey: "nav.settings", icon: Settings }
];
function BottomNav({ activeTab, onTabChange }) {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("nav", { className: "fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-secondary/60 backdrop-blur-lg border-t border-border px-2 py-1 pb-[env(safe-area-inset-bottom)] lg:hidden", children: tabConfig.map(({ id, labelKey, icon: Icon }) => /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: () => onTabChange(id),
      "aria-label": t(labelKey),
      className: cn(
        "flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors min-w-[60px]",
        activeTab === id ? "text-primary" : "text-muted-foreground"
      ),
      children: [
        /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-medium relative", children: [
          t(labelKey),
          activeTab === id && /* @__PURE__ */ jsx("span", { className: "absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-[2px] rounded-full bg-primary shadow-[0_0_6px_2px_hsl(var(--primary)/0.6),0_0_12px_4px_hsl(var(--primary)/0.3)]" })
        ] })
      ]
    },
    id
  )) });
}
function EqBars({ className, barCount = 4, size = "sm", animate = true }) {
  const h = size === "sm" ? "h-3" : "h-5";
  const w = size === "sm" ? "w-[3px]" : "w-[3px]";
  const gap = size === "sm" ? "gap-[2px]" : "gap-[3px]";
  const barStyles = useMemo(
    () => Array.from({ length: barCount }).map(() => ({
      duration: 0.4 + Math.random() * 0.6,
      // 0.4s–1.0s
      delay: Math.random() * 0.5
    })),
    [barCount]
  );
  return /* @__PURE__ */ jsx("div", { className: cn("flex items-end", gap, h, className), children: barStyles.map((style, i) => /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        w,
        "rounded-full transition-all duration-300",
        animate ? "animate-eq-bar" : ""
      ),
      style: {
        background: animate ? "linear-gradient(to top, hsl(220,90%,60%), hsl(280,80%,60%))" : "hsl(var(--muted-foreground) / 0.3)",
        animationDuration: animate ? `${style.duration}s` : void 0,
        animationDelay: animate ? `${style.delay}s` : void 0,
        height: animate ? void 0 : "40%"
      }
    },
    i
  )) });
}
const MARQUEE_SPEED = 40;
function MiniPlayer() {
  const { currentEpisode, isPlaying, isBuffering, togglePlay, openFullScreen, progress } = usePlayer();
  const textContainerRef = useRef(null);
  const measureRef = useRef(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [marqueeDuration, setMarqueeDuration] = useState(10);
  const podcastName = (currentEpisode == null ? void 0 : currentEpisode.feedTitle) || (currentEpisode == null ? void 0 : currentEpisode.feedAuthor) || "";
  const episodeName = (currentEpisode == null ? void 0 : currentEpisode.title) || "";
  const displayTitle = podcastName || episodeName;
  const displayEpisode = podcastName ? episodeName : "";
  useEffect(() => {
    const check = () => {
      if (measureRef.current && textContainerRef.current) {
        const textWidth = measureRef.current.scrollWidth;
        const containerWidth = textContainerRef.current.clientWidth;
        const overflow = textWidth > containerWidth;
        setNeedsMarquee(overflow);
        if (overflow) setMarqueeDuration(textWidth / MARQUEE_SPEED);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [displayEpisode]);
  if (!currentEpisode) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "fixed left-0 right-0 z-30 flex flex-col cursor-pointer lg:hidden",
      style: { bottom: "calc(56px + env(safe-area-inset-bottom, 0px))" },
      onClick: openFullScreen,
      children: [
        /* @__PURE__ */ jsx("div", { className: "h-[3px] bg-muted w-full", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] transition-all duration-300",
            style: { width: `${progress * 100}%` }
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-2 bg-secondary/80 backdrop-blur-lg border-t border-border", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-10 h-10 rounded-md bg-accent flex items-center justify-center overflow-hidden flex-shrink-0",
              style: { boxShadow: "0 4px 15px -3px hsla(250, 80%, 50%, 0.4)" },
              children: /* @__PURE__ */ jsx(
                CachedImage,
                {
                  src: currentEpisode.image || currentEpisode.feedImage,
                  alt: currentEpisode.title,
                  loading: "eager",
                  className: "w-full h-full object-cover"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 flex items-center gap-2", children: [
            isPlaying && /* @__PURE__ */ jsx(EqBars, { size: "sm", className: "flex-shrink-0" }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent truncate", children: displayTitle }),
              /* @__PURE__ */ jsx("span", { ref: measureRef, className: "text-xs whitespace-nowrap absolute invisible pointer-events-none", children: displayEpisode }),
              /* @__PURE__ */ jsx("div", { ref: textContainerRef, className: "overflow-hidden", children: /* @__PURE__ */ jsx(
                "p",
                {
                  className: `text-xs text-muted-foreground whitespace-nowrap ${needsMarquee ? "w-fit animate-marquee" : ""}`,
                  style: needsMarquee ? { animationDuration: `${marqueeDuration}s` } : void 0,
                  children: needsMarquee ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    displayEpisode,
                    "   •   ",
                    displayEpisode,
                    "   •   "
                  ] }) : displayEpisode
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                togglePlay();
              },
              "aria-label": isPlaying ? "Pause" : "Play",
              className: `w-10 h-10 rounded-full bg-gradient-to-b from-primary to-primary/80 border-t border-white/20 flex items-center justify-center text-primary-foreground active:shadow-sm active:translate-y-0.5 transition-all flex-shrink-0 ${isPlaying ? "animate-play-breathe" : "shadow-lg shadow-primary/50"}`,
              children: isBuffering ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 ml-0.5" })
            }
          )
        ] })
      ]
    }
  );
}
let CastPluginInstance = null;
function getCastPlugin() {
  if (!CastPluginInstance) {
    CastPluginInstance = registerPlugin("CastPlugin");
  }
  return CastPluginInstance;
}
function isCapacitorNative() {
  var _a, _b, _c, _d2;
  try {
    return !!((_b = (_a = window.Capacitor) == null ? void 0 : _a.isNativePlatform) == null ? void 0 : _b.call(_a)) && ((_d2 = (_c = window.Capacitor) == null ? void 0 : _c.getPlatform) == null ? void 0 : _d2.call(_c)) === "android";
  } catch {
    return false;
  }
}
function useCast() {
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castDeviceName, setCastDeviceName] = useState(null);
  const [castUiMode, setCastUiMode] = useState("none");
  const [castInitState, setCastInitState] = useState("idle");
  const isNative2 = useRef(isCapacitorNative());
  useEffect(() => {
    if (isNative2.current) {
      initNativeCast();
    } else {
      initWebCast();
    }
  }, []);
  const initNativeCast = async () => {
    setCastInitState("initializing");
    try {
      const plugin = getCastPlugin();
      await plugin.initialize();
      setCastInitState("ready");
      setIsCastAvailable(true);
      setCastUiMode("button");
      plugin.addListener("castSessionStarted", (data) => {
        setIsCasting(true);
        setCastDeviceName(data.deviceName || "Chromecast");
        setCastUiMode("full");
      });
      plugin.addListener("castSessionEnded", () => {
        setIsCasting(false);
        setCastDeviceName(null);
        setCastUiMode("button");
      });
      plugin.addListener("castDeviceAvailable", () => {
        setIsCastAvailable(true);
        setCastUiMode("button");
      });
    } catch (e) {
      console.log("[Cast] Native init failed:", e);
      setCastInitState("unavailable");
    }
  };
  const initWebCast = () => {
    setCastInitState("initializing");
    const tryInit = () => {
      var _a;
      if (window.__castSdkReady && ((_a = window.cast) == null ? void 0 : _a.framework)) {
        try {
          const castContext = window.cast.framework.CastContext.getInstance();
          castContext.setOptions({
            receiverApplicationId: "CC1AD845",
            // Default Media Receiver
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
          });
          setCastInitState("ready");
          setIsCastAvailable(true);
          setCastUiMode("button");
          castContext.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            (event) => {
              var _a2;
              const SESSION_STARTED = window.cast.framework.SessionState.SESSION_STARTED;
              const SESSION_RESUMED = window.cast.framework.SessionState.SESSION_RESUMED;
              const SESSION_ENDED = window.cast.framework.SessionState.SESSION_ENDED;
              if (event.sessionState === SESSION_STARTED || event.sessionState === SESSION_RESUMED) {
                const session = castContext.getCurrentSession();
                setIsCasting(true);
                setCastDeviceName(((_a2 = session == null ? void 0 : session.getCastDevice()) == null ? void 0 : _a2.friendlyName) || "Chromecast");
                setCastUiMode("full");
              } else if (event.sessionState === SESSION_ENDED) {
                setIsCasting(false);
                setCastDeviceName(null);
                setCastUiMode("button");
              }
            }
          );
        } catch (e) {
          console.log("[Cast] Web SDK init failed:", e);
          setCastInitState("unavailable");
        }
      }
    };
    if (window.__castSdkReady) {
      tryInit();
    } else {
      window.addEventListener("castSdkReady", tryInit, { once: true });
      setTimeout(() => {
        if (castInitState === "initializing") {
          tryInit();
          if (!isCastAvailable) setCastInitState("unavailable");
        }
      }, 1e4);
    }
  };
  const startCast = useCallback(() => {
    var _a, _b, _c;
    if (isNative2.current) {
      getCastPlugin().showCastPicker().catch(() => {
      });
    } else {
      try {
        const castContext = (_c = (_b = (_a = window.cast) == null ? void 0 : _a.framework) == null ? void 0 : _b.CastContext) == null ? void 0 : _c.getInstance();
        castContext == null ? void 0 : castContext.requestSession().catch(() => {
        });
      } catch {
      }
    }
  }, []);
  const stopCast = useCallback(() => {
    var _a, _b, _c, _d2;
    if (isNative2.current) {
      getCastPlugin().stopCasting().catch(() => {
      });
    } else {
      try {
        const castContext = (_c = (_b = (_a = window.cast) == null ? void 0 : _a.framework) == null ? void 0 : _b.CastContext) == null ? void 0 : _c.getInstance();
        (_d2 = castContext == null ? void 0 : castContext.getCurrentSession()) == null ? void 0 : _d2.endSession(true);
      } catch {
      }
    }
    setIsCasting(false);
    setCastDeviceName(null);
    setCastUiMode("button");
  }, []);
  const loadMedia = useCallback((episode) => {
    var _a, _b, _c, _d2;
    if (!episode.enclosureUrl) return;
    if (isNative2.current) {
      getCastPlugin().loadMedia({
        url: episode.enclosureUrl,
        title: episode.title || "",
        artist: episode.feedAuthor || episode.feedTitle || "",
        imageUrl: (episode.image || episode.feedImage || "").replace("http://", "https://"),
        duration: episode.duration || 0
      }).catch((e) => console.error("[Cast] loadMedia failed:", e));
    } else {
      try {
        const castSession = (_d2 = (_c = (_b = (_a = window.cast) == null ? void 0 : _a.framework) == null ? void 0 : _b.CastContext) == null ? void 0 : _c.getInstance()) == null ? void 0 : _d2.getCurrentSession();
        if (!castSession) return;
        const mediaInfo = new window.chrome.cast.media.MediaInfo(episode.enclosureUrl, "audio/mpeg");
        mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;
        mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.title = episode.title || "";
        mediaInfo.metadata.subtitle = episode.feedAuthor || episode.feedTitle || "";
        const imageUrl = (episode.image || episode.feedImage || "").replace("http://", "https://");
        if (imageUrl) {
          mediaInfo.metadata.images = [new window.chrome.cast.Image(imageUrl)];
        }
        const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
        request.autoplay = true;
        castSession.loadMedia(request).then(() => {
          console.log("[Cast] Media loaded on web");
        }).catch((e) => console.error("[Cast] Web loadMedia failed:", e));
      } catch (e) {
        console.error("[Cast] Web loadMedia error:", e);
      }
    }
  }, []);
  const toggleCastPlayPause = useCallback(() => {
    var _a, _b, _c, _d2;
    if (isNative2.current) {
      getCastPlugin().togglePlayPause().catch(() => {
      });
    } else {
      try {
        const session = (_d2 = (_c = (_b = (_a = window.cast) == null ? void 0 : _a.framework) == null ? void 0 : _b.CastContext) == null ? void 0 : _c.getInstance()) == null ? void 0 : _d2.getCurrentSession();
        const controller = session == null ? void 0 : session.getRemoteMediaClient();
        if (controller) {
          if (controller.playerState === window.chrome.cast.media.PlayerState.PLAYING) {
            controller.pause();
          } else {
            controller.play();
          }
        }
      } catch {
      }
    }
  }, []);
  return {
    isCastAvailable,
    isCasting,
    castDeviceName,
    castUiMode,
    castInitState,
    startCast,
    stopCast,
    loadMedia,
    toggleCastPlayPause
  };
}
const Slider = React.forwardRef(({ className, orientation = "horizontal", ...props }, ref) => {
  const isVertical = orientation === "vertical";
  return /* @__PURE__ */ jsxs(
    SliderPrimitive.Root,
    {
      ref,
      orientation,
      className: cn(
        "relative flex touch-none select-none",
        isVertical ? "flex-col w-5 h-full items-center" : "w-full items-center",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx(SliderPrimitive.Track, { className: cn(
          "relative grow overflow-hidden rounded-full bg-secondary",
          isVertical ? "w-2 h-full" : "h-2 w-full"
        ), children: /* @__PURE__ */ jsx(SliderPrimitive.Range, { className: cn(
          "absolute bg-primary",
          isVertical ? "w-full" : "h-full"
        ) }) }),
        /* @__PURE__ */ jsx(SliderPrimitive.Thumb, { className: "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" })
      ]
    }
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;
const PLAYBACK_RATES = [1, 1.2, 1.5, 2];
function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
function FullScreenPlayer() {
  const {
    currentEpisode,
    isPlaying,
    isBuffering,
    togglePlay,
    volume,
    setVolume,
    isFullScreen,
    closeFullScreen,
    currentTime,
    duration,
    seek,
    skipForward,
    skipBackward,
    playbackRate,
    setPlaybackRate,
    isVoiceBoostEnabled,
    toggleVoiceBoost
  } = usePlayer();
  const { isEpisodeDownloaded, downloading, startDownload } = useDownloads();
  const { t } = useTranslation();
  const { isCastAvailable, isCasting, castDeviceName, startCast, stopCast } = useCast();
  const { isSubscribed, toggleSubscription } = useFavoritesContext();
  const epTitleRef = useRef(null);
  const epMeasureRef = useRef(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [marqueeDuration, setMarqueeDuration] = useState(10);
  useEffect(() => {
    const check = () => {
      if (epMeasureRef.current && epTitleRef.current) {
        const textW = epMeasureRef.current.scrollWidth;
        const containerW = epTitleRef.current.clientWidth;
        const overflow = textW > containerW;
        setNeedsMarquee(overflow);
        if (overflow) setMarqueeDuration(textW / 40);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [currentEpisode == null ? void 0 : currentEpisode.title, isFullScreen]);
  if (!isFullScreen || !currentEpisode) return null;
  const handleShare = async () => {
    const text = `🎧 ${currentEpisode.title} — ${currentEpisode.feedTitle}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: currentEpisode.title, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast$1.success("Copied!");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        toast$1.success("Copied!");
      } catch {
      }
    }
  };
  const handleDownload = async () => {
    if (!currentEpisode) return;
    if (isEpisodeDownloaded(currentEpisode.id) || downloading[currentEpisode.id] !== void 0) return;
    const ok = await startDownload(currentEpisode);
    if (ok) toast$1.success(t("download.success"));
    else toast$1.error(t("download.error"));
  };
  const artwork = currentEpisode.image || currentEpisode.feedImage;
  const epDownloaded = currentEpisode ? isEpisodeDownloaded(currentEpisode.id) : false;
  const epDownloading = currentEpisode ? downloading[currentEpisode.id] !== void 0 : false;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 bg-background flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 pb-2", style: { paddingTop: "max(env(safe-area-inset-top, 24px), 1.5rem)" }, children: [
      /* @__PURE__ */ jsx("button", { onClick: closeFullScreen, className: "p-2 -ml-2", "aria-label": t("common.cancel"), children: /* @__PURE__ */ jsx(ChevronDown, { className: "w-6 h-6 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              if (!currentEpisode) return;
              const podcast = {
                id: currentEpisode.feedId,
                title: currentEpisode.feedTitle || currentEpisode.title,
                author: currentEpisode.feedAuthor || "",
                image: currentEpisode.feedImage || currentEpisode.image,
                description: "",
                url: "",
                categories: [],
                lastEpisodeDate: 0,
                language: ""
              };
              toggleSubscription(podcast);
            },
            className: "p-2",
            "aria-label": "Favorite",
            children: /* @__PURE__ */ jsx(Bookmark, { className: cn("w-5 h-5", currentEpisode && isSubscribed(currentEpisode.feedId) ? "fill-primary text-primary" : "text-muted-foreground") })
          }
        ),
        /* @__PURE__ */ jsx("button", { onClick: handleDownload, className: "p-2", disabled: epDownloaded || epDownloading, "aria-label": t("download.download"), children: epDownloading ? /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 text-muted-foreground animate-spin" }) : epDownloaded ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5 text-primary" }) : /* @__PURE__ */ jsx(Download, { className: "w-5 h-5 text-muted-foreground" }) })
      ] }),
      isCasting && /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: [
        "📺 ",
        castDeviceName
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        isCastAvailable && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: isCasting ? stopCast : startCast,
            className: cn("p-2", isCasting && "text-primary"),
            "aria-label": "Cast",
            children: /* @__PURE__ */ jsx(Cast, { className: cn("w-5 h-5", isCasting ? "text-primary" : "text-muted-foreground") })
          }
        ),
        /* @__PURE__ */ jsx("button", { onClick: handleShare, className: "p-2 -mr-2", "aria-label": "Share", children: /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5 text-muted-foreground" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center px-10", children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "aspect-square w-full max-w-[300px] rounded-2xl bg-accent shadow-2xl overflow-hidden",
        style: { boxShadow: "0 20px 60px -10px hsla(250, 80%, 50%, 0.5), 0 10px 30px -5px hsla(220, 90%, 60%, 0.3)" },
        children: /* @__PURE__ */ jsx(
          CachedImage,
          {
            src: artwork,
            alt: currentEpisode.title,
            className: "w-full h-full object-cover",
            loading: "eager"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 pb-[calc(max(env(safe-area-inset-bottom,16px),1rem)+6rem)] space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(EqBars, { barCount: 20, size: "md", animate: isPlaying, className: "flex-shrink-0" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-heading font-bold leading-tight bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent line-clamp-2", children: /* @__PURE__ */ jsx("span", { children: currentEpisode.feedTitle || currentEpisode.feedAuthor || currentEpisode.title }) }),
            (currentEpisode.feedTitle || currentEpisode.feedAuthor) && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { ref: epMeasureRef, className: "text-sm whitespace-nowrap absolute invisible pointer-events-none", children: currentEpisode.title }),
              /* @__PURE__ */ jsx("div", { ref: epTitleRef, className: "mt-1 overflow-hidden", children: /* @__PURE__ */ jsx(
                "p",
                {
                  className: `text-sm text-muted-foreground whitespace-nowrap ${needsMarquee ? "w-fit animate-marquee" : "truncate"}`,
                  style: needsMarquee ? { animationDuration: `${marqueeDuration}s` } : void 0,
                  children: needsMarquee ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    currentEpisode.title,
                    "   •   ",
                    currentEpisode.title,
                    "   •   "
                  ] }) : currentEpisode.title
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx(
              Slider,
              {
                value: [currentTime],
                min: 0,
                max: duration || 1,
                step: 1,
                onValueChange: ([v]) => seek(v),
                className: "[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[hsl(220,90%,60%)] [&_[role=slider]]:to-[hsl(280,80%,60%)] [&_[role=slider]]:border-0 [&_.absolute]:bg-gradient-to-r [&_.absolute]:from-[hsl(220,90%,60%)] [&_.absolute]:to-[hsl(280,80%,60%)]"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground font-mono", children: formatTime(currentTime) }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground font-mono", children: [
                "-",
                formatTime(Math.max(0, duration - currentTime))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-6", children: [
            /* @__PURE__ */ jsxs("button", { onClick: skipBackward, className: "w-12 h-12 rounded-full bg-accent flex items-center justify-center text-foreground hover:bg-accent/80 transition-colors relative", children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsx("span", { className: "absolute text-[8px] font-bold mt-0.5", children: "15" })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: togglePlay,
                className: `w-16 h-16 rounded-full bg-gradient-to-b from-primary to-primary/80 border-t border-white/20 flex items-center justify-center text-primary-foreground active:shadow-sm active:translate-y-0.5 transition-all ${isPlaying ? "animate-play-breathe" : "shadow-lg shadow-primary/50"}`,
                children: isBuffering ? /* @__PURE__ */ jsx(Loader2, { className: "w-7 h-7 animate-spin" }) : isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-7 h-7" }) : /* @__PURE__ */ jsx(Play, { className: "w-7 h-7 ml-1" })
              }
            ),
            /* @__PURE__ */ jsxs("button", { onClick: skipForward, className: "w-12 h-12 rounded-full bg-accent flex items-center justify-center text-foreground hover:bg-accent/80 transition-colors relative", children: [
              /* @__PURE__ */ jsx(RotateCw, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsx("span", { className: "absolute text-[8px] font-bold mt-0.5", children: "30" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-2", children: PLAYBACK_RATES.map((rate) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setPlaybackRate(rate),
              className: cn(
                "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                playbackRate === rate ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
              ),
              children: [
                rate,
                "x"
              ]
            },
            rate
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2 pt-2 flex-shrink-0", style: { height: "160px" }, children: [
          /* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" }),
          /* @__PURE__ */ jsx(
            Slider,
            {
              value: [volume * 100],
              onValueChange: ([v]) => setVolume(v / 100),
              max: 100,
              step: 1,
              orientation: "vertical",
              className: "h-full [&_[role=slider]]:bg-gradient-to-b [&_[role=slider]]:from-[hsl(220,90%,60%)] [&_[role=slider]]:to-[hsl(280,80%,60%)] [&_[role=slider]]:border-0 [&_.absolute]:bg-gradient-to-b [&_.absolute]:from-[hsl(220,90%,60%)] [&_.absolute]:to-[hsl(280,80%,60%)]"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const FLAGS = {
  fr: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "213.3", height: "480", fill: "#002395" }),
    /* @__PURE__ */ jsx("rect", { x: "213.3", width: "213.4", height: "480", fill: "#fff" }),
    /* @__PURE__ */ jsx("rect", { x: "426.7", width: "213.3", height: "480", fill: "#ed2939" })
  ] }),
  en: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("path", { fill: "#012169", d: "M0 0h640v480H0z" }),
    /* @__PURE__ */ jsx("path", { fill: "#FFF", d: "m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z" }),
    /* @__PURE__ */ jsx("path", { fill: "#C8102E", d: "m424 281 216 159v40L369 281zm-184 20 6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z" }),
    /* @__PURE__ */ jsx("path", { fill: "#FFF", d: "M241 0v480h160V0zM0 160v160h640V160z" }),
    /* @__PURE__ */ jsx("path", { fill: "#C8102E", d: "M0 193v96h640v-96zM273 0v480h96V0z" })
  ] }),
  es: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "480", fill: "#c60b1e" }),
    /* @__PURE__ */ jsx("rect", { y: "120", width: "640", height: "240", fill: "#ffc400" })
  ] }),
  de: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "160", fill: "#000" }),
    /* @__PURE__ */ jsx("rect", { y: "160", width: "640", height: "160", fill: "#D00" }),
    /* @__PURE__ */ jsx("rect", { y: "320", width: "640", height: "160", fill: "#FFCE00" })
  ] }),
  ja: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "480", fill: "#fff" }),
    /* @__PURE__ */ jsx("circle", { cx: "320", cy: "240", r: "120", fill: "#bc002d" })
  ] }),
  it: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "213.3", height: "480", fill: "#009246" }),
    /* @__PURE__ */ jsx("rect", { x: "213.3", width: "213.4", height: "480", fill: "#fff" }),
    /* @__PURE__ */ jsx("rect", { x: "426.7", width: "213.3", height: "480", fill: "#ce2b37" })
  ] }),
  nl: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "160", fill: "#AE1C28" }),
    /* @__PURE__ */ jsx("rect", { y: "160", width: "640", height: "160", fill: "#fff" }),
    /* @__PURE__ */ jsx("rect", { y: "320", width: "640", height: "160", fill: "#21468B" })
  ] }),
  pt: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "480", fill: "#009b3a" }),
    /* @__PURE__ */ jsx("polygon", { points: "320,40 600,240 320,440 40,240", fill: "#fedf00" }),
    /* @__PURE__ */ jsx("circle", { cx: "320", cy: "240", r: "80", fill: "#002776" }),
    /* @__PURE__ */ jsx("path", { d: "M244 240a76 76 0 0 1 152 0", fill: "none", stroke: "#fff", strokeWidth: "4" })
  ] }),
  pl: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "240", fill: "#fff" }),
    /* @__PURE__ */ jsx("rect", { y: "240", width: "640", height: "240", fill: "#DC143C" })
  ] }),
  zh: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "480", fill: "#DE2910" }),
    /* @__PURE__ */ jsx("g", { transform: "translate(96,36)", fill: "#FFDE00", children: /* @__PURE__ */ jsx("polygon", { points: "0,-48 11,-15 45,-15 18,6 28,39 0,18 -28,39 -18,6 -45,-15 -11,-15" }) }),
    /* @__PURE__ */ jsx("g", { transform: "translate(192,12)", fill: "#FFDE00", children: /* @__PURE__ */ jsx("polygon", { points: "0,-16 4,-5 15,-5 6,2 9,13 0,6 -9,13 -6,2 -15,-5 -4,-5" }) }),
    /* @__PURE__ */ jsx("g", { transform: "translate(216,48)", fill: "#FFDE00", children: /* @__PURE__ */ jsx("polygon", { points: "0,-16 4,-5 15,-5 6,2 9,13 0,6 -9,13 -6,2 -15,-5 -4,-5" }) }),
    /* @__PURE__ */ jsx("g", { transform: "translate(216,96)", fill: "#FFDE00", children: /* @__PURE__ */ jsx("polygon", { points: "0,-16 4,-5 15,-5 6,2 9,13 0,6 -9,13 -6,2 -15,-5 -4,-5" }) }),
    /* @__PURE__ */ jsx("g", { transform: "translate(192,132)", fill: "#FFDE00", children: /* @__PURE__ */ jsx("polygon", { points: "0,-16 4,-5 15,-5 6,2 9,13 0,6 -9,13 -6,2 -15,-5 -4,-5" }) })
  ] }),
  tr: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "480", fill: "#E30A17" }),
    /* @__PURE__ */ jsx("circle", { cx: "260", cy: "240", r: "120", fill: "#fff" }),
    /* @__PURE__ */ jsx("circle", { cx: "288", cy: "240", r: "96", fill: "#E30A17" }),
    /* @__PURE__ */ jsx("polygon", { points: "384,240 340,218 356,260 328,232 360,252", fill: "#fff" })
  ] }),
  ru: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "160", fill: "#fff" }),
    /* @__PURE__ */ jsx("rect", { y: "160", width: "640", height: "160", fill: "#0039A6" }),
    /* @__PURE__ */ jsx("rect", { y: "320", width: "640", height: "160", fill: "#D52B1E" })
  ] }),
  id: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "240", fill: "#CE1126" }),
    /* @__PURE__ */ jsx("rect", { y: "240", width: "640", height: "240", fill: "#fff" })
  ] }),
  ar: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 640 480", className: "w-full h-full", children: [
    /* @__PURE__ */ jsx("rect", { width: "640", height: "160", fill: "#006c35" }),
    /* @__PURE__ */ jsx("rect", { y: "160", width: "640", height: "160", fill: "#fff" }),
    /* @__PURE__ */ jsx("rect", { y: "320", width: "640", height: "160", fill: "#000" }),
    /* @__PURE__ */ jsx("text", { x: "320", y: "260", textAnchor: "middle", fill: "#006c35", fontSize: "80", fontFamily: "serif", children: "لا إله إلا الله" })
  ] })
};
function FlagIcon({ lang, className = "w-6 h-4" }) {
  const flag = FLAGS[lang];
  if (!flag) return null;
  return /* @__PURE__ */ jsx("span", { className: `inline-block rounded-sm overflow-hidden shadow-sm ${className}`, children: flag });
}
const podcastSphereLogo = "/assets/podcast-sphere-logo-new-DImQX8aU.png";
const radiosphereIcon = "/assets/radiosphere-icon-DXiD67yH.png";
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Label, { ref, className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className), ...props }));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Separator, { ref, className: cn("-mx-1 my-1 h-px bg-muted", className), ...props }));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const navItems = [
  { id: "home", labelKey: "nav.home", icon: Home },
  { id: "search", labelKey: "nav.search", icon: Search },
  { id: "library", labelKey: "nav.library", icon: Bookmark },
  { id: "settings", labelKey: "nav.settings", icon: Settings }
];
function LanguageDropdown() {
  const { language, setLanguage } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "px-4", children: /* @__PURE__ */ jsxs(Select, { value: language, onValueChange: (v) => setLanguage(v), children: [
    /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full rounded-lg bg-sidebar-accent/60 border border-sidebar-border/50 hover:bg-sidebar-accent text-foreground", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
    /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGE_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(FlagIcon, { lang: opt.value, className: "w-5 h-3.5 shrink-0" }),
      opt.label
    ] }) }, opt.value)) })
  ] }) });
}
function DesktopSidebar({ activeTab, onTabChange }) {
  const { t, language, setLanguage } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const toggleButton = /* @__PURE__ */ jsx(
    "button",
    {
      onClick: () => setCollapsed(!collapsed),
      className: "absolute top-1/2 -translate-y-1/2 -right-3.5 z-20 w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 hover:scale-110 transition-all shadow-[0_0_12px_-2px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_18px_-2px_hsl(var(--primary)/0.6)]",
      title: collapsed ? "Ouvrir la sidebar" : "Replier la sidebar",
      children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "w-3.5 h-3.5" })
    }
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    collapsed && /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex flex-col items-center pt-4 pb-4 w-16 h-full bg-sidebar border-r border-sidebar-border flex-shrink-0 relative", children: [
      toggleButton,
      /* @__PURE__ */ jsx(
        "img",
        {
          src: podcastSphereLogo,
          alt: "Podcast Sphere",
          className: "w-10 h-10 rounded-xl mix-blend-screen mb-5 mt-2"
        }
      ),
      /* @__PURE__ */ jsx("nav", { className: "space-y-1 w-full px-2", children: navItems.map(({ id, labelKey, icon: Icon }) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onTabChange(id),
          className: cn(
            "w-full flex items-center justify-center py-2.5 rounded-xl transition-all",
            activeTab === id ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)]" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          ),
          title: t(labelKey),
          children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" })
        },
        id
      )) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "https://radiosphere.be",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "group relative w-11 h-11 rounded-xl overflow-hidden border border-sidebar-border/50 hover:border-primary/40 hover:scale-105 transition-all shadow-sm hover:shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)] mb-3",
          title: "RadioSphere.be",
          children: /* @__PURE__ */ jsx(
            "img",
            {
              src: radiosphereIcon,
              alt: "RadioSphere.be",
              className: "w-full h-full object-cover"
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs(Popover, { children: [
        /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
          "button",
          {
            className: "w-11 h-8 rounded-lg bg-sidebar-accent/60 border border-sidebar-border/50 flex items-center justify-center hover:bg-sidebar-accent transition-colors",
            title: t("settings.language"),
            children: /* @__PURE__ */ jsx(FlagIcon, { lang: language, className: "w-6 h-4" })
          }
        ) }),
        /* @__PURE__ */ jsx(PopoverContent, { side: "right", align: "end", className: "w-44 p-1", children: LANGUAGE_OPTIONS.map((opt) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setLanguage(opt.value),
            className: cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
              language === opt.value ? "text-primary font-semibold" : "text-foreground hover:bg-accent"
            ),
            children: [
              /* @__PURE__ */ jsx(FlagIcon, { lang: opt.value, className: "w-5 h-3.5 shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: opt.label })
            ]
          },
          opt.value
        )) })
      ] })
    ] }),
    !collapsed && /* @__PURE__ */ jsxs(
      "aside",
      {
        role: "navigation",
        "aria-label": "Navigation",
        className: "hidden lg:flex flex-col w-72 h-full bg-sidebar border-r border-sidebar-border flex-shrink-0 relative",
        children: [
          toggleButton,
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-6 pt-8 pb-6", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: podcastSphereLogo,
                alt: "Podcast Sphere",
                className: "w-11 h-11 rounded-xl mix-blend-screen"
              }
            ),
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-heading font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: "Podcast Sphere" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "px-5 pb-4", children: /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground leading-relaxed", children: t("sidebar.description") }) }),
          /* @__PURE__ */ jsx("nav", { className: "px-3 space-y-1", children: navItems.map(({ id, labelKey, icon: Icon }) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => onTabChange(id),
              className: cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === id ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.3)] shadow-[0_0_12px_-3px_hsl(var(--primary)/0.25)]" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              ),
              children: [
                /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" }),
                t(labelKey)
              ]
            },
            id
          )) }),
          /* @__PURE__ */ jsx("div", { className: "flex-1" }),
          /* @__PURE__ */ jsxs("div", { className: "px-4 pb-6 pt-4 space-y-3", children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "https://radiosphere.be",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-sidebar-accent/60 hover:bg-sidebar-accent border border-sidebar-border/50 transition-colors group",
                children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: radiosphereIcon,
                      alt: "RadioSphere.be",
                      className: "w-11 h-11 rounded-lg flex-shrink-0"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-base font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(280,80%,60%)] bg-clip-text text-transparent", children: "RadioSphere.be" }),
                      /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", className: "w-3 h-3 text-muted-foreground", children: /* @__PURE__ */ jsx("path", { d: "M4.5 2A2.5 2.5 0 0 0 2 4.5v7A2.5 2.5 0 0 0 4.5 14h7a2.5 2.5 0 0 0 2.5-2.5v-3a.75.75 0 0 1 1.5 0v3A4 4 0 0 1 11.5 15.5h-7A4 4 0 0 1 .5 11.5v-7A4 4 0 0 1 4.5.5h3a.75.75 0 0 1 0 1.5h-3ZM9 .75A.75.75 0 0 1 9.75 0h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V2.56l-4.72 4.72a.75.75 0 0 1-1.06-1.06L13.44 1.5H9.75A.75.75 0 0 1 9 .75Z" }) })
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground truncate", children: t("sidebar.radioDescription") || "Écoutez la radio en direct" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "mailto:info@radiosphere.be",
                className: "flex items-center gap-2 px-4 py-2 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-sidebar-accent transition-colors",
                children: [
                  /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4" }),
                  "info@radiosphere.be"
                ]
              }
            ),
            /* @__PURE__ */ jsx(LanguageDropdown, {}),
            /* @__PURE__ */ jsx("p", { className: "px-4 text-[10px] text-muted-foreground leading-relaxed", children: t("footer.poweredBy") })
          ] })
        ]
      }
    )
  ] });
}
function MarqueeText({
  text,
  active = false,
  hoverActivates = true,
  className = ""
}) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const [needsMarquee, setNeedsMarquee] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [duration, setDuration] = useState(10);
  useEffect(() => {
    const check = () => {
      if (measureRef.current && containerRef.current) {
        const textW = measureRef.current.scrollWidth;
        const containerW = containerRef.current.clientWidth;
        const overflow = textW > containerW + 1;
        setNeedsMarquee(overflow);
        if (overflow) setDuration(Math.max(textW / 40, 5));
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);
  const shouldScroll = needsMarquee && (active || hoverActivates && hovering);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: "overflow-hidden",
      onMouseEnter: hoverActivates ? () => setHovering(true) : void 0,
      onMouseLeave: hoverActivates ? () => setHovering(false) : void 0,
      onFocus: hoverActivates ? () => setHovering(true) : void 0,
      onBlur: hoverActivates ? () => setHovering(false) : void 0,
      children: [
        /* @__PURE__ */ jsx("span", { ref: measureRef, className: "absolute invisible pointer-events-none whitespace-nowrap text-sm", children: text }),
        /* @__PURE__ */ jsx(
          "p",
          {
            className: `whitespace-nowrap ${shouldScroll ? "w-fit animate-marquee" : "truncate"} ${className}`,
            style: shouldScroll ? { animationDuration: `${duration}s` } : void 0,
            title: needsMarquee ? text : void 0,
            children: shouldScroll ? /* @__PURE__ */ jsxs(Fragment, { children: [
              text,
              "   •   ",
              text,
              "   •   "
            ] }) : text
          }
        )
      ]
    }
  );
}
function DesktopPlayerBar() {
  const {
    currentEpisode,
    isPlaying,
    isBuffering,
    togglePlay,
    volume,
    setVolume,
    openFullScreen,
    playNext,
    playPrevious
  } = usePlayer();
  const { t } = useTranslation();
  if (!currentEpisode) {
    return /* @__PURE__ */ jsx("div", { className: "hidden lg:flex items-center justify-center h-20 bg-secondary/60 backdrop-blur-lg border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Headphones, { className: "w-5 h-5" }),
      /* @__PURE__ */ jsx("span", { className: "text-sm", children: t("player.selectEpisode") })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex items-center h-20 bg-secondary/60 backdrop-blur-lg border-t border-border px-6 gap-6", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: openFullScreen,
        "aria-label": t("player.openFullScreen") || "Open full player",
        className: "flex items-center gap-4 w-80 flex-shrink-0 text-left cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg",
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "w-14 h-14 rounded-lg bg-accent overflow-hidden flex-shrink-0 group-hover:shadow-lg group-hover:shadow-primary/20 transition-shadow",
              style: { boxShadow: "0 4px 20px -4px hsla(250, 80%, 50%, 0.4)" },
              children: /* @__PURE__ */ jsx(
                CachedImage,
                {
                  src: currentEpisode.image || currentEpisode.feedImage || "",
                  alt: currentEpisode.title,
                  className: "w-full h-full object-cover"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx(
              MarqueeText,
              {
                text: currentEpisode.title,
                active: isPlaying,
                className: "text-sm font-heading font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(280,80%,60%)] bg-clip-text text-transparent"
              }
            ),
            /* @__PURE__ */ jsx(
              MarqueeText,
              {
                text: currentEpisode.feedTitle || "",
                active: isPlaying,
                className: "text-xs text-muted-foreground"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: playPrevious, className: "p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(SkipBack, { className: "w-5 h-5" }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: togglePlay,
          className: `w-12 h-12 rounded-full bg-gradient-to-b from-primary to-primary/80 border-t border-white/20 flex items-center justify-center text-primary-foreground transition-all ${isPlaying ? "" : "shadow-lg shadow-primary/50"}`,
          children: isBuffering ? /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : isPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Play, { className: "w-5 h-5 ml-0.5" })
        }
      ),
      /* @__PURE__ */ jsx("button", { onClick: playNext, className: "p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(SkipForward, { className: "w-5 h-5" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 w-64 flex-shrink-0 justify-end", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-36", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setVolume(volume > 0 ? 0 : 0.7), className: "p-1 text-muted-foreground hover:text-foreground transition-colors", children: volume === 0 ? /* @__PURE__ */ jsx(VolumeX, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Volume2, { className: "w-4 h-4" }) }),
      /* @__PURE__ */ jsx(
        Slider,
        {
          value: [volume * 100],
          onValueChange: ([v]) => setVolume(v / 100),
          max: 100,
          step: 1,
          className: "flex-1 [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-[hsl(var(--primary))] [&_[role=slider]]:to-[hsl(280,80%,60%)] [&_[role=slider]]:border-0 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_.absolute]:bg-gradient-to-r [&_.absolute]:from-[hsl(var(--primary))] [&_.absolute]:to-[hsl(280,80%,60%)]"
        }
      )
    ] }) })
  ] });
}
function Footer() {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("footer", { className: "hidden lg:flex items-center justify-between gap-4 px-6 py-2 border-t border-border bg-secondary/30 backdrop-blur-sm text-[10px] text-muted-foreground", children: [
    /* @__PURE__ */ jsxs("span", { children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " Podcast Sphere — ",
      t("footer.createdBy")
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxs("a", { href: "https://radiosphere.be/privacy-policy-podcastsphere.html", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 hover:text-primary transition-colors", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { className: "w-3 h-3" }),
        t("settings.privacyPolicy")
      ] }),
      /* @__PURE__ */ jsxs("a", { href: "https://podcastindex.org/", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 hover:text-primary transition-colors", children: [
        /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
        "Podcast Index"
      ] }),
      /* @__PURE__ */ jsxs("a", { href: "mailto:info@radiosphere.be", className: "inline-flex items-center gap-1 hover:text-primary transition-colors", children: [
        /* @__PURE__ */ jsx(Mail, { className: "w-3 h-3" }),
        "info@radiosphere.be"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("a", { href: "https://radiosphere.be", target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 hover:text-primary transition-colors", children: [
      /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
      "radiosphere.be"
    ] })
  ] });
}
function CategoryAnimation({ category }) {
  switch (category) {
    case "Technology":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-cyan-400/40 animate-wave-1" }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-cyan-400/25 animate-wave-2" }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-cyan-400/15 animate-wave-3" })
      ] });
    case "Comedy":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none animate-orbit-clouds", style: { animationDuration: "8s" }, children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-0 left-1/2 text-[8px] font-bold text-yellow-300/80 drop-shadow-sm", style: { textShadow: "0 0 4px rgba(255,220,0,0.4)" }, children: "ha" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-1 right-1 text-[7px] font-bold text-yellow-200/70 drop-shadow-sm", style: { textShadow: "0 0 4px rgba(255,220,0,0.3)" }, children: "ha" }),
        /* @__PURE__ */ jsx("span", { className: "absolute left-0 top-1/2 text-[6px] font-bold text-amber-300/60 drop-shadow-sm", children: "ha" })
      ] });
    case "News":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-gray-300/35 animate-wave-1" }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-gray-300/20 animate-wave-2" }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-gray-300/10 animate-wave-3" })
      ] });
    case "True Crime":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none animate-orbit-clouds", style: { animationDuration: "10s" }, children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-0 left-1/2 text-[10px] text-red-300/70", style: { textShadow: "0 0 6px rgba(255,100,100,0.4)" }, children: "?" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 right-2 text-[8px] text-red-400/60", style: { textShadow: "0 0 4px rgba(255,80,80,0.3)" }, children: "?" }),
        /* @__PURE__ */ jsx("span", { className: "absolute left-1 top-1/3 text-[9px] text-rose-300/50", children: "?" })
      ] });
    case "Health":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none animate-orbit-clouds", style: { animationDuration: "14s" }, children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2 rounded-full bg-emerald-300/50 blur-[2px] shadow-[0_0_6px_3px_rgba(110,230,180,0.3)]" }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-1.5 rounded-full bg-teal-200/40 blur-[2px] shadow-[0_0_5px_2px_rgba(150,230,210,0.25)]" })
      ] });
    case "Business":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-2 right-2 text-[9px] text-yellow-400/70 animate-float-up", children: "↑" }),
        /* @__PURE__ */ jsx("span", { className: "absolute top-4 left-3 text-[8px] text-yellow-300/60 animate-float-down", children: "↓" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-3 right-4 text-[10px] text-amber-400/70 animate-float-up", style: { animationDelay: "0.5s" }, children: "↑" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-5 left-2 text-[7px] text-yellow-200/50 animate-float-down", style: { animationDelay: "0.7s" }, children: "↓" })
      ] });
    case "Science":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-1 left-2 text-[8px] animate-twinkle", style: { color: "rgba(180,160,255,0.8)" }, children: "✦" }),
        /* @__PURE__ */ jsx("span", { className: "absolute top-4 right-1 text-[6px] animate-twinkle", style: { animationDelay: "0.8s", color: "rgba(200,180,255,0.7)" }, children: "✦" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-2 left-4 text-[7px] animate-twinkle", style: { animationDelay: "1.5s", color: "rgba(160,140,255,0.6)" }, children: "✦" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-5 right-3 text-[5px] animate-twinkle", style: { animationDelay: "2.2s", color: "rgba(190,170,255,0.7)" }, children: "✧" })
      ] });
    case "Education":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none overflow-hidden", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-1 left-1 text-[7px] font-mono text-cyan-400/60 animate-matrix-fall", children: "01" }),
        /* @__PURE__ */ jsx("span", { className: "absolute top-0 right-3 text-[6px] font-mono text-green-400/50 animate-matrix-fall", style: { animationDelay: "0.6s" }, children: "10" }),
        /* @__PURE__ */ jsx("span", { className: "absolute top-2 left-1/2 text-[5px] font-mono text-cyan-300/40 animate-matrix-fall", style: { animationDelay: "1.2s" }, children: "11" }),
        /* @__PURE__ */ jsx("span", { className: "absolute top-1 right-1 text-[7px] font-mono text-green-300/50 animate-matrix-fall", style: { animationDelay: "1.8s" }, children: "0" })
      ] });
    case "Sports":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-2 left-2 text-[7px] animate-bounce-ball", children: "⚽" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-3 right-2 text-[6px] animate-bounce-ball", style: { animationDelay: "0.4s" }, children: "⚽" })
      ] });
    case "Music":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none animate-orbit-clouds", style: { animationDuration: "9s" }, children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-0 left-1/2 text-[9px] text-fuchsia-300/70", style: { textShadow: "0 0 6px rgba(220,100,255,0.4)" }, children: "♪" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 right-1 text-[7px] text-purple-300/60", style: { textShadow: "0 0 4px rgba(200,120,255,0.3)" }, children: "♫" }),
        /* @__PURE__ */ jsx("span", { className: "absolute left-0 top-1/2 text-[8px] text-pink-300/50", children: "♪" })
      ] });
    case "Society":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-1 left-1 text-[6px] font-bold text-yellow-300/60 animate-bla-pop", children: "bla" }),
        /* @__PURE__ */ jsx("span", { className: "absolute top-5 right-1 text-[5px] font-bold text-amber-200/50 animate-bla-pop", style: { animationDelay: "1s" }, children: "bla" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-2 left-3 text-[7px] font-bold text-yellow-400/55 animate-bla-pop", style: { animationDelay: "2s" }, children: "bla" })
      ] });
    case "History":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none animate-orbit-clouds", style: { animationDuration: "16s" }, children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2 rounded-full bg-amber-300/45 blur-[2px] shadow-[0_0_6px_3px_rgba(200,170,80,0.3)]" }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-1.5 rounded-full bg-yellow-200/35 blur-[2px] shadow-[0_0_5px_2px_rgba(210,190,100,0.25)]" })
      ] });
    case "Fiction":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-1 right-2 text-[8px] animate-twinkle", style: { color: "rgba(200,160,255,0.8)" }, children: "✨" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-3 left-1 text-[6px] animate-twinkle", style: { animationDelay: "1s", color: "rgba(220,180,255,0.7)" }, children: "✨" }),
        /* @__PURE__ */ jsx("span", { className: "absolute top-5 left-3 text-[5px] animate-twinkle", style: { animationDelay: "2s", color: "rgba(180,140,255,0.6)" }, children: "✨" })
      ] });
    case "Horror":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-2 left-1 text-[10px] text-red-900/70 animate-lightning", children: "⚡" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-3 right-2 text-[8px] text-gray-400/50 animate-lightning", style: { animationDelay: "1.5s" }, children: "⚡" })
      ] });
    case "Video Games":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("span", { className: "absolute top-1 left-2 text-[7px] animate-firework", style: { color: "rgba(100,255,100,0.7)" }, children: "✦" }),
        /* @__PURE__ */ jsx("span", { className: "absolute top-3 right-1 text-[6px] animate-firework", style: { animationDelay: "0.5s", color: "rgba(255,200,50,0.7)" }, children: "✦" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-2 left-4 text-[5px] animate-firework", style: { animationDelay: "1s", color: "rgba(100,200,255,0.7)" }, children: "✦" }),
        /* @__PURE__ */ jsx("span", { className: "absolute bottom-4 right-3 text-[7px] animate-firework", style: { animationDelay: "1.5s", color: "rgba(255,100,200,0.7)" }, children: "✦" })
      ] });
    case "Arts":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-2 left-1 w-1.5 h-1.5 rounded-full bg-pink-400/60 animate-paint-splash" }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-5 right-2 w-1 h-1 rounded-full bg-purple-400/50 animate-paint-splash", style: { animationDelay: "0.8s" } }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-3 left-3 w-2 h-1 rounded-full bg-fuchsia-300/55 animate-paint-splash", style: { animationDelay: "1.6s" } }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 right-4 w-1.5 h-1.5 rounded-full bg-rose-400/45 animate-paint-splash", style: { animationDelay: "2.4s" } })
      ] });
    case "Food":
      return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-20 pointer-events-none", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-6 left-3 w-1.5 h-3 rounded-full bg-white/20 blur-[2px] animate-steam" }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-5 right-3 w-1 h-2.5 rounded-full bg-white/15 blur-[2px] animate-steam", style: { animationDelay: "0.7s" } }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-7 left-1/2 w-1 h-2 rounded-full bg-white/15 blur-[1px] animate-steam", style: { animationDelay: "1.4s" } })
      ] });
    default:
      return null;
  }
}
function PodcastCard({ podcast, compact, onClick }) {
  const { isSubscribed, toggleSubscription } = useFavoritesContext();
  const { t } = useTranslation();
  const subscribed = isSubscribed(podcast.id);
  const handleToggleSub = (e) => {
    e.stopPropagation();
    toggleSubscription(podcast);
    if (!subscribed) {
      toast$1.success(`${t("podcast.subscribed")} — ${podcast.title}`);
    }
  };
  if (compact) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer",
        onClick: () => onClick == null ? void 0 : onClick(podcast),
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-accent", children: /* @__PURE__ */ jsx(
            CachedImage,
            {
              src: podcast.image,
              alt: podcast.title,
              className: "w-full h-full object-cover"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx(MarqueeText, { text: podcast.title, className: "text-sm font-semibold text-foreground" }),
            /* @__PURE__ */ jsx(MarqueeText, { text: podcast.author, className: "text-xs text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleToggleSub,
              className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-accent transition-colors",
              "aria-label": subscribed ? t("podcast.subscribed") : t("podcast.subscribe"),
              children: /* @__PURE__ */ jsx(Bookmark, { className: `w-4 h-4 ${subscribed ? "fill-primary text-primary" : "text-muted-foreground"}` })
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex-shrink-0 w-[105px] cursor-pointer group transition-transform duration-300 ease-out hover:scale-105",
      onClick: () => onClick == null ? void 0 : onClick(podcast),
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "aspect-square rounded-xl overflow-hidden bg-accent mb-2 shadow-lg group-active:scale-95 transition-all duration-300 ease-out group-hover:shadow-[0_8px_30px_-4px_hsl(var(--primary)/0.45)]",
            style: { boxShadow: "0 4px 15px -3px hsla(250, 80%, 50%, 0.3)" },
            children: /* @__PURE__ */ jsx(
              CachedImage,
              {
                src: podcast.image,
                alt: podcast.title,
                className: "w-full h-full object-cover"
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(MarqueeText, { text: podcast.title, className: "text-sm font-semibold text-foreground" }),
        /* @__PURE__ */ jsx(MarqueeText, { text: podcast.author, className: "text-xs text-muted-foreground" })
      ]
    }
  );
}
function ScrollableRow({ children }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const check = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    check();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [children]);
  const scroll = (dir) => {
    var _a;
    (_a = ref.current) == null ? void 0 : _a.scrollBy({ left: dir * 200, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
    /* @__PURE__ */ jsx("div", { ref, className: "flex gap-2 overflow-x-auto pb-2 scrollbar-hide", children }),
    canLeft && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => scroll(-1),
        className: cn(
          "absolute left-1 top-[40%] -translate-y-1/2 z-10",
          "w-8 h-14 rounded-lg bg-background/60 backdrop-blur-md border border-white/10",
          "flex items-center justify-center text-foreground shadow-lg",
          "transition-opacity duration-200"
        ),
        children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-5 h-5" })
      }
    ),
    canRight && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => scroll(1),
        className: cn(
          "absolute right-1 top-[40%] -translate-y-1/2 z-10",
          "w-8 h-14 rounded-lg bg-background/60 backdrop-blur-md border border-white/10",
          "flex items-center justify-center text-foreground shadow-lg",
          "transition-opacity duration-200"
        ),
        children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-5 h-5" })
      }
    )
  ] });
}
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("flex items-center justify-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
function MultiSelectFilter({ icon, label, options, selected, onChange, singleSelect }) {
  const [open, setOpen] = useState(false);
  const listRef = useRef(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const toggle = (value) => {
    if (singleSelect) {
      onChange([value]);
      setOpen(false);
    } else {
      onChange(
        selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
      );
    }
  };
  const count2 = selected.length;
  const checkScroll = () => {
    const el = listRef.current;
    if (el) {
      setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    }
  };
  useEffect(() => {
    if (open) {
      requestAnimationFrame(checkScroll);
    }
  }, [open]);
  return /* @__PURE__ */ jsxs(Popover, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "outline",
        size: "sm",
        className: cn(
          "h-8 gap-1.5 text-xs font-medium border-border/50 bg-accent/30",
          count2 > 0 && "border-primary/50 bg-primary/10 text-primary"
        ),
        children: [
          icon,
          label,
          count2 > 0 && /* @__PURE__ */ jsx("span", { className: "ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground leading-none", children: count2 }),
          /* @__PURE__ */ jsx(ChevronDown, { className: "w-3 h-3 opacity-50" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(PopoverContent, { className: "w-56 p-0", align: "start", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: listRef,
          onScroll: checkScroll,
          className: "p-2 max-h-72 overflow-y-auto",
          children: [
            options.map((opt) => /* @__PURE__ */ jsxs(
              "label",
              {
                className: "flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer text-sm",
                children: [
                  /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      checked: selected.includes(opt.value),
                      onCheckedChange: () => toggle(opt.value)
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "truncate inline-flex items-center gap-1.5", children: [
                    opt.icon && /* @__PURE__ */ jsx(FlagIcon, { lang: opt.icon, className: "w-4 h-3" }),
                    opt.label
                  ] })
                ]
              },
              opt.value
            )),
            count2 > 0 && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => onChange([]),
                className: "w-full mt-1 text-xs text-muted-foreground hover:text-foreground text-center py-1",
                children: "✕"
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "flex justify-center py-1 border-t border-border/50 transition-opacity duration-200",
            canScrollDown ? "opacity-100" : "opacity-0 pointer-events-none"
          ),
          children: /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-muted-foreground animate-bounce" })
        }
      )
    ] })
  ] });
}
const NEW_EPISODES_KEY = "ps_new_episodes";
const LAST_SYNC_KEY = "ps_last_sync_time";
const SYNC_COOLDOWN_MS = 4 * 60 * 60 * 1e3;
const NewEpisodesService = {
  getNewEpisodesFromCache() {
    const data = localStorage.getItem(NEW_EPISODES_KEY);
    return data ? JSON.parse(data) : [];
  },
  markAsSeen(episodeId) {
    const current = this.getNewEpisodesFromCache();
    const updated = current.filter((ep) => ep.id !== episodeId);
    localStorage.setItem(NEW_EPISODES_KEY, JSON.stringify(updated));
  },
  async syncNewEpisodes(subscribedFeeds, forceRefresh = false) {
    var _a;
    if (!subscribedFeeds || subscribedFeeds.length === 0) return [];
    const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
    const lastSyncTime = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
    const now = Date.now();
    if (!forceRefresh && now - lastSyncTime < SYNC_COOLDOWN_MS) {
      console.log("Sync skipped: 4h cooldown not expired.");
      return this.getNewEpisodesFromCache();
    }
    await new Promise((r) => setTimeout(r, 3e3));
    console.log("Syncing new episodes...");
    let allNewEpisodes = [];
    const BATCH_SIZE = 3;
    for (let i = 0; i < subscribedFeeds.length; i += BATCH_SIZE) {
      const batch = subscribedFeeds.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (feed) => {
          const { episodes } = await getEpisodesByFeedId(feed.id, 5);
          return episodes.filter((ep) => {
            if (lastSyncTime === 0) return true;
            const pubDateMs = ep.datePublished * 1e3;
            return pubDateMs > lastSyncTime;
          });
        })
      );
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        if (result.status === "fulfilled") {
          const newForFeed = result.value;
          if (lastSyncTime === 0 && newForFeed.length > 0) {
            allNewEpisodes.push(newForFeed[0]);
          } else {
            allNewEpisodes = [...allNewEpisodes, ...newForFeed];
          }
        } else {
          console.error(`Sync error for feed ${(_a = batch[j]) == null ? void 0 : _a.id}`, result.reason);
        }
      }
    }
    allNewEpisodes.sort((a, b) => b.datePublished - a.datePublished);
    const existingCache = this.getNewEpisodesFromCache();
    const merged = [...allNewEpisodes, ...existingCache];
    const unique = Array.from(
      new Map(merged.map((item) => [item.id, item])).values()
    );
    const final = unique.slice(0, 50);
    localStorage.setItem(NEW_EPISODES_KEY, JSON.stringify(final));
    localStorage.setItem(LAST_SYNC_KEY, now.toString());
    return final;
  }
};
const catTechnology = "/assets/cat-technology-CblQI6fp.png";
const catComedy = "/assets/cat-comedy-B6GlxgKy.png";
const catNews = "/assets/cat-news-ouBxzFq1.png";
const catTrueCrime = "/assets/cat-truecrime-CWhHfItH.png";
const catHealth = "/assets/cat-health-CyhcaTsa.png";
const catBusiness = "/assets/cat-business-kzTBTmGz.png";
const catScience = "/assets/cat-science-BOc_iOt-.png";
const catEducation = "/assets/cat-education-CnsY9LMh.png";
const catSports = "/assets/cat-sports-BPTUXxUi.png";
const catMusic = "/assets/cat-music-3x8wmlaZ.png";
const catSociety = "/assets/cat-society-Dk8jdayf.png";
const catHistory = "/assets/cat-history-mb-lldqH.png";
const catFiction = "/assets/cat-fiction-Rgy_Wn3U.png";
const catHorror = "/assets/cat-horror-C6mKyV3p.png";
const catVideoGames = "/assets/cat-videogames-D4h_AitL.png";
const catArts = "/assets/cat-arts-cqsBHPrj.png";
const catFood = "/assets/cat-food-vKOaVibs.png";
const catTravel = "/assets/cat-travel-BFzTKTKB.png";
const CATEGORY_IMAGES = {
  Technology: catTechnology,
  Comedy: catComedy,
  News: catNews,
  "True Crime": catTrueCrime,
  Health: catHealth,
  Business: catBusiness,
  Science: catScience,
  Education: catEducation,
  Sports: catSports,
  Music: catMusic,
  Society: catSociety,
  History: catHistory,
  Fiction: catFiction,
  Horror: catHorror,
  "Video Games": catVideoGames,
  Arts: catArts,
  Food: catFood,
  Travel: catTravel
};
const CATEGORIES = [
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
  "Travel"
];
const CATEGORY_COLORS = {
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
  Travel: "from-sky-800/90 to-teal-500/80"
};
function HomePage({ subscriptions, onPodcastClick, onCategoryClick }) {
  const { t, language } = useTranslation();
  const scrollContainerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAllResume, setShowAllResume] = useState(false);
  const [trendingLang, setTrendingLang] = useState(language);
  const { play, currentEpisode, isPlaying, isBuffering, togglePlay } = usePlayer();
  const { isCastAvailable, isCasting, startCast, stopCast } = useCast();
  const { isEpisodeDownloaded, downloading, startDownload } = useDownloads();
  const [newEpisodes, setNewEpisodes] = useState(() => NewEpisodesService.getNewEpisodesFromCache());
  const [syncingNew, setSyncingNew] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const history = getListenHistory();
  const resumeEntries = history.filter((h) => !h.completed && h.progress > 0);
  const langOptions = useMemo(() => [
    { value: "fr", label: "Français", icon: "fr" },
    { value: "en", label: "English", icon: "en" },
    { value: "es", label: "Español", icon: "es" },
    { value: "de", label: "Deutsch", icon: "de" },
    { value: "ja", label: "日本語", icon: "ja" },
    { value: "pt", label: "Português", icon: "pt" },
    { value: "it", label: "Italiano", icon: "it" },
    { value: "ar", label: "العربية", icon: "ar" }
  ], []);
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending", trendingLang],
    queryFn: () => getTrendingPodcasts(20, trendingLang || void 0),
    staleTime: 10 * 60 * 1e3
  });
  useEffect(() => {
    if (subscriptions.length === 0) return;
    let cancelled = false;
    setSyncingNew(true);
    NewEpisodesService.syncNewEpisodes(subscriptions).then((eps) => {
      if (!cancelled) {
        setNewEpisodes(eps);
        setSyncingNew(false);
      }
    }).catch(() => {
      if (!cancelled) setSyncingNew(false);
    });
    return () => {
      cancelled = true;
    };
  }, [subscriptions]);
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);
  const scrollToTop = () => {
    var _a;
    (_a = scrollContainerRef.current) == null ? void 0 : _a.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleTouchStart = useCallback((e) => {
    const el = scrollContainerRef.current;
    if (el && el.scrollTop <= 0 && !refreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [refreshing]);
  const handleTouchMove = useCallback((e) => {
    if (!isPulling.current) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 80));
    }
  }, []);
  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= 60 && !refreshing) {
      setRefreshing(true);
      setPullDistance(60);
      try {
        const eps = await NewEpisodesService.syncNewEpisodes(subscriptions, true);
        setNewEpisodes(eps);
      } catch (e) {
        console.error("Pull-to-refresh error", e);
      }
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, refreshing, subscriptions]);
  const handlePlayNewEpisode = useCallback((episode) => {
    play(episode);
    NewEpisodesService.markAsSeen(episode.id);
    setNewEpisodes((prev) => prev.filter((ep) => ep.id !== episode.id));
  }, [play]);
  const handleDismissEpisode = useCallback((e, episodeId) => {
    e.stopPropagation();
    NewEpisodesService.markAsSeen(episodeId);
    setNewEpisodes((prev) => prev.filter((ep) => ep.id !== episodeId));
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-background px-4 pt-6 pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsx(Home, { className: "w-6 h-6 text-[hsl(280,80%,60%)]" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent whitespace-nowrap", children: t("nav.home") })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: isCasting ? stopCast : startCast,
          disabled: !isCastAvailable,
          className: cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-accent transition-colors",
            isCasting ? "text-primary" : isCastAvailable ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/30 cursor-not-allowed"
          ),
          "aria-label": "Cast",
          children: /* @__PURE__ */ jsx(Cast, { className: "h-5 w-5" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "flex items-center justify-center overflow-hidden transition-all duration-200",
        style: { height: pullDistance > 0 ? pullDistance : 0 },
        children: pullDistance > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground text-xs", children: [
          /* @__PURE__ */ jsx(Loader2, { className: cn("w-4 h-4", refreshing ? "animate-spin" : pullDistance >= 60 ? "text-primary" : "") }),
          /* @__PURE__ */ jsx("span", { children: pullDistance >= 60 ? refreshing ? "..." : t("home.pullToRefresh") : t("home.pullToRefresh") })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: scrollContainerRef,
        onScroll: handleScroll,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        className: "flex-1 overflow-y-auto px-4 pb-4",
        children: [
          /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Bookmark, { className: "w-4 h-4 text-[hsl(280,80%,60%)]" }),
              t("home.yourSubscriptions"),
              subscriptions.length > 0 && /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none", children: subscriptions.length })
            ] }),
            subscriptions.length > 0 ? /* @__PURE__ */ jsx(ScrollableRow, { children: subscriptions.slice(0, 20).map((p) => /* @__PURE__ */ jsx(PodcastCard, { podcast: p, onClick: onPodcastClick }, p.id)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("home.noSubscriptions") })
          ] }),
          resumeEntries.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Play, { className: "w-4 h-4 text-[hsl(220,90%,60%)]" }),
              t("home.resumeListening"),
              /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(220,90%,60%)] text-white leading-none", children: resumeEntries.length })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1", children: (showAllResume ? resumeEntries : resumeEntries.slice(0, 3)).map((entry) => {
              const isCurrent = (currentEpisode == null ? void 0 : currentEpisode.id) === entry.episode.id;
              const isThisPlaying = isCurrent && isPlaying;
              const isThisBuffering = isCurrent && isBuffering;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer",
                  onClick: () => isCurrent ? togglePlay() : play(entry.episode),
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent", children: /* @__PURE__ */ jsx(
                      CachedImage,
                      {
                        src: entry.episode.image || entry.episode.feedImage,
                        alt: entry.episode.title,
                        className: "w-full h-full object-cover"
                      }
                    ) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsx(
                        MarqueeText,
                        {
                          text: entry.episode.title,
                          active: isThisPlaying,
                          className: "text-sm font-semibold text-foreground"
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        MarqueeText,
                        {
                          text: entry.episode.feedTitle || "",
                          active: isThisPlaying,
                          className: "text-xs text-muted-foreground"
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { className: "mt-1.5 h-1 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "h-full rounded-full bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)]",
                          style: { width: `${Math.min(entry.progress * 100, 100)}%` }
                        }
                      ) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 flex-shrink-0", children: [
                      /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-primary font-semibold", children: [
                        Math.round(entry.progress * 100),
                        "%"
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center", isThisPlaying ? "bg-primary" : "bg-accent"), children: isThisBuffering ? /* @__PURE__ */ jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin text-foreground" }) : isThisPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3.5 h-3.5 text-primary-foreground" }) : /* @__PURE__ */ jsx(Play, { className: "w-3.5 h-3.5 ml-0.5 text-foreground" }) })
                    ] })
                  ]
                },
                entry.episode.id
              );
            }) }),
            resumeEntries.length > 3 && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowAllResume((v) => !v),
                className: "mt-2 w-full flex items-center justify-center gap-1 py-2 rounded-xl text-sm font-medium text-primary hover:bg-accent/50 transition-colors",
                children: [
                  showAllResume ? t("library.showLess") : t("library.showMore"),
                  /* @__PURE__ */ jsx(ChevronDown, { className: cn("w-4 h-4 transition-transform", showAllResume && "rotate-180") })
                ]
              }
            )
          ] }),
          subscriptions.length > 0 && newEpisodes.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-[hsl(280,80%,60%)]" }),
              t("home.latestReleases"),
              /* @__PURE__ */ jsx("span", { className: "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none", children: newEpisodes.length })
            ] }),
            /* @__PURE__ */ jsx(ScrollableRow, { children: newEpisodes.map((ep) => {
              const isCurrent = (currentEpisode == null ? void 0 : currentEpisode.id) === ep.id;
              const isThisPlaying = isCurrent && isPlaying;
              const isThisBuffering = isCurrent && isBuffering;
              const epDownloaded = isEpisodeDownloaded(ep.id);
              const epDownloading = downloading[ep.id] !== void 0;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "relative flex-shrink-0 w-32 cursor-pointer group",
                  onClick: () => isCurrent ? togglePlay() : handlePlayNewEpisode(ep),
                  children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => handleDismissEpisode(e, ep.id),
                        className: "absolute top-1 right-1 z-20 w-6 h-6 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100",
                        style: { opacity: void 0 },
                        onPointerDown: (e) => e.stopPropagation(),
                        children: /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5 text-foreground" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          if (!epDownloaded && !epDownloading) startDownload(ep);
                        },
                        className: "absolute top-1 left-1 z-20 w-6 h-6 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100",
                        style: { opacity: void 0 },
                        onPointerDown: (e) => e.stopPropagation(),
                        disabled: epDownloaded || epDownloading,
                        children: epDownloading ? /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin text-foreground" }) : epDownloaded ? /* @__PURE__ */ jsx(CheckCircle, { className: "w-3 h-3 text-primary" }) : /* @__PURE__ */ jsx(Download, { className: "w-3 h-3 text-foreground" })
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { className: "w-32 h-32 rounded-xl overflow-hidden bg-accent mb-1.5 relative", children: [
                      /* @__PURE__ */ jsx(
                        CachedImage,
                        {
                          src: ep.image || ep.feedImage,
                          alt: ep.title,
                          className: "w-full h-full object-cover"
                        }
                      ),
                      /* @__PURE__ */ jsx("div", { className: cn(
                        "absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg",
                        isThisPlaying ? "bg-primary" : "bg-background/80 backdrop-blur-sm"
                      ), children: isThisBuffering ? /* @__PURE__ */ jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin text-foreground" }) : isThisPlaying ? /* @__PURE__ */ jsx(Pause, { className: "w-3.5 h-3.5 text-primary-foreground" }) : /* @__PURE__ */ jsx(Play, { className: "w-3.5 h-3.5 ml-0.5 text-foreground" }) })
                    ] }),
                    /* @__PURE__ */ jsx(MarqueeText, { text: ep.title, className: "text-xs font-semibold text-foreground" }),
                    /* @__PURE__ */ jsx(MarqueeText, { text: ep.feedTitle || "", className: "text-[10px] text-muted-foreground" })
                  ]
                },
                ep.id
              );
            }) })
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4 text-[hsl(220,90%,60%)]" }),
              t("home.trending")
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
              MultiSelectFilter,
              {
                icon: /* @__PURE__ */ jsx(Globe, { className: "w-3.5 h-3.5" }),
                label: t("search.languages"),
                options: langOptions,
                selected: [trendingLang],
                onChange: (vals) => setTrendingLang(vals[vals.length - 1] || language),
                singleSelect: true
              }
            ) }),
            trendingLoading ? /* @__PURE__ */ jsx(TrendingRowSkeleton, {}) : trending && trending.length > 0 ? /* @__PURE__ */ jsx(ScrollableRow, { children: trending.map((p) => /* @__PURE__ */ jsx(PodcastCard, { podcast: p, onClick: onPodcastClick }, p.id)) }) : null
          ] }),
          /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Headphones, { className: "w-4 h-4 text-[hsl(220,90%,60%)]" }),
              t("home.exploreByCategory")
            ] }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: CATEGORIES.map((cat) => {
              const catImage = CATEGORY_IMAGES[cat];
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `relative rounded-xl p-4 h-24 flex items-end bg-gradient-to-br ${CATEGORY_COLORS[cat] || "from-gray-700 to-gray-500"} cursor-pointer active:scale-95 transition-all duration-300 ease-out shadow-lg border-t border-white/10 overflow-hidden group hover:scale-105 hover:shadow-[0_8px_30px_-4px_hsl(var(--primary)/0.45)]`,
                  onClick: () => onCategoryClick(cat),
                  children: [
                    catImage && /* @__PURE__ */ jsxs("div", { className: "absolute -top-2 -right-2 w-24 h-24 pointer-events-none", children: [
                      /* @__PURE__ */ jsx(CategoryAnimation, { category: cat }),
                      /* @__PURE__ */ jsx(
                        "img",
                        {
                          src: catImage,
                          alt: cat,
                          className: "w-full h-full object-contain opacity-85 drop-shadow-lg relative z-10 transition-transform duration-500 ease-out group-hover:scale-125",
                          loading: "lazy"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-heading font-bold text-white capitalize drop-shadow-md relative z-10", children: t(`category.${cat}`) })
                  ]
                },
                cat
              );
            }) })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: scrollToTop,
              className: cn(
                "fixed bottom-32 left-1/2 -translate-x-1/2 z-50 w-10 h-10 rounded-full bg-primary/70 backdrop-blur-sm text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300",
                showScrollTop ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
              ),
              children: /* @__PURE__ */ jsx(ArrowUp, { className: "w-5 h-5" })
            }
          )
        ]
      }
    )
  ] });
}
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DialogPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
const requestAllPermissions = async () => {
};
const FEATURE_ICONS = [Radio, Search, Heart, Music];
const FEATURE_KEYS = ["welcome.stations", "welcome.search", "welcome.favExport", "welcome.genres"];
function WelcomeModal({ open, onComplete }) {
  const [selectedLang, setSelectedLang] = useState("fr");
  const t = (key) => translations[selectedLang][key] ?? key;
  const handleContinue = async () => {
    await requestAllPermissions();
    onComplete(selectedLang);
  };
  return /* @__PURE__ */ jsx(Dialog, { open, children: /* @__PURE__ */ jsxs(
    DialogContent,
    {
      className: "max-w-md p-0 overflow-hidden rounded-2xl border-border bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/20 [&>button]:hidden",
      onPointerDownOutside: (e) => e.preventDefault(),
      onEscapeKeyDown: (e) => e.preventDefault(),
      onInteractOutside: (e) => e.preventDefault(),
      children: [
        /* @__PURE__ */ jsx(DialogTitle, { className: "sr-only", children: "Podcast Sphere" }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "sr-only", children: t("welcome.subtitle") }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center px-6 py-8 text-center max-h-[90vh] overflow-y-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative mb-5", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-full bg-primary/30 blur-3xl scale-150 animate-pulse" }),
            /* @__PURE__ */ jsx(
              "img",
              {
                src: podcastSphereLogo,
                alt: "Podcast Sphere",
                className: "w-24 h-24 rounded-2xl relative z-10 mix-blend-screen animate-logo-glow"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-heading font-bold bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent mb-2 drop-shadow-[0_0_16px_hsla(250,80%,60%,0.4)]", children: "Podcast Sphere" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: t("welcome.subtitle") }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://radiosphere.be",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-xs text-muted-foreground hover:text-primary transition-colors mb-6 inline-block",
              children: [
                "Un produit de",
                " ",
                /* @__PURE__ */ jsx("span", { className: "underline underline-offset-2", children: "radiosphere.be" })
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2.5 w-full max-w-xs mb-6", children: FEATURE_KEYS.map((key, i) => {
            const Icon = FEATURE_ICONS[i];
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center gap-2.5 rounded-xl bg-accent/80 border border-border/50 p-2.5",
                children: [
                  /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4 text-primary shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-foreground text-left leading-tight", children: t(key) })
                ]
              },
              key
            );
          }) }),
          /* @__PURE__ */ jsxs("div", { className: "w-full max-w-xs mb-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-2.5", children: [
              /* @__PURE__ */ jsx(Globe, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: t("welcome.chooseLanguage") })
            ] }),
            /* @__PURE__ */ jsxs(Select, { value: selectedLang, onValueChange: (v) => setSelectedLang(v), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full rounded-xl bg-secondary text-foreground", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsx(SelectContent, { children: LANGUAGE_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(FlagIcon, { lang: opt.value, className: "w-5 h-3.5" }),
                opt.label
              ] }) }, opt.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleContinue,
              className: "w-full max-w-xs py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[hsl(220,90%,56%)] to-[hsl(280,80%,56%)] text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 flex items-center justify-center gap-2",
              children: [
                t("welcome.start"),
                /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://radiosphere.be/privacy-policy-podcastsphere.html",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:underline mt-4",
              children: [
                /* @__PURE__ */ jsx(ShieldCheck, { className: "w-3 h-3" }),
                t("settings.privacyPolicy")
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-2 opacity-60", children: "Podcast Sphere v1.0" })
        ] })
      ]
    }
  ) });
}
const STORAGE_KEY = "podcastsphere_inapp_dismissed";
function detectInAppBrowser() {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS/i.test(ua)) return "Facebook";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/Messenger/i.test(ua) || /MessengerLite/i.test(ua)) return "Messenger";
  if (/TikTok|musical_ly|Bytedance/i.test(ua)) return "TikTok";
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  return null;
}
function InAppBrowserBanner() {
  const [browser, setBrowser] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "true") {
        setDismissed(true);
        return;
      }
    } catch {
    }
    setBrowser(detectInAppBrowser());
  }, []);
  if (!browser || dismissed) return null;
  const handleOpenExternal = () => {
    var _a;
    const url = window.location.href;
    const ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) {
      const cleanUrl = url.replace(/^https?:\/\//, "");
      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      try {
        (_a = navigator.clipboard) == null ? void 0 : _a.writeText(url);
      } catch {
      }
      window.location.href = url;
    }
  };
  const handleDismiss = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
    }
    setDismissed(true);
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-[hsl(220,90%,56%)] to-[hsl(280,80%,56%)] text-white px-3 py-2 shadow-lg",
      style: { paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.5rem)" },
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 max-w-3xl mx-auto", children: [
        /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4 shrink-0" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs flex-1 leading-tight", children: [
          "Pour une meilleure expérience (lecture en arrière-plan), ouvrez Podcast Sphere dans votre navigateur via le menu ",
          /* @__PURE__ */ jsx("strong", { children: browser }),
          " ⋮."
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleOpenExternal,
            className: "text-xs font-semibold underline underline-offset-2 whitespace-nowrap hover:opacity-90",
            type: "button",
            children: "Ouvrir"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleDismiss,
            className: "p-1 hover:bg-white/20 rounded transition-colors",
            type: "button",
            "aria-label": "Fermer",
            children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
          }
        )
      ] })
    }
  );
}
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className), ...props });
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Title, { ref, className: cn("text-lg font-semibold", className), ...props }));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
function ExitConfirmDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  const handleExit = async () => {
    try {
      const { App } = await import("@capacitor/app");
      await App.exitApp();
    } catch {
      window.close();
    }
  };
  return /* @__PURE__ */ jsx(AlertDialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(AlertDialogContent, { className: "max-w-[min(90vw,340px)] rounded-2xl p-5 gap-3", children: [
    /* @__PURE__ */ jsxs(AlertDialogHeader, { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(AlertDialogTitle, { className: "text-base text-center", children: t("exit.title") }),
      /* @__PURE__ */ jsx(AlertDialogDescription, { className: "text-sm text-center", children: t("exit.description") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-3 pt-1", children: [
      /* @__PURE__ */ jsx(AlertDialogCancel, { className: "mt-0 flex-1", children: t("common.cancel") }),
      /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleExit, className: "flex-1", children: t("exit.confirm") })
    ] })
  ] }) });
}
function SleepTimerIndicator() {
  const { isActive, formattedTime, cancelTimer } = useSleepTimer();
  const { t } = useTranslation();
  if (!isActive) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed top-[env(safe-area-inset-top,24px)] right-3 z-50 mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md shadow-lg shadow-primary/10 animate-in fade-in slide-in-from-top-2 duration-300", children: [
    /* @__PURE__ */ jsx(Moon, { className: "w-3.5 h-3.5 text-primary animate-pulse" }),
    /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-primary tabular-nums", children: formattedTime }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          cancelTimer();
        },
        className: "w-4 h-4 rounded-full flex items-center justify-center text-primary/60 hover:text-primary transition-colors",
        "aria-label": t("sleepTimer.cancel"),
        children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" })
      }
    )
  ] });
}
function useBackButton({
  onBack,
  onDoubleBackHome,
  isHome,
  isFullScreen
}) {
  const lastBackPressRef = useRef(0);
  const backPressTimeoutRef = useRef(null);
  const isHomeRef = useRef(isHome);
  const isFullScreenRef = useRef(isFullScreen);
  const onBackRef = useRef(onBack);
  const onDoubleBackHomeRef = useRef(onDoubleBackHome);
  useEffect(() => {
    isHomeRef.current = isHome;
  }, [isHome]);
  useEffect(() => {
    isFullScreenRef.current = isFullScreen;
  }, [isFullScreen]);
  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);
  useEffect(() => {
    onDoubleBackHomeRef.current = onDoubleBackHome;
  }, [onDoubleBackHome]);
  const handleBackPress = useCallback(() => {
    if (isFullScreenRef.current) {
      onBackRef.current();
      return;
    }
    if (!isHomeRef.current) {
      onBackRef.current();
      return;
    }
    const now = Date.now();
    const timeSinceLastPress = now - lastBackPressRef.current;
    if (timeSinceLastPress < 300) {
      if (backPressTimeoutRef.current) {
        clearTimeout(backPressTimeoutRef.current);
      }
      onDoubleBackHomeRef.current();
      lastBackPressRef.current = 0;
    } else {
      lastBackPressRef.current = now;
      if (backPressTimeoutRef.current) {
        clearTimeout(backPressTimeoutRef.current);
      }
      backPressTimeoutRef.current = setTimeout(() => {
        lastBackPressRef.current = 0;
      }, 300);
    }
  }, []);
  useEffect(() => {
    let nativeListenerRemove = null;
    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const listener = await App.addListener("backButton", () => {
          handleBackPress();
        });
        nativeListenerRemove = () => listener.remove();
        console.log("[PodcastSphere] Native backButton listener registered");
      } catch (e) {
        console.log("[PodcastSphere] @capacitor/app not available, using popstate fallback");
        window.history.pushState(null, "", window.location.href);
        const handlePopState = () => {
          handleBackPress();
          window.history.pushState(null, "", window.location.href);
        };
        window.addEventListener("popstate", handlePopState);
        nativeListenerRemove = () => {
          window.removeEventListener("popstate", handlePopState);
        };
      }
    })();
    return () => {
      if (nativeListenerRemove) nativeListenerRemove();
      if (backPressTimeoutRef.current) {
        clearTimeout(backPressTimeoutRef.current);
      }
    };
  }, [handleBackPress]);
}
const SearchPage = lazy(() => import("./assets/SearchPage-rOpE42za.js").then((m) => ({ default: m.SearchPage })));
const LibraryPage = lazy(() => import("./assets/LibraryPage-DhOx_Xpk.js").then((m) => ({ default: m.LibraryPage })));
const SettingsPage = lazy(() => import("./assets/SettingsPage-BZi82_EK.js").then((m) => ({ default: m.SettingsPage })));
const ONBOARDING_KEY = "podcastsphere_onboarded";
function hasCompletedOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
}
function PageLoader() {
  return /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" }) });
}
function AppContentInner() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!hasCompletedOnboarding());
  const [detailPodcast, setDetailPodcast] = useState(null);
  const { subscriptions } = useFavoritesContext();
  const { isFullScreen, closeFullScreen, currentEpisode } = usePlayer();
  const { setLanguage, t } = useTranslation();
  const handleCategoryClick = useCallback((category) => {
    const translated = t(`category.${category}`);
    setSelectedCategory(translated);
    setActiveTab("search");
  }, [t]);
  const handlePodcastClick = useCallback((podcast) => {
    setDetailPodcast(podcast);
  }, []);
  const handleTabChange = useCallback((tab) => {
    if (tab !== "search") setSelectedCategory(void 0);
    setDetailPodcast(null);
    setActiveTab(tab);
  }, []);
  const handleWelcomeComplete = useCallback((lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem(ONBOARDING_KEY, "true");
    } catch {
    }
    setShowWelcome(false);
  }, [setLanguage]);
  const handleReopenWelcome = useCallback(() => {
    setShowWelcome(true);
  }, []);
  const handleResetApp = useCallback(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
    }
    try {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (db.name) window.indexedDB.deleteDatabase(db.name);
      }
    } catch {
    }
    window.location.reload();
  }, []);
  useBackButton({
    onBack: () => {
      if (showWelcome) return;
      if (isFullScreen) {
        closeFullScreen();
      } else {
        setActiveTab("home");
      }
    },
    onDoubleBackHome: () => setShowExitDialog(true),
    isHome: activeTab === "home",
    isFullScreen
  });
  const renderContent = () => {
    if (detailPodcast) {
      return /* @__PURE__ */ jsx(PodcastDetailPage, { podcast: detailPodcast, onBack: () => setDetailPodcast(null) });
    }
    switch (activeTab) {
      case "home":
        return /* @__PURE__ */ jsx(
          HomePage,
          {
            subscriptions,
            onPodcastClick: handlePodcastClick,
            onCategoryClick: handleCategoryClick
          }
        );
      case "search":
        return /* @__PURE__ */ jsx(SearchPage, { initialCategory: selectedCategory });
      case "library":
        return /* @__PURE__ */ jsx(LibraryPage, {});
      case "settings":
        return /* @__PURE__ */ jsx(SettingsPage, { onReopenWelcome: handleReopenWelcome, onResetApp: handleResetApp });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsx(PremiumProvider, { children: /* @__PURE__ */ jsx(SleepTimerProvider, { children: /* @__PURE__ */ jsxs(DownloadProvider, { children: [
    /* @__PURE__ */ jsx(SleepTimerIndicator, {}),
    /* @__PURE__ */ jsx(InAppBrowserBanner, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex h-full bg-background", children: [
      /* @__PURE__ */ jsx(DesktopSidebar, { activeTab, onTabChange: handleTabChange }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `flex-1 flex flex-col overflow-hidden ${currentEpisode ? "pb-28 lg:pb-0" : "pb-14 lg:pb-0"}`,
            style: { paddingTop: "env(safe-area-inset-top, 0px)" },
            children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(PageLoader, {}), children: renderContent() })
          }
        ),
        /* @__PURE__ */ jsx(MiniPlayer, {}),
        /* @__PURE__ */ jsx(BottomNav, { activeTab, onTabChange: handleTabChange }),
        /* @__PURE__ */ jsx(DesktopPlayerBar, {}),
        /* @__PURE__ */ jsx(Footer, {})
      ] })
    ] }),
    /* @__PURE__ */ jsx(FullScreenPlayer, {}),
    /* @__PURE__ */ jsx(ExitConfirmDialog, { open: showExitDialog, onOpenChange: setShowExitDialog }),
    /* @__PURE__ */ jsx(WelcomeModal, { open: showWelcome, onComplete: handleWelcomeComplete })
  ] }) }) });
}
function AppContent() {
  const { addRecent } = useFavoritesContext();
  return /* @__PURE__ */ jsx(PlayerProvider, { onEpisodePlay: addRecent, children: /* @__PURE__ */ jsx(AppContentInner, {}) });
}
const Index = () => /* @__PURE__ */ jsx(LanguageProvider, { children: /* @__PURE__ */ jsx(FavoritesProvider, { children: /* @__PURE__ */ jsx(AppContent, {}) }) });
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-muted", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "mb-4 text-4xl font-bold", children: "404" }),
    /* @__PURE__ */ jsx("p", { className: "mb-4 text-xl text-muted-foreground", children: "Oops! Page not found" }),
    /* @__PURE__ */ jsx("a", { href: "/", className: "text-primary underline hover:text-primary/90", children: "Return to Home" })
  ] }) });
};
const queryClient = new QueryClient();
const Layout = ({ children }) => /* @__PURE__ */ jsx(ErrorBoundary, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(HelmetProvider, { children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
  /* @__PURE__ */ jsxs(Helmet, { children: [
    /* @__PURE__ */ jsx("title", { children: "Podcast Sphere — Podcasts du monde entier" }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: "Découvrez et écoutez des milliers de podcasts du monde entier sur Podcast Sphere. Propulsé par Podcast Index." })
  ] }),
  /* @__PURE__ */ jsx(Toaster$1, {}),
  /* @__PURE__ */ jsx(Toaster, {}),
  children
] }) }) }) });
const routes = [
  {
    path: "/",
    element: /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(Index, {}) })
  },
  {
    path: "*",
    element: /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(NotFound, {}) })
  }
];
const createRoot = ViteReactSSG({ routes });
if (typeof window !== "undefined") {
  setTimeout(() => evictOldEntries(), 5e3);
}
export {
  SelectItem as A,
  SLEEP_TIMER_OPTIONS as B,
  CachedImage as C,
  Dialog as D,
  Button as E,
  FlagIcon as F,
  toast as G,
  AlertDialog as H,
  AlertDialogTrigger as I,
  AlertDialogContent as J,
  AlertDialogHeader as K,
  LANGUAGE_OPTIONS as L,
  MultiSelectFilter as M,
  NewEpisodesService as N,
  AlertDialogTitle as O,
  PodcastDetailPage as P,
  AlertDialogDescription as Q,
  AlertDialogFooter as R,
  SearchResultsSkeleton as S,
  AlertDialogCancel as T,
  AlertDialogAction as U,
  PodcastCard as a,
  useFavoritesContext as b,
  cn as c,
  createRoot,
  DialogContent as d,
  DialogHeader as e,
  DialogTitle as f,
  DialogDescription as g,
  fetchPrivateFeed as h,
  usePlayer as i,
  useDownloads as j,
  getListenHistory as k,
  isPrivateFeedId as l,
  clearHistory as m,
  removeFromHistory as n,
  MarqueeText as o,
  preCacheImages as p,
  DialogTrigger as q,
  refreshAllPrivateFeeds as r,
  searchPodcasts as s,
  requestAllPermissions as t,
  useTranslation as u,
  useSleepTimer as v,
  Select as w,
  SelectTrigger as x,
  SelectValue as y,
  SelectContent as z
};
