

## Diagnostic des 3 problemes restants

### 1. Crash du playback apres quelques secondes

**Cause** : Le `handleError` dans `PlayerContext.tsx` (ligne 317) tue completement la lecture (`isPlaying: false`, arret heartbeat, toast d'erreur) sans verifier si la source est un `blob:`. Quand le blob commence a un endroit arbitraire du flux (pas sur une frontiere de frame audio), le decodeur peut emettre une erreur transitoire. Le handler tue alors tout, et le player devient inutilisable sans changer de station.

**Fix** : Dans `handleError`, si `audio.src.startsWith('blob:')`, ignorer l'erreur et declencher un retour au live automatique au lieu de tuer la lecture.

### 2. Flux AAC non bufferises / non enregistres

**Cause** : Beaucoup de serveurs AAC/Icecast bloquent les requetes `fetch()` cross-origin (pas de header CORS). Le `startFetch` echoue silencieusement et `bufferAvailable` reste `false`. Le fallback MediaRecorder via `captureStream()` n'est pas disponible dans le WebView Android Capacitor. Resultat : ni buffer, ni enregistrement.

**Fix** : Utiliser un proxy CORS leger. Un service public comme `https://corsproxy.io/?url=` permet de contourner. On tente d'abord le fetch direct, et en cas d'echec on retente via le proxy. Cela permettra de capturer les flux AAC/OGG dans le buffer.

### 3. Volume control — deplacer a droite du player

**Fix** : Transformer le slider volume en slider vertical, positionne a droite du bloc artwork+controles, entre la hauteur du titre et le bouton play.

### Fichiers a modifier

| Fichier | Modification |
|---|---|
| `src/contexts/PlayerContext.tsx` | `handleError` : skip pour `blob:` URLs, emettre un event custom pour que StreamBuffer retourne au live |
| `src/contexts/StreamBufferContext.tsx` | Ecouter l'event d'erreur blob pour auto-return-to-live. Ajouter fallback proxy CORS dans `startFetch`. |
| `src/components/FullScreenPlayer.tsx` | Deplacer le volume en slider vertical a droite du player, borne entre titre et play button |
| `radiosphere_v2_5_0.ps1` | Verifier coherence (pas de changement natif requis) |

### Details techniques

**Proxy CORS** : On tente `fetch(streamUrl)`. Si erreur reseau/CORS, on retente `fetch('https://corsproxy.io/?' + encodeURIComponent(streamUrl))`. Le proxy renvoie les headers `Content-Type` et `icy-metaint` correctement.

**Auto-recovery blob error** : Plutot qu'un event custom, on ajoute un listener `error` sur `globalAudio` dans `StreamBufferContext` qui detecte `blob:` et appelle `returnToLiveInternal()`. Cela evite le couplage entre les deux contextes.

**Volume vertical** : Slider Radix `orientation="vertical"`, hauteur contrainte entre le titre et le play button (~120-160px), positionne en `absolute` a droite du conteneur principal.

