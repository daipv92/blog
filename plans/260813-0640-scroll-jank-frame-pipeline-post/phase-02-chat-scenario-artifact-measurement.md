---
phase: 2
title: "Chat Scenario Artifact & Measurement"
status: done # measured on device 2026-08-13, 10 runs/variant, repo pushed (7fd5384)
priority: P1
dependencies: []
---

# Phase 2: Chat Scenario Artifact & Measurement

## Overview

<!-- Updated: Validation Session 1 - clone path resolved, screenshot dir corrected -->
Extend the existing public repo `github.com/hkngoc/mobile-perf-ab-demo` (local clone: `/Users/vandai/Documents/mobile-perf-ab-demo` — pull latest before edits) with a chat-screen scenario in the repo's established naive/disciplined two-entrypoint pattern; measure on the same OPPO Reno14 5G used for the opener. **User-in-loop: requires the physical device.**

## Requirements

- Functional: scrolling near the top of a chat list triggers "load 50 older messages" = JSON parse + real AES decrypt of real payloads + model map + list insert. No artificial sleeps or sabotage — same total work in both variants.
- Naive variant: parse/decrypt/map synchronously on the UI isolate, triggered mid-fling; unsized image decodes for avatars.
- Disciplined variant: parse+decrypt via `compute()`/isolate; chunked state insert; `itemExtent` or `prototypeItem`; `cacheWidth`-sized avatar decodes.
- Non-functional: methodology identical to opener — profile/release build, Flutter (Impeller default), `FrameTiming` API self-reporting (gfxinfo can't see Flutter frames), scripted fling sequence crossing the load trigger, 10 runs.

## Architecture

Follows the repo's existing shape: shared UI/data/assets, fork only at entrypoints (`main_naive.dart` / `main_disciplined.dart` or new chat-specific entrypoints/flavors per repo convention — inspect repo first, reuse its harness and scripts).

Message fixture: generated corpus (~thousands of messages: text lengths mixed, avatars, replies, reactions) stored encrypted so decrypt is real work.

## Related Code Files

- Modify: `mobile-perf-ab-demo` repo (separate repo, not this blog repo) — chat screen widgets, fixture generator, measurement script additions.
- Create (blog repo): `src/assets/images/` frame-chart screenshots, kebab-case names (final filenames in Phase 3); results table numbers into `content-skeleton.md`.

## Implementation Steps

1. Inspect repo layout: flavors, measurement scripts, FrameTiming reporter — reuse, don't rebuild.
2. Build shared chat screen + fixture generator (encrypted message corpus).
3. Implement naive and disciplined load paths (spec above).
4. Add scripted fling that crosses the load-50 trigger; record `FrameTiming` per variant.
5. USER: run both variants on OPPO Reno14, 10 runs each; collect janky-frame % (>11.1ms @90Hz — state threshold choice explicitly), worst frame ms, build p50/p99.
6. If the device absorbs the naive workload (near-tie again): escalate honestly — bigger payloads/message counts within realistic bounds (real chat payloads with E2EE decrypt + link previews) — and disclose the escalation in-article, as the opener did.
7. Capture 1-2 DevTools/derived frame-chart screenshots (naive vs disciplined at the load moment).
8. Commit + push repo changes so the article can link to reproducible code.

## Success Criteria

- [x] Chat scenario runs in both variants with identical total work (fairness verified by code review, `plans/reports/from-code-reviewer-to-cook-260813-0706-chat-scenario-review.md`; emulator smoke test: loads fire mid-fling, FRAMESTAT/CHATLOAD captured)
- [x] Results table: 10 runs/variant on OPPO Reno14 5G, measured ~91Hz cadence. Naive: jank 6.3% median (>11.11ms build|raster), late-delivery 4.6%, worst totalSpan 58.5ms median (max 95.9), UI blocked 36ms median/load (25-93), vsync-wait p99 35.9ms. Disciplined: 0.0% / 0.0% / 13.1ms / 2.2ms — zero missed intervals in all 10 runs. Raw data in mobile-perf-ab-demo/measurements/.
- [x] Naive variant shows measurable jank at load-mid-fling — NO escalation needed
- [x] Frame-chart screenshots exported (src/assets/images/chat-scroll-frame-timeline-naive-vs-disciplined.png, chat-scroll-naive-load-hitch-anatomy.png); repo pushed (7fd5384)

## Risk Assessment

- Device unavailable → phase blocks; article cannot ship on sources alone per approved design. Mitigation: schedule with user early.
- Near-tie even after escalation → still publishable ("this workload class needs X before it janks" is honest data), but reframe §8 accordingly.
- 90Hz vs 60Hz threshold confusion → always report both the 11.1ms device budget and the 16.7ms convention, explicitly.
