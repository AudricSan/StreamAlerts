# Composant — File d attente (`queue.json`, touche U)

- Status: Backlog
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, widget, queue

## Description

Liste des joueurs / viewers dans la file : etat ouvert/ferme, commandes `!join`, `!leave`, `!next`, etc. gerees par Streamer.bot. Limite `maxVisible` depuis config. Polling `queue.json`.

## Objectifs

- `overlay/components/queue.js`, `window.Queue`.
- `overlay/styles/queue.css`.

## Criteres d acceptation

- [ ] Pseudos echappes.
- [ ] File vide et file pleine : UI claire.

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/queue.js`, `streamerbot/WriteQueue.cs`
