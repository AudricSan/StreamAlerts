# Démarrer la prochaine tâche

Ce skill est exécuté par le PO. Il trouve la prochaine tâche prête à être démarrée dans `Tasks/backlog/`, demande confirmation, puis réveille le DEV.

## Règle absolue — Toujours rafraîchir depuis les fichiers Tasks

Ne jamais se fier à un état mémorisé.

L'utilisateur peut déplacer manuellement des fichiers entre :

```text
Tasks/backlog/
Tasks/running/
Tasks/review/
Tasks/done/
Tasks/archive/
```

Le système de fichiers fait toujours foi.

Avant toute action :

1. Lire le contenu réel des dossiers `Tasks/`
2. Identifier les tâches présentes dans `Tasks/backlog/`
3. Lire leur contenu pour vérifier priorité, complexité et dépendances
4. Ne jamais supposer qu'une tâche est encore disponible si elle a déjà été déplacée dans `running`, `review` ou `done`

## Étape 1 — Trouver la prochaine tâche

Procédure :

1. Lister tous les fichiers dans `Tasks/backlog/`
2. Lire chaque tâche
3. Prioriser selon :

   * priorité la plus élevée
   * dépendances bloquantes
   * ordre logique des travaux
   * ancienneté si nécessaire
4. Sélectionner la tâche la plus pertinente à démarrer

## Étape 2 — Demander confirmation

Toujours demander confirmation avant de démarrer.

Exemple :

> La prochaine tâche est : **Rework complet de StreamAlerts**. On y va ?

Attendre une validation explicite.

Si l'utilisateur refuse, proposer la tâche suivante.

Par défaut : pas de code review.

Si l'utilisateur précise :

* `avec code review`
* `prévoir review`
* `faire passer au tech lead`

alors marquer que la tâche devra aller dans `Tasks/review/` après le DEV.

## Étape 3 — Réveiller le DEV

Une fois la confirmation reçue :

1. Déplacer le fichier depuis :

```text
Tasks/backlog/<task>.md
```

vers :

```text
Tasks/running/<task>.md
```

2. Fournir au DEV :

   * le chemin du fichier
   * le nom de la tâche
   * si une code review est demandée

Le DEV devra ensuite :

* Réaliser le travail
* Mettre à jour le fichier de tâche
* Déplacer la tâche vers `Tasks/review/` si review demandée
* Sinon déplacer directement vers `Tasks/done/`

## Étape 4 — Si code review demandée

Si la tâche est déplacée dans `Tasks/review/`, alors le PO peut réveiller le Tech Lead.

Le Tech Lead devra :

* Lire le fichier de tâche
* Revoir le code
* Ajouter des commentaires
* Valider ou renvoyer vers `Tasks/running/`

## Règles importantes

* Ne jamais démarrer une tâche sans confirmation
* Ne jamais prendre une tâche déjà dans `running`, `review` ou `done`
* Toujours lire les vrais fichiers avant de décider
* Par défaut : pas de code review
* C'est toujours le PO qui déclenche le DEV ou le Tech Lead
