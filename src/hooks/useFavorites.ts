import { useState, useCallback, useEffect } from "react";
import { Podcast } from "@/types/podcast";
import { Episode } from "@/types/podcast";

const SUBSCRIPTIONS_KEY = "podcastsphere_subscriptions";
const RECENT_KEY = "podcastsphere_recent_episodes";
const LAST_SEEN_KEY = "podcastsphere_last_seen";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Podcast[]>([]);
  const [lastSeen, setLastSeen] = useState<Record<number, number>>({});
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    setSubscriptions(loadFromStorage<Podcast[]>(SUBSCRIPTIONS_KEY, []).sort((a, b) => a.title.localeCompare(b.title)));
    setLastSeen(loadFromStorage<Record<number, number>>(LAST_SEEN_KEY, {}));
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    saveToStorage(SUBSCRIPTIONS_KEY, subscriptions);
  }, [storageReady, subscriptions]);

  useEffect(() => {
    if (!storageReady) return;
    saveToStorage(LAST_SEEN_KEY, lastSeen);
  }, [lastSeen, storageReady]);

  const toggleSubscription = useCallback((podcast: Podcast) => {
    setSubscriptions(prev => {
      const exists = prev.some(p => p.id === podcast.id);
      const next = exists ? prev.filter(p => p.id !== podcast.id) : [...prev, podcast];
      return next.sort((a, b) => a.title.localeCompare(b.title));
    });
  }, []);

  const importSubscriptions = useCallback((podcasts: Podcast[]) => {
    let addedCount = 0;
    setSubscriptions(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const newPodcasts = podcasts.filter(p => {
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

  const isSubscribed = useCallback((id: number) => subscriptions.some(p => p.id === id), [subscriptions]);

  const markAsSeen = useCallback((podcastId: number, episodeDate: number) => {
    setLastSeen(prev => ({ ...prev, [podcastId]: episodeDate }));
  }, []);

  const hasNewEpisodes = useCallback((podcast: Podcast) => {
    const seen = lastSeen[podcast.id];
    if (!seen) return podcast.lastEpisodeDate > 0;
    return podcast.lastEpisodeDate > seen;
  }, [lastSeen]);

  return { subscriptions, toggleSubscription, isSubscribed, markAsSeen, hasNewEpisodes, importSubscriptions };
}

export function useRecentEpisodes() {
  const [recent, setRecent] = useState<Episode[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    setRecent(loadFromStorage<Episode[]>(RECENT_KEY, []));
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    saveToStorage(RECENT_KEY, recent);
  }, [recent, storageReady]);

  const addRecent = useCallback((episode: Episode) => {
    setRecent(prev => {
      const filtered = prev.filter(e => e.id !== episode.id);
      return [episode, ...filtered].slice(0, 20);
    });
  }, []);

  return { recent, addRecent };
}
