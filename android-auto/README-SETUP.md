# Podcast Sphere — Android Setup Guide

## Prérequis

- Android Studio (latest stable)
- Capacitor ajouté au projet : `npx cap add android`

## Build

Le script `podcastsphere_v1_0_0.ps1` automatise entièrement le build :
1. Clone le repo GitHub
2. Installe les dépendances et build le frontend
3. Configure Capacitor pour Android
4. Injecte les permissions et le manifest
5. Génère le `MainActivity.java` avec les WebView settings

## Permissions requises

- `INTERNET` — accès réseau pour le streaming
- `WAKE_LOCK` — maintien de la lecture en arrière-plan
- `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK` — service de lecture
- `POST_NOTIFICATIONS` — notifications de lecture (Android 13+)
- `BLUETOOTH_CONNECT` — casques Bluetooth

## Architecture

```
WebView (Capacitor)
  └── React App
      ├── PodcastService (API Podcast Index)
      ├── PlayerContext (HTML5 Audio)
      ├── FavoritesContext (localStorage)
      └── Foreground Service (@capawesome)
```

## Notes

- La lecture audio utilise le HTML5 Audio du WebView
- Pas d'ExoPlayer ni de service natif MediaBrowserService
- Pas d'Android Auto ni de Chromecast dans cette version
