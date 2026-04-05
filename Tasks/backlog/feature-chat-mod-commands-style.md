# Style distinct pour les commandes réservées aux modérateurs (si données disponibles)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: chat, twitch, websocket, ui

## Description

Certaines commandes de chat ne concernent que la **modération** ou le **bot** (`!timeout`, `!raid`, etc.). Si Streamer.bot transmet dans l’événement `ChatMessage` suffisamment d’information pour savoir qu’un message est une **commande** et/ou émis par un **modérateur**, l’overlay peut appliquer un **style atténué** (opacité, petite icône, couleur de fond discrète) pour que le chat à l’écran reste lisible pour le gameplay.

Si les champs ne sont pas fiables ou absents selon les versions, la fonctionnalité doit rester **désactivée par défaut** et la doc doit indiquer les prérequis côté Streamer.bot.

## Objectifs

- Cartographier les champs disponibles sur `ChatMessage` (ex. message commence par `/`, flag `isMod`, propriétés spécifiques SB).
- Options config : `dimModCommands`, `dimBotCommands`, seuils documentés.
- Styles CSS sans casser l’accessibilité (contraste minimal respecté ou option « off »).

## Critères d'acceptation

- [ ] Sans flags supportés, aucun changement visible.
- [ ] Avec flags, rendu distinct documenté ; pas de fuite de données privées (messages toujours traités comme du contenu public Twitch).
- [ ] Cohérence entre mode WS et mode polling si le JSON fallback expose les mêmes booléens.

## Dépendances

- `chat.js`, payload WebSocket documenté Streamer.bot.

## Notes techniques

- Ne pas confondre « commande mod » et « message normal d’un mod » ; la règle doit être explicite dans la doc et la config.
