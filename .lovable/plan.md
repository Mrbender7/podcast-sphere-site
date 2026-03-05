

## Plan : Buffer 5 min + Enregistrement "Cassette" + Seek-back

### Résumé

Ajouter un buffer circulaire de 5 minutes qui capture le flux audio en parallèle, permettant de remonter dans le temps (scrub-back) et d'enregistrer des segments jusqu'à 10 minutes. Animation cassette rétro pendant l'enregistrement. Fonctionnalité Premium.

### Architecture

```text
StreamBufferContext (fetch parallèle du stream)
  ├── Buffer circulaire ~5 min de chunks horodatés
  ├── startRecording() / stopRecording() → concat chunks → Blob .mp3
  ├── seekBack(seconds) → Blob URL → Audio.src
  └── returnToLive() → remet Audio.src sur le stream live

FullScreenPlayer
  ├── Timeline scrub bar (-5:00 → LIVE)
  ├── Bouton REC (cercle rouge / carré stop) + compteur
  └── CassetteAnimation (remplace AudioVisualizer pendant REC)
```

### Fichiers à créer

**`src/contexts/StreamBufferContext.tsx`**
- Nouveau contexte qui wrape le PlayerProvider
- Quand `currentStation` change et `isPlaying` : ouvre un `fetch()` sur `streamUrl` avec `ReadableStream`, stocke les chunks dans un tableau circulaire (max ~5 min basé sur bitrate estimé, ~4.7 MB à 128 kbps)
- Attend 3s avant de commencer à stocker (skip données parasites de connexion)
- Vide le buffer au changement de station ou à l'arrêt
- Le fetch continue en parallèle même pendant le seek-back
- Expose : `bufferSeconds`, `isRecording`, `recordingDuration`, `startRecording()`, `stopRecording()` (retourne Blob + nom fichier), `seekBack(seconds)`, `returnToLive()`, `isLive`, `canSeekBack`
- Limite d'enregistrement : 10 minutes max, auto-stop avec toast
- Nom fichier : `RadioSphere_NomStation_2026-03-05_14h32.mp3`
- Export via Capacitor Filesystem (save) + Capacitor Share (partage)
- Format : sauvegarde directe des octets bruts du flux (la grande majorité des radios diffusent en MP3, donc le fichier est lisible tel quel par tout lecteur). Pas de transcodage dans cette v1 — on note le codec dans les métadonnées pour info

**`src/components/CassetteAnimation.tsx`**
- Animation CSS pure de cassette audio rétro
- Deux bobines qui tournent (vitesse proportionnelle : gauche ralentit, droite accélère avec le temps)
- Bande magnétique entre les bobines
- Style rétro : couleurs chaudes sur fond sombre, bords arrondis, effet plastique
- Compteur de durée d'enregistrement intégré sous la cassette
- Remplace l'AudioVisualizer dans le FullScreenPlayer quand `isRecording === true`

### Fichiers à modifier

**`src/components/FullScreenPlayer.tsx`**
- Importer `StreamBufferContext` et `CassetteAnimation`
- Ajouter la **timeline scrub bar** entre le play button et le volume slider :
  - Slider de `-bufferSeconds` à `0` (LIVE)
  - Label "LIVE" à droite, animé (pulse) quand en direct, grisé quand en différé
  - Bouton "Retour au direct" quand pas en live
- Ajouter le **bouton REC** à côté du bouton play :
  - Cercle rouge quand inactif, carré stop quand actif
  - Compteur durée à côté pendant l'enregistrement
  - Vérifie `isPremium` avant d'activer
- Remplacer `AudioVisualizer` par `CassetteAnimation` quand `isRecording`
- Après stop recording : modal/sheet avec options "Sauvegarder sur le téléphone" et "Partager"

**`src/contexts/PlayerContext.tsx`**
- Exposer `streamUrl` de la station courante dans le contexte (déjà accessible via `currentStation.streamUrl`)
- Aucune modification majeure nécessaire — le buffer fetch en parallèle, indépendamment du `<audio>` existant

**`src/pages/Index.tsx`**
- Wrapper `AppContentInner` avec `StreamBufferProvider`

**`src/i18n/translations.ts`**
- Ajouter les clés pour les 5 langues : `player.live`, `player.recording`, `player.recordingStarted`, `player.recordingStopped`, `player.recordingMaxReached`, `player.saveRecording`, `player.shareRecording`, `player.seekBack`, `player.returnToLive`, `player.recordPremiumOnly`, `player.fileSaved`

**`src/index.css`**
- Keyframes pour la rotation des bobines de cassette
- Animation pulse pour le badge LIVE
- Animation clignotement point rouge REC

**`docs/PREMIUM_ROADMAP.md`**
- Ajouter la feature "Enregistrement & Time-shift" dans les fonctionnalités Premium

### Considérations techniques

- **CORS** : `fetch()` sur les streams radio peut être bloqué en navigateur web classique, mais fonctionne dans le WebView Capacitor Android. Dans le preview web Lovable, le buffer ne fonctionnera probablement pas (CORS) — on gère gracieusement avec un try/catch et on désactive les contrôles si le buffer n'est pas disponible
- **Mémoire** : 5 min à 128 kbps ≈ 4.7 MB, 10 min recording ≈ 9.4 MB — parfaitement gérable
- **Seek-back** : on crée un `Blob` à partir des chunks du buffer, on génère un `URL.createObjectURL()`, on le pousse dans l'élément Audio. Le fetch parallèle continue d'alimenter le buffer pendant ce temps
- **Retour au live** : on remet `audio.src` sur le `streamUrl` original

### Ordre d'implémentation

1. `StreamBufferContext` (cœur du système)
2. `CassetteAnimation` (composant visuel indépendant)
3. Modifications `FullScreenPlayer` (UI scrub + REC + cassette)
4. Wrapper dans `Index.tsx`
5. Traductions i18n
6. CSS animations
7. Mise à jour roadmap Premium

