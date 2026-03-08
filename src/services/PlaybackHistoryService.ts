import { Episode } from "@/types/podcast";

const PROGRESS_KEY = "ps_episode_progress";
const HISTORY_KEY = "ps_listen_history";
const MAX_HISTORY = 100;

export interface EpisodeProgress {
  episodeId: number;
  currentTime: number;
  duration: number;
  updatedAt: number;
  completed: boolean;
}

export interface HistoryEntry {
  episode: Episode;
  lastPlayedAt: number;
  progress: number; // 0-1
  completed: boolean;
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// ── Progress (position in episode) ──

export function getEpisodeProgress(episodeId: number): EpisodeProgress | null {
  const map = loadJSON<Record<string, EpisodeProgress>>(PROGRESS_KEY, {});
  return map[String(episodeId)] || null;
}

export function getAllProgress(): Record<string, EpisodeProgress> {
  return loadJSON<Record<string, EpisodeProgress>>(PROGRESS_KEY, {});
}

export function saveEpisodeProgress(episodeId: number, currentTime: number, duration: number) {
  const map = loadJSON<Record<string, EpisodeProgress>>(PROGRESS_KEY, {});
  const completed = duration > 0 && currentTime / duration > 0.95;
  map[String(episodeId)] = {
    episodeId,
    currentTime,
    duration,
    updatedAt: Date.now(),
    completed,
  };
  saveJSON(PROGRESS_KEY, map);
}

export function markEpisodeCompleted(episodeId: number) {
  const map = loadJSON<Record<string, EpisodeProgress>>(PROGRESS_KEY, {});
  const existing = map[String(episodeId)];
  if (existing) {
    existing.completed = true;
    existing.updatedAt = Date.now();
  } else {
    map[String(episodeId)] = {
      episodeId,
      currentTime: 0,
      duration: 0,
      updatedAt: Date.now(),
      completed: true,
    };
  }
  saveJSON(PROGRESS_KEY, map);
}

// ── History (recently played episodes) ──

export function getListenHistory(): HistoryEntry[] {
  return loadJSON<HistoryEntry[]>(HISTORY_KEY, []);
}

export function addToHistory(episode: Episode, currentTime: number, duration: number) {
  let history = loadJSON<HistoryEntry[]>(HISTORY_KEY, []);
  const progress = duration > 0 ? currentTime / duration : 0;
  const completed = progress > 0.95;

  // Remove existing entry for this episode
  history = history.filter(h => h.episode.id !== episode.id);

  // Add to front
  history.unshift({
    episode,
    lastPlayedAt: Date.now(),
    progress,
    completed,
  });

  // Trim
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);

  saveJSON(HISTORY_KEY, history);
}

export function clearHistory() {
  saveJSON(HISTORY_KEY, []);
}
