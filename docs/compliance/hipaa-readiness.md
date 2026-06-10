# HIPAA readiness (optional track)

**Version:** 0.1 · **Last updated:** 2026-06-10  
**Trigger:** First healthcare pilot with PHI in scan metadata or reports.

## Shared responsibility

| Layer | Railway (Enterprise) | Qtangl |
|-------|---------------------|--------|
| Hosting BAA | Railway HIPAA BAA add-on | Execute; no support access to workloads |
| Application | — | PHI minimization, log redaction (G9), encryption |
| Customer contract | — | Counsel-reviewed **customer BAA** |
| Other subprocessors | — | Vercel/Resend BAA if PHI touches them |
| Analytics | — | Disable PostHog/OpenAI for HIPAA tenants |

## Pre-pilot checklist

- [ ] Customer BAA drafted (counsel review — Phase 6)
- [ ] Railway HIPAA BAA executed (Phase 5A)
- [ ] PHI data path documented in security overview
- [ ] Log redaction policy implemented or documented exception
- [ ] US-only region default for HIPAA tenant

## Trust center language

> HIPAA-ready configuration available for qualified pilots under signed BAA. Not enabled by default.
