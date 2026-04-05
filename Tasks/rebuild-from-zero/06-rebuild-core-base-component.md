# Noyau — Classe de base des widgets (`BaseComponent`)

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: M
- Tags: rebuild-from-zero, core, components

## Description

Abstraction commune pour tous les widgets overlay : nom, `zoneId`, `dataFile`, `pollInterval`, raccourci de test, cycle `init` → `setup` → enregistrement Poller, gestion gracieuse des données invalides, méthodes `onData`, `test()` optionnelle.

## Objectifs

- Fichier `overlay/core/base-component.js`.
- Contrat clair pour les sous-classes (pas d’ES modules ; classes globales ou IIFE).
- Intégration avec `Config.isEnabled` avant init effective.

## Critères d'acceptation

- [ ] Un composant cassé n’empêche pas les autres de s’initialiser.
- [ ] Déduplication par timestamp compatible avec Poller.

## Dépendances

- Config, Poller (au moment de l’init), Logger, Bus selon usage.

## Référence actuelle

- `overlay/core/base-component.js`
