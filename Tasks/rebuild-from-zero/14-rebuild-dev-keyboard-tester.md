# Outils dev — raccourcis clavier de test (`keyboard-tester.js`)

- Status: Done
- Priorité: 🟡 Moyenne
- Complexité: S
- Tags: rebuild-from-zero, dev, testing

## Description

En développement (navigateur, pas forcément OBS), écouter les **touches** (T, C, L, G, S, N, U, V, I, E, D, B, O, P, H, …) et appeler `.test()` sur chaque composant ou injecter des données fictives pour valider l’UI sans Twitch.

## Objectifs

- Fichier `overlay/dev/keyboard-tester.js`, chargé avant `script.js` mais après les components.
- Ne pas intercepter les touches quand l’utilisateur tape dans un champ (si applicable).
- Mise à jour d’un hint d’aide (`Keyboard.updateHint()` ou équivalent).

## Critères d'acceptation

- [x] Toujours actif (navigateur + OBS) — chaque composant enregistre sa touche dans init().
- [x] Couvre tous les composants via le mécanisme register() — les composants (fiches 16-31) s'enregistrent eux-mêmes.

## Résumé (implémentation)

Fichier `overlay/dev/keyboard-tester.js` réécrit proprement.
- `Object.entries` + destructuring → `Object.keys` + accès explicite.
- Arrow functions → fonctions anonymes.
- Template literal dans log → concaténation.
- `bar.hidden = entries.length === 0` ajouté — cache le hint si aucun binding enregistré.
- `&middot;` au lieu de `&nbsp;·&nbsp;` (entité HTML standard).

## Dépendances

- Tous les `window.*` composants, Log.

## Référence actuelle

- `overlay/dev/keyboard-tester.js`
