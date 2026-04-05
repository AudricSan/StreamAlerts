# Outils dev — panneau debug (`?debug=1`)

- Status: Backlog
- Priorité: 🟡 Moyenne
- Complexité: M
- Tags: rebuild-from-zero, dev, debug

## Description

Si l’URL contient **`debug=1`**, afficher un panneau (état WebSocket, pollers actifs, logs récents, statut composants) sans altérer le comportement production quand le mode est désactivé.

## Objectifs

- Fichier `overlay/dev/debug-panel.js`.
- S’abonner au Bus / Store pour les mises à jour.
- Activer le niveau `Log.debug` ou équivalent.

## Critères d'acceptation

- [ ] `?debug=1` n’est pas requis pour un stream normal.
- [ ] Panneau ne masque pas les alertes critiques (z-index documenté).

## Dépendances

- Bus, Log, WSManager, Poller, Config.

## Référence actuelle

- `overlay/dev/debug-panel.js`
