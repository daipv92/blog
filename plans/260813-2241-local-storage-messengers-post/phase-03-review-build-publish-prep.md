---
phase: 3
title: "Review Build & Publish Prep"
status: done
effort: "S"
dependencies: [2]
---

# Phase 3: Review Build & Publish Prep

## Overview

Verify the post builds and renders, then commit, push, and confirm the deploy actually served the new post.

## Implementation Steps

1. Fact-check sweep: re-grep the post for the 4 corrections and for banned phrasings ("single source of truth" attributed to the Meta article, "Realm is dead", flagship-Telegram-uses-TDLib).
2. `pnpm build` — must pass `scripts/verify-post-bodies.mjs`; confirm the post body renders non-empty and both mermaid diagrams produced SVG (`--force` behavior per CLAUDE.md).
3. Preview locally (`astro dev --background`) — check ToC, tables, diagrams, series block, footer links; stop server after.
4. Commit post + post-1 footer edit + plan/report files, conventional format (e.g. `feat: publish mobile-architecture post on local storage in messengers`), no AI references.
5. Push immediately (no confirmation gate — pre-authorized by Validation Session 1); then verify deploy per memory note (Cloudflare hosted build unreliable): after ~2 minutes, curl the live URL and confirm non-empty body; if hosted build failed, fall back to `pnpm build && npx wrangler deploy`. <!-- Updated: Validation Session 1 - push policy locked -->

## Success Criteria

- [x] Build green including post-body verification; diagrams render.
- [x] Commit focused and conventional; pushed to main without further gate (validated policy).
- [x] Live URL serves the post with non-empty body (deploy verified, not assumed).

## Risk Assessment

- Cloudflare hosted build may silently produce empty bodies without Chromium — covered by verify script + live-URL check + manual wrangler fallback (documented in CLAUDE.md + memory).
