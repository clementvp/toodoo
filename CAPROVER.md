Q# 🚀 Déploiement CapRover - Guide Complet

Ce guide explique comment déployer cette application AdonisJS sur CapRover.

## 📋 Prérequis

1. **CapRover CLI installée** :
   ```bash
   npm install -g caprover
   ```

2. **Connexion à votre serveur CapRover** :
   ```bash
   caprover login
   ```

3. **App créée sur CapRover** :
   - Créez une nouvelle app dans l'interface CapRover
   - Notez le nom de l'app (ex: `my-adonisjs-app`)

---

## 🗄️ Configuration de la base de données PostgreSQL

### Option 1 : Créer une base PostgreSQL sur CapRover

1. Dans CapRover, allez dans **"Apps"** → **"One-Click Apps/Databases"**
2. Cherchez **"PostgreSQL"**
3. Configurez :
   - **App Name** : `postgres-db` (ou autre nom)
   - **PostgreSQL Password** : Choisir un mot de passe fort
   - **Database** : `todo_notes`
4. Cliquez sur **"Deploy"**

5. **Important** : Le host de la base sera `srv-captain--postgres-db` (remplacez `postgres-db` par le nom que vous avez choisi)

### Option 2 : Utiliser une base externe

Si vous utilisez une base externe (AWS RDS, etc.), notez simplement les informations de connexion.

---

## ⚙️ Variables d'environnement à configurer dans CapRover

Dans votre app CapRover, allez dans **"App Configs"** → **"Environmental Variables"** et ajoutez :

### **Obligatoires** :

```bash
# Database Configuration
DB_HOST=srv-captain--postgres-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgresql
DB_DATABASE=todo_notes

# Application Security (IMPORTANT !)
APP_KEY=votre_app_key_generee
```

### **Optionnelles** (avec valeurs par défaut) :

```bash
# Application
NODE_ENV=production
TZ=UTC
LOG_LEVEL=info

# Session
SESSION_DRIVER=cookie
```

### 🔑 Générer l'APP_KEY

**AVANT le premier déploiement**, générez une clé de sécurité :

```bash
# Dans votre projet local
node ace generate:key
```

Copiez la clé générée et ajoutez-la dans les variables d'environnement CapRover.

---

## 🚀 Workflow de déploiement

### **Premier déploiement** :

```bash
# 1. Générer l'APP_KEY (une seule fois)
node ace generate:key

# 2. Ajouter l'APP_KEY dans CapRover (voir section précédente)

# 3. Builder l'application
npm run build

# 4. Déployer sur CapRover
caprover deploy
```

Lors du premier `caprover deploy`, vous devrez :
- Sélectionner votre serveur CapRover
- Sélectionner votre app
- Confirmer le déploiement

### **Déploiements suivants** :

```bash
# 1. Builder
npm run build

# 2. Déployer
caprover deploy
```

C'est tout ! 🎉

---

## 🔍 Vérification du déploiement

### **Logs en temps réel** :

Dans l'interface CapRover :
- Allez dans votre app
- Cliquez sur **"Deployment"** → **"View Logs"**

Vous devriez voir :
```
🚀 Démarrage de l'application...
⏳ Attente de la base de données...
📦 Exécution des migrations...
✅ Statut des migrations :
🎯 Démarrage du serveur...
```

### **Tester l'app** :

Une fois déployée, votre app sera accessible à :
```
https://my-adonisjs-app.votre-domaine-caprover.com
```

---

## 🐛 Troubleshooting

### **Erreur de connexion à la base de données**

Vérifiez :
- ✅ `DB_HOST` = `srv-captain--postgres-db` (avec `srv-captain--` devant le nom de votre app PostgreSQL)
- ✅ `DB_PASSWORD` correspond au mot de passe configuré dans PostgreSQL
- ✅ `DB_DATABASE` existe dans PostgreSQL

### **Erreur "APP_KEY is required"**

Vous avez oublié de configurer `APP_KEY` :
```bash
# Générer localement
node ace generate:key

# Ajouter dans CapRover → App Configs → Environmental Variables
```

### **Les migrations ne s'exécutent pas**

Le script `start.sh` exécute automatiquement les migrations au démarrage.

Pour forcer les migrations manuellement :
```bash
# Dans CapRover, ouvrir un terminal sur le container
# Puis exécuter :
node ace migration:run --force
```

### **Build trop long ou échec**

Le build se fait **localement** avant le déploiement. Si `npm run build` échoue en local :
- Vérifiez les erreurs TypeScript : `npm run typecheck`
- Vérifiez les erreurs ESLint : `npm run lint`

---

## 📝 Notes importantes

### **Le dossier build/ n'est PAS commité dans git**

C'est normal ! Le workflow est :
1. Vous buildez en **local** (`npm run build`)
2. Vous déployez depuis votre **machine locale** (`caprover deploy`)
3. CapRover reçoit les fichiers locaux (y compris `build/`) directement

### **Port 80 vs Port 3333**

- En **développement** : `PORT=3333` (configuré dans `.env.example`)
- En **production (CapRover)** : `PORT=80` (configuré dans le Dockerfile)

CapRover gère automatiquement le reverse proxy pour exposer votre app sur le port 80/443.

### **Sécurité**

⚠️ **Ne commitez JAMAIS** :
- Votre `.env` (contient des secrets)
- Votre `APP_KEY`
- Les mots de passe de base de données

Toutes les variables sensibles doivent être configurées dans l'interface CapRover.

---

## 🔄 Rollback en cas de problème

CapRover garde un historique des déploiements. Pour revenir en arrière :

1. Interface CapRover → Votre app → **"Deployment"**
2. Section **"Deployment History"**
3. Cliquez sur **"Revert to this version"** sur un déploiement précédent

---

## 📞 Support

Pour plus d'infos :
- [Documentation CapRover](https://caprover.com/docs/)
- [Documentation AdonisJS](https://docs.adonisjs.com/)

---

**Bon déploiement ! 🚀**
