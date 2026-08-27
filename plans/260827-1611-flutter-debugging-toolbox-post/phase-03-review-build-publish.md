---
title: "Phase 3: Review Build & Publish"
status: todo
priority: P1
effort: "1h"
dependencies: [2]
---

# Phase 3: Review Build & Publish

## Overview

Verify the post builds and renders correctly (mermaid, images, series hub, dark mode), review against the acceptance criteria, then commit and push to main for the GitHub Actions deploy — push only after green build and user approval.

## Requirements

- Functional: green `astro build --force` + `scripts/verify-post-bodies.mjs`; post + series hub render correctly.
- Non-functional: follow repo CLAUDE.md build/deploy invariants (forced build is deliberate; hosted-builder caveats do not apply — deploy is GitHub Actions on push to main).

## Related Code Files

- Modify: none expected (fixes only, from review findings)

## Implementation Steps

1. `pnpm install --frozen-lockfile` if needed, then `npx astro build --force`; confirm `verify-post-bodies.mjs` passes (it guards against mermaid posts rendering empty when Chromium can't launch). A suspiciously fast (~3s) build is itself a failure signal per CLAUDE.md.
2. Start dev server per CLAUDE.md (`astro dev --background`; stop it when done — process-management rules). Manually check: post page (images legible at column width, captions, TOC collapse, TIP callout), all 3 mermaid flowcharts in **light and dark** themes, `/series/mobile-debugging/` hub, `/series/` index, `/roadmap`, adjacent/related-post nav.
3. Review pass against plan.md success criteria + SDD §3 checklist: title/description lengths, tags, internal links resolve, footer attribution present, no uncited claims (spot-check MCP + Network sections against citation map).
4. Fix findings; rebuild until green.
5. Commit per conventional commits (content scope, no AI references) via `/ak:git`; push to main after user approval; confirm the GitHub Actions deploy run goes green (`gh run watch` or `gh run list`).
6. Mark phases done via `ak plan check`; then `/ak:journal` per plan-skill flow.

## Todo

- [ ] Build + verify-post-bodies green
- [ ] Dark/light mermaid check
- [ ] Series hub + roadmap render
- [ ] Review findings fixed
- [ ] Commit + approved push + deploy green
- [ ] Plan phases checked off

## Success Criteria

- [ ] Production deploy green; post live with images and diagrams rendering
- [ ] All plan.md success criteria checked

## Risk Assessment

- **Mermaid dark-mode gap** (SDD: only flowcharts covered): all 3 diagrams are flowcharts by spec; signal = unreadable dark render; response = adjust diagram to flowchart-safe syntax, never ship an unreadable diagram.
- **Deploy-image Chromium failure** (known failure mode in CLAUDE.md): signal = verify step fails in CI; response = per CLAUDE.md the GitHub runner installs Chromium `--with-deps`; investigate the run log before touching workflow config.
