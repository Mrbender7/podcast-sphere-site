import { Episode, Podcast } from "@/types/podcast";
import { getEpisodesByFeedId } from "@/services/PodcastService";

const NEW_EPISODES_KEY = "ps_new_episodes";
const LAST_SYNC_KEY = "ps_last_sync_time";
const SYNC_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

export const NewEpisodesService = {
  getNewEpisodesFromCache(): Episode[] {
    const data = localStorage.getItem(NEW_EPISODES_KEY);
    return data ? JSON.parse(data) : [];
  },

  markAsSeen(episodeId: number): void {
    const current = this.getNewEpisodesFromCache();
    const updated = current.filter((ep) => ep.id !== episodeId);
    localStorage.setItem(NEW_EPISODES_KEY, JSON.stringify(updated));
  },

  async syncNewEpisodes(
    subscribedFeeds: Podcast[],
    forceRefresh = false
  ): Promise<Episode[]> {
    if (!subscribedFeeds || subscribedFeeds.length === 0) return [];

    const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
    const lastSyncTime = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
    const now = Date.now();

    if (!forceRefresh && now - lastSyncTime < SYNC_COOLDOWN_MS) {
      console.log("Sync skipped: 4h cooldown not expired.");
      return this.getNewEpisodesFromCache();
    }

    console.log("Syncing new episodes...");
    let allNewEpisodes: Episode[] = [];

    for (const feed of subscribedFeeds) {
      try {
        const { episodes } = await getEpisodesByFeedId(feed.id, 5);

        const newForFeed = episodes.filter((ep) => {
          if (lastSyncTime === 0) return true;
          const pubDateMs = ep.datePublished * 1000;
          return pubDateMs > lastSyncTime;
        });

        // On first sync, only take the latest episode per feed
        if (lastSyncTime === 0 && newForFeed.length > 0) {
          allNewEpisodes.push(newForFeed[0]);
        } else {
          allNewEpisodes = [...allNewEpisodes, ...newForFeed];
        }
      } catch (error) {
        console.error(`Sync error for feed ${feed.id}`, error);
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
