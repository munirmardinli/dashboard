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

function Write-Ok {
    param([string]$Message)
    Write-Host "✔ $Message" -ForegroundColor Green
    Write-Log -Message $Message -Level "OK"
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
    Write-Log -Message $Message -Level "INFO"
}

function Write-Warn {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
    Write-Log -Message $Message -Level "WARN"
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    Write-Log -Message $Message -Level "ERROR"
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "──────────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan -NoNewline
    Write-Host ""
    Write-Host "──────────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host ""
    Write-Log -Message $Title -Level "SECTION"
}

function Invoke-RunSafe {
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
