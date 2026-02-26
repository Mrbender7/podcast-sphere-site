

# Fix script PS1 — Erreur "terminateur manquant"

## Diagnostic

PowerShell exige que le terminateur `"@` d'un **here-string expansible** (`@"..."@`) soit au **tout debut de la ligne** (colonne 1, zero espace avant). Si le `"@` est indente (meme d'un seul espace), PowerShell ne le reconnait pas comme terminateur et continue a lire le reste du fichier comme une chaine, jusqu'a l'erreur finale en ligne 930.

Le script contient **4 here-strings expansibles** (`@"..."@`) dont certains sont dans des blocs `if` indentes :

| Ligne ouverture | Ligne fermeture | Variable | Risque |
|-----------------|-----------------|----------|--------|
| 18 | 25 | `$ConfigJSON` | Hors if, probablement OK |
| 123 | 139 | `$ServiceDecl` | Dans un `if` — `"@` potentiellement indente |
| 152 | 159 | `$DepsBlock` | Dans un `if` — `"@` potentiellement indente |
| 864 | 889 | `$OnCreatePatch` | Dans un `if` — `"@` potentiellement indente |

## Correction

Forcer les 4 terminateurs `"@` a etre en **colonne 1** (debut absolu de ligne), meme si cela casse l'indentation visuelle du script. C'est une contrainte syntaxique de PowerShell.

De plus, remplacer tous les em-dashes (`—`, U+2014) par des doubles tirets (`--`) dans tout le script pour eviter les problemes d'encodage Windows PowerShell 5.x.

## Fichier modifie

| Fichier | Modification |
|---------|-------------|
| `radiosphere_v2_2_8.ps1` | Aligner les 4 `"@` en colonne 1 + remplacer `—` par `--` |

