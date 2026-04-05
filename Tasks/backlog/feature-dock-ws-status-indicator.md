# Indicateur de connexion WebSocket dans le dock

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: config, dock, websocket, ux, diagnostics

## Description

Afficher dans la **page de configuration** (dock OBS) un **indicateur visuel** de l’état du WebSocket Streamer.bot (connecté / déconnecté / tentative), sans obliger l’utilisateur à ouvrir l’overlay en `?debug=1`.

## Objectifs

- Réutiliser la même URL et mot de passe que la config (`env` ou `chat` selon évolution du projet).
- Connexion WebSocket **dédiée au dock** ou ping léger (éviter les conflits avec l’overlay si même serveur — documenter : un seul client ou plusieurs autorisés par Streamer.bot).
- Mise à jour de l’UI en temps réel avec libellés clairs en français.

## Critères d’acceptation

- [ ] L’indicateur reflète fidèlement connecté vs erreur (timeout, auth refusée si détectable).
- [ ] Pas de fuite : fermeture propre du WS à la fermeture ou au changement d’onglet si nécessaire.
- [ ] Échec réseau n’empêche pas l’édition du reste de la config.
- [ ] Pas de mot de passe affiché en clair dans les logs du navigateur.

## Dépendances

- Éventuelle refonte `config-ui-rework.md` (emplacement des paramètres WebSocket dans `env`).

## Notes techniques

- Vérifier la politique de Streamer.bot sur plusieurs connexions simultanées depuis la même machine.
- Si double connexion pose problème, fallback : fetch périodique d’un endpoint local ou simple test TCP impossible en JS → se limiter à WS depuis le dock uniquement en dev.
