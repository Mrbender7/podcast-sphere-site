import { Podcast } from "@/types/podcast";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { CachedImage } from "@/components/CachedImage";
import { MarqueeText } from "@/components/MarqueeText";

interface PodcastCardProps {
  podcast: Podcast;
  compact?: boolean;
  onClick?: (podcast: Podcast) => void;
}

export function PodcastCard({ podcast, compact, onClick }: PodcastCardProps) {
  const { isSubscribed, toggleSubscription } = useFavoritesContext();
  const { t } = useTranslation();
  const subscribed = isSubscribed(podcast.id);

  const handleToggleSub = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSubscription(podcast);
    if (!subscribed) {
      toast.success(`${t("podcast.subscribed")} — ${podcast.title}`);
    }
  };

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer"
        onClick={() => onClick?.(podcast)}
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-accent">
          <CachedImage
            src={podcast.image}
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <MarqueeText text={podcast.title} className="text-sm font-semibold text-foreground" />
          <MarqueeText text={podcast.author} className="text-xs text-muted-foreground" />
        </div>
        <button
          onClick={handleToggleSub}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-accent transition-colors"
          aria-label={subscribed ? t("podcast.subscribed") : t("podcast.subscribe")}
        >
          <Bookmark className={`w-4 h-4 ${subscribed ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex-shrink-0 w-[105px] cursor-pointer group transition-transform duration-300 ease-out hover:scale-105"
      onClick={() => onClick?.(podcast)}
    >
      <div className="aspect-square rounded-xl overflow-hidden bg-accent mb-2 shadow-lg group-active:scale-95 transition-all duration-300 ease-out group-hover:shadow-[0_8px_30px_-4px_hsl(var(--primary)/0.45)]"
        style={{ boxShadow: '0 4px 15px -3px hsla(250, 80%, 50%, 0.3)' }}
      >
        <CachedImage
          src={podcast.image}
          alt={podcast.title}
          className="w-full h-full object-cover"
        />
      </div>
      <MarqueeText text={podcast.title} className="text-sm font-semibold text-foreground" />
      <MarqueeText text={podcast.author} className="text-xs text-muted-foreground" />
    </div>
  );
}
