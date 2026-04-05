# Documentation des schémas JSON et validation (optionnelle)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: documentation, json, streamerbot, quality

## Description

Les fichiers sous `overlay/data/` sont le **contrat** entre Streamer.bot et l’overlay. Aujourd’hui, la connaissance des champs attendus est dispersée (README, commentaires C#, lecture du code JS). Cette tâche vise à **formaliser** pour chaque fichier : champs obligatoires (dont `timestamp` en ms Unix), types, exemples minimaux, et champs optionnels.

En option, fournir un **outil de validation** exécutable en local (script shell, PowerShell, ou page dev) qui lit les JSON du dossier `data/` et signale les anomalies (timestamp absent, type incorrect, clé inconnue selon une liste blanche). L’outil ne doit **pas** imposer npm : privilégier un script simple ou une page `dev/` existante.

## Objectifs

- Ajouter une section README (ou fichier `docs/json-contracts.md`) avec un tableau : fichier → but → schéma → exemple.
- Pour chaque composant majeur, un exemple JSON valide copiable pour tests manuels.
- Option : validateur hors ligne ou bouton debug « valider les JSON ».

## Critères d'acceptation

- [ ] Tous les fichiers listés dans `api.php` `ALLOWED` sont documentés au moins avec champs obligatoires + exemple.
- [ ] La règle universelle `timestamp` (ms) est rappelée partout où elle s’applique.
- [ ] Le validateur optionnel ne modifie pas les fichiers sans action explicite de l’utilisateur.
- [ ] Aucune dépendance npm ajoutée au projet.

## Dépendances

- README actuel, scripts `streamerbot/*.cs`, composants `overlay/components/*.js`.

## Notes techniques

- JSON Schema officiel est possible en fichier `.schema.json` sans runtime si c’est purement documentaire ; pour exécution, choisir le plus simple (ex. regex + checks JS vanilla dans `dev/`).
