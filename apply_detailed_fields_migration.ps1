# Script PowerShell pour appliquer la migration des champs détaillés de commande
# Usage: .\apply_detailed_fields_migration.ps1

Write-Host "🚀 Application de la migration pour les champs détaillés de commande..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si le fichier de migration existe
$MigrationFile = "sql\migrations\add_detailed_order_fields.sql"

if (-not (Test-Path $MigrationFile)) {
    Write-Host "❌ Erreur: Le fichier de migration $MigrationFile n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Fichier de migration trouvé: $MigrationFile" -ForegroundColor Green
Write-Host ""

# Demander les informations de connexion Supabase
$SupabaseHost = Read-Host "🔑 Entrez l'URL de votre projet Supabase (ex: db.xxx.supabase.co)"
$SupabasePort = Read-Host "🔑 Entrez le port (par défaut 5432)"
if ([string]::IsNullOrWhiteSpace($SupabasePort)) { $SupabasePort = "5432" }

$SupabaseDB = Read-Host "🔑 Entrez le nom de la base de données (par défaut postgres)"
if ([string]::IsNullOrWhiteSpace($SupabaseDB)) { $SupabaseDB = "postgres" }

$SupabaseUser = Read-Host "🔑 Entrez le nom d'utilisateur (par défaut postgres)"
if ([string]::IsNullOrWhiteSpace($SupabaseUser)) { $SupabaseUser = "postgres" }

$SupabasePassword = Read-Host "🔑 Entrez le mot de passe" -AsSecureString
$SupabasePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SupabasePassword))

Write-Host ""
Write-Host "📊 Connexion à la base de données..." -ForegroundColor Cyan
Write-Host ""

# Définir la variable d'environnement pour le mot de passe
$env:PGPASSWORD = $SupabasePasswordPlain

# Construire la commande psql
$psqlCommand = "psql -h `"$SupabaseHost`" -p `"$SupabasePort`" -U `"$SupabaseUser`" -d `"$SupabaseDB`" -f `"$MigrationFile`""

try {
    # Exécuter la migration
    Invoke-Expression $psqlCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration appliquée avec succès!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Vérification des colonnes ajoutées..." -ForegroundColor Cyan
        
        # Vérifier que les colonnes ont été ajoutées
        $verifyQuery = @"
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
"@
        
        $verifyCommand = "psql -h `"$SupabaseHost`" -p `"$SupabasePort`" -U `"$SupabaseUser`" -d `"$SupabaseDB`" -c `"$verifyQuery`""
        Invoke-Expression $verifyCommand
        
        Write-Host ""
        Write-Host "✅ Toutes les modifications ont été appliquées avec succès!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📖 Pour plus d'informations, consultez: docs\affichage-informations-commande.md" -ForegroundColor Cyan
    }
    else {
        Write-Host ""
        Write-Host "❌ Erreur lors de l'application de la migration" -ForegroundColor Red
        Write-Host "Veuillez vérifier les logs ci-dessus pour plus de détails" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Nettoyer le mot de passe
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
