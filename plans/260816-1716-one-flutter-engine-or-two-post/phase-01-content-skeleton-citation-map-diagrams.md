---
phase: 1
title: Content Skeleton Citation Map & Diagrams
status: completed
effort: S
---

# Phase 1: Content Skeleton Citation Map & Diagrams

## Overview

Produce `content-skeleton.md` in this plan dir — the writing contract for Phase 2: 11 sections (brainstorm §5) with anchor claims + verified URLs, the diagrams drafted in mermaid, the tables drafted, code sketches, and the FAQ list. No new web research except (a) re-verifying permalinks/quotes against flutter/flutter + flutter_boost master on draft day, (b) confirming whether the blog's mermaid pipeline renders `sequenceDiagram`.

## Requirements

- Every external claim/quote in the skeleton carries a URL from brainstorm §9 or a sub-report and obeys the fact rules in `plan.md`.
- Zero ms/MB numbers anywhere (only "~180 kB … static allocation only").
- Verdict wording: "we go S2 — one engine per live segment — on two conditions …"; S1/Boost and replay framed as *when we'd switch*, not as rejected.
- House style per `docs/website-content-sdd.md` §3 and post #4.

## Related Code Files

- Create: `plans/260816-1716-one-flutter-engine-or-two-post/content-skeleton.md`
- Read: brainstorm report + 4 sub-reports (paths in `plan.md`); `src/content/posts/half-flutter-half-native-who-owns-navigation-mid-migration.md` (voice, S1/S2/S3 table, `PopScope` snippet, references style); `src/content.config.ts`; `src/data/series.ts`; the mermaid build pipeline (`scripts/` / astro config) to check `sequenceDiagram` support and dark-mode handling.

## Implementation Steps

1. **Section map** — for each of the 11 sections: H2 title (question/claim style), 1-line purpose, anchor claims with URL, target words. Sections: hook (the flow, back ×4, where #4 stopped) · the reflex answer (`withCachedEngine("main")` ×2 / `FlutterViewController(engine:)` ×2, five lines) · Reveal 1 "The engine has one seat" · Reveal 2 "Even re-attached, the Navigator is wrong" (segments; FlutterBoost = the price list) · Reveal 3 "What two engines buy and cost" · four options table · the decision (tree + verdict with conditions) · what's still undecided · FAQ · where the original question went wrong · references + footer.
2. **Thesis** — draft the `> [!TIP]`: an engine attaches to exactly one container at a time on both platforms, so "one cached engine for both segments" isn't the default — it's the FlutterBoost architecture (host re-attaches on every resume + Dart keeps a stack of per-segment Navigators alive off-stage). Two engines buy back exactly those two things and charge an isolate boundary and a second bootstrap. Decide by "must segment A stay alive under native?" and "how much Dart state crosses", not by feature count. Draft the closing "the question was wrong in N words" paragraph: the axis isn't single vs group; it's one seat per engine + one Navigator per segment.
3. **Artifact 1 — eviction timeline `sequenceDiagram`** (Android): participants Host / FlutterActivity A / FlutterEngine (registry+renderer) / Dart / NativeActivity N1 / FlutterActivity B; steps: A attach → N1 push (A onStop: view GONE, still attached) → B attach → `attachToActivity` evicts A ("evicted by another attaching activity", `onDestroyView/onDetach`, `appIsDetached`, `stopRenderingToSurface`) → B renders F3,F4 → back → N1 → back → A `onStart` "called after detach", no re-attach → blank/last frame. iOS mirror: `initWithEngine` sets `engine.viewController=B` (+ error log), A `notifyViewControllerDeallocated`→detached; on return A's `viewWillAppear` guard `engine.viewController == self` fails → shows B's last frame. If `sequenceDiagram` isn't supported by the pipeline, draw as a top-down flowchart with a swimlane per layer. Each diagram gets a 3–5 sentence prose reading with the source file names.
4. **Artifact 2 — two topology diagrams** (flowchart): (a) single engine done right: host stack `[A][N1][B]`, one engine, Dart `Overlay` with `ContainerOverlayEntry(opaque:true, maintainState:true)` per segment, each with its own `Navigator`; arrows "host re-attaches engine on resume", "root pop → host". (b) engine per live segment: `[A ← engine 1][N1][B ← engine 2]`, `PopScope` root → `hostNavigator.close()`, no re-attach. Reuse the S1/S2 vocabulary from #4.
5. **Artifact 3 — decision tree** (flowchart, replaces the ChatGPT tree): start from the flow → "must segment A stay alive under N1 while B is shown?" → NO → single engine + replay (rebuild from `AppDestination`, state lost) → YES → "Dart state crossing segments beyond what the host holds?" → little → engine per live segment (`FlutterEngineGroup`, pre-warm one spare) → a lot → move it to the host or accept a container stack (Boost or your own). Annotate our position.
6. **Tables**: (i) four options (brainstorm §4 columns); (ii) "what you must write" single-done-right vs engine-per-segment (eviction handling · Navigator model · lifecycle dispatch · black-frame handling · plugin re-binding · engine registry · what already exists from #4); (iii) cost list for two engines with issue numbers (#115533, #72033, #78590, #122364, #79335, #159718, #156802, #165372, #162074) — each row a fact + URL, no numbers.
7. **Code sketches**: reflex answer (Kotlin `FlutterActivity.withCachedEngine("main").build(this)` ×2; Swift `FlutterViewController(engine: engine, nibName: nil, bundle: nil)` ×2); the `PopScope` root from #4 verbatim; host-side segment↔engine registry ≤15 lines Kotlin + Swift (`FlutterEngineGroup.createAndRunEngine` / `makeEngine(withEntrypoint:)`, cache by segment id, destroy on container finish, one spare pre-warmed); FlutterBoost quotes as short excerpts (Java `detachFromFlutterEngine` no-op, `performAttach`, reflection block comment; Dart `ContainerOverlayEntry(... opaque: true, maintainState: true)`).
8. **FAQ list** (5): Why not just adopt FlutterBoost then? · Can I keep one engine and call `attachToActivity` / `setViewController` myself? · Does the group need engine A alive for B? · How many engines is too many? · Are tabs segments? — each with a 2-line answer + URL.
9. **Post #4 touch list**: footer sentence to prepend; optional one-line pointer in "What's Still Broken or Undecided" (S1 vs S2 → "decided in #5, conditions there"); nothing else.
10. **Gap check** — any claim without URL → resolve from sub-reports or cut; any number → cut; verify `sequenceDiagram` support and note the fallback decision in the skeleton.

## Success Criteria

- [ ] `content-skeleton.md` covers all 11 sections; each has ≥1 anchor claim with URL or is explicitly author-experience.
- [ ] Artifacts 1–3 drafted in mermaid; tables (i)–(iii) drafted; code sketches present; FAQ list present.
- [ ] All `plan.md` fact rules applied; zero ms/MB; verbatim quotes match master (re-verified on draft day, permalinks to flutter/flutter + alibaba/flutter_boost).
- [ ] `sequenceDiagram` support verified (or fallback chosen and noted).

## Risk Assessment

- Temptation to quote sub-report cost table numbers → rule: numbers cut at skeleton stage, reviewer greps for `ms|MB` in Phase 3.
- Boost master may have moved (e.g. `PopScope`) → quote with commit permalink + "as of <date>".
- `sequenceDiagram` in dark mode may render poorly → fallback flowchart swimlanes.
