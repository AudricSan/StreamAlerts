# Composant — Hype Train (`hypetrain.json`, touche H)

- Status: Done
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, widget, twitch, hypetrain

## Description

Barre / niveau du Hype Train Twitch : progression, niveau, temps restant si fourni. Evenements Start / Update / End dans `WriteHypeTrain.cs`.

## Objectifs

- `overlay/components/hypetrain.js`, `window.HypeTrain`.
- `overlay/styles/hypetrain.css`.

## Criteres d acceptation

- [ ] Train termine : widget se cache ou affiche etat neutre.
- [ ] Animations legeres (transform/opacity).

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/hypetrain.js`, `streamerbot/WriteHypeTrain.cs`
