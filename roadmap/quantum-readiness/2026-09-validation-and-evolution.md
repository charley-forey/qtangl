# Qtangl validation and evolution — September 2026

## Outcome

Help teams locate quantum-vulnerable cryptography, prioritize migration work, and show what changed with independently verifiable signed evidence. Qtangl is an inventory aid, not a formal audit. Signature verification establishes integrity and signing, not complete estate coverage. Quantum-vulnerable algorithms are not broken today.

Success means a user can follow **authorized baseline → explainable findings → owned remediation → verified rescan → signed evidence**, with reliable failure handling and a clear scope at every step.

## Execution state

| ID | Owner | Dependencies | Deliverable / acceptance | Status |
|---|---|---|---|---|
| V1 | Root | None | Run backend, SDK, web unit, lint/build, content and browser gates; preserve actual results and limits | Running |
| V2 | Backend agent | Audit | Fix expired snoozes, assignment display, tile persistence, scenario assumptions; regression tests | Complete |
| V3 | Root + graph agent | Audit | Correct approved action, visible errors, metric labels, graph rendering; browser regression evidence | Running |
| V4 | Root | V1–V3 | Prioritized strategy and validation record, integrated changes | Running |
| V5 | Root | Passing relevant release gates | Publish to GitHub main; inspect Vercel and Railway deployment and smoke results | Ready after dependencies |

## Evidence found

- Full backend collection aborted because `test_report_coherence.py` executed `unittest.main()` during import. Guard added; broader suite restarted.
- The SDK must be installed or on PYTHONPATH for backend SDK tests; existing CI excludes those modules.
- Initial web unit baseline: 21 passing, document-export suite cannot resolve the application path alias. Several other tests duplicate implementation instead of importing it.
- Initial lint: 6 errors and 144 warnings. These are baseline findings, not a passing release gate.
- Command Center approval submits a hardcoded action instead of the previewed action; several mutations discard errors or outcomes.
- Graph loading prevents mounting the SVG needed to finish loading when reduced motion is off.
- Snooze expiry is ignored; marketplace defaults override saved uninstall choices; displayed scenario bands use fixed illustrative offsets.
- Global lens state is stored in context and URL, but the audit found no data filtering consumer. Scheduled briefing settings have no scheduled consumer found in the inspected code. Treat these as incomplete until an end-to-end test proves them.

## Verified results and production repair

- Final backend run: **475 passed, 2 skipped**; includes the legacy database upgrade repair and scheduling authorization/quota checks.
- Clean CI at `436f6fd`: **487 passed, 2 skipped**, followed by successful OpenAPI sync and SDK dogfood checks. This includes the authenticated callback changes and regenerated dependency locks.
- Web unit checks: **24 passed**, importing actual production code, including HTTP 204 deletion and failed-request handling.
- SDK checks: Python **3 passed**, TypeScript **6 passed**, React **2 passed**. Removed both SDKs' unnecessary dependency on the web application; refreshed all affected locks.
- Lint error gate passed after six baseline errors were fixed. Existing non-blocking warnings remain.
- README links, marketing alignment and trust-copy gates passed; README stats refreshed.
- Production incident: PostgreSQL exhausted its 500 MB volume and crash-looped. Expanded only that volume to 1000 MB within the existing Hobby plan. Recovery completed and public `/health/ready` returned HTTP 200 with database and Redis healthy. No data was deleted, no credentials changed, and no plan upgraded. Usage after recovery was approximately 529 MB. Railway operation: `860f24d1-6f50-46ff-8bcf-9cd1962a4b57`; database deployment: `875cb9bc-e1e7-41ba-a66a-080f13ebb952`.
- Vercel preview for commit `1c5d3e2` built successfully. A clean local install and the 24 real-module unit checks also completed. Production publication and browser regressions remain release gates.
- Clean CI exposed SDK generation using a Windows-only subprocess command, missing PDF dependencies in the lockfile, and 73 missing API reference entries. These repairs now pass their CI gates.
- Regenerated backend locks with four security upgrades passed `pip-audit` with no known vulnerabilities and 45 focused compatibility tests, including portfolio PDF merging.
- Frontend lock audit now reports zero vulnerabilities after patched Next.js 16.3.4, sharp 0.35.4 and compatible transitive updates. AuthKit resolved to 2.17.0 within its existing range; fresh build/auth browser checks remain required. No forced upgrades or overrides were used.
- Slack, Teams and Jira custom JSON callbacks now require operator/admin authentication and enforce tenant identity; 23 security regressions pass. Native provider signature/JWT verification is not implemented: callers must use an authenticated relay.
- API catalog coverage now passes for 307 backend route declarations (304 documented unique entries plus three internal exclusions). Added 73 missing references with canonical schema links, authenticated relay limitations, and no invented example responses.
- Local browser run: graph, briefing and recommendations passed; ten other cases failed during startup/loading or with a non-application response, `This human wandered off.` A direct HTTP request reproduced that response. Desktop/mobile accessibility and full dashboard behavior therefore remain unverified pending clean CI execution; do not count this run as a passing browser gate.

