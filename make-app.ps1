Set-Location $PSScriptRoot
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm run install:all
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "Building app..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "Starting CryptoTrack at http://localhost:3000" -ForegroundColor Green
$env:SERVE_CLIENT = "true"
Set-Location Server
npm start
