---
phase: 3
title: "Review Build & Publish Prep"
status: done
effort: "S"
---

# Phase 3: Review Build & Publish Prep

## Overview

Fact/style review pass, full production build with body verification, then commit and push to main — push pre-authorized in Validation Session 1; Cloudflare hosted build deploys ~1 minute after push. <!-- Updated: Validation Session 1 - push gate removed -->

## Requirements

- Functional: build passes; post body renders non-empty; links resolve.
- Non-functional: review findings fixed, not waived; no plan/audit labels leak into the post or commit message.

## Related Code Files

- Modify: `src/content/posts/how-do-messengers-really-encrypt-your-messages.md` (review fixes only)

## Implementation Steps

1. Review pass against the two reports: every correction present; sampled claims match their cited sources; house-style checklist (TIP, ToC marker, mermaid descriptions, FAQ, better-question close, footer).
2. Link check: spot-check external URLs from the citation map (HTTP 200 / not redirected to error pages).
3. Set `pubDatetime` to the actual publish time.
4. `pnpm build` (uses `astro build --force` per CLAUDE.md — deliberate, keep it) → must pass `scripts/verify-post-bodies.mjs`. If the build is suspiciously fast (~3s) and verify fails, see CLAUDE.md cache-poisoning note.
5. Preview locally (`astro dev --background`, check the post page + mermaid rendering + series page listing), then `astro dev stop`.
6. Commit post + plan artifacts, conventional format, no AI references (e.g. `feat: publish e2ee series opener on how messengers encrypt messages`), then push to main. <!-- Updated: Validation Session 1 - push pre-authorized -->
7. Post-deploy verification: after the hosted Cloudflare build (~1–2 min), fetch the production post URL and confirm the body renders non-empty (the empty-body-while-build-exits-0 failure mode in CLAUDE.md). If the deployed body is empty, follow the CLAUDE.md cache-discard notes and report.

## Success Criteria

- [x] Review findings fixed; corrections verified present.
- [x] `pnpm build` green including verify-post-bodies; mermaid renders in built HTML.
- [x] Post visible and correctly listed under `/series/e2ee/` in local preview.
- [x] Commit created and pushed to main; production post body verified non-empty after deploy. <!-- Updated: Validation Session 1 -->

## Risk Assessment

- Push = immediate production deploy (no user gate, per Validation Session 1) → local build + verify-post-bodies must be green BEFORE pushing; post-deploy check catches the hosted empty-body failure mode.
- rehype-mermaid needs Chromium locally → if build fails on mermaid, `npx playwright install chromium` (fallback path per CLAUDE.md).
