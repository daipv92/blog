---
phase: 1
title: "Citation Map & Content Skeleton"
status: done
effort: "S"
---

# Phase 1: Citation Map & Content Skeleton

## Overview

Turn the fact-check report into a per-section citation map and a full content skeleton (`content-skeleton.md` in this plan dir), so Phase 2 writes against locked claims instead of re-deriving them.

## Context

- Source of truth: `plans/reports/brainstorm-260813-2241-local-storage-post-fact-check-report.md` (verdicts + URLs + exact quotes).
- House-style references: `src/content/posts/how-do-messengers-really-encrypt-your-messages.md` (sibling big-question post), `src/content/posts/what-architecture-layers-does-a-mobile-app-need.md` (series #1 voice).

## Implementation Steps

1. Read both reference posts; note recurring structure: hook → TIP thesis blockquote → `## Table of contents` → evidence sections → decision framework → FAQ → better-question close → `_Next in this series:_` footer.
2. Build citation map: for each planned section, list the exact claims used + verdict + URL + which quotes may appear verbatim (MSYS sentence, "universal system", TDLib docs line, DataStore→Room line, Signal blob line) and which must be paraphrased ("single source of truth").
3. Write `content-skeleton.md` with the adjusted 12-section arc:
   1. Hook: one app, seven kinds of "local data" (dark mode → token → 100k messages → crypto session) — they must not be stored the same way.
   2. Five storage groups (memory / key-value / secure key-value / structured DB / files) — don't call everything a "database".
   3. Decision tree: Preferences vs DB vs files, with Android's own DataStore/Room wording as evidence.
   4. SQLite vs Realm: two philosophies (relational subsystem vs live object model), no benchmarks.
   5. "What do apps that store millions of messages actually do?" — pivot to evidence.
   6. Messenger/LightSpeed: SQLite as universal system, integrated schema, stored procedures (CG/SQL), MSYS; DB becomes the app's foundation. Metrics: 1.7M→360K LOC, 2× startup.
   7. Telegram: wrote its storage engine three times (MessagesStorage / Postbox / TDLib) — persistence always in a core below the UI; TDLib as the packaged version of that idea (addLocalMessage/message database detail).
   8. Signal: storage architecture ≠ one database — SQLCipher SQLite for messages, encrypted blobs for media, same split on iOS (GRDB+SQLCipher).
   9. WhatsApp: what forensics shows (msgstore.db, wa.db) + honest ★★ evidence grading; evidence-confidence table for all 4 apps.
   10. Decision criteria ①–⑥ (query complexity, volume, relationships, mutation rate, offline-first vs cache, who reads the DB) → decision matrix.
   11. Realm lifecycle nuance: deprecation facts, "choose for ownership/ecosystem/maintenance horizon, not benchmarks."
   12. Better-question close + short Realm→Native teaser + next-in-series footer (post 2: DB in Flutter vs native core).
   Note against section 12: NO deep dive into the personal migration case (user decision).
4. Mark 2 mermaid diagram slots: (a) storage decision tree, (b) LightSpeed server→sync→SQLite→UI vs per-feature caches. Each with one-paragraph prose description per house style.
5. <!-- Updated: Validation Session 1 - title/slug locked --> Title and slug are locked by validation: title "What Should a Mobile App Use for Local Storage? How Telegram, Messenger and Signal Store Millions of Messages", slug `how-do-messengers-store-millions-of-messages`. No candidates needed.
6. Draft replacement footer line for series post 1: next = this storage post; message-engine case study demoted to "later in the series" (validated decision — keep the old promise, reordered).

## Success Criteria

- [x] `content-skeleton.md` exists with all 12 sections, citation map, diagram slots, locked title/slug, post-1 footer draft.
- [x] Every section's claims trace to a verdict+URL in the fact-check report; no orphan claims.
- [x] All 4 non-negotiable corrections placed in their target sections (7, 6, 11, 9 respectively).

## Risk Assessment

- Low. Pure planning artifact. Main risk is skeleton drifting from user's approved outline — mitigated by mapping each skeleton section back to the draft's numbered sections in a comment.
