

# Animations SVG neon par genre

## Objectif
Remplacer les icones Iconify statiques des cartes de genre (HomePage) par des animations SVG inline "lignes de neon" utilisant le degradé bleu electrique (#00d2ff) vers violet (#9d50bb). Chaque genre aura une animation unique positionnée en haut a droite de la carte, integree dans le fond.

## Architecture

### 1. Nouveau composant : `src/components/GenreAnimations.tsx`
Un fichier unique contenant une fonction `GenreAnimation({ genre }: { genre: string })` qui retourne le SVG animé correspondant au genre. Chaque SVG :
- Dimensions : ~80x80, positionné en `absolute top-1 right-1`
- Style : `stroke` uniquement (pas de fill), avec `linearGradient` #00d2ff -> #9d50bb
- Opacité globale ~0.35-0.5 pour s'integrer dans le fond sans distraire
- Animations CSS via `<animate>` / `<animateTransform>` SVG natifs (leger, pas de JS)

### 2. Animations par genre (24 genres couverts)

| Genre | Animation SVG |
|-------|--------------|
| 60s | Fleur peace & love dont les petales pulsent |
| 70s | Disque vinyle qui tourne lentement |
| 80s | Lignes neon zigzag qui scintillent |
| 90s | Equalizer (barres qui montent/descendent) |
| ambient | Cercles concentriques qui pulsent doucement |
| blues | Guitare acoustique avec cordes qui vibrent |
| chillout | Vague sinusoidale fluide |
| classical | Cle de sol avec note qui pulse |
| country | Banjo/guitare avec cordes vibrantes |
| electronic | Circuit/pulsation electrique |
| funk | Ligne de basse ondulante |
| hiphop | Micro avec ondes sonores |
| jazz | Saxophone avec notes flottantes |
| latin | Maracas avec mouvement de secousse |
| metal | Eclair/foudre pulsant |
| news | Ondes radio classiques |
| pop | Etoile dont les branches scintillent |
| r&b | Coeur avec pulsation rythmique |
| reggae | Onde sonore relaxante |
| rock | Guitare electrique avec eclairs |
| soul | Flamme qui ondule |
| techno | Forme d'onde geometrique |
| trance | Spirale hypnotique |
| world | Globe avec lignes meridiennes |

### 3. Modification de `GenreCard` dans `HomePage.tsx`
- Retirer l'icone `<Icon>` d'Iconify
- Importer et placer `<GenreAnimation genre={genre} />` en position absolue top-right
- Garder le meme layout (texte en bas a gauche, animation en haut a droite integree dans le fond)

### 4. Modification de `SearchPage.tsx` (optionnel, memes genres)
- La SearchPage utilise des Badges pour les genres, pas de cartes visuelles -- pas de modification necessaire ici.

## Details techniques

- Toutes les animations utilisent `<animate>`, `<animateTransform>` SVG natifs (zero JS, zero librairie)
- Un seul `<linearGradient>` defini par SVG, reutilise par les strokes
- `stroke-linecap="round"` et `stroke-width` entre 1.5 et 2.5 pour l'effet neon
- `filter: drop-shadow(0 0 3px #00d2ff)` en CSS pour l'effet lumineux neon
- Fichier unique ~400-500 lignes avec un switch/map pour chaque genre

## Fichiers modifies
1. **Creer** `src/components/GenreAnimations.tsx` -- toutes les animations SVG
2. **Modifier** `src/pages/HomePage.tsx` -- remplacer Icon par GenreAnimation dans GenreCard

