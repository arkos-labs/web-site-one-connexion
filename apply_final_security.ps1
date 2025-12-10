# Script pour appliquer la mise à jour de sécurité finale
$ErrorActionPreference = "Stop"

Write-Host "🔐 Application de la mise à jour de sécurité..." -ForegroundColor Cyan

# Configuration
$EnvFile = ".env"
if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$SupabaseUrl = [Environment]::GetEnvironmentVariable("VITE_SUPABASE_URL")
$SupabaseKey = [Environment]::GetEnvironmentVariable("VITE_SUPABASE_ANON_KEY")

if (-not $SupabaseUrl -or -not $SupabaseKey) {
    Write-Error "❌ Configuration Supabase manquante dans .env"
    exit 1
}

Write-Host "✅ Configuration chargée" -ForegroundColor Green

# Instructions manuelles car nous ne pouvons pas exécuter SQL directement depuis ici sans client
Write-Host "`n⚠️  INSTRUCTIONS IMPORTANTES ⚠️" -ForegroundColor Yellow
Write-Host "Pour appliquer ces changements, veuillez :"
Write-Host "1. Copier le contenu du fichier 'sql/final_security_update.sql'"
Write-Host "2. Aller sur https://app.supabase.com"
Write-Host "3. Ouvrir l'éditeur SQL"
Write-Host "4. Coller et exécuter le script"
Write-Host "`nLe fichier se trouve ici : $(Resolve-Path 'sql/final_security_update.sql')" -ForegroundColor Cyan
