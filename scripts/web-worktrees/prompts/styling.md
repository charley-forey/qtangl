# Area

`web/styling`

## Mission

Establish the design token foundation so the rest of the web app can stop hardcoding spacing, typography, radii, and form styles.

## Owned files

- `web/styles/tokens.css`
- `web/styles/utilities.css`
- `web/app/globals.css`
- `web/components/layout/Section.tsx` for spacing/token wiring only
- `web/components/layout/Footer.tsx` for width and padding alignment only

## Concrete tasks

1. Add typography tokens in `tokens.css`: `--text-display`, `--text-h1`, `--text-h2`, `--text-body`, `--text-label`, plus matching `--leading-*`.
2. Add form and status tokens: `--input-bg`, `--input-border`, `--input-focus`, `--color-success`, `--color-error`.
3. Add utility classes in `utilities.css`: `.section-shell`, `.input-field`, `.heading-display`, `.heading-section`, `.text-body`, `.text-muted`, `.status-message--error`, `.status-message--success`.
4. Extend `@theme inline` in `globals.css` so Tailwind can reference semantic colors and surface/border tokens directly.
5. Replace hardcoded `Section` spacing with token-driven classes using the `--section-space-*` and `--gutter-*` values that already exist.
6. Align `Footer` width and horizontal padding with `Section` by switching from `max-w-7xl` to `max-w-[var(--container-wide)]`.
7. Improve accessibility: stronger `:focus-visible`, broader `prefers-reduced-motion` handling, and reasonable contrast overrides where helpful.
8. Normalize radii to a small token set for panels/cards.

## Acceptance criteria

- `Section` and `Footer` share width and gutter behavior.
- At least three new reusable utility classes exist.
- Tailwind theme mapping exposes semantic surface/border/grayscale colors.
- `npm run lint` and `npm run build` pass from `web/`.

## Forbidden

- No page copy edits.
- No route changes.
- No component prop or logic changes outside the spacing-only allowance above.
- No public asset changes.
