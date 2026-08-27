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

## Now writing: Mobile Performance

_Flutter, React Native or Native: is the framework really why your app is slow?_

[This series](/series/mobile-performance/) opens with evidence from a dozen engineering teams — Snapchat slow in native, Discord fast on React Native — plus my own A/B experiment: the same Flutter app built naive and disciplined, measured on a real device. Framework held constant; the discipline tax measured.

## Now writing: Mobile Architecture

_From MVP to millions of users: how does mobile architecture actually change?_

[This series](/series/mobile-architecture/) opens by asking which architecture layers actually keep apps alive over years — with module graphs I extracted myself from Telegram, Signal, and Element X (one, twenty-nine, and 197 modules; same product, same scale). Next: dissecting my own chat engine's layers, then measuring change-cost directly on layered vs non-layered codebases.

## Now writing: Realtime

_My app needs realtime: WebSocket, MQTT, SSE or push — which channel should I choose?_

[This series](/series/realtime/) opens with the receipts — how Messenger, Discord, Uber and Grab actually move events to phones and browsers — then digs into the part every one of those teams ended up engineering by hand: the delivery architecture above the channel — ordering, acknowledgments, dedup, and gap recovery.

## Now writing: iOS

_My app links the Rust library fine — so why can't the Notification Service Extension call it?_

[This series](/series/ios/) starts where a working app meets its first extension: the same native library, a second executable, and a build system that stops cooperating. It opens with how an app and its Notification Service Extension really share a Rust crypto core — then keeps pulling on that thread: what linking actually does, and what happens when two processes share one crypto state.

## Now writing: Mobile Debugging

_Still debugging Flutter with print()?_

[This series](/series/mobile-debugging/) starts from an uncomfortable realization: most debugging time goes into grepping logs for answers that dedicated tools give in seconds. It opens with the Flutter toolbox — Network, Inspector, Performance, Memory, Deep Links, Crashlytics — then goes native (Android, iOS), and ends where tooling is heading: structured evidence that an AI agent can reason over instead of two thousand lines of Logcat.

## Up next (order decided by what you read)

- **[E2EE](/series/e2ee/)** — _WhatsApp, Signal, Messenger, Telegram: how do they really encrypt your messages?_ Key management, multi-device, and why default E2EE took Messenger years.
- **[Building HeyDai](/series/building-heydai/)** — the meta-series: every technical choice behind this site, justified by what it needs — not by what's trendy.

This page is my public commitment. If I drift from it, call me out.
