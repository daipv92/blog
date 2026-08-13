---
phase: 4
title: "Review Build & Publish Prep"
status: done # 2026-08-13; commit pending in this session, push/deploy on user go-ahead
priority: P2
dependencies: [3]
---

# Phase 4: Review Build & Publish Prep

## Overview

Fact-check pass, build verification, and publish prep (commit; deploy happens from `main` via hosted build).

## Requirements

- Functional: post builds and renders correctly (mermaid, images, series hub listing, breadcrumb JSON-LD).
- Non-functional: zero unverified claims survive review.

## Related Code Files

- Read: the new post, `src/data/series.ts`, series hub page output
- Modify: post file (review fixes only)

## Implementation Steps

1. Fact-check pass: every link resolves; every quote matches verification report verbatim; numbers match Phase 2 raw results; honest-framing notes intact (LightSpeed = rebuild story; no Telegram rendering blog; escalation disclosure if used).
2. Consistency: 90Hz/11.1ms vs 16.7ms handled explicitly wherever a threshold appears; §10 length ≤ 4 paragraphs.
3. `pnpm run build:ci` (Chromium required for rehype-mermaid — a build image without it silently produces empty post bodies; verify the built post HTML body is non-empty in `dist/`).
4. Verify series hub shows post as #2; check OG description; run repo lint/typecheck if configured.
5. Commit conventional format (e.g. `feat: publish mobile-performance post on scroll jank and the frame pipeline`), no AI references. Push only when user confirms publish.

## Success Criteria

- [x] Build passes; built post body non-empty (96KB; caught future-dated pubDatetime silently skipping HTML emit); mermaid rendered
- [x] All links + quotes verified (fact-check report `plans/reports/from-code-reviewer-to-cook-260813-0754-post-fact-check-report.md`; 1 HIGH fixed: raw logs force-added + pushed to demo repo fed1ef1; wording fixes applied: 7-8 loads/run, 36.5ms, Litho phrasing, fig-1 alt text)
- [x] Series hub ordering correct (#1 opener, #2 this post); eslint + prettier clean
- [ ] Commit created; push/deploy per user go-ahead

## Risk Assessment

- Silent empty-body failure (known Chromium/rehype-mermaid trap, documented in CLAUDE.md) → explicit dist/ body check in step 3.
