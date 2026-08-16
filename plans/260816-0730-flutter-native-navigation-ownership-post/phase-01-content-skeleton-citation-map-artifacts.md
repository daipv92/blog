---
phase: 1
title: "Content Skeleton Citation Map & Artifacts"
status: completed
effort: "S"
---

# Phase 1: Content Skeleton Citation Map & Artifacts

## Overview

Produce `content-skeleton.md` in this plan dir: the writing contract for Phase 2 — section-by-section skeleton (12 sections from brainstorm §5) with anchor claims + verified URLs, the three original artifacts drafted, diagrams sketched, and the FAQ list. No new web research unless a gap is found; everything needed is in the brainstorm report and the 4 sub-reports.

## Requirements

- Every external claim/date/number in the skeleton carries a URL from brainstorm §9 (or a sub-report), and respects §8 corrections.
- Artifacts are the author's own material: contract code shaped like the real app (redacted names OK; Dart + Kotlin + Swift), hop-count table over **illustrative flows derived from the outline's app map (label it so)**, physical-stack diagram of the flow. Where the real design is still undecided (S1 vs S2), the skeleton presents trade-offs + decision criteria — never past tense "we shipped". <!-- Updated: Validation Session 1 -->
- House style per `docs/website-content-sdd.md` §3 and the token post.

## Related Code Files

- Create: `plans/260816-0730-flutter-native-navigation-ownership-post/content-skeleton.md`
- Read: brainstorm report + 4 sub-reports (paths in `plan.md`); `src/content/posts/how-does-a-flutter-module-get-a-token-from-the-native-host.md` (style + the `packages/**` / host structure to stay consistent); `src/data/series.ts`

## Implementation Steps

1. **Section map** — for each of the 12 outline sections (hook · two navigation worlds · the easy answer · Reveal 1 contract · Reveal 2 who holds the stack · Reveal 3 back · what it costs · invariant + migration order · what's still broken · FAQ · ladder · next-in-series): H2 title (question/claim style), 1-line purpose, anchor claims with URL, target word count.
2. **Thesis** — draft the `> [!TIP]` sentence: features ask for a Destination; the host resolves owner and owns the physical stack + back between islands; hops per flow (not screens migrated) is what the migration order must minimise. Draft the closing "the question was wrong in N words" paragraph mirroring the token post ("Who owns navigation?" → *nobody* today; the answer is a table + a stack owner, not a channel).
3. **Artifact 1 — contract code**: Pigeon-style `AppDestination` sealed class (Dart) + Kotlin/Swift mirror, `NavigationHost`/`AppNavigator` API (`open(destination)`, `close(result)`), host ownership table (`ThreadList→Flutter, ChatDetail→Native, GroupSetting→Flutter, UserProfile→Flutter` today / 6-month / 12-month diff view), host router resolve pseudo-code for both directions (Flutter→host→Native, Native→host→Flutter island with `initialRoute`/`pushRoute`). Keep names consistent with token post (`host_contracts`, composition root, platform team).
4. **Artifact 2 — hop-count table** (illustrative, derived from the outline's app map — say so in the caption): list ~8–10 user flows (Group Setting → Member → Chat Detail → User Profile; Thread List → Chat Detail → Group Setting; notification deep link → Chat Detail; Contact → User Profile → Chat Detail; Settings flows …). For two migration orders — (a) screen-by-screen as originally planned (Chat Detail first), (b) flow-by-flow (chat surface + its leaves together) — count Flutter↔Native crossings per flow at the mid-migration checkpoint. Present as one table + 2-line reading. Mark assumptions (which screens are native at the checkpoint).
5. **Artifact 3 — physical-stack diagram**: mermaid flowchart of `[FlutterContainer A: Main→GroupSetting→MemberList] [NativeChatDetail] [FlutterContainer B: UserProfile]` with back arrows and who handles each back (island Navigator vs host). Sketch a second small diagram for the ownership flip (S3 today → root swap → native-owned containers, with the S1/S2 choice shown as an open branch). <!-- Updated: Validation Session 1 -->
6. **Other diagrams**: (a) two navigation worlds (Flutter Navigator stack vs native stack side by side), (b) request → host router → resolve owner → Flutter router | Native router, (c) ladder mermaid for the close. Flowcharts only (dark-mode constraint).
7. **Comparison tables**: S1/S2/S3 strategies (owner · engines · Navigator shape · back · cost · who uses it); back/results/deep-link/state/transition/ownership-flip decision table (brainstorm §3.4); case-study mini-table (Xianyu/FlutterBoost, GPay quote, Airbnb quote + numbers, Nubank quote, Betterment, cult.fit, ByteDance, Shopify) with URLs.
8. **FAQ list** (4–5): Why not FlutterBoost/thrio? Why not one engine + flattened Navigator? Pigeon vs `go_router`/`pushRoute` strings? Tabs = islands? What if we never finish (hybrid forever)?
9. **Gap check** — any claim without URL → resolve from sub-reports or cut. Flag anything that would need a real measurement and phrase as "not measured yet" (honesty section) rather than inventing a number.

## Success Criteria

- [x] `content-skeleton.md` covers all 12 sections; each has ≥1 anchor claim with URL or is explicitly author-experience.
- [x] Artifacts 1–3 drafted in the skeleton (code compiles conceptually; hop table has illustrative flows from the outline app map + stated assumptions; diagram nodes written).
- [x] All §8 corrections applied; no BMW/Toyota/eBay/Nuvigator-as-hybrid usage.
- [x] Verbatim quotes copied exactly as verified in `plan.md`.

## Risk Assessment

- Real app design undecided (S1 vs S2 open) → risk of drifting into hypothetical "we did X". Mitigation: skeleton labels each artifact as *current / option / assumption*; the S1-vs-S2 section ends with the criteria the team will use, not a verdict. <!-- Updated: Validation Session 1 -->
- Hop-count table is built from screens named in the outline and marked "illustrative flows from our app map" (author decision) — do not invent traffic numbers.
