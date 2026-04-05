# StreamAlerts

* Description: Gestion d'alertes et d'overlays pour OBS (chat, alerts, last sub, last follow, etc.)
* Tags: OBS, Stream Overlay, Stream Alerts
* GitHub: [https://github.com/AudricSan/StreamAlerts](https://github.com/AudricSan/StreamAlerts)
* Status: Active

## Vision globale

StreamAlerts est un projet local orienté OBS permettant de centraliser la gestion des overlays de stream et des alertes sans dépendre d'un backend lourd.

### Problème

Les solutions d'overlay existantes sont souvent dépendantes de services externes, difficiles à personnaliser, ou trop complexes à maintenir.

### Solution

Créer une plateforme locale, modulaire et maintenable pour gérer :

* alertes stream
* widgets OBS
* scènes dynamiques
* chat overlay
* last follow / last sub
* système de configuration local

### Cible

* Streamers OBS
* Utilisateurs Streamer.bot
* Créateurs souhaitant un système local et personnalisable

## Tâches backlog initiales

### Tasks/backlog/rework-complet-streamalerts.md

```md
# Rework complet de StreamAlerts

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: XL
- Tags: architecture, refactor, overlay, obs, alerts

## Description

Refondre l'architecture générale du projet afin d'améliorer la maintenabilité, la structure des fichiers, la lisibilité du code et la stabilité globale.

## Objectifs

- Réorganiser les dossiers et modules
- Clarifier les responsabilités entre UI, logique métier et persistance
- Préparer le projet à accueillir de nouvelles fonctionnalités

## Critères d'acceptation

- [ ] Structure de projet clarifiée
- [ ] Modules séparés par responsabilité
- [ ] Code inutilisé supprimé
- [ ] Documentation mise à jour
- [ ] Projet toujours fonctionnel après refactor

## Dépendances

- Dépend de l'analyse de l'existant
- Peut nécessiter une migration des fichiers de configuration

## Notes techniques

- Prévoir une architecture modulaire
- Réduire les dépendances croisées
- Identifier les composants à isoler
```

### Tasks/backlog/clean-code-and-fix-settings-save.md

```md
# Nettoyer le code et corriger les problèmes de sauvegarde des paramètres

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: L
- Tags: cleanup, settings, persistence, bugs, overlay

## Description

Nettoyer le code existant, supprimer les doublons et corriger les problèmes de sauvegarde des paramètres.

## Objectifs

- Supprimer les blocs de code dupliqués
- Corriger la persistance des paramètres
- Stabiliser le comportement des écrans de configuration

## Critères d'acceptation

- [ ] Plus de doublons évidents dans le code
- [ ] Les paramètres sont correctement sauvegardés
- [ ] Les paramètres restent persistants après redémarrage
- [ ] Les erreurs de configuration sont identifiées dans les logs

## Dépendances

- Dépend du système actuel de sauvegarde
- Peut nécessiter une migration des anciens paramètres

## Notes techniques

- Vérifier localStorage, fichiers JSON ou système de persistance actuel
- Ajouter une validation des données de configuration
- Centraliser les fonctions de sauvegarde
```
