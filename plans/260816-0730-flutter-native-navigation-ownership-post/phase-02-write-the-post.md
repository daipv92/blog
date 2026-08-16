---
phase: 2
title: "Write the Post"
status: completed
effort: "M"
---

# Phase 2: Write the Post

## Overview

Write the full English post from the Phase 1 skeleton: ~3,000–3,800 words, 12 sections, token-post voice, all external claims linked, three original artifacts embedded, honesty section included.

## Requirements

- Functional: complete markdown post, valid frontmatter, mermaid flowcharts render, `## Table of contents` marker present.
- Non-functional: first-person, evidence-driven; numbers over adjectives; each mermaid followed by a prose reading (house pattern); code blocks Dart + Kotlin + Swift where the contract is shown; no plan/audit labels in the text.

## Architecture

Frontmatter (validated by `src/content.config.ts`):

```yaml
---
title: "Half Flutter, Half Native: Who Owns Navigation Mid-Migration?"
description: "Migrating a Flutter app to native screen by screen leaves two back stacks. A destination contract, a host router, and a decision about who holds the physical stack — and why back, not push, is the hard part."
pubDatetime: <set at publish time, ISO>
featured: false
draft: false
tags:
  - flutter
  - add-to-app
  - navigation
  - migration
  - mobile-architecture
series: mobile-architecture
seriesOrder: 4
articleType: big-question
---
```

Section order (from brainstorm §5; H2 wording final in skeleton):
1. Hook — the real 3-hop flow; "how does Flutter open a native screen" is five lines (`pushRoute`/Pigeon) and not the question; intro links the token post + series big question (SDD internal-linking rule).
2. `> [!TIP]` thesis · `## Table of contents`
3. Two navigation worlds (diagram a; flutter#15559 as "8 years old").
4. The easy answer — `openNativeChatDetail` / `openFlutterViewController(route:)` = coupling to migration state.
5. Reveal 1 — the contract + ownership table (Artifact 1; Strangler Fig / Branch by Abstraction; Android multi-module guidance; DeepLinkDispatch/ARouter; diagram b).
6. Reveal 2 — the contract doesn't say who holds the stack: S1/S2/S3 table; Google 2018 (#15559 quote) vs 2021 (Flutter 2.0 ~180kB quote; docs "hybrid mixture" quote); FlutterBoost lineage; where our app is (S3 today; root swap coming; **S1 vs S2 still open — give the trade-offs and the criteria we will decide on, no verdict**). <!-- Updated: Validation Session 1 -->
7. Reveal 3 — back is the real problem: Artifact 3 diagram; back/results/deep-link/state/transition/flip table; `PopScope` + `SystemNavigator.pop` (iOS caveat #71832), `interactivePopGestureRecognizer` (#64616), nested Navigator (#103028/#145159), isolates (#115533) → state in host (link token post).
8. What it costs — Artifact 2 hop-count table (illustrative flows, labeled); engine cold vs warm attach as *documented* ranges (docs performance page), explicitly "not measured on our app yet".
9. The invariant + migration order — GPay + Airbnb quotes as the warning; Betterment 2 yrs / Xianyu years as horizon; migrate by flow.
10. What's still broken / undecided for us (SDD honesty rule) — includes "S1 vs S2 not decided", root-swap release, iOS swipe-back inside islands, cold island first frame, no measurements yet.
11. FAQ (4–5 from skeleton).
12. Ladder mermaid + "the question was wrong" close + next-in-series footer promising the **data-layer post** ("should the database live in Flutter or in a native core?"). Then `## References` footer grouped per brainstorm §9. <!-- Updated: Validation Session 1 -->

## Related Code Files

- Create: `src/content/posts/half-flutter-half-native-who-owns-navigation-mid-migration.md`
- Read: `plans/260816-0730-flutter-native-navigation-ownership-post/content-skeleton.md`; token post for voice

## Implementation Steps

1. Write frontmatter + hook + TIP + ToC marker.
2. Write sections 3–9 from the skeleton, embedding Artifacts 1–3 and the tables; add the prose reading after each mermaid.
3. Write §10 honesty section, FAQ, ladder, close, footer.
4. Insert reference links inline (markdown links on the claim) **and** add a `## References` footer grouped as brainstorm §9 (Official Flutter · GitHub issues · Hybrid-stack libraries · Case studies · Analogs) — required. <!-- Updated: Validation Session 1 -->
5. Self-review against `plan.md` acceptance criteria and §8 corrections; word count; ensure no invented measurement.

## Success Criteria

- [x] Post file exists, frontmatter valid, all 12 sections present in order, `## References` footer present.
- [x] Artifacts 1–3 embedded; ≥6 external sources linked inline incl. the 4 verbatim quotes.
- [x] Every mermaid is a flowchart and has a prose reading; `## Table of contents` present.
- [x] Honesty section names ≥3 open problems incl. S1-vs-S2 undecided; no "we shipped" claims for undecided parts.
- [x] 3,000–3,800 words (3,496 prose + ~840 in tables; code blocks excluded).

## Risk Assessment

- Length creep (topic is wide) → keep S1/S2/S3 and back-table as tables, not prose; FAQ absorbs tangents (FlutterBoost/thrio comparison).
- Tone drift into tutorial → every code block must serve the ownership argument, not teach the API.
