# Windows Setup Script
# Main entry point for Windows homelab setup

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ParentDir = Join-Path $ScriptDir ".."
$UtilsDir = Join-Path $ParentDir "utils"
$UtilsWindowsDir = Join-Path $UtilsDir "windows"
$UtilsPath = Join-Path $UtilsWindowsDir "log.ps1"

if (Test-Path $UtilsPath) {
    . $UtilsPath
} else {
    Write-Host "Error: Could not find log.ps1 at $UtilsPath" -ForegroundColor Red
    exit 1
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
    Write-Warn "This script requires Administrator privileges."
    Write-Host ""
    Write-Host "Option 1: VS Code als Administrator starten (empfohlen - bleibt im Terminal):" -ForegroundColor Cyan
    Write-Host "  1. Schliessen Sie VS Code" -ForegroundColor Yellow
    Write-Host "  2. Rechtsklick auf VS Code -> 'Als Administrator ausfuehren'" -ForegroundColor Yellow
    Write-Host "  3. Fuehren Sie das Skript erneut aus" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 2: Automatisch ein Admin-Fenster oeffnen:" -ForegroundColor Cyan
    Write-Host "  Das Skript wird in einem separaten Admin-Fenster ausgefuehrt" -ForegroundColor Yellow
    Write-Host ""
    
    Add-Type -AssemblyName System.Windows.Forms
    $result = [System.Windows.Forms.MessageBox]::Show(
        "Dieses Skript benötigt Administratorrechte.`n`nOption 1: VS Code als Admin starten (empfohlen)`nOption 2: Admin-Fenster automatisch öffnen`n`nMöchten Sie ein Admin-Fenster öffnen?",
        "Administratorrechte erforderlich",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )
    
    if ($result -eq [System.Windows.Forms.DialogResult]::Yes) {
        Write-Info "Oeffne Admin-Fenster..."
        $scriptPath = $MyInvocation.MyCommand.Path
        Start-Process powershell.exe -Verb RunAs -WindowStyle Normal -ArgumentList "-NoExit -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
        Write-Info "Das Skript wird im Admin-Fenster ausgefuehrt. Bitte schauen Sie dort nach der Ausgabe."
        exit 0
    } else {
        Write-Info "Bitte starten Sie VS Code als Administrator und fuehren Sie das Skript erneut aus."
        exit 1
    }
}

Write-Section "MUNIR - Windows SETUP STARTING"

Write-Info "Checking Chocolatey installation..."
$chocoInstalled = $false
try {
    $chocoVersion = choco --version 2>$null
    if ($chocoVersion) {
        $chocoInstalled = $true
        Write-Ok "Chocolatey is already installed (Version: $chocoVersion)"
    }
} catch {
    $chocoInstalled = $false
}

if (-not $chocoInstalled) {
    Write-Info "Chocolatey is not installed. Installing Chocolatey..."
    
    Set-ExecutionPolicy Bypass -Scope Process -Force
    
    try {
        Write-Info "Downloading and installing Chocolatey..."
        Invoke-RunSafe -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -Description "Installing Chocolatey"
        Write-Ok "Chocolatey installed successfully"
    } catch {
        Write-Error "Failed to install Chocolatey: $($_.Exception.Message)"
        exit 1
    }
    
    Write-Info "Refreshing environment variables..."
    $env:ChocolateyInstall = Convert-Path "$((Get-Command choco).Path)\..\.."
    Import-Module "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
    refreshenv
} else {
    Write-Info "Chocolatey is already installed, skipping installation."
}

$ChocoScript = Join-Path $ScriptDir "choco.ps1"
if (Test-Path $ChocoScript) {
    Write-Info "Installing packages..."
    & $ChocoScript
} else {
    Write-Error "Chocolatey script not found: $ChocoScript"
    exit 1
}

$HostsScript = Join-Path $ScriptDir "hosts.ps1"
if (Test-Path $HostsScript) {
    Write-Info "Starting hosts.ps1 ..."
    & $HostsScript
} else {
    Write-Error "Hosts script not found: $HostsScript"
    exit 1
}

Write-Section "MUNIR - Setup completed successfully!"
