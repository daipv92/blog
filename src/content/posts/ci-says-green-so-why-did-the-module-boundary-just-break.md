---
title: "CI Says Green — So Why Did the Module Boundary Just Break?"
description: "Compiling isn't enough to protect a Flutter/Kotlin/Swift/Rust E2EE module's architecture. Five CI gates that catch boundary breaks before they ship."
pubDatetime: 2026-08-30T04:22:00.000Z
featured: false
draft: false
tags:
  - ci-cd
  - e2ee
  - flutter
  - rust
  - modularization
series: quality-gates
seriesOrder: 1
articleType: big-question
---

The PR was small. Someone needed a feature flag inside the Kotlin bridge of our E2EE module, and the flag lived on the Dart side. The fastest way to read it was to skip the Pigeon contract: fetch the running engine from `io.flutter.embedding.engine.FlutterEngineCache` and open a second `MethodChannel` straight into the app. A dozen lines. It compiled — the bridge is a Flutter plugin, so the embedding is already on its classpath. Five hundred unit tests stayed green. The reviewer — me, on a Friday — saw a flag read and approved it. Nothing in it broke a rule anyone had written down. That is the point.

Three weeks later the iOS build of the Notification Service Extension started linking `Flutter.framework`. Not because anyone touched the extension: the Kotlin change had normalized "the bridge may reach into the host app," and the next person applied the same idea in `E2eeSession.swift` — a file the extension target compiles too, because sharing one decrypt path between app and extension was the design. The extension that must decrypt a push in a [24 MB process](/posts/realm-runs-my-whole-chat-app-so-why-does-it-die-in-a-24-mb-notification-extension) now depended on an engine it could not afford to load.

Every diagram we had said this was forbidden. Nothing executable did.

> [!TIP]
> **A test checks what the code does. A gate checks what the code is allowed to be.** Five hundred green tests say nothing about whether the crypto core still has zero UI dependencies, whether the public API still matches what other teams compiled against, or whether the AAR still ships the right `.so` files. And the cheapest gate is the one the build system enforces for free — write CI gates only for the rules structure cannot refuse.

This post is the module's answer: five gates, each a rule turned into a build failure, with the smallest config that expresses it and the failure you should expect to see. The module is the one this blog keeps returning to — a Dart facade (`E2eeCore`) over Pigeon-generated platform channels, Kotlin and Swift bridges, and a Rust core (`CryptoCore`) reached through UniFFI, plus an iOS extension that decrypts notifications on its own. The names are fictional; the failure modes are not.

## Table of contents

## Why Green Tests Don't Protect Architecture

A unit test pins one behavior of one function. The properties that keep a shared module alive over years are not behaviors of functions — they are statements about the *shape* of the code: which module may import which, which symbols leave the package, which processes may link which binaries. Thoughtworks' evolutionary-architecture work calls the automated version of such a statement a [fitness function](https://www.thoughtworks.com/en-us/insights/articles/fitness-function-driven-development): "any mechanism that provides an objective integrity assessment of some architectural characteristic." A quality gate is a fitness function that blocks a merge.

The distinction matters because the two fail in opposite ways. A behavior regression usually announces itself — a test goes red, a user files a bug. An architecture regression is *silent by construction*: the code compiles, the tests pass, and the damage is that the next change becomes easier to make in the wrong direction. Six months later there is no single PR to revert.

For an E2EE module, the invariants that must not erode silently are concrete:

```text
CryptoCore (Rust)      depends on nothing platform- or UI-shaped
Kotlin / Swift bridges are the only code that sees UniFFI bindings
Public API             changes only when someone means it
Shipped AAR / XCFramework  contain exactly the slices and symbols we intend
Notification extension never links the Flutter engine
Decrypt failure        fails closed, never falls back to plaintext
```

Each line below becomes either a compile error or a red CI job.

## First, Make the Illegal Import Fail to Compile

Before writing a single CI rule, spend the structural budget. Three mechanisms make whole classes of violation impossible rather than detectable:

- **Gradle `api` vs `implementation` split.** The module's Android consumer sees only what the bridge exports; the generated UniFFI package lives in a separate Gradle module with `implementation` scope. An app that imports `uniffi.cryptocore.*` does not compile. The [multi-team post](/posts/ten-teams-one-hybrid-app-where-do-you-draw-the-module-boundaries) spends its first rule on exactly this split.
- **SPM target declarations.** On iOS the `CryptoCore` binary target is a dependency of the bridge target only. A Swift file in the app that writes `import CryptoCore` fails to resolve, because SPM will not link an undeclared product. The trick is refusing to add the convenient dependency when someone asks.
- **A thin `crypto-mobile-api` crate.** The Rust core the bindings are generated from is not `CryptoCore` itself but a small crate that re-exports the mobile surface — the anti-corruption layer the [Rust-core post](/posts/the-rust-core-is-done-so-how-do-kotlin-and-swift-actually-call-it) argued for. Internal crates can change shape without the generated Kotlin and Swift noticing.

