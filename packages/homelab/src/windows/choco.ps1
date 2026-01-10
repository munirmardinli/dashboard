# Chocolatey Installation and Setup Script

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$UtilsPath = Join-Path $ScriptDir ".." "utils" "windows" "log.ps1"

# Load logging utilities
if (Test-Path $UtilsPath) {
    . $UtilsPath
} else {
    Write-Host "Error: Could not find log.ps1 at $UtilsPath" -ForegroundColor Red
    exit 1
}

Write-Info "Checking Chocolatey installation..."

# Check if Chocolatey is already installed
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
    
    # Set execution policy for current process
    Set-ExecutionPolicy Bypass -Scope Process -Force
    
    # Install Chocolatey
    try {
        Write-Info "Downloading and installing Chocolatey..."
        Invoke-RunSafe -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -Description "Installing Chocolatey"
        Write-Ok "Chocolatey installed successfully"
    } catch {
        Write-Error "Failed to install Chocolatey: $($_.Exception.Message)"
        exit 1
    }
} else {
    Write-Info "Chocolatey is already installed, skipping installation."
}

# Refresh environment variables to make choco available
Write-Info "Refreshing environment variables..."
$env:ChocolateyInstall = Convert-Path "$((Get-Command choco).Path)\..\.."
Import-Module "$env:ChocolateyInstall\helpers\chocolateyProfile.psm1"
refreshenv

Write-Ok "Chocolatey setup completed successfully"
