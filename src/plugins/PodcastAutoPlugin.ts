// Web-only stubs — no native plugins on website

export const PodcastAutoPlugin = {
  instance: new Proxy({}, {
    get: () => async () => {},
  }),
};

export const syncFavoritesToNative = (_data: any) => {};
export const syncListenHistoryToNative = (_data: any) => {};
export const syncEpisodeListToNative = (_feedId: number, _episodes: any[]) => {};
export const syncLanguageToNative = (_lang: string) => {};
