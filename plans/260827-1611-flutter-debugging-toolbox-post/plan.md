---
title: "Flutter Debugging Toolbox post"
description: >-
  Write and publish the mobile-debugging series opener: "Still Debugging
  Flutter With print()?" — English big-question post arguing debugging is an
  evidence problem (structured observation beats log-grepping, and AI raises
  the stakes), with official docs.flutter.dev screenshots per tool, Crashlytics
  for production, and the official Dart & Flutter MCP server as the AI-native
  closer.
status: pending
priority: P2
effort: "1-2d"
branch: main
tags:
  - content
  - mobile-debugging
  - flutter
  - devtools
  - blog-post
blockedBy: []
blocks: []
created: 2026-08-27
---

# Flutter Debugging Toolbox post

## Overview

Publish English post **"Still Debugging Flutter With print()?"** — `series: mobile-debugging` (NEW series), `seriesOrder: 1`, `articleType: big-question`, slug `still-debugging-flutter-with-print`. Source material: the user's Vietnamese ChatGPT draft "Tôi đã lãng phí quá nhiều thời gian debug Mobile chỉ bằng log" (structure summarized below — the draft is the message, not the literal text; rewrite in the blog's English voice).

Core thesis (keep — it is the whole post): *developers debug with logs out of habit, when what they need is structured observation of app state — and the gap matters more now that AI joins debugging, because 2,000 Logcat lines are far worse AI input than request → response → state transition → timeline → exception.*

- Style contract: `/Users/vsf/Documents/research/web/docs/website-content-sdd.md` §3 (question title ≤60 chars, hook ≤3 paragraphs then `> [!TIP]` thesis, `## Table of contents`, mermaid **flowcharts only** for dark mode, tables for comparisons, tags lowercase-kebab 3-5 reuse-first).
- Voice/structure references: `src/content/posts/is-the-framework-really-why-your-app-is-slow.md` (big-question tone, evidence-first) and `src/content/posts/i-made-messages-load-fast-so-why-does-scrolling-still-stutter.md` (image usage pattern: `![caption](../../assets/images/...)`).
- Prior plan to mirror mechanically: `plans/260816-1716-one-flutter-engine-or-two-post/` (3-phase shape, content-skeleton.md artifact).

**Author decisions (do not relitigate):**

- English, published on this blog. New series `mobile-debugging`, this post is #1 and the series funnel (big-question). Future entries reserved, not promised in detail: Android native toolbox, iOS native toolbox, production observability, AI-native debugging deep dive.
- Production section = **Crashlytics only** (breadcrumbs, custom keys/logs). Sentry may be name-dropped once as an alternative; no Sentry guide.
- Tool illustrations = **official screenshots downloaded from docs.flutter.dev** (CC BY 4.0) into `src/assets/images/`, renamed kebab-case, referenced relatively, with one attribution line in the post footer. No hotlinking.
- **Original-artifact rule (SDD §0)**: official screenshots do NOT count. This post's original artifacts are (a) the author's debugging decision flowchart (issue → reproduce?/production? → tool lane → structured evidence → human+AI → hypothesis → verify), and (b) a real structured-event log schema drawn from the author's own messenger/E2EE send-message flow (matches the draft's `event=message_send_failed stage=encrypt reason=session_missing` examples and the blog's existing message-systems/e2ee context).
- Narrative structure ~8-10 sections (approach C from brainstorm): keep the draft's hook and insight, cut the draft's duplication (its §4 and §10 both cover structured logging — merge), do not become a 30-tool catalog.
- Title fixed: **"Still Debugging Flutter With print()?"** (37 chars). Meta description written fresh in phase 2, 140-160 chars, concrete takeaway.
- New series requires registry/doc updates, SDD-mandated order: **SDD → `src/data/series.ts` → roadmap page** (see phase 2).

**Post outline (contract for phase 1 skeleton — refine wording, keep coverage):**

