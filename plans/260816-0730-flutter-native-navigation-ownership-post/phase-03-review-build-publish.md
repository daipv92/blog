---
phase: 3
title: "Review Build & Publish"
status: completed
effort: "S"
---

# Phase 3: Review Build & Publish

## Overview

Fact/style review pass, token-post footer link update, full production build with body verification, commit, push to main (pre-authorized by author 2026-08-16; Cloudflare hosted build deploys ~1–2 min after push), post-deploy verification.

## Requirements

- Functional: build passes; post body renders non-empty; mermaid renders; post listed under `/series/mobile-architecture/`; token post footer points at the new post.
- Non-functional: review findings fixed, not waived; no plan/audit labels in post or commit; no secrets/internal names leaked in the redacted contract code.

## Related Code Files

- Modify: `src/content/posts/half-flutter-half-native-who-owns-navigation-mid-migration.md` (review fixes)
- Modify: `src/content/posts/how-does-a-flutter-module-get-a-token-from-the-native-host.md` — footer `_Next in this series: …_` line: prepend one sentence linking to the navigation post, keep the data-layer sentence (author decision, minimal edit) <!-- Updated: Validation Session 1 -->
- Optional: `src/data/series.ts` `plannedTitles` for `mobile-architecture` — only if the author wants the hub to show a coming post beyond this one; not required for this post to list.

## Implementation Steps

1. Review pass vs `plan.md`: §8 corrections present; the 4 verbatim quotes exact; every external claim has a URL; artifacts labeled current/target/assumption; honesty section present; house-style checklist (TIP, ToC, mermaid readings, FAQ, ladder, footer).
2. Redaction check on Artifact 1 code: no real package/bundle ids, endpoints, or internal team names beyond what the token post already exposes.
3. Link check: spot-check ≥10 external URLs (200, not soft-404); GitHub issue numbers match titles.
4. Update token post footer line (one sentence link added, data-layer sentence kept); verify both posts still parse and the new post's `## References` renders.
5. Set `pubDatetime` to actual publish time.
6. `pnpm build` (uses `astro build --force`; must pass `scripts/verify-post-bodies.mjs`). If build ~3s and verify fails → CLAUDE.md cache-poisoning note. If mermaid fails locally → `npx playwright install chromium`.
7. Preview: `astro dev --background`, check post page (mermaid dark/light), `/series/mobile-architecture/` listing order (1–4), token post footer link; then `astro dev stop`.
8. Commit content + plan artifacts, conventional format, no AI references (e.g. `feat: publish mobile-architecture post on navigation ownership mid-migration`); push to main.
9. Post-deploy: after ~1–2 min fetch production post URL, confirm body non-empty and mermaid present; if empty, follow CLAUDE.md cache-discard notes and report.

## Success Criteria

- [x] Review findings fixed; corrections + quotes verified; redaction check passed. (code-reviewer: 4 major / 6 minor / 5 nit — all applied; all 47 external URLs return 200; thrio URL → foxsofter/flutter_thrio; #55760 dropped)
- [x] `pnpm build` green incl. verify-post-bodies (9 bodies); 30 `<svg>` in built post HTML (5 flowcharts, light+dark). Note: first build listed 8 bodies because `pubDatetime` was still in the future in UTC — set to 2026-08-16T01:30Z.
- [x] Post visible under `/series/mobile-architecture/`; token post footer links to it and keeps the data-layer sentence (verified in built HTML; `astro dev` preview replaced by built-HTML check).
- [x] Commit `aed598e` pushed to main 2026-08-16. Hosted Cloudflare build stalled again (404 after 6 min, as on 2026-08-15) → fallback `npx wrangler deploy` of the locally built dist; production verified: 200, 221 KB, 30 `<svg>`, series hub lists the post, token footer links to it.

## Risk Assessment

- Push = immediate production deploy → local build + verify must be green before push.
- Editing the token post footer changes a published post's digest → `--force` build re-renders it; verify its body too.
