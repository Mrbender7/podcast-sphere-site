import { Podcast, Episode } from "@/types/podcast";

// ============================================================
// 🔑 PODCAST INDEX API CREDENTIALS
// Replace these with your own keys from https://api.podcastindex.org
// ============================================================
const API_KEY = "YOUR_API_KEY_HERE";
const API_SECRET = "YOUR_API_SECRET_HERE";
const BASE_URL = "https://api.podcastindex.org/api/1.0";

/**
 * Generate the authentication headers required by the Podcast Index API.
 * Uses native Web Crypto API to compute SHA-1 hash of (apiKey + apiSecret + timestamp).
 *
 * ⚠️ Note: The API secret is visible in client-side code. This is acceptable for
 * a Capacitor mobile app (bundled code), but for a public web app, consider
 * proxying through an Edge Function for better security.
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
  const url = `${BASE_URL}${path}${query}`;

  const res = await fetch(url, { headers });
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
    lastEpisodeDate: raw.newestItemPublishTime || raw.lastUpdateTime || 0,
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

export async function getTrendingPodcasts(max = 20): Promise<Podcast[]> {
  const data = await apiFetch<any>("/podcasts/trending", { max: String(max), lang: "en,fr,es,de,ja" });
  return (data.feeds || []).map(normalizePodcast);
}

export async function getPodcastById(feedId: number): Promise<Podcast | null> {
  const data = await apiFetch<any>("/podcasts/byfeedid", { id: String(feedId) });
  if (data.feed) return normalizePodcast(data.feed);
  return null;
}

export async function getEpisodesByFeedId(feedId: number, max = 50): Promise<Episode[]> {
  const data = await apiFetch<any>("/episodes/byfeedid", { id: String(feedId), max: String(max) });
  const feed = data.feed || {};
  return (data.items || []).map((e: any) =>
    normalizeEpisode(e, { title: feed.title, author: feed.author, image: feed.image || feed.artwork })
  );
}

export async function searchPodcastsByCategory(category: string, max = 20): Promise<Podcast[]> {
  // Podcast Index doesn't have a direct category search, use term search
  return searchPodcasts(category, max);
}
