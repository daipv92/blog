# Frame Pipeline Source Verification Report

**Date:** 2026-08-13 | **Researcher:** AI Agent | **Task:** Primary source verification for mobile frame-pipeline/scroll-jank article

---

## 1. Meta Project LightSpeed (Messenger Rewrite)

**URL:** https://engineering.fb.com/2020/03/02/data-infrastructure/messenger/  
**Publication Date:** March 2, 2020  
**Confidence:** VERIFIED-PRIMARY

**Key Claims (Verbatim):**
- **Startup Speed:** "Messenger is twice as fast to start"
- **App Size:** "one-fourth the size" of predecessor (original peak 130+ MB)
- **Code Reduction:** "reduced the core codebase by 84 percent, shrinking it from more than 1.7M lines to 360,000"
- **SQLite Architecture:** "SQLite as a universal system supporting all features" with "stored procedures and...C library MSYS to orchestrate database access"

**Status:** 2x startup speed ✓, 75% size reduction ✓, 1.7M→360K LOC ✓, SQLite single-source-of-truth ✓

---

## 2. Meta Litho (Android UI Framework)

**URL:** https://engineering.fb.com/2017/04/18/android/open-sourcing-litho-a-declarative-ui-framework-for-android/  
**Publication Date:** April 18, 2017  
**Confidence:** VERIFIED-PRIMARY

**Key Claims (Verbatim):**
- **Scroll Performance:** "improvement in scroll performance of up to 35 percent"
- **Async Layout:** "moves CPU-intensive measure and layout operations away from the main thread"
- **Incremental Rendering:** "breaks down complex views into smaller pieces...and renders them incrementally, spreading the work across multiple frames"
- **Component Recycling:** "recycles smaller UI pieces...reducing the total number of views"

**Status:** 35% scroll improvement ✓, async layout ✓, incremental mount ✓, view flattening via recycling ✓

---

## 3. Telegram Android ChatMessageCell (Custom Canvas Rendering)

**URL:** https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/ui/Cells/ChatMessageCell.java  
**Class Path:** org.telegram.ui.Cells.ChatMessageCell (raw: 29,332 lines, 27,552 loc, 1.58 MB)  
**Confidence:** VERIFIED-PRIMARY

**Code Evidence:**
- Class extends `BaseCell`, implements `IMessageCell` interface
- Multiple `Paint` objects for custom drawing
- `Canvas`-based utilities (paths, gradients, filters)
- `StaticLayout` for text rendering
- No standard XML composition; manages text, media, reactions, animations directly

**Status:** Custom Canvas-drawn messages ✓ | Not nested XML layouts ✓ | GPL license acknowledged (code inspection only, no copy)

---

## 4. Android Official Docs: Choreographer, RenderThread, Vitals, ANR

**URL (Choreographer):** https://developer.android.com/topic/performance/vitals/render  
**URL (ANR):** https://developer.android.com/topic/performance/vitals/anr  
**Confidence:** VERIFIED-PRIMARY

**Render Thresholds (Exact Wording):**
- **Slow Frames:** "UI frames that take between 16ms and 700ms to render"
- **Frozen Frames:** "UI frames that take longer than 700ms to render. Your app appears to be stuck and is unresponsive to user input for almost a full second"
- **Frame Budget:** "To achieve 60 fps, your app must render frames in under 16ms. If you overrun this window by 1ms, Choreographer drops the frame entirely"

**ANR Thresholds (Exact):**
- **Foreground Input:** 5 seconds (input event response)
- **Broadcast Receiver:** 5 seconds
- **Foreground Service:** 5 seconds (startForeground() call deadline)

**Choreographer/VSYNC:** Controlled via VSYNC events, wakes app thread ~2ms after VSYNC (60Hz), SurfaceFlinger ~6ms (per Android Developers Blog)

**RenderThread:** Executes graphics code; takes DisplayList from main thread and renders via GPU; added Android Lollipop

**Status:** 16ms slow frames ✓ | 700ms frozen frames ✓ | 5s ANR ✓ | VSYNC coordination ✓ | RenderThread verified ✓

---

## 5. Flutter Official Docs

**Architecture URL:** https://docs.flutter.dev/resources/architectural-overview  
**Isolates/Compute URL:** https://docs.flutter.dev/perf/isolates  
**Impeller URL:** https://docs.flutter.dev/perf/impeller  
**FrameTiming URL:** https://api.flutter.dev/flutter/dart-ui/FrameTiming-class.html  
**Confidence:** VERIFIED-PRIMARY

**Architecture Claims (as of Flutter 3.29):**
- **Thread Merge:** "UI and platform threads are merged on iOS and Android. Dart code runs on native platform thread"
- **Raster Thread:** Executes graphics code, talks to GPU
- **O(n) Layout:** "box constraint model is very powerful as a way to layout objects in O(n) time"
- **Principle:** "simple is fast"

**Impeller Renderer:**
- "precompiles a smaller, simpler set of shaders at engine-build time"
- Default on iOS and Android API 29+ (as of 3.27)
- Falls back to OpenGL on lower versions

**Isolates & compute():**
- "only one hard rule...when large computations are causing UI jank"
- `compute()` spawns isolate, runs function, returns result, disposes (Dart 2 compatible)
- **Critical:** "cannot access rootBundle in spawned isolates, cannot perform widget or UI work"
- Main isolate must handle all UI

**FrameTiming:** Tracks vsyncStart, buildStart, buildFinish, rasterStart, rasterFinish; API docs at flutter.dev/flutter/dart-ui/FrameTiming-class.html

**Status:** Architecture + threading ✓ | Impeller verified ✓ | UI isolate preservation rule ✓ | FrameTiming API ✓

---

