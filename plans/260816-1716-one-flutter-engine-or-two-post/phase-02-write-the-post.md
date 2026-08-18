---
phase: 2
title: Write the Post
status: completed
effort: M
---

# Phase 2: Write the Post

## Overview

Write `src/content/posts/one-flutter-engine-or-two-native-between-flutter-screens.md` from `content-skeleton.md`, in the voice of posts #3/#4, EN, ~3,000–3,600 words, with the three artifacts, tables, code sketches and FAQ; plus the minimal post #4 footer edit.

## Requirements

- Functional: valid frontmatter (`title`, `description` ≤160 chars, `pubDatetime` past-in-UTC placeholder to be set at publish, `featured: false`, `draft: false`, `tags`, `series: mobile-architecture`, `seriesOrder: 5`, `articleType: deep-dive`); `## Table of contents` after the TIP; every mermaid block followed by a prose reading; `## References` footer grouped as brainstorm §9; next-in-series footer names the data-layer post (#6) and says the numbers are still owed to a benchmark post.
- Non-functional: numbers over adjectives but **no ms/MB**; honesty section; no "we shipped" claims about S2 — "we're going S2 on two conditions"; no plan/audit labels in the text.

## Related Code Files

- Create: `src/content/posts/one-flutter-engine-or-two-native-between-flutter-screens.md`
- Modify: `src/content/posts/half-flutter-half-native-who-owns-navigation-mid-migration.md` — footer `_Next in this series: …_`: prepend one sentence linking to #5 ("First, the engine question this post left open: …"), keep the data-layer sentence; optional one-line pointer in "What's Still Broken or Undecided" under the S1-vs-S2 bullet.
- Read: `content-skeleton.md`, post #4, token post (footer pattern), `docs/website-content-sdd.md` §3.

## Implementation Steps

1. Frontmatter + hook (≤3 paragraphs): the flow in one code block (`Flutter Group Setting → Flutter Member List → NATIVE Chat Detail → Flutter User Profile → Flutter Profile Media`, back ×4 must be F4→F3→N1→F2→F1); where #4 stopped ("S1 vs S2 open; one cached engine looked like the cheap default"); the promise: this post answers the mechanism, the numbers come in the benchmark post.
2. `> [!TIP]` thesis (skeleton §2) → `## Table of contents`.
3. **The reflex answer** — five lines each platform; say why it *seems* to work (Dart state outlives the container, docs say so) and set up the test: press back twice.
4. **Reveal 1 — The engine has one seat**: Android paragraph (`ExclusiveAppComponent`, `FlutterEngineConnectionRegistry.attachToActivity`, the eviction log, `stillAttachedForEvent` "called after detach", one surface in `FlutterRenderer`, `appIsDetached`, `ActivityAware` plugins detached; `FlutterFragment` identical) → iOS paragraph (`FlutterEngine.h` quote, `initWithEngine:` error log, lifecycle guards, B's last frame) → Artifact 1 diagram(s) + reading → the docs sentence that hints at it without warning.
5. **Reveal 2 — Even re-attached, the Navigator is wrong**: `[F1,F2,F3,F4]` and the back that shows F2 above N1 → segments = a stack of Navigators kept alive off-stage → FlutterBoost as the production proof, with short source excerpts (Dart Overlay/`ContainerOverlayEntry(opaque:true, maintainState:true)`/per-container `Navigator`/root pop → `nativeRouterApi.popRoute`; Android no-op `detachFromFlutterEngine`, `shouldDispatchAppLifecycleState=false`, `performAttach` on resume, the reflection hack with its comment; iOS `setViewController:self` in `viewWillAppear`; still `WillPopScope`) → the honest correction of #4's S1 row → Artifact 2a diagram + reading. Close: "single engine" is the *most* plumbing, and it lives in the code we're deleting.
6. **Reveal 3 — What two engines buy and cost**: what a group shares (docs) and what stays per engine (heap, `imageCache` #72033, plugins #78590, `main()` bootstrap — where first-frame goes, unmeasured), the "~180 kB … static only" caveat, the rule *one engine per live segment*, the `PopScope` root from #4 unchanged, the registry sketch (Kotlin + Swift), the issue list (#122364, #79335, #159718, #156802, #165372, #162074) as a table with one honest line each → Artifact 2b diagram + reading.
7. **Four options** table (single done right · engine per live segment · single + replay · N1 as PlatformView S3′) with a 2-sentence reading per row; PlatformView caveats with URLs.
8. **The decision**: Artifact 3 tree + reading; our verdict: S2 on two conditions (measured island first-frame on low-end < threshold — the benchmark post; no Dart-owned DB/cache across segments — true today, #6 must keep it true); what would flip us to replay (pure leaf segments) or to a container stack (large shared Dart state).
9. **What's still undecided**: numbers; threshold value; iOS swipe-back inside islands (carried); PlatformView inside islands + group (#165372); `PopScope`/predictive back inside islands (#145159 "still rough"); engine pool policy / max count.
10. **FAQ** (5 from skeleton). **Where the original question went wrong** (axis = one seat per engine + one Navigator per segment; "single vs group" was downstream). Footer: next-in-series (data-layer #6; benchmark post for numbers). `## References` grouped: Docs · Source (flutter/flutter) · FlutterBoost · Issues · Samples · Prior posts.
11. Post #4 footer edit + optional undecided-list pointer; keep everything else in #4 unchanged.
12. Self-check vs skeleton gap list: every claim has a URL; grep `\bms\b|MB` → zero hits except the "~180 kB" line; word count; all mermaid blocks have readings; naming consistent with #4.

## Success Criteria

- [ ] Post file written; frontmatter valid; 11 sections present; 3 artifacts + 3 tables + code sketches + FAQ present.
- [ ] Zero ms/MB numbers (except "~180 kB" with caveat); every external claim linked; verdict stated with two conditions; undecided section present.
- [ ] Post #4 footer updated minimally; data-layer sentence kept.
- [ ] Reads in the #3/#4 voice; ~3,000–3,600 words.

## Risk Assessment

- Drift into a FlutterBoost tutorial → cap Boost excerpts at what proves the price list (≤4 short blocks).
- Overclaiming S2 → conditions stated where the verdict is stated, and repeated in the undecided list.
- Long sequence diagram unreadable on mobile → keep ≤12 messages per diagram; split Android/iOS.
