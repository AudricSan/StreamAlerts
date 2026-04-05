# Bootstrap overlay — `script.js` (orchestration)

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: M
- Tags: rebuild-from-zero, overlay, bootstrap

## Description

Couche finale qui : définit **`ZONE_DEFS`** (id + alias visibilité), mappe **`COMPONENTS`** vers `window.*`, attend `DOMContentLoaded`, appelle `Config.load()`, applique **layout** (top/left/width/opacity/enabled) sur chaque zone, initialise chaque composant si `Config.isEnabled`, démarre `Visibility` et `SceneManager`, init `WSManager` si présent, met à jour les hints clavier.

## Objectifs

- Fichier `overlay/script.js` (IIFE ou objet `Bootstrap`).
- Gestion des instances manquantes (warn log, pas de throw global).

## Critères d'acceptation

- [ ] Désactiver un composant dans config ne charge pas son `init` inutilement.
- [ ] `enabled: false` masque la zone et pose `data-disabled`.

## Dépendances

- Config, tous les composants globaux, Visibility, SceneManager, WSManager, Log, Keyboard (dev).

## Référence actuelle

- `overlay/script.js`