Operational follow-up: track volume utilization and growth, test backup/restore, and define capacity alerts before the next exhaustion event. Healthy database connectivity does not itself verify worker/scheduler execution. Inspect the existing leading-space ` QTANGL_ENV` variable and migrate it to the intended configuration after validating production requirements.

Worker logs establish that scheduling resumed after recovery: seven scans queued at 04:22:32 UTC and a scan completed at 04:23:49 UTC on September 10. Email delivery repeatedly timed out; delivery is not verified. The API cannot see the worker's process-local heartbeat, so shared heartbeat visibility is being repaired. Sensor Windows CI confirmed an undefined Linux-only function; a non-Linux stub and isolated Linux tests are ready for cross-platform CI. Removed a placeholder workflow step that merely echoed signing commands and falsely stated a transparency entry existed; signed sensor release artifacts still need a real release/signing workflow.

Sensor CI at `82aa97d` passed Linux, Windows and macOS amd64 builds and Linux unit tests. Shared heartbeat unit checks pass (13 tests); the real Redis check is opt-in and wired to an isolated CI service. Corrected the dashboard's Unix-seconds conversion for heartbeat dates. Public pages were forced into client-only rendering by the global session provider; a local Suspense boundary and no-JavaScript regression checks address that issue. CI browser checks now use the production build. Assessment integration previously had neither a local API process nor the browser API URL/key configured; CI now starts a local backend with live scans disabled and a dedicated fixture key.

## Prioritized roadmap

| Horizon | Deliverable | Proposed acceptance gate |
|---|---|---|
| First 30 days | Trustworthy core journey, activation instrumentation, three guided pilot evaluations | All critical journey tests pass; failed actions remain visible and retryable; every score identifies source/scope/as-of; establish observed activation and scan-success baselines |
| Days 31–60 | Integration-backed remediation closure, working scope filters, inventory freshness, scheduled delivery | Assigned task survives reload; rescan confirms finding state; filters constrain every relevant query; scheduled delivery has retries and observable outcomes |
| Days 61–90 | Repeatable onboarding and board reporting, measured customer outcomes | Compare pilot baseline with time to first evidence, time to verified remediation, repeat use and delivery reliability; expand only capabilities used successfully by pilots |

These are proposed targets and sequencing, not promises of dates or achieved results. Reuse existing engineering and product tracks in this directory; do not add another speculative platform layer.

### Scope filtering acceptance

The next complete filtering increment must select original scan/asset records before computing metrics. Business units should use portfolio target assignments with exact normalized host matching; framework selection should use canonical asset `standardsRefs`. Runtime deployment environment is not a customer asset environment and must not be used as one. Do not filter capped display summaries or alter signed reports.

Use the same resolved scope for summary, tab bundles, graph and next actions. Include scope in client cache keys and ignore stale responses. Unmapped action sources need an explicit unscoped state, not an invented assignment. Verify sibling domains, two business units, unassigned targets, framework intersection, repeated scans, no matches, back/reset navigation, tenant isolation and slow previous requests. A no-match scope must show unavailable metrics and empty results consistently.

## Experience and data standards