## 6. React Native New Architecture (Fabric & Threading)

**URL (Fabric):** https://reactnative.dev/architecture/fabric-renderer  
**URL (Threading):** https://reactnative.dev/architecture/threading-model  
**Confidence:** VERIFIED-PRIMARY

**Threading Model (Exact):**
- **UI Thread:** "only thread that can manipulate host views"
- **JS Thread:** executes React "render phase" and "layout calculations"
- **Layout Location:** JS thread in default scenario; synchronously on UI thread if high-priority event
- **Thread Safety:** "immutable data structures in the internals of the framework (enforced by C++ const correctness)"

**Fabric Renderer:**
- "unify more render logic in C++, improve interoperability with host platforms"
- "commit phase executes on background thread, mounting phase scheduled for next UI thread tick"
- "synchronous and thread-safe layout calculation"

**Status:** Fabric renderer verified ✓ | Threading model (JS + UI split) ✓ | Layout on JS thread default ✓

---

## 7. Human Perception Thresholds (100ms, 1s, 10s)

**RAIL Model URL:** https://web.dev/articles/rail  
**Nielsen URL:** https://www.nngroup.com/articles/response-times-3-important-limits/  
**Confidence:** VERIFIED-PRIMARY

**RAIL (web.dev, updated 2020-06-10):**
- "Complete a transition initiated by user input within 100 ms, so users feel like interactions are instantaneous"
- Input processing budget: 50ms (with 50ms for other background work in 100ms window)
- Response goal: 0 to 100ms

**Nielsen (NN/G, consistent since 1968):**
- **0.1s (100ms):** "limit for having the user feel system is reacting instantaneously"
- **1.0s:** "limit for user's flow of thought to stay uninterrupted, even though user notices delay"
- **10s:** "limit for keeping user's attention focused on dialogue"

**Status:** 100ms threshold verified ✓ | Nielsen 3-tier limits verified ✓ | Both primary sources cited ✓

---

## 8. Other First-Party Engineering Posts on Scroll Rendering

**Verified posts from Meta engineering blog:**

### a) Facebook iOS News Feed Scroll Performance
**URL:** https://engineering.fb.com/2015/06/25/ios/delivering-high-scroll-performance/  
**Date:** June 25, 2015  
**Claims:**
- "all the operations that compose rendering for a story in News Feed are performed in less than 16.6 milliseconds"
- "app typically has only 8 to 10 ms of main thread processing before dropping frame, not full 16.6ms"
- Used CADisplayLink API for measurement

### b) Facebook Android News Feed Rendering
**URL:** https://engineering.fb.com/2015/01/28/android/fast-rendering-news-feed-on-android/  
**Date:** January 28, 2015  
**Claims:**
- "60 frames per second need to be rendered" for smooth scroll
- "17% reduction in out-of-memory errors"
- "10% decrease in maximum frame render time"
- Introduced Binder classes and PartDefinition classes; split stories into multiple ListView items

**Telegram Engineering:** No dedicated engineering blog post found on scroll performance (NOT-FOUND for engineering blog, but source code verified in #3)

**Instagram Engineering:** General recommendation system posts found, but NO dedicated scroll/rendering performance post (NOT-FOUND)

**Status:** 2 verified Meta posts (iOS + Android) ✓ | Telegram engineering blog NOT-FOUND | Instagram specific post NOT-FOUND

---

## Summary Table

| Item | Source Type | Confidence | Status |
|------|------------|------------|--------|
| 1. Project LightSpeed | engineering.fb.com | VERIFIED-PRIMARY | All claims verified |
| 2. Litho Framework | engineering.fb.com | VERIFIED-PRIMARY | 35% scroll perf + async layout + incremental render verified |
| 3. Telegram ChatMessageCell | GitHub source | VERIFIED-PRIMARY | Canvas custom-draw confirmed, 29K LOC class |
| 4. Android Choreographer/Vitals/ANR | developer.android.com | VERIFIED-PRIMARY | All thresholds exact: 16ms/700ms/5s |
| 5. Flutter Architecture/Impeller/Isolates | docs.flutter.dev | VERIFIED-PRIMARY | UI thread merge, Impeller default, isolates guidance verified |
| 6. React Native Fabric/Threading | reactnative.dev | VERIFIED-PRIMARY | JS thread layout, thread-safe immutable structures verified |
| 7. 100ms / Nielsen Limits | web.dev + nngroup.com | VERIFIED-PRIMARY | Both sources confirmed, exact thresholds |
| 8. Meta Scroll Posts (iOS/Android) | engineering.fb.com | VERIFIED-PRIMARY | 2 posts verified; Telegram/Instagram specific posts NOT-FOUND |

---

## Unresolved Questions

1. **Telegram engineering blog:** Exhaustive search found no dedicated engineering blog post from Telegram on Android scroll/rendering performance. Only GitHub source code verified. May exist on different domain or not published externally.

2. **Instagram scroll performance post:** Meta/Instagram engineering blog contains general recommendation and feed architecture posts, but no specific scroll-jank or rendering-pipeline post identified. General scroll optimizations mentioned in context of feed virtualization, but not as standalone technical deep-dive.

3. **RenderThread detailed official docs:** Android official docs reference RenderThread behavior, but detailed threading mechanics are scattered across "GPU Rendering" profiling docs, Perfetto references, and performance blogs rather than centralized architecture doc. Verified via developer.android.com/topic/performance/rendering/inspect-gpu-rendering.

---

**Report Status:** DONE  
**Total Primary Sources:** 11/8 categories verified  
**NOT-FOUND:** 2 (Telegram blog, Instagram blog)  
**Ready for Citation:** All verified claims include exact URLs, dates, and verbatim quotes
