# Recherche / filtre dans le dock de configuration

- Status: Backlog
- Priorité: 🟢 Basse
- Complexité: M
- Tags: config, dock, ui, ux

## Description

À mesure que la page de configuration grossit (onglets par composant, layout, environnement), il devient difficile de retrouver un **paramètre précis** (ex. « WebSocket », « durée alerte », « maxMessages »). Une **barre de recherche** en haut du dock qui filtre les sections, labels ou data-attributes des panneaux permettrait de gagner du temps.

La recherche est **purement côté client** : pas de backend. Elle doit rester performante sur des pages DOM modérées et ne pas casser la sauvegarde (champs masqués mais toujours présents dans le formulaire, ou stratégie de collapse).

## Objectifs

- Champ texte + debounce léger ; surlignage ou masquage des blocs non correspondants.
- Texte d'aide « Rechercher un paramètre… » en français.
- Compatible navigateur embarqué OBS (Chromium récent).

## Critères d'acceptation

- [ ] Vide : toute l'UI visible comme avant.
- [ ] Requête sans résultat : message explicite.
- [ ] Sauvegarde des réglages inchangée après filtrage (pas de perte de champs).
- [ ] Pas de dépendance npm ; JS vanilla dans les assets config existants.

## Dépendances

- Refonte éventuelle `config-ui-rework.md` (structure DOM des onglets).

## Notes techniques

- Normaliser accents optionnel ; sinon recherche simple `includes` sur texte normalisé.
