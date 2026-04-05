# Composant — Sub train (`subtrain.json`, touche S)

- Status: Done
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, widget, twitch

## Description

Afficher une **rafale de subs** : compteur, barre ou timer de `trainDuration` (secondes, defaut config), noms recents si presents dans le JSON. Mise a jour via `WriteSubTrain.cs` sur sub/resub/gift.

## Objectifs

- `overlay/components/subtrain.js`, `window.SubTrain`.
- `overlay/styles/subtrain.css`.

## Criteres d acceptation

- [ ] Fin de train ou reset documente visuellement.
- [ ] Pas de fuite de timers `setInterval` non nettoyes.

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/subtrain.js`, `streamerbot/WriteSubTrain.cs`
