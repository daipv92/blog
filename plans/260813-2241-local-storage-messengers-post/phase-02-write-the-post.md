---
phase: 2
title: "Write the Post"
status: done
effort: "M"
dependencies: [1]
---

# Phase 2: Write the Post

## Overview

Write the full English post from `content-skeleton.md`, matching house big-question style, ~4,500–5,500 words, into `src/content/posts/how-do-messengers-store-millions-of-messages.md`. <!-- Updated: Validation Session 1 - slug locked -->

## Requirements

- Functional: complete post, valid frontmatter, all skeleton sections realized, both mermaid diagrams with prose descriptions, FAQ, evidence-confidence table, next-in-series footer.
- Non-functional: zero unsourced claims; verbatim quotes only where the citation map allows; no benchmarks-as-argument; Realm treated respectfully per correction #3.

## Related Code Files

- Create: `src/content/posts/how-do-messengers-store-millions-of-messages.md`
- Modify: `src/content/posts/what-architecture-layers-does-a-mobile-app-need.md` (footer line only, wording from Phase 1)
- Reference: `src/content.config.ts` (frontmatter schema), sibling posts for voice.

## Implementation Steps

1. Frontmatter: title "What Should a Mobile App Use for Local Storage? How Telegram, Messenger and Signal Store Millions of Messages" (validated), description, `pubDatetime` (set at publish time), `tags` (e.g. local-storage, sqlite, realm, mobile), `series: mobile-architecture`, `seriesOrder: 2`, `articleType: big-question`, `featured: false`, `draft: false`.
2. Write sections 1–5 (problem → taxonomy → decision tree → philosophies → pivot). Keep the "don't pick a database first — look at the data" thesis as the TIP blockquote.
3. Write evidence sections 6–9 per citation map; include exact quotes where allowed (MSYS sentence, "universal system", TDLib docs line, Signal encrypted-blobs line) and the ★ evidence table.
4. Write decision criteria ①–⑥ + matrix; criterion ⑥ ("who needs to read the database?") ends with the one-paragraph Realm→Native teaser only.
5. Write Realm lifecycle section with precise dates (2024-09-09 announcement; Device Sync off after 2025-09-30; v20/community branch for local-only).
6. Close: better-question ending + FAQ (4–6 questions: "Is SQLite fast enough?", "Should I encrypt my local DB?", "Is Realm dead?", "DataStore or Room?"…) + `_Next in this series:_` footer pointing at funnel post 2 (DB in Flutter vs native core).
7. Apply the Phase-1-drafted footer edit to series post 1.
8. Self-review pass against the citation map: every claim → source; every correction present.

## Success Criteria

- [x] Post file complete, frontmatter schema-valid, all sections present.
- [x] 4 corrections verifiably reflected (grep-able: "Postbox", "MessagesStorage", "universal system", "community branch").
- [x] Both mermaid diagrams render meaningful structure (not decoration) with prose descriptions.
- [x] Series post 1 footer updated; no dangling "case study is next" promise.

## Risk Assessment

- Medium: TDLib reframing is subtle — risk of overcorrecting into "TDLib is irrelevant". Mitigation: use the "three storage engines, one pattern" framing locked in Phase 1.
- Mermaid render failures caught in Phase 3 build (verify-post-bodies).
