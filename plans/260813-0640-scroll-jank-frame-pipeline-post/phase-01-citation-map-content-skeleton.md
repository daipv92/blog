---
phase: 1
title: "Citation Map & Content Skeleton"
status: done
priority: P2
dependencies: []
---

# Phase 1: Citation Map & Content Skeleton

## Overview

Map every verified quote/number to its target section of the 11-section spine; produce the English section-by-section skeleton (headings + key beats + citation slots) so Phase 3 is pure prose work.

## Requirements

- Functional: one skeleton doc mapping outline sections → English headings → citations → diagrams to keep/convert.
- Non-functional: first-party sources only; anything unverifiable is cut, not downgraded.

## Related Code Files

- Create: `plans/260813-0640-scroll-jank-frame-pipeline-post/content-skeleton.md`
- Read: `plans/reports/researcher-260813-0640-frame-pipeline-source-verification-report.md`, `plans/reports/brainstorm-260813-0640-scroll-jank-frame-pipeline-report.md`, `src/content/posts/is-the-framework-really-why-your-app-is-slow.md`

## Implementation Steps

1. Translate the 11 section titles to English working headings; keep the question-driven flow.
2. Assign citations (from verification report, all VERIFIED-PRIMARY):
   - §4 (16.7ms): Android vitals render doc — "under 16ms... Choreographer drops the frame entirely"; 60/90/120Hz table; note test device is 90Hz → 11.1ms.
   - §5 (touch-to-pixel): Android Choreographer/VSYNC + RenderThread; Flutter architectural overview (UI vs raster thread, 3.29 thread merge); RN threading model ("only thread that can manipulate host views").
   - §6 (late frames): Android slow (16-700ms) / frozen (>700ms) definitions.
   - §7 (100ms aha): RAIL 100ms + Nielsen 0.1s/1s/10s; Facebook iOS 2015 — "only 8 to 10 ms of main thread processing" before dropping a frame (gold quote); 100/16.7 ≈ 6 refresh intervals math.
   - §8 (chat screen): own measured numbers (Phase 2 output).
   - §9 (Messenger/Telegram): Telegram `org.telegram.ui.Cells.ChatMessageCell` (~29K LOC Canvas-drawn, GitHub link, describe-don't-copy — GPL); LightSpeed (2x start, 84% LOC cut, SQLite universal system — frame honestly as rebuild/startup story); Litho ("up to 35 percent" scroll, async layout off main thread, incremental mount); Facebook Android 2015 feed rendering post.
   - §10 (condensed): Impeller precompiled shaders; RN Fabric ("commit phase executes on background thread"); link to opener for the framework-blame debate.
3. Mark honest-framing notes inline: no Telegram/Instagram rendering blog exists (say so in-article); LightSpeed ≠ scroll evidence.
4. Decide which ASCII diagrams from the outline become mermaid vs stay as text blocks (repo renders mermaid at build time).
5. List reusable opener citations (Discord, FlashList) to avoid re-verifying.

## Success Criteria

- [x] `content-skeleton.md` exists: every section has heading, beats, citation slots filled
- [x] Every citation traceable to verification report entry or opener
- [x] Honest-framing notes present for LightSpeed and missing Telegram blog

## Risk Assessment

Low. Worst case: a quote reads weaker in context → cut it (rule: cut, don't substitute secondary sources).
