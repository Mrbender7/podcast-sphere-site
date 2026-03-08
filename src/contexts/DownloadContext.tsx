import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Episode } from "@/types/podcast";
import {
  downloadEpisode,
  deleteDownload,
  isDownloaded,
  getDownloadedEpisodes,
  getLocalFileUri,
  DownloadMeta,
} from "@/services/DownloadService";

interface DownloadProgress {
  episodeId: number;
  ratio: number;
}

interface DownloadContextType {
  /** Episodes currently downloading (id → progress 0-1) */
  downloading: Record<number, number>;
  /** Check if episode is fully downloaded */
  isEpisodeDownloaded: (id: number) => boolean;
  /** Start downloading an episode */
  startDownload: (episode: Episode) => Promise<boolean>;
  /** Remove a downloaded episode */
  removeDownload: (id: number) => Promise<void>;
  /** Get all downloaded episodes */
  downloaded: DownloadMeta[];
  /** Refresh downloaded list */
  refreshDownloaded: () => void;
  /** Get local playback URI (uses convertFileSrc) */
  getPlaybackUri: (id: number) => Promise<string | null>;
}

const DownloadContext = createContext<DownloadContextType | null>(null);

export function useDownloads() {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error("useDownloads must be inside DownloadProvider");
  return ctx;
}

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [downloading, setDownloading] = useState<Record<number, number>>({});
  const [downloaded, setDownloaded] = useState<DownloadMeta[]>(getDownloadedEpisodes);
  const downloadingRef = useRef(downloading);
  downloadingRef.current = downloading;

  const refreshDownloaded = useCallback(() => {
    setDownloaded(getDownloadedEpisodes());
  }, []);

  const isEpisodeDownloaded = useCallback((id: number) => {
    return isDownloaded(id);
  }, [downloaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const startDownload = useCallback(async (episode: Episode): Promise<boolean> => {
    if (isDownloaded(episode.id) || downloadingRef.current[episode.id] !== undefined) return false;

    setDownloading(prev => ({ ...prev, [episode.id]: 0 }));

    const ok = await downloadEpisode(episode, (ratio) => {
      setDownloading(prev => ({ ...prev, [episode.id]: ratio }));
    });

    setDownloading(prev => {
      const next = { ...prev };
      delete next[episode.id];
      return next;
    });

    if (ok) refreshDownloaded();
    return ok;
  }, [refreshDownloaded]);

  const removeDownload = useCallback(async (id: number) => {
    await deleteDownload(id);
    refreshDownloaded();
  }, [refreshDownloaded]);

  const getPlaybackUri = useCallback(async (id: number) => {
    return getLocalFileUri(id);
  }, []);

  return (
    <DownloadContext.Provider
      value={{
        downloading,
        isEpisodeDownloaded,
        startDownload,
        removeDownload,
        downloaded,
        refreshDownloaded,
        getPlaybackUri,
      }}
    >
      {children}
    </DownloadContext.Provider>
  );
}
