# Améliorations du chat overlay (commandes, mentions, badges)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: chat, websocket, overlay, twitch, ux

## Description

Enrichir le widget **chat** avec des options configurables : masquer ou atténuer les messages de **commandes** (`!…`), **mise en évidence** des messages contenant la mention du streamer, et affichage de **badges Twitch supplémentaires** (Prime, Founder, Artist, etc.) lorsque Streamer.bot fournit les drapeaux dans le payload WebSocket.

## Objectifs

- Options dans `config.json` (section `chat`) : `hideCommands`, `highlightMentions`, liste des préfixes ou regex documentée, styles CSS discrets.
- Parser le message affiché de façon sûre (échappement conservé ; pas d’HTML utilisateur brut).
- Étendre le mapping des badges dans `chat.js` selon les champs réellement disponibles depuis Streamer.bot.

## Critères d’acceptation

- [ ] Avec `hideCommands` activé, les lignes correspondant aux critères ne polluent pas l’overlay (comportement documenté).
- [ ] Les mentions configurées restent échappées ; highlight uniquement via classes CSS / spans sûrs.
- [ ] Badges supplémentaires ne cassent pas le layout sur petites largeurs de zone.
- [ ] Fallback polling (`chat.json`) reste fonctionnel si les champs supplémentaires sont absents.
- [ ] Pas de `console.log` en production ; logs via `Log` si nécessaire.

## Dépendances

- `overlay/components/chat.js`, `services/websocket-manager.js`, événements Twitch ChatMessage dans Streamer.bot.

## Notes techniques

- Vérifier la forme exacte des objets `ChatMessage` dans la doc / tests Streamer.bot de l’utilisateur.
- Respecter les perfs OBS : éviter de recalculer tout le DOM à chaque message.
