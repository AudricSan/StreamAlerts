# Streamer.bot — WriteChat.cs

- Status: Backlog
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, streamerbot, csharp, chat

## Description

Sur evenement Chat Message Twitch, ecrire chat.json pour le fallback polling du widget chat : pseudo, message, flags moderation abonne VIP broadcaster, couleur, timestamp. Le WebSocket reste la voie principale quand il fonctionne.

## Objectifs

- Fichier streamerbot/WriteChat.cs
- Trigger Twitch Chat Message

## Criteres d acceptation

- [ ] Schema compatible avec overlay/components/chat.js
- [ ] Gestion message vide

## Dependances

- chat.json

## Reference actuelle

- streamerbot/WriteChat.cs
