# Service — Visibilite des zones (`window.Visibility`)

- Status: Done
- Priorite: Haute
- Complexite: M
- Tags: rebuild-from-zero, services, visibility, chat

## Description

Gerer l affichage runtime des zones overlay : etat lu depuis `visibility.json` (polling ou init), commandes chat `!show`, `!hide`, `!toggle` et alias (WebSocket en priorite, fallback JSON via WriteVisibility.cs), respect du flag `enabled: false` dans la config (desactivation definitive). Persister les changements dans `overlay/data/visibility.json` selon le mecanisme actuel (API PHP ou autre).

## Objectifs

- Fichier `overlay/services/visibility-manager.js`.
- Table alias vers cle composant alignee sur `ZONE_DEFS` du bootstrap.
- Evenements Bus (`visibility:changed`, etc.) si le projet les utilise.

## Criteres d acceptation

- [x] Un composant `enabled: false` dans config ne peut pas être affiché par commande chat (check dans `handleCmd` ET dans `apply`).
- [x] États cohérents après reload — `_poll()` applique l'état dès `init()`.

## Résumé (implémentation)

Fichier `overlay/services/visibility-manager.js` réécrit proprement.
- `Config.isEnabled(cfgKey)` ajouté dans `handleCmd()` (early return) et dans `apply()` (skip).
- `el.dataset.disabled` remplacé par `Config.isEnabled()` — source de vérité unique.
- `Object.entries` + destructuring → `Object.keys + accès explicite`.
- `catch (_)` → `catch (e) + Log.debug / Log.error`.
- Object spread → pas de spread (accès par clé).
- visibility.json sans `timestamp` → `setInterval` direct (Poller exige timestamp).

## Dependances

- Bus, WSManager, Config, Poller ou fetch initial, `api.php` si ecriture.

## Reference actuelle

- `overlay/services/visibility-manager.js`
