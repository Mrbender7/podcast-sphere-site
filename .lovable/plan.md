

## Plan : Podcast Sphere v1.0 — Architecture

### Architecture

**App podcast pure** — pas de code radio natif, pas d'ExoPlayer, pas de Cast.
- Lecture audio via HTML5 Audio dans le WebView Capacitor
- API Podcast Index pour la découverte de contenu
- Notification foreground service via @capawesome-team/capacitor-android-foreground-service

### Build

- Script de déploiement : `podcastsphere_v1_0_0.ps1`
- Dossier cible : `E:\Projets\Podcastsphere`
- Package : `com.fhm.podcastsphere`
