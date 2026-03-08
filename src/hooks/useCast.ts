// Cast hook — stubbed for podcast mode
// Chromecast support can be re-added later for podcast streaming

import { useState, useCallback } from "react";

export type CastUiMode = "none" | "button" | "full";
export type CastInitState = "idle" | "initializing" | "ready" | "unavailable";

export function useCast() {
  return {
    isCastAvailable: false,
    isCasting: false,
    castDeviceName: null as string | null,
    castUiMode: "none" as CastUiMode,
    castInitState: "unavailable" as CastInitState,
    startCast: () => {},
    stopCast: () => {},
    loadMedia: (_episode: any) => {},
    toggleCastPlayPause: () => {},
  };
}
