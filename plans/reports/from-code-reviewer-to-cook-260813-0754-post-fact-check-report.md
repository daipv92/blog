# Fact-Check Report — "I Made Messages Load Fast. So Why Does Scrolling Still Stutter?"

**Reviewer:** code-reviewer | **Date:** 2026-08-13
**Post:** `src/content/posts/i-made-messages-load-fast-so-why-does-scrolling-still-stutter.md`
**Checked against:** source-verification report (260813-0640), content skeleton, raw framestats in `mobile-perf-ab-demo/measurements/` (10 protocol runs per variant, pilots 075630/075702 excluded), demo repo source, opener post.

---

## Findings (by severity)

### HIGH

**H1. "Raw logs are in the repo" is currently false.**
Location: §"Back to My Chat Screen, This Time With Numbers", Methodology paragraph — "Raw logs are in the repo."
`measurements/` is gitignored in the demo repo (`.gitignore` line 46: `measurements/`); `git ls-files measurements/` returns zero files, so no framestats logs — chat or feed — exist at `github.com/hkngoc/mobile-perf-ab-demo`. The chat variant code, corpus generator, corpus assets, and scroll script ARE tracked and pushed (local main == origin/main), so every other repo claim holds.
Fix before publishing: either `git add -f` the 20 protocol logs (plus pilots, or note their exclusion) and push, or reword to "raw logs available on request" / drop the sentence. The post's credibility posture ("no artificial sleeps... in the repo") makes a false availability claim expensive.

### MEDIUM

**M1. Load-trigger count asymmetry vs "identical total work" / "~8 times per run".**
Location: same Methodology paragraph ("crossing the load trigger ~8 times per run") and experiment intro ("identical total work").
Raw data: naive fired **8 loads/run** (9 runs; first protocol run fired 6), disciplined fired **7 loads/run in all 10 runs**. So per run the disciplined build did one page (50 messages) *less* total work than naive — the variants' totals were not identical as executed, and "~8" quietly averages an 8-vs-7 systematic difference (likely because naive jank shifts scroll positions).
Impact on conclusion: none — disciplined had 7 mid-fling load collisions per run and produced 0.0% late delivery in every one; one extra naive load cannot explain 6.3% vs 0.0%. But a reader diffing the raw logs will find it, and the post's brand is disclosure. Suggested fix: "crossing the load trigger 7–8 times per run" and scope "identical total work" to per-page work ("each load does identical work in both builds"), or add a one-line footnote.

### LOW

**L1. UI-block median: 36 vs computed 36.5.**
Location: results table, "UI thread blocked per load | 36ms (25–93)". Pooled median of all 78 naive per-load ms values is **36.5ms**; min 25 / max 93 exact. 36 vs 36.5 is a rounding-convention hair — acceptable, but "37" or "36.5" would be the strict pooled median. Verify which aggregation the harness/author intended.

**L2. Litho characterized as "built for News Feed's scroll" — not in the verification report.**
Location: §"What the Big Chat Apps Actually Do", Litho paragraph. The report verifies the 2017 date, 35% scroll number, and async-layout/incremental quotes, but contains no claim that Litho was *built for News Feed's scroll*. The announcement post does discuss News Feed usage, so this is plausible — but it is the one external characterization in the post without a line in the verification report. Suggest softening to "used in News Feed and open-sourced in 2017" or re-verifying the stronger claim.

**L3. First figure alt text over-generalizes.**
Location: alt text of `chat-scroll-frame-timeline-naive-vs-disciplined.png`: "the disciplined build never crosses the 11.1ms line." True of the depicted representative run (image verified), but 2 of 10 disciplined runs had 1–2 frames over 11.11ms (the table itself honestly discloses max 0.7%). Suggest "stays under the 11.1ms line in this run" for internal consistency.

---

## Checklist results

### a. Verbatim quotes — PASS (all 10 quoted strings match the report exactly)
- Android vitals 16ms/Choreographer quote — exact. Slow frames "between 16ms and 700ms" / frozen ">700ms" — exact (frozen quote is a clean prefix truncation).
- RN "only thread that can manipulate host views" — exact.
- RAIL 100ms sentence — exact. Nielsen paraphrased, not quoted — consistent with report.
- FB iOS 2015 "only 8 to 10 ms of main thread processing" — exact substring; attributed to iOS News Feed 2015 with 16.6ms context.
- Litho: 35%, "CPU-intensive measure and layout operations away from the main thread", "spreading the work across multiple frames" — all exact.
- LightSpeed: "Messenger... twice as fast to start" (ellipsis properly elides "is" for grammar), 84%/1.7M→360K quote exact, "SQLite as a universal system supporting all features" exact.
- Impeller "precompiles a smaller, simpler set of shaders at engine-build time" — exact.
- Fabric paraphrased (no quote marks) — consistent with report content.
- Telegram ~29,000-line class — report: 29,332 raw lines. OK.

