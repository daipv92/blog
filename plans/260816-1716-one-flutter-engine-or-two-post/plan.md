---
title: 'One Flutter Engine or Two: native between Flutter screens post'
description: >-
  Write and publish mobile-architecture #5 deep-dive: 'One Flutter Engine or
  Two? What Really Happens When Native Sits Between Two Flutter Screens' —
  engine has one seat per platform, single-engine-done-right = FlutterBoost
  container stack, engine-per-live-segment via FlutterEngineGroup; verdict S2
  conditional; no benchmark numbers.
status: completed
priority: P2
branch: main
tags:
  - content
  - mobile-architecture
  - flutter
  - add-to-app
  - flutter-engine-group
  - blog-post
blockedBy: []
blocks: []
created: '2026-08-16T10:40:47.116Z'
createdBy: 'ck:plan'
source: skill
---

# One Flutter Engine or Two: native between Flutter screens post

## Overview

Publish English post **"One Flutter Engine or Two? What Really Happens When Native Sits Between Two Flutter Screens"** — `series: mobile-architecture`, `seriesOrder: 5`, `articleType: deep-dive`, slug `one-flutter-engine-or-two-native-between-flutter-screens`. Pays the debt post #4 left open (S1 vs S2, "one cached engine" looked cheap) with source-level mechanics; **no benchmark numbers** (benchmark = a later post). Same real app, same device: reflex answer → 3 reveals → invariant → FAQ → "where the question went wrong".

