<#
run.ps1 - safe runner for the backend FastAPI server

# Usage examples:
# start in foreground (shows logs)
# PS> .\run.ps1 -Key '<YOUR_KEY>' -Mode foreground
#
# start in background (detached)
# PS> .\run.ps1 -Key '<YOUR_KEY>' -Mode background
#
# if you already exported BACKEND_API_KEY in the session, omit -Key
# > $env:BACKEND_API_KEY = '<YOUR_KEY>'; .\run.ps1
#>
# Notes:
# - Requires a Python venv at ./.venv with required packages installed (see README).
# - Foreground mode prints logs to the current terminal. Background mode starts a new hidden PowerShell.
# - This script does minimal safety checks to avoid accidentally exposing an unset API key.
#>
param(
    [string]$Key,
    [ValidateSet('foreground','background')]
    [string]$Mode = 'foreground'
)

# If key provided as parameter, set it for this process
if ($Key) {
    $env:BACKEND_API_KEY = $Key
}

if (-not $env:BACKEND_API_KEY) {
    Write-Error "BACKEND_API_KEY is not set. Provide -Key or set the env var before running. Aborting."
    exit 1
}

$venvPython = Join-Path $PSScriptRoot '.\.venv\Scripts\python.exe'
if (-not (Test-Path $venvPython)) {
    Write-Error ".venv/python not found at $venvPython. Create venv and install requirements first (see README)."
    exit 1
}

$uvicornCmd = "& `"$venvPython`" -m uvicorn src.main:app --host 0.0.0.0 --port 8000"

if ($Mode -eq 'background') {
    # start detached process and propagate the env var to the child
    $startCmd = "`$env:BACKEND_API_KEY='$($env:BACKEND_API_KEY)'; & '$venvPython' -m uvicorn src.main:app --host 0.0.0.0 --port 8000"
    Start-Process -FilePath powershell.exe -ArgumentList '-NoProfile','-WindowStyle','Hidden','-Command',$startCmd | Out-Null
    Write-Output "uvicorn started in background (port 8000)."
} else {
    Write-Output "Starting uvicorn in foreground (Ctrl+C to stop)."
    Invoke-Expression $uvicornCmd
}
