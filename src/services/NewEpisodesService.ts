import { Episode, Podcast } from "@/types/podcast";
import { getEpisodesByFeedId } from "@/services/PodcastService";

const NEW_EPISODES_KEY = "ps_new_episodes";
const LAST_SYNC_KEY = "ps_last_sync_time";
const SYNC_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

// SSR-safe localStorage helpers (vite-react-ssg renders on the server where window is undefined)
const safeGetItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
};
const safeSetItem = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
};

export const NewEpisodesService = {
  getNewEpisodesFromCache(): Episode[] {
    const data = safeGetItem(NEW_EPISODES_KEY);
    return data ? JSON.parse(data) : [];
  },

  markAsSeen(episodeId: number): void {
    const current = this.getNewEpisodesFromCache();
    const updated = current.filter((ep) => ep.id !== episodeId);
    safeSetItem(NEW_EPISODES_KEY, JSON.stringify(updated));
  },

  async syncNewEpisodes(
    subscribedFeeds: Podcast[],
    forceRefresh = false
  ): Promise<Episode[]> {
    if (!subscribedFeeds || subscribedFeeds.length === 0) return [];

    const lastSyncStr = safeGetItem(LAST_SYNC_KEY);
    const lastSyncTime = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
    const now = Date.now();

    if (!forceRefresh && now - lastSyncTime < SYNC_COOLDOWN_MS) {
      console.log("Sync skipped: 4h cooldown not expired.");
      return this.getNewEpisodesFromCache();
    }

    // Delay sync start to let the UI render first
    await new Promise((r) => setTimeout(r, 3000));

    console.log("Syncing new episodes...");
    let allNewEpisodes: Episode[] = [];

    // Process feeds in batches of 3 to avoid network saturation
    const BATCH_SIZE = 3;
    for (let i = 0; i < subscribedFeeds.length; i += BATCH_SIZE) {
      const batch = subscribedFeeds.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (feed) => {
          const { episodes } = await getEpisodesByFeedId(feed.id, 5);
          return episodes.filter((ep) => {
            if (lastSyncTime === 0) return true;
            const pubDateMs = ep.datePublished * 1000;
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
          console.error(`Sync error for feed ${batch[j]?.id}`, result.reason);
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
  },
};
