# Noyau — Store d’état runtime (`window.Store`)

- Status: Done
- Priorité: 🟢 Basse
- Complexité: S
- Tags: rebuild-from-zero, core, state

## Description

Fournir un **objet partagé** pour l’état volatile entre modules (pas un substitut à la persistance JSON). Utilisé ponctuellement par le debug panel ou d’autres services.

## Objectifs

- Fichier `overlay/core/state-store.js`, `window.Store`.
- API simple : get/set/clear ou structure documentée dans le code existant.

## Critères d'acceptation

- [x] Initialisation sans erreur si aucune donnée.
- [x] Documenté comme « temporaire uniquement » dans CLAUDE.

## Résumé (implémentation)

Fichier `overlay/core/state-store.js` réécrit proprement.
- `?.` optionnel remplacé par vérification explicite (`if (!_data[namespace])`).
- `catch (_) {}` silencieux → `Log.warn` pour traçabilité.
- `clear(namespace)` ajouté (vide un namespace ou tout le store).
- Template literals → concaténation de strings (plus défensif, pas de dépendance syntaxique).
- `dump()` utilise `Object.assign` au lieu de spread.

## Dépendances

- Logger (optionnel).

## Référence actuelle

- `overlay/core/state-store.js`
