# Content Skeleton — Local Storage Post

Locked title: "What Should a Mobile App Use for Local Storage? How Telegram, Messenger and Signal Store Millions of Messages"
Locked slug: `how-do-messengers-store-millions-of-messages`
File: `src/content/posts/how-do-messengers-store-millions-of-messages.md`
Frontmatter: `series: mobile-architecture`, `seriesOrder: 2`, `articleType: big-question`, tags: local-storage, sqlite, realm, mobile-architecture, chat. `featured: false`, `draft: false`, pubDatetime at publish.

House structure (from both reference posts): hook → TIP thesis blockquote → `## Table of contents` → evidence sections → decision framework → FAQ → better-question close → `_Next in this series:_` footer. Mermaid diagrams each followed by a one-paragraph prose description.

<!-- Section mapping to user's draft outline: skeleton 1–10 = draft 1–10; skeleton 11 = draft's Realm-nuance section; skeleton 12 = draft 14 conclusion; draft 11–13 (migration case) deferred to posts 2–3 per user decision. -->

## Citation map + sections

### 1. Hook — one app, seven kinds of "local data"
Dark-mode flag → auth token → 100k messages → crypto session → media files. All "local data", must NOT be stored the same way. No external claims. Ends in TIP thesis blockquote: "Don't pick a database first — look at the data." Then `## Table of contents`.

### 2. Five storage groups
Memory / plain key-value / secure key-value / structured DB / files. Claims: general platform knowledge, no citation needed. Rule: don't call everything a "database".

### 3. Decision tree (mermaid slot A)
Android's own guidance as evidence — all TRUE per fact-check:
- SharedPreferences page: "DataStore is the recommended modern alternative" (developer.android.com shared-preferences) — verbatim OK.
- DataStore page: "If you need to support large or complex datasets, partial updates, or referential integrity, consider using Room instead of DataStore" (developer.android.com datastore) — verbatim OK.
- Room page: "abstraction layer over SQLite… compile-time verification of SQL queries" (developer.android.com room) — verbatim OK.
**Mermaid A:** storage decision tree (is it a secret? → Keystore/Keychain; small settings? → prefs/DataStore; large/relational/queried? → SQLite/Room; opaque bytes? → files) + one-paragraph prose description.

### 4. SQLite vs Realm: two philosophies
Relational subsystem (SQL, tables, queries) vs live-object model (objects, live results, reactive). No benchmarks-as-argument (explicit rule). Realm `RealmResults.changes` streams API exists as described — TRUE (fact-check). Lifecycle facts deferred to §11.

### 5. Pivot — "what do apps that store millions of messages actually do?"
Transition only; sets up evidence sections + note that ratings ★★★/★★ will be used.

### 6. Messenger / Project LightSpeed  [correction #2 lands here]
Source: https://engineering.fb.com/2020/03/02/data-infrastructure/messenger/ (Raymond Endres, 2020-03-02) — all TRUE:
- "Leverage the SQLite database" = one of four principles — verbatim OK.
- Single integrated schema for all features: "We developed a single integrated schema for all features" — verbatim OK.
- "we leveraged the SQLite database as a universal system to support all the features" — verbatim OK.
- Stored procedures; implementation = CG/SQL → https://engineering.fb.com/2020/10/08/open-source/cg-sql/ — verbatim OK.
- MSYS exact sentence — verbatim OK: "we built a platform (MSYS) to orchestrate all access to the database, including queued changes, deferred or retriable tasks, and for data sync support"; also "MSYS is a cross-platform library built in C".
- Metrics 1.7M→360K LOC, 2× faster start, ~1/4 binary size — TRUE, cite article.
- **BANNED as Meta quote:** "single source of truth" — NOT in article. Paraphrase, or attribute to SED podcast #1037 (2020-03).
**Mermaid B:** LightSpeed shape — server → MSYS sync → SQLite → dynamic UI templates vs pre-LightSpeed per-feature caches; + prose description.

