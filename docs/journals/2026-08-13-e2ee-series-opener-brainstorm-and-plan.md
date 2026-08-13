# E2EE Series Opener Post Planning Session

**Date**: 2026-08-13  
**Severity**: Routine  
**Component**: Blog content—e2ee series opener post  
**Status**: Approved, plan ready for /ck:cook implementation

## What Happened

Completed brainstorm and planning session for the e2ee series opener: *"How Do Messengers Really Encrypt Your Messages?"* — a funnel post examining Signal, WhatsApp, Telegram, and Messenger's competing E2EE strategies against the original big-question requirement already registered in `src/data/series.ts`.

Initial outline was Vietnamese (7-part arc: threat model, Signal Protocol deep-dive, WhatsApp's variant, Telegram's selective approach, Messenger's incomplete rollout, Instagram/secondary services, FAQ). User decision: translate to English and adapt to house style (consistent with all-published posts). Design approved: 13 sections, ~5,000+ words, FAQ included, big-question opener pattern.

**Source verification**: Researcher agent fact-checked outline against primary sources → 4 corrections identified (detailed below), 0 unresolved claims.

## Key Technical Corrections

1. **Messenger E2EE rollout**: Announced December 2023 but never completed; June 2024 survey showed ~33% adoption. Post must frame as "ongoing transition," not default-ready.
2. **Telegram multi-device claim**: TRUE only for non-E2EE Cloud Chats (synced to 4 devices). Secret Chats (E2EE) are single-device-pair only—no desktop, no groups, no multi-device sync. Common misconception to clarify.
3. **Secret Conversations timeline**: Beta launched July 2016, full rollout October 2016. Post was conflating announcement date with availability.
4. **Instagram DMs confusion**: Never had default E2EE; opt-in E2EE was removed May 2026. Keep separate from Messenger evolution (Instagram/Messenger are distinct services despite shared parent).

**Bonus threat-model thread**: Sen. Wyden's December 2023 push-notification metadata story (Apple/Google leak user safety-signal state). Adds real-world pressure context to the "why encryption matters" section.

## Plan & Validation

Plan created at `plans/260813-2028-e2ee-series-opener-post/` with 3 phases:
1. Citation map & skeleton  
2. Write post (apply corrections, evidence-weave, FAQ)  
3. Review, build & publish  

Dependencies: phase 1 gates 2; 2 gates 3.

**/ck:plan validate sweep**: 7/7 key claims verified against repo and primary sources (researcher report + plan docs), 0 failed. All schema consistency checks passed.

**Interview decisions (3 locked)**:
- Slug: `how-do-messengers-really-encrypt-your-messages` (short, SEO-friendly, differentiates from Signal Protocol deep-dive).
- Push strategy: Direct commit + push to main (pre-authorized per user decision). Local build gate + post-deploy body verification (Playwright/Chromium) mitigates review risk.
- Next-in-series footer: Point to Messenger migration case study (opt-in ➜ default E2EE), not Signal Protocol deep-dive (saves that for series #3 if scope permits).

## Reports

- Brainstorm report: `plans/reports/brainstorm-260813-2028-e2ee-funnel-post-report.md`  
- Researcher fact-check: `plans/reports/researcher-260813-2028-e2ee-fact-check-report.md`  
- Full plan: `plans/260813-2028-e2ee-series-opener-post/plan.md`  

## Decision Rationale

**Language choice (Vietnamese → English)**: All published posts are English; series hub will order this as opener #1. Consistency outweighs cultural relevance of bilingual. Outline structure + big-question framing port cleanly.

**Fact-check-before-write workflow**: Mirrors the scroll-jank post success (researcher sprint caught 4 items before drafting began). Prevents post-publish corrections and strengthens credibility for a technical topic (E2EE is security-adjacent; mistakes damage trust).

**Push pre-authorization trade-off**: Speed (commit Friday, live by weekend) vs. review gate (Thursday approval cycle). Mitigated by: (1) researcher validation pre-write, (2) local build gate catches rendering failures (Playwright/Chromium miss), (3) post-deploy body-check script runs on Cloudflare (catches empty-body builds). Acceptable risk for this topic.

---

**Status**: DONE  
**Summary**: Brainstorm and plan complete with 4 fact-check corrections integrated. Plan validated, 3 interview decisions locked. Ready for /ck:cook implementation.  
**Concerns**: None—E2EE series now aligned with house style and evidence standard.
