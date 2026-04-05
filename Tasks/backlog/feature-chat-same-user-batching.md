# Regroupement visuel des messages consécutifs d’un même utilisateur

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: chat, ui, ux, overlay

## Description

Sur des chats actifs, plusieurs messages d’affilée du **même viewer** occupent beaucoup de hauteur : pseudo et badges répétés. Beaucoup d’interfaces regroupent les envois consécutifs en une **seule bulle** qui s’allonge, ou masquent le pseudo sur les lignes suivantes jusqu’à changement d’utilisateur ou timeout.

Cette évolution touche uniquement le **rendu** du composant chat : la source des données (WS / JSON) ne change pas. Il faut définir une politique : fusion uniquement si le même `displayName` envoie dans les N secondes, ou strictement messages consécutifs sans autre user entre les deux.

## Objectifs

- Ajouter des options `batchSameUser: boolean`, `batchWindowMs` optionnel, styles CSS distincts pour la « suite » de message.
- Implémenter la logique d’insertion dans le DOM sans recréer toute la liste à chaque message (réutilisation des nœuds existants quand possible).
- Mettre à jour les données de test clavier (`testKey: c`) pour couvrir le cas batching.

## Critères d'acceptation

- [ ] Option désactivée → rendu identique à l’actuel.
- [ ] Avec option activée, le pseudo/badges ne se répètent pas pour les lignes fusionnées selon les règles choisies.
- [ ] Limite `maxMessages` et durée de vie des messages (`msgLifetime`) restent cohérentes.
- [ ] Pas de régression XSS : concaténation de texte uniquement, pas d’HTML utilisateur.

## Dépendances

- `overlay/components/chat.js`, styles globaux ou scoped au zone-chat.

## Notes techniques

- OBS : limiter les reflows ; préférer append au dernier bloc utilisateur plutôt que re-parse de tout l’historique.
