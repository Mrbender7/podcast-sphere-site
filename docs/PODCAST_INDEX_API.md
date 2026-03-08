# Podcast Index API — Référence Technique

> Base URL: `https://api.podcastindex.org/api/1.0`
> Version: 1.12.1
> Inscription clés API: https://api.podcastindex.org/

---

## Authentification

4 headers requis sur **chaque** requête :

| Header | Description |
|---|---|
| `User-Agent` | Identifiant app, ex: `PodcastSphere/1.0` |
| `X-Auth-Key` | Clé API publique |
| `X-Auth-Date` | Unix epoch UTC (entier, fenêtre de 3 min) |
| `Authorization` | SHA-1 hex de `apiKey + apiSecret + unixTime` |

```pseudo
Authorization = sha1(apiKey + apiSecret + unixTime)  // hex lowercase
```

Notre implémentation actuelle dans `PodcastService.ts` utilise `crypto.subtle.digest("SHA-1", ...)`.

---

## Endpoints utilisés dans le projet

### 1. Search Podcasts
`GET /search/byterm`

| Param | Type | Description |
|---|---|---|
| `q`* | string | Termes de recherche (titre, auteur, owner) |
| `max` | int (1-1000) | Nombre max de résultats |
| `clean` | bool | Exclure les feeds explicites |
| `fulltext` | bool | Retourner descriptions complètes (sinon tronquées à 100 mots) |
| `similar` | bool | Inclure résultats similaires |

**Réponse** : `{ status, feeds: [...], count, query }`

### 2. Search by Title
`GET /search/bytitle`
- Même params que byterm, mais cherche uniquement dans le titre exact.

### 3. Search by Person
`GET /search/byperson`
- `q`* : nom de la personne
- Cherche dans : person tags, episode title/description, feed owner/author
- **Réponse** : `{ items: [...] }` (épisodes, pas feeds)

### 4. Podcast by Feed ID
`GET /podcasts/byfeedid`
- `id`* : PodcastIndex Feed ID
- **Réponse** : `{ feed: {...} }` (objet unique, pas tableau)

### 5. Podcast by Feed URL
`GET /podcasts/byfeedurl`
- `url`* : URL du flux RSS

### 6. Podcast by iTunes ID
`GET /podcasts/byitunesid`
- `id`* : iTunes ID (avec ou sans préfixe "id")

### 7. Podcast by GUID
`GET /podcasts/byguid`
- `guid`* : podcast:guid unique global

### 8. Trending Podcasts
`GET /podcasts/trending`

| Param | Type | Description |
|---|---|---|
| `max` | int (1-1000) | Nombre max |
| `since` | int | Epoch timestamp filtre |
| `lang` | string | Codes langue séparés par virgules (ex: `en,fr,es`) |
| `cat` | string | Catégories à inclure (ID ou nom, séparés par virgules) |
| `notcat` | string | Catégories à exclure |

**Réponse** : `{ feeds: [...], count }` — inclut `trendScore`, `newestItemPublishTime`

### 9. Podcasts by Medium
`GET /podcasts/bymedium`
- `medium` : `audiobook | blog | film | music | newsletter | podcast | video`

### 10. Episodes by Feed ID
`GET /episodes/byfeedid`

| Param | Type | Description |
|---|---|---|
| `id`* | string | Feed ID(s), multiples séparés par virgules |
| `max` | int (1-1000) | Nombre max d'épisodes |
| `since` | int | Epoch timestamp (épisodes depuis) |
| `fulltext` | bool | Descriptions complètes |
| `enclosure` | URL | Filtrer par URL d'enclosure spécifique |

**Réponse** : `{ items: [...], count }`

### 11. Batch by GUID (POST)
`POST /podcasts/batch/byguid`
- Body JSON : tableau de GUIDs `["guid1", "guid2"]`

---

## Structure des objets API

### Feed (Podcast)
```
id: integer              // PodcastIndex Feed ID
podcastGuid: string      // GUID unique global
title: string
url: URL                 // Feed URL actuelle
originalUrl: URL
link: URL                // Lien du site web
description: string      // Utilise le plus long de: description, itunes:summary, content:encoded
author: string           // Channel-level author
ownerName: string
image: URL               // Channel-level image
artwork: URL             // Meilleur artwork trouvé (souvent = image)
lastUpdateTime: integer  // Unix timestamp dernière mise à jour
lastCrawlTime: integer
lastParseTime: integer
lastHttpStatus: integer  // Codes 9xx = états internes
contentType: string
itunesId: integer|null
itunesType: string       // serial, episodic, etc.
generator: string
language: string         // Code RSS langue
explicit: boolean
type: 0|1               // 0=RSS, 1=Atom
medium: string          // podcast, music, video, etc.
dead: integer           // 1 = feed mort (vérifié 1x/mois)
episodeCount: integer
crawlErrors: integer
parseErrors: integer
categories: {[id]: "CategoryName"}  // Objet clé=ID, valeur=nom
locked: 0|1             // podcast:locked tag
imageUrlHash: integer   // CRC32
newestItemPublishTime: integer  // ⚠️ Certains endpoints: newestItemPubdate
trendScore: integer     // Seulement sur /trending
popularity: integer     // Seulement sur certains endpoints
value: {...}            // Value4Value (lightning, hive, webmonetization)
funding: { url, message }
```

