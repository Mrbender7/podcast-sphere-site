

# v2.4.7 — Alignement total sur le recepteur par defaut Google (CC1AD845)

Le probleme est confirme : le `CastOptionsProvider` utilise `65257ADB` (custom) tandis que le `mediaRouteSelector` alternait entre l'ID par defaut et le custom selon les versions. Cette incoherence empeche le SDK Cast de demarrer une session apres la decouverte.

La solution : tout aligner sur `DEFAULT_MEDIA_RECEIVER_APPLICATION_ID` (`CC1AD845`), le recepteur universel de Google, qui est le plus stable et ne necessite aucune configuration cote Google Cast Console.

---

## Changements prevus

### 1. `android-auto/CastOptionsProvider.java`
- Remplacer `"65257ADB"` par `CastMediaControlIntent.DEFAULT_MEDIA_RECEIVER_APPLICATION_ID`
- Ajouter l'import `CastMediaControlIntent` correspondant

### 2. `android-auto/CastPlugin.java`
- Changer la constante `CAST_APP_ID` de `"65257ADB"` vers `CastMediaControlIntent.DEFAULT_MEDIA_RECEIVER_APPLICATION_ID`
- Dans `doInitialize`, utiliser `DEFAULT_MEDIA_RECEIVER_APPLICATION_ID` pour le `mediaRouteSelector`
- Ajouter `Log.d(TAG, "CastContext status: " + (castContext != null))` dans `doInitialize`
- Modifier `hasDiscoveryPermissions()` pour Android 13+ : exiger `NEARBY_WIFI_DEVICES` **ET** `ACCESS_FINE_LOCATION` (les deux sont necessaires pour mDNS)
- Garder `contentType("audio/*")` dans `loadMedia` pour compatibilite maximale

### 3. `src/hooks/useCast.ts`
- Changer `CAST_APP_ID` de `"65257ADB"` vers `"CC1AD845"`
- Le `loadMedia` reste inchange (envoie l'URL sans modification)

### 4. `radiosphere_v2_4_6.ps1` → `radiosphere_v2_4_7.ps1`
- Renommer le script
- Mettre a jour le Java embarque dans le script avec les memes corrections :
  - `CAST_APP_ID = CastMediaControlIntent.DEFAULT_MEDIA_RECEIVER_APPLICATION_ID`
  - `hasPerms()` : `nearby && fine` sur API 33+
  - `contentType("audio/*")` dans `loadMedia`
- Verifier que le Manifest contient `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` et `NEARBY_WIFI_DEVICES`

---

## Details techniques

### Pourquoi CC1AD845 ?
- C'est l'ID par defaut de Google, toujours disponible, pas besoin d'enregistrer un receiver
- Ce matin ca marchait avec cet ID → on y revient de maniere coherente partout
- Le custom receiver (65257ADB) necessite une configuration specifique sur la Google Cast Console qui peut expirer ou etre mal configuree

### Pourquoi NEARBY_WIFI_DEVICES ET ACCESS_FINE_LOCATION ?
Le Cast SDK sur Android 13+ utilise mDNS pour la decouverte. Google exige les deux permissions simultanement pour que le scan fonctionne de maniere fiable.

### Fichiers impactes
- `android-auto/CastOptionsProvider.java`
- `android-auto/CastPlugin.java`
- `src/hooks/useCast.ts`
- `radiosphere_v2_4_6.ps1` → renomme en `radiosphere_v2_4_7.ps1`

