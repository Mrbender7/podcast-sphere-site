// Web-only stubs — no background audio needed on website
export const startSilentLoop = () => {};
export const stopSilentLoop = () => {};
export const requestWakeLock = () => {};
export const releaseWakeLock = () => {};
export const setupVisibilityRecovery = (_audio: HTMLAudioElement, _isPlayingRef: { current: boolean }) => {
  return () => {};
};
