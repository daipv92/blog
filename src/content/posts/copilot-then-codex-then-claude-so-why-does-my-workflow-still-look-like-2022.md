---
title: "Copilot, Then Codex, Then Claude — So Why Does My Workflow Still Look Like 2022?"
description: "Three tool migrations, zero workflow changes. What METR, DORA 2025, and my E2EE work taught me about using AI vs. redesigning around it."
pubDatetime: 2026-08-28T13:30:00.000Z
featured: false
draft: false
tags:
  - ai-native-dev
  - ai-assisted-development
  - developer-workflow
  - verification
series: ai-native-dev
seriesOrder: 1
articleType: big-question
---

I am not an AI expert. I'm a mobile developer who works on messaging and E2EE systems, and over the last few years I've done what most of us did: adopted Copilot when it appeared, moved to Codex when it was clearly better, moved to Claude when that was clearly better again. Each migration felt like progress. Autocomplete got smarter, generated tests got longer, explanations got sharper.

Then at some point I looked at my actual workflow — read the ticket, open the files, write the code, ask the AI when stuck, review, ship — and realized something uncomfortable. It was my 2022 workflow. Every step was faster. Not one step was different.

That gap — between *using better tools* and *working differently* — is what this post, and this series, is about.

> [!TIP]
> **Stop asking "which AI tool is best?" and start asking: "if producing this became nearly free, what would I now have to verify — and what does *that* cost?"** AI changes the economics of software work, but only where verification doesn't eat the savings. Everywhere else it just changes the invoice.

That's a strong claim, and the honest version of this post has to start with the best evidence *against* it.

## Table of contents

## The Null Hypothesis: You're Slower and You Feel Faster

In 2025, [METR ran a randomized controlled trial](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) with 16 experienced open-source developers working on their own mature codebases — 246 real tasks, AI allowed on a random subset. Before starting, the developers predicted AI would speed them up by 24%. Afterwards, they estimated it *had* sped them up by about 20%.

Measured reality: they were **19% slower** with AI.

Sit with that, because these weren't tool tourists. They were exactly the developers the advice columns say should thrive with AI: deep codebase knowledge, strong review instincts, years of accumulated judgment. They still lost time, and — this is the part that should bother you — they *couldn't feel it*.

