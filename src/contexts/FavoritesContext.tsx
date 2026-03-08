import { createContext, useContext, ReactNode } from "react";
import { useSubscriptions, useRecentEpisodes } from "@/hooks/useFavorites";
import { Podcast } from "@/types/podcast";
import { Episode } from "@/types/podcast";

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
