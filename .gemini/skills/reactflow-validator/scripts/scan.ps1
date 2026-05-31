# .skills/reactflow-validator/scripts/scan.ps1

Write-Host "--- Running Yarn Vulnerability Audit ---"
$webDir = Join-Path $PSScriptRoot "..\..\..\web"
Push-Location $webDir
yarn audit
Pop-Location

Write-Host "`n--- Generating Gradle Dependency Tree for Submodules ---"
$gradlew = Join-Path $PSScriptRoot "..\..\..\gradlew.bat"
& $gradlew :common:dependencies :gateway:dependencies :designer:dependencies
