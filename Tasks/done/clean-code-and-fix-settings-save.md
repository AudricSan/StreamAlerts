# Nettoyer le code et corriger les problèmes de sauvegarde des paramètres

- Status: Running
- Priorité: 🔴 Haute
- Complexité: L
- Tags: cleanup, settings, persistence, bugs, overlay

## Description

Nettoyer le code existant, supprimer les doublons et corriger les problèmes de sauvegarde des paramètres.

## Objectifs

- Supprimer les blocs de code dupliqués
- Corriger la persistance des paramètres
- Stabiliser le comportement des écrans de configuration
- Status: Done

## Tech Lead Review
- ✅ Persistance centralisée dans `ConfigManager` (support lecture/écriture).
- ✅ Validation des données avant sauvegarde.
- ✅ Nettoyage majeur de `config/index.html` (extraction CSS/JS).
- ✅ Suppression de `lastevents.js` (legacy).
- ✅ Gestion robuste des erreurs API avec feedback visuel (toasts).

## Critères d'acceptation
- [x] Plus de doublons évidents dans le code
- [x] Les paramètres sont correctement sauvegardés
- [x] Les paramètres restent persistants après redémarrage
- [x] Les erreurs de configuration sont identifiées dans les logs


## Dépendances

- Dépend du système actuel de sauvegarde
- Peut nécessiter une migration des anciens paramètres

## Notes techniques

- Vérifier localStorage, fichiers JSON ou système de persistance actuel
- Ajouter une validation des données de configuration
- Centraliser les fonctions de sauvegarde
