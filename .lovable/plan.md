

## Audit du contenu dynamique

### 1. Images qui ne chargent pas (preview web uniquement)

Toutes les requêtes d'images échouent avec "Failed to fetch" à cause de CORS. C'est **normal dans la preview web** — ces domaines externes (pippa.io, audiomeans.fr, etc.) bloquent les requêtes cross-origin. Dans l'APK Capacitor, `CapacitorHttp` intercepte les `fetch()` et contourne CORS nativement. **Aucune correction nécessaire côté code.**

Le `CachedImage` fonctionne correctement : cache miss → affiche l'URL directe → si `<img>` échoue aussi → placeholder. Le flux est bon.

### 2. Écran de verrouillage — MediaSession

**Problème** : Le code enregistre 4 action handlers en plus de play/pause :
- `seekbackward` (−15s)
- `seekforward` (+30s)  
- `seekto`

Ces handlers font apparaître des boutons supplémentaires sur l'écran de verrouillage Android/iOS. L'utilisateur veut uniquement **play/pause**, comme RadioSphere.

**Correction dans `src/contexts/PlayerContext.tsx`** :

Supprimer les `setActionHandler` pour `seekbackward`, `seekforward` et `seekto` dans le `useEffect` des MediaSession action handlers (lignes ~143-158). Ne conserver que `play` et `pause`. Le cleanup doit aussi être simplifié en conséquence.

Le `updateMediaSession` (metadata : titre, artiste, artwork) reste inchangé — c'est ce qui alimente le contenu dynamique affiché sur l'écran de verrouillage.

### Résumé des changements

| Fichier | Action |
|---|---|
| `src/contexts/PlayerContext.tsx` | Retirer les handlers `seekbackward`, `seekforward`, `seekto` du MediaSession |

Aucun autre fichier n'est impacté.

