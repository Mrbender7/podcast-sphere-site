

# Plan v2.2.7b — Correction recherche par tags + scroll-to-top repositionne

## Probleme 1 : La recherche par tags ne fonctionne pas correctement

**Diagnostic** : J'ai audite le code ET la documentation officielle de l'API Radio Browser. Voici ce que j'ai trouve :

L'API Radio Browser a deux parametres distincts pour les tags :
- `tag` : cherche les stations dont un tag **contient** le terme (recherche partielle)
- `tagList` : liste de tags separes par des virgules, tous doivent correspondre (filtrage exact)

**Le bug** : Actuellement, le code utilise `tag` a la fois pour les **filtres de genre** (jazz, rock, etc.) ET pour la **recherche textuelle** par tag. Quand l'utilisateur tape "disney" dans la barre de recherche :
- L'appel "name search" envoie `name=disney` + `tag=jazz` (si un genre est selectionne) — correct
- L'appel "tag search" envoie `tag=disney` — mais **ecrase** le filtre de genre

De plus, le `loadMore` ne fait qu'une seule requete par `name`, il ne cherche PAS par tag du tout. Donc les pages suivantes ne contiennent jamais les resultats par tag.

**Solution** :
1. Utiliser `tagList` pour les filtres de genre (au lieu de `tag`) — ils ne se chevauchent plus avec la recherche textuelle
2. Ajouter `tagList` au type `SearchParams` et au `RadioService.ts`
3. Dans le `loadMore`, faire aussi la double recherche (name + tag) comme dans la requete principale

## Probleme 2 : Le bouton scroll-to-top chevauche le MiniPlayer

Le bouton est positionne a `bottom-24` (6rem = 96px). Le MiniPlayer + la barre de navigation occupent environ 140-160px en bas. Il faut remonter le bouton a `bottom-40` (10rem = 160px) pour eviter le chevauchement.

---

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/types/radio.ts` | Ajouter `tagList?: string` a `SearchParams` |
| `src/services/RadioService.ts` | Envoyer `tagList` comme parametre API si present |
| `src/pages/SearchPage.tsx` | Utiliser `tagList` pour les genres, `tag` pour la recherche textuelle ; corriger `loadMore` pour aussi chercher par tag ; remonter le bouton scroll-to-top |

## Detail technique

### 1. `src/types/radio.ts`
Ajouter le champ `tagList` a l'interface `SearchParams` :
```
tagList?: string;   // comma-separated, exact tag matching (for genre filters)
```

### 2. `src/services/RadioService.ts`
Dans `searchStations`, ajouter :
```
if (params.tagList) query.tagList = params.tagList;
```

### 3. `src/pages/SearchPage.tsx`

**baseParams** : remplacer `tag: genres.join(",")` par `tagList: genres.join(",")` pour que les filtres de genre utilisent le bon parametre API.

**queryFn (recherche principale)** : Quand `query` est present, les deux appels paralleles deviennent :
- Appel 1 (name) : `{ ...baseParams, name: query }` — cherche par nom, filtre genre via `tagList`
- Appel 2 (tag) : `{ ...baseParams, tag: query }` — cherche par tag "disney", filtre genre via `tagList`

**loadMore** : Reproduire la meme logique de double recherche (name + tag) avec deduplication pour que les pages suivantes soient coherentes.

**Bouton scroll-to-top** : Changer `bottom-24` en `bottom-40` pour passer au-dessus du MiniPlayer.

