import { Episode } from "@/types/podcast";
import { Share } from '@capacitor/share';

export interface AudioSnippet {
  id: string;
  episodeId: string | number;
  episodeTitle: string;
  podcastTitle: string;
  artwork: string;
  startTime: number;
  endTime: number;
  duration: number;
  createdAt: number;
  customTitle?: string;
}

const SNIPPETS_STORAGE_KEY = 'ps_premium_snippets';

export const SnippetService = {
  getAllSnippets(): AudioSnippet[] {
    try {
      const data = localStorage.getItem(SNIPPETS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Erreur lors de la lecture des snippets locaux:", error);
      return [];
    }
  },

  saveSnippet(episode: Episode, currentTime: number, duration: number = 30, customTitle?: string): AudioSnippet | null {
    if (!episode || currentTime <= 0) return null;

    const snippets = this.getAllSnippets();
    const startTime = Math.max(0, currentTime - duration);

    const newSnippet: AudioSnippet = {
      id: `snippet_${Date.now()}`,
      episodeId: episode.id,
      episodeTitle: episode.title,
      podcastTitle: episode.feedTitle || "Podcast Inconnu",
      artwork: episode.feedImage || episode.image || "",
      startTime,
      endTime: currentTime,
      duration,
      createdAt: Date.now(),
      customTitle,
    };

    snippets.unshift(newSnippet);
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(snippets));

    return newSnippet;
  },

  deleteSnippet(snippetId: string): void {
    const snippets = this.getAllSnippets();
    const filtered = snippets.filter(s => s.id !== snippetId);
    localStorage.setItem(SNIPPETS_STORAGE_KEY, JSON.stringify(filtered));
  },

  async shareSnippet(snippet: AudioSnippet, enclosureUrl?: string): Promise<void> {
    const shareText = `Écoute cet extrait de "${snippet.podcastTitle}" ! 🎧\n\nÉpisode : ${snippet.episodeTitle}\nExtrait de ${this.formatTime(snippet.startTime)} à ${this.formatTime(snippet.endTime)}.\n\nLien pour écouter : ${enclosureUrl || 'Lien indisponible'}`;

    try {
      await Share.share({
        title: `Extrait : ${snippet.podcastTitle}`,
        text: shareText,
        dialogTitle: 'Partager cet extrait sonore'
      });
    } catch (error) {
      console.error("Erreur lors de l'appel au partage natif :", error);
    }
  },

  formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
};
