# Chat Scenario Review — commit 8f73fca (mobile-perf-ab-demo)

Reviewer: code-reviewer | Date: 2026-08-13
Scope: lib/main_chat_{naive,disciplined}.dart, lib/shared/chat_{crypto,models,widgets}.dart, lib/shared/frame_stats.dart, tool/generate_chat_corpus.dart, tool/chat-scroll-and-dump.sh, android/app/build.gradle.kts, pubspec.yaml, README.md. Compared against lib/main_{naive,disciplined}.dart and tool/scroll-and-dump.sh. Generated assets skipped (sizes spot-checked).

## Verdict

No critical or high findings. The fairness property holds: both variants share the corpus, the exact `decryptAndParsePage` code path, and the same `MessageRow`/`ChatHeader` tree; the only differences are the four declared knobs (sync-vs-compute, single-vs-chunked insert, itemExtent, avatarCacheWidth). No artificial sleeps, no sabotage, no hidden asymmetric work. `flutter analyze` reproduced: 4 infos, all pre-existing in nature (frame_stats.dart doc-comment angle brackets + the `dart:ui` unnecessary_import, both present before this commit).

## Medium

1. **Feed scenario measurement behavior silently changed by the periodic flush** — `lib/shared/frame_stats.dart:36`. The feed entrypoints call the same `startFrameStats()`, so re-runs of `tool/scroll-and-dump.sh` will now capture tail frames (the unflushed <60 remainder) that previous runs dropped. Format is unchanged (3 columns, parser unaffected) and both feed variants are affected equally, so fairness holds — but re-run numbers are not strictly comparable to the sample set behind the published post #1 figures. Recommendation: one-line note in README or the post if feed numbers are ever re-measured; no code change needed.

## Low / informational

2. **Mounted-check asymmetry (cosmetic, no work skew)** — `lib/main_chat_naive.dart:58-65,90` has no `if (!mounted)` guards where `lib/main_chat_disciplined.dart:60,95,101` does. The page is the permanent root so this never fires; the guard costs nanoseconds and cannot skew frame stats. But since the repo's whole pitch is "identical except the four knobs", a skeptical reader may flag it. Consider adding the same guards to naive for optics.

3. **CHATLOAD stopwatch semantics differ between variants** — naive (`main_chat_naive.dart:86-92`) times decrypt+parse (+setState mark, O(1)); disciplined (`main_chat_disciplined.dart:89-94`) times the full `compute()` round trip including per-call isolate spawn and message transfer. Both are honest, but the article should not quote the two CHATLOAD ms values as the "same work" timing — the A/B metric is FRAMESTAT, and disciplined's number legitimately includes the off-thread scheduling overhead.

4. **Trigger threshold vs viewport height** — `main_chat_*.dart:_onScroll`, threshold `maxScrollExtent - 1600`. With 30 initial messages × 104px = 3120px content, a viewport ≥ ~1520 logical px (tablet/landscape) makes the first scroll event trigger an immediate load, possibly chaining. Symmetric across variants, so fairness holds; just run measurements on a phone-sized device (the scripts already assume one).

5. **Missed-interval estimate uses banker's rounding** — `tool/chat-scroll-and-dump.sh:82`, Python `round(t/budget)-1` rounds exact .5 multiples to even, occasionally undercounting by 1. It is labeled an estimate ("~N missed"); acceptable.

6. **`_loading` can leak true on unmount** — `main_chat_disciplined.dart:95`: if `!mounted` after compute, `_loading` stays true. State is defunct at that point; non-issue.

7. **`Timer.periodic` never cancelled** — `frame_stats.dart:36`. App-lifetime instrumentation in a demo; fine.

8. **vsync-wait conflates queue gaps** — `chat-scroll-and-dump.sh:71`: `totalSpan - build - raster` includes vsync→buildStart delay plus UI→raster handoff. The printed caption already hedges ("mostly for a busy UI thread"); adequate for a blog metric.

## Acceptance criteria verification

1. **Fairness — PASS.** Same corpus assets, same `decryptAndParsePage` (`chat_models.dart:96`), same `parseInitialPage` at startup, same widget tree. Naive rows are fixed-height `SizedBox(kMessageExtent)` inside `MessageRow` (`chat_widgets.dart:73`), so both builds render pixel-identical rows — naive merely pays per-row layout without `itemExtent`. Startup paths identical (both `ensureInitialized` + `startFrameStats` + initial.json load + `reportFeedDrawn`). Logging identical: one CHATLOAD line per load in both, FRAMESTAT batching shared. Only asymmetries found are items 2–3 above (no work skew).
2. **No sleeps/sabotage — PASS.** Grepped; every naive cost is a plausible real-world pattern.
3. **reverse:true mechanics — PASS.** `_loading = true` and `_nextPage++` are set synchronously before the first `await` (`main_chat_naive.dart:82-85`, disciplined `:83-88`), and `_onScroll` calls are synchronous on one isolate, so no double-fetch. Appends land past `maxScrollExtent` in a reverse list — offsets anchor to index 0, no scroll jump. Immediate re-trigger after a load is impossible: the new page adds ~5200px of extent vs the 1600px threshold. Disciplined chunk 2 is safe: chunk 1's `setState` guarantees a frame, whose post-frame callback inserts chunk 2 and releases `_loading` outside the mounted guard (no stuck flag on the live path).
4. **Crypto — PASS.** AES-256-CBC/PKCS7 via `PaddedBlockCipherImpl` (`chat_crypto.dart:21-30`), 32-byte key, per-message random 16-byte IV, identical helpers used by generator (`generate_chat_corpus.dart:115`) and app; base64/utf8 round trip symmetric; generator self-checks page_00 through `decryptAndParsePage` and throws on mismatch (`:149-155`).
5. **frame_stats — PASS.** FRAMESTAT stays 3 columns; feed script's `split()[:3]` parser unaffected. The 2s timer is shared by both chat variants (and both feed variants), fires on the UI isolate with an O(1) no-op when empty, and only moves *when* buffered lines print, not their content. See finding 1 for the feed-comparability caveat.
6. **chat-scroll-and-dump.sh — PASS.** Package names `dev.heydai.mobile_perf_ab_demo.chatnaive/.chatdisciplined` match `applicationId` + new `applicationIdSuffix`es in build.gradle.kts:53-62; component `.../dev.heydai.mobile_perf_ab_demo.MainActivity` is correct (activity class stays in the base package under a suffix). Swipe 20%→80% (downward) scrolls a reverse list toward older history — correct, and correctly inverted vs the feed script. Jank% math sound; `if not rows: sys.exit` guards all divisions; empty `loads`/`late` are safe.
7. **No regressions — PASS.** `flutter analyze`: 4 infos, pre-existing in nature. Feed entrypoints, scripts, and existing flavors untouched (diff-confirmed). `assets/data/chat/` correctly added to pubspec (Flutter asset dirs are non-recursive). pointycastle is the only new dependency.

## Recommended actions (all optional)

1. Add the missing `mounted` guards to `main_chat_naive.dart` to close the only code asymmetry (finding 2).
2. In the blog post, present CHATLOAD ms per-variant as path cost, not as an A/B "same work" comparison (finding 3).
3. If feed numbers are re-measured, note the periodic-flush tail-capture change (finding 1).

## Unresolved questions

None.
