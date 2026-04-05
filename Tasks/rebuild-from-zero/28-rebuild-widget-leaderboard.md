# Composant — Classement (`leaderboard.json`, touche B)

- Status: Done
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, widget, bits, donation

## Description

Top donateurs ou top bits du stream (liste ordonnee), fichier `leaderboard.json` ecrit par `WriteLeaderboard.cs` (Cheer, Donation, etc.). Limiter le nombre de lignes affichees selon config ou CSS.

## Objectifs

- `overlay/components/leaderboard.js`, `window.Leaderboard`.
- `overlay/styles/leaderboard.css`.

## Criteres d acceptation

- [ ] Pseudos et montants echappes / formates.
- [ ] Liste vide : etat UI neutre.

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/leaderboard.js`, `streamerbot/WriteLeaderboard.cs`
