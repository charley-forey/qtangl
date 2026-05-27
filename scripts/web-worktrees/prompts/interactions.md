# Area

`web/interactions`

## Mission

Make the demo and navigation feel responsive and accessible: fix the TryPlanner no-op behavior, harden the mobile modal, and improve form feedback without rewriting marketing copy or the token layer.

## Owned files

- `web/components/marketing/TryPlanner.tsx`
- `web/components/marketing/AccessRequestForm.tsx`
- `web/components/ui/Modal.tsx`
- `web/app/access/actions.ts` for validation/result shape only
- `web/app/try/page.tsx` for wiring only
- `web/components/quantum/*` for motion/reduced-motion behavior only

## Concrete tasks

1. In `TryPlanner.tsx`, hide the plan by default until Generate is clicked.
2. Add an `isGenerating` state with a short simulated delay so the interaction feels intentional.
3. Reset the shown plan when users change scenario inputs until they generate again.
4. Make the scenario chooser use tab semantics and associate labels with form fields.
5. Provide an explicit empty/pre-generate state.
6. Improve `Modal.tsx` with dialog semantics, focus management, Escape handling, and body scroll locking.
7. Add screen-reader-friendly status announcements and field-level errors to `AccessRequestForm.tsx`.
8. Disable the form or show a clear confirmation panel after success.
9. Return structured `fieldErrors` from `app/access/actions.ts`.
10. Verify the reduced-motion path of the quantum visuals remains safe and stable.

## Acceptance criteria

- The Try page does not show a plan until Generate is pressed.
- The modal traps focus and closes on Escape.
- Form status is announced accessibly and field errors are visible.
- `npm run lint` and `npm run build` pass from `web/`.

## Forbidden

- No final marketing copy rewrites.
- No CSS token edits.
- No route/nav restructuring.
- No broad component cleanup outside this interaction scope.
