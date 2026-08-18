# One Flutter Engine or Two Post Published

**Date**: 2026-08-16  
**Severity**: Routine  
**Component**: Blog content—mobile-architecture series #5 post  
**Status**: Published; hosted Cloudflare build stalled a third time (404 at +19 min), fallback `npx wrangler deploy` verified live

## What Happened

Published `src/content/posts/one-flutter-engine-or-two-native-between-flutter-screens.md` (deep-dive, seriesOrder=5, ~3,400 prose words). Pays the debt post #4 left open — S1 vs S2 — by reading embedding source instead of guessing: on both platforms a `FlutterEngine` attaches to exactly one container (`ExclusiveAppComponent` eviction on Android, `FlutterEngine.viewController` one-at-a-time on iOS), and neither re-attaches the underlying container on return; even re-attached, one Navigator can't hold two segments split by a native screen. "Single engine" therefore equals the FlutterBoost container stack (no-op eviction, resume re-attach, reflection into a private `FlutterRenderer` field, per-segment Navigators in an `Overlay`); "engine group" equals one engine per live segment with a heap and a `main()` per island. Verdict: S2 on two conditions (measured island first-frame; no Dart-owned state shared across segments). Zero ms/MB numbers by author decision — the benchmark is a later post.

Post #4: footer link to #5 prepended (data-layer sentence kept), one parenthetical on the S1-vs-S2 bullet, and one honesty clause — its two "engine-lifecycle bugs" (#122364, #79335) are closed as fixed, now says so.

## Execution Details

Brainstorm: `web/plans/reports/brainstorm-260816-1716-one-flutter-engine-or-two-article-report.md` + 4 researcher sub-reports (Android/iOS embedding, FlutterBoost internals, engine-group cost). Plan: `plans/260816-1716-one-flutter-engine-or-two-post/` (3 phases complete; `content-skeleton.md` pins flutter/flutter `4abfc5d` and flutter_boost `6df80cc` permalinks).

**Research corrections caught in-session**: the iOS sub-report claimed `setViewController:` notifies the replaced VC with `detached` — source shows only a dealloc observer; fixed before draft. The engine-group sub-report's cost table carried invented ms/MB — excluded by rule.

**Review** (code-reviewer, 15 min): 5 majors fixed — "~180kB" attributed to a release-notes page that doesn't contain it (→ Flutter 2.0 blog); "A shows B's last frame" overclaim (each VC owns its `FlutterView` → A shows its own frozen frame or blank); Kotlin `FlutterEngineCache.remove()?.destroy()` doesn't compile (`remove` returns void); issue states stale — `gh` confirmed #122364/#79335/#165372/#78590/#148662 fixed, #159718/#77621/#72033 open → state column, #162074 dropped; description 168→159 chars. Minors: back-press count made consistent across hook/prose/diagram, `// …` elisions in Boost excerpts, "swizzle" → category, line ranges, tags 6→5. All 45 external URLs 200.

**Diagrams**: `sequenceDiagram` avoided (site dark-mode CSS covers flowchart classes only) — eviction timelines drawn as `flowchart TB`, 5 diagrams rendered.

**Build**: `pnpm build` green twice — astro check 0 errors, `verify-post-bodies` 10 posts, 5 `svg[id^=mermaid]`.

**Deploy**: push `340afa2` → hosted build still 404 at +19 min → `npx wrangler deploy` (version `61465bad`, ~10 s) → production 200, 231 KB, series hub lists #5, #4 footer link live. Third consecutive publish needing the fallback; the hosted Workers Build is effectively not deploying pushes any more.

## Emotional Register

The satisfying part was that the ChatGPT brainstorm's "single cached engine may suffice" collapsed the moment the embedding source was opened — `evicted by another attaching activity` is a log line, not an opinion. The uncomfortable part was finding two of my own prior citations (#122364, #79335 in post #4) presented as live bugs when both were closed years ago; the reviewer's `gh` pass caught it, and the fix went into the same commit.

## Follow-ups

- Benchmark post: cold-island first frame on low-end Android + one iPhone with `FlutterUiDisplayListener` / `setFlutterViewDidRenderCallback:`; author sets the threshold before measuring.
- Data-layer post (#6) inherits the constraint: two Flutter segments must not need to share it.
- `web/docs/website-content-sdd.md` still lists `mobile-architecture` as PLANNED (five posts live) — stale line.
- Hosted Cloudflare Workers Build: investigate why pushes stop deploying, or make `wrangler deploy` the documented primary path.
