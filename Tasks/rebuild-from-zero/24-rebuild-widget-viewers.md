# Composant — Spectateurs (`viewers.json`, touche V)

- Status: Done
- Priorite: Moyenne
- Complexite: S
- Tags: rebuild-from-zero, widget, twitch

## Description

Afficher le **nombre de viewers** en direct, mis a jour par timer Streamer.bot (ex. 30 s) dans `viewers.json` avec `timestamp`.

## Objectifs

- `overlay/components/viewers.js`, `window.ViewerCount`.
- `overlay/styles/viewers.css`.

## Criteres d acceptation

- [ ] Nombre formate de facon lisible (separateurs si prevus).
- [ ] Polling interval coherent (config ou defaut).

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/viewers.js`, `streamerbot/WriteViewers.cs`
