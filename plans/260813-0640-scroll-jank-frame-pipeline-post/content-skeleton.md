# Content Skeleton — "I Made Messages Load Fast. So Why Does Scrolling Still Stutter?"

Post #2, `series: mobile-performance`, `seriesOrder: 2`, `articleType: deep-dive`.
Tags: `mobile-performance, rendering, jank, flutter`. Slug: `i-made-messages-load-fast-so-why-does-scrolling-still-stutter`.

Source of truth for citations: `plans/reports/researcher-260813-0640-frame-pipeline-source-verification-report.md` (§ numbers below reference its items 1–8). Opener citations reusable without re-verification (published post = verified): Discord RN post, Shopify FlashList, Android vitals render/launch URLs, Impeller docs, RN 0.76.

Rules enforced here: first-party links or own measurement only; unverifiable → cut, not downgraded. Honest-framing notes are **mandatory prose**, not optional.

---

## §1 — Hook (no heading; intro before TIP callout)

**Beats:**
- First-person: I spent weeks making messages *load* fast — cache layer, cursor pagination, prefetch on scroll, decrypt off the hot path. Payloads arrive in double-digit ms.
- And scrolling the thread still stutters. The finger flicks, the list hiccups.
- Bridge sentence (locked decision): loading is a *data* problem; smoothness is a *rendering* problem — this post is about the second, and it's the post I wished I'd read before blaming my network layer.
- Thesis in `> [!TIP]` callout (opener convention): **A fast response and a smooth scroll are two different budgets.** Data latency is measured in hundreds of ms; a frame has ~16.7ms (11.1ms on this post's 90Hz test device) — and it's the frame budget your users feel every time they move a finger.
- `## Table of contents` heading right after (opener convention).

**Citations:** none needed (own experience).

---

## §2 — Loading Fast and Rendering Smooth Are Different Problems

**Beats:**
- "Network is one segment of the pipeline" ladder: server → network → parse → state → build/layout → raster → display. Optimizing segment 1–2 does nothing for segments 4–7.
- Everything after the payload lands happens on the device, mostly on one thread, under a per-frame deadline.
- Key reframe: latency is *episodic* (you pay it once per request); rendering is *continuous* (you pay it 60–120 times per second while the finger is down).

**Diagram:** the ladder stays a **text block** (short, list-like — mermaid adds nothing).

**Citations:** none (conceptual); pipeline specifics deferred to §5.

---

## §3 — Your Screen Is a Flipbook

**Beats:**
- A "frame" = one complete picture; motion = pictures swapped fast enough that the eye fuses them. Film runs 24fps with motion blur; UIs have no motion blur, so they need 60+.
- Scrolling is the most frame-hungry thing an app does: every frame during a fling is a *new* picture (content offset changed).
- Sets up: who draws these pictures, and how long do they get?

**Citations:** none needed (common knowledge framing, no numeric claims beyond fps conventions).

---

## §4 — The 16.7ms Contract (11.1ms on My Phone)

**Beats:**
- 60Hz → 1000/60 ≈ 16.7ms per frame. The refresh-rate table:

| Display | Budget per frame |
| --- | --- |
| 60 Hz | 16.7 ms |
| 90 Hz | 11.1 ms |
| 120 Hz | 8.3 ms |

- Android's own wording — miss by 1ms and the frame is gone: verbatim **"To achieve 60 fps, your app must render frames in under 16ms. If you overrun this window by 1ms, Choreographer drops the frame entirely"** → https://developer.android.com/topic/performance/vitals/render (report §4).
- Explicit device note (recurring honesty rule): my test phone (OPPO Reno14 5G) runs 90Hz → the real budget in this post's measurements is **11.1ms**, and I'll flag which threshold applies every time a number appears. 16.7ms remains the industry convention.
- Higher refresh rate = *smaller* budget: the marketing feature makes the engineering problem harder.

**Diagram:** table above (markdown), no mermaid.

**Citations:** Android vitals render doc (§4, verbatim quote above).

---

## §5 — From Finger to Pixel: The Pipeline Nobody Shows You

**Beats:**
- Walk one frame end-to-end on Android: VSYNC tick → Choreographer wakes the UI thread → input → animation → build/measure/layout → display list handed to RenderThread → GPU → SurfaceFlinger/composition → screen. Choreographer coordinates via VSYNC (report §4).
- RenderThread: takes the display list from the main thread and renders via GPU (added in Lollipop) (report §4).
- Flutter's version: Dart code on the UI thread builds the layer tree; the **raster thread** talks to the GPU. As of Flutter 3.29, **"UI and platform threads are merged on iOS and Android. Dart code runs on native platform thread"** → https://docs.flutter.dev/resources/architectural-overview (report §5).
- RN's version: JS thread runs the render phase; the UI thread is the **"only thread that can manipulate host views"** → https://reactnative.dev/architecture/threading-model (report §6).
- The unifying point: every framework has *one* thread that must be free at the moment a frame is due. Different names, same chokepoint.

**Diagram:** touch-to-pixel pipeline = **mermaid flowchart** (this is the article's centerpiece diagram; keep to ~8 nodes, one line per stage, annotate the "your code lives here" stages).

**Citations:** Android Choreographer/RenderThread (§4), Flutter architecture (§5), RN threading (§6).

---

## §6 — When a Frame Is Late, Your Eye Files the Bug

**Beats:**
- Jank defined: a frame that misses its deadline isn't shown late-and-smooth — it's *dropped*; the previous picture stays up twice as long. The eye reads it as a stutter.
- Android's official taxonomy, verbatim: slow frames = **"UI frames that take between 16ms and 700ms to render"**; frozen frames = **"UI frames that take longer than 700ms to render"** → https://developer.android.com/topic/performance/vitals/render (report §4). Beyond that lives ANR territory (5s input deadline — mention once, don't dwell) (report §4).
- One late frame among 90 is invisible; a *cluster* of late frames mid-fling is what users call lag.
- **Bridge to opener (approved edit #1):** in post #1, scroll jank was the one metric discipline barely moved — 0.5% vs 0.0% janky frames, a near-tie, because the workload was an image feed and a 2025 90Hz phone absorbed it. Link opener. Tease: a chat thread landing 50 parsed-and-decrypted messages mid-fling is a different animal — §8 measures it.

**Diagram:** frame-timeline (on-time vs dropped frame across VSYNC ticks) = **mermaid** (second and last mermaid; if it fights the renderer, fall back to a text block — decision at write time).

**Citations:** Android vitals render (§4); ANR (§4); opener post (internal link).

---

## §7 — The 100ms Illusion (Why "Fast Enough" Lied to Me)

**Beats:**
- The aha that motivated this post: I had internalized **100ms = instant** from web work. RAIL, verbatim: **"Complete a transition initiated by user input within 100 ms, so users feel like interactions are instantaneous"** → https://web.dev/articles/rail (report §7). Nielsen's 0.1s / 1s / 10s limits, unchanged since 1968 → https://www.nngroup.com/articles/response-times-3-important-limits/ (report §7).
- The trap: 100ms is the budget for a *response* (tap → feedback). During continuous motion the budget is per-frame. 100ms ÷ 16.7ms ≈ **6 refresh intervals** — a "fast" 100ms handler executed mid-fling drops ~6 consecutive frames at 60Hz (~9 at 90Hz). Instant by the response yardstick; a visible stutter by the frame yardstick.
- The gold quote — Facebook iOS News Feed (2015): the app **"typically has only 8 to 10 ms of main thread processing before dropping frame, not full 16.6ms"** (the OS takes the rest) → https://engineering.fb.com/2015/06/25/ios/delivering-high-scroll-performance/ (report §8a). Your real budget is smaller than the theoretical one.
- So: two different clocks. Response time (100ms) for taps; frame time (8–16ms) for motion. My chat app passed the first clock and failed the second.

**Citations:** RAIL (§7), Nielsen (§7), Facebook iOS 2015 (§8a). The ÷ math is arithmetic, labeled as such.

---

## §8 — Back to My Chat Screen, This Time With Numbers

**Beats:**
- The experiment: extended the opener's public repo (`github.com/hkngoc/mobile-perf-ab-demo`) with a chat scenario. Same DNA: one codebase, two entrypoints, identical total work, no artificial sleeps.
- Scenario: scrolling near the top of the thread triggers "load 50 older messages" = JSON parse + real AES decrypt of real payloads + model map + list insert, landing mid-fling.
  - Naive: all of it synchronous on the UI isolate; unsized avatar decodes.
  - Disciplined: parse+decrypt in an isolate (`compute()`), chunked insert, `itemExtent`/prototype, `cacheWidth`-sized avatars.
- Methodology block (opener convention, repeat verbatim shape): profile/release build, Flutter (Impeller default), OPPO Reno14 5G / Android 16 / 90Hz — **budget 11.1ms, reported alongside the 16.7ms convention** — `FrameTiming` self-reporting (gfxinfo can't see Flutter frames), scripted fling crossing the load trigger, 10 runs.
- **[PHASE 2 SLOT — results table]:** janky % (>11.1ms), worst frame ms, build p50/p99, per variant.
- **[PHASE 2 SLOT — 1–2 frame-chart screenshots]** (naive vs disciplined at the load moment), images in `src/assets/images/`, kebab-case.
- **[PHASE 2 SLOT — escalation disclosure if used]** (bigger corpus/payloads within realistic bounds, disclosed like the opener did).
- **Writing caveat:** `CHATLOAD ms` is asymmetric between variants (naive = pure decrypt+parse CPU on UI isolate; disciplined = full `compute()` round trip incl. isolate spawn + copy) — never compare those two numbers head-to-head; the comparison metric is frame stats. The naive CHATLOAD ms IS quotable alone as "how long the UI thread was blocked per load."
- **Metric definitions available from the harness:** jank% (build or raster > budget, Flutter convention), late-delivery% (totalSpan > 2× budget) with missed-interval estimate, worst frame (build/raster/total), vsync-wait p50/p99 (totalSpan − build − raster ≈ time the frame waited on the busy UI thread — the metric that exposes the naive sync decrypt).
- Reading: the load moment is exactly where the two budgets collide — a "fast" 80ms load is ~7 dropped frames at 90Hz.

**Citations:** own measurement + repo link. Flutter isolates doc for the `compute()` claim: "cannot perform widget or UI work" in spawned isolates → https://docs.flutter.dev/perf/isolates (report §5).

---

## §9 — What the Big Chat Apps Actually Do

**Beats (evidence-based, approved edit #2):**
- Framing sentence up front, honest: **neither Telegram nor Instagram publishes a rendering engineering blog** (searched; report §8 NOT-FOUND). For Telegram the strongest first-party evidence is the source code itself — so that's what we read.
- **Telegram:** one message bubble = one custom-drawn cell. `org.telegram.ui.Cells.ChatMessageCell` — a single ~29,000-line class that draws text, media, reactions, animations directly on `Canvas` (Paint objects, StaticLayout), no nested XML view trees → https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/ui/Cells/ChatMessageCell.java (report §3). Describe, don't copy — GPL. The point: they flattened the view hierarchy to almost nothing because measure/layout of nested trees is frame-budget poison.
- **Messenger / Project LightSpeed:** verbatim "Messenger is twice as fast to start", core codebase cut "by 84 percent... from more than 1.7M lines to 360,000", "SQLite as a universal system supporting all features" → https://engineering.fb.com/2020/03/02/data-infrastructure/messenger/ (report §1). **Honest-framing note (mandatory): LightSpeed is a rebuild/startup story, not scroll evidence** — cite it for the architecture appetite (do less, closer to the data), not for jank numbers.
- **Meta Litho** (the on-topic scroll source): "improvement in scroll performance of up to 35 percent"; "moves CPU-intensive measure and layout operations away from the main thread"; incremental mount spreads rendering "across multiple frames" → https://engineering.fb.com/2017/04/18/android/open-sourcing-litho-a-declarative-ui-framework-for-android/ (report §2).
- **Facebook Android News Feed (2015):** split stories into multiple ListView items; 17% fewer OOMs, 10% lower max frame render time → https://engineering.fb.com/2015/01/28/android/fast-rendering-news-feed-on-android/ (report §8b).
- Closing the section — subjective thesis, stated as subjective (user's ask): reading all of this side by side, there is no single trick. Custom Canvas cells, async layout, incremental mount, SQLite-centric data — different bets with one shared invariant: **the main thread is free at the moment a frame is due.** That discipline, not any one technique, is the transferable lesson.

**Citations:** report §1, §2, §3, §8b + NOT-FOUND disclosures (§8).

---

## §10 — Don't the Frameworks Handle This? (≤4 paragraphs — hard cap, approved edit #3)

**Beats (rendering-architecture diff ONLY; framework-blame debate lives in the opener — link it):**
1. Native Android: Choreographer + RenderThread split the work; measure/layout on the main thread is still yours to blow (§4 sources, already cited in §5).
2. Flutter: UI (build) vs raster thread; Impeller **"precompiles a smaller, simpler set of shaders at engine-build time"** → https://docs.flutter.dev/perf/impeller (report §5) — kills shader-compilation jank, does nothing about *your* synchronous parse.
3. RN Fabric: **"commit phase executes on background thread, mounting phase scheduled for next UI thread tick"** → https://reactnative.dev/architecture/fabric-renderer (report §6) — layout moved off the UI thread, but JS-thread work still delays what gets committed.
4. Punchline paragraph: every architecture moves *its own* work off the hot path; none can move *yours*. Whether the framework is to blame for slowness at all is a different argument — I made it (with an experiment) in the opener → internal link to `is-the-framework-really-why-your-app-is-slow`.

**Citations:** Impeller (§5), Fabric (§6), opener internal link.

---

## §11 — Ask the Better Question, Again (closing)

**Beats:**
- Echo the opener's closing structure (it asked "where do your first two seconds go?").
- This post's version: when your app stutters, don't ask "why is it slow." Ask **"which frame is slow, and why?"** — which frame missed its deadline, what was on the main thread at that instant.
- One-line answer for my own chat app (whatever Phase 2 shows: the load-50 frame(s), parse+decrypt on the UI isolate).
- Series pointer: next = the full case study promised by the opener — one real app from "feels slow" to measured, budgeted, fixed.

**Citations:** none new.

---

## Diagram decisions (summary)

| Outline diagram | Decision |
| --- | --- |
| Pipeline ladder (server→…→display) in §2 | text block |
| Refresh-rate/budget table in §4 | markdown table |
| Touch-to-pixel pipeline in §5 | **mermaid flowchart** (centerpiece) |
| Frame timeline (dropped frame) in §6 | **mermaid** (fallback: text block) |
| Experiment design in §8 | naive-vs-disciplined **markdown table** (opener pattern), no diagram |

## Reusable opener citations (no re-verification needed)

- Android vitals render + launch-time URLs (also independently re-verified this session, report §4)
- Discord RN performance post (available if §7/§8 wants a "real chat client did this" aside — optional)
- Shopify FlashList 7.5x (available for §10/§11 aside — optional; don't force it)
- Impeller docs + Flutter 3.27 default (report §5 re-verified)
- Opener post itself: near-tie jank result (§6 bridge), framework-blame thesis (§10 link)

## Honest-framing checklist (Phase 4 verifies these survive)

- [ ] No Telegram/Instagram rendering blog exists — said plainly in §9; source code presented as the evidence
- [ ] LightSpeed framed as rebuild/startup, never as scroll/jank evidence
- [ ] 90Hz device: 11.1ms budget stated wherever a threshold appears, alongside the 16.7ms convention
- [ ] Facebook 8–10ms quote attributed to iOS News Feed, 2015, with date
- [ ] Escalation (if Phase 2 uses it) disclosed in the methodology block
- [ ] Telegram code described, never copied (GPL)
