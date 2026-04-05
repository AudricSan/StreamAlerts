# Modifier une tâche existante

L'utilisateur veut modifier une tâche existante dans le projet.

Le projet utilise des fichiers Markdown stockés dans :

```text
Tasks/backlog/
Tasks/running/
Tasks/review/
Tasks/done/
Tasks/archive/
```

Chaque tâche correspond à un fichier `.md`.

## Étape 1 — Identifier la tâche

L'utilisateur peut fournir :

* un nom exact
* un nom approximatif
* une description du sujet

Procédure :

1. Rechercher dans tous les dossiers `Tasks/`
2. Comparer le nom du fichier, le titre de la tâche et son contenu
3. Si plusieurs tâches correspondent, proposer une liste et demander laquelle modifier
4. Lire entièrement le fichier avant toute modification

## Étape 2 — Afficher l'état actuel

Avant toute modification, résumer brièvement :

* Titre
* Status
* Priorité
* Complexité
* Tags
* Résumé rapide des objectifs ou notes existantes

## Étape 3 — Appliquer les modifications

L'utilisateur peut demander de modifier :

* le titre
* le status
* la priorité
* la complexité
* les tags
* les objectifs
* les critères d'acceptation
* les dépendances
* les notes techniques

### Gestion du status

Le status est représenté par le dossier où se trouve la tâche :

```text
Backlog        → Tasks/backlog/
In progress    → Tasks/running/
Code review    → Tasks/review/
Done           → Tasks/done/
Archive        → Tasks/archive/
```

Si le status change, déplacer aussi physiquement le fichier dans le bon dossier.

### Gestion des notes

Par défaut :

* compléter les notes existantes
* ne jamais supprimer du contenu existant sauf si l'utilisateur le demande explicitement
* ajouter les nouvelles informations dans la section la plus pertinente

Exemple :

```md
## Notes techniques

- Ancienne note
- Nouvelle note ajoutée suite à la demande utilisateur
```

## Étape 4 — Confirmer

Toujours résumer :

* le fichier modifié
* les propriétés changées
* le déplacement éventuel de dossier
* les nouvelles informations ajoutées

## Règles

* Toujours lire le vrai fichier avant de modifier
* Toujours préserver le contenu existant sauf demande explicite
* Toujours déplacer le fichier si le status change
* Toujours garder une structure Markdown propre et cohérente
* Si plusieurs tâches peuvent correspondre, demander confirmation avant de modifier
