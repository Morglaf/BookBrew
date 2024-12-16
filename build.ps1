# Configuration stricte des erreurs
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Fonction pour afficher les messages avec des emojis
function Write-Step {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    $emoji = switch ($Type) {
        "Info"    { "ℹ️" }
        "Success" { "✅" }
        "Warning" { "⚠️" }
        "Error"   { "❌" }
        "Start"   { "🚀" }
        default   { "📌" }
    }
    Write-Host "$emoji $Message"
}

# Chemins avec échappement des caractères spéciaux
$sourceDir = (Get-Item -LiteralPath $PSScriptRoot).FullName
$targetDir = "D:\1DOS] Notes\.obsidian\plugins\bookbrew"

Write-Step -Message "Début du processus de build..." -Type "Start"

# Nettoyage rapide des fichiers de build
Write-Step "Nettoyage rapide des fichiers de build..."
$filesToRemove = @(
    (Join-Path $sourceDir "main.js"),
    (Join-Path $sourceDir "*.js.map")
)
Remove-Item -Path $filesToRemove -Force -ErrorAction SilentlyContinue

# Nettoyage du dossier cible s'il existe
if (Test-Path -LiteralPath $targetDir) {
    Write-Step "Nettoyage du dossier cible..."
    Get-ChildItem -LiteralPath $targetDir -Exclude "data" | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
} else {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# Vérification rapide de Node.js
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Step "Node.js $nodeVersion, npm $npmVersion"
} catch {
    Write-Step "Node.js ou npm non trouvé" -Type "Error"
    exit 1
}

# Build du projet
Write-Step "Build du projet..."
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Step "Erreur lors du build :" -Type "Error"
    $buildOutput
    exit 1
}

# Copie rapide des fichiers
Write-Step "Copie des fichiers..."
$filesToCopy = @{
    (Join-Path $sourceDir "main.js") = (Join-Path $targetDir "main.js")
    (Join-Path $sourceDir "manifest.json") = (Join-Path $targetDir "manifest.json")
    (Join-Path $sourceDir "styles.css") = (Join-Path $targetDir "styles.css")
}

foreach ($source in $filesToCopy.Keys) {
    if (Test-Path -LiteralPath $source) {
        Copy-Item -LiteralPath $source -Destination $filesToCopy[$source] -Force
    }
}

# Copie des ressources si elles existent
$typesetSource = Join-Path $sourceDir "typeset"
$typesetTarget = Join-Path $targetDir "typeset"
if (Test-Path -LiteralPath $typesetSource) {
    Copy-Item -LiteralPath $typesetSource -Destination $typesetTarget -Recurse -Force
}

Write-Step "Build terminé avec succès!" -Type "Success"
Write-Step "Plugin déployé dans: $targetDir" -Type "Success"