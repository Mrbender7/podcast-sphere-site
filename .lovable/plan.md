

# Harmonisation visuelle du Logo et Typographie

## 1. Correction du fond noir du logo

Le logo PNG a un fond noir (#000) qui tranche avec le fond gris fonce de l'app (~hsl(0,0%,7%)). On va appliquer `mix-blend-mode: screen` sur l'image pour faire disparaitre le noir et ne garder que les elements lumineux (la sphere et le texte).

On ajoutera aussi un effet de lueur (glow) autour du logo avec un `drop-shadow` de la couleur primaire verte.

### Fichiers modifies

**`src/pages/HomePage.tsx`** (ligne 49) :
- Remplacer `className="w-8 h-8 rounded-full"` par `className="w-8 h-8 mix-blend-screen drop-shadow-[0_0_6px_hsl(141,73%,42%)]"`
- Supprimer `rounded-full` (plus necessaire sans fond visible)

**`src/pages/SettingsPage.tsx`** (ligne 11) :
- Meme traitement : `className="w-10 h-10 mix-blend-screen drop-shadow-[0_0_8px_hsl(141,73%,42%)]"`

## 2. Typographie : Poppins pour les titres, Inter pour le texte

**`src/index.css`** :
- Ajouter l'import Google Fonts pour Poppins (poids 600, 700) a cote de l'import Inter existant
- Garder Inter comme police par defaut du body (deja en place)

**`tailwind.config.ts`** :
- Ajouter dans `theme.extend.fontFamily` :
  - `sans: ['Inter', 'sans-serif']`
  - `heading: ['Poppins', 'sans-serif']`

Puis appliquer `font-heading` sur les titres principaux dans :
- **`HomePage.tsx`** : h1 "Radio Sphere", h2 sections
- **`SettingsPage.tsx`** : h1, h2
- **`SearchPage.tsx`** : h1 titre
- **`LibraryPage.tsx`** : h1 titre
- **`PremiumPage.tsx`** : h1, h2
- **`FullScreenPlayer.tsx`** : nom de la station
- **`GenreCard`** dans HomePage : le label du genre

## 3. Uniformisation des couleurs de fond

Le fond est deja uniforme via la variable CSS `--background`. On verifiera que le header n'a pas de background different. Actuellement le header dans HomePage est un simple `div` sans background propre, donc il herite bien du fond de page. Pas de changement necessaire ici.

## Resume des fichiers

| Fichier | Changement |
|---------|-----------|
| `src/index.css` | Ajout import Poppins |
| `tailwind.config.ts` | Ajout fontFamily heading + sans |
| `src/pages/HomePage.tsx` | mix-blend-screen sur logo, font-heading sur titres |
| `src/pages/SettingsPage.tsx` | mix-blend-screen sur logo, font-heading sur titres |
| `src/pages/SearchPage.tsx` | font-heading sur h1 |
| `src/pages/LibraryPage.tsx` | font-heading sur h1 |
| `src/pages/PremiumPage.tsx` | font-heading sur titres |
| `src/components/FullScreenPlayer.tsx` | font-heading sur nom station |

