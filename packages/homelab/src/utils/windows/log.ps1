# PowerShell Logging Utilities
# Similar to Unix utils.sh but for Windows PowerShell

$Script:LogFile = "install.log"

function Write-Timestamp {
    return Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $timestamp = Write-Timestamp
    $logMessage = "[$timestamp] $Level`: $Message"
    Add-Content -Path $Script:LogFile -Value $logMessage
}

# Define functions directly in global scope
function global:Write-Ok {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
    Write-Log -Message $Message -Level "OK"
}

function global:Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
    Write-Log -Message $Message -Level "INFO"
}

function global:Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
    Write-Log -Message $Message -Level "WARN"
}

function global:Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    Write-Log -Message $Message -Level "ERROR"
}

function global:Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Log -Message $Title -Level "SECTION"
}

function global:Invoke-RunSafe {
    param(
        [string]$Command,
        [string]$Description = ""
    )
    if ($Description) {
        Write-Log -Message "RUN: $Description" -Level "INFO"
    } else {
        Write-Log -Message "RUN: $Command" -Level "INFO"
    }
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne $null) {
            throw "Command failed with exit code $LASTEXITCODE"
        }
    } catch {
        Write-Error "Error executing command: $Command"
        Write-Error $_.Exception.Message
        exit 1
    }
}
