

## Plan: Mise a jour du Premium Roadmap + PremiumPage

### Constat

1. **`docs/PREMIUM_ROADMAP.md`** est desynchronise :
   - Le mode d'emploi (§3) est liste comme premium alors qu'il est gratuit
   - Le Chromecast (§4) est encore en "futur" alors qu'il est termine
   - La numerotation est incoherente

2. **`src/pages/PremiumPage.tsx`** ne liste que 2 features (Sleep Timer + Android Auto) au lieu des 4. Cette page semble etre une ancienne version non utilisee (la vraie liste est dans `SettingsPage.tsx` ligne 116-121 avec les 4 features correctes).

3. **`src/contexts/PremiumContext.tsx`** : le `isPremium` default a `true` pour la periode de test — c'est correct, on ne touche pas.

4. **Gates premium dans le code** : verifies et corrects dans `SettingsPage` (sleep timer) et `FullScreenPlayer` (enregistrement). Le Chromecast et Android Auto sont gates via la section premium des settings.

### Changements prevus

#### 1. `docs/PREMIUM_ROADMAP.md` — Rewrite complet
- 4 features premium : Sleep Timer, Enregistrement/Time-shift, Android Auto, Chromecast — toutes en statut "Termine"
- Mode d'emploi retire de la section premium (fonctionnalite de base)
- Section "futures" nettoyee
- Notes techniques mises a jour (periode de test, Stripe one-shot a venir)

#### 2. `src/pages/PremiumPage.tsx` — Ajout des 4 features
- Ajouter les icones Disc (recorder) et Cast (chromecast) a la liste des features
- Aligner avec ce qui est deja dans `SettingsPage.tsx`

### Pas de changement fonctionnel
Aucun changement de logique ou de gates premium. Le code est deja pret pour la production avec `isPremium = true` par defaut. Quand tu voudras activer le paiement reel, il suffira de :
1. Integrer Stripe (one-shot 9.99€)
2. Changer le default de `isPremium` a `false` dans `PremiumContext.tsx`

