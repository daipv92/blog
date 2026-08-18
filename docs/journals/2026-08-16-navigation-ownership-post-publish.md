# Navigation Ownership Post Published

**Date**: 2026-08-16  
**Severity**: Routine  
**Component**: Blog content—mobile-architecture series #4 post  
**Status**: Published; hosted Cloudflare build stalled again (404 after 6 min), fallback `npx wrangler deploy` verified live

## What Happened

Published `src/content/posts/half-flutter-half-native-who-owns-navigation-mid-migration.md` (big-question, seriesOrder=4, ~3,500 prose words + ~840 in tables). Same real app and narrative device as post #3: hook (3-hop Flutter→Flutter→native→Flutter flow, back ×3) → TIP → two worlds (flutter#15559, 2018) → easy answer (`openNativeChatDetail` couples callers to migration state) → Reveal 1 (`AppDestination` contract + `HostRouter` + ownership table, Dart/Kotlin/Swift; Android multi-module / DeepLinkDispatch / ARouter / Coordinator / Strangler Fig prior art) → Reveal 2 (S1/S2/S3 physical-stack table; Google 2018 option 2/4 vs Flutter 2.0 `FlutterEngineGroup` "~180kB"; S3 today, root swap pending, **S1 vs S2 left open with criteria**) → Reveal 3 (back: island owns back inside itself, host owns back between containers; `PopScope` + host `close()`; results/deep links/state through the host; back table) → costs (illustrative hop-count table: A1 19 / A3 25 / B 15 crossings; engine first frame explicitly unmeasured) → invariant + GPay/Airbnb/Nubank/Betterment/Xianyu → honesty section (6 open items) → 5 FAQ → 8-rung ladder → "wrong in one word: owns" → footer promises the data-layer post → grouped `## References` (47 URLs, all 200).

Token post footer: one sentence linking this post prepended; data-layer sentence kept.

## Execution Details

Plan: `plans/260816-0730-flutter-native-navigation-ownership-post/` (3 phases, all complete; `content-skeleton.md` is the writing contract incl. post-review corrections).

**Review** (code-reviewer subagent, 13 min): structure/artifacts/hop arithmetic/redaction/honesty/mermaid all pass; 4 majors fixed before publish — description trimmed 207→156 chars; `SystemNavigator.pop`-on-iOS claim rewritten against `FlutterPlatformPlugin.mm` (engine pops the enclosing nav controller or dismisses a presented VC; #71832 was the custom-container case, fixed 2023; #55760 dropped as exit-app); unsourced ByteDance "quote" removed from S2 row; Betterment "two years" corrected to "85% just over a year after fully adopting Flutter". Minors: FlutterBoost quote taken from README verbatim; thrio memory figures dropped (only screenshots in `alibaba/flutter_boost#933`); Nubank quote tail restored; "measured hops" → "counted"; Swift reflex snippet uses real `pushRoute`; ownership-table +6 column aligned with hop-table checkpoint B; `onPopInvokedWithResult` marked 3.22+.

**Docs perf page**: current `docs.flutter.dev/add-to-app/performance` carries no ms numbers (older versions did) — post describes the load sequence qualitatively and defers first-frame numbers to a deep dive rather than quoting a sub-report figure.

**Build**: `pnpm build` green — astro check 0 errors, 55 pages, `verify-post-bodies` 9 posts, 30 `<svg>` in the post. First build reported 8 bodies: `pubDatetime` 08:00Z was still in the future in UTC (local is +7), so `postFilter` dropped the post; set to 01:30Z.

**Deploy**: push `aed598e` → hosted build 404 for 6 min → `npx wrangler deploy` (2 min upload) → production 200, 221 KB, series hub lists #4, token footer link live. Two publishes in a row needed the fallback; worth checking the Cloudflare Workers Builds dashboard for why the hosted build stalls.

## Emotional Register

Satisfying that the hop table — cheap, illustrative, and honest about being un-weighted — turned out to be the strongest artifact: "more screens migrated, more crossings" (19→25) is the thesis in one row. Slight discomfort leaving S1 vs S2 open in print, but the alternative was a fabricated verdict, and the honesty section is the brand. The reviewer earned its keep: two of the four majors were citations that said the opposite of what the sub-report claimed.
