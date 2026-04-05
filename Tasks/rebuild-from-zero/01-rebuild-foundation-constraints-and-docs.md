# Fondation — contraintes projet, arborescence et documentation

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: S
- Tags: rebuild-from-zero, architecture, documentation

## Description

Avant toute ligne de code, poser les **règles immuables** du projet StreamAlerts : overlay 100 % local, flux Twitch → Streamer.bot → fichiers JSON / WebSocket → navigateur OBS, **aucun** npm, bundler, framework, modules ES, PHP dans l’overlay lui-même (seulement l’API du dock), compatibilité **Chromium 90+**, exposition des singletons via `window.*`, ordre strict de chargement des scripts documenté dans `CLAUDE.md` et README.

Cette tâche couvre aussi la **structure de dossiers** cible (`config/`, `overlay/core|utils|services|components|dev|data|assets|styles/`, `streamerbot/`, `index.html` racine).

## Objectifs

- Rédiger ou mettre à jour `CLAUDE.md` et `README.md` avec architecture, URLs XAMPP, liste des JSON, contraintes XSS et polling.
- Définir la séquence de bootstrap : `core/` → `utils/` → `services/` → `components/` → `dev/` → `script.js`.
- Lister les fichiers JSON autorisés côté API et leur rôle.

## Critères d'acceptation

- [ ] Un développeur peut reconstruire le projet sans ambiguïté sur les interdits techniques.
- [ ] Les chemins d’URL (`/StreamAlerts/overlay/`, `/config/`) sont documentés.
- [ ] Les événements Bus minimaux sont nommés (ex. `config:loaded`, `ws:connected`).

## Dépendances

- Aucune (première tâche logique).

## Référence actuelle

- `CLAUDE.md`, `README.md`, racine du dépôt.
