# Idées de Features - TooDoo

> Features potentielles à implémenter, sans impact sur les fonctionnalités existantes.

---

## Productivité

### Pomodoro Timer

Un minuteur Pomodoro intégré, avec historique des sessions et statistiques de focus. Associable optionnellement à un todo.

### Time Tracking

Suivre le temps passé sur des activités libres (pas forcément lié aux todos). Rapports journaliers/hebdomadaires.

### Habit Tracker

Suivi de routines quotidiennes (sport, lecture, méditation...). Streaks, heatmap de complétion style GitHub.

### Projets / Goals

Une couche de regroupement "projet" avec des objectifs, sous-tâches, et progression en pourcentage.

### Kanban Board

Vue tableau (Backlog / In Progress / Done) indépendante des todos calendrier existants.

### Snippets Manager

Gestion de morceaux de texte réutilisables (commandes, templates, extraits de code).

---

## Contenu

### Éditeur WYSIWYG Markdown

Remplacer ou enrichir les zones de saisie de texte (notes, journal...) par un éditeur WYSIWYG complet : gras, italique, titres, listes, blocs de code, tableaux, etc. Le contenu est stocké en Markdown, mais affiché et édité de manière visuelle. Possibilité de basculer entre mode WYSIWYG et mode Markdown brut.

**Librairie retenue : [Toast UI Editor](https://ui.toast.com/tui-editor)** — 100% gratuit, MIT (par NHN Cloud)

Installation :

```bash
npm install @toast-ui/editor @toast-ui/react-editor
```

Fonctionnalités clés :

- Mode switchable **WYSIWYG ↔ Markdown brut** dans la même UI
- Conformité **CommonMark + GFM** (GitHub Flavored Markdown)
- Preview en temps réel
- Tableaux, blocs de code, copier/coller, thème sombre
- Écosystème de plugins officiels :
  - `@toast-ui/editor-plugin-code-syntax-highlight` — coloration syntaxique (Prism.js)
  - `@toast-ui/editor-plugin-color-syntax` — couleur du texte
  - `@toast-ui/editor-plugin-chart` — rendu de graphiques
  - `@toast-ui/editor-plugin-table-merged-cell` — fusion de cellules dans les tableaux
  - `@toast-ui/editor-plugin-uml` — diagrammes UML

### Reading List

Différent des bookmarks : articles à lire, avec statut lu/non-lu, tags, et notes de lecture.

### Journal

Entrées journalières avec date verrouillée, différent des notes libres. Une entrée par jour, style "dear diary".

### Flashcards

Création de cartes question/réponse avec révision par répétition espacée.

### Bibliothèque de livres

Suivi des livres lus, en cours, à lire. Notes et citations associées.

### Cours & Ressources

Organiser des ressources d'apprentissage (vidéos, cours en ligne) avec progression.

### Dictionnaire personnel

Sauvegarder des mots/expressions en langues étrangères, avec définition et exemple.

---

## Créativité & Idées

### Brainstorm Board

Zone libre pour capturer des idées en vrac sous forme de post-its ou liste rapide, sans structure.

### Bucket List

Liste de choses à faire dans sa vie, avec statut "rêvé / planifié / accompli".

### Vision Board

Galerie d'images/liens inspirants organisée par thème de vie (carrière, voyage, projets).

---

## Stats & Bien-être

### Dashboard Analytics

Page de statistiques : todos complétés par semaine, streak de connexion, activité globale, graphiques.

### Mood Tracker

Log quotidien d'humeur (1-5 + note optionnelle), visualisation en courbe sur le temps.

### Suivi d'eau

Tracker l'hydratation quotidienne avec un objectif paramétrable. Widget sur le dashboard.

### Suivi de médicaments

Rappels de prises, historique, stocks restants.

### Workout Log

Enregistrer ses séances de sport : exercices, séries, reps, poids. Historique et progression.

---

## Financement & Vie pratique

### Budget Tracker

Suivi des dépenses avec catégories (alimentation, transport, loisirs...), budget mensuel, solde restant.

### Liste de courses

Séparée des todos : listes thématiques (supermarché, bricolage), avec cases à cocher et items récurrents.

### Suivi d'abonnements

Répertorier ses abonnements mensuels/annuels avec dates de renouvellement et coûts.

---

## Réseau & Contacts

### CRM personnel

Gérer ses contacts importants : dernière interaction, notes, rappel de reprendre contact.

### Gift List

Idées cadeaux par personne, avec budget, statut acheté/non acheté, occasions.

---

## Outils

### Générateur de QR Code

Générer un QR Code à partir d'un texte, d'une URL ou d'un contenu libre. Options de personnalisation (taille, couleur). Possibilité d'imprimer le QR Code directement depuis l'interface (feuille dédiée à l'impression, format optimisé avec label optionnel en dessous). Historique des QR Codes générés pour les retrouver facilement.

### Calculatrice / Convertisseur

Outil utilitaire rapide intégré (conversions d'unités, monnaies, calculs).

### Countdown Timer

Compte à rebours vers des dates importantes (événements, deadlines), affiché sur le dashboard.

### Quick Notes (Scratch Pad)

Un bloc-notes temporaire ultra-rapide, non sauvegardé, pour griffonner sans intention.

---

## Communication & Export

### Partage de notes publiques

Générer un lien public pour partager une note (lecture seule, lien temporaire ou permanent).

### Export de données

Export PDF/CSV/Markdown de ses todos, notes, bookmarks. Utile pour backup ou impression.

---

## Ambient / Fun

### Citation du jour

Afficher une citation motivante sur le dashboard (API ou banque locale).

### Fond sonore

Player intégré de sons d'ambiance (pluie, café, nature) pour travailler en focus.

### On This Day

Afficher sur le dashboard ce que tu faisais il y a 1 an, 2 ans... (basé sur tes propres notes/todos).

---

## Récapitulatif rapide

| Feature               | Complexité | Intérêt    |
| --------------------- | ---------- | ---------- |
| Habit Tracker         | Moyenne    | ⭐⭐⭐⭐⭐ |
| Journal               | Faible     | ⭐⭐⭐⭐⭐ |
| Dashboard Analytics   | Moyenne    | ⭐⭐⭐⭐   |
| Reading List          | Faible     | ⭐⭐⭐⭐   |
| Budget Tracker        | Moyenne    | ⭐⭐⭐⭐   |
| Pomodoro Timer        | Faible     | ⭐⭐⭐⭐   |
| Mood Tracker          | Faible     | ⭐⭐⭐     |
| Suivi d'abonnements   | Faible     | ⭐⭐⭐⭐   |
| Kanban Board          | Haute      | ⭐⭐⭐     |
| CRM personnel         | Moyenne    | ⭐⭐⭐     |
| Countdown Timer       | Faible     | ⭐⭐⭐     |
| Snippets Manager      | Faible     | ⭐⭐⭐     |
| Flashcards            | Haute      | ⭐⭐⭐     |
| Workout Log           | Moyenne    | ⭐⭐       |
| Fond sonore           | Faible     | ⭐⭐       |
| Vision Board          | Haute      | ⭐⭐       |
| On This Day           | Faible     | ⭐⭐⭐     |
| Export de données     | Moyenne    | ⭐⭐⭐     |
| Générateur de QR Code | Faible     | ⭐⭐⭐⭐   |
| Éditeur WYSIWYG MD    | Faible     | ⭐⭐⭐⭐⭐ |

---

_Dernière mise à jour : 2026-02-10_
