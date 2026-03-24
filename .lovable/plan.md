

## SSG (pré-rendu statique) pour podcast.radiosphere.be

### Contexte

L'app est une SPA avec une seule route `/` (navigation par onglets internes). Le pré-rendu concerne donc principalement la page d'accueil pour que le HTML contienne le contenu textuel et les meta SEO au lieu d'un `<div id="root"></div>` vide.

### Différences avec radiosphere.be

- Output dir reste `dist` (pas `docs`) car le déploiement se fait via GitHub Actions
- Une seule route réelle (`/`) — le `404.html` est une copie du `index.html`
- Base path = `/` (sous-domaine, pas un sous-dossier)

### Plan d'implémentation

#### 1. Installer les dépendances
- `vite-react-ssg` pour le pré-rendu React
- `react-helmet-async` pour les meta tags par page

#### 2. Adapter `src/main.tsx`
Remplacer le `createRoot` direct par l'export `ViteReactSSG` qui gère :
- Le rendu serveur (génération HTML statique au build)
- L'hydratation côté client (réactivité React après chargement)

#### 3. Adapter `src/App.tsx`
- Wraper l'app dans `HelmetProvider`
- Exporter les `routeRecords` au format attendu par vite-react-ssg (tableau `[{ path: '/', element: <Index /> }]`)
- Ajouter un `<Helmet>` avec title + meta description unique

#### 4. Mettre à jour `vite.config.ts`
- Ajouter le plugin SSG avec la liste des routes à pré-rendre : `['/']`
- Garder `outDir: 'dist'` et `base: '/'`

#### 5. Mettre à jour `package.json`
- Changer le script `build` : `vite build` → `vite-react-ssg build`

#### 6. Mettre à jour `.github/workflows/deploy.yml`
- Le `cp dist/index.html dist/404.html` reste identique
- Le sitemap est déjà dans `public/` donc copié automatiquement

#### 7. Ajouter `<Helmet>` dans la page Index
```text
<title>Podcast Sphere — Podcasts du monde entier</title>
<meta name="description" content="Découvrez et écoutez des milliers de podcasts..." />
```

### Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `package.json` | Ajout deps, modification script build |
| `src/main.tsx` | Adaptation pour vite-react-ssg |
| `src/App.tsx` | HelmetProvider + routeRecords export |
| `vite.config.ts` | Config plugin SSG |
| `src/pages/Index.tsx` | Ajout Helmet meta tags |

### Ce qui ne change PAS
- Logique métier, composants UI, player, favoris, contexts
- Structure de routage interne (onglets)
- Dossier de sortie `dist` et workflow GitHub Actions
- CNAME et configuration domaine

