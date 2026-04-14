# Signy

Signy est un petit generateur de signatures email, pense pour produire une signature propre, lisible et facile a coller dans Gmail, Apple Mail et Outlook.

L'objectif du projet est simple : modifier ses informations, previsualiser le rendu, copier la signature finale au bon format, puis revenir plus tard sans tout ressaisir.

## Ce que fait l'outil

- genere une signature email HTML a partir d'un formulaire simple
- conserve les donnees en local dans le navigateur entre deux rechargements
- propose plusieurs templates de signature
- integre un mode d'aperçu clair et sombre
- copie a la fois une version HTML et une version texte brut pour ameliorer le collage dans les clients mail
- inclut un bloc newsletter optionnel et un texte de disponibilite

## Pourquoi ce repo existe

Les signatures email sont souvent penibles a maintenir :

- chaque ajustement oblige a tout refaire
- le rendu change selon Gmail, Outlook ou Apple Mail
- les contrastes et la lisibilite sont vite mauvais
- les signatures trop "web" cassent facilement au collage

Signy essaie de rester pragmatique : une interface legere cote app, et un rendu final structure en tableaux avec styles inline cote email.

## Stack

- Vite
- React 18
- lucide-react
- Tailwind via CDN dans l'entry HTML actuelle

## Demarrage rapide

### Prerequis

- Node.js 18 ou plus recent
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

### Previsualiser le build

```bash
npm run preview
```

## Utilisation

1. Remplir les champs de profil.
2. Choisir un template de signature.
3. Verifier le rendu dans l'aperçu clair ou sombre.
4. Cliquer sur le bouton de copie.
5. Coller la signature dans les reglages de signature de votre client mail.

Les donnees saisies sont enregistrees dans le stockage local du navigateur. Un bouton permet de tout reinitialiser si besoin.

## Templates disponibles

- Classique : equilibre, sobre, polyvalent
- Compacte : plus dense, utile quand le client mail compresse fort le rendu
- Editoriale : plus marquee visuellement, avec un accent de composition

## Compatibilite email

Le HTML de signature a ete pense pour rester robuste dans les usages courants :

- structure en tableaux pour une meilleure tolerance des clients mail
- styles inline pour limiter les pertes de rendu
- version speciale de certains blocs pour Outlook via commentaires conditionnels MSO
- copie HTML + texte brut pour augmenter les chances d'un collage propre

Cela dit, les clients mail restent incoherents entre eux. Il faut garder en tete que :

- Outlook desktop est generalement le plus contraignant
- certains clients retirent des styles ou changent les espacements
- le collage via raccourci clavier est souvent plus fiable qu'un collage enrichi venant d'un menu contextuel

## Accessibilite et lisibilite

Le projet vise un rendu plus inclusif que la moyenne des generateurs de signatures :

- contrastes renforces sur fond clair et sombre
- hierarchie typographique simple
- textes de formulaire plus explicites
- apercu pour verifier la lisibilite avant copie

## Structure du projet

```text
.
|- index.html
|- package.json
|- vite.config.js
`- src/
   `- main.jsx
```

Aujourd'hui, l'essentiel de l'application est concentre dans `src/main.jsx` :

- logique de formulaire
- persistance locale
- generation HTML de la signature
- variantes de templates
- interface et apercu

## Etat actuel du projet

Le projet fonctionne et peut etre teste tel quel, mais il reste volontairement simple.

Pistes naturelles pour la suite :

- exporter et importer des profils de signature
- separer le gros composant principal en composants React plus petits
- durcir encore le rendu pour Outlook desktop Windows
- remplacer le Tailwind CDN par une configuration frontend plus propre si le projet grossit

## Contribution

Si vous ouvrez une issue ou une PR, le plus utile est de documenter :

- le client mail cible
- la version du client mail si connue
- ce qui etait attendu
- ce qui est reellement colle ou affiche

Les bugs de signatures email sont souvent dependants du contexte. Plus le cas de test est concret, plus la correction est fiable.

## Licence

Le projet est distribue sous la licence presente dans le fichier LICENSE.