# Noyau — Gestionnaire de configuration (`window.Config`)

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: M
- Tags: rebuild-from-zero, core, config, persistence

## Description

Charger `overlay/data/config.json` (fetch), fusionner avec des **DEFAULTS** par composant (`enabled`, `pollInterval`, options spécifiques, section `env` pour WebSocket), exposer `get`, `isEnabled`, `load`, et `save` vers `config/api.php` en POST pour persistance depuis le dock. Émettre `config:loaded` sur le Bus.

## Objectifs

- Fichier `overlay/core/config-manager.js`.
- Chemins relatifs corrects selon que l’appel vient de l’overlay ou de `/config/`.
- Validation basique avant sauvegarde ; gestion d’erreur avec logs.

## Critères d'acceptation

- [ ] Config manquante ou JSON invalide → repli sur defaults sans crash.
- [ ] `save` met à jour l’état local seulement après succès API.
- [ ] Tous les composants documentés ont une entrée dans DEFAULTS.

## Dépendances

- Bus, Logger. Pour `save` : API PHP existante ou reconstruite en parallèle.

## Référence actuelle

- `overlay/core/config-manager.js`
