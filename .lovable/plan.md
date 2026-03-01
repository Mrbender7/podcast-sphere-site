

# Audit Android Auto v2.4.7 — Deux problemes identifies

## Probleme 1 : Deux "Radio Sphere" dans le lanceur Android Auto

**Cause racine identifiee** : Le Manifest declare DEUX services avec le meme intent-filter `android.media.browse.MediaBrowserService` :

```text
Service 1: RadioBrowserService     → Le vrai service AA (ExoPlayer, browse tree)
Service 2: MediaPlaybackService    → Service de notification lock screen (PAS un MediaBrowserService)
```

`MediaPlaybackService` etend `Service` (pas `MediaBrowserServiceCompat`), donc Android Auto le detecte comme source media mais ne peut pas l'interroger → ecran noir qui tourne a vide.

**Correction** : Retirer l'intent-filter `android.media.browse.MediaBrowserService` de `MediaPlaybackService`. Il doit rester un simple foreground service sans visibilite Android Auto.

### Fichiers impactes :
- `android-auto/AndroidManifest-snippet.xml` (lignes 62-70)
- `radiosphere_v2_4_7.ps1` (lignes 190-198)
- `android-auto/MediaPlaybackService.java` (pas de changement Java necessaire, juste Manifest)

### Avant :
```xml
<service android:name=".MediaPlaybackService"
    android:exported="true"
    android:foregroundServiceType="mediaPlayback">
    <intent-filter>
        <action android:name="android.media.browse.MediaBrowserService" />
    </intent-filter>
</service>
```

### Apres :
```xml
<service android:name=".MediaPlaybackService"
    android:exported="false"
    android:foregroundServiceType="mediaPlayback" />
```

---

## Probleme 2 : Conflit de MediaSession (cause potentielle de flux non lus)

Les deux services creent une `MediaSessionCompat` avec le **meme tag** `"RadioSphereSession"`. Quand les deux services tournent simultanement, le systeme Android peut confondre les sessions, ce qui provoque :
- Des commandes play/pause envoyees au mauvais service
- Des etats de lecture incoherents
- Des flux qui semblent "ne pas jouer" car le mauvais service recoit les commandes

**Correction** : Changer le tag MediaSession de `MediaPlaybackService` en `"RadioSphereNotif"` pour le differencier.

### Fichiers impactes :
- `android-auto/MediaPlaybackService.java` (ligne 53)
- `radiosphere_v2_4_7.ps1` (bloc MediaPlaybackService embeded)

---

## Probleme 3 (verifie OK) : HTTP/HTTPS des flux

L'audit confirme que la configuration reseau est correcte :
- `network_security_config.xml` autorise le cleartext (`cleartextTrafficPermitted="true"`)
- `usesCleartextTraffic="true"` est injecte dans le Manifest
- `resolveStreamUrl` suit les redirects et parse m3u/pls correctement
- `tryProtocolFallback` bascule HTTP↔HTTPS apres 10s de buffering
- ExoPlayer recoit l'URL resolue sans forcer HTTPS

**Conclusion** : Les flux HTTP devraient fonctionner. Si certains ne jouent toujours pas apres correction des problemes 1 et 2, c'est probablement le conflit de MediaSession qui envoyait les commandes au mauvais service.

---

## Resume des changements

### 1. `android-auto/AndroidManifest-snippet.xml`
- Retirer l'intent-filter `MediaBrowserService` de `MediaPlaybackService`
- Passer `exported="false"` (pas besoin d'etre expose)
- Simplifier en tag auto-fermant

### 2. `android-auto/MediaPlaybackService.java`
- Changer le tag MediaSession de `"RadioSphereSession"` a `"RadioSphereNotif"`

### 3. `radiosphere_v2_4_7.ps1`
- Meme correction du Manifest (retirer intent-filter de MediaPlaybackService)
- Meme correction du tag MediaSession dans le Java embarque

### 4. Aucun changement cote frontend (`useCast.ts`, `PlayerContext`, etc.)

---

## Verification apres patch

1. Regenerer avec le script PS1 corrige
2. `npx cap sync android` puis build
3. Verifier dans Android Auto : **une seule entree** "Radio Sphere"
4. Ouvrir → Favoris/Recents/Genres doivent s'afficher
5. Lancer une station HTTP et une station HTTPS → les deux doivent jouer