### Episode
```
id: integer              // PodcastIndex Episode ID
title: string
link: URL
description: string
guid: string             // Identifiant unique épisode
datePublished: integer   // Unix timestamp
dateCrawled: integer
enclosureUrl: URL        // Lien fichier audio/vidéo
enclosureType: string    // Content-Type (audio/mpeg, etc.)
enclosureLength: integer // Taille en bytes
duration: integer|null   // Durée en secondes (null pour liveItem)
explicit: 0|1
episode: integer|null    // Numéro d'épisode
episodeType: "full"|"trailer"|"bonus"|null
season: integer|null
image: URL               // Image épisode spécifique
feedItunesId: integer|null
feedImage: URL           // Image du feed parent
feedId: integer          // Feed ID parent
feedUrl: URL
feedAuthor: string
feedTitle: string
feedLanguage: string
chaptersUrl: URL|null    // Lien JSON des chapitres
transcriptUrl: URL|null  // Lien transcription
transcripts: [{url, type}]  // Formats: json, srt, html, plain, vtt
```

---

## Mapping vers nos types TypeScript

| API Field | Notre type `Podcast` | Notes |
|---|---|---|
| `id` ou `feedId` | `id` | |
| `title` | `title` | |
| `author` ou `ownerName` | `author` | Fallback |
| `image` ou `artwork` | `image` | `artwork` souvent meilleur |
| `description` | `description` | Tronqué sans `fulltext` |
| `url` ou `originalUrl` | `url` | |
| `categories` | `categories` | Object.values() |
| `newestItemPublishTime` ou `lastUpdateTime` | `lastEpisodeDate` | ⚠️ Nom varie selon endpoint |

| API Field | Notre type `Episode` | Notes |
|---|---|---|
| `id` | `id` | |
| `title` | `title` | |
| `description` | `description` | |
| `datePublished` | `datePublished` | Unix timestamp |
| `duration` | `duration` | Secondes |
| `enclosureUrl` | `enclosureUrl` | |
| `enclosureType` | `enclosureType` | |
| `image` ou `feedImage` | `image` | Fallback |
| `feedId` | `feedId` | |
| `feedTitle` | `feedTitle` | |
| `feedAuthor` | `feedAuthor` | |
| `feedImage` | `feedImage` | |

---

## Endpoints non encore utilisés (potentiel futur)

| Endpoint | Usage potentiel |
|---|---|
| `GET /search/byperson` | Recherche par personne/intervenant |
| `GET /search/music/byterm` | Filtre medium=music |
| `GET /podcasts/byfeedurl` | Ajouter un podcast par URL |
| `GET /podcasts/byguid` | Lookup par GUID |
| `GET /podcasts/bymedium` | Filtrer par type (podcast, music, video) |
| `GET /podcasts/dead` | Identifier feeds morts |
| `POST /podcasts/batch/byguid` | Batch lookup pour sync abonnements |
| `GET /episodes/byid` | Épisode unique par ID |
| `GET /episodes/byguid` | Épisode par GUID |
| `GET /episodes/random` | Découverte aléatoire |
| `GET /recent/episodes` | Épisodes récents globaux |
| `GET /recent/newfeeds` | Nouveaux podcasts ajoutés |
| `GET /categories/list` | Liste complète des catégories |
| `GET /hub/pubnotify` | Notification de publication |

---

## Notes techniques importantes

1. **`newestItemPublishTime` vs `newestItemPubdate`** : Les deux retournent la même info. Le nom varie selon l'endpoint. Notre normalizer gère les deux.

2. **Descriptions tronquées** : Sans le param `fulltext`, les descriptions sont coupées à 100 mots. Ajouter `fulltext` pour les pages détail.

3. **Categories** : Retournées comme objet `{id: "name"}`, pas un tableau. Notre normalizer fait `Object.values()`.

4. **Fenêtre auth de 3 minutes** : Le timestamp dans `X-Auth-Date` doit être à ±3 min de l'heure serveur.

5. **Rate limiting** : Pas documenté explicitement, mais l'API est gratuite — usage raisonnable attendu.

6. **Langues trending** : Le param `lang` sur `/trending` accepte des codes séparés par virgules + `unknown` pour les feeds sans langue.

7. **Multi-feed episodes** : `/episodes/byfeedid` accepte plusieurs IDs séparés par virgules pour récupérer les épisodes de plusieurs feeds en une requête.

8. **Transcripts** : Certains épisodes ont des transcriptions disponibles (formats: json, srt, html, plain, vtt) — fonctionnalité future intéressante.

9. **Chapitres** : `chaptersUrl` pointe vers un JSON de chapitres — utile pour un player avancé.
