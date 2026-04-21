import { Capacitor } from "@capacitor/core";
import { CapacitorHttp } from "@capacitor/core";
import { Podcast, Episode } from "@/types/podcast";

const PRIVATE_FEEDS_KEY = "podcastsphere_private_feeds";
const PRIVATE_EPISODES_KEY = "podcastsphere_private_episodes";

export interface PrivateFeedData {
  podcast: Podcast;
  episodes: Episode[];
  lastFetchedAt: number;
}

/**
 * Generates a stable negative ID from a feed URL so it never collides
 * with positive Podcast Index IDs.
 */
function hashUrlToId(url: string): number {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (h << 5) - h + url.charCodeAt(i);
    h |= 0;
  }
  // negative range to avoid collisions with Podcast Index ids (positive)
  return h < 0 ? h : -Math.abs(h);
}

function getText(node: Element | null, tag: string): string {
  if (!node) return "";
  const el = node.getElementsByTagName(tag)[0];
  return el?.textContent?.trim() || "";
}

function getAttr(node: Element | null, tag: string, attr: string): string {
  if (!node) return "";
  const el = node.getElementsByTagName(tag)[0];
  return el?.getAttribute(attr) || "";
}

function getNamespacedText(node: Element, ns: string, tag: string): string {
  // Try by namespace + localName first, fallback to prefixed name
  const all = node.getElementsByTagName("*");
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    if (el.parentNode === node && el.localName === tag) {
      const namespaceURI = el.namespaceURI || "";
      if (!ns || namespaceURI.includes(ns)) return el.textContent?.trim() || "";
    }
  }
  return "";
}

function parseDuration(raw: string): number {
  if (!raw) return 0;
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  // HH:MM:SS or MM:SS
  const parts = trimmed.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function parseDate(raw: string): number {
  if (!raw) return 0;
  const ts = Date.parse(raw);
  return isNaN(ts) ? 0 : Math.floor(ts / 1000);
}

/**
 * Fetch a URL using CapacitorHttp on native (bypasses CORS) and standard
 * fetch on web. Tokens stay strictly between the user device and the host.
 */
async function fetchFeedXml(url: string): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.get({
      url,
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "PodcastSphere/1.0",
      },
      responseType: "text",
    });
    if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
    return typeof res.data === "string" ? res.data : String(res.data ?? "");
  }
  // Web fallback — likely to fail with CORS for private hosts; that's intentional.
  const res = await fetch(url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

export interface ParsedFeed {
  podcast: Podcast;
  episodes: Episode[];
}

/**
 * Parses the raw XML of an RSS feed and returns a podcast + episodes structure.
 */
export function parseRssXml(xml: string, feedUrl: string): ParsedFeed {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) throw new Error("Invalid RSS XML");

  const channel = doc.getElementsByTagName("channel")[0];
  if (!channel) throw new Error("No <channel> found in feed");

  const id = hashUrlToId(feedUrl);
  const title = getText(channel, "title") || "Untitled";

  // image: <image><url> or <itunes:image href="">
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
    // Fallback: scan any tag named "image" with href
    const all = channel.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
      if (all[i].localName === "image" && all[i].getAttribute("href")) {
        image = all[i].getAttribute("href") || "";
        break;
      }
    }
  }

  // author: <itunes:author> or <managingEditor>
  let author = "";
  const allChildren = channel.getElementsByTagName("*");
  for (let i = 0; i < allChildren.length; i++) {
    if (allChildren[i].localName === "author" && allChildren[i].parentNode === channel) {
      author = allChildren[i].textContent?.trim() || "";
      break;
    }
  }
  if (!author) author = getText(channel, "managingEditor");

  const description = getText(channel, "description") || getText(channel, "summary");
  const link = getText(channel, "link");
  const language = (getText(channel, "language") || "").split("-")[0].toLowerCase();

  const podcast: Podcast = {
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
    isPrivate: true,
  };

  // Episodes
  const items = Array.from(channel.getElementsByTagName("item"));
  const episodes: Episode[] = items.map((item, idx) => {
    const epTitle = getText(item, "title") || "Untitled";
    const epDescription = getText(item, "description") || getText(item, "summary");
    const pubDate = parseDate(getText(item, "pubDate"));
    const enclosureUrl = getAttr(item, "enclosure", "url");
    const enclosureType = getAttr(item, "enclosure", "type") || "audio/mpeg";

    // duration: itunes:duration
    let durationRaw = "";
    const itemAll = item.getElementsByTagName("*");
    for (let i = 0; i < itemAll.length; i++) {
      if (itemAll[i].localName === "duration") {
        durationRaw = itemAll[i].textContent?.trim() || "";
        break;
      }
    }
    const duration = parseDuration(durationRaw);

    // episode image: itunes:image href
    let epImage = image;
    for (let i = 0; i < itemAll.length; i++) {
      if (itemAll[i].localName === "image" && itemAll[i].getAttribute("href")) {
        epImage = itemAll[i].getAttribute("href") || epImage;
        break;
      }
    }

    // stable id from guid + index
    const guid = getText(item, "guid") || enclosureUrl || `${idx}`;
    let epId = id * 10000 - idx; // negative, deterministic per feed
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
      feedImage: image,
    };
  });

  if (episodes.length > 0) {
    podcast.lastEpisodeDate = Math.max(...episodes.map((e) => e.datePublished));
  }

  return { podcast, episodes };
}

/**
 * Fetches and parses a private RSS feed, then caches it locally.
 */
export async function fetchPrivateFeed(url: string): Promise<ParsedFeed> {
  const xml = await fetchFeedXml(url);
  const parsed = parseRssXml(xml, url);
  saveFeedCache(parsed);
  return parsed;
}

// ── Local storage helpers ──────────────────────────────────────────

function loadFeedsMap(): Record<string, PrivateFeedData> {
  try {
    const raw = localStorage.getItem(PRIVATE_EPISODES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveFeedsMap(map: Record<string, PrivateFeedData>) {
  try {
    localStorage.setItem(PRIVATE_EPISODES_KEY, JSON.stringify(map));
  } catch {
    /* quota — ignore */
  }
}

export function saveFeedCache(parsed: ParsedFeed) {
  const map = loadFeedsMap();
  map[String(parsed.podcast.id)] = {
    podcast: parsed.podcast,
    episodes: parsed.episodes,
    lastFetchedAt: Date.now(),
  };
  saveFeedsMap(map);
}

export function getCachedPrivateFeed(podcastId: number): PrivateFeedData | null {
  const map = loadFeedsMap();
  return map[String(podcastId)] || null;
}

export function getCachedPrivateEpisodes(podcastId: number): Episode[] {
  return getCachedPrivateFeed(podcastId)?.episodes || [];
}

export function removePrivateFeedCache(podcastId: number) {
  const map = loadFeedsMap();
  delete map[String(podcastId)];
  saveFeedsMap(map);
}

/**
 * Refresh ALL private feeds in parallel (best-effort).
 */
export async function refreshAllPrivateFeeds(podcastIds: number[]): Promise<number> {
  const map = loadFeedsMap();
  let refreshed = 0;
  await Promise.allSettled(
    podcastIds.map(async (pid) => {
      const entry = map[String(pid)];
      if (!entry?.podcast.feedUrl) return;
      try {
        await fetchPrivateFeed(entry.podcast.feedUrl);
        refreshed++;
      } catch {
        /* ignore */
      }
    }),
  );
  return refreshed;
}

export function isPrivateFeedId(id: number): boolean {
  return id < 0;
}
