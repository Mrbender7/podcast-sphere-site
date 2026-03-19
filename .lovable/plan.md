

## Audit PodcastSphere vs RadioSphere — Contenu dynamique, Chromecast, Android Auto

### Constat actuel

| Fonctionnalité | RadioSphere | PodcastSphere | Statut |
|---|---|---|---|
| **MediaSession (contenu dynamique)** | metadata + play/pause | metadata + play/pause | ✅ OK |
| **Silent audio loop** (background keep-alive) | Oui (WAV base64) | **Absent** | ❌ Critique |
| **WakeLock** | Oui | **Absent** | ❌ Critique |
| **visibilitychange** recovery | Oui | **Absent** | ❌ Critique |
| **Chromecast (useCast)** | Dual-path web/native complet | Stub vide | ❌ À implémenter |
| **CastPlugin.java** | Natif complet (~540 lignes) | **Absent** | ❌ À créer |
| **CastOptionsProvider.java** | Natif | **Absent** | ❌ À créer |
| **Android Auto (MediaBrowserService)** | RadioBrowserService.java (~1100 lignes) | **Absent** (stub TS seulement) | ❌ À créer |
| **PodcastAutoPlugin.java** | — | **Absent** (stub TS seulement) | ❌ À créer |
| **MediaToggleReceiver.java** | Natif | **Absent** | ❌ À créer |
| **ExoPlayer** | Pour Android Auto | **Absent** | ❌ À ajouter |
| **automotive_app_desc.xml** | Présent | **Absent** | ❌ À créer |
| **Permissions Cast** | NEARBY_WIFI_DEVICES + ACCESS_FINE_LOCATION | **Absentes** | ❌ À ajouter |
| **Gradle dependencies** | ExoPlayer + Cast + MediaRouter + Media | **Absentes** | ❌ À ajouter |

---

### Plan d'implémentation

#### A. Contenu dynamique & lecture en arrière-plan (PlayerContext.tsx)

3 mécanismes manquants critiques pour la survie audio en background sur Android :

1. **Silent audio loop** — Second élément `Audio` jouant un WAV silencieux en boucle (volume 0.01). Empêche le WebView de tuer le process.
2. **WakeLock API** — `navigator.wakeLock.request('screen')` pendant la lecture, release sur pause.
3. **visibilitychange handler** — Quand l'app revient au premier plan, force `audio.play()` + relance la boucle silencieuse après 500ms.

Ces 3 éléments sont copiés tels quels depuis RadioSphere.

#### B. Chromecast

**Fichiers à créer/modifier :**

| Fichier | Action |
|---|---|
| `android-auto/CastPlugin.java` | Créer — Plugin Capacitor natif, init Cast SDK, permissions, session listener, MediaRouter, résolution d'URL, détection MIME. Adapter pour podcasts (STREAM_TYPE_BUFFERED au lieu de LIVE, durée finie). Package `com.fhm.podcastsphere`. |
| `android-auto/CastOptionsProvider.java` | Créer — Retourne le Cast App ID. Package `com.fhm.podcastsphere`. |
| `public/cast-receiver.html` | Adapter — Ajouter barre de progression + seek (podcast = contenu fini). |
| `src/hooks/useCast.ts` | Réécrire — Dual-path web/native comme RadioSphere, adapté au type `Episode`. |
| `src/components/FullScreenPlayer.tsx` | Ajouter bouton Cast. |
| `index.html` | Déjà OK — le bridge Cast SDK est présent et conditionné à non-Capacitor. |

**Cast App ID** : Utiliser `CC1AD845` (Default Media Receiver) en dev. Enregistrer un receiver custom pour la production.

**Permissions Android** à ajouter au manifest :
- `NEARBY_WIFI_DEVICES` (Android 13+, `neverForLocation`)
- `ACCESS_FINE_LOCATION` (Android ≤12, pour mDNS discovery)

#### C. Android Auto

**Fichiers à créer :**

