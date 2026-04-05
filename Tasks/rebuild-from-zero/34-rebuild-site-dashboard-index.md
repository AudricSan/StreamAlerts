# Site racine — tableau de bord (`index.html`)

- Status: Backlog
- Priorite: Basse
- Complexite: M
- Tags: rebuild-from-zero, marketing, ux

## Description

Page d accueil `http://localhost/StreamAlerts/` : liens vers overlay, config, documentation rapide, eventuellement visuels et instructions XAMPP. **Hors flux critique OBS** mais utile a l onboarding.

## Objectifs

- `index.html` a la racine du depot.
- Liens corrects vers `overlay/` et `config/`.
- Pas de dependance npm ; polices externes optionnelles (preconnect comme actuel).

## Criteres d acceptation

- [ ] Liens relatifs valides depuis le sous-dossier htdocs.
- [ ] Page utilisable sans JavaScript obligatoire pour la navigation de base.

## Dependances

- Aucune technique vers l overlay.

## Reference actuelle

- `index.html` (racine StreamAlerts)
