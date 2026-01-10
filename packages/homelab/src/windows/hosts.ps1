# Windows Hosts File Configuration Script
# Reads hosts from hosts.json and adds them to C:\Windows\System32\drivers\etc\hosts

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
    Write-Error "This script requires Administrator privileges."
    exit 1
}

function Load-Env {
    param([string]$ScriptDir)

    $currentDir = $ScriptDir
    $rootEnv = $null
    $homelabEnv = $null

    while ($currentDir) {
        if (Test-Path (Join-Path $currentDir "package.json")) {
            $rootEnv = Join-Path $currentDir ".env"
            break
        }
        $currentDir = Split-Path -Parent $currentDir
    }

    $currentDir = $ScriptDir
    while ($currentDir) {
        if ((Split-Path -Leaf $currentDir) -eq "homelab") {
            $parentDir = Split-Path -Parent $currentDir
            if ((Split-Path -Leaf $parentDir) -eq "packages") {
                $homelabEnv = Join-Path $currentDir ".env"
                break
            }
        }
        $currentDir = Split-Path -Parent $currentDir
    }

    foreach ($envFile in @($homelabEnv, $rootEnv)) {
        if ($envFile -and (Test-Path $envFile)) {
            Write-Info "Loading configuration from $envFile ..."
            Get-Content $envFile | ForEach-Object {
                if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
                if ($_ -match '^([^=]+)=(.*)$') {
                    [Environment]::SetEnvironmentVariable(
                        $matches[1].Trim(),
                        $matches[2].Trim(),
                        "Process"
                    )
                }
            }
        }
    }
}

Load-Env -ScriptDir $ScriptDir

$HostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$RepoRoot  = Join-Path $ScriptDir "..\.."
$HostsJson = Join-Path $RepoRoot "hosts.json"

if (-not (Test-Path $HostsJson)) {
    Write-Error "hosts.json not found at $HostsJson"
    exit 1
}

Write-Info "Reading hosts from $HostsJson..."

try {
    $entries = Get-Content $HostsJson -Raw | ConvertFrom-Json
} catch {
    Write-Error "Failed to parse hosts.json: $($_.Exception.Message)"
    exit 1
}

if (-not $entries -or $entries.Count -eq 0) {
    Write-Warn "No entries found in hosts.json"
    exit 0
}

Write-Info "Found $($entries.Count) host entry/entries to process"

$hostsContent = if (Test-Path $HostsFile) { Get-Content $HostsFile } else { @() }

foreach ($entry in $entries) {
    $ip = $entry.ip
    $hostname = $entry.hostname

    if ([string]::IsNullOrWhiteSpace($ip) -or [string]::IsNullOrWhiteSpace($hostname)) {
        Write-Warn "Skipping invalid entry: $($entry | ConvertTo-Json -Compress)"
        continue
    }

    $entryLine = "$ip $hostname"
    Write-Info "Processing: $entryLine"

    $exactMatch = $hostsContent | Where-Object {
        $_ -match "^\s*$([regex]::Escape($ip))\s+$([regex]::Escape($hostname))(\s|$)"
    }

    if ($exactMatch) {
        Write-Ok "Entry already correct: $entryLine"
        continue
    }

    $hostnameMatch = $hostsContent | Where-Object {
        $_ -match "\s+$([regex]::Escape($hostname))(\s|$)"
    }

    if ($hostnameMatch) {
        Write-Warn "Entry for $hostname already exists with different IP:"
        $hostnameMatch | ForEach-Object { Write-Host "  $_" }
        Write-Info "Skipping update. Please update manually if needed."
        continue
    }

    Write-Info "Adding $entryLine to ${HostsFile}..."
    try {
        Add-Content -Path $HostsFile -Value $entryLine -ErrorAction Stop
        Write-Ok "Successfully added $entryLine"
        $hostsContent += $entryLine
    } catch {
        Write-Error "Failed to add entry to ${HostsFile}: $($_.Exception.Message)"
        exit 1
    }
}

Write-Ok "Hosts configuration completed"