### b. URLs — PASS
All 17 external URLs match the verification report / opener character-for-character (developer.android.com render + anr; docs.flutter.dev architectural-overview, isolates, impeller; api.flutter.dev FrameTiming; reactnative.dev threading-model + fabric-renderer; web.dev/articles/rail; nngroup response-times; engineering.fb.com 2015-06-25, 2015-01-28, 2017-04-18, 2020-03-02; DrKLO/Telegram ChatMessageCell; hkngoc/mobile-perf-ab-demo). Internal link `/posts/is-the-framework-really-why-your-app-is-slow` matches the opener slug (used twice, both correct).

### c. Measured numbers — PASS (recomputed from the 20 protocol footers)
| Post claim | Recomputed | Verdict |
| --- | --- | --- |
| Naive jank >11.1ms: 6.3% (4.2–7.2) | median 6.25 → 6.3; range 4.2–7.2 | match |
| Naive late >22.2ms: 4.6% | median 4.55 → 4.6 | match |
| ~26 missed intervals/run | median 26 | match |
| Naive worst totalSpan: 58.5 (46.2–95.9) | 58.5; 46.2–95.9 | exact |
| UI-block/load: 36 (25–93) | 36.5 (25–93) | see L1 |
| Naive vsync-wait p99: 35.9 | 35.9 | exact |
| Disc. jank: 0.0% (0.0–0.7) | median 0.0, max 0.7 | exact |
| Disc. late: 0.0% all 10 runs | 0 in all 10 | exact |
| Disc. worst: 13.1 (11.5–19.8) | 13.1; 11.5–19.8 | exact |
| Disc. vsync-wait p99: 2.2 | 2.2 | exact |
| Cadence ~91Hz | "median 11.00ms (~91Hz)" in all 20 runs | match |
| Closing "59ms → 13ms" | 58.5 → 13.1 medians; depicted run's worst 59.4 | match |
| "worst frame across all ten runs was 19.8ms" (disc.) | max 19.8 | exact |
| 10 runs/variant, alternating A/B | timestamps strictly alternate N/D | match |
| "~8 loads/run" | naive 8 (one run 6); disciplined 7 | see M1 |

Figures verified visually: naive panel shows red >22ms spikes at load moments topping ~59ms; zoom shows the 59ms frame annotated "≈ 4 frame slots".

### d. Honest-framing survivals — ALL PRESENT
(i) "neither Telegram nor Instagram has published an engineering post on scroll rendering (I looked)" — stated plainly. (ii) LightSpeed: "those are *startup and architecture* numbers — Meta published no scroll metrics for it." (iii) 11.1 vs 16.7 flagged at the TIP, budget section, methodology, results table (thresholds labeled 11.1/22.2), 100ms arithmetic (both), Telegram section ("11ms budget"). (iv) FB 8–10ms quote attributed to iOS News Feed, 2015, linked. (v) "The code is GPL; I'm describing it, not copying it." (vi) "Unlike post #1, no workload escalation was needed."

### e. Structure — PASS
§"Don't the Frameworks Handle This?" = exactly 4 paragraphs with opener link in ¶4. Near-tie bridge (0.5% vs 0.0%, matches opener's table) present in "When a Frame Is Late" with opener link. Closing question "which frame is slow, and why?" present. Frontmatter: `series: mobile-performance`, `seriesOrder: 2`, `articleType: deep-dive`; description = 155 chars (≤160). Device description consistent with opener (OPPO Reno14 5G / Android 16 / 90Hz; Flutter 3.29.3, Impeller).

### f. Internal consistency & arithmetic — PASS
1000/60≈16.7, 1000/90≈11.1, 1000/120≈8.3 ✓. 100/16.7≈6, 100/11.1≈9 ✓. 36ms ≈ three dropped 11.1ms frames (36/11.1=3.2) ✓. 59ms frame ≈ 4 extra frame slots ((59.4−11.1)/11.1≈4.3) ✓. Late-delivery threshold 22.2ms = 2× the 11.1ms budget, consistent with harness. Every external claim carries a first-party link; measured claims labeled as own measurement.

### Demo-repo reality — PASS
50-msg pages (`kPageSize=50`), 24 pages (`kPages=24`), AES-256-CBC via pointycastle (`chat_crypto.dart`), ~30% messages with 8KB thumbnail (`kLinkPreviewProbability=0.30`, `kThumbnailBytes=8192`), reversed list (`reverse: true` both variants), base64→AES decrypt→JSON parse→model map order matches post (`decryptAndParsePage`/`_decryptMessage`), naive = sync on UI isolate in scroll path + single 50-item setState + no itemExtent + full-res avatars, disciplined = same `decryptAndParsePage` via `compute()` + two-chunk insert + `itemExtent` + `cacheWidth`, avatars 3000px assets (`IMAGE_SIZE=3000`) at 36px (`kAvatarSize=36`), deterministic generator (`Random(20260813)`).

---

## Verdict

**Publishable after one required fix (H1) and one recommended wording fix (M1).** Every quote, URL, and statistic checks out against primary sources and raw data; all six honest-framing commitments survived into the final prose. The only outright false statement is "Raw logs are in the repo" — the logs are gitignored and absent from the public repo. Fix that (push the logs or reword) before publishing; adjust the 7-vs-8 load-count phrasing while in there.
