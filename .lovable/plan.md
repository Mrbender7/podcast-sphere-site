

## Audit Android Auto — Diagnostic complet

### Cause racine identifiee : `startForeground()` crash silencieux sur Android 14+

Sur Android 14 (API 34) et superieur, appeler `startForeground(id, notification)` **sans specifier le type de service foreground** provoque une `MissingForegroundServiceTypeException` quand le service declare `foregroundServiceType="mediaPlayback"` dans le Manifest.

Le code actuel dans `RadioBrowserService.startAsForeground()` :
```java
startForeground(AUTO_NOTIFICATION_ID, notification);  // CRASH sur API 34+
```

Devrait etre :
```java
if (Build.VERSION.SDK_INT >= 34) {
    startForeground(AUTO_NOTIFICATION_ID, notification,
        android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
} else {
    startForeground(AUTO_NOTIFICATION_ID, notification);
}
```

Le service crash **avant meme de demander l'audio focus**, donc aucun flux ne peut jouer. L'app reste visible dans AA car `onGetRoot`/`onLoadChildren` fonctionnent (pas besoin de foreground pour le browse tree), mais `playStation` echoue systematiquement.

Le meme bug existe dans `MediaPlaybackService.updateSessionAndNotification()`.

### Probleme secondaire : drawable `station_placeholder` absent

Le PS1 ne copie jamais `android-auto/res/drawable/station_placeholder.jpg` dans le projet Android. L'artwork par defaut ne s'affiche pas, mais ce n'est pas bloquant.

### Plan de corrections

**Fichiers a modifier (4 fichiers, meme fix) :**

1. **`android-auto/RadioBrowserService.java`** — methode `startAsForeground()` : ajouter le type foreground service pour API 34+
2. **`android-auto/MediaPlaybackService.java`** — methode `updateSessionAndNotification()` : meme fix
3. **`radiosphere_v2_5_0.ps1`** — mettre a jour les 2 versions inline (RadioBrowserService + MediaPlaybackService) avec le meme fix + ajouter la copie de `station_placeholder.jpg`

**Detail technique du fix pour `startAsForeground` (RadioBrowserService) :**
```java
if (!foregroundStarted) {
    if (Build.VERSION.SDK_INT >= 34) {
        startForeground(AUTO_NOTIFICATION_ID, notification,
            android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
    } else {
        startForeground(AUTO_NOTIFICATION_ID, notification);
    }
    foregroundStarted = true;
} else {
    // Update existing notification
    NotificationManager nm = ...;
    nm.notify(AUTO_NOTIFICATION_ID, notification);
}
```

**Detail technique du fix pour `updateSessionAndNotification` (MediaPlaybackService) :**
```java
if (Build.VERSION.SDK_INT >= 34) {
    startForeground(NOTIFICATION_ID, notification,
        android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
} else {
    startForeground(NOTIFICATION_ID, notification);
}
```

**PS1 — ajout copie station_placeholder :**
```powershell
# Apres la copie de ic_notification.png
$PlaceholderSrc = "android-auto/res/drawable/station_placeholder.jpg"
# ... copie vers android/app/src/main/res/drawable/
```

### Ce qui ne change pas

- Toute la logique browse tree, resolution de flux, ExoPlayer, audio focus, protocol fallback
- Le Manifest, les permissions, les dependances Gradle
- Les fichiers TypeScript/React cote web

