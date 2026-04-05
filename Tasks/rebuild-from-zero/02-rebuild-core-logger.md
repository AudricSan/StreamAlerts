# Noyau — Logger (`window.Log`)

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: S
- Tags: rebuild-from-zero, core, logging

## Description

Implémenter le module **journalisation centralisée** : `Log.debug`, `Log.info`, `Log.warn`, `Log.error`, avec filtrage des `debug` uniquement lorsque le mode debug est actif (ex. `?debug=1` dans l’URL de l’overlay). Aucun `console.log` dispersé en production.

## Objectifs

- Fichier `overlay/core/logger.js`, exposé sur `window.Log`.
- Détection du flag debug depuis `location.search`.
- API stable utilisée par tous les autres modules.

## Critères d'acceptation

- [ ] `Log.debug` silencieux hors debug ; autres niveaux toujours utiles ou documentés.
- [ ] Chargé en **premier** parmi les core (avant Bus/Config qui loggent).
- [ ] Compatible Chromium 90, sans syntaxe interdite par CLAUDE.md.

## Dépendances

- Tâche fondation (contraintes).

## Référence actuelle

- `overlay/core/logger.js`
