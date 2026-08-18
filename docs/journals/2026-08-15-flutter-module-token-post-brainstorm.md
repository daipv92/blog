# 260815 — Flutter module token: 2-act article pivots to reveal refresh logic as the real structural decision

## What changed

Brainstorm on "Flutter module lấy token từ native Host" ended with a Vietnamese blog article (~3.6k words) that fundamentally reframed the architecture problem. Started as 1-act (token flow + composition root). Pivoted to 2-act funnel after three findings surfaced that changed what the article reveals.

**New findings baked into skeleton:**

1. **Refresh was missing** — became Reveal 3. Original outline stopped at "inject AuthorizedClient" without explaining *why* (why not inject `TokenProvider` instead?). Added single-flight Mutex/actor logic, retry-401-once, `SessionEvent.expired` broadcast. The real answer: injecting capability (not token) solves refresh race conditions when three packages 401 simultaneously after network sleep.

2. **"Flutter không cần token" only conditionally true** — added Dart branch. E2EE and Media use native networking (no token flow). Feature X is pure Dart + dio. Needed `host_auth` package: interceptor → native `authorize()` channel ← single ownership (platform team). Two composition roots (native `Application.onCreate` + Dart `main()`), one owner.

3. **Title 2 spoiled the twist** — original outline revealed "dependency direction" before "capability injection". Moved to subtitle. Title 1 stays naive question (keeps SEO + click-through).

## Decisions (user)

1 article, 2 acts; Vietnamese; ~3.5–4k words. Capability = `AuthorizedClient` (not `TokenProvider`). Monorepo include-source packaging (Gradle `includeBuild`, SPM `path:`). Title structure: simple H1 + subtitle explaining why the question is broken. Skeleton 11 parts approved before writing.

## Artifacts

Design report: `plans/reports/brainstorm-260815-1431-flutter-module-token-native-host-article-report.md`.
Article: `docs/flutter-module-token-native-host.md` (3.6k words, 2-act + 9-step climb + 5-point checklist + transition note).

---

Status: DONE
Summary: Brainstorm on Flutter module architecture resulted in 2-act Vietnamese blog article revealing refresh logic and capability injection as core insights.
