# Composant — Musique (`nowplaying.json`, touche N)

- Status: Done
- Priorite: Moyenne
- Complexite: S
- Tags: rebuild-from-zero, widget, music

## Description

Titre et artiste en cours, flag visible/masque (`npActive` cote SB). Fichier `nowplaying.json`. Commande chat `!np` (mod) cote Streamer.bot.

## Objectifs

- `overlay/components/nowplaying.js`, `window.NowPlaying`.
- `overlay/styles/nowplaying.css`.

## Criteres d acceptation

- [ ] Titres echappes.
- [ ] Etat masque ne laisse pas de trou layout genant (option hidden).

## Dependances

- BaseComponent, Poller, Config.

## Reference actuelle

- `overlay/components/nowplaying.js`, `streamerbot/WriteNowPlaying.cs`
