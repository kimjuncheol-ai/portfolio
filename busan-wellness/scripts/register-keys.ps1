param([switch]$Deploy)
$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectPath '.env'
Write-Host ''
Write-Host '=== Slowwave Busan: API key registration ===' -ForegroundColor Green
Write-Host 'Values are hidden. Paste a key, then press Enter.'
Write-Host '1. TOUR_API_KEY: Korea Tourism Organization Wellness API'
Write-Host '2. BUSAN_FESTIVAL_API_KEY: Busan Festival API'
Write-Host 'Use the General Authentication Key (Decoding). Encoded keys also work.'
Write-Host 'Both API services must be approved on data.go.kr.'
$old = @{}
if (Test-Path -LiteralPath $envPath) {
    foreach ($line in [IO.File]::ReadAllLines($envPath)) {
        if ($line -match '^([A-Z_]+)=(.*)$') { $old[$matches[1]] = $matches[2] }
    }
    Write-Host 'Press Enter without a value to keep an existing key.'
}
$lines = @()
foreach ($name in @('TOUR_API_KEY','BUSAN_FESTIVAL_API_KEY')) {
    $secret = Read-Host -Prompt $name -AsSecureString
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
    try { $value = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr).Trim() }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr); $secret.Dispose() }
    if (-not $value -and $old.ContainsKey($name)) { $value = $old[$name] }
    if (-not $value -or $value -notmatch '^[A-Za-z0-9%+/=_-]+$') { throw 'Missing or invalid key. No changes were saved.' }
    $lines += "$name=$value"
    $value = $null
}
# Only the two named keys are changed; unrelated settings are retained.
$other = @()
if (Test-Path -LiteralPath $envPath) { $other = @([IO.File]::ReadAllLines($envPath) | Where-Object { $_ -notmatch '^(TOUR_API_KEY|BUSAN_FESTIVAL_API_KEY)=' }) }
$tempPath = Join-Path $projectPath ('.env.' + [guid]::NewGuid().ToString('N') + '.tmp')
try {
    [IO.File]::WriteAllLines($tempPath, @($other) + $lines, [Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $tempPath -Destination $envPath -Force
} finally { if (Test-Path -LiteralPath $tempPath) { Remove-Item -LiteralPath $tempPath -Force }; $lines = $null; $old.Clear() }
Write-Host 'Saved to project .env. No key values were printed.' -ForegroundColor Green
Write-Host 'Refresh http://localhost:3210 to load live public data.'
Write-Host 'Vercel deployment: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-vercel.ps1'
if ($Deploy) { & (Join-Path $PSScriptRoot 'deploy-vercel.ps1') }
