# Noyau — Gestionnaire de configuration (`window.Config`)

- Status: Done
- Priorité: 🔴 Haute
- Complexité: M
- Tags: rebuild-from-zero, core, config, persistence

## Description

Charger `overlay/data/config.json` (fetch), fusionner avec des **DEFAULTS** par composant (`enabled`, `pollInterval`, options spécifiques, section `env` pour WebSocket), exposer `get`, `isEnabled`, `load`, et `save` vers `config/api.php` en POST pour persistance depuis le dock. Émettre `config:loaded` sur le Bus.

## Objectifs

- Fichier `overlay/core/config-manager.js`.
- Chemins relatifs corrects selon que l’appel vient de l’overlay ou de `/config/`.
- Validation basique avant sauvegarde ; gestion d’erreur avec logs.

## Critères d’acceptation

- [x] Config manquante ou JSON invalide → repli sur defaults sans crash.
- [x] `save` met à jour l’état local seulement après succès API.
- [x] Tous les composants documentés ont une entrée dans DEFAULTS.

## Résumé (implémentation)

Fichier `overlay/core/config-manager.js` réécrit proprement.
- `get()` supporte désormais la notation pointée (`’chat.maxMessages’`).
- `_merge()` réécrit avec `Object.assign` (pas de spread d’objet, plus défensif).
- `allKeys` construit sans `Set` + spread (évite la dépendance à `Set` iterable bien que supporté).
- `config:saved` ajouté au bus (event-bus.js mis à jour).
- `isEnabled()` délègue à `get(‘key.enabled’)` plutôt que `get(key).enabled` (cohérent avec la notation pointée).

## Dépendances

- Bus, Logger. Pour `save` : API PHP existante ou reconstruite en parallèle.

## Référence actuelle

- `overlay/core/config-manager.js`
