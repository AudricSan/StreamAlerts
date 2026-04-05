# Roue / tirage au sort (giveaway) dans l’overlay

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: XL
- Tags: overlay, engagement, ui, streamerbot, chat

## Description

Overlay de **roue** ou de **tirage** parmi des entrées (chat, liste manuelle, fichier JSON), déclenché par commande modérateur et/ou bouton dock, avec animation courte et résultat affiché de façon lisible.

## Objectifs

- Définir le flux : source des participants (ex. messages `!join` déjà gérés par la queue existante vs liste dédiée), déclencheur, anti-triche basique (une entrée par user).
- Composant canvas ou DOM + animation performante ; état « idle / spinning / résultat ».
- Scripts Streamer.bot et/ou écriture JSON pour lancer le tirage et afficher le gagnant.

## Critères d’acceptation

- [ ] Aucune donnée utilisateur injectée en HTML non échappé.
- [ ] Ne pas saturer le WebSocket ou le disque (événements limités, debounce documenté).
- [ ] Commandes et permissions mod clairement décrites dans le README.
- [ ] Raccourci clavier de test en mode dev cohérent avec `keyboard-tester.js`.

## Dépendances

- Peut croiser `queue.js` / commandes chat existantes ; à clarifier en conception.

## Notes techniques

- Projet sensible à la complexité : prototype minimal (liste statique + bouton) avant intégration chat complète.
- Chromium 90 : éviter APIs graphiques trop récentes.
