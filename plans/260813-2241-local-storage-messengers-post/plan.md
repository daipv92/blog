---
title: "Mobile Architecture #2: Local Storage — How Messengers Store Millions of Messages post"
description: "Write and publish mobile-architecture series #2: local storage landscape + how Telegram, Messenger, Signal, WhatsApp store messages"
status: done
priority: P2
branch: "main"
tags: [content, mobile-architecture, blog-post]
blockedBy: []
blocks: []
created: "2026-08-13T15:44:31.914Z"
createdBy: "ck:plan"
source: skill
---

# Mobile Architecture #2: Local Storage — How Messengers Store Millions of Messages post

## Overview

Publish English post on local storage choice for mobile apps — key-value vs structured DB vs files vs secure storage — proven through how Telegram, Messenger, Signal, WhatsApp actually store messages. `series: mobile-architecture`, `seriesOrder: 2`, `articleType: big-question`. Funnel post 1 of 3 (post 2: DB in Flutter vs native core; post 3: Realm→Native migration case study).

- Brainstorm + full fact-check (all claims, verdicts, primary-source URLs): `plans/reports/brainstorm-260813-2241-local-storage-post-fact-check-report.md`

**User decisions (do not relitigate):** series `mobile-architecture` #2; big-question title + 4 apps; English; Realm→Native case = decision-criterion ⑥ + short teaser only (draft sections 11–13 deferred to posts 2–3).

**Non-negotiable corrections (from fact-check):**
1. Telegram: flagship apps do NOT use TDLib. Android = `MessagesStorage.java` (own SQLite via JNI); iOS = Postbox custom engine + SQLCipher; TDLib (SQLite+SQLCipher inside) powers Telegram X + third-party clients. Frame as "Telegram wrote its storage engine three times — persistence always lives in a core below the UI."
2. Messenger: "universal system" and the MSYS sentence are exact quotes from engineering.fb.com (2020-03-02); "single source of truth" is NOT in the article — paraphrase or attribute to SED podcast #1037.
3. Realm: deprecated (announced 2024-09-09), NOT archived; Atlas Device Sync off after 2025-09-30; local-only = v20 or `community` branch. Never write "Realm is dead."
4. WhatsApp: SQLite (msgstore.db, wa.db) is forensic-grade evidence only, no official engineering publication — mark ★★ in the evidence table.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Citation Map & Content Skeleton](./phase-01-citation-map-content-skeleton.md) | Done |
| 2 | [Write the Post](./phase-02-write-the-post.md) | Done |
| 3 | [Review Build & Publish Prep](./phase-03-review-build-publish-prep.md) | Done |

## Acceptance Criteria

- Post file at `src/content/posts/how-do-messengers-store-millions-of-messages.md`, frontmatter valid against `src/content.config.ts` (`series: mobile-architecture`, `seriesOrder: 2`, `articleType: big-question`).
- All 4 corrections reflected; every historical/architectural claim traces to a source in the brainstorm report; evidence-confidence table (★★★/★★) included.
- Voice/structure matches existing big-question posts (TIP thesis blockquote, `## Table of contents` marker, mermaid + prose description, FAQ, better-question close, next-in-series footer).
- Post 1 of series (`what-architecture-layers-does-a-mobile-app-need.md`) footer updated so the series sequence stays coherent (currently promises a case study as next).
- `pnpm build` passes including `scripts/verify-post-bodies.mjs`; deploy verified per memory note (Cloudflare hosted build unreliable — verify after push).

## Dependencies

None blocking. `mobile-architecture` series already registered in `src/data/series.ts` — no code changes. Prior plans both `done`.

## Validation Log

### Session 1 — 2026-08-13
**Trigger:** `/ck:plan validate` selected at post-plan handoff after plan creation
**Questions asked:** 4

### Verification Results
- Claims checked: 10 (content.config schema incl. `big-question` enum + series validation, series.ts registration, verify-post-bodies.mjs + build chain, sibling-post FAQ/TIP/ToC structure, post-1 footer line, slug collision, reports paths)
- Verified: 10 | Failed: 0 | Unverified: 0
- Tier: Standard (3 phases)
- Failures: none

#### Questions & Answers

1. **[Naming]** English title?
   - **Answer:** "What Should a Mobile App Use for Local Storage? How Telegram, Messenger and Signal Store Millions of Messages" (faithful big-question, matches e2ee sibling rhythm).
2. **[Naming]** Slug?
   - **Answer:** `how-do-messengers-store-millions-of-messages` — mirrors sibling `how-do-messengers-really-encrypt-your-messages`.
3. **[Scope]** Push policy in Phase 3?
   - **Answer:** Commit + push immediately; push to main pre-authorized by this validation. Then verify live URL; wrangler fallback if hosted build fails.
4. **[Scope]** Series post 1 footer?
   - **Answer:** Point next to this storage post; demote message-engine case study to "later in the series" — keep the old promise, reordered.

#### Confirmed Decisions
- Title + slug locked as above; post file: `src/content/posts/how-do-messengers-store-millions-of-messages.md`.
- Phase 3 has no push confirmation gate.
- Post-1 footer keeps case-study mention as "later in the series".

### Whole-Plan Consistency Sweep
- Swept `plan.md` + all 3 phase files after propagation: no `<chosen-slug>` placeholders, no leftover title-candidate steps, no "Open Questions" section, push-gate language reconciled in Phase 3. Zero unresolved contradictions.
