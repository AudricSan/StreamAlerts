# Composant — Stats de session (`session.json`, touche E)

- Status: Backlog
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, widget, stats

## Description

Compteurs agreges du live : follows, subs, bits, raids, dons selon le schema `session.json`. Ecrit par `WriteSession.cs` sur les memes familles d evenements que les alertes.

## Objectifs

- `overlay/components/session.js`, `window.Session`.
- `overlay/styles/session.css`.

## Criteres d acceptation

- [ ] Champs manquants : zero ou masque propre.
- [ ] Eviter rebuild DOM complet chaque poll si possible.

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/session.js`, `streamerbot/WriteSession.cs`
