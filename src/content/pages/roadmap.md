---
title: "Roadmap: The Questions This Blog Exists to Answer"
description: "HeyDai's content backbone: big engineering questions, real case studies from my own systems, and the deep dives that close the gap."
---

Most tech blogs explain technologies. This blog does something different: it starts from a **big engineering question**, studies how the industry answers it, compares that against **systems I actually built**, and then digs down until the gap is closed.

Every series follows the same arc:

1. **Big Question** — industry research, opens the problem
2. **Case Study** — my own implementation, honestly measured
3. **Deep Dive** — the fix: algorithms, benchmarks, code

And one rule I hold myself to: **every article contains at least one original artifact** — a benchmark I ran, a measurement from a real system, or code from my own engine. No secondhand explainers.

## Now writing: Message Systems

_How do Messenger and Telegram load thousands of messages almost instantly?_

Open a chat with years of history and messages appear before your finger leaves the screen. Local database? Cache? Cursors? Prefetch? Background sync? [This series](/series/message-systems/) answers it — then puts my own Message Cursor Engine on the bench next to Telegram and publishes the numbers, including the unflattering ones.

Planned articles: the loading architecture of major messengers · inside my cursor engine · why it was still slow with a local DB · offset vs keyset vs snapshot pagination (with runnable benchmarks) · measuring chat-open time against Telegram · what I changed and what it bought.

## Up next (order decided by what you read)

- **[E2EE](/series/e2ee/)** — _WhatsApp, Signal, Messenger, Telegram: how do they really encrypt your messages?_ Key management, multi-device, and why default E2EE took Messenger years.
- **[Mobile Performance](/series/mobile-performance/)** — _Flutter, React Native or Native: is the framework really why your app is slow?_ What actually determines time-to-interactive, measured.
- **[Mobile Architecture](/series/mobile-architecture/)** — _From MVP to millions of users: how does mobile architecture actually change?_ Architecture as a response to problems, not a diagram to copy.
- **[Building HeyDai](/series/building-heydai/)** — the meta-series: every technical choice behind this site, justified by what it needs — not by what's trendy.

This page is my public commitment. If I drift from it, call me out.
