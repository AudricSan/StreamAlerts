# Bandeau infos chaîne (titre + jeu / catégorie)

- Status: Backlog
- Priorité: 🟡 Moyenne
- Complexité: M
- Tags: overlay, streamerbot, json, twitch, metadata

## Description

Afficher sur l’overlay le **titre du stream** et/ou le **jeu ou la catégorie** Twitch, mis à jour lorsque la chaîne change ces informations, sans appeler l’API Twitch depuis le navigateur.

## Objectifs

- Définir un schéma JSON (ex. `channel_info.json`) avec `timestamp` et champs titre, catégorie, éventuellement langue.
- Créer un composant overlay léger + configuration (poller, zone, style).
- Fournir un script Streamer.bot (C#) déclenché sur les événements de mise à jour de chaîne appropriés.

## Critères d’acceptation

- [ ] JSON valide, `timestamp` présent, gestion gracieuse si fichier manquant.
- [ ] Texte affiché échappé (XSS) ; pas d’`innerHTML` non sécurisé.
- [ ] Intégration complète : `index.html`, `script.js`, `ZONE_DEFS`, `COMPONENTS`, défauts `config-manager.js`.
- [ ] Documentation des triggers Streamer.bot dans le README.

## Dépendances

- Vérifier quels événements Streamer.bot expose pour « channel / stream info updated » sur la version utilisée.

## Notes techniques

- Garder le polling ≥ 500 ms ou mise à jour uniquement à l’écriture du fichier si l’événement est fiable.
- Prévoir troncature / ellipsis CSS pour titres longs (perf OBS).
