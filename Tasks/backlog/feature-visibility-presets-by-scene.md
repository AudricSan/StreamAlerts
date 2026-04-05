# Presets de visibilité selon la scène OBS

- Status: Backlog
- Priorité: 🟡 Moyenne
- Complexité: L
- Tags: overlay, scene-manager, visibility, obs, config

## Description

Lorsque **la scène OBS change** (déjà détectée via `SceneManager` et/ou `current-scene.json`), appliquer automatiquement un **preset de visibilité** : quelles zones sont visibles, lesquelles sont masquées (en respectant `enabled: false` dans la config).

## Objectifs

- Définir dans la config une structure du type : nom de scène ou motif → liste de zones / commandes équivalentes à show/hide.
- Brancher la logique sur `SceneManager.onChange` (ou événement Bus dédié) pour mettre à jour l’état géré par `Visibility` sans casser les commandes chat `!show` / `!hide` / `!toggle`.
- Optionnel : synchroniser ou non avec `visibility.json` selon le comportement souhaité (documenter le choix).

## Critères d’acceptation

- [ ] Changement de scène met à jour l’overlay de façon déterministe selon le preset.
- [ ] Les composants désactivés dans `config.json` restent non affichables.
- [ ] Pas de boucle infinie ni d’écritures JSON excessives côté overlay.
- [ ] Configuration documentée (exemples de presets « Gameplay », « BRB », « Starting »).

## Dépendances

- `services/scene-manager.js`, `services/visibility-manager.js`, `overlay/data/visibility.json`.

## Notes techniques

- Éviter les syntaxes JS non supportées par Chromium 90.
- Prévoir un preset « défaut » si la scène n’a pas de mapping.
