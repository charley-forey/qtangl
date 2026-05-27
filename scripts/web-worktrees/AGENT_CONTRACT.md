# Web Worktree Agent Contract

All agents work inside an isolated Git worktree rooted at the qtangl repository.

## Scope rules

- Only edit files in your ownership list.
- If you are blocked by another worktree's file, add `WORKTREE-TODO(web/<other>): <reason>` in the closest relevant file and skip the blocked change.
- Do not touch `backend/`, root configs, or another agent's owned files.
- Match the existing stack and conventions: Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Framer Motion only where already used.
- Do not introduce a new UI library.
- Keep copy outcome-first. Quantum jargon belongs on `/technology` and `/docs/concepts`, not in the primary funnel.

## Definition of done

1. Complete the owned tasks or leave a `WORKTREE-TODO(...)` marker for anything blocked.
2. Run `npm run lint` from `web/`.
3. Run `npm run build` from `web/`.
4. Commit only your branch changes with a message in the form `web(<area>): <summary>`.
5. Do not merge into `main`.

## Cross-agent coordination

- Need a CSS utility or token: mark `WORKTREE-TODO(web/styling): ...`
- Need a component prop or reusable primitive: mark `WORKTREE-TODO(web/components): ...`
- Need final copy in a non-copy file: use `[COPY TBD]` and mark `WORKTREE-TODO(web/copy): ...`
- Need dialog behavior, form states, or focus handling: mark `WORKTREE-TODO(web/interactions): ...`
- Need route or shell restructuring: mark `WORKTREE-TODO(web/ux-structure): ...`
- Need asset or OG polish: mark `WORKTREE-TODO(web/design): ...`

## Guardrails

- Keep diffs focused. Avoid unrelated cleanup.
- Prefer existing abstractions and file organization over new wrappers.
- Only add comments when the logic would otherwise be hard to follow.
- If you discover unexpected unrelated changes, stop and report them instead of overwriting them.
