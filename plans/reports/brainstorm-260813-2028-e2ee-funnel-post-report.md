# Brainstorm Report: E2EE Series Opener Post

Date: 2026-08-13 | Mode: standard (no --html/--wiki) | Status: design approved by user

## Problem Statement

Write the opener post for the already-registered `e2ee` series (`src/data/series.ts`, status `planned`): a funnel/hub article on how WhatsApp, Signal, Messenger and Telegram protect user messages. User supplied a complete Vietnamese outline (7 parts + conclusion + spin-off list) and explicitly required objective, fact-checked, sufficient information.

## Decisions (user-confirmed)

| Decision | Choice | Rationale |
|---|---|---|
| Language | **English** | All 4 published posts + site UI are English (i18n has only `en.ts`) |
| Outline fidelity | **Adapt to house style** | Keep the 7-part arc + key insights; rewrite in the blog's first-person, evidence-linked voice; merge redundant sections (outline §4/§10/§11 overlap) |
| Length | **Full ~5,000+ words** | User chose full breadth over trimming; will be the longest post on the blog |
| Design | **Approved** — 13-section structure incl. added FAQ | |

## Fixed by repo convention (not asked)

- `series: e2ee`, `seriesOrder: 1`, `articleType: big-question` (both prior series openers use big-question)
- Title = registered series bigQuestion: "WhatsApp, Signal, Messenger, Telegram: How Do They Really Encrypt Your Messages?"
- Tags: `e2ee`, `security`, `encryption`, `messaging`
- House-style elements: hook → `> [!TIP]` one-sentence thesis → post roadmap → `## Table of contents` marker → sourced claims → mermaid diagrams with prose description → comparison table → FAQ → "ask the better question" close → `_Next in this series:_` footer
- Mermaid renders at build via rehype-mermaid; run `pnpm build` (uses `--force`) + verify-post-bodies before publish

## Fact-Check Corrections (from researcher report)

Source: `plans/reports/researcher-260813-2028-e2ee-fact-check-report.md` (all claims cited to primary sources)

1. **Messenger default E2EE NOT "completed"** — announced 2023-12-06, rollout began then; ~33% adoption per June 2024 survey; no verified completion date. Use "announced Dec 2023, rollout stretched well into 2024 and beyond".
2. **Telegram "Multi-device ✓" misleading** — true only for Cloud Chats (not E2EE). Secret Chats: single device pair, no Desktop/Web, lost on logout, **no groups**. Table cell → "Cloud Chats only".
3. **Secret Conversations two dates** — beta July 2016, full rollout October 2016; specify.
4. **Do not conflate Instagram with Messenger** — Instagram DMs never default E2EE; opt-in feature removed entirely May 2026. One-line disambiguation only.

Verified anchors: Signal (TextSecure 2010 → rebrand Nov 2015, Sealed Sender 2018, linked devices w/ 45-day history transfer); WhatsApp (OWS partnership Nov 2014 → full rollout Apr 5 2016 ~1B users, multi-device client-fanout 2021, HSM encrypted backups Sep 2021, key transparency Apr 2023); Messenger Labyrinth protocol + documented engineering challenges (login model, web, history storage, sticker search); Telegram Cloud vs Secret model.

Bonus for threat-model section: Wyden letter Dec 2023 — governments obtained push-notification metadata from Apple/Google despite E2EE content. Concrete example for the `*` nuance in the outline's protection table.

## Approved Structure (13 sections)

1. Hook: "Meet me at the usual place tonight" → who can read it? + TIP thesis: *E2EE doesn't add a lock to the wire — it removes the server's ability to read*
2. HTTPS already encrypts — why isn't that enough? (mermaid: 2 models)
3. What E2EE actually buys you (db leak / server compromise / provider → definition)
4. Follow one message + real life ≠ Alice→Bob (merged outline §3+§4; insight: the system around encryption is the hard part)
5. Signal — privacy as the foundation (verified milestones)
6. WhatsApp — E2EE for a billion users (2014→2016→2021→2023)
7. Messenger — retrofitting E2EE onto a giant (corrections #1/#3; Labyrinth; search/notification/spam under E2EE)
8. Telegram — "has E2EE" vs "defaults to E2EE" (correction #2; trade-off framing, not "which app is most secure")
9. Comparison table (corrected) + "a ✓ doesn't tell the whole story" caveat
10. Behind the Send button (Identity→…→Device loss stack, 1–2 sentences each, mermaid)
11. Thought experiment: `encrypt(message, key)` → requirements avalanche (keeps outline's Q&A rhythm)
12. Who is E2EE protecting you from? (threat table + push-notification metadata)
13. FAQ (3–4: "Is Telegram insecure then?", "Do backups break E2EE?", "What does the server still know?") → close: the lock icon is the tip of the iceberg + hub list ("coming in this series", no dead links) + next-in-series footer

## Alternatives Considered

- **Vietnamese post** — rejected: single post would diverge from all-English site.
- **Verbatim outline structure/voice** — rejected: lecture-style short paragraphs clash with the 4 published posts; arc preserved instead.
- **Trim to 3,500–4,500 words** — rejected by user; full breadth kept.

## Risks & Mitigations

- Messenger rollout completion date unverifiable → cautious wording (correction #1).
- Hub links point to unwritten posts → list as upcoming topics, no links.
- Longest post yet → keep sections V–VII tight despite full-breadth choice; every section must earn its length with a distinct insight.
- Claims density → every date/number carries a primary-source link taken from the fact-check report.

## Success Criteria

- All 4 corrections reflected; zero unsourced historical claims.
- Frontmatter validates against `src/content.config.ts` (series slug exists, articleType enum).
- `pnpm build` passes incl. `scripts/verify-post-bodies.mjs`; mermaid diagrams render.
- Voice/structure consistent with existing big-question openers.

## Next Steps

- Hand off to `/ck:plan` with this report path for phase planning (write → review → build-verify → publish).

## Unresolved Questions

- Exact Messenger default-E2EE completion date (handled via cautious wording).
- Messenger PIN-recovery mechanism detail is thin in public sources (keep to one sentence).