- Brainstorm (approved design §5, artifacts §6, title §7, fact-check flags §8, footer refs §9, decisions §10): `/Users/vsf/Documents/research/web/plans/reports/brainstorm-260816-1716-one-flutter-engine-or-two-article-report.md`
- Evidence sub-reports (same folder): `researcher-260816-1716-android-single-engine-two-activities-report.md`, `researcher-260816-1716-ios-single-engine-two-viewcontrollers-report.md`, `researcher-260816-1716-flutterboost-dart-container-stack-report.md`, `researcher-260816-1716-flutter-engine-group-cost-and-measurement-report.md`; prior `research-260816-0730-flutter-addtoapp-navigation-internals-report.md`
- Style contract: `../docs/website-content-sdd.md` §3 + structure/voice of `src/content/posts/half-flutter-half-native-who-owns-navigation-mid-migration.md` (post #4) and the token post (#3)
- Prior plan to mirror: `plans/260816-0730-flutter-native-navigation-ownership-post/` (plan + `content-skeleton.md` + 3 phases)

**Author decisions (do not relitigate):**
- Artifact = **mechanism + diagrams**, no ms/MB numbers; measurement recipe may be *named*, numbers deferred to a benchmark post.
- **Verdict committed: S2 = one engine per live Flutter segment via `FlutterEngineGroup`**, conditional on (1) island first-frame measured on a low-end device under a threshold the author sets, (2) no Dart-owned DB/cache shared across segments (true today: host holds session, features self-fetch).
- This post = **#5**; data-layer post becomes #6. Post #4 footer gets a minimal edit (link to #5, keep data-layer sentence, don't claim the measurement is done).
- Refine #4's S1 row honestly: "flattened, one route per container" → fuller picture "one Navigator per segment, kept alive off-stage" (FlutterBoost model). Say so in-text.
- Naming stays: `HostRouter`, `AppNavigator.open/close`, `packages/host_contracts`, `AppDestination`, `OwnershipTable`, S1/S2/S3, "root swap", "island", "segment".
- Title fixed (brainstorm §7 #1). Write EN directly. Push to main after green build (pre-authorized pattern from #4; `wrangler deploy` fallback documented).

**Non-negotiable fact rules (brainstorm §8):**
- Cite flutter/flutter monorepo paths `engine/src/flutter/shell/platform/android/io/flutter/embedding/...` and `engine/src/flutter/shell/platform/darwin/ios/framework/...`; do not link archived `flutter/engine`.
- Do NOT cite any ms/MB from the engine-group cost sub-report §9 (speculative). Only "~180 kB per instance" (Flutter 2.0 release notes) with the caveat "engine static allocation only".
- Drop FlutterBoost "200–500 ms after re-attach" (unsourced).
- #103028 closed invalid; #145159 open P2 (3.19–3.21) → phrase as "nested Navigator + system back is still rough", not "broken". #71832 marked fixed (consistent with #4).
- FlutterBoost master used `WillPopScope` on 2026-08-16 — re-check on draft day; the Android `FlutterBoostActivity` quotes (no-op `detachFromFlutterEngine`, `performAttach`, reflection into `FlutterRenderer.isDisplayingFlutterUi` "Fix black screen when activity transition") were verified against master 2026-08-16 — re-verify permalinks at draft time.
- Verified strings to quote exactly: Android `"connection to the engine " + getFlutterEngine() + " evicted by another attaching activity"`, `"... called after detach."`; iOS `FlutterEngine.h` "A FlutterEngine can only have one `FlutterViewController` at a time…", `FlutterViewController initWithEngine:` "One instance of the FlutterEngine can only be attached to one FlutterViewController at a time. Set FlutterEngine.viewController to nil before attaching it to another FlutterViewController."; `ExclusiveAppComponent` javadoc "detachFromFlutterEngine is invoked when another App Component is becoming attached…"; docs add-to-app Android "set up a method channel and explicitly instruct their Dart code to change Navigator routes"; docs iOS "Your Flutter and Dart state will outlive one FlutterViewController".

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Content Skeleton Citation Map & Diagrams](./phase-01-content-skeleton-citation-map-diagrams.md) | Completed |
| 2 | [Write the Post](./phase-02-write-the-post.md) | Completed |
| 3 | [Review Build & Publish](./phase-03-review-build-publish.md) | Completed |

## Acceptance Criteria

- Post at `src/content/posts/one-flutter-engine-or-two-native-between-flutter-screens.md`; frontmatter valid vs `src/content.config.ts` (`series: mobile-architecture`, `seriesOrder: 5`, `articleType: deep-dive`, tags incl. `flutter`, `add-to-app`, `flutter-engine-group`, `navigation`, `migration`, `mobile-architecture`); `## References` footer present, grouped per brainstorm §9.
- All 11 outline sections (brainstorm §5) present; ≥3 original artifacts: (1) mermaid `sequenceDiagram` of A→N1→B→back→back per layer, Android + iOS, drawn from source; (2) container-stack diagram (single engine done right) vs engine-per-segment diagram; (3) rewritten decision tree; plus "what you must write" table and ≤15-line host-side segment↔engine registry sketch (Kotlin + Swift) and the unchanged `PopScope` root from #4.
- Every external claim carries a URL; all §8 rules respected; **zero ms/MB numbers**; "What's still undecided" section present; verdict stated with its two conditions.
- Voice/structure matches #3/#4: hook ≤3 paragraphs → `> [!TIP]` thesis → `## Table of contents` → reveals → invariant/decision → undecided → FAQ → "where the original question went wrong" → next-in-series footer (data-layer post #6, and "the benchmark post" for numbers); mermaid flowcharts + one sequenceDiagram (verify sequenceDiagram renders in the mermaid build pipeline light+dark — if not, fall back to flowchart), each diagram followed by a prose reading; ~3,000–3,600 words.
- Post #4 footer: one sentence linking to #5 added, data-layer sentence kept; nothing else in #4 changed except (optional) a one-line pointer in "What's Still Broken or Undecided" — S1 vs S2 → "decided in #5, conditions there".
- `pnpm build` green incl. `scripts/verify-post-bodies.mjs`; post listed under `/series/mobile-architecture/` as #5; commit + push to main; production body verified non-empty (fallback `npx wrangler deploy` if hosted build stalls, as on 08-15/08-16).

## Dependencies

None. Series registered; no code changes outside content. Prior post plans completed.
