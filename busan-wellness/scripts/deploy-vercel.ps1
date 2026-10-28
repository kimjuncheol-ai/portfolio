$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
$npx = Get-Command npx.cmd -ErrorAction SilentlyContinue
$node = Get-Command node -ErrorAction SilentlyContinue
if ($npx) { $cli = $npx.Source; $cliPrefix = @('--yes','vercel@latest') }
elseif ($node) {
    $pnpmPath = Join-Path (Split-Path (Split-Path $node.Source -Parent) -Parent) 'node_modules/pnpm/bin/pnpm.cjs'
    if (-not (Test-Path -LiteralPath $pnpmPath)) { throw 'npm/npx or pnpm is required.' }
    $cli = $node.Source; $cliPrefix = @($pnpmPath,'dlx','vercel@latest')
} else { throw 'Node.js is required.' }
if (-not (Test-Path -LiteralPath '.env')) { throw 'Run scripts/register-keys.ps1 first.' }
function Invoke-Vercel {
    param([string[]]$CliArgs)
    & $cli @cliPrefix @CliArgs
    if ($LASTEXITCODE -ne 0) { throw 'Vercel command failed. Check login/project access and retry.' }
}
& $cli @cliPrefix whoami 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { Invoke-Vercel -CliArgs @('login') }
if (-not (Test-Path -LiteralPath '.vercel/project.json')) { Invoke-Vercel -CliArgs @('link') }
$settings = @{}
foreach ($line in [IO.File]::ReadAllLines((Join-Path (Get-Location) '.env'))) { if ($line -match '^(TOUR_API_KEY|BUSAN_FESTIVAL_API_KEY)=(.+)$') { $settings[$matches[1]] = $matches[2] } }
foreach ($name in @('TOUR_API_KEY','BUSAN_FESTIVAL_API_KEY')) {
    if (-not $settings.ContainsKey($name)) { throw 'Missing API key in .env.' }
    # Values travel via stdin, never command arguments, browser code, or logs.
    $settings[$name] | & $cli @cliPrefix env add $name production --force
    if ($LASTEXITCODE -ne 0) { throw 'Failed to register the Vercel production environment variable.' }
}
$settings.Clear()
Invoke-Vercel -CliArgs @('--prod')
