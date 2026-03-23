

## Plan de corrections UI et fonctionnalites

### 1. Branding "radiosphere.be"

**WelcomePage.tsx** : Ajouter sous le titre "Podcast Sphere" un lien "Un produit de radiosphere.be" pointant vers https://radiosphere.be.

**SettingsPage.tsx** : Ajouter une section "A propos" indiquant que l'app fait partie de la famille radiosphere.be, avec un lien externe.

### 2. Synchro play/pause dans "Reprendre la lecture" (HomePage)

Le probleme : les items de "Reprendre la lecture" (lignes 224-254 de HomePage.tsx) utilisent un simple bouton Play statique sans verifier si l'episode est celui en cours de lecture. Il faut :
- Importer `currentEpisode`, `isPlaying`, `isBuffering`, `togglePlay` depuis `usePlayer()`
- Pour chaque entry, verifier si `currentEpisode?.id === entry.episode.id`
- Si oui et en lecture : afficher Pause. Si oui et buffering : afficher Loader2. Sinon : Play.
- Au clic : si c'est l'episode courant, appeler `togglePlay()`, sinon `play(entry.episode)`.
- Meme logique pour les items de la LibraryPage (sections "En cours", "Telechargements", "Nouveaux episodes").

### 3. Titre podcast defilant dans "Reprendre la lecture" et favoris

Actuellement le titre du podcast est tronque (`truncate`). Quand l'episode est en cours de lecture, le titre doit defiler en marquee, comme dans le MiniPlayer.
- Creer un petit composant `MarqueeText` reutilisable (mesure du debordement + animation conditionnelle).
- L'appliquer au titre du podcast dans les rows de "Reprendre la lecture" (HomePage + LibraryPage) quand `isCurrent && isPlaying`.

### 4. Bouton favori (podcast) dans le FullScreenPlayer

Ajouter un bouton Bookmark dans le header du FullScreenPlayer pour ajouter/retirer le podcast parent aux abonnements.
- Utiliser `useFavoritesContext()` pour `isSubscribed` / `toggleSubscription`
- Construire un objet Podcast minimal depuis `currentEpisode` (feedId, feedTitle, feedImage, feedAuthor)
- Placer le bouton dans la barre du haut a cote du bouton download

### 5. Alignement du bouton play dans les dernieres sorties (HomePage)

Le carrousel "Dernieres sorties" (lignes 278-305) n'a pas de bouton play explicite — c'est un clic sur tout le bloc. Le probleme d'alignement vient probablement du fait que quand un episode est telecharge, un badge supplementaire decale le layout.
- Ajouter un petit bouton play overlay en bas a droite de l'artwork (position absolute), coherent avec le reste de l'UI.
- Afficher Pause si c'est l'episode en cours, Play sinon.
- Ajouter le titre du podcast (feedTitle) visible sous le titre de l'episode (deja fait ligne 301, verifier que c'est bien present).
- Ajouter un bouton download individuel (icone Download a cote du dismiss X).

### 6. Synchro globale play/pause

Verifier que TOUS les endroits ou un bouton play apparait sur l'accueil respectent la meme logique :
- Reprendre la lecture : Play/Pause synchro ✓ (correction #2)
- Dernieres sorties : Play/Pause synchro ✓ (correction #5)
- Telechargements (LibraryPage) : Play/Pause synchro (meme pattern)
- Nouveaux episodes (LibraryPage) : Play/Pause synchro (meme pattern)

### Fichiers a modifier
- `src/pages/WelcomePage.tsx` — lien radiosphere.be
- `src/pages/SettingsPage.tsx` — section "A propos" radiosphere.be
- `src/pages/HomePage.tsx` — synchro play/pause + marquee titre dans Reprendre + bouton play/download dans Dernieres sorties
- `src/components/FullScreenPlayer.tsx` — bouton favori podcast
- `src/pages/LibraryPage.tsx` — synchro play/pause dans toutes les sections

### Detail technique
- Composant `MarqueeText` inline ou utilitaire pour eviter la duplication de la logique marquee
- Le bouton play sera toujours positionne a droite, en `flex-shrink-0`, taille `w-8 h-8` ou `w-10 h-10` selon le contexte

