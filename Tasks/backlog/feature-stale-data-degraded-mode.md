# Indicateur de mode dégradé (données / WebSocket obsolètes)

- Status: Done
- Priorité: 🟡 Moyenne
- Complexité: M
- Tags: overlay, websocket, polling, ux, reliability

## Description

Aujourd’hui, si le **WebSocket Streamer.bot** est coupé, le chat peut retomber sur le **polling** de `chat.json` ; d’autres widgets dépendent uniquement du Poller. L’utilisateur n’a pas toujours un retour visuel clair lorsque les données sont **périmées** (fichier non mis à jour depuis longtemps) ou lorsque **toutes** les sources temps réel sont silencieuses.

Cette fonctionnalité consiste à afficher une **bannière ou un pictogramme discret** (configurable, désactivable) lorsque des conditions sont réunies : par exemple WebSocket déconnecté depuis plus de X secondes **et** dernier message chat ou dernier `timestamp` global considéré comme trop vieux. Le but n’est pas d’alarmer les viewers en production : prévoir un mode « streamer only » (coin d’écran, opacité faible) ou activation uniquement avec `?debug=1`.

## Objectifs

- Définir les règles de « staleness » par source critique (chat, ou agrégat minimal) avec seuils en secondes dans `config.json`.
- Centraliser la logique (petit module ou service) pour éviter de dupliquer des timers dans chaque composant.
- Permettre de désactiver complètement l’indicateur pour les overlays « propres » face caméra.

## Critères d'acceptation

- [ ] Aucun impact mesurable sur les perfs OBS quand l’indicateur est désactivé.
- [ ] Pas de faux positifs permanents en usage normal (WS connecté, chat actif).
- [ ] Libellés ou icônes échappés ; pas d’injection HTML depuis la config.
- [ ] Documenter les seuils recommandés et le comportement WS + fallback JSON.

## Dépendances

- `WSManager`, `Poller`, `Bus` (`ws:connected` / `ws:disconnected`), `config-manager.js`.

## Notes techniques

- Chromium 90 : éviter APIs récentes ; utiliser `Date.now()` et derniers timestamps connus en mémoire.
- Envisager un seul `setInterval` global pour le check, pas un par widget.
