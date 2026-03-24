import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSubscriptions, useRecentEpisodes } from "@/hooks/useFavorites";
import { Podcast } from "@/types/podcast";
import { Episode } from "@/types/podcast";
import { syncFavoritesToNative } from "@/plugins/PodcastAutoPlugin";

interface FavoritesContextType {
  subscriptions: Podcast[];
  toggleSubscription: (podcast: Podcast) => void;
  isSubscribed: (id: number) => boolean;
  markAsSeen: (podcastId: number, episodeDate: number) => void;
  hasNewEpisodes: (podcast: Podcast) => boolean;
  recent: Episode[];
  addRecent: (episode: Episode) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { subscriptions, toggleSubscription, isSubscribed, markAsSeen, hasNewEpisodes } = useSubscriptions();
  const { recent, addRecent } = useRecentEpisodes();

  // Sync subscriptions to native SharedPreferences for Android Auto
  useEffect(() => {
    const minimal = subscriptions.map(p => ({
      id: p.id,
      title: p.title,
      author: p.author,
      image: p.image,
    }));
    syncFavoritesToNative(minimal);
  }, [subscriptions]);

  return (
    <FavoritesContext.Provider value={{ subscriptions, toggleSubscription, isSubscribed, markAsSeen, hasNewEpisodes, recent, addRecent }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavoritesContext must be used within FavoritesProvider");
  return ctx;
}
