import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { Episode } from "@/types/podcast";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";
import { saveEpisodeProgress, getEpisodeProgress, addToHistory, markEpisodeCompleted } from "@/services/PlaybackHistoryService";
import { getPodcastById } from "@/services/PodcastService";
import { startSilentLoop, stopSilentLoop, requestWakeLock, releaseWakeLock, setupVisibilityRecovery } from "@/utils/backgroundAudio";
import { PodcastAutoPlugin } from "@/plugins/PodcastAutoPlugin";
import { Capacitor } from '@capacitor/core';

// Single unified helper for all native calls — no-op on web
const safeNativeCall = async (method: string, data: Record<string, unknown>) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await (PodcastAutoPlugin.instance as any)[method](data);
  } catch (e) {
    console.warn('[PodcastAutoPlugin]', method, 'failed:', e);
  }
};

const globalAudio = new Audio();
(globalAudio as any).playsInline = true;
globalAudio.preload = "auto";

interface PlayerState {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  isFullScreen: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
}

interface PlayerContextType extends PlayerState {
  play: (episode: Episode) => void;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  openFullScreen: () => void;
  closeFullScreen: () => void;
  seek: (seconds: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  setPlaybackRate: (rate: number) => void;
  progress: number;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}

// Helper: wait for audio to be playable with timeout
function playWithTimeout(audio: HTMLAudioElement, timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.play().then(resolve).catch(reject);
    }, timeoutMs);

    const onCanPlay = () => {
      clearTimeout(timeout);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      audio.play().then(resolve).catch(reject);
    };

    const onError = () => {
      clearTimeout(timeout);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      reject(new Error("Audio load error"));
    };

    if (audio.readyState >= 3) {
      clearTimeout(timeout);
      audio.play().then(resolve).catch(reject);
    } else {
      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("error", onError);
    }
  });
}

