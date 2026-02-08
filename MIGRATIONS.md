# Guide des Migrations de Base de Données

Ce guide explique comment gérer les migrations de base de données en production de manière sûre.

## 🔄 Migrations automatiques au déploiement

✅ **Les migrations s'exécutent automatiquement** lors de chaque déploiement grâce au script `start.sh`.

Le processus est le suivant :

1. L'application démarre
2. Le script `start.sh` s'exécute
3. Les migrations sont appliquées automatiquement
4. L'application démarre normalement

### Comment ça fonctionne ?

```bash
# start.sh
node ace migration:run --force  # Exécute uniquement les nouvelles migrations
node bin/server.js              # Démarre l'application
```

**Important** :

- ✅ Seules les **nouvelles migrations** sont exécutées
- ✅ Les migrations déjà appliquées sont **ignorées**
- ✅ Chaque migration s'exécute dans une **transaction** (rollback automatique en cas d'erreur)
- ✅ L'historique est conservé dans la table `adonis_schema`

---

## 🛡️ Garantie de sécurité des données

### AdonisJS Lucid protège vos données :

1. **Migrations incrémentales** : Seules les nouvelles migrations non encore exécutées sont appliquées
2. **Transactions** : Chaque migration s'exécute dans une transaction SQL (tout ou rien)
3. **Historique** : Table `adonis_schema` garde la trace des migrations exécutées
4. **Rollback** : En cas d'erreur, la migration est annulée automatiquement
5. **Idempotence** : Exécuter plusieurs fois les migrations n'applique qu'une seule fois chaque migration

### Exemple de sécurité :

```typescript
// Migration 1 (déjà en production)
export default class CreateUsersTable extends BaseSchema {
  async up() {
    this.schema.createTable('users', (table) => {
      table.increments('id')
      table.string('email')
    })
  }
}

// Migration 2 (nouvelle)
export default class AddRoleToUsers extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.string('role').defaultTo('user') // ✅ Valeur par défaut = pas de perte de données
    })
  }
}
```

Lors du déploiement :

- Migration 1 : ✅ Ignorée (déjà exécutée)
- Migration 2 : ✅ Exécutée (nouvelle)
- **Résultat** : Les utilisateurs existants ont automatiquement le rôle 'user'

---

## ✅ Bonnes pratiques pour créer des migrations

### 1. **Toujours ajouter une valeur par défaut ou rendre nullable**

```typescript
// ✅ BON - Valeur par défaut
async up() {
  this.schema.alterTable('users', (table) => {
    table.string('phone').defaultTo('')
  })
}

// ✅ BON - Nullable
async up() {
  this.schema.alterTable('users', (table) => {
    table.string('phone').nullable()
  })
}

// ❌ MAUVAIS - Va échouer si des users existent
async up() {
  this.schema.alterTable('users', (table) => {
    table.string('phone').notNullable()  // ERREUR : les users existants n'ont pas de phone
  })
}
```

### 2. **Ne jamais modifier une migration déjà déployée**

```bash
# ❌ MAUVAIS
# Modifier database/migrations/1234_create_users_table.ts qui est déjà en production

# ✅ BON
# Créer une nouvelle migration
node ace make:migration add_phone_to_users
```

### 3. **Toujours implémenter la méthode `down()` correctement**

```typescript
export default class AddPhoneToUsers extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.string('phone').nullable()
    })
  }

  // ✅ Permet de revenir en arrière si besoin
  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropColumn('phone')
    })
  }
}
```

### 4. **Migrations complexes : procéder en plusieurs étapes**

Pour des changements majeurs, créez plusieurs migrations :

```typescript
// Étape 1 : Ajouter la nouvelle colonne (nullable)
// Migration 001
async up() {
  this.schema.alterTable('users', (table) => {
    table.string('new_email').nullable()
  })
}

// Étape 2 : Migrer les données (via une seed ou un script)
// Migration 002
async up() {
  // Copier les données de 'email' vers 'new_email'
  await this.db.rawQuery('UPDATE users SET new_email = email')
}

// Étape 3 : Rendre la colonne NOT NULL
// Migration 003
async up() {
  this.schema.alterTable('users', (table) => {
    table.string('new_email').notNullable().alter()
  })
}

// Étape 4 : Supprimer l'ancienne colonne (optionnel)
// Migration 004
async up() {
  this.schema.alterTable('users', (table) => {
    table.dropColumn('email')
  })
}
```

