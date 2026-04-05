# Composant — Sondage Twitch (`poll.json`, touche O)

- Status: Backlog
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, widget, twitch, poll

## Description

Affichage du sondage actif : titre, choix, votes ou pourcentages selon donnees `poll.json` (Created / Updated / Completed). Events Twitch branches dans `WritePoll.cs`.

## Objectifs

- `overlay/components/poll.js`, `window.Poll`.
- `overlay/styles/poll.css`.

## Criteres d acceptation

- [ ] Textes du sondage echappes.
- [ ] Etat termine : resultat ou disparition selon spec du JSON.

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/poll.js`, `streamerbot/WritePoll.cs`
