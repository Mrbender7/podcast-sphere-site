# Podcast Sphere — Premium Roadmap

## Modèle de tarification

### Achat unique (One-Shot) — **Premium Lifetime**
- **Prix** : 9,99€ (achat unique, accès à vie)
- Débloque toutes les fonctionnalités premium actuelles et futures
- Pas d'abonnement, pas de renouvellement

---

## Fonctionnalités Premium

### 1. 💤 Sleep Timer (Minuterie)
- **Statut** : ✅ Terminé
- **Description** : Minuterie d'arrêt automatique avec options prédéfinies (15 min à 2h). Décompte en temps réel. Pause automatique à expiration.
- **Fichiers concernés** : `src/contexts/SleepTimerContext.tsx`, `src/pages/SettingsPage.tsx`

---

## Fonctionnalités gratuites (base)

- 📖 **Mode d'emploi intégré** : Guide utilisateur accessible depuis les réglages, modal avec sections accordéon. Multilingue.

---

## Fonctionnalités Premium futures (idées)

### 🎨 Thèmes personnalisés
- Choix de thèmes de couleurs (dark, amoled, blue, warm, etc.)

### 🔇 Sans publicité
- Suppression de toute publicité future dans l'app

### 📊 Statistiques d'écoute
- Temps d'écoute par jour/semaine/mois
- Podcasts les plus écoutés, catégories préférées

### 📂 Playlists personnalisées
- Créer des playlists thématiques dans les favoris
- Organiser par catégories personnalisées

---

## Notes techniques

- Le flag premium est géré via `src/contexts/PremiumContext.tsx`
- Toutes les fonctionnalités premium vérifient `isPremium` avant activation
