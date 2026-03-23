

## Fix: Cast Button Not Appearing on Android APK

### Problem
The Cast button on HomePage (line 179) is wrapped in `{isCastAvailable && (...)}`. On Android, the native CastPlugin initialization can fail silently (plugin not registered, GMS not ready, etc.), keeping `isCastAvailable = false` and hiding the button entirely.

### Solution
**`src/pages/HomePage.tsx`**: Always render the Cast button regardless of `isCastAvailable`. When unavailable, show it greyed out and disabled. When available but not casting, show it interactive. When casting, highlight it.

```tsx
// Replace: {isCastAvailable && (
// With: always render, disable when unavailable
<button
  onClick={isCasting ? stopCast : startCast}
  disabled={!isCastAvailable}
  className={cn(
    "flex h-11 w-11 items-center justify-center rounded-full bg-accent transition-colors",
    isCasting ? "text-primary" : 
    isCastAvailable ? "text-muted-foreground hover:text-foreground" : 
    "text-muted-foreground/30 cursor-not-allowed"
  )}
  aria-label="Cast"
>
  <Cast className="h-5 w-5" />
</button>
```

**`src/hooks/useCast.ts`**: In `initNativeCast`, add a fallback — if the native plugin throws, still set `isCastAvailable = false` but don't block the UI. Also ensure the `castInitState` timeout in `initWebCast` doesn't reference stale state.

### Files to modify
- `src/pages/HomePage.tsx` — remove conditional, always show button
- `src/hooks/useCast.ts` — minor: ensure init failure is clean

