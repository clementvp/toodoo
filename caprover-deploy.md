# Guide de déploiement sur CapRover

Ce guide explique comment déployer l'application **Tâches & Notes** sur CapRover.

## 📋 Prérequis

### 1. CapRover installé et configuré
- Avoir accès à votre instance CapRover
- Connaître l'URL de votre CapRover (ex: `https://captain.votredomaine.com`)
- Avoir les credentials d'administration

### 2. CLI CapRover installée
```bash
npm install -g caprover
```

### 3. Compte configuré
```bash
# Se connecter à votre CapRover
caprover login
```

Suivez les instructions pour :
- Entrer l'URL de votre CapRover
- Entrer le mot de passe admin
- Donner un nom à cette machine (ex: `production`)

---

## 🗄️ Étape 1 : Créer la base de données PostgreSQL

### Via l'interface web CapRover

1. **Accéder à CapRover** : `https://captain.votredomaine.com`

2. **Aller dans "Apps"** → **"One-Click Apps/Databases"**

3. **Chercher "PostgreSQL"** et cliquer dessus

4. **Configurer la base de données** :
   - **App Name** : `todo-notes-db` (ou le nom que vous voulez)
   - **PostgreSQL Version** : Choisir la dernière version stable (ex: `16`)
   - **Database Name** : `todo_notes`
   - **Username** : `postgres`
   - **Password** : Générer un mot de passe sécurisé (notez-le !)

5. **Déployer** : Cliquez sur "Deploy"

