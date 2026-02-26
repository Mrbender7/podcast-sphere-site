

# Refonte de la section Premium et timer personnalisable

## Ce qui change

### 1. Remplacer les features premium fictives par les vraies

Dans la page Premium (`PremiumPage.tsx`) et dans les reglages (`SettingsPage.tsx`), supprimer les 3 features actuelles (Sans publicite, Qualite HD, Acces exclusif) et les remplacer par :

- **Minuterie de sommeil** (icone Moon) : "Arret automatique de la lecture apres un delai configurable"
- **Android Auto** (icone Car) : "Controlez Radio Sphere directement depuis Android Auto"

### 2. Ajouter un timer personnalisable en minutes

Dans `SleepTimerContext.tsx`, les options predefinies (15, 30, 45, 60, 90, 120 min) restent. On ajoute un champ de saisie libre (input numerique) dans `SettingsPage.tsx` a cote des boutons existants, permettant d'entrer un nombre de minutes custom et de lancer le timer avec cette valeur.

### 3. Traductions

Mettre a jour `src/i18n/translations.ts` :
- Remplacer `premium.noAds` / `premium.hd` / `premium.exclusive` par `premium.sleepTimer` et `premium.androidAuto` avec descriptions
- Ajouter `sleepTimer.custom` ("Personnalise" / "Custom") et `sleepTimer.customPlaceholder` ("Minutes" / "Minutes")

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/i18n/translations.ts` | Nouvelles cles pour les features premium reelles + timer custom |
| `src/pages/PremiumPage.tsx` | Remplacer les 3 features par Sleep Timer + Android Auto |
| `src/pages/SettingsPage.tsx` | Idem dans la section Premium collapsible + ajout input custom dans le Sleep Timer |

## Detail technique

### PremiumPage.tsx
- Importer `Moon` et `Car` de lucide-react (remplacer `Zap`, `Headphones`, `ShieldCheck`)
- Le tableau `features` devient 2 elements : sleepTimer et androidAuto

### SettingsPage.tsx
- Meme changement pour `premiumFeatures`
- Dans la section Sleep Timer : ajouter sous la grille des boutons un petit formulaire inline (input number + bouton "Go") qui appelle `startTimer(customMinutes)`

### SleepTimerContext.tsx
- Pas de modification necessaire : `startTimer(minutes)` accepte deja n'importe quel nombre

### Chromecast
- Non implemente dans cette iteration. Ajoute comme idee future dans le roadmap. Necessite le Google Cast SDK natif Android, developpement consequent pour une v3.

