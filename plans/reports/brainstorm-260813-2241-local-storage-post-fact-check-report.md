# Brainstorm Report — Local Storage Post (Fact-Check + Adjusted Outline)

Date: 2026-08-13 | Session: brainstorm | Status: verified, outline adjusted, awaiting plan handoff

## Problem Statement

User drafted outline for funnel post: "What should a mobile app use for local storage? How Telegram, Messenger and Signal store millions of messages." Request: verify all factual claims, confirm which chat apps use what and why, refine structure. Post 1 of a 3-post funnel ending in user's Realm Flutter → Native case study.

## Editorial Decisions (user-confirmed)

- Series: `mobile-architecture`, `seriesOrder: 2` (post 1 is "What architecture layers does a mobile app need?")
- Title direction: big-question + 4 apps, `articleType: big-question` (matches e2ee post format)
- Realm→Native case: criterion "who needs to read the DB" in decision matrix + short teaser at end only; draft sections 11–13 move to posts 2–3
- Language: English

## Fact-Check Results

### Messenger / Project LightSpeed — all core claims TRUE (primary source)

Source: engineering.fb.com/2020/03/02/data-infrastructure/messenger/ (Raymond Endres, VP Eng Messenger, 2020-03-02).

| Claim | Verdict | Evidence |
|---|---|---|
| "Leverage the SQLite database" as core principle | TRUE | article, one of four principles |
| Pre-LightSpeed: feature-specific caches, unified into one integrated schema | TRUE | "We developed a single integrated schema for all features" |
| Extended SQLite with stored procedures | TRUE | exact sentence in article; implementation = CG/SQL (engineering.fb.com 2020-10-08) |
| MSYS orchestrates DB access, queued changes, deferred/retriable tasks, sync | TRUE | verified directly: "we built a platform (MSYS) to orchestrate all access to the database, including queued changes, deferred or retriable tasks, and for data sync support"; "MSYS is a cross-platform library built in C" |
| "universal system" wording | TRUE | "we leveraged the SQLite database as a universal system to support all the features" |
| "single source of truth" wording | NOT in article | phrase appears only in SED podcast (SED1037, 2020-03); do not quote as Meta's written wording — attribute to podcast or paraphrase |
| Metrics: 1.7M→360K LOC, 2× faster start, ~1/4 binary size | TRUE | article |

### Telegram — MAJOR CORRECTION needed

| Claim | Verdict | Evidence |
|---|---|---|
| TDLib handles networking, encryption, local storage, consistency | TRUE | core.telegram.org/tdlib: "TDLib takes care of all network implementation details, encryption and local data storage" |
| addLocalMessage: persists only if message database enabled | TRUE | TDLib API docs, exact wording |
| TDLib uses SQLite (+SQLCipher) under the hood | TRUE | tdlib/td repo: tddb/td/db/SqliteDb.cpp, embedded sqlite |
| **Flagship Telegram apps use TDLib** | **FALSE** | Android (DrKLO): own SQLite via JNI in MessagesStorage.java, no TDLib. iOS (Telegram-iOS): custom **Postbox** storage engine + sqlcipher submodule, no TDLib submodule (verified via GitHub API). TDLib used by Telegram X (Android) + third-party clients |

Reframe for article: TDLib is Telegram's official packaging of storage+sync+consistency into a core library — and the flagship apps follow the same pattern with their own engines (MessagesStorage / Postbox). "Persistence owned by a core below the UI" thesis survives; "Telegram pushed the DB into TDLib" as a flagship-app claim does not.

### Signal — all TRUE (primary sources)

| Claim | Verdict | Evidence |
|---|---|---|
| Android: SQLCipher-encrypted SQLite | TRUE | signal.org/blog/storage-management-for-android/ (2020-01-13) |
| Attachments/media = encrypted blobs in app sandbox, not in DB | TRUE | same post: "file attachments and media as encrypted blobs within the application sandbox" |
| Signal maintains sqlcipher-android fork, SQLite/Room-compatible | TRUE | github.com/signalapp/sqlcipher-android |
| iOS: GRDB.swift + SQLCipher | TRUE | Signal-iOS Podfile.lock: GRDB.swift/SQLCipher |

### WhatsApp — draft's evidence-grading approach validated

