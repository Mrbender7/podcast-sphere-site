

## Plan : Unification Android Auto + Nettoyage MediaPlaybackService — TERMINÉ ✅

### Architecture finale

**Un seul service media : `RadioBrowserService`**, qui fonctionne en deux modes :
1. **Mode Android Auto** : Browse tree + ExoPlayer natif (inchangé)
2. **Mode Notification (Mirror)** : Reçoit les updates de `RadioAutoPlugin` via Intent `ACTION_UPDATE`, met à jour sa MediaSession unique et affiche une notification MediaStyle unifiée

### Changements effectués

| Fichier | Action |
|---------|--------|
| `android-auto/RadioBrowserService.java` | Ajout `onStartCommand()`, `ACTION_UPDATE/STOP`, `BROADCAST_TOGGLE`, artwork fallback avec `station_placeholder`, notification unifiée |
| `android-auto/RadioAutoPlugin.java` | Pointe vers `RadioBrowserService.class` au lieu de `MediaPlaybackService.class` |
| `android-auto/MediaPlaybackService.java` | **Supprimé** |
| `radiosphere_v2_5_0.ps1` | Manifest: `appCategory="audio"`, suppression MediaPlaybackService du Manifest et de la génération. MainActivity: canal unique `radio_auto_playback`. Templates inline mis à jour. |

### Ce qui n'a pas changé
- `CastPlugin.java`, `CastOptionsProvider.java` — déjà corrects
- `PlayerContext.tsx`, `useCast.ts` — logique Cast déjà en place
- `StationCard.tsx` — placeholder déjà géré
- `MediaToggleReceiver.java` — inchangé (appelle `RadioAutoPlugin`)
- Browse tree, ExoPlayer, audio focus, stream resolution
