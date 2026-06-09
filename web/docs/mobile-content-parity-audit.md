# Mobile content parity audit

Audit date: 2026-06-09

Scope: verify Google mobile-first indexing content parity — the mobile DOM must expose the same primary content as desktop (nav chrome exempt).

## Findings

| Area | Pattern | Verdict |
|------|---------|---------|
| [Navbar.tsx](../components/layout/Navbar.tsx) | Desktop `nav` is `hidden lg:flex`; mobile menu lists identical `nav` + `footerNav` links | **OK** — parity via mobile menu |
| [Navbar.tsx](../components/layout/Navbar.tsx) | Subtitle link `hidden sm:inline-block` | **OK** — decorative label; not primary content |
| [Navbar.tsx](../components/layout/Navbar.tsx) | Primary CTA `hidden md:inline-flex` | **OK** — duplicated in mobile menu |
| [DocsShell.tsx](../components/docs/DocsShell.tsx) | Sidebar `hidden lg:block`; mobile docs menu modal exposes same `DocsSidebar` | **OK** |
| [DocsShell.tsx](../components/docs/DocsShell.tsx) | TOC column desktop-only; `DocsTocMobile` renders in main column | **OK** |
| [Footer.tsx](../components/layout/Footer.tsx) | All link groups visible on mobile (stacked grid) | **OK** |
| Marketing pages | No substantive `hidden` blocks without a mobile equivalent in `web/components/marketing` | **OK** |
| Dashboard | Same DOM for all viewports; panels stack responsively | **OK** |

## Actions taken

- Fixed mobile navigation scroll/cutoff so all footer nav links (including About) are reachable on small screens.
- Fixed tablet dead-zone (768–1023px) where hamburger opened an invisible modal.
- Fixed desktop docs search opening an invisible scroll-locking modal.
- Added Playwright guards for horizontal overflow and menu scroll on primary routes.

## Ongoing monitoring

- `tests/e2e/mobile-responsive.spec.ts` — overflow + menu scroll on every PR (CI).
- `tests/e2e/a11y-mobile.spec.ts` — critical/serious axe violations on key routes.
- Lighthouse CI mobile budgets in `.github/workflows/ci.yml`.

## No parity gaps requiring code changes

All primary marketing, docs, and product content is present in the mobile DOM. Responsive hiding is limited to navigation chrome and layout affordances with mobile equivalents.
