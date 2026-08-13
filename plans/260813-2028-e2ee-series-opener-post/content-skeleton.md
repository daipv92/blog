# Content Skeleton: E2EE Series Opener

Writing contract for Phase 2. Every date/number below is copied from
`plans/reports/researcher-260813-2028-e2ee-fact-check-report.md` — copy from here, not memory.
Section numbers = brainstorm report "Approved Structure".

## Frontmatter

```yaml
title: "WhatsApp, Signal, Messenger, Telegram: How Do They Really Encrypt Your Messages?"
description: "One tap on Send, four very different journeys. What E2EE actually changes in WhatsApp, Signal, Messenger and Telegram — and what it can't protect."
pubDatetime: <set in Phase 3>
featured: false
draft: false
tags: [e2ee, security, encryption, messaging]
series: e2ee
seriesOrder: 1
articleType: big-question
```

## TIP thesis (after hook)

> **E2EE doesn't add a lock to the wire — the wire was already locked.** It removes the
> server's ability to read your messages at all, and everything hard about it comes from
> keeping the product working after you take that ability away.

Roadmap sentence (three things the post does): (1) show what E2EE changes vs plain HTTPS,
(2) walk through how four real messengers got there — four different paths, (3) end with what
E2EE still can't protect you from.

`## Table of contents` marker goes after the roadmap paragraph.

---

## §1 Hook (no heading — intro before ToC)

- Purpose: "Meet me at the usual place tonight" — sent on 4 apps, who can read it in each?
- Adapts outline part I. No citations needed; pure setup + TIP + roadmap.

## §2 HTTPS already encrypts — why isn't that enough? (H2)

- Purpose: kill the "it's encrypted" confusion; two-model mermaid.
- Claims: HTTPS/TLS protects client↔server hop; server sees plaintext (can store, scan, leak).
  General knowledge, no dated claims — no citation required.
- **Mermaid (a):** two lanes.
  - Lane 1 "HTTPS only": You -->|encrypted| Server node "Server reads, stores plaintext" -->|encrypted| Recipient.
  - Lane 2 "E2EE": You -->|ciphertext| Server node "Server relays ciphertext only" -->|ciphertext| Recipient; key only at endpoints.
  - Follow with 2–3 sentence prose description (house style).
- Adapts outline part II.

## §3 What E2EE actually buys you (H2)

- Purpose: definition via three failure scenarios → then the formal definition lands.
- Scenarios: (1) database leak → attacker gets ciphertext, not conversations; (2) compromised
  or subpoenaed server → nothing readable to hand over; (3) the provider itself changes
  policy/gets acquired → still can't read. Framing, not historical claims — no citations.
- Definition: only sender and recipient devices hold keys; server relays ciphertext.
- Adapts outline part II–III boundary.

## §4 Follow one message + real life ≠ Alice→Bob (H2, merged outline §3+§4)

- Purpose: one-message walk (encrypt on device → ciphertext to server → store-and-forward →
  decrypt on recipient device), then break the textbook picture: multiple devices, offline
  recipients, new phone, backups, groups.
- Key claim: async delivery to offline recipients is why prekeys exist (X3DH lets parties
  agree keys while one is offline) — https://signal.org/docs/specifications/x3dh/
- Insight sentence (contract): **the encryption is the easy 10%; the system around it —
  identity, devices, storage, recovery — is where the engineering lives.**
- Sets up per-app sections: "four companies answered these questions four different ways."

## §5 Signal — privacy as the foundation (H2)

- TextSecure + RedPhone launched by Whisper Systems **May 25, 2010**; E2EE by default since
  launch — https://increment.com/security/story-of-signal/ , https://signal.org/blog/the-new-textsecure/
- Moxie Marlinspike founded Open Whisper Systems **January 2013** — https://increment.com/security/story-of-signal/
- Merged + rebranded as **Signal, November 2015** (Android; desktop Dec 2015) —
  https://www.androidpolice.com/2015/11/03/redphone-and-textsecure-combine-to-form-signal-a-single-app-for-private-calls-and-texts/
- Protocol pieces (1 sentence each, deep-dive deferred to series): X3DH key agreement —
  https://signal.org/docs/specifications/x3dh/ ; Double Ratchet per-message keys —
  https://signal.org/docs/specifications/doubleratchet/ ; safety numbers for verification.
- **Sealed Sender (2018)**: server learns recipient but not sender identity —
  https://signal.org/blog/sealed-sender/
- Linked devices: up to 5; new linked device can transfer **last 45 days** of history —
  https://signal.org/blog/a-synchronized-start-for-linked-devices/ ,
  https://support.signal.org/hc/en-us/articles/360007320551-Linked-Devices
- Optional E2EE backups with user-held recovery key —
  https://support.signal.org/hc/en-us/articles/10074659364122-Backups-and-Device-Transfers-on-Signal
- Angle: smallest userbase, fewest compromises — the reference implementation.

## §6 WhatsApp — E2EE for a billion users (H2)

