

# Fix du son de notification persistant

## Diagnostic

Le canal de notification `radio_silent` a ete cree avec `importance: 3` (DEFAULT). Sur Android, ce niveau peut produire un son selon les parametres du telephone. De plus, **Android met en cache les canaux** : meme si on modifie l'importance dans le code, l'ancien canal reste actif tant que l'app n'est pas desinstallee.

## Solution

Deux modifications dans `src/contexts/PlayerContext.tsx` :

### 1. Changer l'ID du canal

Renommer `radio_silent` en `radio_playback_v2` pour forcer Android a creer un nouveau canal avec les bons parametres (l'ancien sera ignore).

### 2. Baisser l'importance a LOW (valeur 2)

Le niveau LOW (2) garantit qu'aucun son ni vibration ne sera emis, tout en gardant la notification visible dans la barre et sur l'ecran de verrouillage.

## Detail technique

Fichier : `src/contexts/PlayerContext.tsx`

- Ligne 7 : changer `NOTIFICATION_CHANNEL_ID` de `'radio_silent'` a `'radio_playback_v2'`
- Ligne 17 : changer `importance: 3` a `importance: 2`
- Ligne 16 : ajouter `description: 'Notification silencieuse pour la lecture radio'`

Aucun autre fichier n'est impacte. Apres le build, il faudra idealement desinstaller l'ancienne APK avant d'installer la nouvelle pour que l'ancien canal soit supprime, mais le nouveau canal fonctionnera correctement meme sans desinstallation.
