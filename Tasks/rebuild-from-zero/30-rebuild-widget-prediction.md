# Composant — Prediction Twitch (`prediction.json`, touche P)

- Status: Done
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, widget, twitch, prediction

## Description

Paris Twitch (deux options, couleurs bleu / rose typiques), etats Created / Updated / Resolved. Donnees `prediction.json` via `WritePrediction.cs`.

## Objectifs

- `overlay/components/prediction.js`, `window.Prediction`.
- `overlay/styles/prediction.css`.

## Criteres d acceptation

- [ ] Titres et outcomes echappes.
- [ ] UI lisible pour les pourcentages et le temps restant si present.

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/prediction.js`, `streamerbot/WritePrediction.cs`
