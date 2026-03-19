

## Diagnostic -- Pourquoi l'app Android crash/tourne dans le vide

Apres audit complet des fichiers Java, TypeScript et du script PS1, voici les problemes identifies :

### Problemes critiques (crash / ecran noir)

**1. Methode Java inexistante appelee depuis React**
`PodcastAutoPlugin.ts` exporte `notifyNativePlaybackState()` qui appelle `getPlugin().notifyPlaybackState(...)`. Or cette methode n'existe PAS dans `PodcastAutoPlugin.java` (les methodes sont `updateNowPlaying`, `updatePlaybackState`, `syncFavorites`, `stopPlayback`). Chaque fois qu'un episode joue ou se met en pause, cet appel echoue cote Android, generant potentiellement un crash ou un blocage du bridge Capacitor.

**2. Double appels natifs concurrents dans PlayerContext.tsx**
Les fonctions `play()` et `togglePlay()` appellent DEUX fois le service natif :
- Les anciens wrappers : `notifyNativePlaybackState()`, `updateNativeNowPlaying()`, `updateNativePlaybackState()`
- Les nouveaux : `safeNativeCall('updateNowPlaying', ...)`, `safeNativeCall('updatePlaybackState', ...)`

Cela bombarde le PodcastBrowserService avec des intents simultanes, causant des problemes de timing `startForeground`.

**3. Canal de notification IMPORTANCE_LOW (PS1 ligne 403)**
Le script PS1 cree le canal `podcast_playback` avec `IMPORTANCE_LOW`. Sur Android 13+, si la notification n'est pas suffisamment visible, le systeme peut tuer le foreground service. L'agent Android Studio recommandait `IMPORTANCE_DEFAULT`.

**4. Listeners non proteges sur web (erreur visible dans les logs)**
Lignes 336-343 de PlayerContext.tsx : `PodcastAutoPlugin.addListener("mediaToggle", ...)` et `addListener("vehicleDisconnected", ...)` sont appeles SANS verification `Capacitor.isNativePlatform()`. Sur web, ca provoque des rejections de Promise non gerees. Sur Android, ca fonctionne, mais ca pollue les logs web.

**5. Mismatch syncFavorites**
Le Java attend `favorites` et `recent` comme params, mais le TS envoie `podcasts`. Et `syncRecents` n'existe pas en Java.

### Plan de corrections

#### Fichier 1 : `src/plugins/PodcastAutoPlugin.ts`
- Supprimer la fonction `notifyNativePlaybackState()` (methode Java inexistante)
- Corriger `syncFavoritesToNative` pour envoyer `favorites` au lieu de `podcasts`
- Supprimer `syncRecentsToNative` (pas de methode Java correspondante)

#### Fichier 2 : `src/contexts/PlayerContext.tsx`
- Supprimer TOUS les appels aux anciens wrappers (`notifyNativePlaybackState`, `updateNativeNowPlaying`, `updateNativePlaybackState`) et l'import correspondant
- Ne garder QUE les appels `safeNativeCall()` (une seule voie de communication)
- Supprimer le `safeNotifyNative` callback devenu inutile
- Proteger les `addListener` lignes 336-343 avec `if (Capacitor.isNativePlatform())`
- Supprimer `updateNativePlaybackState` de l'intervalle `onTimeUpdate` (ligne 168) -- deja couvert par le useEffect periodique ligne 490

#### Fichier 3 : `podcastsphere_v1_0_0.ps1`
- Changer `NotificationManager.IMPORTANCE_LOW` en `NotificationManager.IMPORTANCE_DEFAULT` pour le canal `podcast_playback` (ligne 403)

#### Fichier 4 : `android-auto/PodcastBrowserService.java`
- Supprimer l'initialisation ExoPlayer dans `onCreate()` (inutile, la lecture se fait dans le WebView). Cela libere de la memoire et evite des conflits d'AudioFocus.

### Resume
Le probleme principal est que **chaque action de lecture declenche un appel a une methode Java inexistante** (`notifyPlaybackState`), ce qui bloque ou crashe le bridge Capacitor. Combine avec les doubles appels et le canal IMPORTANCE_LOW, le service foreground ne peut pas demarrer correctement, d'ou le spinning puis ecran noir.

