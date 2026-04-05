# Objectifs multiples ou rotation de barres de goal

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: XL
- Tags: overlay, goal, streamerbot, json, ui

## Description

Aller au-delà d’un **seul** fichier `goal.json` : plusieurs objectifs (followers, bits, sous-objectifs de stream) avec **affichage simultané** (pile / onglets) ou **rotation automatique** selon un intervalle configurable.

## Objectifs

- Choisir et documenter un modèle de données (un fichier `goals.json` avec tableau, ou plusieurs fichiers — à trancher dans l’implémentation).
- Adapter ou étendre `goals.js` pour consommer ce modèle sans casser l’existant (migration douce ou clé de config `goalMode: single|multi`).
- Mettre à jour les scripts Streamer.bot (`WriteGoal.cs` ou nouveaux scripts) pour alimenter les compteurs.
- Étendre le dock config pour éditer les objectifs multiples si pertinent.

## Critères d’acceptation

- [ ] Mode simple actuel reste supporté ou migration documentée.
- [ ] Timestamp / déduplication Poller cohérents avec le reste du projet.
- [ ] UI lisible en 1920×1080 et dans une zone étroite (responsive interne au widget).
- [ ] README + exemples JSON à jour.

## Dépendances

- `WriteGoal.cs`, `overlay/components/goals.js`, page config goal.

## Notes techniques

- Scope large : découper en sous-tâches (data layer → UI → Streamer.bot → dock).
- Éviter plusieurs pollers sur des fichiers redondants.
