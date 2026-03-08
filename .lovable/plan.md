

# Plan : Nouveau PS1 Podcast Sphere + Nettoyage complet "Radio Sphere"

## 1. Nouveau script `podcastsphere_v1_0_0.ps1`

Script de build adapté au nouveau projet Podcast Sphere. Changements majeurs par rapport aux anciens ps1 :

- **Repo** : pointe vers le nouveau repo GitHub connecté (à confirmer l'URL exacte, placeholder `https://github.com/Mrbender7/podcastsphere`)
- **Dossier** : `E:\Projets\Podcastsphere`
- **appId** : `com.fhm.podcastsphere` (nouveau package)
- **appName** : `Podcast Sphere`
- **Suppression du code radio natif** : plus de `RadioBrowserService`, `RadioAutoPlugin`, `CastPlugin`, `CastOptionsProvider`, `MediaToggleReceiver` -- ces fichiers Java ne sont plus générés car l'app n'utilise plus d'API radio ni d'ExoPlayer natif
- **Gradle simplifié** : suppression ExoPlayer, MediaCompat, Cast Framework, MediaRouter (le podcast est lu via le WebView HTML5 Audio)
- **Manifest simplifié** : conservation de `INTERNET`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `POST_NOTIFICATIONS`, `BLUETOOTH_CONNECT` ; suppression des permissions réseau Cast, Android Auto `<service>`, Cast `<meta-data>`
- **MainActivity** : conserve `onResume` (WebView settings) et `onCreate` (notification channel silencieux) mais sans `registerPlugin(RadioAutoPlugin)` ni `registerPlugin(CastPlugin)`
- **Pas de BillingPlugin** pour l'instant (à réintégrer plus tard)

## 2. Nettoyage des mentions "Radio Sphere" dans le projet

### Fichiers à modifier :
| Fichier | Action |
|---------|--------|
| `src/plugins/RadioAutoPlugin.ts` | Renommer en `PodcastAutoPlugin.ts`, adapter les noms ou supprimer si inutile en mode podcast |
| `src/pages/SettingsPage.tsx` | Changer l'URL privacy policy de `privacy-policy-radiosphere` |
| `VERSIONS.md` | Réécrire entièrement pour Podcast Sphere v1.0 |
| `docs/PREMIUM_ROADMAP.md` | Adapter pour podcast (supprimer mentions radio) |
| `.lovable/plan.md` | Nettoyer (plus de RadioBrowserService) |
| `android-auto/README-SETUP.md` | Adapter ou archiver |
| `android-auto/*.java` | Archiver ou supprimer (plus de radio) |
| `android-auto/AndroidManifest-snippet.xml` | Adapter pour podcast |
| `docs/receiver.html` | Supprimer les mentions "radio waves" |

### Fichiers à supprimer :
- `radiosphere_v1_1_0.ps1` (racine)
- Tous les `archives/radiosphere_v*.ps1` (7 fichiers)

## 3. Résumé des fichiers créés/modifiés

- **Créé** : `podcastsphere_v1_0_0.ps1`
- **Modifié** : `src/plugins/RadioAutoPlugin.ts`, `src/pages/SettingsPage.tsx`, `VERSIONS.md`, `docs/PREMIUM_ROADMAP.md`, `.lovable/plan.md`, `android-auto/README-SETUP.md`, `android-auto/AndroidManifest-snippet.xml`, `docs/receiver.html`
- **Supprimé** : `radiosphere_v1_1_0.ps1`, `archives/radiosphere_v2_2_2.ps1` → `v2_5_0.ps1` (7 fichiers)

