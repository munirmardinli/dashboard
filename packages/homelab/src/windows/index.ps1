# Windows Setup Script
# Main entry point for Windows homelab setup

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$UtilsPath = Join-Path $ScriptDir ".." "utils" "windows" "log.ps1"

# Load logging utilities
if (Test-Path $UtilsPath) {
    . $UtilsPath
} else {
    Write-Host "Error: Could not find log.ps1 at $UtilsPath" -ForegroundColor Red
    exit 1
}

# Check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Restart script as Administrator if needed
if (-not (Test-Administrator)) {
    Write-Warn "This script requires Administrator privileges."
    
    # Show alert dialog
    Add-Type -AssemblyName System.Windows.Forms
    $result = [System.Windows.Forms.MessageBox]::Show(
        "Dieses Skript benötigt Administratorrechte. Möchten Sie es mit Administratorrechten neu starten?",
        "Administratorrechte erforderlich",
        [System.Windows.Forms.MessageBoxButtons]::OKCancel,
        [System.Windows.Forms.MessageBoxIcon]::Warning
    )
    
    if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Info "Starte Skript mit Administratorrechten neu..."
        $scriptPath = $MyInvocation.MyCommand.Path
        Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
        exit 0
    } else {
        Write-Error "Setup abgebrochen. Administratorrechte sind erforderlich."
        exit 1
    }
}

Write-Section "🚀 MUNIR - Windows SETUP STARTING"

# Run Chocolatey setup
$ChocoScript = Join-Path $ScriptDir "choco.ps1"
if (Test-Path $ChocoScript) {
    Write-Info "Starting Chocolatey setup..."
    & $ChocoScript
} else {
    Write-Error "Chocolatey script not found: $ChocoScript"
    exit 1
}

Write-Section "MUNIR - Setup completed successfully! 🎉"
