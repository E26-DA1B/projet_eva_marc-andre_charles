# Architecture — Arbres de Montréal

## Besoin et données principales

Explorer les arbres publics de Montréal et gérer une collection avec persistance. Un arbre contient un identifiant interne, un numéro d’inventaire municipal facultatif, une essence française, un nom latin facultatif, un arrondissement, un diamètre en cm et une position longitude/latitude.

Ce document décrit d'abord l'implémentation TP2, puis l'implémentation proposée du TP3, et enfin l'implémentation réelle du TP3.

## Implémentation TP2

### Vues et navigation

Vue Router utilise un historique par hash, compatible avec les URL de l’application de bureau.

| Route                  | Vue                   | Responsabilité                                            |
| ---------------------- | --------------------- | --------------------------------------------------------- |
| `/`                    | `TableauBord.vue`     | Résumé de la collection et accès aux fonctions            |
| `/carte`               | `CarteArbres.vue`     | Carte et résumé des arbres                                |
| `/arbres`              | `ListeArbres.vue`     | Collection paginée, filtres, tri et suppression confirmée |
| `/ajouter`             | `FormulaireArbre.vue` | Ajout avec validation                                     |
| `/arbres/:id/modifier` | `FormulaireArbre.vue` | Modification et gestion d’un identifiant absent           |

`App.vue` fournit la navigation, le chargement initial et les notifications. Les vues appellent le service et ne possèdent pas leur propre copie de la collection.

La route `/favoris` ouvre `FavorisArbres.vue`, qui réutilise `ListeArbres.vue` avec la propriété `favorisSeulement`. La recherche, le filtre, le tri et les résumés portent alors uniquement sur les favoris.

### Composants

- `MapView.vue` reçoit les arbres par props et les représente en GeoJSON avec MapLibre; le CSV n’y est plus lu.
- `ResumeArbres.vue` reçoit les arbres par props et affiche les calculs du service; il est réutilisé dans trois vues.
- `MessageEtat.vue` reçoit le type de message et l’option de fermeture par props. Il émet `fermer`; le parent efface alors la notification. Il est réutilisé dans les vues et la carte.

### Données simulées et service

`BoutonFavori.vue` est réutilisé dans la liste et les détails de la carte. Il reçoit l’arbre par props, appelle le service et émet `changer` après l’opération. L’état étoilé et le compteur de navigation suivent les mêmes données réactives.

Les favoris sont des identifiants d’arbres dans `etat.favoris`, conservés uniquement en mémoire. Le service expose `ajouterFavori(id)`, `retirerFavori(id)`, `estFavori(id)` et `obtenirFavoris()`. L’ajout refuse un arbre absent et évite les doublons. Le retrait ne supprime pas l’arbre. Supprimer un arbre nettoie aussi ses favoris; modifier un arbre actualise sa fiche favorite sans copier les données.

`public/data/liste_arbre.csv` est le jeu initial fourni dans Git. `src/services/arbresService.js` le lit une fois en mode navigateur, ou l’importe dans `arbres.json` en mode Tauri. Les lignes sans coordonnées valides sont exclues. Les identifiants internes uniques sont indépendants du numéro d’inventaire.

| Opération                | Contrat TP2                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| `initialiser()`          | Charge la collection une fois; expose chargement/erreur et permet de réessayer |
| `etat.arbres`            | Collection réactive en lecture seule pour les vues                             |
| `obtenir(id)`            | Consulte un arbre sans exposer une mutation directe                            |
| `ajouter(donnees)`       | Valide, ajoute en mémoire et retourne l’identifiant                            |
| `modifier(id, donnees)`  | Valide, vérifie l’existence et modifie en mémoire                              |
| `supprimer(id)`          | Retire un arbre existant; la vue demande confirmation                          |
| `validerArbre(donnees)`  | Retourne les erreurs par champ                                                 |
| `filtrerArbres(...)`     | Recherche sans accents, filtre et tri sans modifier la collection              |
| `calculerResume(arbres)` | Totaux, diversité et diamètre moyen hors valeurs absentes                      |

`notificationService.js` centralise les confirmations d’ajout, modification et suppression. Les erreurs de formulaire restent près des champs. Les opérations restent locales; aucun fichier de données n’est modifié.

### Règles importantes

Champs obligatoires non blancs; textes de 120 caractères maximum; diamètre de 0,1 à 1 000 cm; latitude de -90 à 90; longitude de -180 à 180. Une modification invalide ne doit pas altérer l’arbre existant. Modifier ou supprimer un identifiant absent doit produire une erreur claire.

