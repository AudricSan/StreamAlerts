# Composant — Dernier abonne (`last_subscriber.json`, touche L partagee)

- Status: Done
- Priorite: Moyenne
- Complexite: S
- Tags: rebuild-from-zero, widget, twitch

## Description

Afficher le **dernier abonne** (sub / resub / gift selon donnees ecrites), source `last_subscriber.json`, polling et `timestamp`. Comportement symetrique au last follower.

## Objectifs

- `overlay/components/last-subscriber.js`, `window.LastSubscriber`.
- Zone `#zone-last-subscriber`.

## Criteres d acceptation

- [x] Contenu utilisateur echappe.
- [x] Coexistence avec last-follower au clavier (cycle L ou comportement documente).

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/last-subscriber.js`, `WriteAlert.cs`
