---
phase: 2
title: "Write the Post"
status: done
effort: "M"
---

# Phase 2: Write the Post

## Overview

Write the full English post from the Phase 1 skeleton: ~5,000+ words, 13 sections, house-style voice, all claims linked to primary sources.

## Requirements

- Functional: complete markdown post, valid frontmatter, renders with mermaid diagrams.
- Non-functional: house-style voice (first-person, evidence-driven, no lecture-style one-line paragraphs); readable section flow; corrections baked in.

## Architecture

Frontmatter (validated by `src/content.config.ts` — series slug must exist, articleType enum):

```yaml
---
title: "WhatsApp, Signal, Messenger, Telegram: How Do They Really Encrypt Your Messages?"
description: "<~150-char hook mentioning the four apps and what E2EE actually changes>"
pubDatetime: <set at publish time, ISO>
featured: false
draft: false
tags:
  - e2ee
  - security
  - encryption
  - messaging
series: e2ee
seriesOrder: 1
articleType: big-question
---
```

Section order = brainstorm report "Approved Structure" (hook + TIP → HTTPS vs E2EE → what E2EE buys → one message + multi-device reality → Signal → WhatsApp → Messenger → Telegram → comparison table → behind the Send button → thought experiment → threat model → FAQ → close + hub list + next-in-series footer). `## Table of contents` marker after the intro, as in existing posts.

## Related Code Files

- Create: `src/content/posts/how-do-messengers-really-encrypt-your-messages.md`
- Read: `plans/260813-2028-e2ee-series-opener-post/content-skeleton.md`; style refs in `src/content/posts/`

## Implementation Steps

1. Write intro + TIP thesis + post roadmap sentence (three things the post does).
2. Write parts I–II (sections 1–3): HTTPS vs E2EE mermaid + prose description; db-leak/server-compromise/provider scenarios; definition; one-message walk; multi-device reality → "the system around encryption is the hard part" insight.
3. Write the four case studies (sections 4–7) from the skeleton's citation map; corrections #1–#4 land here. Telegram section framed as trade-off ("what is each architecture optimizing for?"), not a security ranking.
4. Write comparison table (section 8) + caveat list (key management, metadata, backups, verification, recovery, implementation).
5. Write "behind the Send button" stack (section 9, 1–2 sentences per concept + mermaid) and the `encrypt(message, key)` requirements-avalanche thought experiment (section 10, keep Q&A rhythm).
6. Write threat-model section (11): protection table + `*` nuance + push-notification metadata (Wyden) paragraph; trust-model reframe ("server doesn't need the ability to read").
7. Write FAQ (12) and close (13): lock-icon-is-the-tip, better question, "coming in this series" topic list (plain text, no dead links), `_Next in this series:_` footer pointing at the Messenger migration case study (why default E2EE took Messenger years). <!-- Updated: Validation Session 1 - footer target changed from Signal Protocol deep-dive -->
8. Self-pass: every date/number has its link; no outline-Vietnamese remnants; description ≤ 160 chars; heading case consistent with existing posts.

## Success Criteria

- [x] All 13 sections present, ~5,000+ words.
- [x] 4 corrections verifiably in the text (grep: "October 2016", "Cloud Chats only" or equivalent, no "completed" near Messenger rollout, one-line Instagram note max).
- [x] Every historical claim linked; 2–3 mermaid blocks each followed by a prose description.
- [x] Frontmatter parses (dev server or build in Phase 3).

## Risk Assessment

- Length inflation → each section must earn length with a distinct insight; merge rather than repeat (outline §4/§10/§11 overlap already resolved in design).
- Claim drift while paraphrasing → copy dates/numbers only from the skeleton, not memory.
