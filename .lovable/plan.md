

# Recherche multi-genres en mode OR

## Probleme actuel

Quand l'utilisateur selectionne 2+ genres (ex: "rock" et "jazz"), le code envoie `tagList=rock,jazz` a l'API Radio Browser. Ce parametre fonctionne en mode **AND** : seules les stations ayant TOUS les tags sont retournees. Cela produit tres peu de resultats.

## Solution

Remplacer l'envoi unique `tagList=rock,jazz` par **une requete par tag**, puis fusionner et dedupliquer les resultats. Les stations ayant plusieurs des tags selectionnes apparaitront naturellement dans les resultats (deduplication par ID).

## Fichier modifie

`src/pages/SearchPage.tsx`

## Detail technique

### Recherche initiale (lignes 94-123)

Quand `genres.length > 1` :
- Au lieu d'envoyer `tagList: genres.join(",")`, lancer une requete `tag: genre` par genre selectionne (en parallele avec `Promise.all`)
- Fusionner tous les resultats dans une Map par ID (deduplication)
- Si une recherche textuelle (`query`) est aussi active, combiner avec les resultats name/tag existants

Quand `genres.length === 1` : garder le comportement actuel avec `tag: genres[0]` (plus simple et efficace).

Quand `genres.length === 0` : aucun changement.

### Pagination / loadMore (lignes 141-175)

Meme logique : si multi-genres, lancer des requetes paralleles par tag au lieu d'un `tagList` unique.

### Exemple de code

```typescript
// Multi-genre OR search
if (genres.length > 1) {
  const genreSearches = genres.map(g =>
    radioBrowserProvider.searchStations({ ...baseParams, tag: g, tagList: undefined })
  );
  const genreResults = await Promise.all(genreSearches);
  for (const batch of genreResults) {
    for (const s of batch) {
      if (!map.has(s.id)) map.set(s.id, s);
    }
  }
}
```

### Impact

- Plus de resultats pertinents lors de la selection multi-genres
- Les stations ayant les deux tags apparaissent quand meme (elles sont dans les deux resultats)
- Pas de changement pour la recherche mono-genre ou sans genre
- Pas de nouveau fichier, modification uniquement dans SearchPage.tsx

