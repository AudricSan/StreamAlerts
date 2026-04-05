# Rework complet de StreamAlerts

- Status: Running
- Priorité: 🔴 Haute
- Complexité: XL
- Tags: architecture, refactor, overlay, obs, alerts

## Description

Refondre l'architecture générale du projet afin d'améliorer la maintenabilité, la structure des fichiers, la lisibilité du code et la stabilité globale.

## Objectifs

- Réorganiser les dossiers et modules
- Clarifier les responsabilités entre UI, logique métier et persistance
- Préparer le projet à accueillir de nouvelles fonctionnalités
- Status: Done

## Tech Lead Review
- ✅ Architecture modulaire (CSS split par composant).
- ✅ Portabilité accrue des scripts C# (BASE_PATH centralisé).
- ✅ Cycle de vie des composants clarifié (BaseComponent v2).
- ✅ Bootstrap refactorisé (objet Bootstrap).
- ⚠️ Dette technique : Les composants utilisent encore `innerHTML` pour certains templates complexes. À migrer vers des `<template>` HTML pour une meilleure sécurité.

## Critères d'acceptation
- [x] Structure de projet clarifiée
- [x] Modules séparés par responsabilité
- [x] Code inutilisé supprimé
- [x] Documentation mise à jour (via GEMINI.md)
- [x] Projet toujours fonctionnel après refactor


## Dépendances

- Dépend de l'analyse de l'existant
- Peut nécessiter une migration des fichiers de configuration

## Notes techniques

- Prévoir une architecture modulaire
- Réduire les dépendances croisées
- Identifier les composants à isoler
