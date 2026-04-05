# Service — Polling centralisé (`window.Poller`)

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: M
- Tags: rebuild-from-zero, services, json

## Description

Toutes les lectures périodiques de fichiers JSON dans `overlay/data/` passent par un **gestionnaire unique** : enregistrement par `id`, chemin de fichier, intervalle minimum respecté (≥ 500 ms recommandé), premier fetch immédiat ou option `skipFirst`, callback `onData`, **déduplication par `timestamp`** pour ignorer les fichiers inchangés.

## Objectifs

- Fichier `overlay/services/polling-manager.js`, `window.Poller`.
- `register` / `unregister` pour permettre au chat de couper le poll quand le WS est actif.
- Gestion fetch erreur réseau sans crash.

## Critères d'acceptation

- [ ] Impossible d’enregistrer deux pollers avec le même `id` sans comportement défini documenté.
- [ ] JSON invalide : log + pas de throw vers le haut.

## Dépendances

- Logger, Bus (optionnel pour stats debug).

## Référence actuelle

- `overlay/services/polling-manager.js`
