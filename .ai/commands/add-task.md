# Ajouter une tâche en Backlog

L'utilisateur veut ajouter une tâche dans le projet. À partir de sa description, tu dois inférer toutes les informations utiles et créer un fichier de tâche Markdown dans `Tasks/backlog/`.

## Ce que tu dois faire

1. Analyser la description fournie par l'utilisateur

2. Inférer les propriétés suivantes :

   * `Titre` : court, actionnable et commence par un verbe (`Créer`, `Implémenter`, `Corriger`, `Ajouter`, `Optimiser`...)
   * `Status` : toujours `Backlog`
   * `Priorité` :

     * `🔴 Haute`
     * `🟡 Moyenne`
     * `🟢 Basse`
   * `Complexité` :

     * `XS` = moins de 30 minutes
     * `S` = 1 à 2 heures
     * `M` = demi-journée
     * `L` = 1 à 2 jours
     * `XL` = plus de 2 jours
   * `Tags` éventuels : overlay, obs, alerts, chat, websocket, ui, performance, audio, queue, css, animation, etc.

3. Générer automatiquement un slug de fichier en kebab-case.

Exemple :

```text
Créer système de priorité des alertes
→ create-alert-priority-system.md
```

4. Créer le fichier dans :

```text
Tasks/backlog/<slug>.md
```

## Format du fichier

```md
# Titre de la tâche

- Status: Backlog
- Priorité: 🟡 Moyenne
- Complexité: M
- Tags: overlay, obs, alerts

## Description

Résumé court de la fonctionnalité.

## Objectifs

- Premier objectif
- Deuxième objectif
- Troisième objectif

## Critères d'acceptation

- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

## Dépendances

- Dépendance éventuelle
- Contraintes techniques
- Points d'attention

## Notes techniques

- Informations utiles pour le DEV
- Fichiers potentiellement impactés
- Idées d'implémentation
```

## Règles

* Toujours créer une tâche exploitable sans demander plus de détails sauf si la demande est vraiment ambiguë
* Toujours privilégier des titres courts et orientés action
* Toujours détailler des critères d'acceptation concrets et vérifiables
* Toujours adapter les tags au contexte du projet
* Toujours considérer que le projet utilise une structure locale basée sur des fichiers Markdown dans `Tasks/`

## Réponse attendue

Après création de la tâche, répondre avec :

* Le nom du fichier créé
* Le titre de la tâche
* La priorité
* La complexité
* Un résumé très court du contenu
