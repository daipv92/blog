# 260820 — iOS background: translate Vietnamese draft, lock decisions on depth, diagrams, and tech corrections

## What changed

Brainstorm on iOS background mental-model post (ios series #4, "The App Went to the Background — Is My Code Still Running?") ended with approved design for English translation of user's Vietnamese draft. Session revealed three locked decisions and five technical corrections that reshape how the post explains suspend/terminate behavior.

**New decisions baked into skeleton:**

1. **Full draft depth, no trimming** — user explicitly chose to keep all 15 sections even though future Level 2 (concurrency) and Level 3 (beginBackgroundTask) posts will go deeper. Post stays API-light, leaving room for upcoming content. This is a user decision, not a constraint.

2. **Mixed diagrams, ASCII kept for metaphor** — mermaid for lifecycle, beginBackgroundTask flow, and background map (no semicolons in text). ASCII preserved for shop metaphor and state comparisons because brevity and illustration matter more than diagram uniformity.

3. **Draft ending stays as learning list** — seven-level list (§15) reframed as exploration, not roadmap. Conclusion keeps the reframed question instead of prescriptive closure.

**Technical corrections (cited, mental-model level):**

- Without `beginBackgroundTask`, app suspends in seconds (removed "iOS gives you a window" phrasing that contradicted §6).
- Suspended → terminated under memory pressure happens **with no callback** (jetsam kill), strengthening interruption-resilience argument.
- Extra time is finite (~30s) with an expiration handler; Apple "knocks when time is up."
- Alert push (NSE runs) vs `content-available` background push — one sentence distinguishing clause in §10.
- Apple-doc citations at claim points, matching prior posts.

## Continuity

"E2EE Core" → `CryptoCore` (fictional, declared as in post 1). Cross-links to NSE-linking and SQLCipher-copies posts. Series registry entry exists; no changes needed.

## Known gotchas to respect

- Future `pubDatetime` silently drops post from `dist/` if mistakenly set. Verify `dist/posts/<slug>/index.html` exists after build.
- Mermaid semicolon (`;`) in diagram text breaks build silently (exits 0, body empty). Verify with `scripts/verify-post-bodies.mjs`.

## Artifacts

Design report: `plans/reports/brainstorm-260820-0628-ios-background-mental-model-post-report.md`.
Post stub ready for write: `blog/src/content/posts/the-app-went-to-the-background-is-my-code-still-running.md`.

---

Status: DONE
Summary: Approved design for iOS background post (series #4) with locked decisions on translation, draft depth, mixed diagrams, and five technical corrections. Ready to write.
