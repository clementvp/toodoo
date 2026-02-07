#!/bin/sh

# Script de démarrage pour CapRover
# Exécute les migrations automatiquement avant de démarrer l'application

set -e  # Arrête le script en cas d'erreur

echo "🚀 Démarrage de l'application..."

# Attendre que la base de données soit prête (optionnel mais recommandé)
echo "⏳ Attente de la base de données..."
sleep 3

# Exécuter les migrations
echo "📦 Exécution des migrations..."
node ace migration:run --force

# Vérifier le statut des migrations
echo "✅ Statut des migrations :"
node ace migration:status

# Démarrer l'application
echo "🎯 Démarrage du serveur..."
exec node bin/server.js
