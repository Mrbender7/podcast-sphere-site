# Podcast Sphere — About / Documentation technique

> Application de podcasts basée sur l'API Podcast Index.
> Package Android : `com.fhm.podcastsphere`
> Version actuelle : v1.0.0
> Date de création : Mars 2026

---

## 📋 Table des matières

1. [Description du projet](#description-du-projet)
2. [Technologies utilisées](#technologies-utilisées)
3. [Architecture du projet](#architecture-du-projet)
4. [Structure des fichiers clés](#structure-des-fichiers-clés)
5. [API & Services](#api--services)
6. [Fonctionnalités](#fonctionnalités)
7. [Android natif (Capacitor)](#android-natif-capacitor)
8. [Scripts de build](#scripts-de-build)
9. [Troubleshooting & Résolutions](#troubleshooting--résolutions)
10. [Dépendances principales](#dépendances-principales)

---

## Description du projet

**Podcast Sphere** est une application mobile Android de découverte et d'écoute de podcasts. Elle utilise l'API **Podcast Index** (API ouverte et gratuite) pour fournir l'accès à des milliers de podcasts dans toutes les langues. L'application est construite avec React/TypeScript et empaquetée en APK Android via Capacitor.

L'application est le pendant podcast de **Radio Sphere** (application de radio en streaming), partageant la même architecture technique et le même design system.

---

## Technologies utilisées

### Frontend

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | React | 18.3.x |
| Langage | TypeScript | 5.8.x |
| Bundler | Vite | 5.4.x |
| UI Framework | Tailwind CSS | 3.4.x |
| Composants UI | shadcn/ui + Radix UI | Dernières |
| Icônes | Lucide React + Iconify React | 0.462.x / 6.x |
| État global | React Context API | — |
| Cache API | TanStack React Query | 5.83.x |
| Routing | React Router DOM | 6.30.x |
| Formulaires | React Hook Form + Zod | 7.x / 3.x |
| Animations | CSS Keyframes + Tailwind Animate | — |
| Carousel | Embla Carousel React | 8.6.x |
| Notifications toast | Sonner | 1.7.x |
| Dates | date-fns | 3.6.x |

### Mobile / Android natif

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Runtime natif | Capacitor | 8.0.x |
| Foreground Service | @capawesome-team/capacitor-android-foreground-service | 8.0.x |
| Filesystem | @capacitor/filesystem | 8.1.x |
| App lifecycle | @capacitor/app | 8.0.x |
| Browser | @capacitor/browser | 8.0.x |
| Share | @capacitor/share | 8.0.x |
| Local Notifications | @capacitor/local-notifications | 8.0.x |
| Lecteur natif | ExoPlayer (Android) | 2.19.1 |
| Chromecast | Google Cast SDK | 21.4.0 |
| MediaRouter | AndroidX MediaRouter | 1.7.0 |
| Media | AndroidX Media | 1.7.0 |

### Outils de développement

| Outil | Usage |
|-------|-------|
| Vite | Dev server + bundling |
| Vitest | Tests unitaires |
| ESLint | Linting TypeScript/React |
| PostCSS + Autoprefixer | Processing CSS |
| lovable-tagger | Tagging composants (dev) |
| @tailwindcss/typography | Plugin typographie |

---

## Architecture du projet

### Principes

- **App podcast pure** — pas de streaming radio, lecture HTML5 Audio dans le WebView
- **API Podcast Index** pour toute la découverte de contenu
- **Contexts React** pour l'état global (Player, Favorites, Language, Premium, SleepTimer, Download)
- **React Query** pour le cache et la gestion des requêtes API
- **Capacitor** pour le bridge web → Android natif
- **localStorage** pour la persistance locale (favoris, historique, préférences)

### Background Keep-Alive (lecture en arrière-plan)

> **Référence** : [developer.android.com — Background playback](https://developer.android.com/media/media3/session/background-playback)

**Stack utilisée** : Legacy `MediaBrowserServiceCompat` + `MediaSessionCompat` (via `androidx.media:media:1.7.0`). La doc Android recommande Media3 (`MediaSessionService`), mais la stack legacy reste pleinement supportée et fonctionnelle.

**Mécanismes côté WebView** (fichier `src/utils/backgroundAudio.ts`) :
- Silent audio loop (WAV base64, volume 0.01) — maintient le WebView actif
- WakeLock API (`navigator.wakeLock.request('screen')`) — empêche la mise en veille
- Visibility change recovery (500ms delay resume) — restaure la lecture au retour au premier plan

**Mécanismes côté Android natif** :
- Foreground Service (@capawesome-team) avec `foregroundServiceType="mediaPlayback"`
- `PodcastBrowserService.java` déclaré comme `foregroundServiceType="mediaPlayback"` + `exported="true"`
- `android:appCategory="audio"` sur la balise `<application>`
- Canaux de notification (`podcast_playback`, `podcast_downloads`) créés dans `MainActivity`
- `MediaButtonReceiver` (`androidx.media.session.MediaButtonReceiver`) — reçoit les événements boutons média matériels (casques Bluetooth, volant auto) et réveille le service pour reprendre la lecture

**Éléments manifest requis (tous présents via PS1)** :
| Élément | Statut |
|---------|--------|
| `FOREGROUND_SERVICE` permission | ✅ |
| `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission | ✅ |
| `PodcastBrowserService` avec `foregroundServiceType="mediaPlayback"` | ✅ |
| `android:appCategory="audio"` | ✅ |
| `android:usesCleartextTraffic="true"` | ✅ |
| `network_security_config.xml` | ✅ |
| `MediaButtonReceiver` (hardware media buttons) | ✅ |
| Canaux de notification (MainActivity) | ✅ |

### Chromecast

- Dual-path : Web SDK (`cast_sender.js`) + Native (`CastPlugin.java`)
- Cast App ID : CC1AD845 (Default Media Receiver)
- STREAM_TYPE_BUFFERED (podcast = contenu fini, pas live)
- Hook : `src/hooks/useCast.ts`

### Android Auto

- `PodcastBrowserService.java` (MediaBrowserServiceCompat + ExoPlayer)
- Browse tree : ROOT → Abonnés / En cours / Catégories
- `PodcastAutoPlugin.java` (sync SharedPreferences, singleton bridge)
- `MediaToggleReceiver.java` (notification play/pause)
- `automotive_app_desc.xml`

---

## Structure des fichiers clés

### Pages

| Fichier | Description |
|---------|-------------|
| `src/pages/Index.tsx` | Page principale, orchestration des onglets et providers |
| `src/pages/HomePage.tsx` | Accueil : abonnements, tendances, reprendre l'écoute, catégories |
| `src/pages/SearchPage.tsx` | Recherche avancée multi-filtres |
| `src/pages/PodcastDetailPage.tsx` | Détail d'un podcast + liste des épisodes |
| `src/pages/LibraryPage.tsx` | Bibliothèque de favoris et téléchargements |
| `src/pages/SettingsPage.tsx` | Réglages, premium, sleep timer, guide |
| `src/pages/WelcomePage.tsx` | Écran d'accueil / onboarding avec choix de langue |
| `src/pages/PremiumPage.tsx` | Page premium |

### Composants

| Fichier | Description |
|---------|-------------|
| `src/components/MiniPlayer.tsx` | Lecteur réduit en bas d'écran |
| `src/components/FullScreenPlayer.tsx` | Lecteur plein écran avec contrôles |
| `src/components/BottomNav.tsx` | Navigation inférieure (4 onglets) |
| `src/components/PodcastCard.tsx` | Carte podcast (normal + compact) |
| `src/components/EpisodeRow.tsx` | Ligne épisode dans la liste |
| `src/components/ScrollableRow.tsx` | Row horizontale scrollable |
| `src/components/CachedImage.tsx` | Image avec cache IndexedDB |
| `src/components/EqBars.tsx` | Barres d'égaliseur animées |
| `src/components/SleepTimerIndicator.tsx` | Indicateur sleep timer |
| `src/components/ExitConfirmDialog.tsx` | Dialogue confirmation sortie |
| `src/components/UserGuideModal.tsx` | Mode d'emploi intégré |
| `src/components/LanguageFilter.tsx` | Filtre de langue |
| `src/components/MultiSelectFilter.tsx` | Filtre multi-sélection réutilisable |
| `src/components/CategoryAnimations.tsx` | Animations décoratives catégories |
| `src/components/CategoryIcons.tsx` | Icônes des catégories |
| `src/components/CategoryImages.ts` | Images des catégories |

### Contexts (état global)

| Fichier | Description |
|---------|-------------|
| `src/contexts/PlayerContext.tsx` | État du lecteur audio (play, pause, épisode courant, etc.) |
| `src/contexts/FavoritesContext.tsx` | Abonnements, épisodes récents, sync native |
| `src/contexts/LanguageContext.tsx` | Langue de l'interface + traductions |
| `src/contexts/PremiumContext.tsx` | État premium (achat unique) |
| `src/contexts/SleepTimerContext.tsx` | Minuterie de sommeil |
| `src/contexts/DownloadContext.tsx` | Téléchargements hors-ligne |

### Services

| Fichier | Description |
|---------|-------------|
| `src/services/PodcastService.ts` | Client API Podcast Index (auth, fetch, normalisation) |
| `src/services/NewEpisodesService.ts` | Sync nouveaux épisodes (4h cooldown) |
| `src/services/PlaybackHistoryService.ts` | Historique de lecture (progression, reprendre) |
| `src/services/DownloadService.ts` | Téléchargement d'épisodes |
| `src/services/ImageCacheService.ts` | Cache d'images IndexedDB |

### Fichiers natifs Android (android-auto/)

| Fichier | Description |
|---------|-------------|
| `PodcastBrowserService.java` | MediaBrowserService pour Android Auto |
| `PodcastAutoPlugin.java` | Plugin Capacitor bridge (sync favorites, playback state) |
| `CastPlugin.java` | Plugin Chromecast natif (Google Cast SDK) |
| `CastOptionsProvider.java` | Configuration Cast (App ID) |
| `MediaToggleReceiver.java` | BroadcastReceiver notification play/pause |
| `res/xml/automotive_app_desc.xml` | Déclaration Android Auto |

### Documentation

| Fichier | Description |
|---------|-------------|
| `docs/PODCAST_INDEX_API.md` | Référence technique complète de l'API Podcast Index |
| `docs/PREMIUM_ROADMAP.md` | Roadmap des fonctionnalités premium |
| `docs/privacy-policy.html` | Politique de confidentialité |
| `android-auto/README-SETUP.md` | Guide de setup Android Auto |
| `VERSIONS.md` | Historique des versions |
| `.lovable/changelog.md` | Changelog détaillé du projet |
| `.lovable/plan.md` | Plan d'architecture v1.0 |

---

## API & Services

### Podcast Index API

- **Base URL** : `https://api.podcastindex.org/api/1.0`
- **Authentification** : SHA-1 de `(apiKey + apiSecret + unixTimestamp)` → headers `Authorization`, `X-Auth-Key`, `X-Auth-Date`, `User-Agent`
- **Credentials** : Encodés en Base64 dans `PodcastService.ts` (obfuscation légère)
- **Proxy CORS** : En mode navigateur, les requêtes passent par un proxy Vite (`/api/podcast` → `api.podcastindex.org`) pour contourner les restrictions CORS. En mode natif (Capacitor), les requêtes vont directement à l'API.

### Endpoints utilisés

| Endpoint | Usage dans l'app |
|----------|-----------------|
| `GET /search/byterm` | Recherche de podcasts + recherche par catégorie |
| `GET /podcasts/trending` | Tendances sur la page d'accueil |
| `GET /podcasts/byfeedid` | Détail d'un podcast |
| `GET /episodes/byfeedid` | Liste des épisodes d'un podcast |

---

## Fonctionnalités

### Core (gratuit)
- 🎙️ Découverte et lecture de podcasts
- 🔍 Recherche avancée par nom, catégorie, langue
- ❤️ Abonnements avec stockage local persistant
- 🕐 Historique des podcasts récemment écoutés
- ▶️ Reprendre l'écoute (progression sauvegardée)
- 🆕 Nouveaux épisodes des abonnements (sync automatique 4h)
- 🌍 Interface multilingue (FR, EN, ES, DE, JA, PT, IT, AR)
- 🎨 Thème sombre natif
- 🏠 Page d'accueil avec tendances, catégories illustrées, abonnements
- 📥 Téléchargement d'épisodes hors-ligne
- 🖼️ Cache d'images IndexedDB
- ↕️ Pull-to-refresh sur la page d'accueil

### Lecteur
- MiniPlayer avec défilement marquee
- FullScreenPlayer avec contrôles complets
- Contrôle du volume
- Barre de progression interactive
- Indicateur de buffering

### Premium (achat unique 9,99€)
- 💤 Sleep Timer (15 min à 2h, décompte temps réel)
- 📖 Mode d'emploi intégré (UserGuideModal)

### Android natif
- 🔔 Notification MediaStyle (contrôles play/pause)
- 🔙 Bouton retour natif avec dialogue de confirmation
- 🔊 Foreground Service pour lecture en arrière-plan
- 📺 Chromecast (Google Cast SDK natif)
- 🚗 Android Auto (browse tree, recherche, ExoPlayer)

---

## Scripts de build

### `podcastsphere_v1_0_0.ps1`

Script PowerShell automatisé pour builder l'APK Android. Il effectue :

1. **Build web** : `npm run build`
2. **Sync Capacitor** : `npx cap sync android`
3. **Copie des fichiers natifs** : 5 fichiers Java depuis `android-auto/`
   - `CastPlugin.java`
   - `CastOptionsProvider.java`
   - `PodcastBrowserService.java`
   - `PodcastAutoPlugin.java`
   - `MediaToggleReceiver.java`
4. **Injection Gradle** : ExoPlayer, Cast SDK, MediaRouter, Media
5. **Injection Manifest** : Services, receivers, permissions
6. **Injection MainActivity** : `registerPlugin()` calls
7. **Ressources** : Placeholder image, `automotive_app_desc.xml`
8. **Permissions** : `NEARBY_WIFI_DEVICES`, `ACCESS_FINE_LOCATION`
9. **Ouverture Android Studio** : `npx cap open android`

---

## Troubleshooting & Résolutions

### 1. ❌ CORS — Contenu dynamique ne s'affiche pas dans le navigateur

**Problème** : Les requêtes vers `api.podcastindex.org` sont bloquées par la politique CORS quand l'app tourne dans un navigateur web (preview Lovable, localhost). L'API retourne un statut 200 mais le navigateur bloque la réponse car l'en-tête `Access-Control-Allow-Origin` est absent.

**Symptôme** : La section "Tendances" affiche les skeletons puis reste vide. Les catégories s'affichent (statiques) mais aucun contenu dynamique de l'API.

**Erreur console** :
```
Access to fetch at 'https://api.podcastindex.org/api/1.0/podcasts/trending?max=20&lang=fr'
from origin 'https://...lovableproject.com' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Résolution** : Ajout d'un **proxy Vite** dans `vite.config.ts` qui redirige `/api/podcast/*` vers `api.podcastindex.org`. En mode navigateur, `PodcastService.ts` utilise le chemin proxy `/api/podcast` au lieu de l'URL directe. En mode natif Capacitor, l'URL directe est utilisée (pas de restriction CORS).

**Fichiers modifiés** :
- `vite.config.ts` — ajout bloc `server.proxy`
- `src/services/PodcastService.ts` — détection `Capacitor` + base URL conditionnelle

---

### 2. ❌ Build Android échoue — `onSessionResumeFailed` manquant (CastPlugin)

**Problème** : La compilation Java échoue lors du build Gradle avec l'erreur :
```
CastPlugin.java:68: error: <anonymous CastPlugin$1> is not abstract and does not override
abstract method onSessionResumeFailed(CastSession,int) in SessionManagerListener
```

**Cause** : La version du Google Cast SDK (21.4.0) a ajouté une nouvelle méthode abstraite `onSessionResumeFailed()` à l'interface `SessionManagerListener`. Notre `CastPlugin.java` implémentait cette interface sans cette méthode.

**Résolution** : Ajout de la méthode manquante dans le `SessionManagerListener` anonyme de `CastPlugin.java` :
```java
@Override
public void onSessionResumeFailed(@NonNull CastSession session, int error) {
    Log.e(TAG, "Session resume failed: " + error);
    currentSession = null;
}
```

**Fichier modifié** : `android-auto/CastPlugin.java`

---

### 3. ⚠️ Warning — Function components cannot be given refs

**Problème** : Warning React en console :
```
Warning: Function components cannot be given refs. Attempts to access this ref will fail.
Did you mean to use React.forwardRef()?
```

**Cause** : Certains composants fonction sont utilisés là où React tente de leur passer une `ref` (par ex. dans `ErrorBoundary`, `App`, `TrendingRowSkeleton`).

**Impact** : Warning uniquement, pas d'erreur fonctionnelle. N'empêche pas le fonctionnement de l'app.

**Résolution possible** : Wrapper les composants concernés avec `React.forwardRef()` si nécessaire. Non bloquant pour la v1.0.

---

### 4. ⚠️ Warning — Deprecated API (Capacitor plugins)

**Problème** : Warnings lors du build Gradle :
```
LocalNotificationsPlugin.java uses or overrides a deprecated API.
AndroidForegroundService.java uses or overrides a deprecated API.
FilesystemPlugin.kt: 'downloadFile' is deprecated. Use @capacitor/file-transfer instead.
```

**Impact** : Warnings uniquement, le build réussit. Les plugins fonctionnent normalement.

**Résolution** : Pas d'action requise pour la v1.0. À surveiller lors des mises à jour de Capacitor.

---

### 5. ⚠️ Warning — flatDir Gradle

**Problème** :
```
Using flatDir should be avoided because it doesn't support any meta-data formats.
```

**Impact** : Warning cosmétique généré par Capacitor. N'affecte pas le build.

**Résolution** : Ignoré. Généré automatiquement par la configuration Capacitor.

---

### 6. ℹ️ Onboarding bloque l'accès au contenu

**Problème** : L'écran Welcome (onboarding) s'affiche à chaque visite dans un nouveau navigateur/session, bloquant l'accès au contenu principal.

**Comportement attendu** : L'onboarding ne s'affiche qu'une fois. Le flag `podcastsphere_onboarded` est stocké dans `localStorage`. Après clic sur "Commencer", le flag est écrit et l'écran ne réapparaît plus.

**Note** : Dans le preview Lovable, le `localStorage` est réinitialisé à chaque rechargement, donc l'onboarding peut réapparaître systématiquement. Ce n'est pas un bug — c'est le comportement normal du preview.

---

### 7. ℹ️ Permissions refusées au démarrage

**Symptôme** : Toast "0/1 — Some permissions were denied" au premier lancement.

**Cause** : L'app demande des permissions Android (notifications, etc.) au démarrage. Certaines peuvent être refusées par l'utilisateur ou non supportées dans l'environnement preview.

**Impact** : Non bloquant. Les fonctionnalités liées aux permissions dégradent gracieusement.

---

## Dépendances principales

### Production

```
react, react-dom (18.3.x)
react-router-dom (6.30.x)
@tanstack/react-query (5.83.x)
tailwindcss (3.4.x)
@radix-ui/* (composants shadcn/ui)
lucide-react (0.462.x)
@iconify/react (6.x)
sonner (1.7.x)
date-fns (3.6.x)
embla-carousel-react (8.6.x)
class-variance-authority, clsx, tailwind-merge
zod (3.25.x)
react-hook-form (7.61.x)
@capacitor/core, @capacitor/app, @capacitor/browser,
@capacitor/filesystem, @capacitor/share,
@capacitor/local-notifications (8.x)
@capawesome-team/capacitor-android-foreground-service (8.x)
recharts (2.15.x)
vaul (0.9.x)
next-themes (0.3.x)
```

### Développement

```
vite (5.4.x)
typescript (5.8.x)
vitest (3.2.x)
eslint (9.x)
@vitejs/plugin-react-swc (3.11.x)
postcss, autoprefixer
@tailwindcss/typography
lovable-tagger
```

---

## Notes importantes

1. **Credentials API** : Les clés API Podcast Index sont encodées en Base64 dans `PodcastService.ts`. C'est une obfuscation légère, pas un vrai mécanisme de sécurité. Pour la production, les clés devraient être dans un backend.

2. **Stockage local** : Tout le stockage (favoris, historique, préférences) utilise `localStorage` et `IndexedDB`. Pas de backend/base de données distante.

3. **Sync épisodes** : Le service `NewEpisodesService` synchronise les nouveaux épisodes des abonnements avec un cooldown de 4 heures pour éviter de surcharger l'API.

4. **Proxy CORS** : Le proxy Vite (`/api/podcast`) ne fonctionne qu'en développement. En production web, il faudrait un vrai proxy backend. En mode natif Capacitor, aucun proxy n'est nécessaire.

5. **Android Auto** : Nécessite ExoPlayer pour la lecture native. Le browse tree est alimenté par les SharedPreferences synchronisées depuis le WebView via `PodcastAutoPlugin`.

6. **Chromecast** : Utilise le Default Media Receiver (CC1AD845) en dev. Pour la production, un receiver personnalisé peut être enregistré sur la Google Cast Developer Console.

---

*Document généré le 19 mars 2026. Mis à jour à chaque session de développement.*
