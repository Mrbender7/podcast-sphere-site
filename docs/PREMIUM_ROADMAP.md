# RadioSphere — Premium Roadmap

## Modèle de tarification

### Achat unique (One-Shot) — **Premium Lifetime**
- **Prix** : 9,99€ (achat unique, accès à vie)
- Débloque toutes les fonctionnalités premium actuelles et futures (basées sur Radio Browser)
- Pas d'abonnement, pas de renouvellement

### Abonnement (futur, si changement d'API)
- Envisagé uniquement si migration vers une API radio premium (contenu exclusif, qualité supérieure)
- Formule mensuelle / annuelle à définir
- Justifié par les coûts récurrents de l'API premium

---

## Fonctionnalités Premium (4)

### 1. 💤 Sleep Timer (Minuterie)
- **Statut** : ✅ Terminé
- **Description** : Minuterie d'arrêt automatique avec options prédéfinies (15 min, 30 min, 45 min, 1h, 1h30, 2h). Affichage du décompte en temps réel dans les réglages. Pause automatique de la lecture à expiration
- **Fichiers concernés** : `src/contexts/SleepTimerContext.tsx`, `src/pages/SettingsPage.tsx`

### 2. 🎙️ Enregistrement & Time-shift (Magnéto)
- **Statut** : ✅ Terminé (v2.5.0)
- **Description** : Buffer circulaire de 5 minutes permettant de remonter dans le temps (scrub-back) sur le flux en cours. Enregistrement de segments jusqu'à 10 minutes, exportés en MP3 sur le téléphone ou partagés. Animation cassette rétro pendant l'enregistrement.
- **Fichiers concernés** : `src/contexts/StreamBufferContext.tsx`, `src/components/CassetteAnimation.tsx`, `src/components/FullScreenPlayer.tsx`

### 3. 🚗 Android Auto
- **Statut** : ✅ Terminé (v2.5.2)
- **Description** : Intégration complète Android Auto avec browse tree (Favoris, Récents, Genres), recherche vocale, lecture native ExoPlayer, artwork plein écran, navigation next/previous dans les favoris
- **Fichiers concernés** : `src/plugins/RadioAutoPlugin.ts`, `android-auto/*`, `src/contexts/FavoritesContext.tsx`, `src/contexts/PlayerContext.tsx`

### 4. 📺 Chromecast
- **Statut** : ✅ Terminé (v2.5.0)
- **Description** : Diffusion du flux audio sur Chromecast, Android TV ou tout appareil compatible Google Cast. Bouton Cast intégré dans le player, receiver custom.
- **Fichiers concernés** : `src/hooks/useCast.ts`, `src/components/CastButton.tsx`, `public/cast-receiver.html`, `android-auto/CastPlugin.java`, `android-auto/CastOptionsProvider.java`

---

## Fonctionnalités gratuites (base)

- 📖 **Mode d'emploi intégré** : Guide utilisateur accessible depuis les réglages, modal avec sections accordéon. Bilingue FR/EN.

---

## Fonctionnalités Premium futures (idées)

### 🎨 Thèmes personnalisés
- Choix de thèmes de couleurs (dark, amoled, blue, warm, etc.)

### 📻 Qualité audio HD
- Priorisation des flux haute qualité (320 kbps)
- Indicateur de qualité dans le player

### 🔇 Sans publicité
- Suppression de toute publicité future dans l'app

### 📊 Statistiques d'écoute
- Temps d'écoute par jour/semaine/mois
- Stations les plus écoutées, genres préférés

### 📂 Collections personnalisées
- Créer des collections thématiques dans les favoris (ex: "Chill", "Workout", "Jazz du soir")
- Glisser-déposer des stations entre collections

### 🌐 API Premium (nécessite abonnement)
- Accès à des contenus exclusifs via une API radio premium
- Ce cas justifierait le passage à un modèle d'abonnement

---

## Notes techniques

- Le flag premium est géré via `src/contexts/PremiumContext.tsx`
- **Période de test Google Play** : `isPremium` est initialisé à `true` (full access)
- À remplacer par un vrai système de paiement (Stripe one-shot 9,99€) en production
- Pour activer le paywall : changer le default à `false` dans `PremiumContext.tsx` + intégrer Stripe
- Toutes les fonctionnalités premium vérifient `isPremium` avant activation
