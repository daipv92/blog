---
phase: 3
title: "Write the Post"
status: done # published file 2026-08-13; one deviation: frame-timeline mermaid replaced by real-data hitch-anatomy PNG (better evidence than synthetic diagram)
priority: P2
dependencies: [1, 2]
---

# Phase 3: Write the Post

## Overview

Write the full English post from the Phase 1 skeleton + Phase 2 numbers, matching the opener's voice (first-person, evidence-linked, honest disclosures, subjective conclusions stated as such).

## Requirements

- Functional: complete post in `src/content/posts/`, valid frontmatter, mermaid diagrams render.
- Non-functional: stands alone for new readers; §10 ≤ 4 paragraphs + opener link; no claim without first-party link or own measurement.

## Related Code Files

- Create: `src/content/posts/i-made-messages-load-fast-so-why-does-scrolling-still-stutter.md`
- Modify (optional): `src/data/series.ts` — add `plannedTitles` for mobile-performance if user wants hub-page "coming next" entries
- Read: `plans/260813-0640-scroll-jank-frame-pipeline-post/content-skeleton.md`, opener post for voice/format conventions (TIP callout thesis, "Table of contents" heading, inline links, honest-methodology block)

## Implementation Steps

1. Frontmatter: title "I Made Messages Load Fast. So Why Does Scrolling Still Stutter?"; `series: mobile-performance`; `seriesOrder: 2`; `articleType: deep-dive` (enum verified: big-question | case-study | deep-dive | field-note); tags `mobile-performance, rendering, jank, flutter`; description ≤160 chars.
2. Follow the opener's structural conventions: one-sentence thesis in a `> [!TIP]` callout up front; `## Table of contents`; inline first-party links; FAQ optional.
3. Write sections per skeleton. Key beats not to lose:
   - §2: "Network is one segment of the pipeline" ladder.
   - §6-7 bridge: opener's jank near-tie (0.5% vs 0.0% on image feed) as setup — chat load lands mid-fling and hits the UI thread.
   - §7: 100ms ÷ 16.7ms ≈ 6 dropped intervals; Facebook's real budget quote (8-10ms).
   - §9: evidence-based, ending with the subjective thesis: no single trick — the discipline of keeping the main thread free at the moment a frame is due; state plainly that Telegram publishes no rendering blog, the source code is the evidence.
   - §11: closing question "Which frame is slow, and why?"
4. Embed Phase 2 results table + screenshots (images in `src/assets/images/`, imported via Astro image pipeline <!-- Updated: Validation Session 1 - image location confirmed -->) and link `mobile-perf-ab-demo`.
5. Convert selected outline ASCII diagrams: pipeline + frame-timeline as mermaid; keep short ones as text blocks.
6. Keep total length near opener's (~190-220 lines source) — cut before padding.

## Success Criteria

- [x] Post file complete, frontmatter validates (`series` slug registered, enum values legal)
- [x] Every external claim linked to verification-report URL; own numbers labeled as own (fact-check report: all 10 quotes verbatim, all 17 URLs exact)
- [x] §10 ≤ 4 paragraphs with opener link; bridge to opener's near-tie present
- [x] Mermaid blocks render locally + in build (SVG in dist HTML)

## Risk Assessment

- Voice drift (VN outline → EN prose reading translated) → write from skeleton beats, not sentence-by-sentence translation.
- Length creep: 11 sections + evidence + experiment → enforce cut-list in review.
