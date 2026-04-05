# Composant — Uptime (`uptime.json`, touche I)

- Status: Backlog
- Priorite: Moyenne
- Complexite: S
- Tags: rebuild-from-zero, widget, twitch

## Description

Duree du stream depuis le debut ou etat hors ligne. Fichier `uptime.json` ecrit par Streamer.bot sur Stream Online et Stream Offline (`WriteUptime.cs`). Format d affichage type heures et minutes.

## Objectifs

- `overlay/components/uptime.js`, `window.Uptime`.
- `overlay/styles/uptime.css`.

## Criteres d acceptation

- [ ] Hors ligne : libelle ou masquage coherent.
- [ ] Polling selon config sans erreurs si fichier absent.

## Dependances

- BaseComponent, Poller, Config, utils temps si besoin.

## Reference actuelle

- `overlay/components/uptime.js`, `streamerbot/WriteUptime.cs`
