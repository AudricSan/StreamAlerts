# Service — WebSocket Streamer.bot (`window.WSManager`)

- Status: Done
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

- [x] Reconnexion ne spam pas le serveur (délai fixe 3 s, flag `_intentional` pour `disconnect()` volontaire).
- [x] Chat et visibilité consomment `Bus.on('ws:message', ...)` — zéro logique de connexion dupliquée.

## Résumé (implémentation)

Fichier `overlay/services/websocket-manager.js` réécrit proprement.
- `?.` optional chaining → checks explicites (`evtObj ? evtObj.source : null`).
- `catch (_)` silencieux → `catch (e) + Log.debug` sur parse JSON.
- `String.fromCharCode(...bytes)` → boucle `for` (pas de spread, sûr quelle que soit la taille du buffer).
- `_intentional` flag : `disconnect()` public ne relance pas le retry.
- `_handleMessage` extrait en fonction nommée (lisibilité).
- `_authenticate` wrappé dans try/catch — erreur crypto ferme proprement la socket.

## Dépendances

- Bus, Logger, Config.

## Référence actuelle

- `overlay/services/websocket-manager.js`
