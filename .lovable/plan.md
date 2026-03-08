

# Transformation Radio Sphere → Lecteur de Podcasts (Podcast Index)

## Vue d'ensemble

Remplacement complet du mode radio par un lecteur de podcasts. Le thème visuel (gradient bleu/violet, dark mode, navigation bottom tabs) est conservé. Tout le code radio (RadioService, RadioBrowser, StreamBuffer, etc.) est supprimé ou remplacé.

---

## 1. Types & API Service

### `src/types/podcast.ts` (nouveau)
```typescript
interface Podcast {
  id: number;           // feedId from PI
  title: string;
  author: string;
  image: string;
  description: string;
  url: string;          // feed URL
  categories: string[];
  lastEpisodeDate: number; // unix timestamp
}

interface Episode {
  id: number;
  title: string;
  description: string;
  datePublished: number;
  duration: number;     // seconds
  enclosureUrl: string; // MP3/AAC URL
  enclosureType: string;
  image: string;        // episode or fallback to podcast image
  feedId: number;
}
```

### `src/services/PodcastService.ts` (nouveau, remplace RadioService)
- Fonction utilitaire `generatePodcastIndexHeaders()` : calcule le hash SHA-1 de `(apiKey + apiSecret + timestamp)` via `crypto.subtle.digest('SHA-1', ...)` nativement dans le navigateur.
- API Key / Secret en placeholders constants (avec commentaire indiquant où les remplacer).
- Fonctions :
  - `searchPodcasts(term: string)` → GET `/search/byterm?q=...`
  - `getEpisodesByFeedId(feedId: number)` → GET `/episodes/byfeedid?id=...`
  - `getTrendingPodcasts()` → GET `/podcasts/trending`
  - `getPodcastById(feedId: number)` → GET `/podcasts/byfeedid?id=...`

### Suppression
- `src/services/RadioService.ts` → supprimé
- `src/types/radio.ts` → supprimé

---

## 2. Contextes & Hooks

### `src/contexts/PlayerContext.tsx` — refonte majeure
- Le state gère un `Episode` (au lieu de `RadioStation`) + un `Podcast` parent pour l'artwork.
- Suppression : keepAlive, heartbeat, stream reload, silentAudio, StreamBuffer, stalled/ended recovery (tout ce qui est spécifique au live streaming).
- Ajouts :
  - `currentTime` / `duration` via `audio.timeupdate` et `audio.loadedmetadata`
  - `seek(seconds: number)` — `audio.currentTime = seconds`
  - `skipForward(30)` / `skipBackward(15)`
  - `playbackRate` state + `setPlaybackRate(rate: number)` — `audio.playbackRate = rate`
  - `progress` (0-1) calculé depuis currentTime/duration
- MediaSession : metadata avec titre épisode, artiste = auteur podcast, artwork = image podcast.

### `src/contexts/FavoritesContext.tsx` / `src/hooks/useFavorites.ts`
- Renommé conceptuellement en "Subscriptions" : on s'abonne à un `Podcast` (pas un épisode).
- `toggleFavorite` → `toggleSubscription`
- `isFavorite` → `isSubscribed`
- localStorage key : `podcastsphere_subscriptions`
- Stocke aussi `lastSeenEpisodeDate` par podcast pour le badge "nouveaux épisodes".

### Suppression
- `src/contexts/StreamBufferContext.tsx` → supprimé
- `src/contexts/SleepTimerContext.tsx` → conservé (utile pour les podcasts aussi)
- `src/hooks/useWeeklyDiscoveries.ts` → supprimé
- `src/hooks/useCast.ts` → conservé mais simplifié

---

## 3. Pages & Navigation

### Navigation (BottomNav)
Tabs : Accueil | Recherche | Bibliothèque | Réglages (inchangé).

### `src/pages/HomePage.tsx` — refonte
- Trending podcasts (via `getTrendingPodcasts()`) en ScrollableRow
- Podcasts abonnés récemment mis à jour
- Catégories populaires (grid cards comme les genres actuels, mappées vers des recherches)

### `src/pages/SearchPage.tsx` — refonte complète
- Champ de recherche → appelle `searchPodcasts(term)`
- Résultats : liste avec image podcast (carrée), titre, auteur
- Clic sur un podcast → navigue vers la vue épisodes (inline, pas de route)

