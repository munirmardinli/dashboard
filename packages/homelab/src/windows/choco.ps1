# Package Installation Script
# Installs packages using Chocolatey

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ParentDir = Join-Path $ScriptDir ".."
$UtilsDir = Join-Path $ParentDir "utils"
$UtilsWindowsDir = Join-Path $UtilsDir "windows"
$UtilsPath = Join-Path $UtilsWindowsDir "log.ps1"

# Load logging utilities
if (Test-Path $UtilsPath) {
    . $UtilsPath
} else {
    Write-Host "Error: Could not find log.ps1 at $UtilsPath" -ForegroundColor Red
    exit 1
}

# List of packages to install
$packagesToInstall = @(
    "steam"
)

Write-Section "Installing packages with Chocolatey"

# Get all installed packages once for checking
$allInstalledPackages = choco list --local-only 2>&1 | Out-String

foreach ($package in $packagesToInstall) {
    Write-Info "Installing $package..."
    try {
        # Check if package is already installed (check for both "package" and "package.install")
        $alreadyInstalled = ($allInstalledPackages -match "^$package\s+\d+") -or ($allInstalledPackages -match "^$package\.install\s+\d+")
        
        if ($alreadyInstalled) {
            Write-Info "$package is already installed, skipping..."
            Write-Ok "$package is available"
        } else {
            # Install the package
            choco install $package -y
            if ($LASTEXITCODE -eq 0) {
                Write-Ok "$package installed successfully"
                # Refresh the installed packages list
                $allInstalledPackages = choco list --local-only 2>&1 | Out-String
            } else {
                Write-Warn "$package installation returned exit code $LASTEXITCODE"
            }
        }
    } catch {
        Write-Error "Failed to install $package : $($_.Exception.Message)"
    }
}

Write-Ok "Package installation completed"
