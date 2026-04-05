# Service — Polling centralisé (`window.Poller`)

- Status: Done
- Priorité: 🔴 Haute
- Complexité: M
- Tags: rebuild-from-zero, services, json

## Description

Toutes les lectures périodiques de fichiers JSON dans `overlay/data/` passent par un **gestionnaire unique** : enregistrement par `id`, chemin de fichier, intervalle minimum respecté (≥ 500 ms recommandé), premier fetch immédiat ou option `skipFirst`, callback `onData`, **déduplication par `timestamp`** pour ignorer les fichiers inchangés.

## Objectifs

- Fichier `overlay/services/polling-manager.js`, `window.Poller`.
- `register` / `unregister` pour permettre au chat de couper le poll quand le WS est actif.
- Gestion fetch erreur réseau sans crash.

## Critères d’acceptation

- [x] Impossible d’enregistrer deux pollers avec le même `id` — le second est ignoré avec `Log.warn`.
- [x] JSON invalide : `Log.debug` + pas de throw vers le haut.

## Résumé (implémentation)

Fichier `overlay/services/polling-manager.js` réécrit proprement.
- `catch (_)` → `catch (e) + Log.debug` — visible en mode `?debug=1`, silencieux en prod.
- Destructuring paramètre → `options.x` explicite (plus défensif).
- `Math.max(500, interval)` — intervalle minimum 500 ms enforced.
- `Object.values()` → `Object.keys() + map` (un poil plus compatible).
- Template literals → concaténation de strings.

## Dépendances

- Logger, Bus (optionnel pour stats debug).

## Référence actuelle

- `overlay/services/polling-manager.js`
