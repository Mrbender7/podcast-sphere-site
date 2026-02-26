

# Plan v2.2.8b — Fix bouton Play/Pause notification + layout

## Probleme 1 : Le bouton Play/Pause de la notification ne fonctionne pas

**Diagnostic** : Dans `PlayerContext.tsx` (ligne 216), l'enregistrement du listener `buttonClicked` du plugin Foreground Service est a l'interieur d'un `useEffect` qui commence par :

```
if (!('mediaSession' in navigator)) return;
```

Si `mediaSession` n'est pas disponible dans le WebView Capacitor Android, **tout le bloc est ignore**, y compris le listener `buttonClicked` qui n'a rien a voir avec MediaSession. Le listener n'est donc jamais enregistre, et les clics sur le bouton de la notification sont perdus.

**Correction** : Separer le listener `buttonClicked` du foreground service dans son propre `useEffect`, sans aucune condition sur `mediaSession`. Cela garantit que le listener est toujours enregistre sur Android, independamment du support MediaSession.

## Probleme 2 : Position du bouton dans la notification

Les notifications Android ont un layout systeme impose. Le plugin `@capawesome/capacitor-android-foreground-service` ajoute les `buttons` comme des "action buttons" Android standard, qui sont **toujours affiches sous le contenu** de la notification. Il n'est pas possible de les placer a droite du titre depuis ce plugin.

**Alternative** : Pour avoir des controles inline (a cote du titre, comme Spotify), il faudrait une notification de type `MediaStyle` liee a un `MediaSession` natif. Cela necessite du code Java/Kotlin natif dans le projet Android (pas faisable depuis le JS seul). C'est une evolution future possible mais hors scope de ce correctif.

Pour l'instant, le bouton restera en position standard (sous le titre) mais **fonctionnera correctement** apres la correction.

---

## Fichier modifie

| Fichier | Modification |
|---------|-------------|
| `src/contexts/PlayerContext.tsx` | Extraire le listener `buttonClicked` dans un `useEffect` separe, sans guard `mediaSession` |

## Detail technique

### PlayerContext.tsx — Nouveau useEffect dedie

Creer un second `useEffect` qui :
1. Importe `ForegroundService` depuis `@capawesome-team/capacitor-android-foreground-service`
2. Enregistre le listener `buttonClicked`
3. Appelle `handlePlay` (btnId === 1) ou `handlePause` (btnId === 2)
4. Nettoie le listener au unmount

Les fonctions `handlePlay` et `handlePause` seront extraites en `useCallback` reutilisables par les deux effects (MediaSession + ForegroundService).