| Claim | Verdict | Evidence |
|---|---|---|
| Android messages in SQLite (msgstore.db, wa.db) | TRUE (forensic-grade) | Magnet Forensics artifact profile; Group-IB forensics; public parsers |
| No official engineering publication on local storage | TRUE | searches of meta.com/whatsapp.com found none; keep ★★ evidence marking |

### Android official guidance — all TRUE

- SharedPreferences page: "DataStore is the recommended modern alternative"
- DataStore page: "If you need to support large or complex datasets, partial updates, or referential integrity, consider using Room instead of DataStore"
- Room page: "abstraction layer over SQLite… compile-time verification of SQL queries"

### Realm lifecycle — TRUE with one correction

- Deprecation announced 2024-09-09; Atlas Device Sync off after 2025-09-30. TRUE.
- Correction: realm-dart repo NOT archived — deprecated; local-only path = version 20 or `community` branch. Write precisely.
- `RealmResults.changes` streams API exists as described. TRUE.

## Evidence-Confidence Table (for the article)

| App | Storage | Evidence |
|---|---|---|
| Messenger | SQLite + stored procs (CG/SQL) + MSYS | ★★★ official engineering blog |
| Telegram (flagship Android) | Own SQLite core (MessagesStorage, JNI) | ★★★ open source |
| Telegram (flagship iOS) | Postbox custom engine + SQLCipher | ★★★ open source |
| Telegram TDLib (Telegram X, 3rd-party) | SQLite + SQLCipher inside TDLib | ★★★ official docs + source |
| Signal (Android + iOS) | SQLCipher SQLite (+ GRDB on iOS); media = encrypted files | ★★★ official blog + source |
| WhatsApp Android | SQLite (msgstore.db, wa.db) observed | ★★ forensic/public tooling |

Bonus narrative point: every serious messenger converges on SQLite-family storage; none of the flagships uses an object DB like Realm for messages.

## Adjusted Outline (deltas from draft)

1–5. Keep as drafted (everyday problem → 5 storage groups → decision tree → SQLite vs Realm philosophies → "what do big apps do"). DataStore/Room quotes verified, safe to cite.
6. Messenger/LightSpeed: keep; use exact MSYS sentence; use "universal system"; avoid quoting "single source of truth" as Meta's written phrase (paraphrase or cite SED podcast).
7. Telegram: REWRITE. New angle: "Telegram wrote its storage engine three times" — MessagesStorage (Android), Postbox (iOS), TDLib (official client library). Common pattern: persistence lives in a core below the UI. Stronger than the original claim and true.
8. Signal: keep; add iOS GRDB+SQLCipher for cross-platform symmetry.
9. WhatsApp: keep with ★★ marking.
10. Decision criteria ①–⑥: keep; ⑥ "who reads the DB" stays as bridge.
11–13 of draft: cut from post 1 → posts 2–3. Replace with short teaser paragraph + "next in series" line (blog convention).
14. Conclusion: keep ("what is my data, who owns it, who reads it, how is it queried, how long must it live").
- Realm nuance section: precise wording — deprecated not archived; local-only via v20/community branch; Device Sync off after 2025-09-30.

## Funnel (confirmed)

1. This post (mobile-architecture #2) — storage landscape + 4 apps evidence
2. "Should the database live in Flutter or Native?" — TDLib/Postbox/MSYS as comparisons
3. Case study: migrating message DB from Realm Flutter to native (dual-read/shadow compare/cut-over)

## Key Sources

- https://engineering.fb.com/2020/03/02/data-infrastructure/messenger/
- https://engineering.fb.com/2020/10/08/open-source/cg-sql/
- https://core.telegram.org/tdlib ; TDLib addLocalMessage API docs
- https://github.com/DrKLO/Telegram (MessagesStorage.java) ; https://github.com/TelegramMessenger/Telegram-iOS (submodules: Postbox, TelegramCore, sqlcipher)
- https://signal.org/blog/storage-management-for-android/ ; github.com/signalapp/sqlcipher-android ; Signal-iOS Podfile.lock
- developer.android.com: shared-preferences, datastore, room pages
- github.com/realm/realm-dart (deprecation notice, community branch) ; pub.dev realm_dart
- Magnet Forensics WhatsApp artifact profile; Group-IB WhatsApp forensics

## Unresolved Questions

- Exact slug/final English title wording — decide at writing time.
- Whether to cite Meta Tech Podcast Ep. 44 (2022) for deeper MSYS detail — optional.
