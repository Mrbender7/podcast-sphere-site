

# Plan v2.2.6 — Corrections Android Auto + MiniPlayer + Nettoyage iOS

## 1. Android Auto : Audio Focus (couper les autres apps)

**Probleme** : Quand on lance une station sur Android Auto, Spotify (ou autre) continue de jouer en simultane.

**Solution** : Dans `RadioBrowserService.java`, demander l'**AudioFocus** avant de lancer la lecture. Android coupe automatiquement les autres apps audio quand on obtient le focus. Ajouter aussi la gestion de la perte de focus (pause si une autre app prend le dessus).

Modifications dans le script `radiosphere_v2_2_5.ps1` (here-string `RadioBrowserService.java`) :
- Importer `android.media.AudioManager` et `android.media.AudioFocusRequest`
- Dans `playStation()`, appeler `AudioManager.requestAudioFocus()` avant `player.play()`
- Ajouter un `OnAudioFocusChangeListener` qui met en pause si le focus est perdu
- Mettre a jour aussi le fichier de reference `android-auto/RadioBrowserService.java`

## 2. Android Auto : Navigation Previous/Next fonctionne sur les favoris

**Probleme** : Les boutons Next/Previous ne naviguent pas correctement dans les favoris.

**Solution** : Quand on clique sur une station depuis les Favoris ou Recents, `currentStations` est deja peuple correctement par `onLoadChildren`. Le code de `onSkipToNext` / `onSkipToPrevious` utilise deja `currentStations`. Le probleme potentiel est que `currentStations` est ecrase par d'autres appels. On va s'assurer que la liste est preservee correctement en ajoutant un champ `currentListId` pour tracker quel "dossier" est actif.

## 3. Android Auto : Recherche par mot-cle

**Probleme** : La recherche vocale (`onPlayFromSearch`) et la recherche textuelle (`onSearch`) sont deja implementees dans le service. Cependant, pour la recherche textuelle via l'interface Android Auto, il faut declarer les actions `SEARCH` correctement.

**Solution** : Le code actuel supporte deja `onSearch` et `onPlayFromSearch`. Verifier que `ACTION_PLAY_FROM_SEARCH` est bien dans les actions du `PlaybackStateCompat` (c'est le cas). La recherche devrait deja fonctionner via la commande vocale "Ok Google, cherche [mot-cle] sur Radio Sphere".

## 4. MiniPlayer : Bouton Play/Pause dans la barre des taches (notification Android)

**Probleme** : Le MiniPlayer dans la notification n'a pas de bouton Play/Pause fonctionnel.

**Solution** : Modifier la notification du foreground service dans `PlayerContext.tsx` pour ajouter des **actions de notification** (boutons Play/Pause). Le plugin `@capawesome-team/capacitor-android-foreground-service` supporte les `buttons` dans la notification via le champ `buttons` de `startForegroundService`.

Modifications dans `src/contexts/PlayerContext.tsx` :
- Ajouter des boutons `Play` et `Pause` dans `startNativeForegroundService()` et `updateNativeForegroundService()`
- Ecouter les clics sur ces boutons via `ForegroundService.addListener('buttonClicked')`
- Mettre a jour l'etat du player en consequence

## 5. Nettoyage : Supprimer toute reference iOS

**Probleme** : Le code ne doit jamais cibler iOS (pas d'iPhone, pas de Mac, pas de Xcode).

**Resultat de l'audit** : Bonne nouvelle, le code est deja propre. Aucune dependance `@capacitor/ios` n'est installee, aucun import iOS dans le code source. Le seul point est le fichier `capacitor.config.json` genere par le script qui ne contient aucune reference iOS. Il n'y a rien a nettoyer.

---

## Resume technique des fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `radiosphere_v2_2_5.ps1` | Ajouter AudioFocus dans le here-string RadioBrowserService.java, ajouter boutons notification dans le here-string |
| `android-auto/RadioBrowserService.java` | Fichier de reference : ajouter AudioFocus + AudioFocusChangeListener |
| `src/contexts/PlayerContext.tsx` | Ajouter boutons Play/Pause dans la notification foreground + listener buttonClicked |

## Points non modifies (deja fonctionnels)

- Browse tree : Favoris, Recents, Genres — deja present
- Recherche vocale via `onPlayFromSearch` — deja present
- Recherche textuelle via `onSearch` — deja present
- Navigation Next/Previous dans `currentStations` — deja present
- Aucune reference iOS a supprimer — code deja propre

