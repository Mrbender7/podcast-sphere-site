import { Episode } from "@/types/podcast";
import { isNativePlatform } from "@/utils/permissions";

const DOWNLOADS_KEY = "ps_downloads";
const DEST_KEY = "ps_download_dest";

export type DownloadDest = "internal" | "sd";

export interface DownloadMeta {
  episode: Episode;
  downloadedAt: number;
  fileSize?: number;
}

// ─── Helpers ──────────────────────────────────────────────

function getDownloadsMap(): Record<string, DownloadMeta> {
  try {
    return JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDownloadsMap(map: Record<string, DownloadMeta>) {
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(map));
}

export function getDownloadDest(): DownloadDest {
  return (localStorage.getItem(DEST_KEY) as DownloadDest) || "internal";
}

export function setDownloadDest(dest: DownloadDest) {
  localStorage.setItem(DEST_KEY, dest);
}

function episodePath(id: number): string {
  return `PodcastSphere/downloads/${id}.mp3`;
}

async function getDirectory() {
  const { Directory } = await import("@capacitor/filesystem");
  return getDownloadDest() === "sd" ? Directory.External : Directory.Data;
}

// ─── Public API ───────────────────────────────────────────

export function isDownloaded(id: number): boolean {
  return !!getDownloadsMap()[String(id)];
}

export function getDownloadedEpisodes(): DownloadMeta[] {
  return Object.values(getDownloadsMap()).sort((a, b) => b.downloadedAt - a.downloadedAt);
}

export async function downloadEpisode(
  episode: Episode,
  onProgress?: (ratio: number) => void,
): Promise<boolean> {
  if (!episode.enclosureUrl) return false;

  // Web fallback — trigger browser download
  if (!isNativePlatform()) {
    return downloadWeb(episode);
  }

  try {
    const { Filesystem } = await import("@capacitor/filesystem");
    const directory = await getDirectory();
    const path = episodePath(episode.id);

    // Ensure directory exists
    try {
      await Filesystem.mkdir({
        path: "PodcastSphere/downloads",
        directory,
        recursive: true,
      });
    } catch {
      // already exists
    }

    // Download using fetch + write (gives progress)
    const response = await fetch(episode.enclosureUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentLength = Number(response.headers.get("content-length") || 0);
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No readable stream");

    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (contentLength > 0 && onProgress) {
        onProgress(received / contentLength);
      }
    }

    // Merge chunks into single array
    const merged = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64
    const base64 = uint8ToBase64(merged);

    await Filesystem.writeFile({
      path,
      data: base64,
      directory,
    });

    // Save metadata
    const map = getDownloadsMap();
    map[String(episode.id)] = {
      episode,
      downloadedAt: Date.now(),
      fileSize: received,
    };
    saveDownloadsMap(map);

    return true;
  } catch (err) {
    console.error("[DownloadService] Download failed:", err);
    return false;
  }
}

export async function deleteDownload(id: number): Promise<void> {
  const map = getDownloadsMap();
  delete map[String(id)];
  saveDownloadsMap(map);

  if (!isNativePlatform()) return;

  try {
    const { Filesystem } = await import("@capacitor/filesystem");
    const directory = await getDirectory();
    await Filesystem.deleteFile({ path: episodePath(id), directory });
  } catch {
    // file may not exist
  }
}

export async function getLocalFileUri(id: number): Promise<string | null> {
  if (!isNativePlatform() || !isDownloaded(id)) return null;

  try {
    const { Filesystem } = await import("@capacitor/filesystem");
    const { Capacitor } = await import("@capacitor/core");
    const directory = await getDirectory();
    const result = await Filesystem.getUri({ path: episodePath(id), directory });
    return Capacitor.convertFileSrc(result.uri);
  } catch {
    return null;
  }
}

// ─── Web fallback ─────────────────────────────────────────

async function downloadWeb(episode: Episode): Promise<boolean> {
  try {
    const response = await fetch(episode.enclosureUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${episode.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Uint8Array → base64 ─────────────────────────────────

function uint8ToBase64(arr: Uint8Array): string {
  let binary = "";
  const len = arr.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}
