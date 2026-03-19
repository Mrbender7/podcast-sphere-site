/**
 * Background Audio Keep-Alive utilities for Android WebView
 * Prevents process termination when app is backgrounded.
 * 
 * Three mechanisms:
 * 1. Silent Audio Loop — tricks WebView into thinking audio is active
 * 2. WakeLock API — prevents screen sleep during playback
 * 3. Visibility Change Recovery — resumes audio when app returns to foreground
 */

// 1-second silent WAV base64 (44100Hz, 16-bit, mono)
const SILENCE_DATA_URI =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

const silentAudio = new Audio();
silentAudio.loop = true;
silentAudio.volume = 0.01;
silentAudio.src = SILENCE_DATA_URI;

let silentLoopActive = false;

export function startSilentLoop(): void {
  if (silentLoopActive) return;
  silentAudio.play().catch(() => {});
  silentLoopActive = true;
}

export function stopSilentLoop(): void {
  if (!silentLoopActive) return;
  silentAudio.pause();
  silentLoopActive = false;
}

// WakeLock
let wakeLockRef: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<void> {
  try {
    if ("wakeLock" in navigator) {
      wakeLockRef = await navigator.wakeLock.request("screen");
    }
  } catch {
    // WakeLock not available or denied
  }
}

export async function releaseWakeLock(): Promise<void> {
  try {
    if (wakeLockRef) {
      await wakeLockRef.release();
      wakeLockRef = null;
    }
  } catch {
    wakeLockRef = null;
  }
}

/**
 * Setup visibility change handler.
 * When app returns to foreground, resumes audio + silent loop after 500ms delay.
 * Returns cleanup function.
 */
export function setupVisibilityRecovery(
  audio: HTMLAudioElement,
  isPlayingRef: React.MutableRefObject<boolean>
): () => void {
  const handler = () => {
    if (document.visibilityState === "visible" && isPlayingRef.current) {
      setTimeout(() => {
        if (isPlayingRef.current) {
          audio.play().catch(() => {});
          startSilentLoop();
        }
      }, 500);
    }
  };

  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}
