# Noyau — Event Bus (`window.Bus`)

- Status: Backlog
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

- [ ] Plusieurs abonnés sur le même événement reçoivent tous le payload.
- [ ] Erreur dans un handler ne fait pas planter les autres (try/catch ou garde-fou documenté).

## Dépendances

- Logger.

## Référence actuelle

- `overlay/core/event-bus.js`
