# Checklist de tests manuels (qualité régression)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: qa, documentation, obs, workflow

## Description

StreamAlerts n’a pas de suite automatisée navigateur imposée par les contraintes du projet. Pour limiter les régressions à chaque modification (refonte config, WebSocket, nouveaux widgets), il manque une **liste reproductible** de scénarios de test manuels : ce qu’il faut faire dans OBS, Streamer.bot et le navigateur, et le résultat attendu.

Cette tâche consiste à rédiger un fichier dédié (ex. `TESTING.md` à la racine ou dans `docs/`) structuré par domaine : bootstrap overlay, chat WS vs fallback, pollers, visibilité `!show`/`!hide`, sauvegarde dock, scène OBS, alertes, etc.

## Objectifs

- Rédiger 15 à 40 cases de test courtes (préconditions, étapes, résultat attendu).
- Inclure les cas d’erreur : JSON malformé, fichier absent, WS down.
- Lier les tests au mode `?debug=1` quand pertinent.

## Critères d'acceptation

- [ ] Le fichier est versionné et référencé depuis le README (section contribution ou dépannage).
- [ ] Chaque test est indépendant quand c’est possible, ou les dépendances sont explicites.
- [ ] Mention des versions cibles : OBS, Chromium embarqué « 90+ », Streamer.bot (générique).

## Dépendances

- Aucune ; peut être rédigé en parallèle de toute évolution.

## Notes techniques

- Format tableau Markdown ou listes numérotées ; rester concis pour que quelqu’un exécute la checklist en 20–40 minutes pour une release.
