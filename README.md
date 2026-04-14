# Signy

Signy est un générateur de signatures email pro, pensé pour produire une signature propre, lisible et facile à coller dans Gmail, Apple Mail et Outlook.

L'objectif : modifier ses informations, prévisualiser le rendu, copier la signature finale au bon format, puis revenir plus tard sans tout ressaisir.

## Ce que fait l'outil

- génère une signature email HTML à partir d'un formulaire simple
- conserve les données en local dans le navigateur entre deux rechargements
- propose **6 templates** de signature (classique, minimale, compacte, élégante, impact, éditoriale)
- **7 couleurs d'accent** au choix (ambre, bleu, émeraude, rose, violet, sarcelle, neutre)
- intègre un mode d'aperçu clair et sombre
- copie à la fois une version HTML et une version texte brut pour améliorer le collage dans les clients mail
- inclut un bloc newsletter optionnel et un texte de disponibilité
- affiche LinkedIn et Instagram avec icônes au lieu d'URLs brutes
- formate automatiquement les numéros de téléphone (+33 6 26 88 06 86)

## Pourquoi ce repo existe

Les signatures email sont souvent pénibles à maintenir :

- chaque ajustement oblige à tout refaire
- le rendu change selon Gmail, Outlook ou Apple Mail
- les contrastes et la lisibilité sont vite mauvais
- les signatures trop "web" cassent facilement au collage

Signy essaie de rester pragmatique : une interface légère côté app, et un rendu final structuré en tableaux avec styles inline côté email.

## Stack

- Vite
- React 18
- lucide-react
- Tailwind via CDN dans l'entry HTML actuelle

## Démarrage rapide

### Prérequis

- Node.js 18 ou plus récent
- npm

### Installation

```bash
npm install
```

### Lancer en local

```bash
npm run dev
```

### Build de production

```bash
npm run build
```

### Prévisualiser le build

```bash
npm run preview
```

## Utilisation

1. Remplir les champs de profil.
2. Choisir un template de signature parmi les 6 disponibles.
3. Choisir une couleur d'accent.
4. Vérifier le rendu dans l'aperçu clair ou sombre.
5. Cliquer sur le bouton de copie.
6. Coller la signature dans les réglages de signature de votre client mail.

Les données saisies sont enregistrées dans le stockage local du navigateur. Un bouton permet de tout réinitialiser si besoin.

## Templates disponibles

- **Classique** : équilibré, sobre, polyvalent
- **Minimale** : l'essentiel, sans avatar, rien de plus
- **Compacte** : plus dense, utile quand le client mail compresse fort le rendu
- **Élégante** : typographique, raffinée, avatar rond
- **Impact** : noms et titres affirmés, grande taille
- **Éditoriale** : plus marquée visuellement, avec un accent de composition

## Couleurs d'accent

7 palettes prédéfinies, chacune avec des variantes claires et sombres conformes WCAG AA :

Ambre · Bleu · Émeraude · Rose · Violet · Sarcelle · Neutre

## Compatibilité email

Le HTML de signature a été pensé pour rester robuste dans les usages courants :

- structure en tableaux pour une meilleure tolérance des clients mail
- styles inline pour limiter les pertes de rendu
- version spéciale de certains blocs pour Outlook via commentaires conditionnels MSO
- copie HTML + texte brut pour augmenter les chances d'un collage propre
- support dark mode via `@media (prefers-color-scheme: dark)`

Cela dit, les clients mail restent incohérents entre eux. Il faut garder en tête que :

- Outlook desktop est généralement le plus contraignant
- certains clients retirent des styles ou changent les espacements
- le collage via raccourci clavier est souvent plus fiable qu'un collage enrichi venant d'un menu contextuel

## Accessibilité et lisibilité

Le projet vise un rendu plus inclusif que la moyenne des générateurs de signatures :

- contrastes renforcés sur fond clair et sombre (WCAG AA)
- 7 palettes d'accent toutes vérifiées pour le contraste
- hiérarchie typographique simple
- textes de formulaire plus explicites
- aperçu pour vérifier la lisibilité avant copie

## Structure du projet

```text
.
├── index.html
├── package.json
├── vite.config.js
└── src/
   └── main.jsx
```

Aujourd'hui, l'essentiel de l'application est concentré dans `src/main.jsx` :

- logique de formulaire
- persistance locale
- génération HTML de la signature
- 6 variantes de templates
- sélecteur de couleur d'accent
- interface et aperçu

## État actuel du projet

Le projet fonctionne et peut être testé tel quel.

Pistes naturelles pour la suite :

- exporter et importer des profils de signature
- séparer le gros composant principal en composants React plus petits
- durcir encore le rendu pour Outlook desktop Windows
- remplacer le Tailwind CDN par une configuration frontend plus propre si le projet grossit

## Contribution

Si vous ouvrez une issue ou une PR, le plus utile est de documenter :

- le client mail cible
- la version du client mail si connue
- ce qui était attendu
- ce qui est réellement collé ou affiché

Les bugs de signatures email sont souvent dépendants du contexte. Plus le cas de test est concret, plus la correction est fiable.

## Licence

Le projet est distribué sous la licence présente dans le fichier LICENSE.