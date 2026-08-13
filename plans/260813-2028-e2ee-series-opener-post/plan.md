---
title: "E2EE Series Opener: How Messengers Encrypt Your Messages post"
description: "Write and publish the e2ee series opener: 'WhatsApp, Signal, Messenger, Telegram: How Do They Really Encrypt Your Messages?'"
status: done
priority: P2
branch: "main"
tags: [content, e2ee, blog-post]
blockedBy: []
blocks: []
created: "2026-08-13T13:37:06.859Z"
createdBy: "ck:plan"
source: skill
---

# E2EE Series Opener: How Messengers Encrypt Your Messages post

## Overview

Publish English post **"WhatsApp, Signal, Messenger, Telegram: How Do They Really Encrypt Your Messages?"** — `series: e2ee`, `seriesOrder: 1`, `articleType: big-question`. Funnel/hub post opening the already-registered `e2ee` series; adapted from the user's approved Vietnamese outline.

- Brainstorm (approved 13-section design, decisions, corrections): `plans/reports/brainstorm-260813-2028-e2ee-funnel-post-report.md`
- Fact-check (all claims + primary-source URLs, 4 corrections): `plans/reports/researcher-260813-2028-e2ee-fact-check-report.md`

**User decisions (do not relitigate):** English; adapt to house style keeping the outline's 7-part arc; full ~5,000+ words; FAQ section included; design approved 2026-08-13.

**Non-negotiable corrections** (from fact-check):
1. Messenger default E2EE: "announced Dec 2023, rollout stretched into 2024+" — never "completed".
2. Telegram multi-device: Cloud Chats only; Secret Chats = single device pair, no Desktop/Web, no groups, lost on logout.
3. Secret Conversations: beta July 2016, full rollout October 2016 — cite the right one.
4. No Instagram conflation: one-line disambiguation max (never default E2EE; opt-in removed May 2026).

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Citation Map & Content Skeleton](./phase-01-citation-map-content-skeleton.md) | Done |
| 2 | [Write the Post](./phase-02-write-the-post.md) | Done |
| 3 | [Review Build & Publish Prep](./phase-03-review-build-publish-prep.md) | Done |

## Acceptance Criteria

- Post file at `src/content/posts/how-do-messengers-really-encrypt-your-messages.md`, frontmatter valid against `src/content.config.ts`.
- All 13 approved sections present; all 4 corrections reflected; zero unsourced historical claims.
- Voice/structure matches existing big-question openers (TIP thesis, ToC marker, sourced evidence, mermaid + prose description, FAQ, better-question close, next-in-series footer).
- `pnpm build` passes including `scripts/verify-post-bodies.mjs`; mermaid diagrams render non-empty.

## Dependencies

None. Prior plan `260813-0640-scroll-jank-frame-pipeline-post` is done; `e2ee` series already registered in `src/data/series.ts` — no code changes needed.

## Validation Log

### Session 1 — 2026-08-13
**Trigger:** `/ck:plan validate` selected at post-plan handoff after plan creation
**Questions asked:** 3

### Verification Results
- Claims checked: 7 (file paths, build chain, schema, series slug, route, reports)
- Verified: 7 | Failed: 0 | Unverified: 0
- Tier: Standard (3 phases)
- Failures: none

#### Questions & Answers

1. **[Scope/Naming]** Slug/URL của bài viết (tên file trong `src/content/posts/`)?
   - Options: how-do-messengers-really-encrypt-your-messages (Recommended) | Full-title slug
   - **Answer:** how-do-messengers-really-encrypt-your-messages
   - **Rationale:** Readable URL; strict full-title kebab would be unwieldy for this 4-app title.

2. **[Scope]** Cuối Phase 3, sau khi build xanh và commit — xử lý push/deploy thế nào?
   - Options: Commit, chờ xác nhận push (Recommended) | Commit + push luôn | draft:true trước
   - **Answer:** Commit + push luôn
   - **Rationale:** User pre-authorizes push to main; Cloudflare hosted build deploys ~1 minute after push. Phase 3 loses the user-confirmation push gate and gains a post-deploy verification step.

3. **[Assumptions]** Footer `_Next in this series:_` trỏ tới bài nào (bài #2 của series e2ee)?
   - Options: Signal Protocol deep-dive (Recommended) | Messenger migration case study | Để generic
   - **Answer:** Messenger migration case study
   - **Rationale:** Series #2 continues the product/engineering thread ("why default E2EE took Messenger years") instead of going crypto-deep first.

#### Confirmed Decisions
- Slug: `how-do-messengers-really-encrypt-your-messages` — unchanged from plan.
- Publish: commit + push in Phase 3 without a further user gate — push is pre-authorized by this validation.
- Next-in-series footer: Messenger migration case study.

#### Impact on Phases
- Phase 2: step 7 footer target changed Signal-Protocol → Messenger case study.
- Phase 3: step 6 commits AND pushes; success criteria updated; add post-deploy verification.

### Whole-Plan Consistency Sweep
- Swept `plan.md` + all 3 phase files for "Signal Protocol deep-dive" footer references and "push gate" language after propagation; both updated. No stale terms, no contradictions remaining.
