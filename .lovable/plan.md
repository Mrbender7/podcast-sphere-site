

## Android Auto Player — Plan complet

### Architecture actuelle
- `PodcastBrowserService.java` gere le MediaSession + notifications mais `onLoadChildren()` retourne une liste vide — Android Auto n'affiche rien
- `PodcastAutoPlugin.java` fait le bridge WebView ↔ Service natif (metadata, playback state, commandes)
- `PlayerContext.tsx` gere toute la lecture via HTML5 Audio dans le WebView
- Les abonnements sont dans `localStorage` (clé `podcastsphere_subscriptions`)
- L'historique de lecture est dans `localStorage` (clé `ps_listen_history`)
- Next/Previous n'existent pas encore — le player n'a que play/pause/seek

### Ce qui doit être fait

#### 1. Browse Tree Android Auto (PodcastBrowserService.java)
Construire l'arborescence de navigation pour Android Auto :

```text
ROOT
├── 🎧 Now Playing (épisode en cours / dernier écouté)
├── ⭐ Abonnements
│   ├── Podcast A → liste épisodes
│   ├── Podcast B → liste épisodes
│   └── ...
└── ▶️ En cours de lecture (historique non terminés)
```

- Les données (abonnements, historique) sont synchronisées depuis le WebView vers `SharedPreferences` via le plugin
- `onLoadChildren()` lit les SharedPreferences pour construire les MediaItems
- Chaque podcast dans "Abonnements" est BROWSABLE (ouvre ses épisodes)
- Chaque épisode est PLAYABLE
- L'artwork est chargé en arrière-plan via `IconCompat` avec `ContentResolver`

#### 2. Sync des données WebView → SharedPreferences (PodcastAutoPlugin.java)
Ajouter une méthode `syncListenHistory()` au plugin pour synchroniser l'historique de lecture en plus des favoris existants (`syncFavorites`). Le WebView envoie les données JSON stringifiées.

#### 3. Next/Previous dans le player (PlayerContext.tsx)
- Ajouter `playNext()` et `playPrevious()` qui naviguent dans les épisodes de l'abonnement en cours
- Logique : identifier le `feedId` de l'épisode en cours → charger les épisodes de ce feed → trouver l'index courant → jouer le suivant/précédent
- Exposer via `navigator.mediaSession` handlers `nexttrack` / `previoustrack`
- Exposer via le native listener `mediaCommand` (actions `next`, `previous`)

#### 4. Message de sécurité conduite
Quand un utilisateur ouvre un abonnement sur Android Auto, afficher un `MediaItem` non-playable en haut de la liste avec :
- Titre : "Attention, ne naviguez jamais dans les menus en conduisant" (traduit)
- Sous-titre : "Laissez cette tâche au passager" (traduit)

#### 5. Autoplay
- Quand Android Auto se connecte et qu'aucun épisode n'est en lecture, reprendre automatiquement le dernier épisode en cours depuis l'historique
- Le service envoie un `mediaCommand` avec `action: "autoplay"` au WebView

#### 6. PlaybackState avec Skip Actions
Activer `ACTION_SKIP_TO_NEXT` et `ACTION_SKIP_TO_PREVIOUS` dans `applyPlaybackState()` pour que les boutons apparaissent sur l'interface Android Auto.

#### 7. Logo Podcast Sphere
Utiliser l'icône de l'app (`ic_notification` / `ic_launcher`) comme icône du service dans les racines du browse tree.

---

### Fichiers modifiés

| Fichier | Changements |
|---------|------------|
| `android-auto/PodcastBrowserService.java` | Browse tree complet (3 sections), chargement depuis SharedPrefs, artwork, message sécurité, skip actions |
| `android-auto/PodcastAutoPlugin.java` | Ajouter `syncListenHistory()`, `syncEpisodeList()` |
| `src/plugins/PodcastAutoPlugin.ts` | Ajouter interfaces TS pour `syncListenHistory`, `syncEpisodeList` |
| `src/contexts/PlayerContext.tsx` | Ajouter `playNext()`, `playPrevious()`, handlers mediaSession `nexttrack`/`previoustrack`, handler `mediaCommand` next/previous/autoplay, sync épisodes du feed courant vers native |
| `src/contexts/FavoritesContext.tsx` | Sync automatique des abonnements vers native au changement |
| `src/i18n/translations.ts` | Ajouter traductions "driving warning" dans les 5 langues |

### Troubleshooting intégrés (leçons de RadioSphere)
- Artwork redimensionné en 512x512 max (éviter `TransactionTooLargeException`)
- `ensureForeground()` appelé avant tout `startForegroundService` (éviter crash Android 14+)
- SharedPreferences en JSON string avec try/catch (données corrompues = fallback liste vide)
- `onLoadChildren` avec `result.detach()` + thread background pour le chargement d'artwork (éviter ANR)