### 7. Telegram — "wrote its storage engine three times"  [correction #1 lands here]
- Flagship Android (github.com/DrKLO/Telegram): own SQLite via JNI in `MessagesStorage.java`, no TDLib — ★★★ open source.
- Flagship iOS (github.com/TelegramMessenger/Telegram-iOS): custom **Postbox** engine + sqlcipher submodule, no TDLib submodule — ★★★ open source.
- TDLib (core.telegram.org/tdlib): "TDLib takes care of all network implementation details, encryption and local data storage" — verbatim OK; SQLite+SQLCipher inside (tddb/td/db/SqliteDb.cpp); used by Telegram X + third-party clients.
- addLocalMessage persists only if message database enabled — TRUE, TDLib API docs.
- **NEVER claim flagship apps use TDLib.** Frame: three engines, one pattern — persistence always lives in a core below the UI; TDLib is the packaged version of that idea. Don't overcorrect into "TDLib is irrelevant".

### 8. Signal — storage architecture ≠ one database
Source: https://signal.org/blog/storage-management-for-android/ (2020-01-13) — all TRUE:
- Android: SQLCipher-encrypted SQLite.
- "file attachments and media as encrypted blobs within the application sandbox" — verbatim OK.
- Maintains sqlcipher-android fork, SQLite/Room-compatible (github.com/signalapp/sqlcipher-android).
- iOS: GRDB.swift + SQLCipher (Signal-iOS Podfile.lock) — same split cross-platform.

### 9. WhatsApp + evidence-confidence table  [correction #4 lands here]
- Android messages in SQLite (msgstore.db, wa.db) — TRUE but **forensic-grade only** (Magnet Forensics artifact profile, Group-IB, public parsers) → ★★.
- No official engineering publication on local storage — state honestly.
- Evidence table (from fact-check report): Messenger ★★★ / Telegram Android ★★★ / Telegram iOS ★★★ / TDLib ★★★ / Signal ★★★ / WhatsApp ★★.
- Bonus narrative: every serious messenger converges on SQLite-family storage; none of the flagships uses an object DB like Realm for messages.

### 10. Decision criteria ①–⑥ + matrix
① query complexity ② volume ③ relationships ④ mutation rate ⑤ offline-first vs cache ⑥ who needs to read the database. Matrix rows: prefs/DataStore, secure storage, SQLite/Room, Realm-like object DB, files. Criterion ⑥ ends with the one-paragraph Realm→Native teaser ONLY (no deep dive — user decision).

### 11. Realm lifecycle nuance  [correction #3 lands here]
- Deprecation announced 2024-09-09; Atlas Device Sync off after 2025-09-30; local-only = v20 or `community` branch (github.com/realm/realm-dart deprecation notice). **Deprecated, NOT archived. Never "Realm is dead."**
- Point: choose for ownership/ecosystem/maintenance horizon, not benchmarks.

### 12. Close + FAQ + footer
- FAQ (4–6): Is SQLite fast enough for 100k messages? Should I encrypt my local DB? Is Realm dead? (careful answer per correction #3) DataStore or Room? Do I need Room/an ORM over raw SQLite? Where do media files go?
- Better-question close: "what is my data, who owns it, who reads it, how is it queried, how long must it live" (draft §14).
- `_Next in this series:_` footer → funnel post 2: "Should the database live in Flutter or in a native core?"

## Post-1 footer replacement (validated decision — reorder, keep case-study promise)

Old (what-architecture-layers-does-a-mobile-app-need.md, last line):
`_Next in this series: a case study — dissecting the layers of my own chat message engine, including the ones that turned out to be furniture; then a deep dive that measures change-cost directly by making the same change in a layered and a non-layered codebase._`

New:
`_Next in this series: the layer every measured app agreed on — local storage. What should a mobile app actually use, and how Telegram, Messenger and Signal store millions of messages. Later in the series: a case study dissecting the layers of my own chat message engine, and a deep dive measuring change-cost by making the same change in a layered and a non-layered codebase._`
