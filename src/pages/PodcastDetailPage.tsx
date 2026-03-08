import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Podcast } from "@/types/podcast";
import { getEpisodesByFeedId } from "@/services/PodcastService";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { EpisodeRow } from "@/components/EpisodeRow";
import { ArrowLeft, Bookmark, Loader2, ArrowDownUp } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import stationPlaceholder from "@/assets/station-placeholder.png";

interface PodcastDetailPageProps {
  podcast: Podcast;
  onBack: () => void;
}

export function PodcastDetailPage({ podcast, onBack }: PodcastDetailPageProps) {
  const { t } = useTranslation();
  const { isSubscribed, toggleSubscription, markAsSeen } = useFavoritesContext();
  const subscribed = isSubscribed(podcast.id);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const { data: episodes, isLoading } = useQuery({
    queryKey: ["episodes", podcast.id],
    queryFn: () => getEpisodesByFeedId(podcast.id),
    staleTime: 5 * 60 * 1000,
  });

  const sortedEpisodes = useMemo(() => {
    if (!episodes) return undefined;
    return [...episodes].sort((a, b) =>
      sortNewestFirst ? b.datePublished - a.datePublished : a.datePublished - b.datePublished
    );
  }, [episodes, sortNewestFirst]);

  // Mark as seen when viewing episodes
  useEffect(() => {
    if (episodes && episodes.length > 0) {
      const newest = Math.max(...episodes.map(e => e.datePublished));
      if (newest > 0) markAsSeen(podcast.id, newest);
    }
  }, [episodes, podcast.id, markAsSeen]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t("common.cancel")}</span>
        </button>

        <div className="flex gap-4">
          <div className="w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-accent shadow-lg"
            style={{ boxShadow: '0 8px 30px -5px hsla(250, 80%, 50%, 0.4)' }}
          >
            <img
              src={podcast.image || stationPlaceholder}
              alt={podcast.title}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).src = stationPlaceholder; }}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h1 className="text-xl font-heading font-bold text-foreground leading-tight line-clamp-2">{podcast.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{podcast.author}</p>
            <button
              onClick={() => toggleSubscription(podcast)}
              className={`mt-3 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 w-fit transition-all ${
                subscribed
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-foreground hover:bg-primary/20"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${subscribed ? "fill-current" : ""}`} />
              {subscribed ? t("podcast.subscribed") : t("podcast.subscribe")}
            </button>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 mt-4">
        <h2 className="text-lg font-heading font-semibold mb-3 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent">
          {t("podcast.episodes")} {episodes && `(${episodes.length})`}
        </h2>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {episodes && (
          <div className="space-y-1">
            {episodes.map(ep => (
              <EpisodeRow key={ep.id} episode={ep} />
            ))}
          </div>
        )}

        {episodes && episodes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">{t("podcast.noEpisodes")}</p>
        )}
      </div>
    </div>
  );
}
