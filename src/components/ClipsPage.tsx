import { useState } from "react";
import { SnippetService, AudioSnippet } from "@/services/SnippetService";
import { usePlayer } from "@/contexts/PlayerContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { CachedImage } from "@/components/CachedImage";
import { Play, Trash2, Share2, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ClipsPage() {
  const { t } = useTranslation();
  const { currentEpisode, seek, play } = usePlayer();
  const [snippets, setSnippets] = useState<AudioSnippet[]>(() => SnippetService.getAllSnippets());

  const handleDelete = (id: string) => {
    SnippetService.deleteSnippet(id);
    setSnippets(SnippetService.getAllSnippets());
    toast.success("Clip supprimé");
  };

  const handlePlay = (snippet: AudioSnippet) => {
    // If the current episode matches, just seek to the start time
    if (currentEpisode && currentEpisode.id === snippet.episodeId) {
      seek(snippet.startTime);
    } else {
      // We don't have the full Episode object stored, so we show a hint
      toast.info("Lance d'abord l'épisode, puis reviens ici pour réécouter le clip.");
    }
  };

  const handleShare = async (snippet: AudioSnippet) => {
    try {
      await SnippetService.shareSnippet(snippet);
    } catch {
      toast.error("Erreur lors du partage");
    }
  };

  if (snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <Scissors className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          Aucun clip sauvegardé. Utilise le bouton ✂️ dans le lecteur pour créer un clip.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {snippets.map((snippet) => (
        <div
          key={snippet.id}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-accent">
            <CachedImage
              src={snippet.artwork}
              alt={snippet.podcastTitle}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <MarqueeText
              text={snippet.customTitle || snippet.podcastTitle}
              className="text-sm font-semibold text-foreground"
            />
            <MarqueeText text={snippet.episodeTitle} className="text-xs text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {SnippetService.formatTime(snippet.startTime)} → {SnippetService.formatTime(snippet.endTime)} ({snippet.duration}s)
            </p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => handlePlay(snippet)}
              className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
              aria-label="Play clip"
            >
              <Play className="w-3.5 h-3.5 ml-0.5 text-foreground" />
            </button>
            <button
              onClick={() => handleShare(snippet)}
              className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
              aria-label="Share clip"
            >
              <Share2 className="w-3.5 h-3.5 text-foreground" />
            </button>
            <button
              onClick={() => handleDelete(snippet.id)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Delete clip"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
