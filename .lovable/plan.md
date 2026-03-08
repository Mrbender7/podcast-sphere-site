

# Plan : Téléchargement d'épisodes — Version corrigée

## Corrections appliquées

1. **Lecture locale** : utilisation de `Capacitor.convertFileSrc(uri)` avant injection dans `<audio>`, pas le résultat brut de `Filesystem.getUri()`
2. **Permissions** : pas de `MANAGE_EXTERNAL_STORAGE`. Uniquement `READ/WRITE_EXTERNAL_STORAGE` (maxSdk 32) + `READ_MEDIA_AUDIO` (Android 13+). Stockage via `Directory.Data` (interne) et `Directory.External` (externe partagé)
3. **Script PS1** : remplacement complet par le script fourni par l'utilisateur

## Fichiers à créer

### 1. `src/services/DownloadService.ts`
- `downloadEpisode(episode)` : télécharge via `Filesystem.downloadFile()` dans le répertoire choisi (`Directory.Data` ou `Directory.External`)
- `isDownloaded(id)`, `getDownloadedEpisodes()`, `deleteDownload(id)`, `getLocalFilePath(id)`
- Métadonnées stockées dans localStorage (`ps_downloads`)
- Lit la destination depuis `localStorage.getItem("ps_download_dest")` (`"internal"` | `"sd"`)
- Sur le web (non-Capacitor), fallback avec `<a download>` via fetch + blob

### 2. `src/contexts/DownloadContext.tsx`
- Context React pour exposer l'état des téléchargements (en cours, terminés) et les fonctions du service
- Permet aux composants de réagir aux changements sans prop drilling

## Fichiers à modifier

### 3. `src/components/EpisodeRow.tsx`
- Ajouter un bouton download (icône `Download` / `CheckCircle` si téléchargé / `Loader2` si en cours)
- Appel à `downloadEpisode()`, toast de confirmation/erreur

### 4. `src/components/FullScreenPlayer.tsx`
- Ajouter un bouton download à côté de Share

### 5. `src/contexts/PlayerContext.tsx`
- Dans `play()`, avant de charger l'audio, vérifier `isDownloaded(episode.id)`
- Si oui : `Filesystem.getUri()` → `Capacitor.convertFileSrc(uri)` → injecter dans `audio.src`
- Sinon : comportement actuel (stream)

### 6. `src/pages/SettingsPage.tsx`
- Nouvelle `CollapsibleSection` avec icône `HardDrive` : "Destination de téléchargement"
- Select : "Stockage interne" / "Stockage externe (SD)"
- Sauvegarde dans `localStorage("ps_download_dest")`

### 7. `src/pages/LibraryPage.tsx`
- Nouvelle section "Téléchargements" avec liste des épisodes téléchargés
- Bouton suppression par épisode

### 8. `src/utils/permissions.ts`
- Ajouter demande de permissions stockage via Capacitor Filesystem (qui gère les permissions automatiquement sur Android 13+)

### 9. `src/i18n/translations.ts`
- Clés pour les 5 langues : download, downloaded, downloading, delete_download, storage_destination, internal_storage, external_storage, downloads, no_downloads

### 10. `podcastsphere_v1_0_0.ps1`
- Remplacement complet par le script fourni par l'utilisateur (injection permissions READ/WRITE_EXTERNAL_STORAGE maxSdk 32, READ_MEDIA_AUDIO, INTERNET + cap sync)

## Ordre d'implémentation

1. Script PS1 + permissions.ts
2. DownloadService + DownloadContext
3. Traductions i18n
4. UI : EpisodeRow, FullScreenPlayer (boutons download)
5. SettingsPage (destination)
6. LibraryPage (section téléchargements)
7. PlayerContext (lecture locale avec convertFileSrc)

