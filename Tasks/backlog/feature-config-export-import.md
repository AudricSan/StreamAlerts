# Export / import de la configuration (presets)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: config, dock, persistence, ux, backup

## Description

Permettre depuis le **dock de configuration** d’**exporter** `config.json` (téléchargement fichier) et d’**importer** un fichier JSON validé, pour sauvegardes, clones de setup ou restauration.

## Objectifs

- Boutons ou actions dans `config/` : export (client-side + contenu actuel ou lu via API), import (lecture fichier, validation, POST vers `api.php`).
- Valider la structure minimale avant écriture (éviter d’écraser avec un JSON vide ou invalide).
- Feedback utilisateur (succès / erreur) cohérent avec le reste du dock.

## Critères d’acceptation

- [ ] Export produit un JSON lisible (pretty print optionnel) représentant la config complète ou la partie documentée.
- [ ] Import refuse les données invalides et n’efface pas la config sans confirmation claire si risque.
- [ ] Après import réussi, l’overlay peut recharger la config selon le flux existant (reload manuel ou doc).
- [ ] Aucune exposition de fichiers hors liste `ALLOWED` dans `api.php`.

## Dépendances

- `config/api.php`, `config/script.js` (ou équivalent), `Config.save` / lecture actuelle.

## Notes techniques

- Réutiliser la validation déjà présente côté `Config` si possible.
- Prévoir une taille max raisonnable côté PHP (`post_max_size`) et message d’erreur explicite.
