# Mobile Performance Post #2 Implementation Session

**Date**: 2026-08-13
**Severity**: Routine
**Component**: Blog content — mobile-performance series post #2 + mobile-perf-ab-demo chat scenario
**Status**: Complete; commit ready, push/deploy awaiting user go-ahead

## What Happened

Executed all 4 phases of `plans/260813-0640-scroll-jank-frame-pipeline-post/`: citation skeleton, chat-scenario measurement artifact, post writing, and review/build. Post file: `src/content/posts/i-made-messages-load-fast-so-why-does-scrolling-still-stutter.md` (deep-dive, seriesOrder 2).

**Artifact** (`mobile-perf-ab-demo`, commits f01092c + 7fd5384 + fed1ef1, pushed): chat scenario with per-message AES-256-CBC encrypted corpus (24 pages × 50 messages, ~30% carrying 8KB link-preview thumbnails), naive/disciplined entrypoints forking only at the load-older path, chatnaive/chatdisciplined flavors, chat fling script.

**Results** (OPPO Reno14 5G, measured ~91Hz, 10 runs/variant, alternating A/B): naive blocked the UI thread 36.5ms median per load → 6.3% janky frames, worst frame 58.5ms median; disciplined ran identical work via `compute()` → 0.0% jank, zero missed intervals in all 10 runs. No workload escalation needed — the opener's scroll near-tie plus this decisive gap is the series' narrative arc working as designed.

## Technical Traps Hit (worth remembering)

1. **`FrameTiming.buildDuration` cannot see UI-thread blockage between frames.** Sync work in a scroll callback delays the *next* frame's start; it shows up in `totalSpan`/vsync-wait, not build time. Chat script now reports late-delivery% and vsync-wait (totalSpan − build − raster).
2. **Batched FRAMESTAT logging silently dropped tail frames** on animation-free screens (batch-of-60 never flushed). Fixed with a 2s periodic flush; feed re-runs now capture slightly more frames than post #1's sample set (noted in demo README).
3. **Future-dated `pubDatetime` silently skips HTML emission** at build time (theme's scheduled-post filter) while the dev server still serves the post — dist/ contained only the OG image. The phase-04 "verify built body non-empty" check caught it.
4. **Dynamic-refresh panel (90/120Hz)** made the budget claim unverifiable by assumption; added vsyncStart as a 4th FRAMESTAT column so every run self-reports its actual cadence.
5. **`measurements/` was gitignored** — the post's "raw logs are in the repo" claim was false until fact-check caught it; 20 protocol logs force-added and pushed.

## Verification

Code review (fairness of the A/B fork) and post fact-check ran as separate reviewer agents; reports in `plans/reports/from-code-reviewer-to-cook-260813-*.md`. Fact-check recomputed every table statistic from raw logs and matched all 10 verbatim quotes + 17 URLs against the source-verification report. `pnpm run build:ci` green; series hub orders the post as #2; eslint/prettier clean.

## Unresolved

- Push of blog repo + deploy: user decision pending.
- Prettier flags 3 pre-existing files (opener post, architecture post, en.ts) — out of scope, left untouched.
