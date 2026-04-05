# Service — Scene OBS (`window.SceneManager`)

- Status: Backlog
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, services, obs

## Description

Detecter la scene OBS active pour appliquer des classes CSS sur `body` (prefixe `scene-`, profils selon mapping), et notifier les abonnes `onChange`. Deux modes : API `window.obsstudio` si disponible dans la Browser Source, sinon polling de `current-scene.json` avec champ `timestamp`. Section config `scene` : `defaultScene`, `pollInterval`.

## Objectifs

- Fichier `overlay/services/scene-manager.js`.
- API : `init`, `getScene`, `getProfile`, `setScene`, `onChange`, `isScene`, `isProfile`.

## Criteres d acceptation

- [ ] Fonctionne dans un navigateur hors OBS (scene par defaut + polling si fichier present).
- [ ] Pas de double initialisation.

## Dependances

- Poller, Config, Logger.

## Reference actuelle

- `overlay/services/scene-manager.js`
