// useCast — Dual-path Chromecast hook (Web SDK + Native CastPlugin)
// Web: uses cast_sender.js loaded in index.html
// Native: uses CastPlugin.java via Capacitor bridge

import { useState, useCallback, useEffect, useRef } from "react";
import { registerPlugin } from "@capacitor/core";
import { Episode } from "@/types/podcast";

export type CastUiMode = "none" | "button" | "full";
export type CastInitState = "idle" | "initializing" | "ready" | "unavailable";

// Singleton lazy plugin instance (avoids double registerPlugin crash)
interface CastPluginInterface {
  initialize(): Promise<{ status: string }>;
  showCastPicker(): Promise<void>;
  loadMedia(options: {
    url: string;
    title: string;
    artist: string;
    imageUrl: string;
    duration: number;
  }): Promise<{ status: string }>;
  togglePlayPause(): Promise<void>;
  stopCasting(): Promise<void>;
  getStatus(): Promise<{ initialized: boolean; connected: boolean; deviceName?: string }>;
  addListener(event: string, cb: (data: any) => void): Promise<any>;
}

let CastPluginInstance: CastPluginInterface | null = null;
function getCastPlugin(): CastPluginInterface {
  if (!CastPluginInstance) {
    CastPluginInstance = registerPlugin<CastPluginInterface>("CastPlugin");
  }
  return CastPluginInstance;
}

function isCapacitorNative(): boolean {
  try {
    return !!(window as any).Capacitor?.isNativePlatform?.() &&
      (window as any).Capacitor?.getPlatform?.() === "android";
  } catch {
    return false;
  }
}

