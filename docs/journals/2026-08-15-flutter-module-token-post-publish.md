# Flutter Module Token Post Published

**Date**: 2026-08-15  
**Severity**: Routine  
**Component**: Blog content—mobile-architecture series #3 post  
**Status**: Built green locally, pushed to main

## What Happened

Published `src/content/posts/how-does-a-flutter-module-get-a-token-from-the-native-host.md` (big-question, seriesOrder=3, ~3,600 words). Post is a funnel: naive question ("how does Flutter get the token?") → MethodChannel `getToken()` and its three problems → Reveal 1 (package native code is already linked into the host process; host attaches channels) → Reveal 2 (dependency direction; interface in package, host implements at composition root; Flutter needn't hold the token — with the honest Dart/dio branch via a `host_auth` interceptor and one channel) → Reveal 3 (inject `AuthorizedClient`, not a token: single-flight refresh with Kotlin `Mutex` / Swift `actor`, retry-401 once, `SessionEvent.expired` for propagated logout; `RawTokenAccess` escape hatch) → whole-picture + 9-rung ladder → "the question is wrong in three words" + 5-point checklist + FAQ.

Six mermaid flowcharts (dark-mode-safe type). Post 2 footer updated to link this post as next; DB-in-Flutter-vs-native-core post demoted to "later".

## Origin

Brainstormed in a separate working dir (originally drafted in Vietnamese; site is English-only per SDD). Design report and the Vietnamese source draft moved into `plans/reports/` for provenance:
- `plans/reports/brainstorm-260815-1431-flutter-module-token-native-host-article-report.md`
- `plans/reports/brainstorm-260815-1431-flutter-module-token-native-host-draft-vi.md`

Brainstorm changed the author's original outline in three ways: refresh mechanism was missing (became Reveal 3, the actual payload); "Flutter doesn't need the token" is only conditionally true (added Dart/dio branch); the more accurate title spoiled the twist (kept as framing, naive question kept as H1). All product-specific names genericised (`app/...` channels, `com.example.*`, `HostApp`).

## Execution Details

**Build**: `pnpm build` green — astro check 0 errors, 51 pages, `verify-post-bodies` reports 8 non-empty posts, Pagefind indexed 8 pages. pubDatetime set in the past (2026-08-15T08:00Z) per the earlier lesson about silent HTML-emit skips.

**Not done this round**: no external-link audit needed (post has no external citations — it's an experience/design post, not a research post); no code-review subagent pass. Snippets are illustrative (`_retry`, `ApiRequest`, `TokenStore` are placeholders by design).

## Emotional Register

Mild relief that the "wrong question" structure survived translation intact. Some unease that this is the series' first post without external receipts — it leans on the honesty-as-brand rule (naming what the Dart branch can't guarantee) rather than on citations. Watch whether it ranks.
