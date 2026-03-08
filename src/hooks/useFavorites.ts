import { useState, useCallback, useEffect } from "react";
import { Podcast } from "@/types/podcast";
import { Episode } from "@/types/podcast";

const SUBSCRIPTIONS_KEY = "podcastsphere_subscriptions";
const RECENT_KEY = "podcastsphere_recent_episodes";
const LAST_SEEN_KEY = "podcastsphere_last_seen";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Podcast[]>(() =>
    loadFromStorage<Podcast[]>(SUBSCRIPTIONS_KEY, []).sort((a, b) => a.title.localeCompare(b.title))
  );
  const [lastSeen, setLastSeen] = useState<Record<number, number>>(() =>
    loadFromStorage<Record<number, number>>(LAST_SEEN_KEY, {})
  );

  useEffect(() => {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(lastSeen));
  }, [lastSeen]);

  const toggleSubscription = useCallback((podcast: Podcast) => {
    setSubscriptions(prev => {
      const exists = prev.some(p => p.id === podcast.id);
      const next = exists ? prev.filter(p => p.id !== podcast.id) : [...prev, podcast];
      return next.sort((a, b) => a.title.localeCompare(b.title));
    });
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

  return { subscriptions, toggleSubscription, isSubscribed, markAsSeen, hasNewEpisodes };
}

export function useRecentEpisodes() {
  const [recent, setRecent] = useState<Episode[]>(() => loadFromStorage(RECENT_KEY, []));

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }, [recent]);

  const addRecent = useCallback((episode: Episode) => {
    setRecent(prev => {
      const filtered = prev.filter(e => e.id !== episode.id);
      return [episode, ...filtered].slice(0, 20);
    });
  }, []);

  return { recent, addRecent };
}
