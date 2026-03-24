

## Audit identité du site podcast.radiosphere.be

### Problemes identifies

| Element | Statut | Probleme |
|---------|--------|----------|
| Favicon (onglet navigateur) | OK partiel | `favicon.png` + `.ico` existent, mais pas de lien vers les tailles 16/32 ni le `.ico` dans le HTML |
| Apple Touch Icon | OK | Present dans public/ et reference dans HTML |
| Web App Manifest | MANQUANT | Aucun `manifest.json` / `site.webmanifest` — pas d'icone si "Ajouter a l'ecran d'accueil" |
| OG Image (partage reseaux) | PROBLEME | Pointe vers un screenshot Lovable temporaire (R2 CDN), pas une image maitrisee |
| OG URL | MANQUANT | Pas de `og:url` — les reseaux sociaux ne canonicalisent pas correctement |
| Canonical URL | MANQUANT | Pas de `<link rel="canonical">` — mauvais pour le SEO |
| OG title/description | OK mais generique | "Podcast Sphere — Podcasts" — pourrait etre plus accrocheur |
| Twitter Card | OK | `summary_large_image` present |
| Cast SDK script | INUTILE pour le site web | Le script Chromecast est charge inutilement — a supprimer pour le site |
| Sitemap | MANQUANT | Pas de `sitemap.xml` |
| Robots.txt | OK | Bien configure |
| `og:site_name` | MANQUANT | Utile pour Facebook/LinkedIn |
| Favicon multi-tailles | PARTIEL | Les fichiers existent dans public/ mais ne sont pas references dans le HTML |

### Plan de corrections

#### 1. Corriger `index.html` — meta tags complets
- Ajouter liens favicon multi-tailles (16x16, 32x32, .ico)
- Ajouter `<link rel="canonical" href="https://podcast.radiosphere.be/">`
- Ajouter `<meta property="og:url" content="https://podcast.radiosphere.be/">`
- Ajouter `<meta property="og:site_name" content="Podcast Sphere">`
- Remplacer l'OG image par le logo ou une image de marque hebergee dans `public/` (ex: `https://podcast.radiosphere.be/og-image.png`)
- Supprimer le script Cast SDK (inutile pour le site web)

#### 2. Creer `public/site.webmanifest`
```json
{
  "name": "Podcast Sphere",
  "short_name": "Podcast Sphere",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#111111",
  "background_color": "#111111",
  "display": "standalone",
  "start_url": "/"
}
```
Ajouter `<link rel="manifest" href="/site.webmanifest">` dans le HTML.

#### 3. Creer une image OG dediee (`public/og-image.png`)
Generer une image 1200x630 avec le logo Podcast Sphere + baseline "Podcasts du monde entier" sur fond sombre, a placer dans `public/`. Cela remplacera le screenshot Lovable temporaire.

#### 4. Creer `public/sitemap.xml`
Sitemap minimal avec l'URL unique `https://podcast.radiosphere.be/`.

#### 5. Mettre a jour `robots.txt`
Ajouter la reference au sitemap : `Sitemap: https://podcast.radiosphere.be/sitemap.xml`

### Fichiers modifies

| Fichier | Action |
|---------|--------|
| `index.html` | Ajout favicons multi-tailles, manifest, canonical, og:url, og:site_name, nouvelle OG image, suppression Cast SDK |
| `public/site.webmanifest` | Creation |
| `public/og-image.png` | Creation (image generee 1200x630) |
| `public/sitemap.xml` | Creation |
| `public/robots.txt` | Ajout ligne Sitemap |

