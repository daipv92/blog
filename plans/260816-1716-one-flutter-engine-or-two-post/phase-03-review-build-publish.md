---
phase: 3
title: Review Build & Publish
status: completed
effort: S
---

# Phase 3: Review Build & Publish

## Overview

Fact/style review pass (code-reviewer with the source quotes + fact rules), link check, `pubDatetime` set (past in UTC), full `pnpm build` with body verification, commit, push to main, post-deploy verification with the documented `wrangler deploy` fallback.

## Requirements

- Functional: build green incl. `scripts/verify-post-bodies.mjs`; mermaid renders light+dark (incl. the sequence diagram or its fallback); post listed under `/series/mobile-architecture/` as #5; post #4 footer points at #5.
- Non-functional: review findings fixed, not waived; no plan/audit labels in post or commit; no secrets/internal names beyond what #3/#4 already expose.

## Related Code Files

- Modify: `src/content/posts/one-flutter-engine-or-two-native-between-flutter-screens.md` (review fixes, `pubDatetime`)
- Modify: `src/content/posts/half-flutter-half-native-who-owns-navigation-mid-migration.md` (footer edit from Phase 2 — verify only)
- Optional: `src/data/series.ts` `plannedTitles` for `mobile-architecture` — only if author wants the hub to advertise the data-layer/benchmark posts.

## Implementation Steps

1. Review pass vs `plan.md` fact rules: every quoted string matches master (open the permalinks); every external claim has a URL; issue numbers ↔ titles/states; grep `\bms\b|MB` → only the "~180 kB" line; artifacts labeled current/option/condition; undecided section present; house-style checklist (TIP, ToC, readings after every diagram, FAQ, wrong-question close, footer, References).
2. Redaction check on code sketches: no real package/bundle ids, endpoints, team names beyond #3/#4.
3. Link check: all external URLs return 200 (script or curl loop as in #4 — 47/47 last time); GitHub permalinks resolve to the quoted lines.
4. Verify post #4 footer edit renders and its body still verifies (its digest changes → `--force` build re-renders it).
5. Set `pubDatetime` to actual publish time **in UTC, in the past** (theme `postFilter` silently drops future posts; local tz +7).
6. `pnpm build` (`playwright install chromium` → `astro check` → `astro build --force` → `verify-post-bodies` → pagefind). If verify lists one body fewer than expected → check `pubDatetime`. If mermaid fails → `npx playwright install chromium`.
7. Check built HTML: post has the expected number of `<svg>` (diagrams × 2 themes), series hub lists #1–#5 in order, #4 footer link present.
8. Commit content + plan artifacts, conventional format, no AI references (e.g. `feat: publish mobile-architecture post on one flutter engine or two`); push to main.
9. Post-deploy: after ~2 min fetch production URL; if 404/stale after ~4–6 min (hosted Cloudflare build stalled on 08-15 and 08-16) → `npx wrangler deploy` of the local build output; verify 200, non-empty body, `<svg>` count, series hub, #4 footer.

## Success Criteria

- [x] Review findings fixed (code-reviewer report `web/plans/reports/code-review-260816-1716-one-flutter-engine-or-two-post-report.md`: 5 major — wrong "~180kB" source → Flutter 2.0 blog; "A shows B's last frame" overclaim removed (each VC owns its FlutterView); Kotlin `close()` fixed (`FlutterEngineCache.remove` returns void); issue states re-checked with `gh` 2026-08-16 (#122364/#79335/#165372/#78590/#148662 fixed, #159718/#77621/#72033/#115533/#144499 open) → state column added, #162074 dropped; description 159 chars — plus minors: back-press count consistency, `// …` elisions in Boost excerpts, `co[st]` sic, line ranges, category not swizzle, "threads" dropped, mermaid line breaks, tags 5). All 45 external URLs 200. Post #4 also got a one-clause honesty fix ("engine-lifecycle bug history … both since fixed") — author approved.
- [x] `pnpm build` green twice incl. verify-post-bodies (10 bodies); 5 `svg[id^=mermaid]` in the built post; `sequenceDiagram` not used (dark-mode CSS covers flowcharts only) — timelines are `flowchart TB`.
- [x] Post visible under `/series/mobile-architecture/` as #5 (built HTML); #4 footer links to it, data-layer sentence kept; anchor `#reveal-2-the-contract-doesnt-say-who-holds-the-stack` confirmed.
- [x] Commit `340afa2` pushed to main 2026-08-16 ~11:17Z. Hosted Cloudflare build stalled again (404 at +19 min, third time in a row) → fallback `npx wrangler deploy` of the locally built dist (version `61465bad`); production verified: 200, 231 KB, 5 mermaid `<svg>`, TIP callout, series hub lists #5, #4 footer links to it.

## Risk Assessment

- Push = production deploy → local build + verify green first.
- `sequenceDiagram` may render differently in dark mode → check both themes in built HTML; fallback per Phase 1.
- Hosted build stall → fallback documented; note outcome in this file.
