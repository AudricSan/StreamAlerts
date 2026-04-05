# Utilitaires — DOM, temps, couleurs

- Status: Backlog
- Priorité: 🔴 Haute
- Complexité: S
- Tags: rebuild-from-zero, utils

## Description

Regrouper les helpers **partagés** : échappement HTML/XSS (`esc` ou équivalent), formatage de durées, assignation de couleurs de pseudo pour le chat, fonctions DOM légères utilisées par plusieurs composants.

## Objectifs

- Fichiers `overlay/utils/dom.js`, `time.js`, `color.js` (ou fusion documentée si volonté de simplifier).
- Chargés après core, avant services et components.
- Aucune dépendance circulaire avec les composants.

## Critères d'acceptation

- [ ] `esc` utilisé partout où du contenu Twitch entre dans le DOM.
- [ ] Pas d’API navigateur trop récente.

## Dépendances

- Logger si besoin.

## Référence actuelle

- `overlay/utils/dom.js`, `overlay/utils/time.js`, `overlay/utils/color.js`
