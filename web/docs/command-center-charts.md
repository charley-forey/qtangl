# Command Center chart design language

Shared tokens live in `web/lib/chart-theme.ts`.

## Primitives
- `ChartEmptyState` / `ChartLoadingState` / `ChartErrorBoundary` in `charts/ChartStates.tsx`
- `ChartTooltip` for Recharts surfaces
- `DependencyGraph` for d3-force layouts (virtualized node cap: 500)

## Motion
- Respect `prefers-reduced-motion`: disable force simulation tick animation when set.
- Recharts `isAnimationActive={false}` on band overlays; short transitions elsewhere.

## Accessibility
- Graph nodes: `role="button"`, keyboard Enter/Space activates drill-down.
- Charts: `role="img"` + `aria-label` summary on container; progress bars use `role="progressbar"`.

## Honesty copy
- All risk windows framed as exposure quantification, not Q-Day prediction.
- Empty states must not imply zero risk — use "no data" framing.
