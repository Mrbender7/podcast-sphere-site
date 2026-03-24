// Web-only stubs — no native download service on website

export type DownloadDest = "internal" | "external";

export interface DownloadMeta {
  episodeId: number;
  title: string;
  feedTitle: string;
  image: string;
  duration: number;
  downloadedAt: number;
}

export const downloadEpisode = async (_episode: any, _onProgress?: (ratio: number) => void) => {};
export const deleteDownload = async (_episodeId: number) => {};
export const isDownloaded = (_episodeId: number) => false;
export const getDownloadedEpisodes = (): DownloadMeta[] => [];
export const getLocalFileUri = async (_episodeId: number): Promise<string | null> => null;
export const getDownloadDest = (): DownloadDest => "internal";
export const setDownloadDest = (_dest: DownloadDest) => {};
