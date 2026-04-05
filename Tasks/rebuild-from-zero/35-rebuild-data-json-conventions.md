# Couche donnees — fichiers JSON dans `overlay/data/`

- Status: Backlog
- Priorite: Haute
- Complexite: S
- Tags: rebuild-from-zero, json, data

## Description

Fournir des **fichiers initiaux** ou templates pour chaque JSON consomme (`config.json` par defaut, `alert.json`, `visibility.json`, `current-scene.json`, etc.) avec la regle universelle : champ **`timestamp`** en millisecondes Unix pour la deduplication Poller. Documenter un exemple minimal par fichier dans le README.

## Objectifs

- Jeu de fichiers sous `overlay/data/` coherent avec `api.php` ALLOWED.
- Valeurs par defaut qui ne cassent pas le premier chargement overlay.

## Criteres d acceptation

- [ ] Premier demarrage : aucun throw dans la console pour fichiers vides ou `{}` si geres.
- [ ] Liste des fichiers synchronisee README / CLAUDE / api.php.

## Dependances

- Avant tests d integration des widgets.

## Reference actuelle

- `overlay/data/*.json` (etat actuel du depot)
