
Objectif
Rendre Chromecast fiable partout (Chrome + APK Android), garantir que l’icône est toujours visible (même en cas d’échec SDK), et corriger la détection/synchronisation de session en temps réel.

Diagnostic confirmé (après audit code + logs)
- Le problème n’est pas l’emplacement du bouton: il est bien présent dans HomePage et FullScreenPlayer.
- Les logs montrent actuellement: “[RadioSphere][Cast] Non-Chromium browser — fallback mode” dans l’environnement utilisateur capturé.
- Cause majeure côté web: `useCast.ts` force `castUiMode="launcher"` dès qu’il pense être Chromium, mais si le SDK Cast ne devient pas prêt (callback manqué, script bloqué, iframe, etc.), le code reste en launcher et n’active jamais un vrai fallback visuel => zone vide possible.
- Cause majeure côté launcher UI: `<google-cast-launcher>` peut être invisible/masqué selon état SDK/devices; aujourd’hui il n’y a pas de fallback visuel robuste quand il ne s’affiche pas.
- Cause probable côté APK natif: le repo web contient `android-auto/*` (templates), mais pas le projet `android/` réel. Le plugin natif Cast peut ne pas être correctement branché dans MainActivity/Manifest/Gradle du projet Android compilé, ce qui expliquerait “rien ne marche sur APK”.
- Point technique supplémentaire: la détection native repose sur `window.Capacitor` + verrou `sdkLoadedRef` “one shot”; si la détection initiale est mauvaise au premier rendu, on peut rester bloqué dans le mauvais mode.

Do I know what the issue is?
Oui: il y a un mélange de 1) mode launcher non dégradé vers fallback, 2) dépendance à un custom element qui peut rester invisible, et 3) probable câblage natif incomplet côté projet Android compilé.

Plan de correction (implémentation)
1) Refaire la machine d’état Cast dans `src/hooks/useCast.ts`
- Remplacer la logique actuelle par une init plus robuste, orientée “capability-first”:
  - Détection native via `Capacitor.isNativePlatform()` / `Capacitor.getPlatform()` (au lieu de dépendre uniquement de `window.Capacitor`).
  - Côté web, ne pas se baser uniquement sur UA pour décider de l’UI finale.
- Ajouter des états explicites:
  - `castUiMode`: `native | launcher | fallback`
  - `castInitState`: `idle | initializing | ready | unavailable | error`
  - `castErrorReason` (optionnel, pour debug/tooltip)
- Initialisation web robuste:
  - Définir un init idempotent `initWebCastContext()` (une seule fois).
  - Gérer 3 entrées: SDK déjà présent, callback `__onGCastApiAvailable`, timeout de sécurité.
  - Si timeout / framework absent => basculer explicitement en `fallback` (pas juste logger).
- Nettoyage propre:
  - Retirer listeners CastContext en cleanup.
  - Éviter les doubles listeners en dev (HMR/StrictMode).
- Résultat attendu:
  - Plus de “launcher vide bloqué”.
  - Si SDK indisponible, l’app repasse visuellement en fallback clair.

2) Solidifier l’UI du bouton dans `src/components/CastButton.tsx`
- Garder l’approche 3 modes, mais garantir “icône toujours visible”:
  - `native`: bouton Lucide Cast (action `startCast/stopCast`).
  - `launcher`: afficher `<google-cast-launcher>` + fallback visuel Lucide si launcher non prêt/non visible.
  - `fallback`: bouton désactivé informatif (tooltip/toast).
- Ajouter un fallback visuel dans le mode launcher:
  - Si SDK non prêt ou `customElements.get('google-cast-launcher')` absent, afficher l’icône Lucide à la place.
- Appliquer un style explicite au launcher (variables de couleur Cast) pour éviter une icône “invisible sur fond sombre”.
- Conserver accessibilité (aria-label cohérents, état casting visible).

3) Renforcer la synchro player/cast dans `src/contexts/PlayerContext.tsx`
- Garder l’auto-push de média quand `isCasting && currentStation`.
- Éviter les doubles `loadMedia`:
  - introduire un guard (ex: `lastCastStationIdRef`) pour ne pas recharger inutilement la même station.
- Vérifier cohérence play/pause:
  - quand `togglePlay` en cast actif, laisser remote control prioritaire et éviter des effets de bord.
- Option UX: toast discret sur connexion/déconnexion Cast (selon état session), utile en debug utilisateur.

4) Fiabiliser l’amorce SDK dans `index.html`
- Conserver le script officiel Cast Sender.
- Ajouter un petit “bridge” d’initialisation avant/avec le script pour éviter les pertes de callback précoces:
  - capturer disponibilité Cast dans un flag global + event custom.
  - `useCast` écoute ce signal en plus de `window.cast?.framework`.
- Objectif: réduire fortement les cas de race condition.

5) Corriger le parcours natif Android (templates + instructions) dans `android-auto/*`
- Mettre à jour les fichiers guide/snippets pour imposer clairement:
  - dépendances Gradle Cast (`play-services-cast-framework`, `mediarouter`),
  - meta-data Manifest `OPTIONS_PROVIDER_CLASS_NAME`,
  - enregistrement plugin dans `MainActivity` (`registerPlugin(CastPlugin.class|::class.java)` + `RadioAutoPlugin`).
- Vérifier cohérence package Java/Kotlin (`com.radiosphere.app` vs package réel app).
- Ajuster `CastPlugin.java`:
  - retirer l’appel non standard `startSession(...)` actuel,
  - s’appuyer sur le flux officiel MediaRouter/Cast dialog (best practice SDK).
- Important: ce repo n’embarque pas le dossier `android/` final compilé; la correction native devra être réappliquée/synchronisée dans le projet Android réel.

6) Messages i18n dans `src/i18n/translations.ts`
- Ajouter des clés de statut plus précises:
  - `cast.sdkUnavailable`
  - `cast.noDevicesFound`
  - `cast.nativeNotConfigured`
- Les utiliser dans tooltip/toasts pour expliquer exactement pourquoi le cast n’est pas disponible.

Séquence d’exécution recommandée
1. Rework `useCast.ts` (états + init + fallback explicite).
2. Mettre à jour `CastButton.tsx` (icône toujours visible).
3. Ajuster `PlayerContext.tsx` (sync propre, anti-doublons).
4. Ajouter bridge minimal `index.html`.
5. Mettre à jour i18n.
6. Mettre à jour templates/doc Android (`android-auto/*`) pour sécuriser l’APK.

Validation (critères d’acceptation)
- Chrome desktop (hors iframe Lovable):
  - Icône visible immédiatement.
  - Clic ouvre sélecteur Cast.
  - Connexion met à jour `isCasting` + device name.
- Navigateur non supporté:
  - Icône visible (fallback), jamais “disparue”.
  - Message explicite “ouvrir dans Chrome / utiliser app Android”.
- APK Android:
  - Icône native visible sur accueil + fullscreen.
  - `startCast()` ouvre correctement le picker.
  - `castStateChanged` reflète l’état réel.
- Robustesse:
  - Si SDK web ne charge pas: bascule fallback automatique (pas de launcher fantôme).

Risques / points d’attention
- Le preview iframe Lovable peut limiter Cast discovery; valider aussi via URL publiée et Chrome desktop normal.
- App ID Cast non publiée: seuls appareils autorisés en test détectables (capture console Cast reçue: app non publiée + device test présent).
- Après merge des changements natifs: faire `git pull` puis `npx cap sync` avant rebuild APK Android.
