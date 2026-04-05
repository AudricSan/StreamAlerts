# Streamer.bot — WriteVisibility.cs

- Status: Backlog
- Priorite: Basse
- Complexite: S
- Tags: rebuild-from-zero, streamerbot, csharp, visibility

## Description

Optionnel : ecrire visibility.json quand les commandes show hide toggle sont traitees par chat sans WebSocket, ou pour synchroniser etat. Le README indique que le WS peut suffire.

## Objectifs

- Fichier streamerbot/WriteVisibility.cs

## Criteres d acceptation

- [ ] Ne contredit pas la logique Visibility overlay si les deux coexistent
- [ ] timestamp present

## Dependances

- visibility.json, visibility-manager.js

## Reference actuelle

- streamerbot/WriteVisibility.cs
