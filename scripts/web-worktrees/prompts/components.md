# Area

`web/components`

## Mission

Harden the component library, improve accessibility semantics, and remove obsolete component shims without changing the site's voice, token layer, or interaction logic.

## Owned files

- `web/components/ui/*`
- `web/components/docs/*`
- `web/components/visualization/*`
- `web/components/layout/Navbar.tsx` for structure/ARIA only
- `web/components/marketing/*` for structure and props only, excluding interaction logic in `TryPlanner`
- Delete the legacy root shims in `web/components/*.tsx`

## Concrete tasks

1. `Button.tsx`: add disabled styling and `aria-busy` support.
2. `Card.tsx`: allow semantic wrappers via an `as` prop or equivalent lightweight pattern.
3. `Navbar.tsx`: add `aria-current="page"` to the active nav item and `aria-expanded` to the mobile menu trigger. Do not finalize the tagline text; use `[COPY TBD]` if needed.
4. `FeatureCard.tsx`: improve link semantics and avoid empty alt text for meaningful images.
5. `ProductPreview.tsx`: accept an optional scenario input so it can be reused outside the homepage.
6. `CodeBlock.tsx`: add copy feedback that is announced to screen readers and give the block a labeled region.
7. `PlanMetrics.tsx`: use semantic `<dl>` markup.
8. `ScheduleTimeline.tsx`: add an accessible summary label.
9. `RoutePlanList.tsx`: use an ordered list for stops.
10. `StaffingGrid.tsx`: add table/grid semantics.
11. Delete the root-level re-export shims once you confirm app imports already point at canonical subfolders.
12. Do not implement the focus trap in `Modal.tsx`; leave behavior to the interactions branch.

## Acceptance criteria

- No legacy `web/components/*.tsx` shims remain.
- Imports resolve to canonical subfolder paths.
- Visualization and docs primitives have materially better semantics.
- `npm run lint` and `npm run build` pass from `web/`.

## Forbidden

- No copy rewrites except placeholders like `[COPY TBD]`.
- No CSS token changes.
- No `TryPlanner` or form behavior changes.
- No route/layout restructuring.
