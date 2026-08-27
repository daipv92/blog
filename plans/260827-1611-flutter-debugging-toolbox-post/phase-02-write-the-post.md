---
title: "Phase 2: Write the Post"
status: todo
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: Write the Post

## Overview

Write the full English post from `content-skeleton.md`, register the new `mobile-debugging` series (SDD → registry → roadmap, in that order), and wire internal links.

## Requirements

- Functional: complete post at `src/content/posts/still-debugging-flutter-with-print.md`; series registered end-to-end.
- Non-functional: SDD §3 style contract holds (title ≤60 chars ✓ fixed, TIP thesis after ≤3-paragraph hook, `## Table of contents`, mermaid flowcharts only, tables short-celled, honesty-as-brand); no claim beyond the citation map.

## Related Code Files

- Create: `src/content/posts/still-debugging-flutter-with-print.md`
- Modify: `src/data/series.ts` (add `mobile-debugging` entry: title, description, tier T3, status active, ordered roadmap incl. "coming" future posts)
- Modify: `/Users/vsf/Documents/research/web/docs/website-content-sdd.md` (add series/pillar note + Change Log line — the SDD's pillar map §2 has 5 pillars; record the author's decision to open `mobile-debugging` as a new series and its relation to Mobile Performance; do not silently rewrite locked decisions)
- Modify: roadmap page content (`src/content/pages/` roadmap source) — add the series under "Up next"/now-writing per SDD-mandated order SDD → registry → roadmap

## Implementation Steps

1. Re-read voice references (`is-the-framework-really-why-your-app-is-slow.md`, image pattern from `i-made-messages-load-fast-...md`) and `content-skeleton.md`. Check `src/content.config.ts` for exact frontmatter schema.
2. Write frontmatter: fixed title; fresh meta description (140-160 chars, concrete takeaway, no clickbait); `pubDatetime` = publish moment; `series: mobile-debugging`; `seriesOrder: 1`; `articleType: big-question`; tags from phase 1 audit; `featured`/`draft` per convention.
3. Write body section-by-section from the skeleton. Rules:
   - Rewrite, don't translate — the Vietnamese draft supplies argument and examples, not sentences.
   - Every image: `![caption](../../assets/images/<name>)` with the phase-1 caption (what you're looking at + what it replaces).
   - Keep the draft's strongest text-diagrams (the question→search-log ladder, before/after log schemas) as fenced `text` blocks; real diagrams as mermaid flowcharts from the skeleton.
   - Quote official docs verbatim only where the citation map recorded the exact string; cite inline as markdown links, matching existing posts' citation style.
   - MCP section: state experimental status plainly; label `riverpod_devtools` community.
   - Footer: attribution line for docs.flutter.dev screenshots (CC BY 4.0) + series-next teaser.
4. Internal links (SEO hard rules): link the Performance section to the mobile-performance BQ post (`is-the-framework-really-why-your-app-is-slow`) and/or the scroll-jank post where the frame-pipeline is explained deeper; structured-event examples may link the e2ee/message-systems posts they echo. Series hub link comes free from the layout.
5. Register the series in SDD → `src/data/series.ts` → roadmap page (respect the registry file's existing shape; "coming" future posts: Android toolbox, iOS toolbox, production observability, AI-native debugging).
6. Self-check against SDD Big Question coverage checklist + plan.md fact rules before handing to phase 3.

## Todo

- [x] Frontmatter valid vs `content.config.ts`
- [x] All 10 sections written; TIP thesis; TOC heading
- [x] ~10 images placed with captions; footer attribution
- [x] 3 mermaid flowcharts embedded
- [x] Internal links wired
- [x] SDD + series.ts + roadmap updated (in that order)
- [x] Original artifacts present (decision flowchart + event schema)

## Success Criteria

- [x] Post reads standalone: a reader learns each tool's value from screenshot + caption without visiting docs
- [x] No claim without a citation-map entry; no Sentry guide; Crashlytics-only production section
- [x] Series appears on `/series/` index data after registry change

## Risk Assessment

- **Series registry shape mismatch** (series.ts may key off the SDD pillar map): signal = type error or hub page not rendering; response = follow the registry's own types/comments; if it hard-requires a pillar construct, add the minimal pillar entry and note it in the SDD changelog.
- **Length creep** (10 sections + 10 images): signal = post far exceeding the longest existing post; response = cut section prose before cutting images/diagrams — captions carry the tool value.
