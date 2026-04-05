# Service — WebSocket Streamer.bot (`window.WSManager`)

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: L
- Tags: rebuild-from-zero, services, websocket, chat

## Description

Une **connexion WebSocket** unique vers le serveur Streamer.bot : connexion, authentification si mot de passe, souscription aux événements, reconnexion avec backoff, émission sur le Bus des messages normalisés (`ws:message`, `ws:connected`, `ws:disconnected`). Les composants ne ouvrent pas leurs propres sockets.

## Objectifs

- Fichier `overlay/services/websocket-manager.js`.
- Lecture URL / mot de passe depuis `Config` (section chat ou `env` selon évolution).
- Parsing défensif des payloads ; pas de crash sur message inconnu.

## Critères d'acceptation

- [ ] Reconnexion ne spam pas le serveur.
- [ ] Chat et visibilité peuvent consommer les événements sans dupliquer la logique de connexion.

## Dépendances

- Bus, Logger, Config.

## Référence actuelle

- `overlay/services/websocket-manager.js`
