---
phase: 1
title: "Citation Map & Content Skeleton"
status: done
effort: "S"
---

# Phase 1: Citation Map & Content Skeleton

## Overview

Produce `content-skeleton.md` in this plan dir: section-by-section skeleton mapping each of the 13 approved sections to its key claims, exact dates/numbers, and primary-source URLs pulled from the fact-check report. This is the writing contract for Phase 2 — no new research unless a gap is found.

## Requirements

- Every historical/technical claim in the skeleton carries a URL already verified in `plans/reports/researcher-260813-2028-e2ee-fact-check-report.md`.
- The 4 corrections from `plan.md` appear verbatim in their sections (Messenger §6, Telegram §7/§8, comparison table §8).
- Skeleton follows house style contract observed in `src/content/posts/is-the-framework-really-why-your-app-is-slow.md` (big-question opener).

## Related Code Files

- Create: `plans/260813-2028-e2ee-series-opener-post/content-skeleton.md`
- Read: both reports; `src/content/posts/is-the-framework-really-why-your-app-is-slow.md` (style reference); `src/data/series.ts` (title/bigQuestion)

## Implementation Steps

1. For each section 0–13 (per brainstorm report "Approved Structure"): list H2 title, 1-line purpose, key claims with date + source URL, and which outline part it adapts.
2. Draft the `> [!TIP]` one-sentence thesis (E2EE removes the server's ability to read, not a lock on the wire) and the closing "better question".
3. Specify the 2–3 mermaid diagrams: (a) HTTPS-only vs E2EE message path, (b) E2EE subsystem stack (Identity → … → Device loss); optional (c) one-message journey. Sketch node text.
4. Draft the corrected comparison table (per-app rows: default E2EE, opt-in scope, multi-device, history/backup mechanism, protocol) with the "Cloud Chats only" cell and the "a ✓ doesn't tell the whole story" caveat list.
5. Draft threat-model table (network attacker / db leak / compromised server / provider / compromised device / scammed user) + push-notification-metadata paragraph anchors (Wyden letter Dec 2023).
6. List FAQ questions (3–4) with 1-line answer directions.
7. Flag any claim that lacks a URL → resolve from the fact-check report or mark for a targeted lookup (do not widen research scope).

## Success Criteria

- [x] `content-skeleton.md` covers all 13 sections; no section without at least one anchor claim.
- [x] All 4 corrections present at their target sections.
- [x] Every date/number has a source URL.
- [x] Diagrams and both tables sketched.

## Risk Assessment

- Fact-check report has 2 thin spots (Messenger rollout completion date; PIN-recovery detail) → skeleton must encode the cautious phrasing, not fill gaps with speculation.
