import { Podcast, Episode } from "@/types/podcast";

// ============================================================
// 🔐 PODCAST INDEX API CREDENTIALS
// Obfuscated with simple encoding to prevent casual extraction.
// ============================================================

// On native (Capacitor), requests go directly without CORS issues.
// In browser dev/preview, we route through Vite's proxy to avoid CORS.
const isNative = typeof (window as any)?.Capacitor !== "undefined";
const BASE_URL = isNative
  ? "https://api.podcastindex.org/api/1.0"
  : "/api/podcast";

// Simple decode function
function _d(s: string): string {
  return atob(s);
}

// Encoded credentials (Base64)
const _k = "RUdDSkRGTjRSRkJQUllMUE1QTlQ=";
const _s = "OSNiTWVUeTl2cWREUWY1aGhVTjc0VnJmVmdkY0toU1JHXmprU3Zycw==";

const API_KEY = _d(_k);
const API_SECRET = _d(_s);

/**
 * Generate the authentication headers required by the Podcast Index API.
 * Uses native Web Crypto API to compute SHA-1 hash of (apiKey + apiSecret + timestamp).
 */
async function generateAuthHeaders(): Promise<Record<string, string>> {
  const ts = Math.floor(Date.now() / 1000);
  const data = API_KEY + API_SECRET + String(ts);
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-1", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return {
    "X-Auth-Date": String(ts),
    "X-Auth-Key": API_KEY,
    Authorization: hashHex,
    "User-Agent": "PodcastSphere/1.0",
  };
}

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const headers = await generateAuthHeaders();
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  const directUrl = `${DIRECT_URL}${path}${query}`;

  // On native platforms (Capacitor), call directly. In browsers, use CORS proxy.
  const url = isNative ? directUrl : `${PROXY_URL}${encodeURIComponent(directUrl)}`;

  const res = await fetch(url, {
    headers: isNative ? headers : { ...headers },
  });
  if (!res.ok) throw new Error(`Podcast Index API error: ${res.status}`);
  return res.json();
}

function normalizePodcast(raw: any): Podcast {
  const categories = raw.categories
    ? Object.values(raw.categories as Record<string, string>).filter(Boolean)
    : [];
  return {
    id: raw.id || raw.feedId || 0,
    title: raw.title || "Unknown",
    author: raw.author || raw.ownerName || "",
    image: raw.image || raw.artwork || "",
    description: raw.description || "",
    url: raw.url || raw.originalUrl || "",
    categories: categories as string[],
    lastEpisodeDate: raw.newestItemPublishTime || raw.newestItemPubdate || raw.lastUpdateTime || 0,
    language: (raw.language || "").split("-")[0].toLowerCase(),
  };
}

function normalizeEpisode(raw: any, feedMeta?: { title?: string; author?: string; image?: string }): Episode {
  return {
    id: raw.id || 0,
    title: raw.title || "Untitled",
    description: raw.description || "",
    datePublished: raw.datePublished || 0,
    duration: raw.duration || 0,
    enclosureUrl: raw.enclosureUrl || "",
    enclosureType: raw.enclosureType || "audio/mpeg",
    image: raw.image || raw.feedImage || feedMeta?.image || "",
    feedId: raw.feedId || 0,
    feedTitle: raw.feedTitle || feedMeta?.title || "",
    feedAuthor: raw.feedAuthor || feedMeta?.author || "",
    feedImage: raw.feedImage || feedMeta?.image || "",
  };
}

export async function searchPodcasts(term: string, max = 20): Promise<Podcast[]> {
  const data = await apiFetch<any>("/search/byterm", { q: term, max: String(max) });
  return (data.feeds || []).map(normalizePodcast);
}

export async function getTrendingPodcasts(max = 20, lang?: string): Promise<Podcast[]> {
  const params: Record<string, string> = { max: String(max) };
  if (lang) {
    params.lang = lang;
  }
  const data = await apiFetch<any>("/podcasts/trending", params);
  return (data.feeds || []).map(normalizePodcast);
}

export async function getPodcastById(feedId: number): Promise<Podcast | null> {
  const data = await apiFetch<any>("/podcasts/byfeedid", { id: String(feedId) });
  if (data.feed) return normalizePodcast(data.feed);
  return null;
}

export interface EpisodePage {
  episodes: Episode[];
  hasMore: boolean;
}

export async function getEpisodesByFeedId(feedId: number, max = 1000, before?: number): Promise<EpisodePage> {
  const params: Record<string, string> = { id: String(feedId), max: String(max) };
  if (before) params.before = String(before);
  
  const data = await apiFetch<any>("/episodes/byfeedid", params);
  const feed = data.feed || {};
  const items = data.items || [];
  const episodes = items.map((e: any) =>
    normalizeEpisode(e, { title: feed.title, author: feed.author, image: feed.image || feed.artwork })
  );
  
  // If we got exactly max items, there may be more
  return {
    episodes,
    hasMore: items.length >= max,
  };
}

export async function searchPodcastsByCategory(category: string, max = 20): Promise<Podcast[]> {
  return searchPodcasts(category, max);
}
