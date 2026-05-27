# Area

`web/ux-structure`

## Mission

Improve information architecture, remove navigation redundancy, and make page shells consistent so the site flows cleanly from discovery to try/demo to access.

## Owned files

- `web/lib/siteConfig.ts`
- `web/app/layout.tsx`
- `web/app/sitemap.ts`
- `web/components/layout/*`
- Page shell structure in `web/app/**/page.tsx`
- New shared shell component(s), including `web/components/layout/PageHero.tsx`

## Concrete tasks

1. Resolve the duplicate `/try` treatment in the navbar so the page is not both a regular nav item and a competing CTA in a confusing way.
2. Add missing `/try` and `/docs/data-formats` entries to `sitemap.ts`.
3. Clarify the `/api` versus `/docs/api` relationship without deleting either route recklessly.
4. Add a keyboard-visible skip link in `layout.tsx` and ensure page shells use a consistent `main` target.
5. Create a reusable `PageHero` component and move at least four marketing-style pages onto it without rewriting their copy.
6. Reduce layout duplication across `Try`, `Access`, `About`, `Technology`, `Blog`, and `API`.
7. Add a “Back to blog” affordance and CTA slot structure to `ArticleLayout`.
8. Simplify the `Access` page shell so the intro content is not repeated across too many side panels.
9. Normalize bottom padding and shell spacing across marketing pages.

## Acceptance criteria

- `/try` appears in the sitemap.
- The skip link is keyboard reachable.
- At least four pages use the shared hero shell.
- Navbar CTA structure is cleaner and less redundant.
- `npm run lint` and `npm run build` pass from `web/`.

## Forbidden

- No copy rewrites.
- No CSS token changes.
- No `TryPlanner` logic changes.
- No modal behavior changes.
