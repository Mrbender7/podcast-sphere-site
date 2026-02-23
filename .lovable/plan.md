

# Ajout du tri des resultats de recherche

## Situation actuelle

Les resultats sont toujours tries par popularite (votes, decroissant). L'API Radio Browser supporte le parametre `order` avec plusieurs valeurs possibles : `name`, `votes`, `clickcount`, `bitrate`, `country`, `language`.

## Solution proposee

Ajouter un selecteur de tri compact sur la page de recherche, juste au-dessus des resultats, permettant de choisir entre :

- **Popularite** (votes, par defaut -- comportement actuel)
- **A-Z** (name, ordre alphabetique croissant)
- **Clicks** (clickcount, les plus ecoutes recemment)

## Modifications

### 1. `src/services/RadioService.ts`

Rendre les parametres `order` et `reverse` dynamiques dans `searchStations` en les acceptant via `SearchParams`.

### 2. `src/types/radio.ts`

Ajouter `order` et `reverse` optionnels a l'interface `SearchParams`.

### 3. `src/pages/SearchPage.tsx`

- Ajouter un etat `sortBy` (valeur par defaut : `"votes"`).
- Afficher un petit groupe de boutons/badges cliquables (Popularite | A-Z | Clicks) au-dessus de la liste de resultats.
- Passer `order` et `reverse` dans les appels de recherche (query initiale et load more).
- Inclure `sortBy` dans la queryKey de react-query pour declencher une nouvelle requete quand le tri change.
- Reinitialiser les extra results quand le tri change.

### 4. `src/i18n/translations.ts`

Ajouter les traductions pour les labels de tri (FR/EN).

## Details techniques

Le tri se fait cote API (pas cote client) pour garantir la coherence avec la pagination "load more". Quand l'utilisateur change le tri, la requete repart a offset 0 avec le nouvel ordre.

Pour le tri alphabetique : `order: "name"`, `reverse: "false"`.
Pour la popularite : `order: "votes"`, `reverse: "true"`.
Pour les clicks : `order: "clickcount"`, `reverse: "true"`.