What remains after that is the residual: rules the compiler cannot express, or can express only on one platform. Those get gates.

## Gate 1: Dependency Boundaries — Konsist, SwiftLint, import_lint, cargo-deny

**Rule.** Only the plugin's registration class touches the Flutter embedding; nothing else below the bridge depends on Flutter or a UI framework; nothing outside the bridge imports the UniFFI bindings; the notification extension links no Flutter binary.

**Tool.** One source-level import check per language, plus one binary check for the extension. Note what the Gradle split from the previous section cannot do here: the bridge *must* depend on the Flutter embedding to register itself, so no build-scope rule can keep Flutter out of the rest of it. That is a residual, and it gets a rule. The source checks are the cheapest jobs in the pipeline — seconds, no build — so they run first; the binary check waits for a build.

On Android, [Konsist](https://docs.konsist.lemonappdev.com/) reads Kotlin source and lets the rule be a normal JUnit test (`testImplementation("com.lemonappdev:konsist:0.17.3")`):

```kotlin
// android/src/test/kotlin/BoundaryTest.kt
class BoundaryTest {
    @Test
    fun `only the plugin entry point touches the Flutter embedding`() {
        Konsist.scopeFromProject()
            .files
            .filterNot { it.name == "E2eePlugin" }   // the one class Flutter registers
            .assertFalse { file ->
                file.hasImport { it.name.startsWith("io.flutter.") }
            }
    }
}
```

Run (the module's test block needs `useJUnitPlatform()`): `./gradlew :android:test --tests '*BoundaryTest*'`. **When it fails** — expected shape: the JUnit report names the file that imported `io.flutter.embedding.engine.FlutterEngineCache` from outside the entry point. A second test in the same shape bans `uniffi.cryptocore.*` outside the bridge package, for the one place the Gradle split does not reach — the module's own test source sets.

On iOS, a [SwiftLint](https://github.com/realm/SwiftLint) custom rule scoped by path does the same — Flutter and UI frameworks stay out of every bridge file except the plugin entry point:

```yaml
# .swiftlint.yml
custom_rules:
  bridge_stays_flutter_free:
    regex: '^import (Flutter|UIKit|SwiftUI)'
    included: 'ios/Classes/.*\.swift'
    excluded: 'ios/Classes/E2eePlugin\.swift'
    message: "Only the plugin entry point may import Flutter"
    severity: error
```

Run: `swiftlint lint --strict`. **When it fails** — expected shape: one `file:line:col: error: message (rule_id)` line per violation, in SwiftLint's default Xcode-style output.

On the Dart side the invariant is one level up: only `src/bridge/` may touch the Pigeon-generated messages; the public `E2eeCore` facade never speaks platform channels directly. [import_lint](https://pub.dev/packages/import_lint) expresses that as an analyzer plugin (Dart ≥ 3.10):

```yaml
# analysis_options.yaml
plugins:
  import_lint: 2.0.0
import_lint:
  rules:
    only_bridge_talks_to_pigeon:
      target: "package:e2ee_core/src/**.dart"
      from: "package:e2ee_core/src/generated/**.dart"
      except: ["package:e2ee_core/src/bridge/**.dart"]
```

Run: `dart analyze --fatal-infos`. **When it fails** — expected shape: an analyzer diagnostic on the offending import line, named after the rule.

In Rust, [cargo-deny](https://embarkstudios.github.io/cargo-deny/checks/bans/cfg.html) bans crates that would mean someone is binding platform code into the core:

```toml
# crates/crypto-mobile-api/deny.toml
[bans]
deny = ["jni", "objc", "flutter_rust_bridge"]
```

Run: `cargo deny check bans`. **When it fails** — expected shape: a diagnostic naming the banned crate and the `Cargo.lock` line, ending in `bans FAILED`.

And for the extension, the only honest check is on the linked binary, not the source:

```bash
BIN=build/ios/Release-iphoneos/Runner.app/PlugIns/NotificationService.appex/NotificationService
if otool -L "$BIN" | grep -qi Flutter; then
  echo "::error::NotificationService links Flutter"; exit 1
fi
```

`otool -L` lists the shared libraries an executable loads; the grep is the rule. **When it fails** — expected shape: `otool -L` prints one `@rpath/…` line per linked library, `Flutter.framework/Flutter` is among them, and the job exits 1. This is the check for the second PR from the opening: it fires on the first iOS build, whether or not the source rule above was ever written.

**Who does this.** Mercedes-Benz.io [writes architecture rules as Konsist tests and runs them in CI](https://www.mercedes-benz.io/blog/2024-10-31-konsist-the-game-changer-your-kotlin-project-needs); Bazel shops get the same property from [target visibility](https://bazel.build/concepts/visibility), whose docs note that disabling the check "shouldn't be done for production usage." Signal's [libsignal](https://github.com/signalapp/libsignal/blob/21176890c9c6069ce28a5a2d5e1aa6e3a981efbd/.github/workflows/build_and_test.yml#L444) goes one step further on the supply-chain side: its Android build runs `./gradlew --dependency-verification strict`, so an unverified dependency is a build failure, not a warning.

## Gate 2: Generated Code Drift — Pigeon and UniFFI

**Rule.** The committed Kotlin, Swift and Dart bindings are exactly what the generators produce from the current contract.

**Tool.** There is no drift-detection tool; the pattern is *regenerate, then diff*. Pigeon reads output paths from the `@ConfigurePigeon` annotation in the input file, so the command needs only `--input`. UniFFI generates from the compiled library passed after `--library` (current main auto-detects library mode and keeps the flag for compatibility) and accepts `--language` more than once. The Pigeon half is source-only; the UniFFI half needs a built library, which is why the workflow below runs it after the build:

```yaml
- name: Pigeon drift
  run: |
    dart run pigeon --input pigeons/e2ee_api.dart
    git diff --exit-code -- lib/src/generated android/src/main/kotlin/generated ios/Classes/Generated

- name: UniFFI drift
  run: |
    cargo run --bin uniffi-bindgen generate --library target/release/libcryptocore.so \
      --language kotlin --language swift --out-dir /tmp/bindings
    diff -r /tmp/bindings bindings/
```

Commit the generator's output directory verbatim — no formatter, no hand edits — so the diff is either empty or the whole story. **When it fails** — from `git`/`diff`: the diff itself is printed and the step exits non-zero; the failing file is named on the first line.

This gate catches two different mistakes. The obvious one is a contract change (`pigeons/e2ee_api.dart` or the Rust `#[uniffi::export]` surface) committed without regeneration, so the platforms disagree on a message shape. The subtle one is someone editing generated code by hand to "fix" a warning — a fix that evaporates on the next regeneration.

**Who does this.** Very Good Ventures runs a [`pigeon-check` job](https://verygood.ventures/blog/flutter-pigeon-type-safe-platform-channels/) that "regenerates the Dart and Swift fresh and fails the build if the result differs byte-for-byte from what is committed" — and documents the formatter trap above from experience. libsignal has a dedicated verifier instead of a diff: its JVM job runs [`cargo run -p libsignal-jni-native_kt -- --verify`](https://github.com/signalapp/libsignal/blob/21176890c9c6069ce28a5a2d5e1aa6e3a981efbd/.github/workflows/build_and_test.yml#L512) under the step name "Verify that the JNI bindings are up to date." The Matrix Rust SDK's [`test-uniffi-codegen` job](https://github.com/matrix-org/matrix-rust-sdk/blob/51f3ef0ce5390fd58463abbc2fdf468f6d6b4aa4/.github/workflows/bindings_ci.yml) regenerates UniFFI bindings on every run, and its `test-android` job checks out the separate `matrix-rust-components-kotlin` repository and builds it against the fresh SDK — the drift check extended to the real consumer.

## Gate 3: Public API Compatibility — Kotlin BCV, swift-api-digester, dart_apitool

**Rule.** The surface other teams compile against changes only through a deliberate baseline update in the same PR.

**Tool.** One API-dump-and-diff per language. Each keeps a committed baseline; the gate is "current dump equals baseline," and an intentional change is a PR that updates both.

Kotlin's [Binary Compatibility Validator](https://github.com/Kotlin/binary-compatibility-validator) (0.18.1; the Kotlin Gradle Plugin 2.2+ is folding the same feature in as an experimental `abiValidation` block, not yet recommended for production):

```kotlin
// android/build.gradle.kts
plugins {
    id("org.jetbrains.kotlinx.binary-compatibility-validator") version "0.18.1"
}
apiValidation {
    nonPublicMarkers.add("dev.heydai.e2ee.InternalE2eeApi")
}
```

`./gradlew apiDump` writes `api/android.api` once, on purpose; `./gradlew apiCheck` is the gate. **When it fails** — expected shape: `apiCheck` fails the build and prints a unified diff of the `.api` file, so the changed signature is the `-`/`+` pair in the log.

Swift ships [`swift-api-digester`](https://forums.swift.org/t/using-swift-api-digester/22956) inside Xcode. It compares two JSON dumps, so CI dumps the current module and diagnoses it against the committed baseline:

```bash
xcrun swift-api-digester -dump-sdk -module E2eeCore -I .build/debug \
  -sdk "$(xcrun --show-sdk-path)" -o /tmp/current.json
xcrun swift-api-digester -diagnose-sdk \
  -input-paths api-baseline/E2eeCore.json -input-paths /tmp/current.json
```

**When it fails** — expected shape: one diagnostic line per change, e.g. `Func Session.decrypt(_:) has parameter type change from String to Data`; wrap the call in a check for non-empty output to make it a failure. Adyen's iOS SDK team found the digester's output hard enough to consume that they [wrote and open-sourced their own diff tool](https://medium.com/adyen/preventing-accidental-api-breaks-a-swift-developers-guide-to-api-diffing-7ccb5f75b3c0), which now runs on every pull request as [`👀 Detect public API changes`](https://github.com/Adyen/adyen-ios/blob/c44f52a2b21c37774422dd5b2bb7188a9c86880d/.github/workflows/detect_api_changes.yml). That is a fair warning about the tool and a strong endorsement of the gate.

For the Dart facade, [dart_apitool](https://pub.dev/packages/dart_apitool) diffs the package against a git ref and exits non-zero when the version bump does not match the change:

```bash
dart pub global activate dart_apitool
dart-apitool diff \
  --old git://https://github.com/heydai/e2ee_core.git:main \
  --new . \
  --report-format cli
```

**When it fails** — expected shape: a `BREAKING` line naming the changed member, then a version-check failure that sets the exit code.

**Who does this.** [kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines/tree/master/kotlinx-coroutines-core/api) — the project BCV was built for — commits both a `.api` and a `.klib.api` dump next to the code. RevenueCat, whose SDKs other people's apps compile against, [uses BCV for its Kotlin Multiplatform SDK and Metalava for the Android one](https://www.revenuecat.com/blog/engineering/binary-compatability) (BCV does not support product flavors), with a CircleCI job named `metalava` running the check on every change.

## Gate 4: Artifact Integrity — What's Inside the AAR and the XCFramework

**Rule.** The release AAR contains `libcryptocore.so` for `arm64-v8a` and `armeabi-v7a`, no x86 slices, and exports the UniFFI symbols; the XCFramework has a device and a simulator slice; the notification extension binary stays under its size budget.

**Tool.** Nothing to install — an AAR is a zip, and the inspection tools already exist on every CI image. This is the only gate that tests the *product* rather than the source, which is why it comes late in the pipeline: it needs a release build.

The Android check runs on Linux (or with the NDK's `llvm-nm`, which Xcode's `nm` cannot replace because it lacks `-D`):

```bash
AAR=build/outputs/aar/e2ee_core-release.aar
unzip -l "$AAR" | awk '/jni\//{print $4}' > libs.txt
for abi in arm64-v8a armeabi-v7a; do
  grep -q "jni/$abi/libcryptocore.so" libs.txt || { echo "::error::$abi missing"; exit 1; }
done
! grep -q 'jni/x86' libs.txt || { echo "::error::x86 slice in release AAR"; exit 1; }
unzip -p "$AAR" jni/arm64-v8a/libcryptocore.so > lib.so
"$ANDROID_NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/llvm-nm" -D lib.so \
  | grep -q uniffi_cryptocore_ || { echo "::error::UniFFI symbols missing"; exit 1; }
```

The `jni/<abi>/<name>.so` layout is the [documented AAR structure](https://developer.android.com/studio/projects/android-library). **When it fails** — from the script: a `::error::` annotation naming the missing ABI or the stray slice, surfaced inline on the PR.

The XCFramework check reads the bundle's own `Info.plist` — every slice is listed under `AvailableLibraries` with a `LibraryIdentifier` such as `ios-arm64` or `ios-arm64_x86_64-simulator` — then confirms the binary inside:

```bash
XCF=build/CryptoCore.xcframework
plutil -p "$XCF/Info.plist" | grep -q '"ios-arm64"' \
  || { echo "::error::device slice missing"; exit 1; }
plutil -p "$XCF/Info.plist" | grep -q 'ios-arm64_x86_64-simulator' \
  || { echo "::error::simulator slice missing"; exit 1; }
BIN="$XCF/ios-arm64/CryptoCore.framework/CryptoCore"
lipo -info "$BIN" | grep -q arm64 || { echo "::error::device binary is not arm64"; exit 1; }
nm -gU "$BIN" | grep -q uniffi_cryptocore_ || { echo "::error::UniFFI symbols missing"; exit 1; }
```

**When it fails** — from the script: the first missing slice or symbol names itself. Note what this does *not* check: whether the bundle is signed or who built it. Apple's [XCFramework signature verification](https://developer.apple.com/documentation/xcode/verifying-the-origin-of-your-xcframeworks) answers *provenance*; this gate answers *shape*. Both questions are real, and a signed XCFramework with a missing simulator slice is still broken.

The extension gets a size budget on top. The 24 MB memory limit is not in Apple's documentation, but it is in every crash log — an Apple engineer states it plainly on the [developer forums](https://developer.apple.com/forums/thread/761212) — so the module treats binary size as a leading indicator:

```bash
NSE=build/ios/Release-iphoneos/Runner.app/PlugIns/NotificationService.appex/NotificationService
SIZE=$(stat -f%z "$NSE")   # macOS stat
[ "$SIZE" -lt 5000000 ] || { echo "::error::NotificationService is $SIZE bytes; budget 5 MB"; exit 1; }
```

The 5 MB figure is a project choice, not a platform constant; pick yours from a measurement on the oldest device you support.

**Who does this.** libsignal's Android job pipes [`java/check_code_size.py`](https://github.com/signalapp/libsignal/blob/21176890c9c6069ce28a5a2d5e1aa6e3a981efbd/.github/workflows/build_and_test.yml#L452) into the step summary on every build. Signal-Android has published [reproducible builds since version 3.15.0](https://github.com/signalapp/Signal-Android/blob/main/reproducible-builds/README.md) — the strongest artifact gate there is, comparing the Play Store APK against a Docker-built one — and the issue titled ["Reproducible Builds are broken"](https://github.com/signalapp/Signal-Android/issues/13565) — since fixed — is a reminder that artifact gates rot with the toolchain and need an owner. App-size budgets are common enough that a vendor has a business around them; Emerge Tools' [own case-study page](https://www.emergetools.com/case-studies) reports a 20% size reduction at Duolingo, a figure worth reading as a vendor claim.

## Gate 5: Security Invariants, and Mutation Testing as the Gate

**Rule.** A decrypt failure fails closed — no plaintext fallback, no state advance; the account pickle has exactly one writer; the extension cannot mutate app-owned state.

**Tool.** These are tests, and by this post's own thesis a test is not a gate. The gate is what sits on top of them: a mutation run that fails the build when a test would *not* notice its invariant being removed. First the invariants — as property tests over the input space, not example tests over three inputs, because coverage of `decrypt()` says nothing about the ciphertexts nobody thought to write down.

In Rust, [proptest](https://proptest-rs.github.io/proptest/proptest/getting-started.html) generates the ciphertexts:

```rust
proptest! {
    #[test]
    fn corrupted_ciphertext_fails_closed(idx in 0usize..64, flip in 1u8..=255) {
        let mut session = established_session();
        let mut ct = session.encrypt(b"hello");
        let i = idx % ct.len();
        ct[i] ^= flip;                                  // corrupt one real byte
        let before = session.ratchet_state();
        prop_assert!(session.decrypt(&ct).is_err());
        prop_assert_eq!(session.ratchet_state(), before); // failure must not advance state
    }
}
```

Random garbage would be a vacuous test — it dies in header parsing before any authentication check runs. Corrupting a *valid* ciphertext exercises the path that matters, and the second assertion is the fail-closed half: a rejected message must leave the ratchet where it was. **When it fails** — expected shape: proptest prints the failing assertion and the minimal `(idx, flip)` pair it shrank to.

In Kotlin, [Kotest's `checkAll`](https://kotest.io/docs/proptest/property-test-functions.html) drives the single-writer invariant across concurrency levels:

```kotlin
class AccountPickleTest : StringSpec({
    "concurrent saves never produce two writers" {
        checkAll(Arb.int(2..10)) { n ->
            val store = AccountPickleStore(tempDir())
            runBlocking { (1..n).map { async { store.save(fakeAccount()) } }.awaitAll() }
            store.mutationLog().distinctBy { it.writerId }.size shouldBe 1
        }
    }
})
```

**When it fails** — expected shape: `expected:<1> but was:<3>` with the `n` that produced it.

In Swift, [swift-testing](https://developer.apple.com/documentation/testing) asserts the extension's storage handle is read-only (the error type must be `Equatable` for this overload):

```swift
enum AccountStoreError: Error, Equatable { case readOnlyContext }

@Test func extensionCannotMutateAppOwnedState() throws {
    let handle = AccountStore.openForExtension()
    #expect(throws: AccountStoreError.readOnlyContext) {
        try handle.save(fakeAccount())
    }
}
```

**When it fails** — expected shape: `Expectation failed: an error was expected but none was thrown`.

Then the question every invariant test must answer: *would this test notice if the invariant were removed?* [cargo-mutants](https://mutants.rs/in-diff.html) answers it by editing the code and re-running the tests; `--in-diff` restricts it to the lines a PR touched, which keeps it affordable on every merge request:

```bash
git diff origin/main.. > git.diff
cargo mutants --in-diff git.diff
```

**Who does this.** vodozemac — the Olm/Megolm implementation under Element X — runs exactly that on pull requests: [`cargo mutants -vV --no-shuffle --in-place --in-diff git.diff`](https://github.com/matrix-org/vodozemac/blob/main/.github/workflows/mutants.yml), with [proptest](https://github.com/matrix-org/vodozemac/blob/main/Cargo.toml) in its dev-dependencies and [nine AFL fuzz harnesses](https://github.com/matrix-org/vodozemac/tree/main/afl) in the repository, one per decode or decrypt entry point (`olm-decryption`, `megolm-session-import`, `olm-account-unpickling`, …). libsignal does not run the fuzzers in CI but [checks on every build that the fuzz targets still compile](https://github.com/signalapp/libsignal/blob/21176890c9c6069ce28a5a2d5e1aa6e3a981efbd/.github/workflows/build_and_test.yml#L271) — a gate on the gate.

## Wiring the Gates into One GitHub Actions Workflow

Ordering is the design decision. Source-only checks — the import rules and the Pigeon diff — run in seconds on a Linux runner. Tests and the mutation run take minutes. Everything that needs a build — the UniFFI drift check, the API dumps, the artifact and `otool` checks — runs last, in one macOS job, because a failed import rule should never wait for Xcode. `needs:` makes the order explicit, and a path filter keeps the whole chain off PRs that do not touch the module while still reporting a status, so branch rules never wait on a skipped job.

```yaml
name: e2ee-module-gate
on: [pull_request]
concurrency:
  group: e2ee-${{ github.ref }}
  cancel-in-progress: true
permissions:
  contents: read

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs: { touched: "${{ steps.f.outputs.e2ee }}" }
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v4
        id: f
        with:
          filters: |
            e2ee:
              - 'packages/e2ee_core/**'
              - 'crates/crypto-mobile-api/**'

  source:     # Gate 1 import rules + Pigeon diff: seconds, no build
    needs: changes
    if: needs.changes.outputs.touched == 'true'
    runs-on: ubuntu-latest
    steps: [ { uses: actions/checkout@v4 }, { run: ./ci/gate-source.sh } ]

  invariants: # Gate 5 property tests + cargo-mutants --in-diff: minutes
    needs: source
    runs-on: ubuntu-latest
    steps: [ { uses: actions/checkout@v4 }, { run: ./ci/gate-invariants.sh } ]

  binary:     # build, then Gate 2 UniFFI drift, Gate 3 API dumps, Gate 4 artifacts + otool
    needs: invariants
    runs-on: macos-latest
    steps: [ { uses: actions/checkout@v4 }, { run: ./ci/build-release.sh }, { run: ./ci/gate-binary.sh } ]
```

Two details make the file a gate rather than a report. `permissions: contents: read` keeps the job's token read-only; the projects in the table below go further and pin every action to a commit SHA, which is the right call when the product is a crypto core. And the job names — `source`, `invariants`, `binary` — are what a [repository ruleset](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) lists as required status checks; without that rule, a red job is a suggestion.

**Who does this.** libsignal's pipeline opens with a job literally named [`Classify changes`](https://github.com/signalapp/libsignal/blob/21176890c9c6069ce28a5a2d5e1aa6e3a981efbd/.github/workflows/build_and_test.yml#L35), and its "Check pattern completeness" step fails the build if a changed file matches *no* filter — so a new directory cannot silently escape every gate. Its [`android_integration.yml`](https://github.com/signalapp/libsignal/blob/5b01603c36f8c2deda1d5fcc32bbdc07e02d0cfe/.github/workflows/android_integration.yml) then checks out Signal-Android and runs its QA suite against the local library — the consumer as the final gate.

## Who Does This in Production

| Project | Gate | Mechanism |
|---|---|---|
| [libsignal](https://github.com/signalapp/libsignal) (Signal) | path classification, dependency verification, bindings drift, code size, fuzz-targets-build, consumer build | `Classify changes` job; `--dependency-verification strict`; `libsignal-jni-native_kt -- --verify`; `check_code_size.py`; `cargo check` under `--cfg fuzzing`; Signal-Android built against local libsignal |
| [matrix-rust-sdk](https://github.com/matrix-org/matrix-rust-sdk) (Element) | UniFFI codegen, consumer build, dependency policy | `test-uniffi-codegen`; `test-android` builds `matrix-rust-components-kotlin`; [`cargo-deny` workflow](https://github.com/matrix-org/matrix-rust-sdk/blob/main/.github/workflows/deny.yml) |
| [vodozemac](https://github.com/matrix-org/vodozemac) (Matrix crypto) | mutation testing on PR diff, property tests, fuzz harnesses | `cargo mutants --in-diff` in CI; proptest; 9 AFL harnesses in-repo |
| [core-crypto](https://github.com/wireapp/core-crypto) (Wire) | dependency policy, cross-platform interop, Kotlin lint | `cargo deny --all-features check`; `e2e-interop-test` across Android/iOS/web bindings; ktlint |
| [RevenueCat](https://www.revenuecat.com/blog/engineering/binary-compatability) | public API compatibility | BCV (KMP) + Metalava (Android) in CI |
| [kotlinx.coroutines](https://github.com/Kotlin/kotlinx.coroutines/tree/master/kotlinx-coroutines-core/api) | public API compatibility | committed `.api` + `.klib.api` dumps |
| [Adyen iOS](https://github.com/Adyen/adyen-ios) | public API compatibility | own `adyen-swift-public-api-diff` on every PR |

The pattern across the table: nobody gates everything, and every project that ships a crypto core to other people's apps gates *generated code* and *dependencies* first. The API and artifact gates appear wherever the module is a product someone else compiles against.

## What These Gates Don't Catch

Honesty about the residual is part of the design.

- **Logic bugs inside the boundary.** A ratchet advanced twice, a key derived from the wrong input — Gate 5 catches what you thought to write a property for, and nothing else. Fuzzing widens the net; it does not close it.
- **Crypto misuse that is structurally legal.** Nonce reuse is a perfectly well-formed call. That is a review and audit problem, not a CI problem.
- **Supply chain.** The `cargo-deny` sample runs `bans` only — the architecture half. Its `advisories` and `licenses` checks, and Gradle's dependency verification, are the half every project in the table runs and this post leaves to a later one.
- **Gate rot.** Signal's reproducible-build gate broke and had to be repaired. Every gate here has a toolchain under it — Xcode, NDK, UniFFI — and each upgrade is a chance for a green job to stop meaning anything. Assign an owner; treat a gate that has not failed in a year with suspicion.
- **The false-positive tax.** A rule that fires on legitimate work gets a `// konsist-ignore` and then a precedent. Each gate above is scoped as narrowly as its invariant, on purpose.
- **Gates I chose not to write.** Mutation testing on the Kotlin side — the Android tooling ecosystem has no production adopter I could find, only papers. Mutation testing in Dart — the one package is unmaintained. Both would be ceremony: the logic worth mutating lives in Rust.

## The PR, Re-run

Push the Kotlin change from the opening against this pipeline. `changes` classifies it as touching the module. `source` runs Konsist and, in seconds, would print the expected shape of the first gate:

```text
BoundaryTest > only the plugin entry point touches the Flutter embedding FAILED
    ... E2eeSessionBridge.kt imports io.flutter.embedding.engine.FlutterEngineCache
```

The PR that was legal by every written rule is now illegal by an executable one, and the Swift copy of it never gets written. Suppose it does anyway — a new file outside the linted path, a rule someone loosened. `binary` builds the extension and runs `otool -L`:

```text
::error::NotificationService links Flutter
```

One line, on the PR, before a reviewer opens it. The diagram never said that. The pipeline does.

That is the shape of the whole series: take the sentence on the architecture diagram, ask which build system could refuse it for free, and turn whatever remains into a job that fails. Next: how to know the invariant tests in Gate 5 are actually testing anything — mutation testing a crypto core, with the numbers.

## Sources

**Framing**

- [Fitness function-driven development — Thoughtworks](https://www.thoughtworks.com/en-us/insights/articles/fitness-function-driven-development)
- [Bazel: Visibility](https://bazel.build/concepts/visibility)

**Gate 1 — boundaries**

- [Konsist docs](https://docs.konsist.lemonappdev.com/) · [snippets](https://docs.konsist.lemonappdev.com/inspiration/snippets/general-snippets)
- [SwiftLint — custom rules](https://github.com/realm/SwiftLint)
- [import_lint](https://pub.dev/packages/import_lint)
- [cargo-deny — bans](https://embarkstudios.github.io/cargo-deny/checks/bans/cfg.html)
- [Konsist at Mercedes-Benz.io](https://www.mercedes-benz.io/blog/2024-10-31-konsist-the-game-changer-your-kotlin-project-needs)

**Gate 2 — generated code**

- [Pigeon](https://pub.dev/packages/pigeon) · [UniFFI: foreign-language bindings](https://mozilla.github.io/uniffi-rs/latest/tutorial/foreign_language_bindings.html)
- [Very Good Ventures — Pigeon in production](https://verygood.ventures/blog/flutter-pigeon-type-safe-platform-channels/)
- [libsignal `build_and_test.yml`](https://github.com/signalapp/libsignal/blob/21176890c9c6069ce28a5a2d5e1aa6e3a981efbd/.github/workflows/build_and_test.yml) · [`android_integration.yml`](https://github.com/signalapp/libsignal/blob/5b01603c36f8c2deda1d5fcc32bbdc07e02d0cfe/.github/workflows/android_integration.yml)
- [matrix-rust-sdk `bindings_ci.yml`](https://github.com/matrix-org/matrix-rust-sdk/blob/51f3ef0ce5390fd58463abbc2fdf468f6d6b4aa4/.github/workflows/bindings_ci.yml)

**Gate 3 — public API**

- [Kotlin Binary Compatibility Validator](https://github.com/Kotlin/binary-compatibility-validator) · [KGP binary compatibility validation](https://kotlinlang.org/docs/gradle-binary-compatibility-validation.html)
- [Using swift-api-digester — Swift Forums](https://forums.swift.org/t/using-swift-api-digester/22956)
- [dart_apitool](https://pub.dev/packages/dart_apitool)
- [RevenueCat — Ensuring public interface reliability](https://www.revenuecat.com/blog/engineering/binary-compatability)
- [Adyen — Preventing accidental API breaks](https://medium.com/adyen/preventing-accidental-api-breaks-a-swift-developers-guide-to-api-diffing-7ccb5f75b3c0) · [`detect_api_changes.yml`](https://github.com/Adyen/adyen-ios/blob/c44f52a2b21c37774422dd5b2bb7188a9c86880d/.github/workflows/detect_api_changes.yml)
- [kotlinx.coroutines API dumps](https://github.com/Kotlin/kotlinx.coroutines/tree/master/kotlinx-coroutines-core/api)

**Gate 4 — artifacts**

- [Android library (AAR) anatomy](https://developer.android.com/studio/projects/android-library)
- [Verifying the origin of your XCFrameworks — Apple](https://developer.apple.com/documentation/xcode/verifying-the-origin-of-your-xcframeworks)
- [NSE resource limits — Apple Developer Forums](https://developer.apple.com/forums/thread/761212)
- [Signal-Android reproducible builds](https://github.com/signalapp/Signal-Android/blob/main/reproducible-builds/README.md) · [issue #13565](https://github.com/signalapp/Signal-Android/issues/13565)
- [Emerge Tools case studies](https://www.emergetools.com/case-studies)

**Gate 5 — invariants**

- [proptest — getting started](https://proptest-rs.github.io/proptest/proptest/getting-started.html) · [Kotest property testing](https://kotest.io/docs/proptest/property-test-functions.html) · [Swift Testing](https://developer.apple.com/documentation/testing)
- [cargo-mutants — `--in-diff`](https://mutants.rs/in-diff.html)
- [vodozemac `mutants.yml`](https://github.com/matrix-org/vodozemac/blob/main/.github/workflows/mutants.yml) · [AFL harnesses](https://github.com/matrix-org/vodozemac/tree/main/afl)

**Wiring**

- [dorny/paths-filter](https://github.com/dorny/paths-filter) · [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [Wire core-crypto workflows](https://github.com/wireapp/core-crypto/tree/main/.github/workflows)
