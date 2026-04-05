# Widget citation du jour (texte statique JSON)

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: S
- Tags: overlay, json, ui, branding

## Description

Afficher une **citation**, punchline ou message motivant change manuellement ou via Streamer.bot, sans logique metier complexe. Fichier du type quote.json avec timestamp, texte, auteur optionnel, duree d affichage optionnelle ou toujours visible jusqu au prochain changement.

Utile pour renforcer l identite de la chaine ou annoncer une regle du chat de facon esthetique.

## Objectifs

- JSON minimal documente ; composant BaseComponent + zone + style typographique coherent avec le theme StreamAlerts.
- Mise a jour par Poller a intervalle raisonnable ou timestamp bump uniquement.

## Critères d'acceptation

- [ ] Contenu echappe ; guillemets et apostrophes affiches correctement.
- [ ] Fichier absent : pas d erreur ; zone vide ou hidden.
- [ ] Test clavier dans keyboard-tester si pattern existant.
- [ ] README avec exemple.

## Dépendances

- Pattern identique aux petits widgets texte (stream label, ticker backlog).

## Notes techniques

- Limiter la longueur affichee (ellipsis CSS) pour eviter debordement sur petites zones.
