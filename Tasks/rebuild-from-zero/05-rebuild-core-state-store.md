# Noyau — Store d’état runtime (`window.Store`)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: rebuild-from-zero, core, state

## Description

Fournir un **objet partagé** pour l’état volatile entre modules (pas un substitut à la persistance JSON). Utilisé ponctuellement par le debug panel ou d’autres services.

## Objectifs

- Fichier `overlay/core/state-store.js`, `window.Store`.
- API simple : get/set/clear ou structure documentée dans le code existant.

## Critères d'acceptation

- [ ] Initialisation sans erreur si aucune donnée.
- [ ] Documenté comme « temporaire uniquement » dans CLAUDE.

## Dépendances

- Logger (optionnel).

## Référence actuelle

- `overlay/core/state-store.js`
