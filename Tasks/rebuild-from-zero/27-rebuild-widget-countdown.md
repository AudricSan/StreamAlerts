# Composant — Compte a rebours (`countdown.json`, touche D)

- Status: Backlog
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, widget, timer

## Description

Compte a rebours vers une cible temporelle ou duree. Commandes chat gerees par `WriteCountdown.cs`. Fichier `countdown.json` avec `timestamp` et etat.

## Objectifs

- `overlay/components/countdown.js`, `window.Countdown`.
- `overlay/styles/countdown.css`.

## Criteres d acceptation

- [ ] Arret et reset sans erreurs JS.
- [ ] Affichage temps restant fluide (tick documente).

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/countdown.js`, `streamerbot/WriteCountdown.cs`
