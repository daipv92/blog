---
title: "Half Flutter Half Native: Who Owns Navigation Mid-Migration post"
description: "Write and publish mobile-architecture #4: 'Half Flutter, Half Native: Who Owns Navigation Mid-Migration?' — Flutter→native incremental migration, destination contract + host router, physical stack strategies, back/results/deep links, migrate-by-flow."
status: completed
priority: P2
branch: "main"
tags: [content, mobile-architecture, flutter, add-to-app, blog-post]
blockedBy: []
blocks: []
created: "2026-08-16T01:02:30.211Z"
createdBy: "ck:plan"
source: skill
---

# Half Flutter Half Native: Who Owns Navigation Mid-Migration post

## Overview

Publish English post **"Half Flutter, Half Native: Who Owns Navigation Mid-Migration?"** — `series: mobile-architecture`, `seriesOrder: 4`, `articleType: big-question`. Follows the token post (seriesOrder 3, same real app, same narrative device: wrong question → reveals → invariant → FAQ → ladder).

- Brainstorm (approved design, outline §5, artifacts §6, titles §7, fact-check flags §8, footer reference list §9, decisions §10): `/Users/vsf/Documents/research/web/plans/reports/brainstorm-260816-0730-flutter-native-hybrid-navigation-article-report.md`
- Researcher sub-reports (same folder): `research-260816-0730-flutter-addtoapp-navigation-internals-report.md`, `researcher-260816-0730-hybrid-stack-libraries-flutterboost-thrio-report.md`, `researcher-260816-0730-big-app-flutter-migration-case-studies-report.md`, `researcher-260816-0730-cross-framework-hybrid-navigation-analogs-report.md`
- Style contract: `../docs/website-content-sdd.md` (§3 style guide, original-artifact rule, honesty rule) + structure of `src/content/posts/how-does-a-flutter-module-get-a-token-from-the-native-host.md`

**User decisions (do not relitigate):**
- Angle **B**: destination contract as the *seam* → three physical-stack strategies (S1 single engine + container per page / S2 engine per Flutter island via `FlutterEngineGroup` / S3 Flutter shell owns stack) → "back is the real problem" table → measured/derived cost → invariant + migrate-by-flow.
- Real app strategy **undecided** → S3 (Flutter shell owns stack) today; **S1 vs S2 left open in the article** — present the trade-off table + the criteria the team will decide on, list it in the honesty section; explicit assumptions; **no fabricated "we shipped" claims or invented measurements**. <!-- Updated: Validation Session 1 - S1 vs S2 left open -->
- Original artifacts: (1) `AppDestination` contract + ownership table + host router code in **Dart + Kotlin + Swift** (redacted, token-post naming), (2) hop-count table for two migration orders on **illustrative flows derived from the app map in the outline, labeled as such** (author did not supply a real flow list), (3) physical-stack diagram of the Group Setting → Chat Detail → User Profile flow. Engine benchmark deferred to a future deep dive. <!-- Updated: Validation Session 1 -->
- Title fixed. Write EN directly (no VN draft). Push to main pre-authorized after green build.
- References: inline links at each claim **plus** a `## References` footer grouped as brainstorm §9. Next-in-series footer promises the **data-layer post** (keeps the token post's promise). Token post footer gets a minimal one-sentence link to this post, data-layer sentence kept. <!-- Updated: Validation Session 1 -->

**Non-negotiable fact corrections** (brainstorm §8): Flutter 2.0 = 2021-03-03 (FlutterEngineGroup, "~180kB"); `PopScope` = Flutter 3.16 (Nov 2023); do not cite Impeller/3.3 dates from sub-report; Nuvigator is Flutter-only (not hybrid nav); thrio memory numbers = "README claim"; drop BMW/Toyota/eBay (greenfield); Airbnb "220 screens" unverified — omit.

**Verified verbatim quotes available:** GPay 2020-09-18 "tried a hybrid approach … clean rewrite as it was not scalable"; Airbnb 2018 "Hybrid apps are hard…"; Airbnb RN p90 first render 280 ms iOS / 440 ms Android + 50 ms delay; flutter#15559 xster 2018-03-15 "long-term solution is option 4… low-ish cost solution for now like option 2"; Flutter 2.0 blog "reduced the static memory cost… by ~99% to ~180kB per instance"; docs "hybrid mixture of native -> Flutter -> native -> Flutter"; Nubank 2021 "mixed state (native, React Native, and Flutter)… platform team… crucial".

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Content Skeleton Citation Map & Artifacts](./phase-01-content-skeleton-citation-map-artifacts.md) | Completed |
| 2 | [Write the Post](./phase-02-write-the-post.md) | Completed |
| 3 | [Review Build & Publish](./phase-03-review-build-publish.md) | Completed |

## Acceptance Criteria

- Post at `src/content/posts/half-flutter-half-native-who-owns-navigation-mid-migration.md`; frontmatter valid against `src/content.config.ts` (`series: mobile-architecture` exists in `src/data/series.ts`; `articleType: big-question`); `## References` footer present.
- All 12 outline sections (brainstorm §5) present; ≥3 original artifacts (contract code, hop-count table, physical-stack diagram); every external claim carries a URL from brainstorm §9; all §8 corrections respected; "What's still broken/undecided" section present.
- Voice/structure matches token post: hook ≤3 paragraphs → `> [!TIP]` thesis → `## Table of contents` → reveals → invariant → FAQ → ladder mermaid → next-in-series footer; mermaid flowcharts only, each followed by a prose reading; tables for comparisons; ~3,000–3,800 words.
- Token post footer: one sentence linking to this post added, data-layer sentence kept.
- `pnpm build` green incl. `scripts/verify-post-bodies.mjs`; post listed under `/series/mobile-architecture/`; commit + push to main; production body verified non-empty.

## Dependencies

None. Series already registered; no code changes outside content. Prior post plans (`260813-*`) are done.

## Validation Log

### Session 1 — 2026-08-16
**Trigger:** `/ck:plan validate` selected at post-plan handoff after plan creation
**Questions asked:** 6

### Verification Results
- Claims checked: 12 (schema fields/enum, series slug, verify-post-bodies script + build chain, token post footer + TIP/ToC pattern, 5 report files, `/series/[series]` route, post slug free, SDD path + mermaid constraint, quotes in brainstorm report)
- Verified: 12 | Failed: 0 | Unverified: 0
- Tier: Standard (3 phases)

### Decisions
| # | Question | Decision |
|---|----------|----------|
| 1 | Hop-count table flow source | Illustrative flows derived from the outline's app map, labeled "illustrative"; assumptions stated |
| 2 | Contract code languages | Dart + Kotlin + Swift (as token post) |
| 3 | References presentation | Inline links + `## References` footer grouped per brainstorm §9 |
| 4 | Target stack strategy in article | Leave S1 vs S2 open; present trade-offs + decision criteria; honesty section lists it as undecided |
| 5 | Next-in-series footer | Data-layer post (keeps token post promise) |
| 6 | Token post footer | Minimal edit: add one sentence linking to this post, keep data-layer sentence |

### Whole-Plan Consistency Sweep
- Replaced "S2 target / converging on S2" wording in plan.md, phase-01 (step 5 flip diagram, risk note), phase-02 (section 6, honesty section) with "S1 vs S2 open".
- Phase-02 step 4 References footer: optional → required. Phase-01 step 4 hop table: illustrative label required. Phase-02 section 12 footer: data-layer post. Phase-03 token footer wording aligned.
- No remaining contradictions found.
