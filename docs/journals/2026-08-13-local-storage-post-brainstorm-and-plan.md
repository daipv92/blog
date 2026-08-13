# Local Storage Post Planning Session

**Date**: 2026-08-13  
**Severity**: Routine  
**Component**: Blog content—mobile-architecture series #2 post  
**Status**: Approved, plan ready for /ck:cook implementation

## What Happened

Completed brainstorm and planning session for the mobile-architecture series funnel post #1: *"What Should a Mobile App Use for Local Storage? How Telegram, Messenger and Signal Store Millions of Messages"* — a big-question post examining storage architecture choices through how real flagship apps (Telegram, Messenger, Signal, WhatsApp) actually persist messages.

Series context: funnel entry to a 3-post arc ending in the user's Realm Flutter → Native migration case study. Decision scope: English, `seriesOrder: 2` under `mobile-architecture`, Realm case deferred to posts 2–3 (post 1 focuses on storage landscape + 4 apps as decision evidence).

**Source verification**: Three parallel researcher agents fact-checked all claims against primary sources (GitHub repos, engineering blogs, API docs, forensic tools). One researcher hit ECONNRESET mid-fact-check and was resumed from transcript—resumption completed successfully. Result: 10 claims verified, 0 unresolved, 4 major corrections integrated.

## Key Technical Correction (The Main Save)

**Telegram flagship apps do NOT use TDLib.**

Draft claimed: "Telegram uses TDLib for storage, encryption, and consistency."

Reality: 
- **Android**: `MessagesStorage.java` (own SQLite implementation via JNI), zero TDLib dependency  
- **iOS**: Custom `Postbox` storage engine + SQLCipher submodule, zero TDLib submodule  
- **TDLib (SQLite + SQLCipher inside)**: Powers only Telegram X (Android) and third-party clients

This error would have damaged credibility on a technical post. Reframing saved the thesis: "Telegram wrote its storage engine three times — persistence always lives in a core below the UI" is now true, architecturally cleaner, and stronger than the original claim.

## Verdict Summary (All Other Claims)

| App | Storage | Evidence | Grade |
|---|---|---|---|
| Messenger/LightSpeed | SQLite + stored procedures (CG/SQL) + MSYS orchestration | engineering.fb.com blog (2020) + open engineering.fb.com/open-source article | ★★★ |
| Messenger "single source of truth" | Quote appears in SED podcast #1037 (2020-03), NOT Meta's written article | Must paraphrase or attribute to podcast, not Meta's official wording | Citation fix |
| Signal Android/iOS | SQLCipher-encrypted SQLite; attachments as encrypted blobs; iOS adds GRDB.swift | signal.org blog (2020-01-13) + GitHub source verification | ★★★ |
| WhatsApp Android | SQLite (msgstore.db, wa.db) observed in forensics; no official engineering publication | Magnet Forensics artifact profile, Group-IB forensics, public parsers | ★★ |
| Android guidance | DataStore (modern key-value), Room (structured DB with integrity) | developer.android.com pages verified | ★★★ |
| Realm lifecycle | Deprecated 2024-09-09; Atlas Device Sync off 2025-09-30; local-only via v20 / `community` branch (NOT archived) | realm-dart GitHub + pub.dev notice | ★★★ |

## Plan & Validation

Plan created at `plans/260813-2241-local-storage-messengers-post/` with 3 phases:
1. Citation map & content skeleton  
2. Write post (4 corrections applied, evidence-weave, FAQ)  
3. Review, build & publish  

Dependencies: phase 1 gates 2; 2 gates 3.

**/ck:plan validate sweep**: 10/10 key claims verified (schema, slug collision, build chain, series.ts registration, sibling-post footer coherence), 0 failed. All consistency checks passed.

**Interview decisions (4 locked)**:
- Title: "What Should a Mobile App Use for Local Storage? How Telegram, Messenger and Signal Store Millions of Messages" (big-question, symmetry with e2ee sibling).
- Slug: `how-do-messengers-store-millions-of-messages`.
- Push strategy: Commit + push to main (pre-authorized per user decision). Local build gate + post-deploy Cloudflare verification mitigates risk.
- Post-1 footer: Keep case-study mention but reorder it to "later in the series" (maintains promise, unblocks this post from needing case-study completion).

## Reports

- Brainstorm + fact-check report: `plans/reports/brainstorm-260813-2241-local-storage-post-fact-check-report.md`  
- Full plan: `plans/260813-2241-local-storage-messengers-post/plan.md`  

## Decision Rationale

**Fact-check-before-write workflow**: Mirrors the scroll-jank post success. The Telegram correction exemplifies why this matters: publishing without verification would have destroyed post credibility on a technical topic. Catching it during brainstorm means reframing happens at thesis level, not in post-publish corrections.

**Reframing as a win**: Rather than rewriting around TDLib removal, the correction led to a stronger argument ("Telegram wrote its storage engine three times") that's architecturally truer and more interesting. Sometimes the best outcome of fact-checking is not a simple fix but a better angle.

**Parallel researcher recovery**: ECONNRESET during fact-check (network failure mid-session) could have delayed work, but resumption from transcript completed smoothly. Validates the transcript-resume workflow used by the research pool.

---

**Status**: DONE  
**Summary**: Brainstorm and plan complete with Telegram storage architecture correction driving a thesis reframe that strengthened the post. All 10 claims verified, 4 decisions locked, 3-phase plan ready for writing.  
**Concerns**: None—series now positioned as evidence-driven and architecturally sound.
