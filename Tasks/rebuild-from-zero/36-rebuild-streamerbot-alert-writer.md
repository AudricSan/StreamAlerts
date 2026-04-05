# Streamer.bot — script alertes et last follow sub

- Status: Done
- Priorite: Haute
- Complexite: L
- Tags: rebuild-from-zero, streamerbot, csharp, twitch

## Description

Script C# Streamer.bot qui ecrit les alertes dans le fichier alert du dossier data overlay, avec types follow sub raid bits donation etc. Met a jour les fichiers last follower et last subscriber quand c est pertinent. Argument alertType. Timestamp Unix ms obligatoire. Chemin disque configurable.

## Objectifs

- Fichier source streamerbot/WriteAlert.cs dans le depot
- Documentation README pour actions et triggers Twitch

## Criteres d acceptation

- [ ] Script compile dans Streamer.bot
- [ ] Personnalisation du chemin Windows documentee pour les utilisateurs

## Dependances

- Fichiers JSON alert last_follower last_subscriber

## Reference actuelle

- streamerbot/WriteAlert.cs