1. Hook: the manual loop (`search → guess → add print → rebuild → reproduce → search again`), Logcat noise anecdote; `> [!TIP]` thesis.
2. A tool for every question: the question→tool table (API called? Network. Widget why? Inspector. Jank? Performance+profile. Leak? Memory. Deep link? Validator. Prod-only? Crashlytics) + observe-axes flowchart. Log demoted to "one data source".
3. Network view: stop `print(response)` — captures HTTP/HTTPS/WebSocket incl. `dio`; filter query language (`m:post s:500`); startup capture via `flutter run --start-paused`.
4. Inspector: select-widget mode, guidelines, repaint rainbow, highlight oversized images (with the docs' decode-vs-display example + `cacheWidth`/`cacheHeight` fix).
5. Performance: frames chart, frame analysis tab, timeline events incl. custom `dart:developer` Timeline events; the docs' own profile-mode warning ("frame rendering times aren't indicative of release performance in debug mode").
6. Memory: `print("dispose")` proves nothing about liveness — diff snapshots, trace allocations, retaining path.
7. Deep Link Validator: short section — website config + manifest checks, Android and iOS (iOS since Flutter 3.27).
8. Production: Crashlytics breadcrumbs + custom keys/logs; stack trace answers "where it died", breadcrumbs answer "what happened before it died".
9. AI-native debugging: structured evidence beats raw logs as AI input; official **Dart & Flutter MCP server** (`dart mcp-server`, Dart 3.9+, experimental, works with Claude Code/Cursor/Gemini CLI/Copilot/Codex CLI); DevTools extensions ecosystem (`drift`, `provider`, `shared_preferences`, `patrol`; community `riverpod_devtools` exposes provider state over MCP — label community, not official). Mermaid architecture flowchart (app → VM service/DTD → DevTools + MCP → developer + AI).
10. Debugging checklist + series roadmap + close (the gap between fast and slow debuggers = who gets the right evidence faster).

**Non-negotiable fact rules (verified 2026-08-27 against live docs — re-verify links at draft time):**

- Network view records HTTP/HTTPS/WebSocket from `dart:io`, plus `dio`, `cupertino_http`, `cronet_http`, `ok_http`, and anything using `http_profile` (docs.flutter.dev/tools/devtools/network). Filter keys: `method`/`m`, `status`/`s`, `type`/`t`; example `my-endpoint m:get t:json s:200`. Startup capture: `flutter run --start-paused` or `dart run --pause-isolates-on-start --observe`.
- Inspector: oversized-image debug message format "dash.png has a display size of 213×392 but a decode size of 2130×392"; fix `Image.asset(..., cacheHeight:, cacheWidth:)`; repaint fix `RepaintBoundary`; slow animations = `timeDilation = 5.0` (docs.flutter.dev/tools/devtools/inspector).
- Performance: red overlay = janky frame over budget; profile-mode warning quoted from docs; custom events via `dart:developer` `Timeline`/`TimelineTask` (docs.flutter.dev/tools/devtools/performance).
- Memory: Profile / Diff snapshots / Trace instances tabs; retaining path and shallow-vs-retained size definitions per docs (docs.flutter.dev/tools/devtools/memory).
- Logging view aggregates Dart runtime (GC), framework events, stdout/stderr, app-level logs (docs.flutter.dev/tools/devtools/logging).
- Deep Links validator: Android **and** iOS as of Flutter 3.27; checks website config + manifest/app config (docs.flutter.dev/tools/devtools/deep-links).
- MCP server: official, **experimental**, Dart 3.9+, run `dart mcp-server`; capabilities: analyze/fix errors, resolve symbols, pub.dev search, pubspec management, introspect & interact with running apps (screenshot/tap/text/scroll), hot reload, run tests, `dart format`; clients incl. Claude Code (official Flutter plugin), Cursor, Gemini CLI, Copilot in VS Code (Dart Code v3.116+), Codex CLI (docs.flutter.dev/ai/mcp-server). Do not overstate: it is experimental and "likely to evolve quickly" — quote that.
- Crashlytics: custom logs, custom keys, breadcrumbs attach context to crash/non-fatal/ANR reports; breadcrumbs reconstruct user actions before the event (firebase.google.com/docs/crashlytics — exact child pages verified in phase 1).
- `riverpod_devtools` is a community package, NOT Flutter-official — must be labeled as such.
- Community evidence usable for the "DevTools is underused" claim: "7 Dart DevTools Features Every Flutter Developer Should Use Daily" (Level Up Coding); startdebugging.net May 2026 piece on the MCP server + Claude Code/Cursor. Verify both links in phase 1; drop rather than stretch if weak.
- Screenshot licensing: flutter.dev content is CC BY 4.0 — attribution line required in post footer. Verify the same for any Firebase screenshot (Google developer-site license) before use; if unverifiable, ship the Crashlytics section text-only.

**Image manifest (source → `src/assets/images/` local name; all under `https://docs.flutter.dev/assets/images/docs/tools/devtools/`):**

| Source file | Local name | Placement |
| --- | --- | --- |
| `network_screenshot.png` | `flutter-devtools-network-view.png` | §3 |
| `network_filter_dialog.png` | `flutter-devtools-network-filter.png` | §3 |
| `inspector_screenshot.png` | `flutter-devtools-inspector.png` | §4 |
| `debug-toggle-guidelines-repaint-1.webp` + `-2.webp` | `flutter-devtools-repaint-rainbow{-before,-after}.webp` | §4 (pair: full-screen repaint vs RepaintBoundary) |
| `debug-toggle-guidelines-oversized.png` | `flutter-devtools-oversized-image.png` | §4 |
| `flutter-frames-chart.png` | `flutter-devtools-frames-chart.png` | §5 |
| `timeline-events-tab.png` | `flutter-devtools-timeline-events.png` | §5 (swapped in for `frame-analysis-tab.png`, whose sample showed "no jank detected" — weak for the jank story) |
| `diff-tab.png` | `flutter-devtools-memory-diff.png` | §6 |
| `deep-link-validator.png` | `flutter-devtools-deep-link-validator.png` | §7 |
| (phase 1: pick 1 Crashlytics screenshot from Firebase docs, license-permitting) | `firebase-crashlytics-breadcrumbs.png` | §8 |

~10 images. Logging view screenshot skipped (low visual value); MCP section uses a mermaid flowchart, not an image.

## Goals

| # | Goal | Priority |
|---|------|----------|
| 1 | Post live: readers see each tool's value from the screenshot + one caption without leaving the page | P1 |
| 2 | Every tool claim carries an official-docs citation; zero unverified claims | P1 |
| 3 | New `mobile-debugging` series registered end-to-end (SDD → series.ts → roadmap → hub page renders) | P2 |
| 4 | Original artifacts present: author's decision flowchart + real structured-event schema | P1 |

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Citation Map, Image Harvest & Content Skeleton](./phase-01-citation-map-image-harvest-content-skeleton.md) | Pending |
| 2 | [Write the Post](./phase-02-write-the-post.md) | Pending |
| 3 | [Review Build & Publish](./phase-03-review-build-publish.md) | Pending |