## Préparation du TP3 — proposition à confirmer

| Module Rust envisagé | Responsabilité                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `models.rs`          | Structure publique `Arbre`, champs privés, constructeur, accesseurs et modification contrôlée; Serde |
| `validation.rs`      | Validation Rust indépendante de Vue et règles du domaine                                             |
| `repository.rs`      | Lecture/écriture JSON atomique dans le répertoire de données Tauri; création au premier démarrage    |
| `commands.rs`        | Commandes de liste, ajout, modification, suppression et résumé; erreurs avec `Result`                |
| `lib.rs`             | Assemblage des modules et enregistrement des commandes                                               |

Rust devra protéger les limites des données et l’existence des arbres, et calculer le résumé. Les appels `invoke()` resteront centralisés dans le service JavaScript. Les méthodes de mutation deviendront asynchrones et mettront à jour la collection après confirmation de Rust.

La persistance JSON est proposée pour conserver une portée raisonnable, mais n’est pas implémentée au TP2. Le TP3 devra documenter les modules et commandes réellement retenus, la persistance finale et les différences par rapport à cette proposition.

## Choix final : JSON

La collection est persistée localement dans `arbres.json`, placé dans le dossier de données de Tauri. `lib.rs` prépare ce chemin au démarrage; `repository.rs` lit et réécrit le JSON; `commands.rs` expose les opérations à Vue par `invoke()`.

Au premier démarrage, Vue charge `public/data/liste_arbre.csv` puis l’importe dans JSON. Les démarrages suivants relisent directement `arbres.json`. Les opérations d’ajout, modification et suppression sont asynchrones et confirmées par Rust avant la mise à jour de l’état Vue.

## Implémentation réelle du TP3

### Modules Rust

| Module            | Responsabilité                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `main.rs`         | Point d’entrée; appelle `run()`                                                                            |
| `lib.rs`          | Déclare les modules, crée `AppState` (chemins des trois fichiers JSON et verrou), enregistre les commandes |
| `commands.rs`     | Commandes Tauri appelées par Vue avec `invoke()`; erreurs retournées avec `Result`                         |
| `models.rs`       | Structure `Arbre`, sérialisée avec Serde (`camelCase` côté JavaScript)                                     |
| `validation.rs`   | Règles de validation indépendantes de Vue, avec tests unitaires                                            |
| `repository.rs`   | Lecture et écriture de `arbres.json`, `favoris.json` et `observations.json`                                |
| `recherche.rs`    | Normalisation du texte (casse et accents) et recherche par essence                                         |
| `statistiques.rs` | Calcul du résumé : total, essences, arrondissements et diamètre moyen                                      |

### Commandes Tauri

| Commande                  | Rôle                                                                |
| ------------------------- | ------------------------------------------------------------------- |
| `lister_arbres`           | Retourne tous les arbres de `arbres.json`                           |
| `importer_arbres`         | Au premier démarrage, sauvegarde les arbres lus dans le CSV         |
| `ajouter_arbre`           | Valide et ajoute un arbre                                           |
| `modifier_arbre`          | Valide et modifie un arbre existant                                 |
| `supprimer_arbre`         | Supprime un arbre existant                                          |
| `lister_favoris`          | Retourne les identifiants des favoris                               |
| `ajouter_favori`          | Ajoute un favori sans doublon                                       |
| `retirer_favori`          | Retire un favori sans supprimer l’arbre                             |
| `lister_observations`     | Retourne les observations enregistrées                              |
| `sauvegarder_observation` | Enregistre l’observation d’un arbre                                 |
| `rechercher_arbres`       | Recherche par essence, sans distinction de casse ni d’accents       |
| `obtenir_statistiques`    | Calcule le résumé de la collection; utilisée par le tableau de bord |

### Différences par rapport à la proposition

- **Nouveaux modules :** `recherche.rs` et `statistiques.rs` ne faisaient pas partie de la proposition.
- **Persistance élargie :** en plus des arbres, les favoris et les observations ont chacun leur fichier JSON.
- **Recherche :** effectuée en Rust dans les pages Liste et Favoris; la page Carte utilise encore la recherche JavaScript.
- **Statistiques :** calculées en Rust pour le tableau de bord; les résumés filtrés des pages Liste et Carte sont encore calculés en JavaScript.
- **Écriture non atomique :** la proposition prévoyait une écriture atomique, mais `repository.rs` écrit directement avec `fs::write`.
- **Conforme à la proposition :** `models.rs` utilise des champs privés, un constructeur et des accesseurs.
