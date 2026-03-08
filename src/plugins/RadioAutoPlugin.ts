// RadioAutoPlugin — Capacitor plugin for Android Auto (stub for podcast mode)
// This plugin is not used in podcast mode but kept as a stub to avoid import errors.

import { registerPlugin } from '@capacitor/core';

export interface RadioAutoPluginInterface {
  syncFavorites(options: { stations: string }): Promise<void>;
  syncRecents(options: { stations: string }): Promise<void>;
  notifyPlaybackState(options: Record<string, any>): Promise<void>;
  clearAppData(): Promise<void>;
}

export const RadioAutoPlugin = registerPlugin<RadioAutoPluginInterface>('RadioAutoPlugin');

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
  try { await RadioAutoPlugin.clearAppData(); } catch {}
}
export async function notifyNativePlaybackState(_item: any, _isPlaying: boolean): Promise<void> {}
