# Composant — Chat (`chat.json`, WebSocket, touche C)

- Status: Done
- Priorite: Haute
- Complexite: L
- Tags: rebuild-from-zero, widget, chat, websocket

## Description

Afficher les messages Twitch : **priorite WebSocket** (evenements `ChatMessage`, `ClearChat`), **fallback polling** sur `chat.json` si WS deconnecte. Options `maxMessages`, `msgLifetime`, badges (broadcaster, mod, VIP, sub), couleurs pseudo, persistance optionnelle `localStorage` pour survivre au reload OBS. Pas de `innerHTML` non echappe sur le contenu utilisateur.

## Objectifs

- `overlay/components/chat.js`, `window.Chat`.
- `overlay/styles/chat.css`.
- Desenregistrer le poller `chat` quand WS connecte ; re-enregistrer a la deconnexion.

## Criteres d acceptation

- [ ] XSS impossible sur user/message.
- [ ] WS + fallback testes independamment.

## Dependances

- BaseComponent, WSManager, Bus, Poller, Config, `utils/color`, `esc`.

## Reference actuelle

- `overlay/components/chat.js`, `streamerbot/WriteChat.cs`
