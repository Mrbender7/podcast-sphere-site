

## Plan : Dernières sorties + Pull-to-refresh + Réorganisation accueil

### 1. Créer `src/services/NewEpisodesService.ts`

Service adapté au projet :
- Imports depuis `@/types/podcast`, appel réel à `getEpisodesByFeedId` depuis `PodcastService.ts`
- Cooldown 4h en LocalStorage (`ps_last_sync_time`, `ps_new_episodes`)
- Méthodes : `getNewEpisodesFromCache()`, `markAsSeen(id)`, `syncNewEpisodes(feeds, forceRefresh)`
- Première synchro : ne prendre que le dernier épisode par feed

### 2. Modifier `src/pages/HomePage.tsx`

**Nouvel ordre des sections :**
1. Abonnements
2. Reprendre la lecture
3. Dernières sorties (nouveau)
4. Tendances (déplacé)
5. Explorer par catégorie

**Section "Dernières sorties" :**
- State `newEpisodes` via `useEffect` + `syncNewEpisodes(subscriptions)`
- Carrousel horizontal (`ScrollableRow`)
- Chaque carte : artwork, titre, nom du podcast
- Au clic carte : `play(episode)` + `markAsSeen(episode.id)` + retrait du state
- **Bouton "marquer comme lu"** : petit bouton `X` (icône `X` de lucide) en haut à droite de chaque carte, semi-transparent. Au clic : `e.stopPropagation()` + `markAsSeen(episode.id)` + retrait du state local, sans lancer la lecture
- Section visible uniquement si `newEpisodes.length > 0` et `subscriptions.length > 0`

**Pull-to-refresh :**
- Détection touch sur `scrollContainerRef` quand `scrollTop === 0`, seuil ~60px
- Spinner animé en haut
- Appel `syncNewEpisodes(subscriptions, true)`

### 3. Ajouter les traductions

Dans `src/i18n/translations.ts` : `home.latestReleases`, `home.pullToRefresh`