| Fichier | Action |
|---|---|
| `android-auto/PodcastBrowserService.java` | MediaBrowserServiceCompat + ExoPlayer. Browse tree à 2 niveaux : ROOT → Abonnements → Episodes, En cours, Catégories. Voice search via `onPlayFromSearch()`. |
| `android-auto/PodcastAutoPlugin.java` | Plugin Capacitor natif — sync favoris/récents/playback vers SharedPreferences. Singleton pour bridge notification→JS. |
| `android-auto/MediaToggleReceiver.java` | BroadcastReceiver play/pause notification → event JS. Action `com.fhm.podcastsphere.MEDIA_TOGGLE`. |
| `android-auto/res/xml/automotive_app_desc.xml` | Déclaration Android Auto media app. |
| `src/plugins/PodcastAutoPlugin.ts` | Compléter le stub existant avec la vraie logique de sync. |

**Browse tree podcast (2 niveaux)** :
```text
ROOT
├── __SUBSCRIPTIONS__
│   ├── [Podcast A] → [Ep 1, Ep 2, ...]
│   └── [Podcast B] → [Ep 1, Ep 2, ...]
├── __IN_PROGRESS__
│   └── [Episodes en cours de lecture]
├── __CATEGORIES__
│   ├── technology
│   ├── comedy
│   └── ...
└── (search results)
```

Différence clé vs RadioSphere : `onLoadChildren()` doit gérer un niveau supplémentaire (podcast → épisodes).

#### D. Modifications au script PS1

Le `podcastsphere_v1_0_0.ps1` nécessite des ajouts significatifs :

| Section | Modification |
|---|---|
| **Section 2 (npm install)** | Ajouter `@capacitor/local-notifications` (déjà listé), rien de plus côté npm |
| **Section 4 (Manifest)** | Ajouter permissions `NEARBY_WIFI_DEVICES` (neverForLocation), `ACCESS_FINE_LOCATION`. Ajouter `<service>` PodcastBrowserService, `<receiver>` MediaToggleReceiver, `<meta-data>` Cast (CastOptionsProvider + automotive_app_desc). |
| **Section 5 (Gradle)** | Ajouter dependencies : `exoplayer-core:2.19.1`, `exoplayer-ui:2.19.1`, `androidx.media:media:1.7.0`, `play-services-cast-framework:21.4.0`, `androidx.mediarouter:mediarouter:1.7.0` |
| **Section 6 (MainActivity)** | Ajouter `registerPlugin(CastPlugin.class)` et `registerPlugin(PodcastAutoPlugin.class)` dans les imports + onCreate. |
| **Nouvelle section** | Copie des fichiers Java natifs (`CastPlugin.java`, `CastOptionsProvider.java`, `PodcastBrowserService.java`, `PodcastAutoPlugin.java`, `MediaToggleReceiver.java`) depuis `android-auto/` vers le bon répertoire package. |
| **Nouvelle section** | Copie de `automotive_app_desc.xml` vers `android/app/src/main/res/xml/`. |
| **Nouvelle section** | Copie de `station_placeholder.jpg` (renommer en `podcast_placeholder.jpg`) vers `android/app/src/main/res/drawable/`. |

---

### Ordre d'implémentation recommandé

1. **PlayerContext — silent loop + WakeLock + visibilitychange** (impact immédiat sur la fiabilité de lecture en background)
2. **Chromecast** (CastPlugin.java + CastOptionsProvider.java + useCast.ts + FullScreenPlayer)
3. **Android Auto** (PodcastBrowserService.java + PodcastAutoPlugin.java complet + MediaToggleReceiver)
4. **Script PS1** (mise à jour avec tous les fichiers natifs, permissions, dependencies)

### Volume estimé

C'est un chantier conséquent (~2000+ lignes de Java natif, ~300 lignes TS). Je recommande de procéder étape par étape, en commençant par le point A (background keep-alive) qui est critique et rapide, puis B et C en parallèle.

