[CmdletBinding()]
param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$scriptRoot = $PSScriptRoot

Set-Location $repoRoot

$status = git status --short
if ($status) {
  throw "Working tree is not clean. Commit or stash changes before launching parallel worktrees."
}

$branch = git branch --show-current
if ($branch -ne "main") {
  throw "Launch must start from main. Current branch: $branch"
}

Write-Host "Setting up worktrees..."
& (Join-Path $scriptRoot "setup-worktrees.ps1") @PSBoundParameters

Write-Host ""
Write-Host "Installing orchestrator dependencies..."
Push-Location $scriptRoot
npm install
Pop-Location

$worktreePaths = @(
  (Join-Path $repoRoot "..\qtangl-web-styling"),
  (Join-Path $repoRoot "..\qtangl-web-components"),
  (Join-Path $repoRoot "..\qtangl-web-design"),
  (Join-Path $repoRoot "..\qtangl-web-ux-structure"),
  (Join-Path $repoRoot "..\qtangl-web-interactions"),
  (Join-Path $repoRoot "..\qtangl-web-copy")
)

Write-Host ""
Write-Host "Installing web dependencies in each worktree..."
$jobs = @()
foreach ($path in $worktreePaths) {
  $jobs += Start-Job -ArgumentList $path -ScriptBlock {
    param($worktreePath)
    Push-Location (Join-Path $worktreePath "web")
    npm install
    Pop-Location
  }
}

Receive-Job -Job $jobs -Wait -AutoRemoveJob | Out-Host

if (-not $env:CURSOR_API_KEY) {
  Write-Warning "CURSOR_API_KEY is not set. Falling back to opening worktrees in Cursor."
  foreach ($path in $worktreePaths) {
    Write-Host "Open a Worktree chat in: $path"
    $cursorCmd = Get-Command cursor -ErrorAction SilentlyContinue
    if ($cursorCmd) {
      cursor $path
    }
  }
  Write-Host ""
  Write-Host "Paste the prompt files from scripts/web-worktrees/prompts/ into each worktree chat."
  exit 0
}

Write-Host ""
Write-Host "Launching six SDK agents in parallel..."
Push-Location $scriptRoot
npx tsx launch-agents.ts
Pop-Location
