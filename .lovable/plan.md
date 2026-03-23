

## Audit: First-Launch Freeze & Playback Failure on Android APK

### Root Causes Identified

After analyzing the full startup chain (`main.tsx` → `App` → `Index` → `HomePage` + `PlayerContext`), here are the problems causing freezing and playback failure on cold start:

**1. Network saturation on first launch**
On a fresh install (empty cache), everything fires simultaneously:
- `evictOldEntries()` opens IndexedDB synchronously at startup (main.tsx line 7)
- Trending podcasts query fires (react-query)
- `NewEpisodesService.syncNewEpisodes` calls the API sequentially for EVERY subscribed feed
- Every visible `CachedImage` triggers a `fetch()` + IndexedDB write (cache miss → download)
- When user taps play, the audio fetch competes with all of these for bandwidth → 8s timeout hit → "can't play" error

**2. `crossOrigin = "anonymous"` on the Audio element**
`PlayerContext.tsx` line 27: `audio.crossOrigin = "anonymous"` — on Android WebView, many podcast CDNs don't send proper CORS headers. This silently blocks audio loading, causing the `playWithTimeout` to fail with no clear error. This is the #1 suspect for "impossible de lancer une lecture".

**3. Image cache storms the main thread**
`CachedImage` component: each image does `getCachedImage()` (IDB read) → miss → `setDisplaySrc(src)` → `cacheImage()` (fetch + IDB write). With 20+ images visible on HomePage, that's 20+ concurrent fetches + 20+ IDB transactions competing with audio.

**4. playWithTimeout too aggressive**
8 seconds is too short when the network is saturated by image caching. Combined with CORS issues, this guarantees failure on first launch.

---

### Fix Plan

#### Fix 1 — Remove `crossOrigin` from Audio element
**File**: `src/contexts/PlayerContext.tsx`
Remove `audio.crossOrigin = "anonymous"` from `createManagedAudio()`. It's not needed (we don't use Web Audio API analysis on the stream) and it actively blocks playback on Android WebView.

#### Fix 2 — Defer and throttle image caching
**File**: `src/services/ImageCacheService.ts`
- Add a concurrent download limit (max 2 simultaneous fetches) to `processQueue()`
- Add a startup delay: don't process the queue for the first 3 seconds after page load
- Reduce `cacheImage` fetch timeout from 6s to 4s to free bandwidth faster on failures

**File**: `src/main.tsx`
- Wrap `evictOldEntries()` in `setTimeout(() => ..., 5000)` so it doesn't compete with initial render

#### Fix 3 — CachedImage: don't background-cache on first display
**File**: `src/components/CachedImage.tsx`
- On cache miss, just use the original `src` directly (already done) but **don't** call `cacheImage()` inline. Instead, push the URL to `preCacheImages()` at priority 1. This prevents 20 parallel fetch+IDB storms during initial render.

#### Fix 4 — Increase playWithTimeout + add retry
**File**: `src/contexts/PlayerContext.tsx`
- Increase timeout from 8s to 15s
- Add 1 automatic retry on timeout before showing the error toast (replace audio element, set src again, retry once)

#### Fix 5 — Stagger NewEpisodesService sync
**File**: `src/services/NewEpisodesService.ts`
- Add a 3-second delay before starting sync on mount (let the UI render first)
- Process feeds in batches of 3 instead of all sequentially to avoid blocking

---

### Summary of Changes

| File | Change |
|------|--------|
| `PlayerContext.tsx` | Remove `crossOrigin`, increase timeout to 15s, add 1 retry |
| `ImageCacheService.ts` | Concurrency limit (2), startup delay (3s), shorter fetch timeout |
| `CachedImage.tsx` | Don't inline-cache on miss, defer to preCacheImages |
| `main.tsx` | Defer evictOldEntries to 5s after load |
| `NewEpisodesService.ts` | Delay sync start by 3s |

### Technical Note
The `crossOrigin = "anonymous"` removal is the single most impactful fix. Without it, audio requests on Android WebView fail silently on CDNs that don't return `Access-Control-Allow-Origin` headers, which is the majority of podcast hosting providers.

