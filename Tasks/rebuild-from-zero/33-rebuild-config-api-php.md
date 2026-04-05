# API locale PHP — lecture / ecriture JSON (`config/api.php`)

- Status: Backlog
- Priorite: Haute
- Complexite: M
- Tags: rebuild-from-zero, php, security, json

## Description

Endpoint unique avec parametres `action=read|write`, `file=<nom>` sans extension, **liste blanche** des fichiers (`alert`, `config`, `goal`, `chat`, `visibility`, `current-scene`, etc.) pointant vers `overlay/data/`. POST JSON pour ecriture, reponses JSON `{ ok: true }` ou erreurs HTTP explicites. Pas d acces arbitraire au disque.

## Objectifs

- Fichier `config/api.php`.
- `realpath` pour verifier que le dossier data est bien sous le projet.
- Headers no-cache, UTF-8.

## Criteres d acceptation

- [ ] Toute requete avec `file` non autorise est rejetee (400).
- [ ] JSON POST invalide : 400 avec message clair.
- [ ] Ecriture avec `JSON_PRETTY_PRINT` et unicode non echappe si deja le cas dans le projet.

## Dependances

- Dossier `overlay/data/` existant et permissions ecriture Apache.

## Reference actuelle

- `config/api.php` (constante `ALLOWED`)
