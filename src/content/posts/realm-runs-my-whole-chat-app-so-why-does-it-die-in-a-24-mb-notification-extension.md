---
title: "Realm Runs My Whole Chat App — So Why Does It Die in a 24 MB Notification Extension?"
description: "Realm crashes at init inside the iOS Notification Service Extension's 24 MB budget. The real causes — schema discovery, an encrypted page cache, cross-process sharing Realm only added in 2023 — and what Signal does instead."
pubDatetime: 2026-08-27T10:45:00.000Z
featured: false
draft: false
tags:
  - realm
  - sqlite
  - ios
  - notification-service-extension
  - local-storage
  - chat
series: mobile-architecture
seriesOrder: 7
articleType: deep-dive
---

In [the local-storage post](/posts/how-do-messengers-store-millions-of-messages), I ended with six questions that pick a storage engine better than any benchmark chart. My chat app (a production app; details anonymized) had answered all six and landed on Realm for the message store. Reactive queries, object-shaped data, one runtime — a defensible pick.

Then I tried to do the thing every serious chat app does: when a push notification arrives, use the Notification Service Extension to decrypt the message and persist it, so the conversation is already on disk when the user taps the banner. And I met this:

```text
Thread 2: EXC_RESOURCE (RESOURCE_TYPE_MEMORY:
high watermark memory limit exceeded) (limit=24 MB)
```

