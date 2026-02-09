

# Application de Streaming Radio — "RadioFlow"

## Vue d'ensemble
Application mobile-first de streaming radio avec un design premium dark mode inspiré de Spotify, prête pour conversion Android via Capacitor.

---

## 1. Design System & Thème
- Thème **dark mode par défaut** avec palette sombre (tons de gris/noir avec accents colorés type vert ou violet)
- Suppression des scrollbars natives, utilisation de zones de scroll internes
- Interface plein écran type application native (pas de "look website")

## 2. Navigation & Layout
- **Barre de navigation fixe en bas** avec 4 onglets : Accueil, Recherche, Bibliothèque, Premium
- **Mini Player persistant** au-dessus de la barre de navigation quand une radio joue (artwork, nom, bouton play/pause)
- **Player plein écran** accessible en cliquant sur le Mini Player (artwork large, contrôles, infos de la station)
- Zone de contenu scrollable entre le header et le mini player/navbar

## 3. Page Accueil
- Section "Écoutées récemment" (basée sur localStorage)
- Section "Stations populaires" (depuis Radio Browser API)
- Section "Par genre" avec des cartes visuelles pour explorer les genres musicaux
- Cards de radio avec logo, nom et pays

## 4. Page Recherche
- **Barre de recherche** textuelle en haut
- **Filtres visuels en chips/pillules** : Pays, Genre musical, Langue
- Résultats affichés en liste avec possibilité de lancer la lecture directement
- Les filtres sont combinables

## 5. Page Bibliothèque (Favoris)
- Liste des radios favorites sauvegardées en **localStorage**
- Possibilité d'ajouter/retirer des favoris depuis n'importe quelle vue (icône cœur)
- Message d'état vide si aucun favori

## 6. Page Premium
- Présentation visuelle des avantages premium (sans pub, haute qualité audio, accès exclusif)
- Faux boutons d'achat (mensuel/annuel) non fonctionnels pour l'instant
- Design attractif type page marketing in-app

## 7. Service Radio (Architecture)
- **RadioService.ts** avec interface `RadioProvider` extensible
- Implémentation **Radio Browser API** avec gestion des miroirs (de1, fr1, at1) — bascule automatique si un serveur échoue
- Données normalisées : nom, URL du flux, logo, pays, tags/genre
- Intégration via **TanStack React Query** pour le cache et la gestion d'état

## 8. Lecteur Audio
- Gestion audio HTML5 robuste (MP3 et AAC)
- Gestion des erreurs de flux avec notifications **Toast** discrètes
- Contexte React global pour l'état du player (station en cours, play/pause, volume)

## 9. Préparation Capacitor
- Configuration de Capacitor pour export Android
- Structure et meta tags optimisés pour le mobile natif

