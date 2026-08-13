# Brainstorm Report: Mobile Performance #2 — Scroll Jank & the Frame Pipeline

- Date: 2026-08-13
- Session: /brainstorm (no --html / --wiki)
- Status: APPROVED by user
- Companion: `researcher-260813-0640-frame-pipeline-source-verification-report.md` (source verification, in flight at time of writing)

## Problem Statement

Author optimized message *loading* (cache, cursor pagination, prefetch, decrypt) in own chat app; scroll still stutters. Article explains why: data latency and rendering smoothness are different problems. Backbone = user's Vietnamese outline (11 sections): load-fast ≠ render-smooth → frames → 16.7ms → touch-to-pixel pipeline → late frames = jank → 100ms aha moment → back to chat screen → what Messenger/Telegram do → framework rendering architectures → "which frame is slow, and why?"

User requirements (locked via AskUserQuestion):
1. Series: **mobile-performance, seriesOrder 2** (bridge sentence to message-systems in hook).
2. Language: **English** (consistent with published opener; VN outline = thinking draft).
3. Evidence: **first-party sources + own measurements** (extend `mobile-perf-ab-demo`).
4. Section 10 (Native vs Flutter vs RN): **condensed to 3-4 paragraphs on rendering-architecture differences + link back to opener** (was ~70% overlap with opener).
5. Title: **"I Made Messages Load Fast. So Why Does Scrolling Still Stutter?"**

## Scout Findings (context that shaped decisions)

- Opener published 2026-08-12 (`is-the-framework-really-why-your-app-is-slow.md`, 195 lines, `articleType: big-question`). Already cites Discord, FlashList, Snapchat, Notion, Impeller, RN 0.76 — reusable citations.
- **Opener shipped WITH the A/B experiment**: repo `github.com/hkngoc/mobile-perf-ab-demo`, one Flutter project / two entrypoints, OPPO Reno14 5G, Android 16, 90Hz. Results: cold start 1.43x, memory 7.6x — **but scroll jank was a near-tie (0.5% vs 0.0%)**. Stale session state ("Phase 2: build artifact" unchecked) was wrong; artifact exists and is published.
- Opener's closing promise: next = "a case study — taking one real app from 'feels slow' to measured, budgeted, and fixed."
- Prior session's `source-audit.md` lost (plans/ never committed). Source verification re-run this session via researcher agent.
- Series registry `src/data/series.ts`: `mobile-performance` active, no plannedTitles. Frontmatter `series` validated against registry; `seriesOrder`, `articleType` fields exist.

## Evaluated Approaches

### Series placement
- **mobile-performance #2 (CHOSEN)**: natural sequel — opener ends "measure, don't guess"; this article teaches what a frame is so measuring means something. Content is rendering, not data layer.
- message-systems: matches chat hook + planned title "Why My Chat Was Still Slow", but frame/CPU/GPU content would dilute a data-layer series. Rejected.
- Cross-list both: schema allows 1 series/post; schema change not worth it. Rejected.

### Section 10 overlap with opener
- **Condense + link (CHOSEN)**: keep only what opener did NOT cover — rendering architecture differences (Flutter UI/raster threads + Impeller, RN Fabric threading, native Choreographer/RenderThread) — link to opener for "is the framework guilty" debate. Two adjacent posts must not argue the same thesis.
- Keep full: rejected — self-competition, +800 stale words.
- Drop entirely: rejected — loses the natural bridge to opener.

### Measurement artifact
- **Extend `mobile-perf-ab-demo` with a chat scenario (CHOSEN)**: methodological continuity (same device, same FrameTiming harness, same naive/disciplined DNA), one public repo across the series.
- New standalone repo: cleaner scope but re-setup cost + loses continuity. Rejected.
- No measurement / defer to next post: rejected by user — "real data" is the article's promise.

## Final Solution

English post, `series: mobile-performance`, `seriesOrder: 2`, title above. Keep the outline's 11-section spine with three deliberate edits:

