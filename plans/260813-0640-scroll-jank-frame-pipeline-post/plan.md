---
title: "Mobile Performance #2: Scroll Jank & the Frame Pipeline post"
description: "Research, measure, and publish series post #2: 'I Made Messages Load Fast. So Why Does Scrolling Still Stutter?'"
status: done
priority: P2
branch: "main"
tags: [content, mobile-performance, blog-post]
blockedBy: []
blocks: []
created: "2026-08-12T23:54:39.142Z"
createdBy: "ck:plan"
source: skill
---

# Mobile Performance #2: Scroll Jank & the Frame Pipeline post

## Overview

Publish English post **"I Made Messages Load Fast. So Why Does Scrolling Still Stutter?"** — `series: mobile-performance`, `seriesOrder: 2`, `articleType: deep-dive`. Design approved in brainstorm; all sources verified.

- Brainstorm (approved design, decisions, risks): `plans/reports/brainstorm-260813-0640-scroll-jank-frame-pipeline-report.md`
- Source verification (11 primary sources, verbatim quotes + URLs): `plans/reports/researcher-260813-0640-frame-pipeline-source-verification-report.md`
- Spine: user's 11-section Vietnamese outline (in brainstorm report) → English. Three approved edits: (1) bridge from opener's jank-near-tie result, (2) §9 upgraded to first-party evidence (Telegram source, LightSpeed, Litho), (3) §10 condensed to rendering-architecture diff + link to opener.
- Measurement: extend existing `github.com/hkngoc/mobile-perf-ab-demo` with a chat scenario (naive vs disciplined), measured on OPPO Reno14 5G (90Hz → 11.1ms budget). **User-in-loop: physical device required.**

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Citation Map & Content Skeleton](./phase-01-citation-map-content-skeleton.md) | ✅ Done (2026-08-13) |
| 2 | [Chat Scenario Artifact & Measurement](./phase-02-chat-scenario-artifact-measurement.md) | ✅ Done (2026-08-13, repo pushed 7fd5384) |
| 3 | [Write the Post](./phase-03-write-the-post.md) | ✅ Done (2026-08-13) |
| 4 | [Review Build & Publish Prep](./phase-04-review-build-publish-prep.md) | ✅ Done (2026-08-13; push/deploy awaiting user go-ahead) |

Dependencies: 2 blocks 3 (post embeds measured numbers); 1 can run parallel with 2; 4 last.

## Acceptance Criteria

- Every numeric claim: first-party link (from verification report) or own measurement.
- ≥1 original results table + 1-2 frame-chart screenshots from chat scenario.
- §10 ≤ 4 paragraphs + link to opener post.
- Post stands alone; rewards readers of opener (`is-the-framework-really-why-your-app-is-slow.md`).
- `pnpm run build:ci` passes (rehype-mermaid needs Chromium).

## Dependencies

None cross-plan (plans/ contains only reports).

## Validation Log

### Session 1 — 2026-08-13

### Verification Results
- Claims checked: 9 (file paths, schema enum, scripts, repo conventions, external repo clone)
- Verified: 7 | Failed: 1 | Unverified: 0 (resolved: 1)
- Tier: Standard (Fact Checker + Contract Verifier)
- Failures: phase-02 named `public/assets/` for screenshots — directory does not exist; repo convention is `src/assets/images/` (public/ holds only favicon/og/pagefind). Corrected per user decision.
- Resolved unknown: `mobile-perf-ab-demo` local clone found at `/Users/vandai/Documents/mobile-perf-ab-demo` (was "ask user").

### Decisions (interview, 4 questions)
1. **Repo path:** use existing clone `/Users/vandai/Documents/mobile-perf-ab-demo`; pull latest before edits.
2. **Escalation policy:** if naive chat scenario near-ties, escalate within realistic bounds (real E2EE decrypt, link previews, multi-year corpus sizes) and disclose in-article — same pattern as opener.
3. **articleType:** `deep-dive` confirmed. Opener's "case study" promise maps to post #3 (full real-app profiling), not this post.
4. **Screenshots:** `src/assets/images/`, kebab-case names, imported via Astro image pipeline.

### Whole-Plan Consistency Sweep
- Swept plan.md + all 4 phase files after propagation. Fixed: phase-02 repo path + screenshot dir; phase-03 image placement note. No stale terms, no contradictory thresholds (11.1ms/16.7ms handling consistent), no duplicate embedded contracts. Unresolved contradictions: none.