- Lead with a plain-language outcome and one primary next action. Keep sample, live demo and customer inventory clearly distinguished.
- Show missing data as unavailable, not zero. Expose collection scope, evidence age and limitations next to metrics.
- Distinguish observations from scenarios. Fixed scenario ranges are illustrative sensitivity ranges, not statistical confidence intervals or a Q-Day prediction.
- Charts need a text equivalent, visible units, readable labels, keyboard access and non-color status cues. Test empty, single-point, normal, error and large-data states at mobile and desktop widths.
- Approval must display and execute the same action and payload, suppress duplicate submissions, and show the actual returned outcome.
- Measure activation, successful scan completion, export verification, verified remediation closure and monitor reliability. These complement the business metrics in [10-metrics-and-risks.md](./10-metrics-and-risks.md).

## Validation and release method

Run fixture scans in tests; never widen live-scan authorization to make a demo pass. Cover tenant authorization, SSRF, signing/tamper rejection, exports, quotas, retries, scheduler persistence and SDK contracts. Combine existing automated suites with browser checks of the actual user journey. Mocked browser tests prove UI contracts; they do not prove production integrations.

Before release, inspect the final diff, generated OpenAPI/SDK sync, relevant tests, production build and dependency gates. Publish through the existing GitHub/Vercel/Railway setup and confirm the deployed revision, health and a safe smoke journey. Record unavailable services and failed checks explicitly; a successful build alone is not end-to-end validation.

