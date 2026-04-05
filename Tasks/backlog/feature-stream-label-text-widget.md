# Widget texte libre type objectif du jour (stream label)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: overlay, json, streamerbot, widget, branding

## Description

Le widget goal existant gère surtout des valeurs numériques (progression). Il manque souvent un champ entièrement texte du type « Subathon jour 2 », « Route ironman », « Invité du soir », mis à jour par une action Streamer.bot ou le dock, sans lier ce texte à la barre de progression.

Cette tâche ajoute un petit composant (ou une extension optionnelle du goal) consommant un JSON dédié, par exemple `stream_label.json` avec `timestamp`, `title`, `subtitle` optionnel, affiché dans une zone configurable avec les mêmes règles de layout et visibilité que les autres widgets.

## Objectifs

- Définir le schéma minimal et l'emplacement du fichier sous `overlay/data/`.
- Script C# optionnel plus action manuelle ; entrée `ALLOWED` dans `api.php` si écriture dock.
- Composant `BaseComponent` ou sous-bloc du goal selon choix d'architecture (documenter pour éviter duplication visuelle).

## Critères d'acceptation

- [ ] Texte utilisateur échappé ; pas d'HTML injecté depuis JSON.
- [ ] Fichier absent : zone vide ou masquée sans erreur JS.
- [ ] Intégration complète si nouveau composant : `index.html`, `script.js`, defaults, test clavier.
- [ ] README mis à jour avec exemple de trigger (commande chat mod ou événement).

## Dépendances

- `WriteGoal.cs` pour inspiration ; clarifier le nommage dans la doc pour ne pas confondre avec les stream labels OBS natifs.

## Notes techniques

- Garder le widget léger : pas de polling sous 500 ms si le texte change rarement.