### `src/pages/PodcastDetailPage.tsx` (nouveau composant, affiché inline dans SearchPage ou HomePage)
- Header : image, titre, auteur, bouton S'abonner
- Liste des épisodes (via `getEpisodesByFeedId`)
- Chaque épisode : titre, date, durée, bouton play

### `src/pages/LibraryPage.tsx` — adapté
- Liste des podcasts abonnés
- Badge "N nouveaux" si `lastEpisodeDate > lastSeenEpisodeDate`
- Clic → ouvre PodcastDetailPage

---

## 4. Composants Player

### `src/components/MiniPlayer.tsx` — adapté
- Affiche : image épisode, titre épisode, auteur podcast
- Barre de progression fine (Progress bar sous le mini player)
- Bouton play/pause

### `src/components/FullScreenPlayer.tsx` — refonte
- Artwork épisode/podcast
- Titre épisode + auteur
- **Seekbar interactive** (Slider de 0 à duration, contrôlé par currentTime)
- Temps écoulé / temps restant
- Boutons : **-15s** | Play/Pause | **+30s**
- **Sélecteur de vitesse** : pills 1x / 1.2x / 1.5x / 2x
- Volume slider vertical (conservé)
- Bouton favori / partage (conservé)
- Suppression : REC, Live indicator, cassette animation, codec/bitrate info

### `src/components/PodcastCard.tsx` (nouveau, remplace StationCard)
- Mode normal : image carrée + titre + auteur (pour ScrollableRow)
- Mode compact : liste row (pour search results et library)
- Bouton abonnement (coeur → bookmark icon)

### `src/components/EpisodeRow.tsx` (nouveau)
- Titre, date formatée, durée formatée
- Bouton play
- Highlight si c'est l'épisode en cours

---

## 5. Traductions (i18n)

Mise à jour des clés dans `src/i18n/translations.ts` pour les 5 langues :
- `search.placeholder` → "Rechercher un podcast..."
- `favorites.title` → "Bibliothèque"
- `player.nowPlaying` → "En cours"
- Nouvelles clés : `podcast.subscribe`, `podcast.episodes`, `podcast.newEpisodes`, `player.speed`, etc.

---

## 6. Nettoyage

Fichiers supprimés :
- `src/services/RadioService.ts`
- `src/types/radio.ts`
- `src/contexts/StreamBufferContext.tsx`
- `src/hooks/useWeeklyDiscoveries.ts`
- `src/components/StationCard.tsx`
- `src/components/CassetteAnimation.tsx`
- `src/components/GenreAnimations.tsx`
- `src/components/AudioVisualizer.tsx` (optionnel, peut être conservé)

Fichiers modifiés :
- `src/App.tsx`, `src/pages/Index.tsx` — retrait StreamBufferProvider
- `src/components/BottomNav.tsx` — label "Bibliothèque" au lieu de "Favoris"

---

## 7. Point d'attention : Authentification Podcast Index

Le hash SHA-1 sera généré côté client via :
```javascript
async function generateAuthHeaders(apiKey, apiSecret) {
  const ts = Math.floor(Date.now() / 1000);
  const data = apiKey + apiSecret + ts;
  const hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(data));
  const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return { 'X-Auth-Date': String(ts), 'X-Auth-Key': apiKey, 'Authorization': hex, 'User-Agent': 'PodcastSphere/1.0' };
}
```

**Note** : l'API Secret sera visible dans le code client (pas de backend). C'est acceptable pour une app mobile Capacitor (le code n'est pas public), mais un commentaire le signalera. Une migration vers un Edge Function Supabase sera suggérée pour plus de sécurité.

---

## Ordre d'implémentation

1. Types + PodcastService (avec auth headers)
2. PlayerContext refactorisé (seekbar, skip, vitesse)
3. FavoritesContext → SubscriptionsContext
4. PodcastCard + EpisodeRow composants
5. HomePage, SearchPage, PodcastDetailPage, LibraryPage
6. MiniPlayer + FullScreenPlayer adaptés
7. Traductions i18n
8. Nettoyage fichiers radio
9. Index.tsx + App.tsx wiring

