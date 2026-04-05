# Streamer.bot — WriteViewers.cs

- Status: Backlog
- Priorite: Moyenne
- Complexite: S
- Tags: rebuild-from-zero, streamerbot, csharp, twitch

## Description

Timer periodique (ex. 30 s) : lire le nombre de viewers Twitch et ecrire `viewers.json` avec `timestamp`.

## Objectifs

- Fichier `streamerbot/WriteViewers.cs`.
- Trigger Timer dans SB documente.

## Criteres d acceptation

- [ ] Valeur numerique stable pour le widget.
- [ ] Gestion hors ligne ou erreur API SB sans crash script.

## Dependances

- viewers.json.

## Reference actuelle

- `streamerbot/WriteViewers.cs`
