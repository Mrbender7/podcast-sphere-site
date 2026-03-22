
Objectif: rétablir d’abord une lecture Android stable, puis corriger le play/pause natif sans réintroduire les crashs.

Do I know what the issue is? Oui, probablement en grande partie.
Le problème semble venir de 3 causes couplées :

1. La lecture HTML5 peut échouer ou rester en attente, mais le nettoyage n’est pas complet dans `PlayerContext.tsx`.
Quand un flux démarre mal, l’état React repasse partiellement à faux, mais la boucle silencieuse, le WakeLock, l’état natif et la session peuvent rester incohérents. C’est typiquement ce qui peut laisser l’app “bloquée” puis difficile à rouvrir.

2. Le bridge natif Android est encore trop agressif.
`PodcastAutoPlugin.java` démarre le service avec `startForegroundService(...)` pour toutes les mises à jour, y compris les updates de position/pause. Sur Android récents, ça peut provoquer un comportement instable si le service n’entre pas rapidement en foreground ou si on le relance trop souvent.

3. Le play/pause notification/lock screen n’est pas fiable car le service utilise un toggle générique.
Dans `PodcastBrowserService.java`, le bouton principal envoie `ACTION_PLAY_PAUSE`. Pour un pilotage stable du lecteur React, il vaut mieux envoyer une action explicite selon l’état courant: `ACTION_PLAY` quand c’est en pause, `ACTION_PAUSE` quand ça joue. Comme tu ne veux pas next/previous, on peut aussi simplifier la notification autour de ce seul contrôle.

Plan de correction

1. Sécuriser totalement le cycle d’échec de lecture dans `src/contexts/PlayerContext.tsx`
- Ajouter un vrai helper de rollback sur erreur:
  - `audio.pause()`
  - remettre `isPlaying=false`, `isBuffering=false`
  - arrêter `startSilentLoop`
  - libérer `WakeLock`
  - remettre la MediaSession web sur `paused`
  - notifier le natif en pause si nécessaire
- Utiliser ce helper dans:
  - `onError`
  - le `catch` de `play()`
  - le `catch` de `resumePlayback()`
- Éviter les courses entre plusieurs taps rapides sur des épisodes:
  - introduire un identifiant de requête / garde anti-concurrence pour ignorer les anciens `playWithTimeout()` terminés en retard.

2. Réduire le bridge Android au strict nécessaire dans `android-auto/PodcastAutoPlugin.java`
- Garder `updateNowPlaying` et `updatePlaybackState`, mais rendre le démarrage du service plus sûr:
  - `startForegroundService(...)` seulement quand on passe en lecture active
  - `startService(...)` pour metadata, pause et updates périodiques de position
- Ajouter des garde-fous/logs autour des exceptions de démarrage de service Android 13-15.
- Ne jamais laisser un appel natif faire échouer l’expérience React.

3. Simplifier et fiabiliser `android-auto/PodcastBrowserService.java`
- Remplacer le bouton notification dynamique pour envoyer:
  - `ACTION_PAUSE` si `isPlaying=true`
  - `ACTION_PLAY` si `isPlaying=false`
- Supprimer les actions `next/previous` de la notification compacte puisque tu n’en as pas besoin.
- Garder la notification publique lock screen, mais avec une seule action centrale vraiment fiable.
- Unifier le canal de notification avec le reste du projet:
  - éviter `podcast_playback_v2`
  - revenir à `podcast_playback`
  - importance par défaut
- Vérifier que le service reconstruit toujours une notification minimale valide avant toute opération potentiellement lente.

4. Réaligner le script Android de génération
- Vérifier dans `podcastsphere_v1_0_0.ps1` que:
  - le canal créé est bien `podcast_playback`
  - importance = `IMPORTANCE_DEFAULT`
  - les fichiers `android-auto/*.java` restent la source de vérité copiée dans le projet Android local

5. Validation prévue après correction
- Cas 1: épisode qui démarre normalement → lecture OK
- Cas 2: épisode lent / invalide → toast d’erreur, mais app toujours utilisable
- Cas 3: relance de l’app après échec → pas d’écran noir
- Cas 4: bouton play/pause notification → pilote bien le lecteur React
- Cas 5: lock screen → état lecture/pause cohérent

Fichiers à modifier
- `src/contexts/PlayerContext.tsx`
- `android-auto/PodcastAutoPlugin.java`
- `android-auto/PodcastBrowserService.java`
- `podcastsphere_v1_0_0.ps1`

Détail technique
```text
React HTML5 Audio
   ↓ succès uniquement
safeNativeCall(updateNowPlaying / updatePlaybackState)
   ↓
PodcastAutoPlugin.java
   ↓ démarrage service plus sélectif
PodcastBrowserService.java
   ↓
Notification / lock screen / Bluetooth
   ↓
retour via mediaCommand
   ↓
PlayerContext.tsx
```

Résultat attendu
- plus de plantage quand un épisode ne démarre pas
- plus de service Android relancé inutilement
- play/pause natif fiable
- notification simplifiée et cohérente avec ton besoin réel