That is a real crash log — from [realm-swift issue #8606](https://github.com/realm/realm-swift/issues/8606), an encrypted Realm dying not on a query, not on a write, but **inside `Realm.init`**. The process was killed before the app's own code did anything at all.

The reflex explanation — the one I almost wrote this article around — is _"Realm memory-maps the database file, so opening it loads too much into RAM."_ That explanation is wrong, and the actual answer is more interesting:

> [!TIP]
> **Opening a database is not free, and what it costs depends on the engine's architecture, not the file's size.** Realm's expensive parts in a 24 MB process are schema discovery, the encrypted-page cache, and a cross-process configuration Realm only began supporting for encrypted files in 2023 — the memory-mapped file is the one part that's nearly free. The previous post's sixth question — _who needs to read the database?_ — turns out to carry a price tag: **every reader is a resource contract, and the weakest process sets the budget.**

That claim needs receipts, so this post does three things: it walks through what Realm's engine actually does when you open it — shadow paging, MVCC, zero-copy accessors, straight from realm-core's own docs and source; it identifies the three mechanisms that really consume a Notification Service Extension's budget, each backed by maintainer statements or engine source rather than folklore; and it looks at how Signal and Telegram — both open source — solved the same push-decrypt-persist problem, before ending with the only Realm-vs-SQLite benchmark data I'd actually cite.

## Table of contents

## The Room: 24 MB, 30 Seconds, No Warranty

One paragraph of constraints, because [this blog's iOS series has covered the extension environment before](/posts/ios-has-six-ways-to-run-in-the-background-which-one-actually-delivers-my-message): a Notification Service Extension is [a separate executable in a separate process](/posts/the-app-links-cryptocore-fine-so-why-cant-the-notification-extension-call-it), woken per notification, given about 30 seconds before [`serviceExtensionTimeWillExpire`](https://developer.apple.com/documentation/usernotifications/unnotificationserviceextension) fires. Apple's documentation states no memory number, but Apple's own Developer Technical Support engineers do, in writing: ["NSE resource limits: Time Limit 30 seconds. Memory Limit: 24 MB (includes all code, data, libraries, and frameworks)"](https://developer.apple.com/forums/thread/761212) — and, in another thread, advice that reads like this article's abstract: ["Avoid databases/high-memory operations in the extension due to limited memory and runtime."](https://developer.apple.com/forums/thread/803094) The limits are enforced by the OS, and Apple's DTS warns that [they have changed before and may change again](https://developer.apple.com/forums/thread/73148) — a warning posted about a sibling extension class, but the philosophy generalizes — so treat 24 MB as an observed ceiling to measure against, not a contract.

Everything below is about what a database engine does inside that room.

## The Wrong Suspect: "Realm Maps the Whole File Into RAM"

Realm does memory-map its file. The conclusion people draw from that — big file, big RAM — doesn't follow. realm-core's own [architecture primer](https://github.com/realm/realm-core/blob/master/doc/primer/primer_files.md) describes how the mapping actually works:

> "The file is memory mapped, and objects in it are referenced with an offset from the start of the file. … The whole file is not mapped contiguously... So the memory is mapped in chunks. The chunks increase exponentially in size."

A memory-mapped file costs **virtual address space** up front and physical RAM only for the pages you actually touch; an untouched B-tree node lives on disk, with the OS free to evict any clean page whenever it likes. Inserting one message touches a handful of 4 KB pages regardless of whether the file holds ten messages or ten million.

The measurements agree. In [a long performance thread](https://github.com/realm/realm-swift/discussions/8194), Realm's lead Cocoa engineer reported that reopening an existing Realm file takes about 5 ms, and that a **10 GB** file initializes essentially as fast as a 50 MB one — because open "generally do[esn't] touch any of the actual data." An empty Realm inits in ~0.015 s. Whatever killed that extension at `Realm.init`, it was not the size of the database.

So what does `Realm()` actually spend its time and memory on? To answer that, it's worth understanding the engine — which is the part of this story that made me respect Realm more, not less.

## What `Realm()` Actually Buys You: The Engine in Three Mechanisms

### A commit is a new tree, two pointers, and one bit

Realm's crash safety is _shadow paging_, and the [primer](https://github.com/realm/realm-core/blob/master/doc/primer/primer_files.md) describes the whole mechanism in one breath: the file header holds **two top pointers and a switch bit**. Data lives in a copy-on-write B+ tree (current realm-core groups objects' column data into "cluster" leaf nodes). A write transaction never edits pages in place — it writes new copies of every changed node up to a new root, `fsync`s them, and then flips the switch bit to point at the new root:

> "First, the top pointer is updated and then the switch bit is updated. If that fails, you will lose all the recent changes, but the database will still be readable."

Crash at any moment and the old root is still intact — no write-ahead log, no replay on next launch. That's a genuinely elegant design; SQLite needs a journal or WAL file to get the same guarantee.

### MVCC: readers pin a version, and old versions cost file space

Because commits never mutate old nodes, a consistent read snapshot is free by construction: a reader just remembers "my root is version N" and that tree is immutable forever. This is Realm's MVCC — no locks for readers, no copying for snapshots. The price appears somewhere else: as long as any thread pins version N, the pages belonging to N can't be recycled, so **the file grows with write volume while old versions stay pinned**. This bit Realm hard enough that they re-architected it — the [release notes](https://github.com/realm/realm-swift/blob/master/CHANGELOG.md) for Core PR #5440 record that pinning one old version used to block reclaiming space for _that version and every later one_, and was fixed to pin only the pages the old version actually needs. The classic symptom — a `.realm` file several times larger than its data, usually caused by a background thread holding an un-refreshed Realm instance — is why [`shouldCompactOnLaunch`](https://www.mongodb.com/docs/atlas/device-sdks/sdk/swift/realm-files/compacting/) exists, and why that callback firing means a synchronous whole-file rewrite inside whatever process triggered it.

### Zero-copy: an object is a view, not a copy

The third mechanism explains Realm's famous read speed. A Realm `Object` is not a materialized struct filled with copied field values — in realm-core source, the accessor class [`Obj`](https://github.com/realm/realm-core/blob/master/src/realm/obj.hpp) is constructed from a table reference, a `MemRef` — literally a reference into the mapped file — and a key. Reading a property dereferences through that handle into the file's pages at access time. Queries are lazy for the same reason: a `Results` is a description of matches, and nothing is read until you touch a specific object's specific property. This is why Realm can win read benchmarks — there is no deserialization step at all — and it's also why objects are thread-confined and "invalidate" when their backing version goes away: the object _is_ the file region.

Here's the point of the tour: all three mechanisms are cheap in exactly the dimension people fear — none of them requires loading data into RAM. The costs that killed my extension live in three other places, and each one has a paper trail.

## The Three Real Ways Realm Eats a 24 MB Budget

### 1. Schema discovery: you pay for every model in the process, not every row in the file

The best-documented cause, confirmed by Realm's maintainers across multiple issues. Unless you say otherwise, `Realm.init` has to figure out what your data model is — and in Swift, [that means instantiating every `Object` subclass it can find](https://github.com/realm/realm-swift/discussions/8194), found by enumerating **the entire Objective-C runtime class list** (`objc_copyClassList`, [the allocation site where extension crashes point](https://github.com/realm/realm-swift/issues/8026)). Thomas Goyne, Realm's long-time Cocoa lead, [spelled out what that costs in a memory-constrained process](https://github.com/realm/realm-swift/issues/8641):

> "In a memory-constrained environment you need to set `objectTypes` on your Realm.Configuration. […] A large portion of the increase in memory usage is that automatically discovering the `Object` subclasses forces an eager load of all of the lazily-loaded linked libraries. We create a subclass of each of your model types at runtime, and those cannot be freed."

Read that against a 24 MB ceiling: class-list enumeration scales with every framework linked into the process, forces lazily-loaded libraries resident, and leaves one unfreeable runtime subclass per model — cost proportional to your app's **schema surface**, paid before the first byte of message data. It also explains the numbers from the wrong-suspect section: in the same thread, an app with 254 models and 2,153 properties measured ~0.67 s of init dominated by schema work (trimmed by removing `= List<Int>()`-style default values, which are constructed on every instantiation), while file size didn't matter at all.

The fix is one line — `config.objectTypes = [Message.self, Conversation.self, …]`. In [the crash that opened this article](https://github.com/realm/realm-swift/issues/8606), the maintainer's diagnosis was exactly this: the crashing configuration specified no `objectTypes` at all. And there's a trap even for teams that do set it, documented in [issue #8167](https://github.com/realm/realm-swift/issues/8167): it must apply to the **first** Realm opened in the process. That team had it configured correctly, but one stray earlier `Realm()` without it triggered auto-discovery anyway, and the cost was already paid.

### 2. Encryption: a page cache the OS cannot evict

My app is end-to-end encrypted, so the local store is encrypted too — and this is where the mmap story genuinely changes, in a way I've never seen a Realm tutorial mention. The evidence is realm-core's own [`encrypted_file_mapping.cpp`](https://github.com/realm/realm-core/blob/master/src/realm/util/encrypted_file_mapping.cpp):

```cpp
// Encryption is performed on 4096 byte data pages. Each group of 64 data pages
// is arranged into a "block", which has a 4096 byte header containing the IVs
```

The file on disk holds only ciphertext, so the OS's clean-page eviction trick no longer applies: plaintext can't be backed by the file. Realm therefore runs its **own userspace page cache** — a `read_barrier` decrypts 4 KB pages into memory Realm owns, a `write_barrier`/`flush` re-encrypts dirty pages on the way back to disk. Every page an encrypted Realm touches becomes ordinary resident allocation, held as long as Realm's cache keeps it, invisible to the OS's reclaim machinery. One insert touches more pages than the earlier "handful" suggests — the object's cluster leaf, each indexed property's index tree, the path of copied nodes up to the new root, free-list metadata. Unencrypted, those are the cheap, evictable kind; encrypted, each one is now real RAM inside the 24 MB. (For throughput, [Realm's docs state](https://www.mongodb.com/docs/atlas/device-sdks/sdk/swift/realm-files/encrypt-a-realm/) that "reads and writes on encrypted realms can be up to 10% slower than unencrypted realms"; the _memory_ profile change is the part that matters here.)

### 3. Cross-process sharing: supported late, and never free

This is the finding that reframed the whole problem for me — and it needs a date to be told honestly. Realm has supported multi-process access since v0.92: main app and extension share one file in an app group, coordinated through named pipes. But for most of Realm's life, that support explicitly excluded encrypted files. The request to allow it — [realm-core #1845](https://github.com/realm/realm-core/issues/1845) — stayed open from 2016 to 2023; [Realm's own docs record](https://www.mongodb.com/docs/atlas/device-sdks/sdk/swift/realm-files/encrypt-a-realm/) that SDK versions through 10.37.2 threw a literal `Encrypted interprocess sharing is currently unsupported.` at any second process; support finally shipped in [realm-swift 10.38.0, March 2023](https://github.com/realm/realm-swift/blob/master/CHANGELOG.md).

Put the pieces together: an E2EE chat app encrypts its Realm, and push-decrypt-persist requires the extension and the main app to open that Realm from two processes. On anything below 10.38.0 — and the crash that opened this article was filed on Realm 10.7.4, well below that boundary — this is not "Realm being fragile"; it's a configuration the engine explicitly rejected. The tracker shows what that era looked like: ["Realm file decryption failed"](https://github.com/realm/realm-swift/issues/4417) when sharing an encrypted Realm with an extension (closed as a duplicate — the pattern was already on file), and a [watchdog kill from two processes writing concurrently](https://github.com/realm/realm-swift/issues/6313) — the main app terminated after exhausting its 29-second allowance with `File::lock` on the stack, waiting on the extension. And on 10.38.0 or later, support removes the error, not the bill: the schema cost and the encrypted-page cache are still paid inside the extension, and the locking discipline whose absence #6313 illustrates is still yours to enforce.

Two adjacent traps deserve a sentence each, because both masquerade as memory crashes. First, extension processes are **reused** across notifications — [one developer found state accumulating across deliveries](https://alastaircoote.github.io/notification-service/), so a per-notification cost that "fits" once can still die on the fifth push. Second, an NSE runs while the phone is locked; if the database file carries `NSFileProtectionComplete`, [opening it fails outright](https://github.com/realm/realm-swift/issues/4237) no matter how much memory you have — messaging apps need `…CompleteUntilFirstUserAuthentication` on shared files.

## How the Apps That Ship This Actually Do It

The previous post graded messengers' storage choices by evidence; the same sources answer this problem, because two of the three are open source.

**Signal writes to the real database from the extension — on SQLCipher, after fixing the OS.** Signal's [`SignalNSE/NotificationService.swift`](https://github.com/signalapp/Signal-iOS/blob/main/SignalNSE/NotificationService.swift) stands up a full GRDB connection to the shared app-group database and reads and writes it during notification handling — proof that "encrypted shared store, written by the extension" is achievable. But look at what it took. iOS permits a suspended process to hold a lock on a shared-container file only if it can recognize the file as SQLite by reading its header; SQLCipher encrypts the header, so iOS killed Signal with the infamous `0xdead10cc`. Signal's fix, [reported upstream by a Signal engineer in 2017](https://github.com/sqlcipher/sqlcipher/issues/255) and [threaded into GRDB](https://github.com/groue/GRDB.swift/issues/302), was `PRAGMA cipher_plaintext_header_size=32` — leave the first 32 bytes (pure format metadata) unencrypted so the OS can identify the file. One pragma, aimed at exactly the layer that was failing. **That is the sharpest contrast in this story: SQLCipher's encrypted-cross-process problem was solved with a header tweak in 2017; Realm shipped support for the equivalent configuration six years later.** Budget still matters on their stack too — [a GRDB user profiling an NSE](https://github.com/groue/GRDB.swift/issues/755) found ~600 KB, 2.5% of the room, going to a pluralization table the app never used. Engines bill you before your first row.

**Telegram gives the extension a narrow job.** Telegram-iOS's [NotificationService target](https://github.com/TelegramMessenger/Telegram-iOS/blob/master/Telegram/NotificationService/BUILD) links Postbox and MtProtoKit; the extension [fetches a notification decryption key out of storage](https://github.com/TelegramMessenger/Telegram-iOS/blob/master/Telegram/NotificationService/Sources/NotificationService.swift), decrypts the payload, and spends most of its visible code on rendering — avatars, media thumbnails — not on syncing the message store. And a correction to an assumption I've seen (and held): Postbox is not some exotic engine — it's a hand-rolled key-value layer, [`SqliteValueBox`](https://github.com/peter-iakovlev/Postbox/blob/master/Postbox/SqliteValueBox.swift), on top of SQLite — SQLCipher-encrypted, per community walkthroughs of the modules.

**The commercial SDKs quietly agree.** [Sendbird's extension guidance](https://sendbird.com/developer/tutorials/notification-extension) covers decrypting and mutating notification content and marking delivery — not persisting messages from the extension. Stream's is equivalent; [FCM's](https://firebase.google.com/docs/cloud-messaging/ios/send-image) uses the NSE for media attachment only. No vendor tells customers to run their persistence stack inside the NSE. WhatsApp and Messenger publish nothing verifiable about their extensions — claims about WhatsApp's NSE circulating online trace back, on inspection, to an engineering blog post that never mentions WhatsApp; the honest statement is that only the open-source messengers show their homework.

**And the minimal end of the spectrum exists too:** WeChat's [MMKV](https://github.com/Tencent/MMKV) — an mmap key-value store, under 30 KB of binary per architecture, with a dedicated `MMKVAppExtension` pod and multi-process support — is what "storage designed for this room" looks like. (Its iOS cross-process setup has sharp edges around app-group paths; treat it as a candidate to test, not a proven drop-in.)

## The Architecture That Falls Out

Three viable shapes, now with evidence attached:

| Shape                                                                          | Who does it                                              | What it demands                                                                                                                                                            |
| ------------------------------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extension writes the canonical DB directly                                     | Signal                                                   | An engine that supports encrypted cross-process access (SQLCipher + plaintext header; Realm only since 10.38.0), disciplined budget management, `0xdead10cc`-aware locking |
| Extension decrypts, persists nothing durable                                   | Default for most apps; effectively FCM/Sendbird guidance | Nothing — but you lose preloading; the conversation still syncs after open                                                                                                 |
| Extension writes a tiny **mailbox**; main app reconciles into the canonical DB | Pattern the vendor SDKs converge toward                  | A cheap-to-open handoff store (a file, MMKV, a minimal SQLite) + drain/dedup logic in the app                                                                              |

For my app the decision follows from the three mechanisms rather than taste: the canonical store is an **encrypted Realm**, so a direct write means paying schema discovery plus a decrypted-page cache inside the 24 MB room, on a cross-process configuration Realm has supported only since 10.38.0, with the lock-contention failure mode of the watchdog kill above waiting if either process misbehaves. The mailbox it is: the extension decrypts and appends `{messageId, conversationId, plaintext, serverTimestamp}` to a small append-only store in the app group (file protection `…UntilFirstUserAuthentication`), and the main app drains, deduplicates, and commits into Realm on launch. The extension never learns the schema, never pays for it, and can't corrupt the store it never opens.

If your Realm is _not_ encrypted, direct write is defensible — with the checklist this article assembled: `objectTypes` on the first open of the process, minimal model set linked into the extension target, never write from both processes concurrently, and profile across repeated deliveries because the process is reused.

And if you're choosing an engine today for a store that multiple processes must open? That requirement now sits above the API-comfort questions, and it points at SQLite-family storage — not because of a benchmark, but because process-boundary behavior is a first-class, documented, Signal-hardened concern there.

## The Benchmark Postscript

The [previous post](/posts/how-do-messengers-store-millions-of-messages) argued against choosing by benchmark; this one ends with the two benchmark facts actually worth keeping.

First: the "Realm is 10× faster than SQLite" line that opens a hundred tutorials has, as far as I can trace, **no surviving primary source** — the original realm.io benchmark page is gone and every citation is a blog quoting another blog. The best measured comparison I found is a [2020 peer-reviewed study](https://doi.org/10.35784/jcsi.2043) (Wałachowski & Kozieł, JCSI — a university journal, so weigh accordingly, but with open methodology, two devices, five runs): writing 100k records, Realm used the **most RAM** of the four engines tested (11–39 MB more than SQLite, device-dependent) and produced a file **~28× larger** than SQLite's for identical data; SQLite was ~33× faster on bulk updates — while Realm won string search by up to ~40× and sorting handily. No engine won everything, which was the previous post's thesis wearing lab goggles.

Second, the fact that matters for this article: [SQLite documents its own memory floor](https://sqlite.org/malloc.html) — a connection object around 2 KB, a tunable 48–120 KB lookaside buffer, and an official low-memory tuning guide. I could find no equivalent "minimum footprint" documentation for Realm. That asymmetry is itself information: one engine treats running in a small room as a supported, documented scenario; for the other you reconstruct the answer from issue trackers and source code — which is what this article had to do.

## Question Six, With a Price Tag

The [previous post](/posts/how-do-messengers-store-millions-of-messages) ended with six questions: how complex are the queries, how big does the data grow, how related is it, how hot are the writes, is local the truth or a cache — and **"who — and what — needs to read the database?"** That sixth question even named this exact scenario — push-notification extensions that must open the store while the app is dead — and warned that every reader you add is a compatibility contract.

What this crash taught me is the half of question six I under-weighted: every reader is also a **resource contract**. Same data, same device, same engine — and a perfectly good storage choice fails because a different process, with a small fraction of the app's memory budget and a thirty-second lifetime, had to open the store.

So here is question six with its price tag attached: **of all the processes that must open this store, can the weakest one afford to?** Ask it while choosing, and the answer shapes the architecture — a mailbox here, a plaintext header there, an engine swap if it comes to that. Ask it after shipping, and it arrives as `EXC_RESOURCE (limit=24 MB)` in a crash report, killed at init, before your first insert.

## Frequently Asked Questions

**Is the 24 MB limit official?**
No. Apple's docs state no number; DTS engineers state 24 MB in forum replies, crash logs confirm it empirically, and DTS explicitly warns — [in a thread about a sibling extension type](https://developer.apple.com/forums/thread/73148) — that such limits have changed before. Measure on your devices; don't hard-code it.

**Will `objectTypes` alone make Realm safe in an extension?**
It removes the biggest, maintainer-confirmed cost (class-list enumeration and eager framework loading), and it must be set on the process's very first Realm open. It does not change the encrypted-page-cache math, the cross-process locking discipline, or process-reuse accumulation — it's necessary, not sufficient.

**Realm is deprecated — why analyze it at all?**
Covered [in the previous post](/posts/how-do-messengers-store-millions-of-messages): deprecated, not deleted, and running in thousands of shipping apps, mine included. But the mechanisms here — schema init cost, non-evictable caches, multi-process support as an afterthought vs. a design axis — are how you evaluate _any_ engine for constrained processes, including whatever replaces Realm in your stack.

**Could I use Core Data in the extension instead?**
It's the one option with a written Apple DTS statement that it [works in an NSE](https://developer.apple.com/forums/thread/761212). The same working-set discipline applies — an NSPersistentContainer with your full model isn't free either — and the mailbox pattern still beats hauling your object graph into the extension.

**What about the time budget?**
Thirty seconds is generous for decrypt-and-persist but not for network fetches — Signal cancels in-flight work in `serviceExtensionTimeWillExpire`. If your extension needs the network (fetching referenced messages, say), design for the fetch to lose the race and the mailbox to hold whatever arrived.

_Related: [how an extension shares a crypto core with the app](/posts/the-app-links-cryptocore-fine-so-why-cant-the-notification-extension-call-it), [how many copies of SQLCipher an app-plus-extension actually ships](/posts/two-frameworks-need-sqlcipher-so-does-the-extension-how-many-copies-does-the-iphone-end-up-with), and [which iOS background mode actually delivers a message](/posts/ios-has-six-ways-to-run-in-the-background-which-one-actually-delivers-my-message)._
