# Liens rapides dans le dock (overlay, overlay debug, dashboard)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: config, dock, ux, obs

## Description

Lors de la configuration, on bascule souvent entre le **dock**, le **navigateur** et **OBS**. Ajouter dans l'en-tête ou le pied du dock des **boutons ou liens** ouvrant dans le navigateur par défaut (ou le même WebView OBS) les URLs utiles :

- Overlay production : `http://localhost/StreamAlerts/overlay/`
- Overlay avec debug : `…/overlay/?debug=1`
- Tableau de bord racine : `http://localhost/StreamAlerts/`

Les URLs peuvent être **préfixées dynamiquement** avec `window.location.origin` pour éviter de coder `localhost` en dur si l'utilisateur sert le site autrement (LAN, autre port).

## Objectifs

- Bloc UI discret « Ouvrir… » avec 2–3 liens.
- Optionnel : champ lecture seule montrant l'URL copiable pour coller dans OBS Browser Source.
- Texte en français ; icônes accessibles (title / aria si le dock en utilise).

## Critères d'acceptation

- [ ] Les liens utilisent l'origine courante du dock (`location.origin` + chemin projet).
- [ ] Fonctionne quand le dock est ouvert depuis `file://` ou autre cas limite : fallback documenté ou message clair.
- [ ] Aucune fuite de secrets (pas d'URL avec mot de passe WS).

## Dépendances

- `config/index.html` / structure UI actuelle.

## Notes techniques

- `target="_blank"` peut être bloqué dans certains docks ; tester dans OBS ; sinon liens `href` simples.
