# Code Review — Local Storage Post (Pre-Publish)

Reviewer: code-reviewer | Date: 2026-08-13 | Advisory only, no files edited.

## Scope

- `src/content/posts/how-do-messengers-store-millions-of-messages.md` (new, 225 lines)
- `src/content/posts/what-architecture-layers-does-a-mobile-app-need.md` (footer, 1-line diff — confirmed via `git diff --stat`: 1 file, 1 insertion, 1 deletion)
- Checked against: fact-check report, content skeleton, `src/content.config.ts`, `src/data/series.ts`, e2ee sibling post structure.

## Overall Assessment

Publishable. All seven acceptance criteria pass. Every load-bearing factual claim traces to a fact-check verdict or to post 1's own published measurements. Findings below are one medium link-target issue and a few low-priority wording nits.

## Acceptance Criteria Results

### 1. Frontmatter — PASS
`npx astro sync` completed with no schema errors. `pubDatetime: 2026-08-13T16:00:00.000Z` parses as `z.date()`; `series: mobile-architecture` is registered in `src/data/series.ts`; `seriesOrder: 2`; `articleType: big-question` (valid enum); `description` present.

### 2. Four non-negotiable corrections — ALL PASS
- **(a) Telegram/TDLib**: Explicit and correct (line 123): "TDLib is _not_ what the flagship apps run. It powers Telegram X and the third-party client ecosystem." Android = `MessagesStorage` SQLite/JNI; iOS = Postbox + sqlcipher submodule. Scoreboard rows separate flagship Android / flagship iOS / TDLib correctly. No sentence implies flagship apps run TDLib.
- **(b) "single source of truth"**: Never quoted as Meta's written wording. Line 95 paraphrases ("one source of truth") and attributes to the SED interview — exactly the allowed treatment. The only verbatim Meta-article quotes present are the four allowed ones: "leverage the SQLite database", the "universal system" sentence, "we developed a single integrated schema for all features", and the full MSYS sentence. The closing section's "source-of-truth invariant" (line 221) references post 1's own concept, not the Meta article — compliant.
- **(c) Realm lifecycle**: Deprecation dated 2024-09-09; "deprecated, not deleted"; repo "remains public" (never "archived"); local-only = version 20 or `community` branch; FAQ answers "Is Realm dead?" with "No — and precision matters here." No "Realm is dead" assertion anywhere.
- **(d) WhatsApp**: Marked ★★ forensic-grade throughout (section heading, scoreboard, prose: "observed from the outside... 'consistently observed,' not 'officially explained'"). No official-engineering claim.

### 3. Claim traceability — PASS with minor orphans (see Low)
Verified traceable: all Messenger/LightSpeed claims and metrics; all Telegram claims; all Signal claims incl. iOS GRDB+SQLCipher Podfile.lock; WhatsApp msgstore.db/wa.db forensic claims; all three Android-docs quotes; Realm dates, v20/community branch, `changes` stream.

Write-time additions judged SAFE:
- `sqlite.org/mostdeployed.html` — hedged as "probably the most widely deployed database on Earth"; matches sqlite.org's own claim. HTTP 200.
- `sqlite.org/lts.html` — "public-domain code, a frozen file format, and support commitments through 2050" matches the LTS page's stated commitments. HTTP 200.
- SED interview URL — page exists (verified by fetch; 403 to plain curl is bot-protection, not a dead link). The "source of truth" wording is in the episode audio/transcript, not the show-notes page copy; the post's paraphrase-with-attribution matches what the fact-check permits. Safe.
- WhatsApp multi-device + e2ee-backups engineering.fb.com links (both 200) — used only to support "Meta published about sync/backups but not the local store", consistent with the fact-check's "no official engineering publication on local storage".
- "eighteen-thousand-line `MessagesStorage`" and `SignalDatabase` — both trace to post 1's published measurements (18,575 lines; `SignalDatabase` facade named in post 1's tables).
- TDLib `addLocalMessage` doc URL uses the correct doxygen form (`add_local_message.html`, HTTP 200; the double-underscore variant 404s).
- All 14 external URLs spot-checked: all 200 except the SED 403-to-curl noted above.

True orphans (not in fact-check report) listed under Low Priority — none load-bearing.

