# Outils dev — panneau debug (`?debug=1`)

- Status: Done
- Priorité: 🟡 Moyenne
- Complexité: M
- Tags: rebuild-from-zero, dev, debug

## Description

Si l’URL contient **`debug=1`**, afficher un panneau (état WebSocket, pollers actifs, logs récents, statut composants) sans altérer le comportement production quand le mode est désactivé.

## Objectifs

- Fichier `overlay/dev/debug-panel.js`.
- S’abonner au Bus / Store pour les mises à jour.
- Activer le niveau `Log.debug` ou équivalent.

## Critères d’acceptation

- [x] Sans `?debug=1` : zéro code exécuté, zéro DOM créé.
- [x] z-index 9999 documenté ; zones overlay sans z-index fixé → pas de masquage.

## Résumé (implémentation)

- `URLSearchParams` → `location.search.indexOf(‘debug=1’)` (aligné sur logger.js).
- Arrow IIFE → `(function() { ... })()`.
- Template literals → concaténation.
- `function addEntry({ ts, level, scope, args })` → `function _addEntry(entry)` + accès explicites.
- `updateStatus()` appelé immédiatement (pas seulement après 2 s).

## Dépendances

- Bus, Log, WSManager, Poller, Config.

## Référence actuelle

- `overlay/dev/debug-panel.js`
