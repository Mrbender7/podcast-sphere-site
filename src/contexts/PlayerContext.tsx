import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { Episode } from "@/types/podcast";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";
import { saveEpisodeProgress, getEpisodeProgress, addToHistory, markEpisodeCompleted, getListenHistory } from "@/services/PlaybackHistoryService";
import { getPodcastById, getEpisodesByFeedId } from "@/services/PodcastService";
import { startSilentLoop, stopSilentLoop, requestWakeLock, releaseWakeLock, setupVisibilityRecovery } from "@/utils/backgroundAudio";
import { PodcastAutoPlugin } from "@/plugins/PodcastAutoPlugin";
import { Capacitor } from '@capacitor/core';
import { voiceEnhancer } from "@/services/VoiceEnhancerService";

// Single unified helper for all native calls — no-op on web
const safeNativeCall = async (method: string, data: Record<string, unknown>) => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await (PodcastAutoPlugin.instance as any)[method](data);
  } catch (e) {
    console.warn('[PodcastAutoPlugin]', method, 'failed:', e);
  }
};

const createManagedAudio = () => {
  const audio = new Audio();
  (audio as any).playsInline = true;
  audio.preload = "auto";
  // NOTE: crossOrigin removed — blocks playback on Android WebView
  // when podcast CDNs don't return CORS headers.
  return audio;
};

const globalAudio = createManagedAudio();

interface PlayerState {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  isFullScreen: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isVoiceBoostEnabled: boolean;
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
  toggleVoiceBoost: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setCurrentFeedEpisodes: (episodes: Episode[]) => void;
  progress: number;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be inside PlayerProvider");
  return ctx;
}

// Helper: wait for audio to be playable with timeout
function playWithTimeout(audio: HTMLAudioElement, timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
      fn();
    };

    const timeout = setTimeout(() => {
      settle(() => {
        // On timeout: try play once, but reject quickly if it also fails
        const lastChance = audio.play();
        if (lastChance && typeof lastChance.then === "function") {
          const abortTimer = setTimeout(() => reject(new Error("Playback timeout")), 3000);
          lastChance.then(() => { clearTimeout(abortTimer); resolve(); })
                    .catch(() => { clearTimeout(abortTimer); reject(new Error("Playback timeout")); });
        } else {
          reject(new Error("Playback timeout"));
        }
      });
    }, timeoutMs);

    const onCanPlay = () => {
      settle(() => {
        audio.play().then(resolve).catch(reject);
      });
    };

    const onError = () => {
      settle(() => reject(new Error("Audio load error")));
    };

    if (audio.readyState >= 3) {
      settle(() => { audio.play().then(resolve).catch(reject); });
    } else {
      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("error", onError);
    }
  });
}

