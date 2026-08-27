---
title: "Uploading a Photo Is One POST Request. So Why Do Chat Apps Engineer It So Hard?"
description: "A 45 MB video, a moving taxi, a connection that dies at 93% — media upload is five problems wearing one trench coat. The full map: resumable chunks, optimistic UX, dedup, async pipelines, and the resilience layer nobody blogs about."
pubDatetime: 2026-08-27T10:00:00.000Z
featured: false
draft: false
tags:
  - media-upload
  - chat
  - resumable-upload
  - s3
  - mobile-networking
series: message-systems
seriesOrder: 3
articleType: big-question
---

Every chat app tutorial handles media upload the same way: pick a file, `POST` it as `multipart/form-data` to your backend, save it to disk or S3, done. It works in the demo. It works on office Wi-Fi.

Then someone tries to send a 45 MB 4K video from the back of a moving taxi, the connection drops at 93%, the upload restarts from zero, drops again, and the user gives up and sends it on WhatsApp instead — where, somehow, it just works.

That gap — between "works on Wi-Fi" and "works in an elevator" — is where all the interesting engineering lives.

> [!TIP]
> **Media upload isn't one problem — it's five: reliability, perceived speed, cost, processing, and security.** Each has a naive answer that fails at scale and an industry answer the major apps have converged on. This post maps the whole board — chunked resumable transfer, upload-before-send, dedup, async pipelines, E2EE blobs — plus the production-hardening layer that rarely makes it into engineering blogs. Later posts in this series go deep on the individual layers.

## Table of contents

## Why This Is a Real Problem

Three numbers frame everything:

1. **Files got huge.** A modern phone shoots 12–48 MP photos and 4K/60 video. A ten-second clip is tens of megabytes. Media dominates chat traffic by bytes, even though text dominates by message count.
2. **Mobile networks are hostile.** Radio handoffs between cell towers, tunnels, elevators, and Wi-Fi-to-cellular transitions all kill TCP connections mid-transfer. On mobile, an interrupted upload is the normal case, not the edge case.
3. **Users don't wait.** The user taps send and locks their phone, or switches apps, or types the next message. Anything that blocks the conversation on a progress bar feels broken.

A naive single-shot upload fails all three at once: one dropped packet stream means restarting a huge file from byte zero, in the foreground, while the user stares at a spinner.

## The Problem Map

Media upload is really five problems wearing one trench coat:

| Problem | The question it asks |
| --- | --- |
| **Reliability** | Can an upload survive a dropped connection, a killed app, an hour in airplane mode? |
| **Perceived speed** | Does the user wait for the upload, or does the upload wait for the user? |
| **Cost** | What do bandwidth, storage, egress, and duplicate files cost at scale? |
| **Processing** | Who makes the thumbnails, previews, and transcodes — and when? |
| **Security & integrity** | Did the right bytes arrive? Are they safe to serve? Can the storage layer read them? |

Each has a naive answer and an industry answer. Let's go through them.

## 1. Reliability: Chunks, Resume, and Parallelism

**Naive:** one HTTP request with the whole file. If it fails at 93%, you re-upload 100%.

**Industry:** split the file into chunks, upload them independently, and make progress durable so an interruption costs you one chunk, not the whole file.

Everyone converged on this idea; they differ mostly in protocol dressing:

