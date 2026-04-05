# Bootstrap overlay — `script.js` (orchestration)

- Status: Done
- Priorité: 🔴 Haute
- Complexité: M
- Tags: rebuild-from-zero, overlay, bootstrap

## Description

Couche finale qui : définit **`ZONE_DEFS`** (id + alias visibilité), mappe **`COMPONENTS`** vers `window.*`, attend `DOMContentLoaded`, appelle `Config.load()`, applique **layout** (top/left/width/opacity/enabled) sur chaque zone, initialise chaque composant si `Config.isEnabled`, démarre `Visibility` et `SceneManager`, init `WSManager` si présent, met à jour les hints clavier.

## Objectifs

- Fichier `overlay/script.js` (IIFE ou objet `Bootstrap`).
- Gestion des instances manquantes (warn log, pas de throw global).

## Critères d'acceptation

- [x] Désactiver un composant dans config saute `instance.init()` (check avant + dans BaseComponent).
- [x] `enabled: false` masque la zone DOM et pose `data-disabled="1"` via `_applyLayout`.

## Résumé (implémentation)

Fichier `overlay/script.js` réécrit proprement.
- `Object.entries` + destructuring → `Object.keys` + accès explicite.
- Arrow functions → fonctions anonymes.
- Template literals → concaténation.
- Regex CSS camelCase→kebab → liste explicite `LAYOUT_PROPS` + `maxHeight` séparé.
- `Config.load().then(...)` au lieu de `async/await` sur le handler DOM.
- `window.Keyboard`, `window.SceneManager`, `window.WSManager` vérifiés défensivement.
- `try/catch` autour de chaque `instance.init()` — un composant cassé n'arrête pas les autres.
- `ZONE_DEFS` et `COMPONENTS` exposés en `var` de portée globale script (référencés par Visibility).

## Dépendances

- Config, tous les composants globaux, Visibility, SceneManager, WSManager, Log, Keyboard (dev).

## Référence actuelle

- `overlay/script.js`