## Success Criteria

- [ ] `content-skeleton.md` maps every section to citations + images + diagrams before writing starts
- [ ] All manifest images downloaded, non-empty, rendered locally; attribution line in footer
- [ ] Post builds green: `astro build --force` + `scripts/verify-post-bodies.mjs` pass; mermaid flowcharts render in light and dark
- [ ] Frontmatter valid against `src/content.config.ts`; series hub `/series/mobile-debugging/` renders with the post
- [ ] SDD changelog + `src/data/series.ts` + roadmap page updated for the new series
- [ ] Debugging checklist and series roadmap sections present; Crashlytics-only production section
- [ ] Pushed to main only after green build and user approval

## Validation Log

### Session 1 — 2026-08-27 (post-phase-2, pre-publish)

#### Verification Results
- Claims checked: 18 citations (live-fetched during phase 1) + mechanical pass: deploy workflow (`.github/workflows/deploy.yml`), title 37 chars, description 153 chars, 10/10 image files exist and match post references, all internal links (`/posts/*`, `/series/e2ee/`, `/series/message-systems/`) resolve to built pages, `astro check` 0 errors, `verify-post-bodies` 18/18, 3/3 mermaid flowcharts rendered
- Verified: all | Failed: 0 | Unverified: 0
- Tier: Standard (3 phases)

#### Decisions (interview declined by user — recommended defaults applied)
- `pubDatetime`: bump to actual push moment before commit (RSS/sitemap accuracy)
- Roadmap: Mobile Debugging stays under "Now writing" (matches sibling series pattern; post #1 publishing now)
- Commit: single commit — post + images + series registry + roadmap as one atomic publish unit; plan files may ride along

#### Code Review (subagent, 2026-08-27)
- Verdict: DONE_WITH_CONCERNS, no blockers. All C1-C18 independently re-verified live; caption numbers match pixels; animated WebP survives build; frontmatter/series/links clean.
- Fixed post-review: dio/http_profile attribution (body + Sources); intro overpromise → "every DevTools screen"; riverpod "optional bundled MCP server"; exact UI string "10 domain not verified"; inspector "layout explorer" wording; Copilot Dart Code v3.116+ gate; "than a log dump"; memory diff numbers moved into prose; network/memory alts shortened to descriptions; Q&A checklist added to §The Checklist; SDD changelog entry moved to append order; deep-link screenshot cropped 3452×2584 → 3452×700 (warning card), crop noted in attribution.
- Accepted as-is (recorded deviations): alt-text-as-caption is the site-wide pattern (no figcaption plugin — candidate future enhancement, out of scope); no FAQ section (house rule undecided, 2 of 4 big-questions have one); hook 4 paragraphs / TIP 3 sentences (voice); em-dash density, prettier formatting (14/18 existing posts also fail, no CI gate), tiny repaint-pair renders (official doc assets); SDD §2 pillar map missing realtime/ios/mobile-debugging rows (pre-existing pattern, changelog carries the decision).
- Rebuild after fixes: green, verify-post-bodies 18/18.

#### Whole-Plan Consistency Sweep
- plan.md ↔ phase files ↔ content-skeleton.md re-checked: image manifest reflects the timeline-events swap (frame-analysis dropped); C11 narrowed to provider/shared_preferences; C17 riverpod_devtools verified/community-labeled; §8 text-only confirmed. No stale terms or contradictions. Phases 1-2 checked done via `ak plan check`; phase 3 pending (publish gate).

<!-- slug: flutter-debugging-toolbox-post -->
