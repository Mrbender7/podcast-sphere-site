

# Audit complet : Lecture audio en arriere-plan sur Android

## Diagnostic

Toutes les strategies implementees jusqu'ici (silent audio loop, heartbeat, WakeLock, MediaSession) sont des astuces JavaScript qui s'executent **dans la WebView**. Le probleme fondamental est qu'Android tue le processus WebView entier quand l'app passe en arriere-plan, car il ne detecte aucun **Foreground Service** natif.

Sans Foreground Service Android, le systeme considere l'app comme inactive et la suspend pour economiser la batterie. C'est pourquoi seule la desactivation manuelle de l'optimisation batterie fonctionne.

## La vraie solution : Foreground Service Android

Il faut utiliser le plugin `@capawesome-team/capacitor-android-foreground-service` qui cree un service natif Android de type `mediaPlayback`. Ce service :

- Empeche Android de tuer le processus (meme avec l'optimisation batterie activee)
- Affiche une notification persistante dans la barre de notification (le mini-player que tu cherches)
- Apparait aussi sur l'ecran de verrouillage via la MediaSession API (deja configuree)

## Plan d'implementation

### Etape 1 : Installer le plugin

Ajouter `@capawesome-team/capacitor-android-foreground-service` comme dependance du projet.

### Etape 2 : Modifier PlayerContext.tsx

Creer deux fonctions utilitaires :

- `startForegroundService(station)` : Demarre le Foreground Service Android avec le titre de la station et l'icone. Le `serviceType` sera `mediaPlayback` (valeur `2`).
- `stopForegroundService()` : Arrete le service quand l'utilisateur met en pause.

Integrer ces fonctions dans le flux existant :

| Fonction existante | Modification |
|---|---|
| `play()` | Appeler `startForegroundService(station)` apres le demarrage de la lecture |
| `togglePlay()` (pause) | Appeler `stopForegroundService()` |
| `togglePlay()` (resume) | Appeler `startForegroundService(station)` |
| MediaSession `handlePause` | Appeler `stopForegroundService()` |
| MediaSession `handlePlay` | Appeler `startForegroundService(station)` |
| `handleError` | Appeler `stopForegroundService()` |

### Etape 3 : Garder les strategies existantes comme filets de securite

Les mecanismes actuels (silent loop, heartbeat, WakeLock) restent en place comme couche de protection supplementaire, mais le Foreground Service sera la protection principale.

### Ce qui se passe cote natif (instructions manuelles post-build)

Apres `npx cap sync`, ajouter dans `android/app/src/main/AndroidManifest.xml` :

```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
```

Ces permissions sont requises par Android 14+ pour les services de type mediaPlayback.

---

## Resume des changements Lovable

| Fichier | Action |
|---|---|
| `package.json` | Ajout dependance `@capawesome-team/capacitor-android-foreground-service` |
| `src/contexts/PlayerContext.tsx` | Integration du Foreground Service dans play/pause/error |

## Instructions manuelles post-build

1. `npx cap sync`
2. Ajouter `FOREGROUND_SERVICE` et `FOREGROUND_SERVICE_MEDIA_PLAYBACK` dans `AndroidManifest.xml`
3. Ajouter `BLUETOOTH_CONNECT` dans `AndroidManifest.xml` (rappel precedent)
4. Configurer `MIXED_CONTENT_ALWAYS_ALLOW` dans `MainActivity.java` (rappel precedent)

## Resultat attendu

- La lecture continue en arriere-plan sans desactiver l'optimisation batterie
- Une notification persistante avec le nom de la station apparait dans la barre de notifications
- Les controles play/pause fonctionnent depuis la notification et l'ecran de verrouillage
- La MediaSession (deja configuree) affiche les metadonnees sur l'ecran de verrouillage

