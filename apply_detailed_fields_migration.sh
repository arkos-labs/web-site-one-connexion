#!/bin/bash

# Script pour appliquer la migration des champs détaillés de commande
# Usage: ./apply_detailed_fields_migration.sh

echo "🚀 Application de la migration pour les champs détaillés de commande..."
echo ""

# Vérifier si le fichier de migration existe
MIGRATION_FILE="sql/migrations/add_detailed_order_fields.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Erreur: Le fichier de migration $MIGRATION_FILE n'existe pas"
    exit 1
fi

echo "📄 Fichier de migration trouvé: $MIGRATION_FILE"
echo ""

# Demander les informations de connexion Supabase
read -p "🔑 Entrez l'URL de votre projet Supabase (ex: db.xxx.supabase.co): " SUPABASE_HOST
read -p "🔑 Entrez le port (par défaut 5432): " SUPABASE_PORT
SUPABASE_PORT=${SUPABASE_PORT:-5432}

read -p "🔑 Entrez le nom de la base de données (par défaut postgres): " SUPABASE_DB
SUPABASE_DB=${SUPABASE_DB:-postgres}

read -p "🔑 Entrez le nom d'utilisateur (par défaut postgres): " SUPABASE_USER
SUPABASE_USER=${SUPABASE_USER:-postgres}

read -sp "🔑 Entrez le mot de passe: " SUPABASE_PASSWORD
echo ""
echo ""

# Exporter le mot de passe pour psql
export PGPASSWORD="$SUPABASE_PASSWORD"

echo "📊 Connexion à la base de données..."
echo ""

# Exécuter la migration
psql -h "$SUPABASE_HOST" -p "$SUPABASE_PORT" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration appliquée avec succès!"
    echo ""
    echo "📋 Vérification des colonnes ajoutées..."
    
    # Vérifier que les colonnes ont été ajoutées
    psql -h "$SUPABASE_HOST" -p "$SUPABASE_PORT" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -c "
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name IN (
      'pickup_contact_name', 'pickup_contact_phone', 'pickup_instructions',
      'delivery_contact_name', 'delivery_contact_phone', 'delivery_instructions',
      'package_type', 'formula', 'schedule_type', 'notes',
      'billing_name', 'billing_address', 'billing_zip', 'billing_city',
      'billing_company', 'billing_siret', 'sender_email'
    )
    ORDER BY column_name;
    "
    
    echo ""
    echo "✅ Toutes les modifications ont été appliquées avec succès!"
    echo ""
    echo "📖 Pour plus d'informations, consultez: docs/affichage-informations-commande.md"
else
    echo ""
    echo "❌ Erreur lors de l'application de la migration"
    echo "Veuillez vérifier les logs ci-dessus pour plus de détails"
    exit 1
fi

# Nettoyer le mot de passe
unset PGPASSWORD
