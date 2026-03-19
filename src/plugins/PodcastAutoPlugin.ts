// PodcastAutoPlugin — Capacitor plugin bridge for native Android services
// Syncs favorites, playback state to SharedPreferences for Android Auto

import { registerPlugin } from '@capacitor/core';

export interface PodcastAutoPluginInterface {
  syncFavorites(options: { favorites: string }): Promise<void>;
  updateNowPlaying(options: { title: string; author: string; artworkUrl: string; duration: number }): Promise<void>;
  updatePlaybackState(options: { isPlaying: boolean; position: number }): Promise<void>;
  clearAppData(): Promise<void>;
  addListener(event: string, cb: (data: any) => void): Promise<any>;
}

// Singleton to avoid double registerPlugin
let pluginInstance: PodcastAutoPluginInterface | null = null;
function getPlugin(): PodcastAutoPluginInterface {
  if (!pluginInstance) {
    pluginInstance = registerPlugin<PodcastAutoPluginInterface>('PodcastAutoPlugin');
  }
  return pluginInstance;
}

export const PodcastAutoPlugin = {
  get instance() { return getPlugin(); },
  addListener: (event: string, cb: (data: any) => void) => getPlugin().addListener(event, cb),
};

function isCapacitorAndroid(): boolean {
  try {
    return !!(window as any).Capacitor?.isNativePlatform?.() &&
      (window as any).Capacitor?.getPlatform?.() === 'android';
  } catch {
    return false;
  }
}

export async function syncFavoritesToNative(items: any[]): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try {
    await getPlugin().syncFavorites({ favorites: JSON.stringify(items) });
  } catch (e) {
    console.log('[PodcastAuto] syncFavorites failed (expected in browser):', e);
  }
}

export async function clearNativeAppData(): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try { await getPlugin().clearAppData(); } catch {}
}
