// PodcastAutoPlugin — Capacitor plugin bridge for native Android services
// Syncs favorites, recents, playback state to SharedPreferences for Android Auto

import { registerPlugin } from '@capacitor/core';
import { Episode } from '@/types/podcast';

export interface PodcastAutoPluginInterface {
  syncFavorites(options: { podcasts: string }): Promise<void>;
  syncRecents(options: { podcasts: string }): Promise<void>;
  notifyPlaybackState(options: Record<string, any>): Promise<void>;
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
    await getPlugin().syncFavorites({ podcasts: JSON.stringify(items) });
  } catch (e) {
    console.log('[PodcastAuto] syncFavorites failed (expected in browser):', e);
  }
}

export async function syncRecentsToNative(items: any[]): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try {
    await getPlugin().syncRecents({ podcasts: JSON.stringify(items) });
  } catch (e) {
    console.log('[PodcastAuto] syncRecents failed (expected in browser):', e);
  }
}

export async function notifyNativePlaybackState(episode: Episode | null, isPlaying: boolean): Promise<void> {
  if (!isCapacitorAndroid() || !episode) return;
  try {
    await getPlugin().notifyPlaybackState({
      episodeId: episode.id,
      title: episode.title || '',
      artist: episode.feedAuthor || episode.feedTitle || '',
      imageUrl: episode.image || episode.feedImage || '',
      isPlaying,
      currentTime: 0,
      duration: episode.duration || 0,
    });
  } catch (e) {
    console.log('[PodcastAuto] notifyPlaybackState failed (expected in browser):', e);
  }
}

export async function updateNativeNowPlaying(episode: Episode): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try {
    const durationMs = (episode.duration || 0) * 1000;
    await getPlugin().updateNowPlaying({
      title: episode.title || '',
      author: episode.feedAuthor || episode.feedTitle || '',
      artworkUrl: episode.image || episode.feedImage || '',
      duration: durationMs,
    });
  } catch (e) {
    console.log('[PodcastAuto] updateNowPlaying failed (expected in browser):', e);
  }
}

export async function updateNativePlaybackState(isPlaying: boolean, positionMs: number): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try {
    await getPlugin().updatePlaybackState2({ isPlaying, position: positionMs });
  } catch (e) {
    console.log('[PodcastAuto] updatePlaybackState2 failed (expected in browser):', e);
  }
}

export async function clearNativeAppData(): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try { await getPlugin().clearAppData(); } catch {}
}
