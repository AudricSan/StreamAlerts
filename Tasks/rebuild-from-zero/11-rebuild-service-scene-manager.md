# Service — Scene OBS (`window.SceneManager`)

- Status: Done
- Priorite: Moyenne
- Complexite: M
- Tags: rebuild-from-zero, services, obs

## Description

Detecter la scene OBS active pour appliquer des classes CSS sur `body` (prefixe `scene-`, profils selon mapping), et notifier les abonnes `onChange`. Deux modes : API `window.obsstudio` si disponible dans la Browser Source, sinon polling de `current-scene.json` avec champ `timestamp`. Section config `scene` : `defaultScene`, `pollInterval`.

## Objectifs

- Fichier `overlay/services/scene-manager.js`.
- API : `init`, `getScene`, `getProfile`, `setScene`, `onChange`, `isScene`, `isProfile`.

## Criteres d acceptation

- [x] Fonctionne dans un navigateur hors OBS (scène par défaut + polling JSON si obsstudio absent).
- [x] Pas de double initialisation (flag `_initialized`).

## Résumé (implémentation)

Fichier `overlay/services/scene-manager.js` réécrit proprement.
- Bug corrigé : `Store.set('obs.scenes', names)` → `Store.set('obs', 'scenes', names)` (signature namespace/key/value).
- En-tête `// /* ... */` reformaté en bloc standard `/* ... */`.
- `if (cfg.pollInterval && ...)` → `typeof cfg.pollInterval === 'number'` (plus précis).
- `profile.profile` vérifié avant log (évite crash si profil null).
- Code déjà propre (var, boucles explicites, shallowCopy) — conservé.

## Dependances

- Poller, Config, Logger.

## Reference actuelle

- `overlay/services/scene-manager.js`
