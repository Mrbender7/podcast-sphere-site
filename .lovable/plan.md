

## Plan : Podcast Sphere v1.0 — Architecture

### Architecture

**App podcast pure** — pas de code radio natif, pas d'ExoPlayer, pas de Cast.
- Lecture audio via HTML5 Audio dans le WebView Capacitor
- API Podcast Index pour la découverte de contenu
- Notification foreground service via @capawesome-team/capacitor-android-foreground-service

### Background Keep-Alive (v1.0)
- Silent audio loop (WAV base64, volume 0.01)
- WakeLock API (navigator.wakeLock.request('screen'))
- Visibility change recovery (500ms delay resume)
- Utility: src/utils/backgroundAudio.ts

### Chromecast (v1.0)
- Dual-path: Web SDK (cast_sender.js) + Native (CastPlugin.java)
- Cast App ID: CC1AD845 (Default Media Receiver, dev)
- STREAM_TYPE_BUFFERED (podcast = contenu fini)
- Fichiers natifs: CastPlugin.java, CastOptionsProvider.java
- Hook: src/hooks/useCast.ts (dual-path web/native)

### Android Auto (v1.0)
- PodcastBrowserService.java (MediaBrowserServiceCompat + ExoPlayer)
- Browse tree: ROOT → Abonnés / En cours / Catégories
- PodcastAutoPlugin.java (sync SharedPreferences, singleton bridge)
- MediaToggleReceiver.java (notification play/pause)
- automotive_app_desc.xml

### Build
- Script de déploiement : `podcastsphere_v1_0_0.ps1`
- Dossier cible : `E:\Projets\Podcastsphere`
- Package : `com.fhm.podcastsphere`
- Gradle deps: ExoPlayer 2.19.1, Cast 21.4.0, MediaRouter 1.7.0, Media 1.7.0
- Permissions: NEARBY_WIFI_DEVICES (neverForLocation), ACCESS_FINE_LOCATION
