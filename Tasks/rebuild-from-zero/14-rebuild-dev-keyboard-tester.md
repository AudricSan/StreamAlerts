# Outils dev — raccourcis clavier de test (`keyboard-tester.js`)

- Status: Backlog
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

- [ ] Inactif ou sans effet secondaire en prod si documenté ainsi (ou toujours actif seulement hors OBS — aligné sur comportement actuel).
- [ ] Couvre chaque composant exposé dans le README « Mode test ».

## Dépendances

- Tous les `window.*` composants, Log.

## Référence actuelle

- `overlay/dev/keyboard-tester.js`