export function useCast() {
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castDeviceName, setCastDeviceName] = useState<string | null>(null);
  const [castUiMode, setCastUiMode] = useState<CastUiMode>("none");
  const [castInitState, setCastInitState] = useState<CastInitState>("idle");
  const isNative = useRef(isCapacitorNative());

  // Initialize Cast
  useEffect(() => {
    if (isNative.current) {
      // Native path: initialize via CastPlugin
      initNativeCast();
    } else {
      // Web path: wait for Cast SDK
      initWebCast();
    }
  }, []);

  const initNativeCast = async () => {
    setCastInitState("initializing");
    try {
      const plugin = getCastPlugin();
      await plugin.initialize();
      setCastInitState("ready");
      setIsCastAvailable(true);
      setCastUiMode("button");

      // Listen for session events
      plugin.addListener("castSessionStarted", (data: any) => {
        setIsCasting(true);
        setCastDeviceName(data.deviceName || "Chromecast");
        setCastUiMode("full");
      });

      plugin.addListener("castSessionEnded", () => {
        setIsCasting(false);
        setCastDeviceName(null);
        setCastUiMode("button");
      });

      plugin.addListener("castDeviceAvailable", () => {
        setIsCastAvailable(true);
        setCastUiMode("button");
      });
    } catch (e) {
      console.log("[Cast] Native init failed:", e);
      setCastInitState("unavailable");
    }
  };

  const initWebCast = () => {
    setCastInitState("initializing");

    const tryInit = () => {
      if ((window as any).__castSdkReady && (window as any).cast?.framework) {
        try {
          const castContext = (window as any).cast.framework.CastContext.getInstance();
          castContext.setOptions({
            receiverApplicationId: "CC1AD845", // Default Media Receiver
            autoJoinPolicy: (window as any).chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
          });

          setCastInitState("ready");
          setIsCastAvailable(true);
          setCastUiMode("button");

          castContext.addEventListener(
            (window as any).cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            (event: any) => {
              const SESSION_STARTED = (window as any).cast.framework.SessionState.SESSION_STARTED;
              const SESSION_RESUMED = (window as any).cast.framework.SessionState.SESSION_RESUMED;
              const SESSION_ENDED = (window as any).cast.framework.SessionState.SESSION_ENDED;

              if (event.sessionState === SESSION_STARTED || event.sessionState === SESSION_RESUMED) {
                const session = castContext.getCurrentSession();
                setIsCasting(true);
                setCastDeviceName(session?.getCastDevice()?.friendlyName || "Chromecast");
                setCastUiMode("full");
              } else if (event.sessionState === SESSION_ENDED) {
                setIsCasting(false);
                setCastDeviceName(null);
                setCastUiMode("button");
              }
            }
          );
        } catch (e) {
          console.log("[Cast] Web SDK init failed:", e);
          setCastInitState("unavailable");
        }
      }
    };

    if ((window as any).__castSdkReady) {
      tryInit();
    } else {
      window.addEventListener("castSdkReady", tryInit, { once: true });
      // Safety timeout
      setTimeout(() => {
        if (castInitState === "initializing") {
          tryInit(); // One last attempt
          if (!isCastAvailable) setCastInitState("unavailable");
        }
      }, 10000);
    }
  };

  const startCast = useCallback(() => {
    if (isNative.current) {
      getCastPlugin().showCastPicker().catch(() => {});
    } else {
      try {
        const castContext = (window as any).cast?.framework?.CastContext?.getInstance();
        castContext?.requestSession().catch(() => {});
      } catch {}
    }
  }, []);

  const stopCast = useCallback(() => {
    if (isNative.current) {
      getCastPlugin().stopCasting().catch(() => {});
    } else {
      try {
        const castContext = (window as any).cast?.framework?.CastContext?.getInstance();
        castContext?.getCurrentSession()?.endSession(true);
      } catch {}
    }
    setIsCasting(false);
    setCastDeviceName(null);
    setCastUiMode("button");
  }, []);

  const loadMedia = useCallback((episode: Episode) => {
    if (!episode.enclosureUrl) return;

    if (isNative.current) {
      getCastPlugin().loadMedia({
        url: episode.enclosureUrl,
        title: episode.title || "",
        artist: episode.feedAuthor || episode.feedTitle || "",
        imageUrl: (episode.image || episode.feedImage || "").replace("http://", "https://"),
        duration: episode.duration || 0,
      }).catch((e) => console.error("[Cast] loadMedia failed:", e));
    } else {
      try {
        const castSession = (window as any).cast?.framework?.CastContext?.getInstance()?.getCurrentSession();
        if (!castSession) return;

        const mediaInfo = new (window as any).chrome.cast.media.MediaInfo(episode.enclosureUrl, "audio/mpeg");
        mediaInfo.streamType = (window as any).chrome.cast.media.StreamType.BUFFERED;
        mediaInfo.metadata = new (window as any).chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.title = episode.title || "";
        mediaInfo.metadata.subtitle = episode.feedAuthor || episode.feedTitle || "";
        const imageUrl = (episode.image || episode.feedImage || "").replace("http://", "https://");
        if (imageUrl) {
          mediaInfo.metadata.images = [new (window as any).chrome.cast.Image(imageUrl)];
        }

        const request = new (window as any).chrome.cast.media.LoadRequest(mediaInfo);
        request.autoplay = true;
        castSession.loadMedia(request).then(() => {
          console.log("[Cast] Media loaded on web");
        }).catch((e: any) => console.error("[Cast] Web loadMedia failed:", e));
      } catch (e) {
        console.error("[Cast] Web loadMedia error:", e);
      }
    }
  }, []);

  const toggleCastPlayPause = useCallback(() => {
    if (isNative.current) {
      getCastPlugin().togglePlayPause().catch(() => {});
    } else {
      try {
        const session = (window as any).cast?.framework?.CastContext?.getInstance()?.getCurrentSession();
        const controller = session?.getRemoteMediaClient();
        if (controller) {
          if (controller.playerState === (window as any).chrome.cast.media.PlayerState.PLAYING) {
            controller.pause();
          } else {
            controller.play();
          }
        }
      } catch {}
    }
  }, []);

  return {
    isCastAvailable,
    isCasting,
    castDeviceName,
    castUiMode,
    castInitState,
    startCast,
    stopCast,
    loadMedia,
    toggleCastPlayPause,
  };
}
