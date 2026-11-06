# Run from any directory: .\scripts\start-local-ml.ps1
# Starts only local processes; never edits production env files or calls cloud services.
$ErrorActionPreference = 'Stop'
$repoPath = Split-Path $PSScriptRoot -Parent
$pythonPath = Join-Path $repoPath 'ml/.venv/Scripts/python.exe'
$checkpointPath = Join-Path $repoPath 'ml/artifacts/run1/best.pt'
if (!(Test-Path -LiteralPath $pythonPath) -or !(Test-Path -LiteralPath $checkpointPath)) {
    throw 'Local Python environment or genuine checkpoint missing. See docs/ml/TRAINING_GUIDE.md. The frontend can still run independently.'
}
$previousToken = $env:BLUECRED_ML_TOKEN
$previousEnabled = $env:BLUECRED_ML_ENABLED
$previousCheckpoint = $env:BLUECRED_ML_CHECKPOINT
$serviceProcess = $null
try {
    $tokenBytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($tokenBytes) } finally { $rng.Dispose() }
    $env:BLUECRED_ML_TOKEN = [Convert]::ToBase64String($tokenBytes)
    $env:BLUECRED_ML_ENABLED = 'true'
    $env:BLUECRED_ML_CHECKPOINT = $checkpointPath
    # Never replace an existing listener or stop a process we did not start.
    $probe = New-Object System.Net.Sockets.TcpClient
    try {
        $probe.Connect('127.0.0.1', 8765)
        throw 'Port 8765 is already in use. Stop your existing service yourself or use its existing setup.'
    } catch [System.Net.Sockets.SocketException] {
        # No listener: safe to start our own local process.
    } finally { $probe.Dispose() }
    $serviceProcess = Start-Process -FilePath $pythonPath -ArgumentList @('-m','uvicorn','ml.service:app','--host','127.0.0.1','--port','8765') -WorkingDirectory $repoPath -WindowStyle Hidden -PassThru
    $ready = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        if ($serviceProcess.HasExited) { throw 'The local inference service exited during startup.' }
        try {
            $state = Invoke-RestMethod -Uri 'http://127.0.0.1:8765/health' -Headers @{ 'x-bluecred-token' = $env:BLUECRED_ML_TOKEN } -TimeoutSec 2
            if ($state.ready) { $ready = $true; break }
        } catch { }
        Start-Sleep -Milliseconds 250
    }
    if (!$ready) { throw 'The local checkpoint is not ready. Inspect the model card and setup.' }
    Write-Host ('Local model ready: ' + $state.model_version + '. Starting the existing frontend; Ctrl+C stops the local helper.')
    # Splat literal arguments so PowerShell does not consume npm's -- separator.
    $frontendArguments = @('--prefix', (Join-Path $repoPath 'frontend'), 'run', 'dev', '--', '--hostname', '127.0.0.1')
    & npm @frontendArguments
} finally {
    if ($serviceProcess -and !$serviceProcess.HasExited) { Stop-Process -Id $serviceProcess.Id }
    $env:BLUECRED_ML_TOKEN = $previousToken
    $env:BLUECRED_ML_ENABLED = $previousEnabled
    $env:BLUECRED_ML_CHECKPOINT = $previousCheckpoint
}
