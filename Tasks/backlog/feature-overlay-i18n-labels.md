# Libellés configurables / i18n partielle de l’overlay

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: overlay, i18n, config, accessibility, ux

## Description

Permettre de **personnaliser les chaînes statiques** affichées par les widgets (ex. « Objectif », « Spectateurs », « File d’attente ») via `config.json`, avec défauts en français, pour s’adapter à la langue du stream ou au branding.

## Objectifs

- Inventorier les libellés hardcodés dans les composants prioritaires (goal, queue, viewers, session, etc.).
- Introduire une section `labels` ou des clés par composant sans casser les défauts actuels.
- Documenter les clés disponibles dans le README.

## Critères d’acceptation

- [ ] Sans surcharge de config, l’overlay se comporte comme aujourd’hui.
- [ ] Les valeurs utilisateur passent par `esc()` si insérées en HTML ; préférer `textContent` où possible.
- [ ] Pas de régression sur les pollers ni sur le chargement de `config.json`.
- [ ] Liste des clés de traduction maintenue à un endroit (commentaire ou README).

## Dépendances

- Aucune ; peut suivre la refonte structure config si les clés sont centralisées.

## Notes techniques

- Éviter un gros framework i18n ; objet plain JS fusionné avec les défauts dans `Config` ou helper `t(key)`.
- Ne pas traduire le contenu dynamique Twitch (noms, messages) — uniquement UI statique.