1. **Narrative bridge at §6-7**: opener's jank near-tie becomes this article's setup — "last time scroll jank was the one metric discipline barely moved, because the workload was an image feed and a 90Hz phone absorbed it. A chat thread is a different animal: parse + decrypt + build for 50 messages landing mid-fling." Turns an apparent contradiction into continuity.
2. **§9 upgraded from principle-list to evidence**: Telegram Android open source (bubbles custom-drawn via Canvas in a single cell vs nested view trees — cite actual class/file), Messenger Project LightSpeed (SQLite-centric architecture, first-party numbers, honestly framed as rebuild/startup not scroll), Meta Litho (async layout off main thread — the on-topic scroll source). Subjective conclusion per user's ask: no single trick, only the discipline of keeping the main thread free at the moment a frame is due.
3. **§10 condensed** per decision above. §11 unchanged — "which frame is slow, and why?" stays the closing question.
4. Honest 90/120Hz handling: test device is 90Hz → 11.1ms budget, not 16.7ms; outline's Hz table already supports this.
5. State plainly in-article: Messenger/Telegram publish **no rendering whitepaper**; strongest Telegram evidence is its public source code — say so instead of pretending.

### Chat scenario spec (artifact)
- Message list (text/avatar/reply/reaction bubbles); scrolling near list top triggers "load 50 older messages" = JSON parse + real decrypt (AES on real payload, no artificial sleeps) + model map + insert.
- Naive: all synchronous on UI isolate, mid-fling. Disciplined: parse/decrypt via isolate, chunked insert, `itemExtent`/prototype, right-sized image cache.
- Measure: profile build, same OPPO Reno14, `FrameTiming` — janky-frame %, worst frame ms, build p50/p99 during scripted fling crossing the load point. Expectation: jank does NOT tie this time (workload hits UI thread mid-fling). If device absorbs it → escalate transparently (bigger payloads/counts), as opener did, and disclose.
- In-article deliverable: 1 results table + 1-2 frame-chart screenshots at §7-8.

## Source Map

- Tier A (already verified in published opener): Discord RN perf post, Shopify FlashList, Impeller docs, RN 0.76 New Architecture, Android vitals launch/render URLs.
- Tier B — VERIFIED (11 primary sources, see companion researcher report for URLs/dates/verbatim quotes): Messenger Project LightSpeed (2x speedup claim confirmed), Meta Litho (35% scroll improvement confirmed), Telegram Android source — `org.telegram.ui.Cells.ChatMessageCell` (~29K LOC, Canvas-based custom rendering) confirmed, Android thresholds exact (16ms slow / 700ms frozen / 5s ANR), Flutter UI-vs-raster thread + 3.29 thread merge + Impeller default + isolate constraints, RN Fabric threading, Nielsen + RAIL 100ms exact wording, 2 Meta engineering posts on scroll perf (iOS + Android, 2015).
- NOT FOUND (frame honestly in article): no dedicated Telegram or Instagram first-party blog post on chat/feed scroll rendering — Telegram evidence = its open-source code itself.
- Rule: first-party only; unverifiable claims get cut, not downgraded to secondary sources.

## Risks

- Telegram claims must point at real files/classes, not internet lore — gated on researcher verification.
- LightSpeed is a rebuild/startup story, not scroll — must not overclaim.
- Chat scenario may tie again on a strong phone — transparent escalation plan exists.
- Opener promised "case study" next; this post is theory+case hybrid. Accepted: the chat measurement IS the case; theory is the value-add.
- `articleType` valid values unknown for non-opener posts — check schema at write time; may need a new enum value (e.g. `deep-dive`).

## Success Metrics

- Every numeric claim: first-party link or own measurement.
- ≥1 original results table + frame-chart screenshot(s).
- §10 ≤ 4 paragraphs + opener link.
- Post stands alone; rewards opener readers.
- `pnpm run build:ci` passes (rehype-mermaid requires Chromium).

## Next Steps (proposed phases for /ck:plan)

1. Source verification DONE (this session, researcher report). Remaining: pick final quote set per section while writing.
2. Extend `mobile-perf-ab-demo`: chat scenario, naive+disciplined, measure on device, collect table + screenshots. (Requires user's physical device — user-in-loop phase.)
3. Write the post (English, spine above), register any schema tweak (`articleType`), add mobile-performance plannedTitles if desired.
4. Review pass (fact-check links, honest-framing check), build, publish prep.

## Unresolved Questions

- None blocking. Pending input: user's device availability (OPPO Reno14) for the measurement phase.