The industry-wide numbers rhyme with this. The [2025 Stack Overflow survey](https://survey.stackoverflow.co/2025/ai) found 84% of developers using or planning to use AI tools, while only about 3% highly trust their output — and 66% report being frustrated by AI code that is *almost* right. In my experience that's the expensive kind: honestly wrong code announces itself, while almost-right code has to be caught. The [2025 DORA report](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report) found AI adoption now increases throughput but still *decreases* delivery stability: the code arrives faster, and the problems arrive faster with it.

So here is the intellectually honest framing, and it's the frame for everything that follows: **the null hypothesis is that AI makes you slower while making you feel faster.** METR itself labels the result as a snapshot — early-2025 models, one population, one setting — but the burden of proof sits with us, not with the tools. Any workflow change I make has to argue its way past that result, with something better than vibes.

Which raises the obvious question: if experienced developers with good instincts couldn't feel a 19% slowdown, what exactly *would* beat the null hypothesis?

Note what the study did and didn't measure. It measured developers *inserting AI into their existing workflow* — my 2022 loop, with an assistant bolted on. It didn't measure workflows redesigned around what generation being cheap actually changes. That's not a loophole that rescues AI optimism; it's a hypothesis that has to be earned. The rest of this post is what earning it looks like from inside my own work.

## The Trap: Your Old Workflow, Faster

My Copilot → Codex → Claude arc was three rounds of the same purchase: a faster horse for the same route. Autocomplete is the clearest example. It optimizes the *typing* step of a workflow whose expensive steps were never typing. In my messaging work, the cost lives in understanding session state across devices, in knowing which invariants a migration must preserve, in figuring out why a message decrypted on one device and not another. Typing was maybe 15% of the job. A tool that makes typing 40% faster speeds up the whole job by six percent (40% of 15%), and that's before you pay the review tax — remember the 66% "almost right" number.

This is what I'd call local optimization: each step gets faster, the shape of the loop never changes. It feels like progress because every day contains small wins. It fails to show up in delivery numbers because the bottleneck steps — deciding, verifying, integrating — were never the steps being accelerated. DORA's throughput-up, stability-down finding is what this looks like at industry scale.

The tell, for me, was that I could not name a single thing I had *stopped doing* since 2022. Tools changed three times; the loop survived untouched.

## The Question That Actually Changes Things

The reframe that broke the pattern for me is an economic one. Don't ask "how can AI help with this task?" Ask: **"this task's process was designed when certain things were expensive. Which of those things are still expensive?"**

Code review is a concrete example. We review one implementation because producing implementations used to be costly — you'd never build three variants of a feature to compare. Test suites cover the happy path plus a few edges because each test case cost engineer-minutes. Research means "check the docs and pick the familiar option" because genuinely surveying how Signal, Matrix, or Chromium solved your problem used to be a multi-day detour.

Every one of those process shapes is a fossil of a cost structure that AI has, in places, genuinely changed. But — and this is where the null hypothesis earns its keep — *only in places*. So I use a two-part test before I change any process:

1. Did the marginal cost of one more attempt (one more variant, one more test case, one more source read) actually drop by an order of magnitude?
2. Did the cost of *verifying* the output stay roughly flat — or did verification inflate to eat the savings?

Both must hold. If generation got cheap but every output needs line-by-line expert review, the cost structure didn't change; only the invoice did. You've replaced writing with reviewing — and if that's the whole trade, the METR result suggests it can quietly come out at a loss.

Working in E2EE makes this test easy to internalize, because my domain is full of tasks that fail part two. You cannot "looks right" a key-rotation protocol. Code that touches a trust boundary gets read line by line no matter who or what wrote it, so generation speed is nearly irrelevant there — in E2EE, generation was never the bottleneck; conviction was. That's precisely what makes the tasks that *pass* the test stand out so sharply.

## Three Workflows That Passed the Test

These are the three redesigns that survived contact with my actual work. I run all three; each comes with the failure mode I hit, because every one of them has a way of quietly turning into false confidence.

### Review roles instead of a review pass

Review used to be one pass by one brain trying to hold correctness, architecture, and security simultaneously. Now I run role-separated AI review — one pass hunting correctness bugs only, one checking the change against architectural boundaries, one on security posture — before a human (often me, sometimes only me) does the final read. The economics work because a specialized pass is cheap to run and I only act on findings I can independently confirm.

The failure mode: AI reviewers are high-recall, low-precision. Left unmanaged, three reviewers triple the comment volume, not the insight, and you develop the same dismiss-all reflex linters teach. Worse, "the AI reviewers passed it" starts to *suppress* your own scrutiny. My rules: findings must be blocking-severity to surface at all, and any review role whose findings I keep dismissing gets deleted. **A reviewer you've learned to ignore is worse than no reviewer**, because it still costs attention and now provides cover.

### Invariants first, then generated tests

Happy-path-plus-some-edges was rational when each test cost minutes to write. Now I start by making the AI enumerate the *invariants* of the code under test — what must hold for every input, every interleaving — and I review that short list carefully, because it's the part I can actually verify with domain knowledge. Only then does it generate adversarial cases against those invariants. For messaging code — ordering guarantees, idempotent delivery, migration safety — this has caught real bugs my hand-written suites missed.

The failure mode: generating 500 test cases nobody vets is not testing, it's manufacturing false confidence at scale, plus a flaky-suite maintenance bill that arrives forever. The leverage point is the invariant list — ten lines a human can actually hold in their head — not the case count.

### Research before deciding, hypotheses before reading

This one changed my decisions most. Before, "research" meant reading the docs of the option I already suspected I'd pick. Now, before any significant design call, I have AI survey how the systems I respect actually solved the problem — Signal's implementation, Matrix's spec discussions, issues in the repos that hit this exact wall. For [the realtime-channel post](/posts/my-app-needs-realtime-websocket-mqtt-sse-or-push/) and the E2EE series, this surfaced prior art I'd simply never have found on a deadline.

The failure mode: AI summaries of unfamiliar megarepos are confidently wrong in ways that someone unfamiliar with the repo — you, by definition — cannot detect. So the rule is: AI output here is a *reading list, not an answer*. It generates hypotheses about which files and design docs matter; I read the actual code before anything becomes a decision. AI compresses the search; it doesn't get to do the confirming.

## The Skill That's Actually Appreciating

Notice what those three workflows have in common. In each one, the scarce human contribution moved *up*: from writing the artifact to specifying what "correct" means and designing how correctness gets checked. The developers getting real leverage from AI aren't the ones with better prompts. They're the ones with better verification — tighter invariants, sharper review filters, cheaper ways to confirm or kill an AI claim.

Kent Beck saw the shape of this remarkably early — April 2023, before most current tooling existed: ["The value of 90% of my skills just dropped to $0. The leverage for the remaining 10% went up 1000x."](https://x.com/KentBeck/status/1648413998025707520) The re-weighted 10% is problem framing, system design, and judging results. Andrej Karpathy's more recent framing of [agentic engineering](https://karpathy.bearblog.dev/sequoia-ascent-2026/) draws the same line from the other side: vibe coding raises the floor, but keeping the *ceiling* — production quality — requires spec design, diff inspection, and test loops. And Birgitta Böckeler's [one-line model](https://martinfowler.com/articles/exploring-gen-ai/i-still-care-about-the-code.html) is the reason why: "LLMs are NOT compilers, interpreters, transpilers or assemblers of natural language, they are inferrers." A compiler earns trust once. An inferrer has to be checked every time — so the ability to check *cheaply* becomes the whole game.

There's a real limit to what you can hand over, though. You can outsource reading, searching, boilerplate, even large parts of implementation. You cannot outsource the understanding you'll need to judge the output — for my work: concurrency, consistency, security boundaries. The evidence that this line exists is uncomfortable and worth stating plainly. A [2026 study of 52 junior engineers](https://arxiv.org/html/2601.20245v1) learning an async Python library found the AI-assisted group scored about 17% lower on comprehension than the control group — with the largest gap in debugging, which is exactly the skill you need when AI output goes wrong. And after a March 2026 outage, [Amazon began requiring senior sign-off](https://the-decoder.com/amazon-makes-senior-engineers-the-human-filter-for-ai-generated-code-after-a-series-of-outages/) on AI-assisted code from junior and mid-level engineers. The trajectory from AI user to AI-native developer is real, but nobody drifts into it — it takes deliberate scaffolding, whether your own or your org's.

If you're early in your career, the honest version of "don't outsource understanding" needs to be mechanical, because the judgment it usually relies on is the thing you're still building. The rule I'd give: **use AI freely for code you could write yourself, slowly; be suspicious of it for code you couldn't write at all.** And if a bug in the generated code would page someone at 3 a.m., that's understanding-territory — type it yourself, or interrogate the AI's version line by line until you could have.

## Curiosity, Aimed Correctly

If there's a mindset underneath all of this, it isn't "be excited about AI" and it isn't "master every new tool." It's curiosity pointed at three targets, in ascending order of value:

1. **Capability** — what can this model do that the last one couldn't? Necessary, cheap, and where most people stop.
2. **Workflow** — given that capability, should the way I build software change shape? This is where the cost-structure question lives.
3. **Limits** — where does it reliably fail? Wrong assumptions, out-of-scope edits, tests that pass while the invariant breaks, hallucinated APIs. This is the expensive curiosity, and the one that feeds verification design.

I used to frame this as two developer archetypes — the tool collector versus the workflow designer — and declare the second one the future. I've dropped the dichotomy, because it's a strawman: nobody identifies as a tool collector, and honestly, promiscuous tool-trying is often how workflow insight *starts*. Capability curiosity is the larval stage of workflow curiosity. The failure isn't trying tools; it's never graduating from "what can it do" to "what should I now do differently, and how will I know it's working."

To be clear about epistemic status: the claim that workflow-and-verification curiosity is the durable career bet is my opinion — there's no study comparing tool collectors to workflow designers, and given the METR result, anyone claiming certainty here is selling something. What would change my mind: rigorous evidence that redesigned, verification-first workflows *also* produce the perception gap — that people like me are 19% slower too and can't feel it. Which is exactly why my three workflows above each carry a measurable kill-switch: reviewers get deleted when their precision drops, generated tests live or die by the invariant list, research output is only ever a reading list. Measured, not assumed — [the same discipline this blog applies to framework performance claims](/posts/is-the-framework-really-why-your-app-is-slow/).

## The Weekly Question

The habit that ties this together costs five minutes a week: **"What did I do manually this week that will eventually look as absurd as hand-formatting code looks now?"**

Not "absurd in six months" — I don't know the timeline, and neither does anyone else. But code formatting is the right anchor: it was once a genuine engineering activity, with style debates and review comments, and then it became a tool's job so completely that doing it by hand now signals something went wrong. Some of what you and I did this week is in that category. The METR study says we can't trust our feelings about which parts. The cost-structure test — generation an order of magnitude cheaper *and* verification not proportionally worse — is how I try to find out anyway.

Three tool migrations taught me almost nothing. One changed question taught me a lot. That seems worth a series.
