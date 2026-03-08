import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { Episode } from "@/types/podcast";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";
import { saveEpisodeProgress, getEpisodeProgress, addToHistory, markEpisodeCompleted } from "@/services/PlaybackHistoryService";

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

  // Time update listener + auto-save progress
  const saveCounterRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = state.volume;

    const onTimeUpdate = () => {
      const ct = audio.currentTime;
      const dur = audio.duration || 0;
      setState(s => ({ ...s, currentTime: ct, duration: dur }));

      // Save progress every ~5 seconds
      saveCounterRef.current++;
      if (saveCounterRef.current % 5 === 0 && stateRef.current.currentEpisode) {
        saveEpisodeProgress(stateRef.current.currentEpisode.id, ct, dur);
        addToHistory(stateRef.current.currentEpisode, ct, dur);
      }
    };

    const onLoadedMetadata = () => {
      setState(s => ({ ...s, duration: audio.duration || 0, isBuffering: false }));
    };

    const onEnded = () => {
      setState(s => ({ ...s, isPlaying: false }));
      if (stateRef.current.currentEpisode) {
        markEpisodeCompleted(stateRef.current.currentEpisode.id);
        addToHistory(stateRef.current.currentEpisode, audio.duration || 0, audio.duration || 0);
      }
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    };

    const onError = () => {
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

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
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

  // MediaSession action handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current.play().catch(() => {});
      setState(s => ({ ...s, isPlaying: true }));
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current.pause();
      setState(s => ({ ...s, isPlaying: false }));
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      audioRef.current.currentTime = Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + 30);
    });
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) audioRef.current.currentTime = details.seekTime;
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, []);

  const play = useCallback(async (episode: Episode) => {
    if (!episode.enclosureUrl) {
      toast({ title: t("player.error"), description: t("player.streamUnavailable"), variant: "destructive" });
      return;
    }
    const audio = audioRef.current;
    audio.pause();
    audio.src = episode.enclosureUrl;
    audio.playbackRate = state.playbackRate;
    audio.load();

    setState(s => ({ ...s, currentEpisode: episode, isBuffering: true, isPlaying: false, currentTime: 0, duration: 0 }));
    updateMediaSession(episode, true);

    try {
      await audio.play();
      setState(s => ({ ...s, isPlaying: true, isBuffering: false }));
      onEpisodePlay?.(episode);
    } catch {
      setState(s => ({ ...s, isPlaying: false, isBuffering: false }));
      toast({ title: t("player.streamError"), description: t("player.streamErrorDesc"), variant: "destructive" });
    }
  }, [state.playbackRate, updateMediaSession, onEpisodePlay, t]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!state.currentEpisode) return;
    if (state.isPlaying) {
      audio.pause();
      setState(s => ({ ...s, isPlaying: false }));
      updateMediaSession(state.currentEpisode, false);
    } else {
      audio.play().then(() => {
        setState(s => ({ ...s, isPlaying: true }));
        updateMediaSession(state.currentEpisode!, true);
      }).catch(() => {});
    }
  }, [state.isPlaying, state.currentEpisode, updateMediaSession]);

  const setVolume = useCallback((v: number) => {
    audioRef.current.volume = v;
    setState(s => ({ ...s, volume: v }));
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, seconds));
  }, []);

  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 30);
  }, []);

  const skipBackward = useCallback(() => {
    const audio = audioRef.current;
    audio.currentTime = Math.max(0, audio.currentTime - 15);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    audioRef.current.playbackRate = rate;
    setState(s => ({ ...s, playbackRate: rate }));
  }, []);

  const openFullScreen = useCallback(() => setState(s => ({ ...s, isFullScreen: true })), []);
  const closeFullScreen = useCallback(() => setState(s => ({ ...s, isFullScreen: false })), []);

  const progress = state.duration > 0 ? state.currentTime / state.duration : 0;

  return (
    <PlayerContext.Provider value={{ ...state, play, togglePlay, setVolume, openFullScreen, closeFullScreen, seek, skipForward, skipBackward, setPlaybackRate, progress }}>
      {children}
    </PlayerContext.Provider>
  );
}
