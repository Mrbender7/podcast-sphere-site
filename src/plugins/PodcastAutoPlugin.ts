// Web-only stubs — no native plugins on website

const noop = async () => {};
const noopListener = async (_event: string, _handler: any) => ({ remove: noop });

export const PodcastAutoPlugin = {
  instance: new Proxy({}, { get: () => noop }),
  addListener: noopListener,
};

export const syncFavoritesToNative = (_data: any) => {};
export const syncListenHistoryToNative = (_data: any) => {};
export const syncEpisodeListToNative = (_feedId: number, _episodes: any[]) => {};
export const syncLanguageToNative = (_lang: string) => {};
