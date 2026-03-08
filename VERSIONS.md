# Podcast Sphere — Historique des versions

---

## v1.0.0 — 8 mars 2026 — *Première release*

**Statut :** En préparation  
**Package :** `com.fhm.podcastsphere`  
**Plateforme :** Android (Capacitor)

### Résumé

Podcast Sphere est une application de podcasts qui permet de découvrir, écouter et gérer des milliers de podcasts du monde entier via l'API Podcast Index. L'app propose une expérience immersive avec un lecteur plein écran, la gestion des favoris, un historique d'écoute, et des fonctionnalités premium comme le Sleep Timer.

### Fonctionnalités

#### Core
- 🎙️ Découverte et lecture de podcasts (API Podcast Index)
- 🔍 Recherche avancée par nom, catégorie, langue
- ❤️ Favoris avec stockage local persistant
- 🕐 Historique des podcasts récemment écoutés
- 🌍 Interface multilingue (FR, EN, ES, DE, JA)
- 🎨 Thème sombre natif
- 🏠 Page d'accueil avec tendances, catégories, récents et favoris

#### Lecteur
- MiniPlayer avec défilement marquee
- FullScreenPlayer avec visualiseur audio
- Contrôle du volume
- Indicateur de buffering en temps réel
- Partage de podcast

#### Premium
- 💤 Sleep Timer (15 min à 2h, décompte temps réel)
- 📖 Mode d'emploi intégré (UserGuideModal)

#### Android natif
- Notification MediaStyle (contrôles play/pause)
- Foreground Service pour lecture en arrière-plan
- Bouton retour natif avec dialogue de confirmation de sortie

### Technologies

| Catégorie | Technologie |
|-----------|-------------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| UI | Tailwind CSS 3 + shadcn/ui + Radix UI |
| État | React Context (Player, Favorites, Language, Premium, SleepTimer) |
| Cache API | TanStack React Query 5 |
| Routing | React Router DOM 6 |
| Natif | Capacitor 8 (Android) |
| Icônes | Lucide React + Iconify |
| Animations | CSS Keyframes + Audio Visualizer canvas |

---

*Les versions suivantes seront documentées ici au fil des mises à jour.*
