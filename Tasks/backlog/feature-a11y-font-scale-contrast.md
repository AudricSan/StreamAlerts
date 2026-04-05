# Accessibilité : échelle de police globale et contraste

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: accessibility, chat, css, config, overlay

## Description

Les viewers et le streamer peuvent avoir besoin d'un texte plus grand ou d'un meilleur contraste sur le chat et les petits widgets. Aujourd'hui, la taille dépend surtout du CSS fixe et des zones. Cette tâche introduit des paramètres globaux dans `config.json`, par exemple un facteur multiplicateur de taille de police pour la zone chat et optionnellement pour tout le document racine, plus variables CSS dérivées.

Le contraste peut être amélioré via des thèmes simples (couleur de fond du chat, couleur du texte) configurables, dans les limites du design existant, sans casser les animations ni les images de fond.

## Objectifs

- Clés config documentées : `chatFontScale`, `globalFontScale`, ou utilisation de `rem` avec facteur sur `html`.
- Appliquer au chargement dans le bootstrap ou via classe sur `body` (exemple : `body.a11y-large`).
- Vérifier la lisibilité sur fond transparent au-dessus du jeu (ombre légère optionnelle, sans abus pour les perfs OBS).

## Critères d'acceptation

- [ ] Défauts : rendu identique à la version actuelle.
- [ ] Valeurs extrêmes bornées (min et max) pour éviter texte illisible ou débordement catastrophique.
- [ ] Pas de syntaxe CSS incompatible Chromium 90.
- [ ] README liste les clés et exemples de valeurs.

## Dépendances

- `style.css`, `config-manager.js`, zone chat et éventuellement autres widgets texte.

## Notes techniques

- Ne pas multiplier les sources de vérité : préférer des variables CSS custom pour la taille du chat.
