// PodcastAutoPlugin — Capacitor plugin bridge for native Android services
// Syncs favorites, playback state, history to SharedPreferences for Android Auto

import { registerPlugin } from '@capacitor/core';

export interface PodcastAutoPluginInterface {
  syncFavorites(options: { favorites: string }): Promise<void>;
  syncListenHistory(options: { history: string }): Promise<void>;
  syncEpisodeList(options: { feedId: string; episodes: string }): Promise<void>;
  syncLanguage(options: { language: string }): Promise<void>;
  updateNowPlaying(options: { title: string; author: string; artworkUrl: string; duration: number }): Promise<void>;
  updatePlaybackState(options: { isPlaying: boolean; position: number }): Promise<void>;
  stopPlayback(): Promise<void>;
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
    console.log('[PodcastAuto] syncFavorites failed:', e);
  }
}

export async function syncListenHistoryToNative(history: any[]): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try {
    await getPlugin().syncListenHistory({ history: JSON.stringify(history) });
  } catch (e) {
    console.log('[PodcastAuto] syncListenHistory failed:', e);
  }
}

export async function syncEpisodeListToNative(feedId: number, episodes: any[]): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try {
    // Only sync essential fields to keep SharedPrefs small
    const minimal = episodes.slice(0, 50).map(ep => ({
      id: ep.id,
      title: ep.title,
      enclosureUrl: ep.enclosureUrl,
      feedId: ep.feedId,
      feedTitle: ep.feedTitle,
      feedAuthor: ep.feedAuthor,
      feedImage: ep.feedImage,
      image: ep.image,
      duration: ep.duration,
      datePublished: ep.datePublished,
    }));
    await getPlugin().syncEpisodeList({ feedId: String(feedId), episodes: JSON.stringify(minimal) });
  } catch (e) {
    console.log('[PodcastAuto] syncEpisodeList failed:', e);
  }
}

export async function syncLanguageToNative(language: string): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try {
    await getPlugin().syncLanguage({ language });
  } catch (e) {
    console.log('[PodcastAuto] syncLanguage failed:', e);
  }
}

export async function clearNativeAppData(): Promise<void> {
  if (!isCapacitorAndroid()) return;
  try { await getPlugin().clearAppData(); } catch {}
}