- **S3 multipart upload** — `CreateMultipartUpload`, upload up to 10,000 parts (in parallel, in any order, individually retryable), then `CompleteMultipartUpload`. AWS recommends it for objects over ~100 MB, and SDKs switch to it automatically above a threshold.
- **Google's resumable upload protocol** (Drive, YouTube) — initiate a session, `PUT` bytes with `Content-Range`, and on interruption ask the server "how much did you get?" (a `308` response with a `Range` header) and continue from there.
- **tus** — an open, HTTP-native resumable protocol (`PATCH` chunks, `HEAD` to query the server's offset) that is now being standardized at the IETF. If you want resumable upload without inventing anything, this is the reference design.
- **Telegram** — the same idea over its own MTProto transport: files are split into parts (512 KB recommended) and sent via `upload.saveFilePart` / `upload.saveBigFilePart`, supporting files up to 2–4 GB.

Chunking buys you a second win for free: **parallelism**. Several chunks in flight at once can saturate a connection a single stream can't. Production implementations tune the concurrency to the situation — more parallel parts on Wi-Fi, fewer on cellular, fewer still on low-memory devices — because the goal is to fill the pipe, not to melt the phone.

And a third win: **background survival**. Both mobile platforms have OS-level machinery for uploads that outlive the app — `URLSession` background sessions on iOS (with the quirk that force-quitting the app cancels them) and `WorkManager` on Android (constraint-aware, retry-capable, survives process death). Chunked, file-backed uploads fit this machinery; a giant in-memory POST does not.

## 2. Perceived Speed: Never Make the User Wait for the Network

The most effective upload optimization has nothing to do with bandwidth: **start early and lie a little.**

**Upload-before-send.** The moment the user picks a photo, the client can start compressing and uploading it — while they're still typing the caption. By the time they hit send, the upload is often already done, and "send" just attaches a pointer to an already-uploaded blob. (Worth noting: no major app has publicly documented this as a named technique — it's widely observed behavior and standard optimistic-UI practice, not something you'll find in a WhatsApp engineering post.)

**Optimistic rendering.** The message bubble appears in the conversation instantly, showing the local file as its own preview with an upload state. The conversation flows; the network catches up.

**Placeholders that cost nothing.** [BlurHash](https://github.com/woltapp/blurhash) (from Wolt) encodes a blurred impression of an image into a ~20–30 character string using a truncated DCT. That string travels inside the message metadata itself — no extra request — so recipients see a plausible blurred preview the instant the message arrives, replaced by the real image when it loads. [ThumbHash](https://evanw.github.io/thumbhash/) refines the idea (better detail, alpha support, aspect ratio included). Progressive JPEG attacks the same perception gap at the codec level.

**Shrink before you ship.** The cheapest byte to upload is the one you don't. Meta open-sourced [Spectrum](https://engineering.fb.com/2019/01/17/developer-tools/spectrum/), a mobile image-processing library whose whole purpose is making the right resize/re-encode decisions on-device before the network transfer. The same logic applies to video: transcode a 4K/60 capture down to something sane for chat before upload, ideally off the UI thread. iPhone HEIC deserves special mention: treat it as an _ingest_ format you accept, never a _delivery_ format you serve.

## 3. Cost: Dedup, Egress, and Who Pays for Bytes

At small scale, storage is a rounding error. At chat-app scale, three costs bite:

**Duplicate content.** The same meme gets forwarded ten thousand times. Dropbox's answer is the canonical one: files are split into 4 MB blocks, each block SHA-256 hashed, and a file is just an ordered list of block hashes. Identical blocks — across users, across file versions — are stored once, and editing a large file re-uploads only the changed blocks. Their [streaming-sync work](https://dropbox.tech/infrastructure/streaming-file-synchronization) went further, overlapping upload and download so blocks flow to other devices before the whole file has landed (measured: a 100 MB file syncing in 64 s instead of 89 s). WhatsApp very likely does content-addressed dedup of forwarded media too, but only patent filings support that — its whitepaper documents a hash-of-blob pointer mechanism that would make it natural.

**Egress.** For media-heavy apps, serving bytes often costs more than storing them. This is why Cloudflare R2's zero-egress pricing is a structural lever, with public case studies showing order-of-magnitude serving-cost reductions versus S3 + CloudFront for hot public media.

**Backend bandwidth.** Which brings us to an architectural fork…

## 4. The Transport Fork: Through Your Backend, or Around It?

**Proxy through your API:** every media byte flows through your servers. You get synchronous validation, simple auth, one choke point for scanning — and a bandwidth/CPU bill that scales with every photo sent, plus whatever body-size limits your gateway imposes.

**Presigned URLs, direct to storage:** your backend issues a short-lived signed URL; the client PUTs the file straight to S3 (or equivalent). Your servers never touch the bytes. This is the pattern that wins at scale, but it moves problems around rather than deleting them:

- You can't inspect content before it lands — so validation becomes presign-time policy (size, content type) plus post-upload verification.
- The client might vanish after uploading without telling you — so storage-event notifications become your source of truth, not the client's word.
- A leaked presigned URL is an abuse window until it expires — so expiries are short and URLs are validated.

The production shape that falls out of this, used in some form nearly everywhere:

```text
client                     backend                    object storage
  |-- request upload -------->|                             |
  |<- presigned URL(s) -------|                             |
  |-- PUT chunks (parallel) ------------------------------->|
  |-- complete -------------->|-- verify parts/checksums -->|
  |                           |-- enqueue processing        |
  |<- poll / push: "ready" ---|   (thumbnails, transcodes)  |
```

Note the last line: the server responds `202 Processing` until the media is verified and processed, and the client polls with backoff (or receives a push). Treating "not ready yet" as a normal state rather than an error is a small design decision that removes a whole class of race conditions between "message arrived" and "media available."

## 5. Processing: Accept Fast, Process Async

Thumbnails, multi-resolution variants, and video transcodes are expensive, and none of them may block the send path. The universal pattern: **accept the raw upload, ack immediately, and run processing as async jobs**, fanning results out through a CDN when ready. Meta's video pipeline is the maximal version — each upload becomes a family of DASH-compatible encodings at different resolutions and qualities so playback can adapt to the viewer's network. Services like Transloadit, Uploadcare, and Mux exist precisely because this pipeline is a product in itself.

One client-side detail that punches above its weight: when generating a video thumbnail, grab a frame from ~1 second in, not frame zero. The first frame of phone-shot video is very often black.

## 6. Security and Integrity

Four distinct concerns hide under "security":

- **Did the right bytes arrive?** Modern object stores verify per-part checksums the client declares up front (S3 supports CRC and SHA family checksums, including hardware-accelerated CRC64-NVMe). Corruption gets rejected at the storage layer — no application-level re-download-and-compare needed.
- **Is the content safe?** The standard cloud pattern is event-driven scanning: object lands, an event triggers a scanner (containerized ClamAV, or managed services like GuardDuty Malware Protection), and the object is tagged clean or quarantined before it's ever served to another user.
- **Can the client be tricked?** If the client PUTs to whatever URL the server returns, a compromised or spoofed backend response could redirect uploads anywhere. Validating that presigned URLs point at your actual storage domains closes an SSRF-shaped hole most implementations never think about.
- **Can the storage layer read the media?** In E2EE messengers, it must not. WhatsApp's [security whitepaper](https://www.whatsapp.com/security/WhatsApp-Security-Whitepaper.pdf) documents the elegant standard solution: for each attachment, generate an ephemeral AES-256 key and HMAC key, encrypt the blob, upload the _ciphertext_ to a plain blob store, and send the keys + a hash of the ciphertext + a pointer inside the end-to-end-encrypted message. The blob store hauls bytes it cannot read; the E2EE channel carries only a tiny pointer. Signal's attachment handling follows the same shape.

## The Parts Nobody Blogs About

Everything above is documented territory. But study a hardened production implementation and you find a resilience layer the engineering blogs mostly skip — the difference between "implements multipart upload" and "survives contact with real phones." Field notes from one production chat app (details anonymized):

**Stall detection.** Retries and timeouts don't catch the worst failure mode: a socket that's alive but silent. A request-level timeout on a 5 MB chunk over slow cellular must be generous — which means a dead-but-open connection can hang an upload for minutes. The fix: watch _bytes written_, per chunk. If a chunk makes no byte progress for ~30 seconds, kill it and retry, regardless of any request timeout. Progress, not time, is the health signal.

**An error taxonomy with separate budgets.** Not all failures deserve retries. Timeouts, 429s, 5xxs, and stalls are transient — retry with jittered exponential backoff, against a small budget (say, 5 attempts). A 400 or 403 is terminal — retrying is pure waste. And auth expiry mid-upload is neither: it needs a _recovery_ path (refresh the session, re-request presigned URLs) with its own separate budget, so an expired token doesn't silently consume the retry budget meant for flaky networks.

**An offline gate, not an offline error.** If the device is offline, failing the upload is the wrong answer — the user did nothing wrong and the file is fine. Better: pause, subscribe to connectivity changes, and resume when the network returns. "No connection" becomes a wait state, not a failure state. No false "upload failed" toast because someone walked through a stairwell.

**Durable queues that survive restarts.** In-flight upload state — which files, which chunks done, what state each item is in — is persisted locally as a small state machine (pending → in-progress → done/failed). On app launch, incomplete work is re-queued automatically. The upload survives not just a network blip but an app kill or a reboot.

**Backpressure.** A user selects 200 photos and hits send. Without a cap, the app spawns 200 upload pipelines and dies of memory exhaustion. A bounded in-flight queue (say, 50) with explicit rejection of the excess turns a crash into a graceful "queued" state.

**Checksums as a free integrity layer.** Computing a CRC per chunk client-side and declaring it in the upload lets the storage layer reject any corrupted transfer at write time. It costs milliseconds per chunk and eliminates an entire category of "the thumbnail looks corrupted" bug reports.

None of these techniques is glamorous. Together they're most of the reason a photo sent from a basement parking garage eventually, reliably, arrives.

## The Whole Picture

A production media upload path, end to end:

1. **Pick & preprocess** (client): validate type/size by magic bytes, compress/resize off the main thread, generate a thumbnail and a placeholder hash.
2. **Render optimistically**: the message appears immediately with the local preview; upload begins before "send," if possible.
3. **Presign**: backend authorizes and returns short-lived direct-to-storage URLs (chunked for big files); client validates the URLs' origin.
4. **Transfer**: parallel chunk PUTs with declared checksums, adaptive concurrency, stall detection, budgeted retries, offline pausing, durable local state.
5. **Complete & verify**: backend confirms parts and checksums; processing jobs (thumbnails, transcodes, scans) run async; client treats "processing" as a normal state and polls or listens.
6. **Serve**: processed variants go out through a CDN; for E2EE apps, everything stored was ciphertext all along.

Each step exists because a specific, painful failure mode exists without it. That's the lens for the rest of this series: later posts go deep on individual layers — parallel chunking with stall detection, the retry/recovery error taxonomy, placeholder techniques like BlurHash, and E2EE media — with real implementation detail.

## Sources

Claims above are graded: primary sources first, secondary or inferred material flagged as such in the text.

**Protocols & primary engineering sources**

- [tus resumable upload protocol](https://tus.io/protocols/resumable-upload) — and its [IETF standardization](https://tus.io/blog/2023/08/09/resumable-uploads-ietf)
- [AWS S3 multipart upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)
- [Google resumable upload protocol (YouTube/Drive)](https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol)
- [Telegram file upload API](https://core.telegram.org/api/files)
- [Dropbox — Streaming File Synchronization](https://dropbox.tech/infrastructure/streaming-file-synchronization)
- [Meta — Spectrum image-processing library](https://engineering.fb.com/2019/01/17/developer-tools/spectrum/)
- [Meta — HDR video for Reels](https://engineering.fb.com/2023/07/17/video-engineering/hdr-video-reels-meta/) (video pipeline context)
- [WhatsApp Security Whitepaper](https://www.whatsapp.com/security/WhatsApp-Security-Whitepaper.pdf) (E2EE attachment flow)
- [Signal — Sealed Sender](https://signal.org/blog/sealed-sender/) (architecture context)
- [BlurHash](https://github.com/woltapp/blurhash) · [ThumbHash](https://evanw.github.io/thumbhash/)
- [AWS — serverless ClamAV scanning for S3](https://aws.amazon.com/blogs/developer/virus-scan-s3-buckets-with-a-serverless-clamav-based-cdk-construct/)
- [GCP — malware-scanning reference architecture](https://docs.cloud.google.com/architecture/automate-malware-scanning-for-documents-uploaded-to-cloud-storage)
- [iOS background URLSession](https://developer.apple.com/forums/thread/765196)
- [Uppy/Companion — open-source uploader architecture](https://uppy.io/docs/companion/)

**Secondary / inferred (flagged as such in the text)**

- [Upload-before-send as optimistic UI](https://uxplanet.org/optimistic-1000-34d9eefe4c05) — observed practice; no primary source
- WhatsApp media dedup — [patent filings only](https://patents.justia.com/patent/11899715)
- [Presigned URLs vs proxy trade-offs](https://zaccharles.medium.com/s3-uploads-proxies-vs-presigned-urls-vs-presigned-posts-9661e2b37932)
- [Cloudflare R2 vs S3 economics](https://leanopstech.com/blog/cloudflare-r2-vs-aws-s3-decision-framework-2026/)
- [Chunking/parallel upload tuning](https://transloadit.com/devtips/optimizing-online-file-uploads-with-chunking-and-parallel-uploads/)
