

## Plan: Filtres langue/catégorie avancés (Accueil + Recherche)

### Problemes identifies

1. **Tendances (accueil)** : le filtre langue commence par "All" au lieu de la langue de l'app
2. **Catégories → Recherche** : le mot-clé est envoyé en anglais (ex. "Music" au lieu de "Musique"), donc peu de résultats dans la langue de l'utilisateur
3. **Recherche** : filtre langue mono-sélection, pas de filtre catégorie, pas de priorité langue app
4. **Accueil** : seulement 14 catégories, "Jeux Vidéos" manquant

---

### 1. Filtre langue Tendances (HomePage)

- Supprimer l'option "All" du `LanguageFilter`
- Initialiser `trendingLang` avec la langue de l'app (`language` du `LanguageContext`)
- Garder le switch entre les autres langues

**Fichiers** : `HomePage.tsx`, `LanguageFilter.tsx` (ajout d'une prop `hideAll`)

### 2. Traduction des catégories pour la recherche

Quand on clique sur une catégorie depuis l'accueil, au lieu d'envoyer `"Music"` (anglais), envoyer la traduction dans la langue de l'app (`t("category.Music")` → `"Musique"`).

**Fichier** : `HomePage.tsx` — modifier `onCategoryClick` pour passer la traduction, ou `Index.tsx` pour traduire avant de passer à `SearchPage`. Plus simple : traduire dans `SearchPage` quand `initialCategory` arrive, en cherchant la traduction correspondante.

Approche retenue : dans `Index.tsx`, le `handleCategoryClick` traduira la catégorie via `t()` avant de la passer comme `selectedCategory`. Ainsi, la recherche se fait dans la langue de l'utilisateur.

### 3. Recherche avancée — Filtres multi-sélection

**Langues (multi-select dropdown)** :
- Remplacer le `LanguageFilter` horizontal par un popover/dropdown avec des checkboxes
- Pré-cocher la langue de l'app par défaut
- Cocher plusieurs langues = filtrage additif (OR) : on affiche les podcasts en FR **ou** EN
- 9 langues : FR, EN, ES, DE, JA, PT, IT, AR, + "Autres"

**Catégories (multi-select dropdown)** :
- Nouveau dropdown avec checkboxes, 26 catégories dont "Video Games" / "Jeux Vidéos"
- Filtrage client-side sur le champ `categories` des résultats (OR entre catégories sélectionnées)
- Possibilité de tout décocher (pas de filtre catégorie)

**Logique de recherche** :
- L'API `/search/byterm` ne supporte pas `lang` → filtrage client-side sur `p.language`
- Filtrage catégorie client-side sur `p.categories` (match partiel insensible à la casse)
- Les résultats sont l'intersection : langue(s) sélectionnée(s) ET catégorie(s) sélectionnée(s)

**Fichiers** : `SearchPage.tsx` (refonte filtres), nouveau composant `MultiSelectFilter.tsx`

### 4. Catégories page d'accueil (+4)

Passer de 14 à 18 catégories. Ajouts obligatoires : **Video Games**. 3 autres suggestions : **Arts**, **Food**, **Travel** (ou Religion, Kids, etc.).

**Fichiers** : `HomePage.tsx` (CATEGORIES array + CATEGORY_COLORS), `translations.ts` (nouvelles clés `category.*` dans les 5 langues)

### 5. Catégories moteur de recherche (26)

Liste de 26 catégories pour les filtres du moteur de recherche (superset des 18 de l'accueil + 8 additionnelles). Toutes traduites dans les 5 langues.

---

### Liste des 26 catégories (recherche)

Technology, Comedy, News, True Crime, Health, Business, Science, Education, Sports, Music, Society, History, Fiction, Horror, **Video Games**, **Arts**, **Food**, **Travel**, **Religion**, **Kids & Family**, **Politics**, **Nature**, **Film & TV**, **Leisure**, **Self-Improvement**, **Relationships**

### Liste des 18 catégories (accueil)

Les 14 actuelles + Video Games, Arts, Food, Travel

---

### Composant MultiSelectFilter

Petit composant réutilisable : bouton avec label + compteur → popover avec liste de checkboxes. Utilisé 2 fois sur SearchPage (langues + catégories).

```text
┌──────────────────────────────────────────┐
│  🔍 [recherche podcast............] [X]  │
│  [🌍 Langues ▾ (2)] [📂 Catégories ▾]   │
│  ─────────────────────────────────────── │
│  12 podcasts trouvés                     │
│  ┌─────────────────────────────────┐     │
│  │ Podcast 1                       │     │
│  │ Podcast 2                       │     │
│  └─────────────────────────────────┘     │
└──────────────────────────────────────────┘
```

### Fichiers impactés

| Fichier | Changement |
|---|---|
| `src/components/MultiSelectFilter.tsx` | Nouveau — dropdown multi-select réutilisable |
| `src/pages/SearchPage.tsx` | Refonte filtres (langues multi, catégories multi) |
| `src/pages/HomePage.tsx` | +4 catégories, init lang = app lang, traduction catégorie au clic |
| `src/pages/Index.tsx` | Traduire catégorie via `t()` avant passage à SearchPage |
| `src/components/LanguageFilter.tsx` | Ajout prop `hideAll` |
| `src/i18n/translations.ts` | +12 nouvelles clés `category.*` × 5 langues + clés UI filtres |
| `src/contexts/LanguageContext.tsx` | Exporter `language` (déjà fait) |

