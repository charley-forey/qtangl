# Area

`web/design`

## Mission

Apply visual polish using the existing token system: fix the OG mismatch, make better use of current assets, and standardize the visual rhythm of key marketing surfaces.

## Owned files

- `web/public/*`
- `web/app/opengraph-image.tsx`
- `web/app/icon.svg`
- Visual class usage in `web/components/marketing/Hero.tsx`
- Visual class usage in `web/components/marketing/FeatureCard.tsx`
- Visual class usage in `web/components/marketing/CTA.tsx`
- `web/app/technology/page.tsx` for visual composition only

## Concrete tasks

1. Replace the hardcoded OG headline in `opengraph-image.tsx` with copy imported from `web/lib/copy/product.ts`.
2. Audit `web/public/logo.svg`; wire it into a real use or remove it if it is dead.
3. Use `qtangl-technology-solver-grid.svg` on the Technology page instead of the current placeholder treatment.
4. Standardize panel radii and spacing rhythm across `Hero`, `FeatureCard`, and `CTA` using the existing token layer, not new CSS variables.
5. Audit image presentation so grayscale, sizing, and framing are consistent.
6. Ensure meaningful visual assets have non-empty alt text; use placeholders plus `WORKTREE-TODO(web/copy)` only when genuinely blocked.
7. Verify the icon setup remains coherent with `logo-mark.svg` and `app/icon.svg`.

## Acceptance criteria

- OG image headline matches the central product tagline source.
- Technology page uses the solver-grid asset.
- No new CSS variables are introduced.
- `npm run lint` and `npm run build` pass from `web/`.

## Forbidden

- No copy rewrites beyond importing existing copy.
- No navigation or route changes.
- No component API changes.
- No form or motion logic changes.
