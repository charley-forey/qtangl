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
- Clean CI exposed SDK generation using a Windows-only subprocess command, missing PDF dependencies in the lockfile, and 73 missing API reference entries. These are being repaired before another release run.
- Regenerated backend locks with four security upgrades passed `pip-audit` with no known vulnerabilities and 45 focused compatibility tests, including portfolio PDF merging.
- Frontend lock audit now reports zero vulnerabilities after patched Next.js 16.3.4, sharp 0.35.4 and compatible transitive updates. AuthKit resolved to 2.17.0 within its existing range; fresh build/auth browser checks remain required. No forced upgrades or overrides were used.
- Slack, Teams and Jira custom JSON callbacks now require operator/admin authentication and enforce tenant identity; 23 security regressions pass. Native provider signature/JWT verification is not implemented: callers must use an authenticated relay.
- API catalog coverage now passes for 307 backend route declarations (304 documented unique entries plus three internal exclusions). Added 73 missing references with canonical schema links, authenticated relay limitations, and no invented example responses.
- Local browser run: graph, briefing and recommendations passed; ten other cases failed during startup/loading or with a non-application response, `This human wandered off.` A direct HTTP request reproduced that response. Desktop/mobile accessibility and full dashboard behavior therefore remain unverified pending clean CI execution; do not count this run as a passing browser gate.

Operational follow-up: track volume utilization and growth, test backup/restore, and define capacity alerts before the next exhaustion event. Healthy database connectivity does not itself verify worker/scheduler execution. Inspect the existing leading-space ` QTANGL_ENV` variable and migrate it to the intended configuration after validating production requirements.

Worker logs establish that scheduling resumed after recovery: seven scans queued at 04:22:32 UTC and a scan completed at 04:23:49 UTC on September 10. Email delivery repeatedly timed out; delivery is not verified. The API cannot see the worker's process-local heartbeat, so shared heartbeat visibility is being repaired. Sensor Windows CI confirmed an undefined Linux-only function; a non-Linux stub and isolated Linux tests are ready for cross-platform CI. Removed a placeholder workflow step that merely echoed signing commands and falsely stated a transparency entry existed; signed sensor release artifacts still need a real release/signing workflow.

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
