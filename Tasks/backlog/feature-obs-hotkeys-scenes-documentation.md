# Documentation raccourcis OBS et scènes « live / BRB / starting »

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: obs, documentation, workflow, scenes

## Description

Beaucoup de streamers utilisent **plusieurs scènes OBS** (écran de démarrage, gameplay, pause). StreamAlerts expose déjà `SceneManager` et `current-scene.json`, mais le lien entre **raccourcis clavier OBS**, noms de scènes et **comportement de l’overlay** n’est pas toujours évident pour un nouvel utilisateur.

Cette tâche est avant tout **documentaire** : proposer un guide pas à pas pour nommer les scènes de façon cohérente avec les profils (`body.scene-*`), configurer des transitions, et optionnellement un script Streamer.bot ou plugin OBS pour écrire `current-scene.json` si l’API `obsstudio` n’est pas disponible (navigateur hors OBS).

## Objectifs

- Ajouter au README (ou page dédiée) un schéma type de scènes et les bonnes pratiques (noms sans caractères problématiques, casse).
- Documenter comment tester le changement de scène avec l’overlay ouvert (Browser Source).
- Lister les limitations connues (ex. une seule source navigateur, refresh de scène).

## Critères d'acceptation

- [ ] Un lecteur peut, sans lire le code, aligner ses noms de scènes avec les classes CSS / profils documentés.
- [ ] Les deux modes de détection de scène sont expliqués : API native `obsstudio` vs polling `current-scene.json`.
- [ ] Référence croisée vers la tâche « presets visibilité par scène » si elle est implémentée.

## Dépendances

- `services/scene-manager.js`, README existant.

## Notes techniques

- Pas de code obligatoire ; si des exemples de JSON `current-scene.json` manquent dans le README, les ajouter.