---

## 🔍 Vérifier les migrations

### Localement (avant de déployer)

```bash
# Voir le statut des migrations
node ace migration:status

# Tester les migrations
node ace migration:run

# Tester le rollback
node ace migration:rollback

# Réexécuter
node ace migration:run
```

### En production (via CapRover)

```bash
# Voir les logs de déploiement (les migrations s'affichent)
caprover logs -a todo-notes-app -f

# Vérifier le statut via "Run Command" dans CapRover
node ace migration:status
```

---

## 🚨 En cas de problème

### Une migration échoue en production

1. **Ne paniquez pas** : La transaction annule automatiquement les changements
2. **Vérifiez les logs** : `caprover logs -a todo-notes-app -f`
3. **Identifiez le problème** : Souvent une colonne NOT NULL sans valeur par défaut
4. **Créez une migration de correction** :

```bash
node ace make:migration fix_previous_migration
```

```typescript
// fix_previous_migration.ts
export default class FixPreviousMigration extends BaseSchema {
  async up() {
    // Corriger le problème
    this.schema.alterTable('users', (table) => {
      table.string('problematic_column').nullable().alter()
    })
  }
}
```

5. **Déployez la correction**

### Rollback en production (à éviter si possible)

```bash
# Via CapRover "Run Command"
node ace migration:rollback

# Puis réexécuter
node ace migration:run --force
```

⚠️ **Attention** : Le rollback peut supprimer des données. Préférez une migration de correction.

---

## 📋 Checklist avant de déployer une nouvelle migration

- [ ] La migration a été testée localement
- [ ] La migration utilise `defaultTo()` ou `nullable()` pour les nouvelles colonnes
- [ ] La méthode `down()` est correctement implémentée
- [ ] Vous n'avez pas modifié une migration déjà déployée
- [ ] Vous avez vérifié que la migration ne supprime pas de données importantes
- [ ] Un backup de la base de données a été créé (pour les migrations à risque)

---

## 🔐 Backup avant migration importante

Pour les migrations à risque (suppression de colonne, changement de type, etc.) :

```bash
# Créer un backup manuel avant le déploiement
docker exec $(docker ps -q -f name=todo-notes-db) pg_dump -U postgres todo_notes > backup-avant-migration-$(date +%Y%m%d).sql
```

---

## 📊 Exemple de workflow complet

### 1. Développement local

```bash
# Créer une nouvelle migration
node ace make:migration add_avatar_to_users

# Éditer la migration
# database/migrations/xxx_add_avatar_to_users.ts
```

```typescript
export default class AddAvatarToUsers extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('avatar_url').nullable() // ✅ Nullable = sûr
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('avatar_url')
    })
  }
}
```

```bash
# Tester la migration
node ace migration:run

# Vérifier que tout fonctionne
npm run dev

# Tester le rollback
node ace migration:rollback

# Réexécuter
node ace migration:run
```

### 2. Commit et push

```bash
git add database/migrations/
git commit -m "Add avatar_url column to users"
git push
```

### 3. Déploiement

```bash
# Déployer sur CapRover
caprover deploy
```

**Ce qui se passe automatiquement** :

1. CapRover build l'image Docker
2. Le conteneur démarre
3. Le script `start.sh` s'exécute
4. ✅ La migration `add_avatar_to_users` est appliquée automatiquement
5. L'application démarre avec la nouvelle colonne

### 4. Vérification

```bash
# Voir les logs
caprover logs -a todo-notes-app -f

# Vous devriez voir :
# 📦 Exécution des migrations...
# ❯ migrated database/migrations/xxx_add_avatar_to_users
# ✅ Statut des migrations :
# 🎯 Démarrage du serveur...
```

---

## 🎯 Résumé

✅ **Les migrations sont automatiques** - Pas besoin d'action manuelle
✅ **Vos données sont protégées** - Transactions et rollback automatique
✅ **Évolution facile** - Créez une nouvelle migration et déployez
✅ **Historique conservé** - Table `adonis_schema` garde la trace
✅ **Zero downtime** - CapRover gère le déploiement sans interruption

**Règle d'or** : Toujours utiliser `defaultTo()` ou `nullable()` pour les nouvelles colonnes !
