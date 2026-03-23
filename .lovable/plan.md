

## Fix: Voice Enhancer Son Métallique/Étouffé sur APK Android

### Problème
Les réglages actuels du Voice Enhancer sont beaucoup trop agressifs pour le pipeline audio de la WebView Android :
- **Compresseur ratio 12:1** avec seuil -24dB → écrase complètement la dynamique → son étouffé
- **EQ boost +8dB à 3kHz** → sur-accentuation des hautes fréquences → son métallique
- **Gain de sortie x2** → saturation du DAC Android

Sur desktop Chrome, le pipeline audio est plus tolérant. Sur Android WebView, ces valeurs extrêmes provoquent de la distorsion et des artefacts.

### Solution
Réduire drastiquement les paramètres pour un effet subtil mais efficace :

**`src/services/VoiceEnhancerService.ts`** — `applyEnabledSettings()` :

| Paramètre | Avant | Après | Pourquoi |
|-----------|-------|-------|----------|
| Compressor threshold | -24 dB | -18 dB | Moins de compression, préserve la dynamique |
| Compressor ratio | 12:1 | 4:1 | Compression douce au lieu d'écrasement |
| Compressor knee | 30 | 10 | Transition plus nette, moins de "flou" |
| EQ gain | +8 dB | +4 dB | Clarté vocale sans métallique |
| EQ Q factor | 1 | 1.2 | Bande légèrement plus ciblée |
| Output gain | 2.0 | 1.3 | Compensation légère sans saturation |

Ajout d'un **second filtre high-pass à 85 Hz** pour couper les basses fréquences (bruits de fond, rumble) qui contribuent au son étouffé — très efficace pour la clarté vocale.

### Fichier modifié
- `src/services/VoiceEnhancerService.ts`

