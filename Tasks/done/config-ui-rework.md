# Refonte de l'interface de configuration et structure des paramètres

- Status: Running
- Priorité: 🔴 Haute
- Complexité: L
- Tags: configuration, ui, refactor, environment

## Description

Améliorer l'organisation du fichier de configuration (`config.json`) et de l'interface de configuration (le dock OBS) pour faciliter la gestion des paramètres globaux et spécifiques à chaque composant.

## Objectifs

- Créer une section `env` globale dans la configuration pour les variables d'environnement (WebSocket, etc.).
- Refondre l'interface avec un onglet "Environnement" dédié.
- Créer des onglets dédiés pour chaque élément de l'overlay (Musique, Alertes, Subs, Chat, etc.) au lieu de tout grouper dans "Layout".
- Assurer la persistance correcte de tous ces nouveaux paramètres.
- Status: Done

## Tech Lead Review
- ✅ Interface utilisateur refondue avec navigation par onglets scrollables.
- ✅ Séparation claire entre configuration d'environnement (`env`) et composants.
- ✅ Chaque composant possède désormais sa propre page de réglages dédiée.
- ✅ Persistance des paramètres WebSocket dans une section globale `env`.
- ✅ Réintégration complète de la logique OBS WebSocket v5.

## Critères d'acceptation
- [x] Section `env` présente dans `config.json`.
- [x] Paramètres WebSocket déplacés de `chat` vers `env`.
- [x] Interface de configuration mise à jour avec des onglets clairs pour chaque composant.
- [x] Chaque onglet permet de modifier les paramètres spécifiques ET la position/visibilité du composant.
- [x] L'overlay continue de fonctionner correctement avec la nouvelle structure.


## Notes techniques

- Mettre à jour `ConfigManager` pour les nouvelles valeurs par défaut de `env`.
- Adapter `WSManager` pour lire la config dans `env`.
- Dynamiser la génération des onglets dans `config/script.js`.
