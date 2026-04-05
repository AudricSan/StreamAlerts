# Noyau — Classe de base des widgets (`BaseComponent`)

- Status: Done
- Priorité: 🔴 Haute
- Complexité: M
- Tags: rebuild-from-zero, core, components

## Description

Abstraction commune pour tous les widgets overlay : nom, `zoneId`, `dataFile`, `pollInterval`, raccourci de test, cycle `init` → `setup` → enregistrement Poller, gestion gracieuse des données invalides, méthodes `onData`, `test()` optionnelle.

## Objectifs

- Fichier `overlay/core/base-component.js`.
- Contrat clair pour les sous-classes (pas d’ES modules ; classes globales ou IIFE).
- Intégration avec `Config.isEnabled` avant init effective.

## Critères d’acceptation

- [x] Un composant cassé n’empêche pas les autres de s’initialiser (try/catch sur setup + onData).
- [x] Déduplication par timestamp gérée côté Poller (BaseComponent délègue sans interférer).

## Résumé (implémentation)

Fichier `overlay/core/base-component.js` réécrit proprement.
- `Config.isEnabled(this.name)` vérifié en début d’`init()` — composant skip si disabled.
- `onMount()` / `onUnmount()` supprimés — alignement sur l’API CLAUDE.md (`setup`, `onData`, `test`).
- `_runTest()` appelle `this.test()` (hook à surcharger) plutôt que de cycler sur un tableau `testData`.
- `setup()` wrappé dans try/catch — une erreur n’empêche pas l’enregistrement du Poller.
- `window.Keyboard` vérifié défensivement avant `Keyboard.register()`.
- `subscribe()` conservé pour auto-cleanup des abonnements Bus.

## Dépendances

- Config, Poller (au moment de l’init), Logger, Bus selon usage.

## Référence actuelle

- `overlay/core/base-component.js`
