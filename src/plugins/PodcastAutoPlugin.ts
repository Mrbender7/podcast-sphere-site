// PodcastAutoPlugin — Capacitor plugin stub for podcast mode
// Kept as a stub to avoid import errors. No native radio functionality.

import { registerPlugin } from '@capacitor/core';

export interface PodcastAutoPluginInterface {
  syncFavorites(options: { podcasts: string }): Promise<void>;
  syncRecents(options: { podcasts: string }): Promise<void>;
  notifyPlaybackState(options: Record<string, any>): Promise<void>;
  clearAppData(): Promise<void>;
}

export const PodcastAutoPlugin = registerPlugin<PodcastAutoPluginInterface>('PodcastAutoPlugin');

function isCapacitorAndroid(): boolean {
  try {
    const { Capacitor } = require('@capacitor/core');
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
}

export async function syncFavoritesToNative(_items: any[]): Promise<void> {}
export async function syncRecentsToNative(_items: any[]): Promise<void> {}
export async function clearNativeAppData(): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try { await PodcastAutoPlugin.clearAppData(); } catch {}
}
export async function notifyNativePlaybackState(_item: any, _isPlaying: boolean): Promise<void> {}