export function PlayerProvider({ children, onEpisodePlay }: { children: React.ReactNode; onEpisodePlay?: (episode: Episode) => void }) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(globalAudio);
  const [state, setState] = useState<PlayerState>({
    currentEpisode: null,
    isPlaying: false,
    isBuffering: false,
    volume: 0.8,
    isFullScreen: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(false);
  isPlayingRef.current = state.isPlaying;

  const saveCounterRef = useRef(0);

  const syncMediaSessionPosition = useCallback(() => {
    const audio = audioRef.current;
    if (!("mediaSession" in navigator)) return;
    const dur = audio.duration;
    const pos = audio.currentTime;
    if (!isNaN(dur) && dur > 0 && !isNaN(pos)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: dur,
          playbackRate: audio.playbackRate || 1,
          position: Math.max(0, Math.min(pos, dur)),
        });
      } catch (e) {
        console.error("[Player] Sync position error:", e);
      }
    }
  }, []);

  // --- Audio event listeners ---

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = state.volume;

    const onTimeUpdate = () => {
      const ct = audio.currentTime;
      const dur = audio.duration || 0;
      setState(s => ({ ...s, currentTime: ct, duration: dur }));

      // Real-time lockscreen position update (clamped)
      if ("mediaSession" in navigator && !isNaN(dur) && dur > 0 && !isNaN(ct)) {
        try {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: audio.playbackRate || 1,
            position: Math.max(0, Math.min(ct, dur)),
          });
        } catch (e) { /* Ignore sync errors */ }
      }

      // Save progress every ~5 seconds
      saveCounterRef.current++;
      if (saveCounterRef.current % 5 === 0 && stateRef.current.currentEpisode) {
        saveEpisodeProgress(stateRef.current.currentEpisode.id, ct, dur);
        addToHistory(stateRef.current.currentEpisode, ct, dur);
        // NOTE: native position sync is handled by the periodic useEffect below
      }
    };

    const onLoadedMetadata = () => {
      setState(s => ({ ...s, duration: audio.duration || 0, isBuffering: false }));
      syncMediaSessionPosition();
    };

    const onEnded = () => {
      setState(s => ({ ...s, isPlaying: false }));
      if (stateRef.current.currentEpisode) {
        markEpisodeCompleted(stateRef.current.currentEpisode.id);
        addToHistory(stateRef.current.currentEpisode, audio.duration || 0, audio.duration || 0);
        safeNativeCall('updatePlaybackState', { isPlaying: false, position: Math.round((audio.duration || 0) * 1000) });
      }
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    };

    const onError = () => {
      console.error("[Player] Stream error encountered.");
      setState(s => ({ ...s, isPlaying: false, isBuffering: false }));
      toast({ title: t("player.streamError"), description: t("player.streamErrorDesc"), variant: "destructive" });
    };

    const onWaiting = () => setState(s => ({ ...s, isBuffering: true }));
    const onCanPlay = () => setState(s => ({ ...s, isBuffering: false }));

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    const cleanupVisibility = setupVisibilityRecovery(audio, isPlayingRef);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      cleanupVisibility();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMediaSession = useCallback((episode: Episode, playing: boolean) => {
    if (!("mediaSession" in navigator)) return;
    const artworkUrl = episode.feedImage || episode.image || new URL("/android-chrome-512x512.png", window.location.origin).href;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: episode.feedAuthor || episode.feedTitle,
      album: episode.feedTitle,
      artwork: [{ src: artworkUrl, sizes: "512x512", type: "image/png" }],
    });
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, []);

  // --- MediaSession action handlers ---

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current.play().catch(e => console.error("[Player] Play action error:", e));
      setState(s => ({ ...s, isPlaying: true }));
      syncMediaSessionPosition();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current.pause();
      setState(s => ({ ...s, isPlaying: false }));
      syncMediaSessionPosition();
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
      syncMediaSessionPosition();
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      audioRef.current.currentTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 30);
      syncMediaSessionPosition();
    });
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null && !isNaN(details.seekTime)) {
        audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || 0, details.seekTime));
        syncMediaSessionPosition();
      }
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, [syncMediaSessionPosition]);

  // --- Native event listeners (guarded by platform check) ---

  const togglePlayRef = useRef<() => void>(() => {});

  const hydrateEpisodeMetadata = useCallback(async (episode: Episode): Promise<Episode> => {
    if (episode.feedTitle || episode.feedAuthor || !episode.feedId) return episode;

    try {
      const feed = await getPodcastById(episode.feedId);
      if (!feed) return episode;

      return {
        ...episode,
        feedTitle: feed.title || episode.feedTitle,
        feedAuthor: feed.author || episode.feedAuthor,
        feedImage: episode.feedImage || feed.image || episode.image,
      };
    } catch {
      return episode;
    }
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!stateRef.current.currentEpisode) return;
    if (stateRef.current.isPlaying) {
      isPlayingRef.current = false;
      audio.pause();
      saveEpisodeProgress(stateRef.current.currentEpisode.id, audio.currentTime, audio.duration || 0);
      addToHistory(stateRef.current.currentEpisode, audio.currentTime, audio.duration || 0);
      setState(s => ({ ...s, isPlaying: false }));
      updateMediaSession(stateRef.current.currentEpisode, false);
      syncMediaSessionPosition();
      stopSilentLoop();
      releaseWakeLock();
      safeNativeCall('updatePlaybackState', {
        isPlaying: false,
        position: Math.round(audio.currentTime * 1000),
      });
    } else {
      audio.play().then(() => {
        isPlayingRef.current = true;
        setState(s => ({ ...s, isPlaying: true }));
        updateMediaSession(stateRef.current.currentEpisode!, true);
        syncMediaSessionPosition();
        startSilentLoop();
        requestWakeLock();
        safeNativeCall('updatePlaybackState', {
          isPlaying: true,
          position: Math.round(audio.currentTime * 1000),
        });
      }).catch(e => console.error("[Player] Toggle play error:", e));
    }
  }, [updateMediaSession, syncMediaSessionPosition]);

  // Keep togglePlayRef in sync for native listeners
  togglePlayRef.current = togglePlay;

  useEffect(() => {
    // Only register native listeners on Android
    if (!Capacitor.isNativePlatform()) return;

    let mediaToggleListener: any;
    let vehicleDisconnectListener: any;
    let mediaCommandListener: any;

    (async () => {
      try {
        mediaToggleListener = await PodcastAutoPlugin.addListener("mediaToggle", () => {
          togglePlayRef.current();
        });
        vehicleDisconnectListener = await PodcastAutoPlugin.addListener("vehicleDisconnected", () => {
          if (isPlayingRef.current) {
            togglePlayRef.current();
          }
        });
        mediaCommandListener = await PodcastAutoPlugin.addListener(
          'mediaCommand',
          (data: { action: string; position?: number; mediaId?: string }) => {
            switch (data.action) {
              case 'play':
                if (!isPlayingRef.current) togglePlayRef.current();
                break;
              case 'pause':
                if (isPlayingRef.current) togglePlayRef.current();
                break;
              case 'toggle':
                togglePlayRef.current();
                break;
              case 'seek':
                if (audioRef.current && data.position != null) {
                  audioRef.current.currentTime = data.position / 1000;
                }
                break;
            }
          }
        );
      } catch (e) {
        console.log("[Player] Native listeners not available:", e);
      }
    })();

    return () => {
      try {
        mediaToggleListener?.remove?.();
        vehicleDisconnectListener?.remove?.();
        mediaCommandListener?.remove?.();
      } catch {}
    };
  }, []);

  const play = useCallback(async (episode: Episode) => {
    if (!episode.enclosureUrl) {
      toast({ title: t("player.error"), description: t("player.streamUnavailable"), variant: "destructive" });
      return;
    }
    const audio = audioRef.current;
    audio.pause();

    let audioSrc = episode.enclosureUrl;
    try {
      const { isDownloaded, getLocalFileUri } = await import("@/services/DownloadService");
      if (isDownloaded(episode.id)) {
        const localUri = await getLocalFileUri(episode.id);
        if (localUri) audioSrc = localUri;
      }
    } catch {
      console.warn("[Player] Local check failed, falling back to stream.");
    }

    audio.src = audioSrc;
    audio.playbackRate = stateRef.current.playbackRate;
    audio.load();

    const saved = getEpisodeProgress(episode.id);
    const resumeTime = saved && !saved.completed && saved.currentTime > 5 ? saved.currentTime - 2 : 0;

    setState(s => ({ ...s, currentEpisode: episode, isBuffering: true, isPlaying: false, currentTime: resumeTime, duration: 0 }));
    updateMediaSession(episode, true);

    void hydrateEpisodeMetadata(episode).then((hydratedEpisode) => {
      if (hydratedEpisode === episode) return;
      setState(s => {
        if (s.currentEpisode?.id !== episode.id) return s;
        return { ...s, currentEpisode: hydratedEpisode };
      });
      updateMediaSession(hydratedEpisode, stateRef.current.isPlaying);
      addToHistory(hydratedEpisode, audio.currentTime || resumeTime, audio.duration || saved?.duration || 0);
    });

    try {
      await playWithTimeout(audio);
      if (resumeTime > 0) audio.currentTime = resumeTime;
      isPlayingRef.current = true;
      setState(s => ({ ...s, isPlaying: true, isBuffering: false }));
      syncMediaSessionPosition();
      startSilentLoop();
      requestWakeLock();
      onEpisodePlay?.(episode);
      addToHistory(episode, resumeTime, saved?.duration || 0);

      // Single native sync — updateNowPlaying then updatePlaybackState
      await safeNativeCall('updateNowPlaying', {
        title:      episode.title ?? '',
        author:     episode.feedAuthor ?? episode.feedTitle ?? '',
        artworkUrl: episode.feedImage ?? episode.image ?? '',
        duration:   (episode.duration ?? 0) * 1000,
      });
      await safeNativeCall('updatePlaybackState', {
        isPlaying: true,
        position:  Math.round(resumeTime * 1000),
      });
    } catch (e) {
      console.error("[Player] Playback failed:", e);
      setState(s => ({ ...s, isPlaying: false, isBuffering: false }));
      toast({ title: t("player.streamError"), description: t("player.streamErrorDesc"), variant: "destructive" });
    }
  }, [hydrateEpisodeMetadata, updateMediaSession, onEpisodePlay, syncMediaSessionPosition, t]);

  const setVolume = useCallback((v: number) => {
    audioRef.current.volume = v;
    setState(s => ({ ...s, volume: v }));
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, seconds));
    syncMediaSessionPosition();
  }, [syncMediaSessionPosition]);

  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30);
    syncMediaSessionPosition();
  }, [syncMediaSessionPosition]);

  const skipBackward = useCallback(() => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, audio.currentTime - 15);
    syncMediaSessionPosition();
  }, [syncMediaSessionPosition]);

  const setPlaybackRate = useCallback((rate: number) => {
    audioRef.current.playbackRate = rate;
    setState(s => ({ ...s, playbackRate: rate }));
    syncMediaSessionPosition();
  }, [syncMediaSessionPosition]);

  const openFullScreen = useCallback(() => setState(s => ({ ...s, isFullScreen: true })), []);
  const closeFullScreen = useCallback(() => setState(s => ({ ...s, isFullScreen: false })), []);

  // Periodic native position sync every 5s during playback
  useEffect(() => {
    if (!state.isPlaying) return;
    const interval = setInterval(() => {
      safeNativeCall('updatePlaybackState', {
        isPlaying: true,
        position: Math.round((audioRef.current?.currentTime ?? 0) * 1000),
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [state.isPlaying]);

  const progress = state.duration > 0 ? state.currentTime / state.duration : 0;

  return (
    <PlayerContext.Provider value={{ ...state, play, togglePlay, setVolume, openFullScreen, closeFullScreen, seek, skipForward, skipBackward, setPlaybackRate, progress }}>
      {children}
    </PlayerContext.Provider>
  );
}
