# Composant — Objectif (`goal.json`, touche G)

- Status: Done
- Priorite: Haute
- Complexite: M
- Tags: rebuild-from-zero, widget, goal

## Description

Barre de progression : valeur courante, cible, label, type (sub, follow, bits, donation, custom) pour variante visuelle. Donnees dans `goal.json` avec champ `timestamp`. Cote Streamer.bot : arguments `goalIncrement`, `goalTarget`, `goalLabel`, `goalType`, `goalReset` (voir README).

## Objectifs

- `overlay/components/goals.js`, `window.Goals`.
- `overlay/styles/goals.css`.

## Criteres d acceptation

- [ ] Label echappe au rendu.
- [ ] Valeurs invalides gerees sans affichage NaN.

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/goals.js`, `streamerbot/WriteGoal.cs`
