# Heartbeat Streamer.bot vers JSON (indicateur « bot actif »)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: streamerbot, json, diagnostic, timer

## Description

Quand l'overlay semble figé, la cause peut être **Streamer.bot arrêté**, un mauvais chemin d'écriture des fichiers, ou Apache. Un petit fichier `heartbeat.json` (ou équivalent) mis à jour **périodiquement** par un script C# sur un trigger Timer permettrait de savoir que la chaîne **Streamer.bot → disque** fonctionne, indépendamment de Twitch.

Le fichier contient au minimum un `timestamp` Unix ms à jour et éventuellement la version du script ou un compteur. L'overlay ou le dock peut afficher « dernier heartbeat il y a X s » en mode debug, ou une pastille dans le healthcheck.

## Objectifs

- Ajouter `streamerbot/WriteHeartbeat.cs` (ou nom cohérent) avec intervalle configurable côté SB (ex. 30 s).
- Documenter le trigger Timer dans le README.
- Optionnel : lire ce fichier depuis la page healthcheck ou le panneau debug.

## Critères d'acceptation

- [ ] Le JSON écrit respecte la convention `timestamp` du projet.
- [ ] Intervalle documenté ; pas d'écriture disque plus agressive que nécessaire (éviter 100 ms).
- [ ] Aucun impact sur l'overlay si le fichier est absent (première install).
- [ ] Chemin `BASE_PATH` ou équivalent aligné sur les autres scripts C#.

## Dépendances

- Scripts existants dans `streamerbot/`, éventuelle tâche healthcheck.

## Notes techniques

- Si plusieurs instances SB existent, documenter un seul writer pour éviter conflits.
