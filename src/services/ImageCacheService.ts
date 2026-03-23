/**
 * IndexedDB-based image cache for podcast artwork.
 * Stores images as blobs with object URLs for instant display.
 * 
 * Caching is deferred to idle moments to avoid freezing the UI.
 * Priority: subscriptions/favorites > currently visible > background.
 */

const DB_NAME = "ps_image_cache";
const DB_VERSION = 1;
const STORE_NAME = "artworks";
const MAX_ENTRIES = 500;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
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

/** Get a cached blob URL for an image, or null if not cached. */
export async function getCachedImage(url: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(url);
      req.onsuccess = () => {
        if (req.result?.blob) {
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

/** Check if a URL is already cached (without creating an object URL). */
export async function isCached(url: string): Promise<boolean> {
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

/** Download and cache an image. Returns the object URL. */
export async function cacheImage(url: string): Promise<string | null> {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
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

/** Get from cache or fetch + cache. Returns object URL or original URL as fallback. */
export async function getOrCacheImage(url: string): Promise<string> {
  if (!url) return url;
  const cached = await getCachedImage(url);
  if (cached) return cached;
  const newCached = await cacheImage(url);
  return newCached || url;
}

// ─── Idle-deferred caching queue ───────────────────────────────────────────

type CacheJob = { url: string; priority: number };

let queue: CacheJob[] = [];
let processing = false;

const requestIdle =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (window as any).requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 50);

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  // Sort by priority (higher = sooner)
  queue.sort((a, b) => b.priority - a.priority);

  while (queue.length > 0) {
    const job = queue.shift()!;
    // Yield to main thread between each fetch to avoid jank
    await new Promise<void>((resolve) => requestIdle(() => resolve()));
    const already = await isCached(job.url);
    if (!already) {
      await cacheImage(job.url);
    }
  }

  processing = false;
}

function enqueue(urls: string[], priority: number) {
  const existing = new Set(queue.map((j) => j.url));
  for (const url of urls) {
    if (url && !existing.has(url)) {
      queue.push({ url, priority });
      existing.add(url);
    }
  }
  // Kick off processing if idle
  if (!processing) {
    requestIdle(() => processQueue());
  }
}

/**
 * Pre-cache a list of image URLs in the background, yielding to the main
 * thread between each download. Higher priority = cached first.
 * 
 * Priority guide:
 *   3 = subscriptions / favorites (cache ASAP when idle)
 *   2 = currently visible (resume section, new episodes)
 *   1 = background / detail page episodes
 */
export function preCacheImages(urls: string[], priority = 2): void {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return;
  enqueue(unique, priority);
}

/** Evict oldest entries if cache exceeds MAX_ENTRIES. */
export async function evictOldEntries(): Promise<void> {
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
    // ignore
  }
}
