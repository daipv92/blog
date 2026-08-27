---
title: "Phase 1: Citation Map, Image Harvest & Content Skeleton"
status: todo
priority: P1
effort: "3h"
dependencies: []
---

# Phase 1: Citation Map, Image Harvest & Content Skeleton

## Overview

Produce `content-skeleton.md` (section-by-section outline with claim→citation map, image placement, diagram specs) and download all official screenshots into `src/assets/images/`. No post prose yet.

## Requirements

- Functional: every section of the plan's outline gets citations, image slots, and diagram specs; all manifest images on disk.
- Non-functional: zero unverified claims survive into the skeleton; licensing confirmed for every screenshot used.

## Related Code Files

- Create: `plans/260827-1611-flutter-debugging-toolbox-post/content-skeleton.md`
- Create: `src/assets/images/flutter-devtools-*.{png,webp}` (per plan.md image manifest)
- Create (conditional): `src/assets/images/firebase-crashlytics-breadcrumbs.png`

## Implementation Steps

1. **Verify citations.** Re-open each fact-rule URL from plan.md (network, inspector, performance, memory, logging, deep-links, ai/mcp-server) and confirm the exact claims + quoted strings ("frame rendering times aren't indicative…", oversized-image message format, MCP "experimental… likely to evolve quickly", client list). Record final URLs (+ anchor fragments) in the citation map.
2. **Crashlytics citations.** Find the exact Firebase docs child pages for custom logs, custom keys, and breadcrumbs (likely `firebase.google.com/docs/crashlytics/customize-crash-reports?platform=flutter`). Confirm Flutter-platform variants exist. Check Google developer-site content license for any screenshot; if not clearly CC BY-compatible, mark §8 text-only and drop the image slot.
3. **Community evidence.** Verify the Level Up Coding "7 Dart DevTools Features" article and the startdebugging.net MCP article still exist and actually support the claims attributed to them; capture one usable quote each, or drop them.
4. **Harvest images.** `curl -fSLo` each manifest image from `https://docs.flutter.dev/assets/images/docs/tools/devtools/<file>` into `src/assets/images/<local-name>`; then visually check each (Read the image files) — non-empty, right subject, legible at blog column width. Replace any weak one with an alternative from the same docs page (alternatives already cataloged in the plan-time research: 33+ inspector images, 9 performance images, 6 memory images).
5. **Write `content-skeleton.md`** with, per section: working heading, 2-4 bullet content beats (drawn from the plan outline and the source draft's strongest moves), citation list, image slot(s) with draft captions (caption must state what the reader is looking at and what it replaces — e.g. "one request row instead of 40 log lines"), and diagram specs.
   - Diagram specs (mermaid **flowchart** syntax only, per SDD dark-mode constraint): (a) §2 observe-axes: issue → {network, state, UI, performance, memory, error}; (b) §9 architecture: Flutter app → Dart VM Service/DTD → {DevTools → developer, MCP server → AI agent} → root cause; (c) §10 decision flowchart (THE original artifact): issue → reproduce? → tool lane per question → structured evidence → human+AI → hypothesis → verify. Draft the flowcharts inline in the skeleton.
   - Structured-event schema (original artifact b): adapt the draft's messenger examples (`event=message_send_start/thread_id/route=e2ee`, `event=message_send_failed/stage=encrypt/reason=session_missing`) — keep them as the author's real send-flow schema, consistent with the blog's e2ee/message-systems series vocabulary.
6. **Tag audit.** `grep -h '^  - ' src/content/posts/*.md` frontmatter tags; choose 3-5 reuse-first (expect: `flutter`, `debugging`, `devtools`, + maybe `ai-tooling`; invent at most one new tag).

## Todo

- [x] Citation map complete (every claim → URL)
- [x] Crashlytics pages + license resolved; §8 image decision made
- [x] Community links verified or dropped
- [x] All images downloaded, inspected, kebab-named
- [x] 3 mermaid flowcharts drafted in skeleton
- [x] Structured-event schema drafted
- [x] Tags chosen
- [x] `content-skeleton.md` written

## Success Criteria

- [x] Skeleton covers all 10 outline sections; no section lacks citation or (where specified) image
- [x] Every image file opens and is legible; total post images ≈10
- [x] No claim marked "unverified" remains in the skeleton

## Risk Assessment

- **Docs drift** (Flutter docs restructure between plan and draft): signal = 404 or missing anchor on re-open; response = re-search docs.flutter.dev for the moved page, update citation map — do not cite from memory.
- **Firebase screenshot licensing unclear**: signal = no CC BY notice on the page/site terms; response = pre-decided — §8 ships text-only (still cites docs), no blockage.
- **Image files hotlink-blocked or moved**: signal = curl non-200/HTML body; response = pull same asset path from the flutter/website GitHub repo (`sites/docs/src/assets/images/...`) which is the CC BY source of truth.