External guidance: [NIST explains the uncertain timing of the quantum threat and why migration planning matters now](https://www.nist.gov/cybersecurity-and-privacy/what-post-quantum-cryptography). [W3C guidance for complex images](https://www.w3.org/WAI/tutorials/images/complex/) supports providing textual information for charts rather than relying only on their appearance.

## Latest release check — db83c74

Backend CI: **499 passed, 3 skipped**, plus **1 real Redis integration test passed**. SDK, security, CodeQL, content, sensor and Lighthouse jobs passed. Vercel preview built; the API reference now contains its heading and body in the initial HTML.

Browser checks exercised all groups: all **14 authenticated dashboard tests passed**, including graph rendering, action outcomes and scheduler dates. Assessment integration completed **33 passing tests, 2 failures and 1 flaky test**, including an actual fixture scan and PDF download. Mobile responsive checks passed (12 tests). Remaining failures identified a journey page unavailable without JavaScript, keyboard-inaccessible horizontally scrolling tables, stale role/navigation assertions and ambiguous assessment links. These are being repaired; main publication remains gated on the next complete run.

CI now keeps one production web server alive across browser groups and preserves server diagnostics. Repeated server shutdowns coincided with a Next.js image-cache error; verify the error is absent in retained logs. The optional runtime-only R4 flag step was a duplicate landing check and did not exercise compiled flags, so it was removed. Enabled-flag coverage requires a separately built variant and remains outstanding.

At `109f0ad`, all non-web jobs and the Vercel preview passed. Production browser groups passed: access/public rendering 18, assessment 36, HNDL 11, mobile responsive 12, mobile accessibility 9, authenticated dashboard 14, role gating 3, portfolio 1, discovery 6, fleet 1, remediation docs 1, trust 3, demo CTAs 6 and PQC smoke 1. The dashboard smoke group passed 2 tests and failed 1 ambiguous link selector; both matching links correctly pointed to sign-in. Scoped that assertion to main content. Retained server logs no longer contain the image-cache LRU errors; one early-closed response stream was logged during browser navigation.

Public headings on Convert, Platform, Journey and the API reference pass with JavaScript disabled and no transparent ancestor. The shared calculator and assessment role picker now have local loading boundaries. Other animated sections still depend on JavaScript for reveal; broader progressive enhancement remains a follow-up.

## Production release — 6cc7357 (September 10)

PR #42 merged after final CI at `691b9c4`: all **125 browser tests passed**, backend **499 passed, 3 skipped**, and the isolated Redis integration passed. SDK, security, sensor and Lighthouse checks passed. Vercel production and Railway API/worker deployed main `6cc73572625f492779e362dba97026bb23d84d4d` successfully. Public readiness confirmed database and Redis connectivity plus a fresh shared scheduler heartbeat. Existing demo report signature verification remained valid. The public Convert page rendered its heading, navigation and simulator controls in a production browser smoke inspection.

Next increment, owned by the root agent on `codex/demo-data-coherence`: correct demo resource-to-finding matching after fixture IDs are rewritten; exclude disabled uploads; show unavailable resource/business-unit readiness rather than repeating the whole-report score. Regression tests cover endpoint kind, normalized host, exact IDs, ambiguity, missing findings, disabled resources and unchanged report data. Local demo regression suite: **8 passed**, including the actual fixture pipeline and chronological in-memory history (one existing Starlette/httpx deprecation warning). These changes are not yet published; full integration and release checks remain. Scope filters, delivery reliability and the remaining roadmap acceptance criteria remain outstanding.

PR #43 at `17167df` contains that increment plus explicit full-report chart labels. Full local backend validation: **504 passed, 3 skipped**. CI run `34460515001` passed all checks, including **125 browser tests** and Lighthouse. PR #43 merged as `a31b42c86580f646cb1155b0c52fc5abb76cc16c`. Railway API and worker deployments succeeded; public readiness confirms database, Redis and a fresh scheduler heartbeat. Demo portfolio returns null unit scores while retaining overall82.8; existing demo signature remains valid. Vercel production is READY at the same commit. Live browser smoke shows full-report labels, explicit unavailable unit scores and populated resource findings. Browser logs caught an unhandled SSE refresh fetch failure after data loaded, plus an initial chart-dimension warning; refresh handling is included in the next increment and the chart warning remains to inspect.

Root follow-up on `codex/portfolio-current-readiness`: portfolio scores used substring domain matching and averaged historical scans. The correction uses exact normalized targets, the latest completed report per target, and the immediately preceding report for deltas; missing scores stay unavailable. Overall readiness weights each scored target equally within the existing 50-job lookback. Targeted portfolio/dashboard/demo tests: **27 passed**. Frontend null handling and full release validation remain pending.

Filter implementation dependency audit: URL filters reach summary requests, but the API ignores them; tab and QROS requests omit them. Tab caches omit tenant and filter identity. Summary, tab and manual QROS reloads need stale-response guards. Scan events and several refresh callbacks discard the active scope. Implement a shared committed scope, filter original records before aggregation, include tenant/scope in cache identity, preserve scope on refresh, and label workspace-wide or full-scan views explicitly. Acceptance includes delayed A→B responses, tenant switching, no-match results, reset/back navigation and consistent charts/exports. Root owns API selection; frontend audit completed read-only by `docs_finish`.

Portfolio follow-up validation: local full backend baseline **507 passed, 3 skipped**; independent review found malformed saved URLs could raise during normalization and digest calculations could contradict overall readiness after truncating to25 targets. Both were fixed; the final focused portfolio suite passed **7 tests**. Frontend null/scope/legend/error-recovery checks passed with current dependencies; full lint passed with existing warnings. Production build and combined release CI remain pending. Demo refresh generation checks are being completed by `docs_finish` so superseded requests cannot replace newer data or errors.

Briefing workflow audit: `/qros/push-briefing` saves cadence/enabled settings, but no worker reads `pushBriefing`; only the explicit send endpoint calls delivery. Delivery can fall back from requested Slack/briefing destinations to all active tenant webhooks. Implement scheduled consumption and strict channel/event routing with mocked delivery tests before claiming this workflow complete. No outbound test messages were sent.

Detailed briefing prerequisites: delivery returns `sent` but the briefing caller checks `ok`; Slack formatting currently discards briefing content. Email/Teams are advertised without explicit recipient/channel routing. Reuse the worker notification tick, tenant settings and webhook retries/DLQ. Add bounded cadence, enabled state, explicit recipients/subscriptions and persisted due/delivery outcomes; claim each due destination atomically. Do not automatically repeat an interrupted delivery with an unknown outcome. Validate channel isolation, content, concurrent claims, disabled/before-due behavior, partial failures and tenant-scoped replay using mocks. Existing weekly digest idempotency also needs review before reuse.

PR #44 final browser regression passed locally against the production build and is integrated in the existing CI demo suite. CI at `a39ae25` caught a TypeScript assertion error in that new test's injected event-source helper; a runtime-checked lookup and full typecheck are in progress. This is a release gate; no merge or deployment of PR #44 has occurred.


## Current work — September 10, 10:20 UTC

PR #44 is awaiting CI at `cdba287`. The previous run passed the production build, Lighthouse and backend/security/SDK checks; its remaining failure was an ambiguous mini-assessment result-label assertion. The corrected full demo group passed **7 browser tests** locally, with ancillary lead capture stubbed to avoid external submissions. The new live-status regression also passed in CI. Nothing from PR #44 is published to production yet.

The root's separate `codex/briefing-delivery-integrity` branch implements strict channel routing, explicit validated recipients, accurate manual delivery outcomes, configuration loading/disable, and durable scheduled attempts using the existing worker and schedule run table. A configuration revision and cadence slot identify each attempt. The worker commits its claim before delivery and never automatically repeats an uncertain attempt; missed periods do not cause a catch-up burst. Generic webhook payloads include a stable delivery ID. Transport retries still cannot guarantee exactly-once receipt.

Scheduling requires persistent storage and a healthy worker when enabled. Existing legacy preferences do not silently activate delivery; users must save an explicit schedule. Identical preferences preserve the cadence anchor, while changed or re-enabled preferences start a new cadence. A disable stops work that has not started delivery; in-flight requests cannot be recalled. The whole briefing is claimed together, so selective automatic retry of individual destinations is deferred; existing webhook dead letters remain available. This supersedes the earlier per-destination claim proposal with a smaller implementation that prevents successful destinations being replayed by later worker ticks.

Validation so far: **30 QROS/webhook tests passed**, and **25 scheduler/webhook/worker tests passed**, including concurrent claims, encrypted settings preservation, partial outcomes and crash behavior. Full backend validation, generated contracts, UI integration and release checks are in progress. All delivery tests use mocks. SQLite verifies unique claims locally; PostgreSQL locking still requires integration evidence. Scope filters and the remaining roadmap items remain outstanding.


PR #44 passed every final check at `cdba287` and merged to main as `0cade970e36f2df3a7c7a94384a7daa22d5f19c7` at 10:25 UTC. Railway API deployment succeeded; Vercel production verification is pending. Briefing local full backend suite passed **545 tests, 3 skipped** (including SDK tests) in 349 seconds. The first collection attempt lacked the local SDK import path; rerunning with that path resolved collection. Independent review caught malformed email domains escaping validation and an unrelated settings write potentially restoring a disabled schedule; both fixes are included. Temporary PostgreSQL CI tests now exercise real concurrent settings updates and same-slot claims; local Docker is unavailable, so those two checks await CI. The latest focused suite and frontend handoff remain in progress.


Production verification for `0cade97`: Vercel deployment `dpl_76uMtCwiMq1NVuvsDEBqvg6BgZns` is READY; Railway API `a20ad75c-e246-4fd7-b455-26732b0e7af8` and worker `4453c104-a36b-4d6d-b1e2-06f8a36b34ff` succeeded at the same revision. Public readiness reports healthy database, Redis and scheduler heartbeat. Browser smoke confirms visible severity counts (19 total), unavailable unit readiness, full-report scope labels and successful signed-snapshot verification. An intermittent refresh failure retained the last data and displayed a recoverable alert; a subsequent refresh cleared it. No uncaught error was logged; the known initial chart-dimension warning remains.

Briefing integration: latest focused tests passed **45, with 2 PostgreSQL checks skipped locally**. UI production build, full TypeScript, lint and mocked Chromium workflow passed. Review additionally identified that blank recipients prevented saving delivery off; a small UI correction and regression are being finalized. The new PostgreSQL service is restricted to isolated CI tests, with no production database access.


PR #45 opened at `571feac` for briefing delivery. CI backend passed **534 tests, 5 skipped**, plus **1 real Redis check and 2 isolated PostgreSQL concurrency checks**. Both PostgreSQL tests also passed locally against a temporary PostgreSQL 18 database; the temporary server has been stopped. The first web/README CI gates found the new GET route absent from the endpoint catalog and a stale generated README test count. Both documentation corrections are prepared. The disabled-save UI correction passed its browser regression; full authenticated-dashboard coverage is being checked before the next CI run. No production deployment of PR #45 has occurred.


The complete authenticated-dashboard browser group passed **15 tests** against the production build. A shared mocked preferences response was subsequently corrected to the new GET contract; integrated CI will validate that fixture. README stats/link gates and integrated endpoint coverage/orphan/status gates all pass. Final PR #45 rerun is the next release gate; broader dashboard scope filtering remains the next product increment.
