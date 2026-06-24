# Premier partner custom domain

Configure white-label portal at a partner-owned subdomain (e.g. `security.acmepartners.com`).

## Prerequisites

- Premier partner tier (`settings.partnerTier: "premier"`)
- Vercel project access for `www.qtangl.com` web app
- Partner admin can set `customDomain` in Settings (future UI) or via admin API

## DNS (partner)

```
security.acmepartners.com  CNAME  cname.vercel-dns.com
```

## Vercel (Qtangl ops)

1. Add domain in Vercel project → Domains
2. Verify SSL provisioning
3. Set tenant settings:
   ```json
   {
     "customDomain": "security.acmepartners.com",
     "customDomainStatus": "pending",
     "customDomainVerifiedAt": null
   }
   ```
4. After DNS propagates, set `customDomainStatus: "active"` and timestamp

## Middleware

[`web/middleware.ts`](../../web/middleware.ts) resolves `status.qtangl.com` today. Custom domain tenant routing uses `QTANGL_CUSTOM_DOMAIN_MAP` env (JSON map host → tenantId) for Premier pilots until dynamic DB lookup ships.

## Security

Run `backend/tests/test_partner_delegation_security.py` and cross-tenant isolation review before enabling production custom domains.
