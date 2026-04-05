# Streamer.bot — WriteSubTrain.cs

- Status: Done
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, streamerbot, csharp, subtrain

## Description

Sur Subscribe, Re-Subscribe, Gift Subscription : mettre a jour `subtrain.json` (compteur, utilisateur courant, fin de fenetre `trainDuration`). Argument `user`, `trainDuration` (secondes).

## Objectifs

- Fichier `streamerbot/WriteSubTrain.cs`.

## Criteres d acceptation

- [ ] Fin / expiration du train coherente avec le widget JS.
- [ ] `timestamp` a chaque ecriture.

## Dependances

- subtrain.json.

## Reference actuelle

- `streamerbot/WriteSubTrain.cs`
