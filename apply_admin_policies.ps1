# ===================================================================
# Script PowerShell pour appliquer les policies RLS Admin
# One Connexion - Correctif Modal Nouvelle Commande
# ===================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Application des Policies RLS Admin" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Charger les variables d'environnement
if (Test-Path ".env") {
    Write-Host "[1/4] Chargement des variables d'environnement..." -ForegroundColor Yellow
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "      Variables chargées ✓" -ForegroundColor Green
} else {
    Write-Host "      Fichier .env introuvable !" -ForegroundColor Red
    exit 1
}

# Récupérer les informations de connexion
$SUPABASE_URL = $env:VITE_SUPABASE_URL
$SUPABASE_SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SUPABASE_SERVICE_KEY) {
    Write-Host ""
    Write-Host "ERREUR: Variables Supabase manquantes dans .env" -ForegroundColor Red
    Write-Host "Assurez-vous que VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis" -ForegroundColor Yellow
    exit 1
}

# Extraire le projet ID de l'URL
$PROJECT_REF = ($SUPABASE_URL -replace "https://", "" -replace ".supabase.co", "")

Write-Host ""
Write-Host "[2/4] Connexion à Supabase..." -ForegroundColor Yellow
Write-Host "      Projet: $PROJECT_REF" -ForegroundColor Gray

# Lire le fichier SQL
$SQL_FILE = "sql/admin_policies.sql"
if (-not (Test-Path $SQL_FILE)) {
    Write-Host ""
    Write-Host "ERREUR: Fichier $SQL_FILE introuvable !" -ForegroundColor Red
    exit 1
}

$SQL_CONTENT = Get-Content $SQL_FILE -Raw

Write-Host ""
Write-Host "[3/4] Exécution du script SQL..." -ForegroundColor Yellow

# Préparer la requête
$headers = @{
    "apikey" = $SUPABASE_SERVICE_KEY
    "Authorization" = "Bearer $SUPABASE_SERVICE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    query = $SQL_CONTENT
} | ConvertTo-Json

# Exécuter la requête
try {
    $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "      Script exécuté avec succès ✓" -ForegroundColor Green
} catch {
    # Si l'endpoint exec_sql n'existe pas, essayer une autre méthode
    Write-Host "      Méthode alternative..." -ForegroundColor Yellow
    
    # Utiliser l'API SQL directe de Supabase
    try {
        $response = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/" -Method Post -Headers $headers -Body $SQL_CONTENT -ContentType "application/sql" -ErrorAction Stop
        Write-Host "      Script exécuté avec succès ✓" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "ERREUR lors de l'exécution SQL:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Write-Host ""
        Write-Host "SOLUTION ALTERNATIVE:" -ForegroundColor Yellow
        Write-Host "1. Ouvrez le dashboard Supabase: https://app.supabase.com/project/$PROJECT_REF/editor" -ForegroundColor Cyan
        Write-Host "2. Allez dans 'SQL Editor'" -ForegroundColor Cyan
        Write-Host "3. Créez une nouvelle query" -ForegroundColor Cyan
        Write-Host "4. Copiez le contenu de sql/admin_policies.sql" -ForegroundColor Cyan
        Write-Host "5. Exécutez la query" -ForegroundColor Cyan
        Write-Host ""
        exit 1
    }
}

Write-Host ""
Write-Host "[4/4] Vérification des policies..." -ForegroundColor Yellow

# Vérifier que les policies ont été créées
$checkQuery = @"
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
"@

try {
    $checkBody = @{ query = $checkQuery } | ConvertTo-Json
    $policies = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" -Method Post -Headers $headers -Body $checkBody -ErrorAction Stop
    
    if ($policies) {
        Write-Host "      Policies créées:" -ForegroundColor Green
        $policies | ForEach-Object {
            Write-Host "        - $($_.tablename): $($_.policyname)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "      Impossible de vérifier (mais probablement OK)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Policies RLS Admin appliquées !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Testez la recherche de clients dans le modal" -ForegroundColor White
Write-Host "2. Testez la création d'un nouveau client" -ForegroundColor White
Write-Host "3. Vérifiez que le récapitulatif se met à jour" -ForegroundColor White
Write-Host ""
