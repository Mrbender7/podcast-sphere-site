
# Safe Area Header + Audio Background Persistence

## 1. Safe Area padding (Android/iOS status bar)

Ajouter un `padding-top` sur le conteneur principal de chaque page pour respecter la barre d'etat systeme.

**`src/index.css`** : Ajouter une variable CSS et un style global sur `#root` ou le body :
```css
body {
  padding-top: env(safe-area-inset-top, 24px);
}
```

Alternativement, appliquer le padding directement sur les headers des pages. Approche choisie : **ajouter le padding sur le conteneur principal dans `Index.tsx`** (le div `flex flex-col h-full`) pour que toutes les pages en beneficient automatiquement.

**Fichier modifie : `src/pages/Index.tsx`**
- Ajouter `pt-[env(safe-area-inset-top,24px)]` ou un style inline `paddingTop: 'env(safe-area-inset-top, 24px)'` sur le div racine.

**Fichier modifie : `src/index.css`**
- Ajouter `viewport-fit=cover` dans le meta viewport de `index.html` pour activer les safe areas.

**Fichier modifie : `index.html`**
- Mettre a jour la balise meta viewport : `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">`

## 2. Audio en arriere-plan (Web Policy)

Le navigateur peut mettre en pause l'audio quand l'onglet perd le focus. On va :

**Fichier modifie : `src/contexts/PlayerContext.tsx`**

### 2a. Empecher la pause au blur
- Ecouter `visibilitychange` sur le document. Si l'audio etait en lecture et que la page perd le focus, ne rien faire (ne pas interrompre). Si le navigateur a mis en pause automatiquement, relancer `audio.play()`.

### 2b. WakeLock API
- Lors du `play()`, demander un WakeLock via `navigator.wakeLock.request('screen')` si disponible.
- Relacher le WakeLock lors du `pause` ou du cleanup.
- Re-acquerir le WakeLock sur `visibilitychange` quand la page redevient visible et que l'audio joue.

### 2c. Console log AudioContext
- Ajouter un `console.log("[RadioSphere] Audio ready")` apres la premiere interaction utilisateur (dans la fonction `play`).

### Code prevu dans PlayerContext.tsx :

```text
Ajouts :
- useRef pour wakeLockRef (WakeLockSentinel | null)
- useEffect pour visibilitychange listener :
  - si document.visibilityState === 'visible' et isPlaying : audio.play(), re-acquerir wakeLock
- Dans play() : requestWakeLock(), console.log
- Dans togglePlay() pause : releaseWakeLock()
- Dans cleanup : releaseWakeLock(), remove visibilitychange listener
```

## Resume des fichiers

| Fichier | Changement |
|---------|-----------|
| `index.html` | viewport-fit=cover |
| `src/pages/Index.tsx` | padding-top safe-area sur le conteneur racine |
| `src/contexts/PlayerContext.tsx` | visibilitychange handler, WakeLock, console.log audio |
