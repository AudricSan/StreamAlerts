# Streamer.bot — WriteSession.cs

- Status: Done
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, streamerbot, csharp, stats

## Description

Incrementer les compteurs de session dans `session.json` (follows, subs, bits, raids, dons, etc.) sur les memes familles d evenements que les alertes. Reset eventuel en debut de stream documente.

## Objectifs

- Fichier `streamerbot/WriteSession.cs`.

## Criteres d acceptation

- [ ] Schema aligne avec `session.js`.
- [ ] Pas de perte de compteurs sur ecriture concurrente (strategie fichier actuelle documentee).

## Dependances

- session.json.

## Reference actuelle

- `streamerbot/WriteSession.cs`
