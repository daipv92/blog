# Review: E2EE Series Opener Post (advisory, no edits made)

**Post:** `src/content/posts/how-do-messengers-really-encrypt-your-messages.md` (264 lines)
**Contracts checked:** fact-check report, brainstorm approved structure, content skeleton, house-style reference post
**Verdict:** Publishable after 4 small wording/sourcing fixes. No critical issues. All 4 mandatory corrections are correctly implemented.

## Acceptance Criteria Results

| Criterion | Result |
|---|---|
| (a) 4 corrections | **PASS** (all 4; one minor sourcing gap, see M3) |
| (b) Dates/numbers match report + linked | **PASS with 4 exceptions** (M1–M3, L1) |
| (c) 13 sections + house-style elements | **PASS** |
| (d) Frontmatter | **PASS** (description 148 chars; `e2ee` slug registered at `src/data/series.ts:61`; `big-question` in enum at `src/content.config.ts:33`) |
| (e) No Vietnamese / no plan-label leakage / voice | **PASS** (diacritic grep hits are only "café"; "audit" hits are the content words "auditable"/"Audits") |
| (f) Mermaid syntax | **PASS (static review)** — build not run; phase-3 `pnpm build` + verify-post-bodies remains the hard gate |

### Correction verification (criterion a)

1. **Messenger never "completed"** — line 122: "began migrating accounts. Note the verb: _began_. The rollout stretched well into 2024 and beyond … no public source confirms a finish date", with about.fb.com + Accountable Tech links; table row says "Rolling out since Dec 2023 — no confirmed finish". No "complete/completed" adjacent to the rollout anywhere. **Correct.**
2. **Telegram multi-device** — table cell (line 158): "**Cloud Chats only — and Cloud Chats aren't E2EE.** Secret Chats: one device pair"; body (line 143): single device pair, not on Desktop/Web, lost on logout, "group E2EE simply does not exist on Telegram". **Correct.**
3. **Secret Conversations two dates** — line 120: "began testing in July 2016 … and reached all users in October 2016". Both dates present. **Correct** (October date lacks its own link — see M3).
4. **Instagram** — exactly one mention (line 131), one line, "never end-to-end encrypted by default … a buried opt-in, and Meta removed it entirely in May 2026", MacRumors link. **Correct.**

## Critical Issues

None.

## Medium Priority

- **M1 — Unsourced superlative not in the fact-check report** (line 104): "It remains the largest deployment of end-to-end encryption in history." No link, and the claim appears nowhere in the researcher report. It also asserts a 2026-current superlative from 2016-era sources. Suggest either sourcing it (EFF/press coverage from April 2016 used this framing) or softening to "at the time, the largest deployment of end-to-end encryption ever attempted."
- **M2 — Mechanism claim beyond the report** (line 95): "the last 45 days of history, transferred **device-to-device**, not through a server-readable copy." The report verifies only "45 days, optional at link time." Signal's synchronized start relays an *encrypted archive through Signal's infrastructure* (server-unreadable, but not literally device-to-device). "Not through a server-readable copy" is the defensible half; "device-to-device" overstates. Also note the report's own concern: the source described the feature as "upcoming beta — verify current status as of 2026"; the post asserts it as shipped without that verification. Suggest: "…can optionally receive the last 45 days of history via an encrypted transfer Signal's servers cannot read."
- **M3 — Bare date, violates skeleton's "zero bare dates in §5–§8" grep** (line 120): "reached all users in October 2016" carries no link; the July link (about.fb.com beta announcement) does not confirm the October rollout. The report's source for October 27, 2016 is MediaPost. Add that link or an equivalent.
- **M4 — Misattributed tech in the Telegram section** (line 145): "Signal and WhatsApp made E2EE the invariant and then spent years of engineering (client fanout, HSM vaults, **Labyrinth-style storage**)…" Labyrinth is Messenger's protocol; neither Signal nor WhatsApp built it, and Messenger is explicitly *not* in the "made E2EE the invariant" set. The post is precise about this everywhere else. Drop "Labyrinth-style storage" from the parenthetical or rephrase to "…the kind of engineering (client fanout, HSM vaults — and, for Messenger, Labyrinth) that buys back…".

## Low Priority

- **L1** (line 88): "January 2013" (OWS founding) has no adjacent link; it is covered by the increment.com link earlier in the same paragraph, which is the report's cited source. Borderline against the "zero bare dates" contract; acceptable, but moving/duplicating the link onto the clause would satisfy the grep.
- **L2** (line 94): "Sealed Sender (2018)" — the year is in the skeleton but not the fact-check report; the linked Signal blog post is itself dated November 2018, so it self-sources. No action needed.
- **L3** (line 264): footer wording differs slightly from the skeleton ("built around a server that could read everything" vs "built to read your messages"). Same meaning, points at the Messenger case study as required. Acceptable adaptation, noting for completeness.

## Structure & Style (criterion c/e detail)

- All 13 approved sections present in order: unheaded hook → HTTPS-not-enough → what-E2EE-buys → follow-one-message → Signal → WhatsApp → Messenger → Telegram → comparison table → Behind the Send Button → thought experiment → threat model → FAQ + close (14 H2s = ToC marker + 12 content + close).
- `> [!TIP]` thesis matches the skeleton text verbatim; `## Table of contents` sits after the roadmap paragraph, matching the reference post's scaffolding ("Here is the whole article in one sentence" is the identical house pattern).
- Both mermaid diagrams are followed by 1–2 sentence prose descriptions; diagram 2's "eight subsystems" prose matches its 8 nodes and the 8-bullet list.
- Comparison table has all corrected cells plus the required 6-item caveat list; threat table matches the skeleton row-for-row including escaped `\*` asterisks; FAQ has the 4 contracted questions; close is better-question style; "Coming in this series" list (line 262) is plain text with zero links.
- Voice is consistent with the reference post: evidence-linked, long paragraphs, no lecture-style one-liners, first person where the house style uses it ("my message-systems series").

## Mermaid (criterion f detail)

Static review only. Both blocks are valid `flowchart TD` syntax: every label containing em dashes, parentheses, commas, apostrophes, or question marks is double-quoted (`S1["Server decrypts — reads and stores plaintext"]`, `K["Key agreement — … (X3DH, prekeys)"]`); unquoted labels are plain words; subgraph titles are quoted. This matches patterns already building successfully in the published scroll-jank/framework posts. The real gate is `pnpm build` (with `--force`) + `scripts/verify-post-bodies.mjs` per phase 3 — not run in this review.

## Recommended Actions (priority order)

1. Fix M4 (Labyrinth misattribution) — factual-accuracy fix, one clause.
2. Fix M2 ("device-to-device") — reword one clause.
3. Fix M3 (link the October 2016 date).
4. Fix M1 (source or soften "largest deployment in history").
5. Optional: L1 link placement.
6. Then run the phase-3 build gate.

## Unresolved Questions

- Whether Signal's 45-day linked-device history transfer is fully GA as of Aug 2026 (report flagged "upcoming beta"; post asserts it as current — M2).
