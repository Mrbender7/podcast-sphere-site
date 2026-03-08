import { useState, useRef, useCallback } from "react";
import { Podcast } from "@/types/podcast";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { PodcastCard } from "@/components/PodcastCard";
import { PodcastDetailPage } from "@/pages/PodcastDetailPage";
import { Bookmark, ArrowUp } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LibraryPage() {
  const { t } = useTranslation();
  const { subscriptions, hasNewEpisodes } = useFavoritesContext();
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) setShowScrollTop(el.scrollTop > 300);
  }, []);

  if (selectedPodcast) {
    return <PodcastDetailPage podcast={selectedPodcast} onBack={() => setSelectedPodcast(null)} />;
  }

  return (
    <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 pb-32">
      <h1 className="text-2xl font-heading font-bold mt-6 mb-2 bg-gradient-to-r from-[hsl(220,90%,60%)] to-[hsl(280,80%,60%)] bg-clip-text text-transparent flex items-center gap-2">
        {t("favorites.title")}
        {subscriptions.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[hsl(280,80%,60%)] text-white leading-none">{subscriptions.length}</span>
        )}
      </h1>

      {subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bookmark className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">{t("favorites.empty")}</h2>
          <p className="text-sm text-muted-foreground max-w-[250px]">{t("favorites.emptyDesc")}</p>
        </div>
      ) : (
        <div className="space-y-1 mt-4">
          {subscriptions.map(p => (
            <div key={p.id} className="relative">
              <PodcastCard podcast={p} compact onClick={setSelectedPodcast} />
              {hasNewEpisodes(p) && (
                <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-48 right-4 z-50 w-10 h-10 rounded-full bg-primary/70 backdrop-blur-sm text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300",
          showScrollTop ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        )}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
