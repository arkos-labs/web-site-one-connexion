# Script de redémarrage du serveur de développement
# Tue tous les processus Node et redémarre le serveur

Write-Host "🔴 Arrêt de tous les processus Node..." -ForegroundColor Red
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "✅ Processus Node arrêtés" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Démarrage du serveur de développement..." -ForegroundColor Cyan
Write-Host ""

# Démarrer le serveur
npm run dev
