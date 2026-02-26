

# Script v2.2.9 -- Notification MediaStyle sur ecran de verrouillage

## Probleme
La lecture normale (via WebView) utilise le plugin Capawesome foreground service qui cree une notification standard. Android ne reconnait pas cette notification comme "media" et n'affiche donc pas les controles sur l'ecran de verrouillage.

## Solution
Creer un nouveau fichier `radiosphere_v2_2_9.ps1` qui reprend la base du v2.2.8 et ajoute :

### 1. Nouveau fichier Java : `MediaPlaybackService.java`
Un service Android foreground dedie qui :
- Cree une `MediaSessionCompat` native
- Affiche une notification `MediaStyle` liee a cette session (titre de la station, artwork, boutons Play/Pause)
- Appelle `startForeground()` pour etre visible sur l'ecran de verrouillage et dans le volet de notifications
- Ecoute les actions de notification (Play/Pause) et les renvoie au WebView via un broadcast

Ce service ne joue PAS l'audio lui-meme (c'est le WebView qui le fait). Il sert uniquement de "miroir" pour la notification.

### 2. Modification de `RadioAutoPlugin.java`
La methode `notifyPlaybackState()` existante est modifiee pour :
- Demarrer/arreter le `MediaPlaybackService` quand la lecture commence/s'arrete
- Passer le nom de la station, le logo, et l'etat play/pause au service via un Intent

### 3. Modification du Manifest
- Declarer `MediaPlaybackService` avec `foregroundServiceType="mediaPlayback"`
- Garder le service Capawesome en backup ou le retirer

### 4. Gradle
- Pas de nouvelles dependances (ExoPlayer et media-compat sont deja presents depuis v2.2.8)

### 5. Modification de `MainActivity.java`
- Le canal de notification `radio_playback_v3` existe deja -- on le reutilise

## Architecture du flux

```text
JS (PlayerContext) 
  --> RadioAutoPlugin.notifyPlaybackState(name, logo, isPlaying)
    --> Intent --> MediaPlaybackService
      --> MediaSessionCompat (metadata + playback state)
      --> Notification.Builder + MediaStyle
      --> startForeground()
      --> Lock screen + notification shade = controles media visibles

Bouton Pause sur notification
  --> MediaSession.Callback.onPause()
    --> Broadcast --> WebView JS
      --> PlayerContext pause l'audio
```

## Fichiers crees/modifies dans le script PS1

| Fichier | Action |
|---------|--------|
| `radiosphere_v2_2_9.ps1` | Nouveau script de deploiement |
| `MediaPlaybackService.java` | Nouveau -- service foreground MediaStyle (embarque dans le PS1) |
| `RadioAutoPlugin.java` | Modifie -- lance/arrete le MediaPlaybackService |
| `AndroidManifest.xml` | Modifie -- declare le nouveau service |
| `PlayerContext.tsx` | Modifie -- ecoute le broadcast "toggle" depuis la notification pour pause/play |

## Detail technique du MediaPlaybackService.java

- `onStartCommand()` : recoit l'Intent avec name/logo/isPlaying, met a jour la MediaSession et la notification
- `buildNotification()` : cree une notification avec `Notification.Builder` + `androidx.media.app.NotificationCompat.MediaStyle` + `setMediaSession(token)` + actions Play/Pause
- `MediaSession.Callback` : quand l'utilisateur clique Pause sur la notification, envoie un broadcast `com.radiosphere.TOGGLE_PLAYBACK` que le WebView intercepte

## Ce que le script ne change PAS
- `RadioBrowserService.java` reste intact (Android Auto uniquement)
- Le fonctionnement web normal n'est pas affecte