- **November 18, 2014**: Open Whisper Systems × WhatsApp partnership announced —
  https://signal.org/blog/whatsapp/
- **April 5, 2016**: full rollout complete, **~1 billion users**, all platforms/messages/calls/
  groups — https://www.eff.org/deeplinks/2016/04/whatsapp-rolls-out-end-end-encryption-its-1bn-users
- Multi-device (**July 2021**): per-device identity keys; **client-fanout** (sender encrypts N
  times, once per recipient device); up to 4 companion devices; Sender Key for groups —
  https://engineering.fb.com/2021/07/14/security/whatsapp-multi-device/
- E2EE backups (**September 2021**): HSM-based Backup Key Vault; password or 64-digit key;
  OPAQUE protocol; rate-limited guesses —
  https://engineering.fb.com/2021/09/10/security/whatsapp-e2ee-backups/
- Key transparency (**April 13, 2023**): Auditable Key Directory, automatic key verification,
  open-sourced — https://engineering.fb.com/2023/04/13/security/whatsapp-key-transparency/
- Angle: same protocol as Signal, at 1000x scale — scale problems (multi-device, backups,
  verification) each got their own infrastructure.

## §7 Messenger — retrofitting E2EE onto a giant (H2) — CORRECTIONS #1 AND #3 LAND HERE

