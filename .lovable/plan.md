
# Internationalisation (i18n) et Branding "Radio Sphere"

## Vue d'ensemble
Mise en place d'un systeme de traduction FR/EN complet, renommage en "Radio Sphere", ajout d'une page Parametres avec bascule de langue, et creation d'un logo placeholder.

---

## 1. Systeme de traduction (i18n)

### Nouveau fichier : `src/i18n/translations.ts`
Dictionnaire de traductions FR/EN couvrant toute l'interface :

```text
Cles principales :
- nav.home, nav.search, nav.favorites, nav.premium, nav.settings
- home.greeting, home.recentlyPlayed, home.popularStations, home.localPopular, home.exploreByGenre
- search.title, search.placeholder, search.selectCountry, search.clearCountry, search.resetFilters, search.noResults, search.useFilters
- search.genre, search.language
- favorites.title, favorites.empty, favorites.emptyDesc
- premium.title, premium.subtitle, premium.active, premium.noAds, premium.noAdsDesc, premium.hd, premium.hdDesc
- premium.exclusive, premium.exclusiveDesc, premium.monthly, premium.yearly, premium.cancel, premium.disclaimer
- player.nowPlaying, player.streamError, player.streamUnavailable
- settings.title, settings.language, settings.languageDesc
```

### Nouveau fichier : `src/contexts/LanguageContext.tsx`
- Contexte React avec `language` ("fr" | "en"), `setLanguage`, et fonction `t(key)` pour recuperer une traduction
- Persistance dans `localStorage` (cle `radiospher_language`)
- Detection initiale via `navigator.language` (si "fr" -> francais par defaut, sinon anglais)

## 2. Renommage en "Radio Sphere"

- **`index.html`** : Mettre a jour le `<title>`, les meta `og:title`, `description` avec "Radio Sphere"
- **`PremiumContext.tsx`** : Changer les cles localStorage de `radioflow_*` a `radiosphere_*`
- Toutes les references textuelles "RadioFlow" remplacees par "Radio Sphere"

## 3. Logo Placeholder

### Nouveau fichier : `src/components/RadioSphereLogo.tsx`
- Composant SVG minimaliste : une sphere (cercle) avec des arcs representant des ondes radio
- Utilise le gradient primaire de l'app (du vert/emeraude vers le bleu ou selon le theme actuel)
- Props : `size` (default 32) pour adapter la taille
- Utilise dans le header de la page d'accueil et la page parametres

## 4. Page Parametres

### Nouveau fichier : `src/pages/SettingsPage.tsx`
- Titre "Parametres" / "Settings"
- Section "Langue" avec un toggle/select FR/EN
- Affichage du logo Radio Sphere en haut
- Design coherent avec le dark theme existant

### Modification de la navigation
- **`BottomNav.tsx`** : Ajouter un 5e onglet "Parametres" avec icone `Settings` (engrenage)
- **`Index.tsx`** : Ajouter le rendu conditionnel pour `activeTab === "settings"`
- Le type `TabId` inclura `"settings"`

## 5. Engrenage sur la page d'accueil
- **`HomePage.tsx`** : Ajouter une icone engrenage en haut a droite du header, qui switch vers l'onglet settings au clic
- Passer un callback `onSettingsClick` depuis `Index.tsx`

## 6. Integration des traductions dans tous les composants

### Fichiers modifies avec `t()` :
1. **`HomePage.tsx`** : "Bonjour", "Ecoutees recemment", "Stations populaires", "Explorer par genre"
2. **`SearchPage.tsx`** : "Recherche", "Rechercher une station...", "Choisir un pays", "Reinitialiser les filtres", "Aucun resultat", labels Genre/Langue
3. **`LibraryPage.tsx`** : "Favoris", texte vide
4. **`PremiumPage.tsx`** : Tous les textes (titre, features, boutons prix, disclaimer)
5. **`BottomNav.tsx`** : Labels des onglets
6. **`FullScreenPlayer.tsx`** : "En cours de lecture"
7. **`PlayerContext.tsx`** : Messages toast d'erreur (via `t()` ou passage du contexte)
8. **`MiniPlayer.tsx`** : Pas de texte statique visible a traduire (sauf alt text)
9. **`StationCard.tsx`** : Pas de texte statique

## 7. Details techniques

### Ordre d'implementation
1. Creer `src/i18n/translations.ts` (dictionnaire)
2. Creer `src/contexts/LanguageContext.tsx` (contexte + hook `useTranslation`)
3. Creer `src/components/RadioSphereLogo.tsx` (SVG logo)
4. Creer `src/pages/SettingsPage.tsx`
5. Modifier `index.html` (branding)
6. Modifier `src/components/BottomNav.tsx` (ajout onglet settings + traductions)
7. Modifier `src/pages/Index.tsx` (LanguageProvider, onglet settings, callback)
8. Modifier tous les composants pour utiliser `t()`
9. Modifier `src/contexts/PremiumContext.tsx` (cles localStorage)
10. Modifier `src/contexts/PlayerContext.tsx` (messages d'erreur traduits)

### Architecture du contexte
Le `LanguageProvider` sera place au plus haut niveau dans `Index.tsx`, englobant tous les autres providers, pour que `t()` soit disponible partout y compris dans `PlayerContext`.