6. **Noter les informations de connexion** :
   - **Host** : `srv-captain--todo-notes-db` (le nom de l'app préfixé par `srv-captain--`)
   - **Port** : `5432`
   - **Database** : `todo_notes`
   - **Username** : `postgres`
   - **Password** : Le mot de passe que vous avez défini

---

## 🚀 Étape 2 : Créer l'application

### Via la CLI CapRover

```bash
# Dans le répertoire de votre projet
caprover deploy
```

Lors du premier déploiement, vous serez invité à :
1. **Sélectionner la machine** : Choisir celle configurée lors du login
2. **Entrer le nom de l'app** : `todo-notes-app` (ou le nom que vous voulez)
3. **Confirmer la création** : Taper `Y`

**OU** Via l'interface web :

1. Aller dans **"Apps"**
2. Cliquer sur **"Create New App"**
3. Entrer le nom : `todo-notes-app`
4. Cliquer sur **"Create New App"**

---

## ⚙️ Étape 3 : Configurer les variables d'environnement

### Via l'interface web CapRover

1. Aller dans **"Apps"** → Cliquer sur votre app `todo-notes-app`

2. Aller dans l'onglet **"App Configs"**

3. Scroller jusqu'à **"Environmental Variables"**

4. Ajouter les variables suivantes (cliquer sur "Bulk Edit") :

```env
# Application
TZ=UTC
PORT=80
HOST=0.0.0.0
NODE_ENV=production
LOG_LEVEL=info

# App Key - IMPORTANT : Générer une clé sécurisée
# Vous pouvez générer une clé avec : node ace generate:key
# Ou utiliser : openssl rand -base64 32
APP_KEY=votre_app_key_generee_ici

# Session
SESSION_DRIVER=cookie

# Database PostgreSQL
# Remplacer avec les vraies valeurs de votre base de données
DB_HOST=srv-captain--todo-notes-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
DB_DATABASE=todo_notes

# Security
CSRF_ENABLED=true
```

5. Cliquer sur **"Save & Update"**

### Générer l'APP_KEY

**Option 1 : Localement**
```bash
# Dans votre projet
node ace generate:key
```

**Option 2 : Via OpenSSL**
```bash
openssl rand -base64 32
```

Copiez la clé générée et collez-la dans la variable `APP_KEY`.

---

## 🔧 Étape 4 : Configuration supplémentaire de l'app

### 1. Activer HTTPS

1. Dans **"App Configs"** de votre app
2. Section **"HTTP Settings"**
3. Cocher **"Enable HTTPS"**
4. Cocher **"Force HTTPS by redirecting all HTTP traffic to HTTPS"**
5. Cliquer sur **"Save & Update"**

### 2. Configurer le domaine (optionnel)

1. Dans **"App Configs"**
2. Section **"HTTP Settings"**
3. Ajouter votre domaine personnalisé (ex: `todo.votredomaine.com`)
4. Cliquer sur **"Connect New Domain"**
5. Suivre les instructions pour configurer vos DNS

---

## 📦 Étape 5 : Déployer l'application

### Préparer les fichiers

Assurez-vous que ces fichiers sont présents dans votre projet :
- ✅ `captain-definition` (créé automatiquement)
- ✅ `Dockerfile` (créé automatiquement)
- ✅ `.dockerignore` (recommandé)

### Créer un `.dockerignore` (si pas déjà présent)

```bash
# Créer le fichier .dockerignore
cat > .dockerignore << 'EOF'
node_modules
.git
.env
.env.*
!.env.example
build
tmp
.vscode
.idea
*.log
coverage
.DS_Store
EOF
```

### Déployer

```bash
# Dans le répertoire de votre projet
caprover deploy
```

La CLI va :
1. Créer une archive de votre code
2. L'envoyer à CapRover
3. Builder l'image Docker
4. Déployer l'application

### Suivre les logs

```bash
# Voir les logs en temps réel
caprover logs -a todo-notes-app -f
```

---

## 🗃️ Étape 6 : Les migrations de base de données

✅ **Les migrations s'exécutent automatiquement** lors de chaque déploiement !

Grâce au script `start.sh`, les migrations sont appliquées automatiquement au démarrage de l'application.

### Ce qui se passe automatiquement :

1. L'application démarre
2. Le script vérifie les nouvelles migrations
3. Les migrations non encore appliquées sont exécutées
4. L'application démarre normalement

### Vérifier que les migrations ont réussi

```bash
# Voir les logs de déploiement
caprover logs -a todo-notes-app -f

# Vous devriez voir :
# 📦 Exécution des migrations...
# ❯ migrated database/migrations/xxx_...
# ✅ Statut des migrations
```

### Vérification manuelle (optionnel)

Si vous voulez vérifier le statut des migrations :

1. Aller dans **"Apps"** → Votre app `todo-notes-app`
2. Aller dans l'onglet **"Deployment"**
3. Scroller jusqu'à **"Run Command"**
4. Entrer : `node ace migration:status`
5. Cliquer sur **"Execute Command"**

### ⚠️ En cas de problème

Si une migration échoue, l'application ne démarrera pas. Vérifiez les logs :

```bash
caprover logs -a todo-notes-app -f
```

**📖 Pour en savoir plus sur la gestion sûre des migrations en production, consultez [MIGRATIONS.md](./MIGRATIONS.md)**

---

## ✅ Étape 7 : Vérifier le déploiement

1. **Accéder à votre application** :
   - Via le sous-domaine CapRover : `https://todo-notes-app.captain.votredomaine.com`
   - Via votre domaine personnalisé si configuré : `https://todo.votredomaine.com`

2. **Vérifier que tout fonctionne** :
   - ✅ La page d'accueil se charge
   - ✅ Vous pouvez créer un compte
   - ✅ Vous pouvez vous connecter
   - ✅ Vous pouvez créer des tâches et des notes

3. **Vérifier les logs en cas de problème** :
   ```bash
   caprover logs -a todo-notes-app -f
   ```

---

## 🔄 Déploiements futurs

Pour déployer une nouvelle version (avec ou sans nouvelles migrations) :

```bash
# 1. Faire vos modifications localement
# 2. Si vous avez créé de nouvelles migrations, testez-les localement
node ace migration:run

# 3. Commit vos changements (optionnel mais recommandé)
git add .
git commit -m "Nouvelle fonctionnalité"

# 4. Déployer
caprover deploy
```

CapRover va automatiquement :
- Builder la nouvelle version
- Effectuer un déploiement sans interruption (zero-downtime)
- **Exécuter les nouvelles migrations automatiquement** via `start.sh`
- Basculer le trafic vers la nouvelle version

### Exemple avec une nouvelle migration

```bash
# 1. Créer une migration
node ace make:migration add_avatar_to_users

# 2. Éditer la migration
# database/migrations/xxx_add_avatar_to_users.ts

# 3. Tester localement
node ace migration:run
npm run dev

# 4. Commit
git add database/migrations/
git commit -m "Add avatar support"

# 5. Déployer
caprover deploy

# ✅ La migration sera appliquée automatiquement !
```

**📖 Guide complet des migrations : [MIGRATIONS.md](./MIGRATIONS.md)**

---

## 🐛 Dépannage

### L'application ne démarre pas

**Vérifier les logs** :
```bash
caprover logs -a todo-notes-app -f
```

**Problèmes courants** :

1. **APP_KEY manquante ou invalide**
   - Vérifier que `APP_KEY` est bien définie dans les variables d'environnement
   - Générer une nouvelle clé si nécessaire

2. **Erreur de connexion à la base de données**
   - Vérifier que `DB_HOST` est bien `srv-captain--todo-notes-db`
   - Vérifier que le mot de passe est correct
   - Vérifier que la base de données est bien démarrée

3. **Erreur de build**
   - Vérifier que `Dockerfile` est présent
   - Vérifier que `captain-definition` est présent
   - Vérifier les logs de build dans l'interface CapRover

### Réinitialiser l'application

Si nécessaire, vous pouvez supprimer et recréer l'application :

```bash
# Supprimer l'app (via l'interface web : Apps → votre app → Delete)
# Puis recréer et suivre les étapes à nouveau
```

### Accéder à la base de données

Pour accéder à PostgreSQL depuis votre machine locale :

1. **Via l'interface web CapRover** :
   - Aller dans votre app de base de données
   - Activer "Enable HTTP Requests"
   - Utiliser un client PostgreSQL avec les credentials

2. **Via port forwarding** (si SSH activé) :
   ```bash
   ssh -L 5432:srv-captain--todo-notes-db:5432 root@votreserveur.com
   # Puis connectez-vous avec un client local sur localhost:5432
   ```

---

## 📊 Monitoring et maintenance

### Voir les métriques

Dans l'interface CapRover, onglet **"Monitoring"** de votre app :
- CPU usage
- Memory usage
- Nombre de requêtes
- Temps de réponse

### Backup de la base de données

**Via l'interface web** :
1. Aller dans l'app de base de données
2. Utiliser les outils de backup fournis par CapRover

**Via CLI** :
```bash
# Se connecter au conteneur de la DB
docker exec -it $(docker ps -q -f name=todo-notes-db) sh

# Créer un backup
pg_dump -U postgres todo_notes > backup.sql

# Copier le backup hors du conteneur
docker cp $(docker ps -q -f name=todo-notes-db):/backup.sql ./backup-$(date +%Y%m%d).sql
```

### Mise à jour des dépendances

Localement, mettez à jour les dépendances puis redéployez :

```bash
npm update
npm audit fix
npm run build  # Tester localement
caprover deploy
```

---

## 🔐 Sécurité

### Recommandations

1. ✅ **Utilisez HTTPS** (activé par défaut avec CapRover)
2. ✅ **APP_KEY forte** (32+ caractères aléatoires)
3. ✅ **Mot de passe PostgreSQL fort**
4. ✅ **Mettez à jour régulièrement** les dépendances
5. ✅ **Limitez l'accès** à l'interface CapRover
6. ✅ **Backups réguliers** de la base de données

### Variables sensibles

⚠️ **Ne jamais commiter** :
- `.env` (déjà dans `.gitignore`)
- Les mots de passe
- Les clés API

---

## 📚 Ressources

- [Documentation CapRover](https://caprover.com/docs/)
- [Documentation AdonisJS](https://docs.adonisjs.com/)
- [CLI CapRover](https://github.com/caprover/caprover-cli)

---

## ✨ Résumé des commandes

```bash
# Installation CLI
npm install -g caprover

# Login
caprover login

# Déployer
caprover deploy

# Voir les logs
caprover logs -a todo-notes-app -f

# Générer APP_KEY localement
node ace generate:key
```

---

**🎉 Votre application est maintenant déployée sur CapRover !**