- Secret Conversations: **testing began July 8, 2016; full rollout October 27, 2016**;
  opt-in, 1-on-1 only — https://about.fb.com/news/2016/07/messenger-starts-testing-end-to-end-encryption-with-secret-conversations/
  (**Correction #3**: two dates exist; name them both, don't blur.)
- Default E2EE: **announced December 6, 2023**; rollout began then and **stretched well into
  2024 and beyond** — a June 2024 survey found only ~33% of users seeing E2EE chats. **Never
  write "completed"; no verified completion date exists.** (**Correction #1**) —
  https://about.fb.com/news/2023/12/default-end-to-end-encryption-on-messenger/ ,
  https://accountabletech.org/research/metas-e2e-survey/
- Why it took years (Meta's own engineering account —
  https://engineering.fb.com/2023/12/06/security/building-end-to-end-security-for-messenger/):
  - Login model: username/password on any device (vs WhatsApp's phone-primary model).
  - Web client: browser has no trusted persistent storage like a native app.
  - Server-side message history → **Labyrinth** encrypted-storage protocol (white paper:
    https://engineering.fb.com/wp-content/uploads/2023/12/TheLabyrinthEncryptedMessageStorageProtocol_12-6-2023.pdf)
  - Features that read messages: sticker search etc. needed anonymous-credential tricks.
- PIN recovery: one sentence max — users set a PIN as recovery method when chats upgrade;
  public detail is thin (fact-check: "mentioned but not fully documented") —
  https://about.fb.com/news/2023/12/default-end-to-end-encryption-on-messenger/
- **Instagram disambiguation, one line max (Correction #4)**: Instagram DMs are a separate
  product — never default-E2EE, opt-in only, and the opt-in was removed entirely in May 2026 —
  https://www.macrumors.com/2026/05/08/instagram-end-to-end-encryption/
- Angle: what happens when E2EE arrives *after* the product — every feature already assumed a
  readable server.

## §8 Telegram — "has E2EE" vs "defaults to E2EE" (H2) — CORRECTION #2 LANDS HERE

- Framing contract: **trade-off analysis ("what is each architecture optimizing for?"), not a
  security ranking.** Telegram optimized for instant multi-device sync + full cloud history;
  the price is that the server can read Cloud Chats.
- Cloud Chats (the default): server-client encryption; encrypted in transit and at rest but
  **Telegram can access plaintext**; synced everywhere; full history — https://telegram.org/faq
- Secret Chats (opt-in): E2EE (MTProto), **single device pair** — not on Desktop/Web, not
  synced, lost on logout, **no groups** — https://telegram.org/faq ,
  https://tsf.telegram.org/manuals/e2ee-simple
- Groups: never E2EE on Telegram (Cloud encryption only) — https://telegram.org/faq
- (**Correction #2** feeds §9 table cell: multi-device = "Cloud Chats only".)

## §9 Comparison table + "a ✓ doesn't tell the whole story" (H2)

Table rows = apps; columns: Default E2EE / Opt-in scope / Multi-device with E2EE / History &
backup / Protocol.

| App | Default E2EE | E2EE scope | Multi-device (E2EE) | History/backup | Protocol |
|---|---|---|---|---|---|
| Signal | Yes — since launch (2010) | Everything | Yes, up to 5 linked devices (45-day history transfer) | Optional E2EE backup, user-held key | Signal Protocol |
| WhatsApp | Yes — since Apr 2016 | Chats, groups, calls, media | Yes, up to 4 companions (client-fanout) | Optional E2EE backup (HSM vault) | Signal Protocol |
| Messenger | Rolling out since Dec 2023 (not confirmed complete) | Personal 1:1 chats/calls | Yes (Labyrinth-backed) | Server-stored, Labyrinth-encrypted | Signal Protocol + Labyrinth |
| Telegram | No | Secret Chats only (1:1, opt-in) | **Cloud Chats only — and those aren't E2EE** | Cloud: full, server-readable; Secret: none | MTProto |

- Caveat list ("a ✓ doesn't tell the whole story"): key management, metadata, backup defaults,
  verification UX, recovery flows, implementation quality — 1–2 sentences each, no new claims.
- Source anchors: summary table in fact-check report (already cited per-app above).

## §10 Behind the Send button (H2) + mermaid (b)

- Purpose: name the subsystem stack, 1–2 sentences per layer; each is a future series topic.
- Stack: Identity (who is this key?) → Key agreement (X3DH) → Message encryption (Double
  Ratchet) → Multi-device (fanout/linked devices) → Group messaging (Sender Key) → Storage &
  backup (Labyrinth / HSM vaults) → Verification (safety numbers / key transparency) →
  Recovery & device loss (PINs, recovery keys).
- **Mermaid (b):** vertical flowchart of that stack, one node per layer, short labels;
  follow with prose description.
- Citations: reuse links already introduced (X3DH, multi-device, Labyrinth, AKD) — no new claims.

## §11 Thought experiment: `encrypt(message, key)` → requirements avalanche (H2)

- Purpose: keep the outline's Q&A rhythm. Start: "just call encrypt(message, key)" — then each
  question breaks the naive design: Where does the key come from? How do you agree on it with
  someone offline? (→ prekeys) What if a key is stolen — past messages? (→ forward secrecy,
  ratchet) New phone? Second device? Backup? Group of 200? Verify no man-in-the-middle?
- Each answer name-drops the §10 layer that exists because of it. No new dated claims.
- Adapts outline part V; merged overlap with §4/§10 already resolved in design.

## §12 Who is E2EE protecting you from? (H2) — threat table + Wyden

Protection table (rows = attacker, cells = HTTPS-only vs E2EE):

| Attacker | HTTPS only | With E2EE |
|---|---|---|
| Network eavesdropper (café Wi-Fi, ISP) | Protected | Protected |
| Server database leak | Exposed | Protected |
| Compromised/subpoenaed server | Exposed | Protected* |
| The provider itself | Exposed | Protected* |
| Malware on your device | Exposed | Exposed |
| Someone you were scammed into trusting | Exposed | Exposed |

- `*` nuance paragraph: metadata (who, when, how often) is not message content — E2EE doesn't
  hide it.
- **Push-notification metadata (concrete `*` example):** **December 6, 2023** — Sen. Ron Wyden's
  letter revealed governments compelled Apple/Google to hand over push-notification data (app,
  timestamp, account; sometimes unencrypted notification text). Apple then required a judge's
  order; Google's policy less clear —
  https://www.wyden.senate.gov/imo/media/doc/wyden_smartphone_push_notification_surveillance_letter.pdf ,
  https://techcrunch.com/2023/12/06/us-senator-warns-governments-spying-apple-google-smartphone-users-via-push-notifications/
- Trust-model reframe (contract sentence): security isn't about trusting the server to behave —
  it's about building a system where **the server doesn't need the ability to read at all**.

## §13 FAQ + close (H2 "Frequently Asked Questions", then H2 close)

FAQ (bold-question house format, 3–4):
1. **"So is Telegram insecure then?"** → wrong question; Cloud Chats trade server-readability
   for sync/history; know which mode you're in and what it means. (No new claims.)
2. **"Do backups break E2EE?"** → they can; the point of HSM vaults (WhatsApp), recovery-key
   backups (Signal), Labyrinth (Messenger) is E2EE-compatible storage — weakest-link warning
   for cloud backups left unencrypted. (Reuse links.)
3. **"What does the server still know?"** → metadata; sealed sender + Wyden example. (Reuse.)
4. **"Which app should I use?"** → depends who's in your threat model + where your contacts
   are; the honest answer is the table above, not a brand.

Close (H2, "The Lock Icon Is the Tip of the Iceberg" or similar better-question style):
- Lock icon = the 10% you can see; the iceberg = identity, devices, groups, storage, recovery.
- Better question: not "is my app encrypted?" but **"who holds the keys, and what happens when
  I add a device, restore a backup, or lose my phone?"**
- "Coming in this series" plain-text topic list (NO links): Messenger's multi-year migration
  case study; Signal Protocol internals (X3DH + Double Ratchet); multi-device E2EE
  architectures; encrypted storage & backups (Labyrinth, HSM vaults); what E2EE does to a
  message system's architecture.
- Footer: `_Next in this series: why default E2EE took Messenger years — the engineering story
  of retrofitting encryption onto a product built to read your messages._`

---

## Verification greps for Phase 2 self-pass

- "October 2016" present (correction #3); "July 8, 2016" or "July 2016" beta date present.
- "Cloud Chats only" present in table (correction #2).
- No "complete"/"completed" adjacent to Messenger default rollout (correction #1).
- Instagram mentioned at most once, one line (correction #4).
- Zero bare dates/numbers without a link in §5–§8, §12.
