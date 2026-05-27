# Area

`web/copy`

## Mission

Align the site's language to outcome-first messaging, centralize fragmented copy sources, and keep quantum-heavy language out of the primary funnel.

## Owned files

- `web/lib/copy/*`
- `web/lib/constants.ts` and any split-out copy modules
- Metadata exports in `web/app/**/page.tsx`
- Prose content in `web/app/blog/*` and `web/app/docs/*`
- Copy strings in `AccessRequestForm`, `Navbar`, `ArticleLayout`, `EntanglementField`
- Error message strings in `web/app/access/actions.ts`

## Concrete tasks

1. Add `web/lib/copy/access.ts` for form headings, hints, and success/error messaging.
2. Add `web/lib/copy/nav.ts` for navbar/footer copy.
3. Split the large `web/lib/constants.ts` into smaller copy-oriented modules such as `marketing.ts` and `api-examples.ts`, while preserving imports through re-exports if needed.
4. Move hardcoded homepage marketing strings into `web/lib/copy/home.ts`.
5. Rename the `EntanglementField` labels into operational language such as “Input constraints”, “Feasible plans”, and “Ranked output”.
6. Replace the `ArticleLayout` “Signal / Method / Outcome” framing with clearer outcome-first language.
7. Improve access form/server-action error strings so they read like product copy, not internal validation messages.
8. Review page metadata so descriptions lead with user outcomes instead of feature jargon.
9. Add stronger closing CTA language to the blog posts that points readers toward `/try`.
10. Leave a concise comment or central note in the copy layer that quantum metaphor belongs only on `/technology`, `/docs/concepts`, and explicitly quantum-focused content.

## Acceptance criteria

- Homepage marketing copy is centralized in `web/lib/copy/*`.
- OG-related text in `product.ts` is suitable for design/OG reuse.
- `web/lib/constants.ts` is reduced to a small compatibility surface or otherwise clearly split.
- `npm run lint` and `npm run build` pass from `web/`.

## Forbidden

- No layout restructuring.
- No CSS changes.
- No interaction logic rewrites.
- No component API redesign.