### 4. House structure — PASS
Hook → `> [!TIP]` (line 24) → `## Table of contents` (line 29) → evidence sections with ★★★/★★ grades → scoreboard table → six-question decision framework + matrix → Realm postscript → FAQ (6 questions) → better-question close ("Stop Asking 'Which Database?'") → `_Next in this series:_` footer. Both mermaid diagrams are each followed by exactly one prose paragraph describing them (lines 67, 111). Matches the e2ee sibling's structure (TIP blockquote line 23, ToC line 28, FAQ, better-question close).

### 5. Mermaid validity — PASS (empirically rendered)
Both blocks were rendered through the repo's own pipeline (`mermaid-isomorphic`, the renderer `rehype-mermaid` uses): diagram A OK (21,844-char SVG), diagram B OK (20,481-char SVG). The parenthesized `(CG/SQL)` inside the quoted cylinder label renders fine; quoting protects all special characters used.

### 6. Post-1 footer edit — PASS
The new last line matches the validated wording in the skeleton verbatim: next = storage post; case study + change-cost deep dive demoted to "Later in the series". No dangling "case study is next" promise. Diff confirmed single-line.

### 7. Internal links — PASS with one flag
- `/posts/what-architecture-layers-does-a-mobile-app-need` (2 occurrences) matches the actual file slug; route pattern `src/pages/posts/[...slug]` confirmed.
- Bare `/posts` link — see Medium below.

## Critical Issues

None.

## High Priority

None.

## Medium Priority

1. **FAQ bare `/posts` link undersells its own claim** (line 200). "Making a local DB _feel_ instant is [its own series on this blog](/posts)" links to the generic posts index. The route is valid, but the series it refers to (message-systems) has zero published posts, so a reader landing on `/posts` finds nothing matching the promise. The series hub exists at `/series/message-systems` (the `[series]` route renders registered series, and message-systems carries `plannedTitles` shown as "coming"). Recommend linking there instead — it substantiates "its own series" — or softening to "a later series on this blog" without a link.

## Low Priority

2. **"forty-year-old model" / "SQL's forty years of expressiveness"** (lines 75, 162). SQL dates to 1974 and the relational model to 1970 — roughly fifty years, not forty. Orphan claim (not in fact-check report) and understated. Suggest "fifty-year-old" or "decades of expressiveness". ("Twenty-five-year-old embedded implementation" for SQLite, 2000 → 2026, is close enough.)
3. **Realm sync-shutdown wording inconsistency** (line 191 vs 206). Body: "sync service shutdown followed on September 30, 2025"; fact-check and the FAQ both say "off **after** 2025-09-30". Align the body to "after September 30, 2025" for precision.
4. **"zero-copy design"** (line 193) is an orphan claim — Realm's own documented characterization, widely repeated, low risk. Fine to keep; noting for traceability completeness.

## Positive Observations (risk calibration only)

- The convergence framing ("the storage engine is the 10%, the architecture around it is the 90%") stays inside what the graded evidence supports; the WhatsApp hedging is applied consistently rather than only in its own section.
- The Telegram correction is turned into the section's thesis ("wrote its storage engine three times") rather than a buried disclaimer — the strongest way to prevent the false TDLib claim from re-entering via paraphrase.

## Recommended Actions

1. (Medium) Repoint the FAQ `/posts` link to `/series/message-systems`, or unlink and soften.
2. (Low) "forty years" → "fifty years" in the two SQL-age spots.
3. (Low) "followed on September 30, 2025" → "after September 30, 2025".
4. Optional: none of the above blocks publish; all are one-line edits.

## Metrics

- Schema validation: PASS (`astro sync`)
- Mermaid render: 2/2 PASS (repo pipeline)
- External links: 14 checked — 13× HTTP 200, 1× 403-to-curl (SED, bot protection; page verified live)
- Internal links: 2/3 exact slug match; 1 valid-but-weak target (Medium #1)

## Plan Status

Phase 2 (write post + post-1 footer edit) deliverables are complete and meet acceptance criteria. Recommended next step for Phase 3: apply/skip the three one-line fixes above at the writer's discretion, then build + verify-post-bodies + deploy verification per CLAUDE.md (remember the hosted Cloudflare build is unreliable; verify after push).

## Unresolved Questions

- Whether the `/posts` link target is a deliberate choice to avoid pointing at an empty series hub — if so, say so and keep it; the hub does render planned titles, which arguably serves the reader better.
