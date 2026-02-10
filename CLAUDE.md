# Toudoux - Development Guidelines

**Version:** 1.0.0
**Last Updated:** 2026-02-08
**Description:** Application de productivité personnelle avec todos, notes, bookmarks et dashboard

---

Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

## 📋 Table des matières

1. [Stack Technique](#stack-technique)
2. [Structure du Projet](#structure-du-projet)
3. [Conventions de Code](#conventions-de-code)
4. [Design System](#design-system)
5. [Commandes](#commandes)
6. [Features Principales](#features-principales)
7. [API & Routes](#api--routes)
8. [Base de Données](#base-de-données)
9. [Bonnes Pratiques](#bonnes-pratiques)

---

## 🛠 Stack Technique

### Backend

- **Framework:** AdonisJS v6 (Node.js 20.6+)
- **Language:** TypeScript 5.8+
- **ORM:** Lucid ORM
- **Validation:** VineJS
- **Database:** PostgreSQL
- **Authentication:** @adonisjs/auth (session-based)

### Frontend

- **Framework:** React 19 (avec Inertia.js)
- **UI Library:** Ant Design v6.2.3
- **Styling:** CSS + Ant Design Theme
- **Build:** Vite 6
- **Date Management:** Day.js & Luxon

### DevOps & Tools

- **Linting:** ESLint 9
- **Formatting:** Prettier 3
- **Testing:** Japa 4 + Vitest 4 + Playwright
- **Type Checking:** TypeScript compiler
- **Hot Reload:** hot-hook

---

## 📁 Structure du Projet

```
TooDoo/
├── app/                          # Code backend AdonisJS
│   ├── controllers/              # Contrôleurs HTTP
│   ├── models/                   # Modèles Lucid
│   ├── middleware/               # Middleware personnalisés
│   ├── services/                 # Services (ex: weather_service)
│   ├── validators/               # Validateurs VineJS
│   └── exceptions/               # Gestionnaires d'exceptions
│
├── inertia/                      # Code frontend React
│   ├── app/                      # Configuration React/Inertia
│   │   └── app.tsx              # Point d'entrée + Theme config
│   ├── components/               # Composants React réutilisables
│   │   ├── cards/               # Cards (todos, notes, weather, etc.)
│   │   ├── forms/               # Formulaires réutilisables
│   │   ├── layout/              # Layout components (header, etc.)
│   │   └── calendar/            # Composants calendrier
│   ├── pages/                    # Pages Inertia (routes)
│   │   ├── dashboard/           # Page dashboard
│   │   ├── todos/               # Gestion des todos
│   │   ├── notes/               # Gestion des notes
│   │   ├── bookmarks/           # Gestion des bookmarks
│   │   ├── auth/                # Login/Register
│   │   ├── settings/            # Paramètres utilisateur
│   │   └── admin/               # Administration
│   ├── lib/                      # Utilitaires
│   │   ├── types.ts             # Types TypeScript partagés
│   │   └── date_utils.ts        # Utilitaires de dates
│   └── css/                      # Styles globaux
│
├── database/
│   ├── migrations/               # Migrations de base de données
│   └── seeders/                  # Seeders
│
├── config/                       # Configuration AdonisJS
├── start/                        # Bootstrap files
│   ├── routes.ts                # Définition des routes
│   ├── kernel.ts                # Middleware configuration
│   └── env.ts                   # Variables d'environnement
│
├── specs/                        # Spécifications des features
│   ├── 001-todo-notes-app/
│   ├── 002-bookmarks/
│   └── 003-dashboard/
│
└── tests/                        # Tests

```

---

## 📝 Conventions de Code

### TypeScript

- **Strict mode** activé
- Utiliser les **imports avec alias** (#controllers, #models, etc.)
- Toujours **typer les fonctions et variables**
- Privilégier les **interfaces** aux types pour les objets

### React & Inertia

- Composants fonctionnels avec **hooks**
- Props typées avec **interfaces**
- Utiliser **Inertia.js** pour la navigation (pas de fetch manuel)
- Nommage des composants en **PascalCase**
- **IMPORTANT:** Passer les props directement aux composants (PAS d'utilisation de `usePage()`)

  ```tsx
  // ✅ BON
  export default function MyPage({ user, data }: MyPageProps) { ... }

  // ❌ MAUVAIS
  export default function MyPage({ user }: MyPageProps) {
    const { props } = usePage()  // Ne pas faire ça
  }
  ```



### Code Style

- **Indentation:** 2 espaces
- **Quotes:** Simple quotes pour JS/TS, doubles quotes pour JSX
- **Semicolons:** Oui (configuré par Prettier)
- **Trailing commas:** Oui
- **Line length:** 100 caractères max
- **Async/await** préféré aux promesses chaînées

### Naming Conventions

- **Fichiers:** snake_case.ts
- **Composants React:** PascalCase.tsx
- **Fonctions/variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Types/Interfaces:** PascalCase

---

## 🎨 Design System

Le projet utilise une **palette monochrome élégante** pour un look professionnel.

**Voir:** `DESIGN_SYSTEM.md` pour la documentation complète

### Couleurs Principales

- **Primaire:** `#1a1a1a` (Noir profond)
- **Success:** `#22c55e` (Vert moderne)
- **Warning:** `#f59e0b` (Orange sophistiqué)
- **Error:** `#ef4444` (Rouge élégant)

### Principes

- Design minimaliste et élégant
- Contraste élevé pour l'accessibilité
- Boutons noirs avec texte blanc
- Utilisation minimale de la couleur

---

## 🚀 Commandes

### Développement

```bash
npm run dev          # Démarrer le serveur de développement (HMR activé)
npm run build        # Build production
npm start            # Démarrer le serveur production
```

### Qualité du code

```bash
npm run lint         # Linter ESLint
npm run format       # Formatter avec Prettier
npm run typecheck    # Vérification TypeScript
npm test             # Lancer les tests
```

### Base de données

```bash
node ace migration:run      # Exécuter les migrations
node ace migration:rollback # Rollback dernière migration
node ace db:seed           # Exécuter les seeders
```

---

## ✨ Features Principales

### 1. Dashboard (/)

- **Card Date & Heure:** Affichage en temps réel (rafraîchi chaque seconde)
- **Card Météo:** Météo actuelle avec rafraîchissement auto (30 min)
- **Card Todos:** Todos du jour avec actions rapides
- **Card Notes:** Notes du jour avec visualisation

### 2. Todos (/todos)

- Vue calendrier interactive
- Gestion des tâches avec date d'échéance et heure
- Statut : À faire / Terminé
- Création rapide depuis le dashboard

### 3. Notes (/notes)

- Vue calendrier pour organisation par date
- Création et visualisation de notes
- Modal de lecture avec formatage
- Création rapide depuis le dashboard

### 4. Bookmarks (/bookmarks)

- Sauvegarde d'URLs et de texte
- Organisation chronologique
- Remember Me pour session persistante

### 5. Settings (/settings)

- Configuration de la ville pour la météo
- Paramètres utilisateur

### 6. Admin (/admin)

- Gestion des utilisateurs (admin uniquement)
- Création de comptes
- Gestion des rôles

---

## 🔌 API & Routes

### Routes Publiques

- `GET /login` - Page de connexion
- `POST /login` - Authentification
- `GET /register` - Page d'inscription
- `POST /register` - Création de compte
- `POST /logout` - Déconnexion

### Routes Protégées

#### Dashboard

- `GET /` - Dashboard principal

#### Todos

- `GET /todos` - Liste des todos
- `POST /todos` - Créer un todo
- `PATCH /todos/:id` - Mettre à jour un todo
- `DELETE /todos/:id` - Supprimer un todo

#### Notes

- `GET /notes` - Liste des notes
- `GET /notes/:id` - Afficher une note
- `POST /notes` - Créer une note
- `DELETE /notes/:id` - Supprimer une note

#### Bookmarks

- `GET /bookmarks` - Liste des bookmarks
- `POST /bookmarks` - Créer un bookmark
- `DELETE /bookmarks/:id` - Supprimer un bookmark

#### Settings

- `GET /settings` - Page paramètres
- `PATCH /settings` - Mettre à jour les paramètres

#### Admin (rôle admin requis)

- `GET /admin/users` - Liste des utilisateurs
- `GET /admin/users/create` - Formulaire de création
- `POST /admin/users` - Créer un utilisateur
- `DELETE /admin/users/:id` - Supprimer un utilisateur
- `PATCH /admin/users/:id/role` - Modifier le rôle
- `PATCH /admin/users/:id/reset-password` - Réinitialiser mot de passe

---

## 💾 Base de Données

### Tables Principales

- **users** - Utilisateurs (id, email, password, role)
- **todos** - Tâches (id, user_id, title, description, due_date, due_time, status)
- **notes** - Notes (id, user_id, title, content, due_date)
- **bookmarks** - Favoris (id, user_id, url, created_at)
- **user_settings** - Paramètres (id, user_id, weather_city)
- **remember_me_tokens** - Tokens de session persistante

### Relations

- User hasMany Todos, Notes, Bookmarks
- User hasOne UserSettings
- Cascade delete sur toutes les relations

---

## ✅ Bonnes Pratiques

### Sécurité

- ✅ Toujours vérifier l'ownership avant les opérations (user_id)
- ✅ Valider toutes les entrées utilisateur avec VineJS
- ✅ Utiliser les middlewares auth pour les routes protégées
- ✅ Ne jamais exposer les données d'autres utilisateurs

### Performance

- ✅ Utiliser `Promise.all()` pour les requêtes parallèles
- ✅ Limiter les appels API externes (ex: météo avec rafraîchissement de 30 min)
- ✅ Optimiser les requêtes DB avec les bons index

### Code Quality

- ✅ Toujours lancer `npm run lint` avant commit
- ✅ Utiliser `npm run format` pour formater le code
- ✅ Vérifier les types avec `npm run typecheck`
- ✅ Écrire des tests pour les nouvelles features

### Git

- ✅ Commits clairs et descriptifs
- ✅ Une feature = une branche
- ✅ Toujours tester avant de push

### Inertia.js

- ✅ Utiliser `preserveScroll: true` pour les actions sans navigation
- ✅ Utiliser `only: ['prop']` pour recharger seulement certaines données
- ✅ Toujours gérer les erreurs de validation

### React

- ✅ Extraire les formulaires dans des composants réutilisables
- ✅ Éviter la duplication de code
- ✅ Utiliser les hooks appropriés (useState, useEffect, etc.)
- ✅ Cleanup des intervals/timeouts dans useEffect

---

## 🔄 Services Externes

### OpenWeatherMap API

- **Service:** `app/services/weather_service.ts`
- **Timeout:** 5 secondes
- **Rafraîchissement:** 30 minutes côté client
- **Fallback:** Message d'erreur si indisponible

---

## 📚 Documentation Additionnelle

- **Design System:** Voir `DESIGN_SYSTEM.md`
- **Migrations:** Voir `MIGRATIONS.md`
- **Deployment:** Voir `CAPROVER.md`
- **Features Specs:** Voir dossier `specs/`

---

## 🆘 Support & Contribution

Pour toute question ou contribution :

1. Lire cette documentation
2. Consulter les specs dans `specs/`
3. Vérifier le Design System dans `DESIGN_SYSTEM.md`
4. Suivre les conventions de code

---

**Dernière mise à jour:** 2026-02-08
**Auteur:** Claude & Team
