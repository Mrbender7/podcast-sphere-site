# Ajouter le japonais a Radio Sphere

## Objectif

Ajouter le japonais (ja) comme 5e langue supportee, avec une police soignee pour les caracteres japonais (kanjis, hiragana, katakana). Il faut aussi traduire les caractères sur les boutons, mais uniquement pour le japonais en raison de l'alphabet différent.

## Fichiers a modifier

### 1. `src/index.css` — Police japonaise

- Importer **Noto Sans JP** depuis Google Fonts (police soignee, tres lisible pour les kanjis/hiragana/katakana, gratuite)
- L'ajouter au `font-family` du body en fallback apres Inter, pour que les caracteres japonais soient automatiquement rendus avec Noto Sans JP

### 2. `src/i18n/translations.ts`

- Etendre le type `Language` : `"fr" | "en" | "es" | "de" | "ja"`
- Ajouter `{ value: "ja", flag: "🇯🇵", label: "日本語" }` dans `LANGUAGE_OPTIONS`
- Ajouter le bloc complet `ja: { ... }` avec les ~90 cles traduites en japonais naturel et soigne :
  - Navigation : ホーム, 検索, お気に入り, 設定...
  - Lecteur : 再生中, 再生エラー, ストリームが利用できません...
  - Premium : プレミアム, スリープタイマー, Android Auto...
  - Minuterie : 15分, 30分, 1時間, 1時間30分, 2時間...
  - Reglages : 言語, データ使用量, ステーションソース...
  - Guide : 使い方ガイド, ホーム画面, 検索, お気に入り...
  - Bienvenue : 世界のラジオを手のひらに, 言語を選択, 始める...
  - Favoris : お気に入り管理, CSVエクスポート, CSVインポート...
  - Sortie : アプリを閉じますか？, 終了...

### 3. `src/contexts/LanguageContext.tsx`

- Ajouter `"ja"` dans la verification du localStorage
- Ajouter la detection de `navigator.language` commencant par `"ja"`

### 4. `src/pages/WelcomePage.tsx`

- Aucune modification structurelle necessaire (utilise deja `LANGUAGE_OPTIONS` dynamiquement et les cles de traduction)

### 5. `src/pages/SettingsPage.tsx`

- Aucune modification structurelle necessaire (utilise deja `LANGUAGE_OPTIONS` dynamiquement)

---

## Details techniques

### Police Noto Sans JP

- Import Google Fonts : `Noto+Sans+JP:wght@400;500;700`
- Appliquee en fallback : `font-family: 'Inter', 'Noto Sans JP', sans-serif`
- Cela garantit que seuls les caracteres japonais utilisent Noto Sans JP, les caracteres latins restent en Inter
- Noto Sans JP est reconnue comme l'une des meilleures polices pour le japonais sur le web

### Volume

- ~90 cles de traduction a ajouter pour le japonais
- Traductions naturelles et idiomatiques (pas de traduction mot-a-mot)

### Impact minimal

- Seuls 3 fichiers necessitent des modifications (translations.ts, LanguageContext.tsx, index.css)
- Les pages WelcomePage et SettingsPage fonctionnent deja dynamiquement grace a LANGUAGE_OPTIONS