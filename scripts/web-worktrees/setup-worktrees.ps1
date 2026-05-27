[CmdletBinding()]
param(
  [switch]$Force
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $repoRoot

$worktrees = @(
  @{ Id = "styling"; Branch = "web/styling"; Path = "..\qtangl-web-styling"; Port = 3001 },
  @{ Id = "components"; Branch = "web/components"; Path = "..\qtangl-web-components"; Port = 3002 },
  @{ Id = "design"; Branch = "web/design"; Path = "..\qtangl-web-design"; Port = 3003 },
  @{ Id = "ux-structure"; Branch = "web/ux-structure"; Path = "..\qtangl-web-ux-structure"; Port = 3004 },
  @{ Id = "interactions"; Branch = "web/interactions"; Path = "..\qtangl-web-interactions"; Port = 3005 },
  @{ Id = "copy"; Branch = "web/copy"; Path = "..\qtangl-web-copy"; Port = 3006 }
)

$existingWorktrees = git worktree list --porcelain

foreach ($worktree in $worktrees) {
  $targetPath = Resolve-Path -LiteralPath "." | ForEach-Object {
    [System.IO.Path]::GetFullPath((Join-Path $_ $worktree.Path))
  }

  if (Test-Path -LiteralPath $targetPath) {
    if (-not $Force) {
      Write-Host "Worktree path already exists, keeping as-is: $targetPath"
      continue
    }

    if ($existingWorktrees -match [regex]::Escape($targetPath)) {
      Write-Host "Worktree already registered: $targetPath"
      continue
    }

    throw "Path already exists but is not a registered worktree: $targetPath"
  }

  git show-ref --verify --quiet "refs/heads/$($worktree.Branch)"
  $branchExists = $LASTEXITCODE -eq 0
  if ($branchExists) {
    Write-Host "Attaching existing branch $($worktree.Branch) at $targetPath"
    git worktree add "$targetPath" "$($worktree.Branch)"
  }
  else {
    Write-Host "Creating branch $($worktree.Branch) at $targetPath"
    git worktree add "$targetPath" -b "$($worktree.Branch)" main
  }
}

Write-Host ""
git worktree list
