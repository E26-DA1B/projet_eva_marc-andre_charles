# Arbres de Montréal — TP2

Application de bureau pour explorer un échantillon d’arbres publics de Montréal et gérer une collection temporaire. Elle permet de repérer les essences, consulter les coordonnées et comparer les diamètres.

## Équipe et dépôt

- Éva — nom complet à confirmer par l’équipe.
- Marc-André — nom complet à confirmer par l’équipe.
- Charles Legault — nom présent dans l’historique Git.
- Dépôt du cours :  https://github.com/E26-DA1B/projet_eva_marc-andre_charle

Les noms complets et la répartition réelle doivent être validés avant la remise. L’historique disponible au moment de la préparation contient les contributions de Charles pour MapLibre, le CSV et le GeoJSON. Les autres contributions ne sont pas inventées.

Répartition proposée à confirmer : Éva (interface et accessibilité), Marc-André (service, formulaires et validation), Charles (carte et import CSV); vérifications et documentation en équipe. Cette proposition n’atteste pas de contributions déjà réalisées.

## Fonctionnalités TP2

- Tableau de bord : total, nombre d’essences et d’arrondissements, diamètre moyen.
- Carte interactive : position des arbres, sélection d’un point et accès à la modification.
- Liste paginée : recherche sans distinction de casse ni d’accents, filtre par arrondissement, tri par essence ou diamètre.
- Formulaire d’ajout et de modification : six champs, messages de validation et confirmation de succès.
- Suppression avec confirmation et possibilité d’annuler.
- Favoris : ajout/retrait depuis la liste ou la carte; page « Mes favoris » avec compteur, recherche, filtre et tri. Retirer un favori conserve l’arbre dans la collection.
- États de chargement, erreur avec nouvelle tentative, collection vide et recherche sans résultat.
- Données partagées en mémoire : les changements se reflètent entre les vues.

## Technologies et prérequis

Vue 3, Vue Router 4 (navigation par hash adaptée à Tauri), JavaScript, Vite, npm, Tauri 2 et Rust. La carte utilise MapLibre GL; Papa Parse lit le CSV.

Prérequis :

- Node.js 22 LTS et npm.
- Rust stable avec Cargo.
- Sous Windows : Microsoft C++ Build Tools avec la charge de travail « Développement Desktop en C++ », Windows SDK et WebView2.
- Pour les autres systèmes, installer les prérequis Tauri correspondants : https://v2.tauri.app/start/prerequisites/
- Internet pour installer les dépendances et afficher le fond de carte détaillé OpenFreeMap. La liste, les formulaires et les calculs utilisent uniquement les données locales.

## Installation et démarrage

Dans le dossier du projet :

```bash
npm install
npm run tauri dev
```

Une fenêtre « Arbres de Montréal » s’ouvre. Le port local 1420 doit être disponible.

Sous PowerShell, si les scripts npm sont bloqués, utiliser `npm.cmd install` et `npm.cmd run tauri dev`.

Aperçu dans un navigateur (ne remplace pas la vérification de la fenêtre Tauri) :

```bash
npm run dev
```

## Données et règles

Le fichier livré `public/data/arbres-test.csv` contient 1 000 arbres, 126 essences et un arrondissement. Ce n’est pas l’inventaire complet de Montréal. Aucun téléchargement manuel d’un gros fichier CSV n’est nécessaire.

Le service transforme ce fichier en objets JavaScript, puis conserve tous les ajouts, modifications et suppressions en mémoire. Les vues ne lisent pas directement le CSV. Pour essayer le filtre entre plusieurs arrondissements, ajouter un arbre avec un autre arrondissement.

Validation du formulaire :

- Essence française et arrondissement obligatoires, après suppression des espaces superflus.
- Champs de texte limités à 120 caractères; nom latin facultatif.
- Diamètre obligatoire entre 0,1 et 1 000 cm.
- Longitude entre -180 et 180; latitude entre -90 et 90, toutes deux obligatoires.
- Les diamètres absents dans les données importées sont affichés « Non renseigné » et exclus de la moyenne.
- Les identifiants de session sont distincts du numéro d’inventaire municipal.

## Vérifications

```bash
npm test
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
npm run tauri dev
```

Les tests Node couvrent le fichier livré, les erreurs de CSV, la validation, les mutations, la nouvelle tentative de chargement, les filtres et les calculs. Voir `docs/validation-tp2.md` pour le parcours manuel et les preuves locales.

## Architecture

Voir [architecture-application.md](architecture-application.md) pour les vues, les données, le contrat du service et les responsabilités Rust envisagées au TP3.

## Limites et suite TP3

- Aucune persistance au TP2 : un rechargement complet ou un redémarrage réinitialise la collection au CSV fourni.
- Les favoris sont également temporaires et repartent vides au rechargement. Leur persistance sera à ajouter au TP3.
- Le fond détaillé dépend d’OpenFreeMap et de WebGL. Un message indique une indisponibilité; les points peuvent rester sur un fond simplifié et la liste demeure accessible.
- Le module MapLibre est volumineux; il est chargé seulement à l’ouverture de la vue Carte. L’avertissement de taille Vite n’empêche pas le build.
- Pas de contrôle géographique limité à Montréal : seules les bornes mondiales des coordonnées sont vérifiées.
- Le backend Rust reste celui de démarrage Tauri. Les règles métier Rust et la persistance appartiennent au TP3.
- Choix envisagé au TP3, à confirmer : fichier JSON dans le répertoire de données de l’application, adapté à la petite collection et ne nécessitant pas de serveur. Prévoir une écriture atomique et la gestion des erreurs.

## Remise — actions de l’équipe

Le travail préparé ici est local. Aucun commit, tag, push ou dépôt Teams n’est effectué automatiquement.

Avant de remettre :

1. Confirmer les noms complets et remplacer la répartition proposée par le travail réellement réalisé.
2. Faire contribuer chaque membre avec son propre compte, sans fabriquer l’historique.
3. Vérifier le parcours complet dans Tauri et stabiliser la branche principale choisie par l’équipe (le checkout analysé utilise `charles`).
4. Réviser les changements avec `git diff`, puis créer le commit de remise.
5. Créer l’étiquette annotée `tp2` sur ce commit et publier la branche ainsi que l’étiquette lorsque l’équipe autorise la publication.
6. Inscrire sur Teams : nom d’équipe, noms complets, URL du dépôt, étiquette `tp2` et SHA correspondant.

Ne pas étiqueter le commit précédent tant que les changements locaux ne sont pas commités.
