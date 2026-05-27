[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $repoRoot

$status = git status --short --untracked-files=no
if ($status) {
  throw "Tracked changes are present. Resolve them before merging worktree branches."
}

$branches = @(
  "refs/heads/web/styling",
  "refs/heads/web/components",
  "refs/heads/web/design",
  "refs/heads/web/ux-structure",
  "refs/heads/web/interactions",
  "refs/heads/web/copy"
)

foreach ($branch in $branches) {
  Write-Host ""
  Write-Host "Merging $branch into main..."
  git switch main
  git merge $branch --no-edit
  if ($LASTEXITCODE -ne 0) {
    throw "Conflict while merging $branch. Resolve using the ownership priority in AGENT_CONTRACT.md."
  }

  Push-Location (Join-Path $repoRoot "web")
  npm run build
  Pop-Location
}

Push-Location (Join-Path $repoRoot "web")
npm run lint
Pop-Location

Write-Host ""
Write-Host "Smoke test routes:"
Write-Host "  /"
Write-Host "  /try"
Write-Host "  /docs"
Write-Host "  /access"
Write-Host "  /technology"
