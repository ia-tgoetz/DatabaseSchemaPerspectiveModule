# .skills/reactflow-validator/scripts/test.ps1

Write-Host "--- Executing Build & Deployment ---"
$gradlew = Join-Path $PSScriptRoot "..\..\..\gradlew.bat"
& $gradlew clean build

if ($LASTEXITCODE -eq 0) {
    Write-Host "--- Build Successful! Restarting Gateway ---"
    $restart = Join-Path $PSScriptRoot "..\..\..\restartIgnition.ps1"
    & $restart -designer
} else {
    Write-Host "--- Build Failed! ---"
    exit 1
}