export function PlayerProvider({ children, onEpisodePlay }: { children: React.ReactNode; onEpisodePlay?: (episode: Episode) => void }) {
  const { t } = useTranslation();
  const [audioElement, setAudioElement] = useState<HTMLAudioElement>(() => globalAudio);
  const audioRef = useRef<HTMLAudioElement>(audioElement);
  const [state, setState] = useState<PlayerState>({
    currentEpisode: null,
    isPlaying: false,
    isBuffering: false,
    volume: 0.8,
    isFullScreen: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    isVoiceBoostEnabled: false,
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const isPlayingRef = useRef(false);
  isPlayingRef.current = state.isPlaying;

  // Concurrency guard: incremented on each play() call, stale calls are ignored
  const playTokenRef = useRef(0);

  const saveCounterRef = useRef(0);

  useEffect(() => {
    audioRef.current = audioElement;
  }, [audioElement]);

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

  // --- Full rollback helper for error states ---
  const rollbackPlayback = useCallback(() => {
    const audio = audioRef.current;
    try { audio.pause(); } catch {}
    isPlayingRef.current = false;
    setState(s => ({ ...s, isPlaying: false, isBuffering: false }));
    stopSilentLoop();
    releaseWakeLock();
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
    safeNativeCall('updatePlaybackState', { isPlaying: false, position: 0 });
  }, []);

  const replaceAudioElement = useCallback(() => {
    const previousAudio = audioRef.current;
    const freshAudio = createManagedAudio();

    freshAudio.volume = stateRef.current.volume;
    freshAudio.playbackRate = stateRef.current.playbackRate;

    try {
      previousAudio.pause();
      previousAudio.removeAttribute("src");
      previousAudio.load();
    } catch {
      // no-op
    }

    audioRef.current = freshAudio;
    setAudioElement(freshAudio);
    voiceEnhancer.release();

    return freshAudio;
  }, []);

  // --- Voice enhancer (lazy init on first toggle) ---
  const toggleVoiceBoost = useCallback(async () => {
    const next = !stateRef.current.isVoiceBoostEnabled;
    if (next) {
      const initialized = await voiceEnhancer.init(audioRef.current);
      if (!initialized) {
        setState(s => ({ ...s, isVoiceBoostEnabled: false }));
        toast({ title: "Voice Enhancer indisponible", description: "Ce flux ou cet appareil ne permet pas l'amélioration vocale locale.", variant: "destructive" });
        return;
      }
    }
    const enabled = await voiceEnhancer.toggle(next);
    setState(s => ({ ...s, isVoiceBoostEnabled: enabled }));
  }, []);

  // --- Audio event listeners ---

  useEffect(() => {
    const audio = audioElement;
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
      }
    };

    const onLoadedMetadata = () => {
      setState(s => ({ ...s, duration: audio.duration || 0, isBuffering: false }));
      syncMediaSessionPosition();
    };

    const onEnded = () => {
      setState(s => ({ ...s, isPlaying: false }));
      isPlayingRef.current = false;
      if (stateRef.current.currentEpisode) {
        markEpisodeCompleted(stateRef.current.currentEpisode.id);
        addToHistory(stateRef.current.currentEpisode, audio.duration || 0, audio.duration || 0);
        safeNativeCall('updatePlaybackState', { isPlaying: false, position: Math.round((audio.duration || 0) * 1000) });
      }
      stopSilentLoop();
      releaseWakeLock();
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    };

    const onError = () => {
      console.error("[Player] Stream error encountered.");
      rollbackPlayback();
      toast({ title: t("player.streamError"), description: t("player.streamErrorDesc"), variant: "destructive" });
    };

    const onWaiting = () => setState(s => ({ ...s, isBuffering: true }));
    const onCanPlay = () => setState(s => ({ ...s, isBuffering: false }));

    // Stall watchdog: if we stay stuck buffering for 20s, rollback
    let stallTimer: ReturnType<typeof setTimeout> | null = null;
    const onStalled = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => {
        if (stateRef.current.isBuffering && isPlayingRef.current) {
          console.warn("[Player] Stall watchdog triggered after 20s");
          rollbackPlayback();
          toast({ title: t("player.streamError"), description: t("player.streamErrorDesc"), variant: "destructive" });
        }
      }, 20000);
    };
    const onPlaying = () => {
      if (stallTimer) { clearTimeout(stallTimer); stallTimer = null; }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("stalled", onStalled);
    audio.addEventListener("playing", onPlaying);

    const cleanupVisibility = setupVisibilityRecovery(audio, isPlayingRef);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("stalled", onStalled);
      audio.removeEventListener("playing", onPlaying);
      if (stallTimer) clearTimeout(stallTimer);
      cleanupVisibility();
    };
  }, [audioElement, rollbackPlayback, syncMediaSessionPosition, t, state.volume]);

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

  const pausePlayback = useCallback(() => {
    const audio = audioRef.current;
    const currentEpisode = stateRef.current.currentEpisode;
    if (!currentEpisode) return;

    isPlayingRef.current = false;
    audio.pause();
    saveEpisodeProgress(currentEpisode.id, audio.currentTime, audio.duration || 0);
    addToHistory(currentEpisode, audio.currentTime, audio.duration || 0);
    setState(s => ({ ...s, isPlaying: false, isBuffering: false }));
    updateMediaSession(currentEpisode, false);
    syncMediaSessionPosition();
    stopSilentLoop();
    releaseWakeLock();
    void safeNativeCall('updatePlaybackState', {
      isPlaying: false,
      position: Math.round((audio.currentTime || 0) * 1000),
    });
  }, [updateMediaSession, syncMediaSessionPosition]);

  const resumePlayback = useCallback(async () => {
    const audio = audioRef.current;
    const currentEpisode = stateRef.current.currentEpisode;
    if (!currentEpisode) return;

    setState(s => ({ ...s, isBuffering: true }));

    try {
      await playWithTimeout(audio);
      isPlayingRef.current = true;
      setState(s => ({ ...s, isPlaying: true, isBuffering: false }));
      updateMediaSession(currentEpisode, true);
      syncMediaSessionPosition();
      startSilentLoop();
      requestWakeLock();
      await safeNativeCall('updatePlaybackState', {
        isPlaying: true,
        position: Math.round((audio.currentTime || 0) * 1000),
      });
    } catch (e) {
      console.error("[Player] Resume/toggle play error:", e);
      rollbackPlayback();
    }
  }, [updateMediaSession, syncMediaSessionPosition, rollbackPlayback]);

  const togglePlay = useCallback(() => {
    if (!stateRef.current.currentEpisode) return;
    if (stateRef.current.isPlaying) {
      pausePlayback();
      return;
    }

    void resumePlayback();
  }, [pausePlayback, resumePlayback]);

  // Keep togglePlayRef in sync for native listeners
  togglePlayRef.current = togglePlay;

  // --- MediaSession action handlers ---

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => {
      void resumePlayback();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      pausePlayback();
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
  }, [pausePlayback, resumePlayback, syncMediaSessionPosition]);

  // --- Native event listeners (guarded by platform check) ---

  useEffect(() => {
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
            pausePlayback();
          }
        });
        mediaCommandListener = await PodcastAutoPlugin.addListener(
          'mediaCommand',
          async (data: { action: string; position?: number; mediaId?: string }) => {
            switch (data.action) {
              case 'play':
                if (!isPlayingRef.current) {
                  await resumePlayback();
                }
                break;
              case 'pause':
                if (isPlayingRef.current) {
                  pausePlayback();
                }
                break;
              case 'toggle':
                togglePlayRef.current();
                break;
              case 'seek':
                if (audioRef.current && data.position != null) {
                  audioRef.current.currentTime = data.position / 1000;
                  syncMediaSessionPosition();
                  await safeNativeCall('updatePlaybackState', {
                    isPlaying: isPlayingRef.current,
                    position: Math.round(audioRef.current.currentTime * 1000),
                  });
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
  }, [pausePlayback, resumePlayback, syncMediaSessionPosition]);

  const play = useCallback(async (episode: Episode) => {
    if (!episode.enclosureUrl) {
      toast({ title: t("player.error"), description: t("player.streamUnavailable"), variant: "destructive" });
      return;
    }

    // Concurrency guard: invalidate any in-flight play request
    const token = ++playTokenRef.current;

    let audio = audioRef.current;
    audio.pause();
    stopSilentLoop();
    releaseWakeLock();

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

    // Check if a newer play() was called while we were resolving the source
    if (token !== playTokenRef.current) return;

    if (voiceEnhancer.canUse()) {
      audio = replaceAudioElement();
      setState(s => ({ ...s, isVoiceBoostEnabled: false }));
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

      // Stale guard: if user tapped another episode during load, bail out
      if (token !== playTokenRef.current) {
        audio.pause();
        return;
      }

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
      console.warn("[Player] First play attempt failed, retrying...", e);
      // Only retry if this is still the active play request
      if (token === playTokenRef.current) {
        try {
          // Replace audio element and retry once
          audio = replaceAudioElement();
          audio.src = audioSrc;
          audio.playbackRate = stateRef.current.playbackRate;
          audio.load();
          await playWithTimeout(audio);

          if (token !== playTokenRef.current) { audio.pause(); return; }

          if (resumeTime > 0) audio.currentTime = resumeTime;
          isPlayingRef.current = true;
          setState(s => ({ ...s, isPlaying: true, isBuffering: false }));
          syncMediaSessionPosition();
          startSilentLoop();
          requestWakeLock();
          onEpisodePlay?.(episode);
        } catch (retryErr) {
          console.error("[Player] Retry also failed:", retryErr);
          if (token === playTokenRef.current) {
            rollbackPlayback();
            toast({ title: t("player.streamError"), description: t("player.streamErrorDesc"), variant: "destructive" });
          }
        }
      }
    }
  }, [hydrateEpisodeMetadata, updateMediaSession, onEpisodePlay, syncMediaSessionPosition, rollbackPlayback, replaceAudioElement, t]);

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
    <PlayerContext.Provider value={{ ...state, play, togglePlay, setVolume, openFullScreen, closeFullScreen, seek, skipForward, skipBackward, setPlaybackRate, toggleVoiceBoost, progress }}>
      {children}
    </PlayerContext.Provider>
  );
}
