# Noyau — Event Bus (`window.Bus`)

- Status: Done
- Priorité: 🔴 Haute
- Complexité: S
- Tags: rebuild-from-zero, core, events

## Description

Implémenter un **pub/sub global** minimal : `on`, `off` (ou équivalent), `emit`, pour découpler les composants des services (config chargée, messages WebSocket, visibilité, logs, etc.).

## Objectifs

- Fichier `overlay/core/event-bus.js`, `window.Bus`.
- Pas de fuite mémoire évidente sur abonnements répétés (documenter usage).
- Liste des noms d’événements alignée sur le README / CLAUDE.

## Critères d'acceptation

- [x] Plusieurs abonnés sur le même événement reçoivent tous le payload.
- [x] Erreur dans un handler ne fait pas planter les autres (try/catch + Log.warn).

## Résumé (implémentation)

Fichier `overlay/core/event-bus.js` réécrit proprement.
- `console.error` → `Log.warn` (Log chargé avant Bus, pas de dépendance circulaire).
- `once()` retourne désormais le unsubscribe (cohérence avec `on()`).
- `slice()` au lieu de spread `[...]` pour copier le tableau avant itération (évite mutation pendant emit).
- `scene:changed` ajouté à la liste des événements documentés en en-tête.

## Dépendances

- Logger.

## Référence actuelle

- `overlay/core/event-bus.js`
