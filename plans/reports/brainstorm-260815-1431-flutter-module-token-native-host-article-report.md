# Brainstorm Report: Bài blog "Flutter Module lấy Token từ Native Host bằng cách nào khi App có nhiều Module?"

Date: 2026-08-15 | Skill: /brainstorm | Modes: none (--html/--wiki not requested)
Output article: `docs/flutter-module-token-native-host.md`

## Problem statement

Team từng ~100% Flutter, đang chuyển dần xuống native. Nhiều team, mỗi team một package (`packages/e2ee`, `packages/media`, `packages/feature-x`) gồm Dart + Android + iOS. Host App native (Android/iOS) sở hữu Token/Session/Device/Environment. Câu hỏi thật: **code trong package dùng capability + state của Host bằng cách nào?** Token là ví dụ đầu tiên; vế thứ hai của yêu cầu gốc là **cơ chế refresh dùng chung cho tất cả**.

Cần bài blog dạng phễu: click vì "Flutter lấy token native thế nào?", đọc xong hiểu boundary Flutter module ↔ native module ↔ Host + dependency direction + composition root + capability injection.

## Problem-first (concise)

- Underlying problem: N team, N package, 1 session — mỗi package tự lấy token = N cách refresh, race, logout không lan truyền, token string chạy khắp boundary.
- Assumption tested: "Flutter phải lấy token" — sai với E2EE (native làm crypto+network), đúng một phần với Feature X thuần Dart (dio). Bài phải xử lý cả hai nhánh, không né.
- Reframe: câu hỏi đúng là "package cần capability gì, ai sở hữu, inject ở đâu?" — capability là `AuthorizedClient`, không phải token.

## Codebase context

- Repo `slide` là repo deck (python-pptx, Duhat E2EE). Không có hạ tầng blog → bài là markdown mới trong `docs/`.
- Ví dụ E2EE trong deck khớp use case `packages/e2ee`.

## User decisions (verified via AskUserQuestion)

| Quyết định | Chọn |
|---|---|
| Title | H1 = title 1 (câu hỏi ngây thơ, SEO, giữ twist) + subtitle: "Và vì sao câu hỏi này dẫn tới cách nối module Flutter, module native và Host App" |
| Scope | 1 bài, 2 hồi. Hồi 1: phễu token → dependency direction → composition root. Hồi 2: capability = AuthorizedClient, refresh single-flight, retry-401, session expired lan truyền. ~3.500–4.000 từ |
| Dart networking thực tế | Hỗn hợp: E2EE/Media qua native part; Feature X gọi dio từ Dart |
| Packaging native part | Monorepo include source (`includeBuild` / SPM `path:`) |
| Design | Duyệt skeleton 11 phần nguyên vẹn, ghi report rồi viết bài |

## Evaluated approaches

### A. Viết theo outline gốc (chỉ hồi 1)
- Pros: gọn, phễu sạch.
- Cons: bỏ rơi vế "refresh chung"; "Native E2EE không cần token" chỉ là khẩu hiệu vì không nói inject cái gì; độc giả Flutter thuần thấy không áp dụng được.

### B. 1 bài 2 hồi (CHỌN)
- Pros: giải trọn cả 2 vế; reveal 3 (inject AuthorizedClient, không inject token) là payload kỹ thuật thật, trả lời thẳng "refresh chung cho tất cả"; xử lý cả nhánh Dart-dio.
- Cons: dài; cần kỷ luật mỗi nấc = 1 đoạn + 1 snippet neo vào E2EE.

### C. Series 2 bài
- Pros: mỗi bài ngắn.
- Cons: bài 1 kết thúc ở "inject capability" mà không nói capability là gì → hụt; tách refresh ra bài riêng làm mất mạch "câu hỏi sai".

## Findings đã sửa vào outline gốc

1. Refresh là lý do inject capability thay vì token — phải nói cụ thể (single-flight Mutex/actor, retry-401 một lần, `SessionEvent.expired`), không để câu "native E2EE không cần token" đứng trần.
2. "Flutter không cần token" có điều kiện → thêm nhánh Dart: `AuthClient` interface trong `host_auth` Dart package, dio interceptor gọi native `authorize()` qua đúng 1 channel; 2 composition root (native + Dart `main()`), 1 owner (platform team).
3. Reveal "direct native call" mô tả đúng mô hình monorepo include source; Host cũng là nơi register `E2eeChannel` cho Dart side → củng cố composition root.
4. Title 2 lộ twist → dùng làm subtitle.
5. Không đổ lỗi perf MethodChannel; vấn đề là ownership. Không so DI framework, không Pigeon vs MethodChannel (tối đa 1 câu).
6. Escape hatch: `TokenProvider` + `tokenChanges` cho websocket / SDK bên thứ ba, nêu rõ là ngoại lệ.
7. Ghi chú giai đoạn chuyển tiếp: nếu Flutter shell còn giữ auth, chiều đảo lại nhưng nguyên tắc y hệt.

## Final skeleton (approved)

Hồi 1: (0) Mở tree + bối cảnh → (1) 4 câu trả lời đầu tiên → (2) MethodChannel getToken + 3 vấn đề → (3) Reveal 1: native E2EE đã trong process Host, includeBuild/SPM path, `E2eeCore.register` direct call, Host register channel → (4) import AppCore? vòng phụ thuộc → đảo chiều: interface ở package, Host implement ở Application/AppDelegate → (5) Reveal 2: Flutter không nhất thiết lấy token, có điều kiện; nhánh Dart `AuthClient` + `host_auth`.
Hồi 2: (6) Reveal 3: inject `AuthorizedClient`, không inject token; refresh storm, rotation, single-flight, retry-401, session expired → (7) escape hatch `TokenProvider` → (8) Dart cùng nguyên tắc, multi-engine 1 nguồn sự thật.
Kết: (9) diagram tổng + thang 9 nấc → (10) câu hỏi sai ở đâu + checklist 5 điểm + ghi chú chuyển tiếp.

Snippets: Gradle `includeBuild` / `Package.swift path:`; Kotlin `interface AuthorizedClient` + Swift `protocol`; Kotlin composition root; Kotlin `Mutex` single-flight; Swift `actor`; Dart `AuthClient` + dio interceptor. Mỗi snippet ≤ 15 dòng.

## Success criteria

- Người đọc trả lời được: capability là gì / ai sở hữu / interface đặt đâu / inject ở đâu / vì sao token string không qua boundary.
- Cả 2 vế yêu cầu gốc (share token, refresh chung) đều được giải cụ thể.
- Không đoạn nào giải thích DI/composition root chung chung tách rời ví dụ E2EE.

## Next steps

1. Viết bài `docs/flutter-module-token-native-host.md` theo skeleton.
2. Review lại tính chính xác kỹ thuật snippet (Gradle includeBuild vs project include, SPM local path, Mutex/actor).
3. Journal.

## Unresolved questions

- Tên file bài / nơi publish cuối (blog engine nào) — mặc định `docs/`, đổi khi user cần.
