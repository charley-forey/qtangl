# Qtangl local dev helpers (PowerShell)
# Usage: .\scripts\dev.ps1 help

param(
    [Parameter(Position = 0)]
    [ValidateSet("help", "install", "api", "web", "compose", "test", "openapi-sync", "stats-sync", "links-check")]
    [string]$Command = "help"
)

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Show-Help {
    Write-Host @"

Qtangl dev.ps1 — Windows helpers

  .\scripts\dev.ps1 install        pip + npm ci
  .\scripts\dev.ps1 api            uvicorn (backend)
  .\scripts\dev.ps1 web            next dev
  .\scripts\dev.ps1 compose        docker compose up --build
  .\scripts\dev.ps1 test           backend pytest + web lint/build
  .\scripts\dev.ps1 openapi-sync   export OpenAPI + SDK types
  .\scripts\dev.ps1 stats-sync     update README auto-stats
  .\scripts\dev.ps1 links-check    verify doc links

Environment: copy backend\.env.example to .env and web\.env.example to web\.env.local

"@
}

switch ($Command) {
    "help" { Show-Help }
    "install" {
        Set-Location "$Root\backend"
        python -m pip install -r requirements.lock -r requirements-dev.lock
        Set-Location "$Root\web"
        npm ci
    }
    "api" {
        Set-Location "$Root\backend"
        if (Test-Path ".venv\Scripts\Activate.ps1") { . .venv\Scripts\Activate.ps1 }
        uvicorn app.main:app --reload
    }
    "web" {
        Set-Location "$Root\web"
        npm run dev
    }
    "compose" {
        docker compose up --build
    }
    "test" {
        Set-Location "$Root\backend"
        $env:QTANGL_ENABLE_QAOA = "false"
        python -m pytest tests/ -q --tb=short
        Set-Location "$Root\web"
        npm run lint
        npm run build
    }
    "openapi-sync" {
        python "$Root\backend\scripts\export_openapi.py"
        python "$Root\scripts\generate_sdk_types.py"
    }
    "stats-sync" {
        node "$Root\scripts\sync-readme-stats.mjs" --write
    }
    "links-check" {
        node "$Root\scripts\check-readme-links.mjs"
    }
}
