
Diagnostic trouvé: le comportement “appareils détectés mais connexion impossible” vient très probablement d’une incohérence d’App ID dans la chaîne de connexion native.

- `android-auto/CastPlugin.java` fait la découverte/choix de route avec `DEFAULT_MEDIA_RECEIVER_APPLICATION_ID` (sélecteur de route).
- `android-auto/CastOptionsProvider.java` lance la session avec l’App ID custom `65257ADB`.
- Résultat possible: la liste d’appareils s’affiche, mais la session Cast ne démarre pas correctement (spinner puis échec silencieux ou sans état clair côté JS).

Je propose une v2.4.7 “stabilisation connexion” avec les étapes suivantes.

## 1) Corriger l’incohérence d’App ID (cause principale)

### Fichier: `android-auto/CastPlugin.java`
- Dans `doInitialize`, remplacer le sélecteur:
  - de `categoryForCast(CastMediaControlIntent.DEFAULT_MEDIA_RECEIVER_APPLICATION_ID)`
  - vers `categoryForCast(CAST_APP_ID)` où `CAST_APP_ID = "65257ADB"`.

Objectif: découverte + sélection + démarrage de session alignés sur le même receiver.

### Fichier: `radiosphere_v2_4_6.ps1`
- Dans le bloc de génération de `CastPlugin.java`, faire la même correction (sinon chaque exécution du script réintroduit le bug).
- Garder `CastOptionsProvider.java` sur `65257ADB` (déjà le cas).

## 2) Rendre l’échec de connexion visible côté frontend (debug fiable)

### Fichier: `android-auto/CastPlugin.java`
- Enrichir `onSessionStartFailed`:
  - conserver `castStateChanged` avec `connected: false`
  - ajouter `errorCode` et `reason` dans l’event (ex: `data.put("errorCode", err)`).
- Ajouter log explicite:
  - `Log.e(TAG, "Session start failed, code=" + err + ", appId=" + CAST_APP_ID);`

### Fichier: `src/hooks/useCast.ts`
- Dans le listener `castStateChanged`, logger aussi `errorCode` s’il existe.
- Si `connected: false` avec erreur, afficher un warning clair en console (et éventuellement toast non bloquant).

Objectif: savoir immédiatement si l’échec vient de session launch (App ID/receiver), pas du flux audio.

## 3) Garder le flux média tel quel (pas de changement risqué inutile)

- Ne pas toucher à `loadMedia` pour l’instant (le problème signalé est “ne se connecte pas”, donc en amont du `rmc.load`).
- Conserver le log `Loading URL to Cast: ...` pour l’étape suivante si la session démarre mais ne joue pas.

## 4) Vérification E2E stricte après patch

1. Regénérer avec script corrigé puis `npx cap sync android`.
2. Ouvrir app Android, cliquer Cast, sélectionner un appareil.
3. Vérifier Logcat (filtre `CastPlugin`) :
   - `Initializing Cast SDK with AppID: 65257ADB`
   - session started OU session start failed + code explicite.
4. Vérifier côté JS (console):
   - `castDevicesAvailable event`
   - `castStateChanged event` avec `connected: true` attendu à la connexion.
5. Lancer une station et confirmer que seul le Chromecast émet le son.

## 5) File list impactée

- `android-auto/CastPlugin.java`
- `src/hooks/useCast.ts`
- `radiosphere_v2_4_6.ps1`

## 6) Plan B contrôlé (si échec persistant)

Faire un test A/B rapide mais cohérent:
- Variante A: `65257ADB` partout (CastPlugin selector + CastOptionsProvider + web).
- Variante B: `CC1AD845` partout (temporaire diagnostic).
Important: ne jamais mélanger les IDs entre selector/session provider.

Ce plan corrige d’abord le point le plus bloquant (mismatch d’App ID), puis améliore la télémétrie pour arrêter de “brûler des crédits” à l’aveugle.
