# Flutter Module lấy Token từ Native Host bằng cách nào khi App có nhiều Module?

*Và vì sao câu hỏi này dẫn tới cách nối module Flutter, module native và Host App.*

---

## Tình huống

App của chúng tôi từng gần như 100% Flutter. Rồi vì nhiều lý do (hiệu năng, khả năng dùng SDK hệ điều hành, đội ngũ native lớn dần), app đang chuyển dần xuống native: Host App là Android/iOS thuần, còn tính năng thì được chia thành package cho từng team. Mỗi package có ba phần: Dart, Android, iOS.

```
Một Mobile App
│
├── Host App
│   ├── Native Android
│   └── Native iOS
│       └── sở hữu Token / Session / Device / Environment...
│
└── packages/**
    ├── e2ee
    │   ├── e2ee/           ← Dart
    │   ├── e2ee_android/   ← Kotlin
    │   └── e2ee_ios/       ← Swift
    ├── media
    │   └── ...
    └── feature_x
        └── ...
```

Một ngày, team E2EE cần gọi API để upload prekey bundle lên server. API cần Bearer token. Token lại thuộc Host — Host mới là người đăng nhập, lưu session, biết device id, biết đang chạy môi trường nào.

```
packages/e2ee/
├── e2ee/           ← Dart
├── e2ee_android/   ← Kotlin
└── e2ee_ios/       ← Swift

                     ???

Host App
├── Android
│   └── AppCore → Token
└── iOS
    └── AppCore → Token
```

**E2EE cần gọi API. Token thuộc Host. Lấy sao?**

Token chỉ là thứ đầu tiên làm vấn đề lộ ra. Ngay sau đó là device id, environment (staging/prod), feature flag, analytics, logger... Câu hỏi thật sự là: **code nằm trong package dùng capability và state đang thuộc về Host bằng cách nào?**

Bài này đi từ câu hỏi ngây thơ nhất tới câu trả lời mà chúng tôi dừng lại. Đọc xong, hy vọng bạn thấy câu hỏi ban đầu đặt sai chỗ — và biết đặt lại nó thế nào.

> Giả định xuyên suốt: Host native sở hữu session; các package nằm trong monorepo, phần native được include source thẳng vào Host; E2EE và Media gọi mạng ở tầng native, còn Feature X gọi REST bằng dio từ Dart. Nếu bạn ở giai đoạn Flutter shell vẫn giữ auth, cuối bài có một ghi chú cho trường hợp đó.

---

## Bốn câu trả lời đầu tiên hiện ra trong đầu

Khi team E2EE hỏi trong group chat, có đúng bốn hướng được đề xuất trong vòng năm phút:

```
Dart gọi MethodChannel để lấy token?

          hay

Native E2EE package gọi thẳng Host native?

          hay

E2EE import luôn AppCore?

          hay

Host inject dependency vào E2EE?
```

Bốn câu này nghe như bốn cách làm cùng một việc. Thực ra chúng khác nhau ở một điểm căn bản: **ai phụ thuộc vào ai**. Đi từng cái một.

---

## Cách dễ nghĩ nhất: Dart gọi MethodChannel

Vì package "là Flutter", phản xạ đầu tiên là để Dart hỏi native:

```
E2EE Dart
    │
    │ getToken()
    ▼
MethodChannel
    │
    ▼
Host Native
    │
    ▼
Token
```

```dart
// packages/e2ee/e2ee/lib/src/host_token.dart
final _channel = MethodChannel('app/e2ee/token');

Future<String> getToken() async =>
    (await _channel.invokeMethod<String>('getToken'))!;
```

```kotlin
// Host Android
MethodChannel(messenger, "app/e2ee/token").setMethodCallHandler { call, result ->
    if (call.method == "getToken") result.success(sessionStore.accessToken)
}
```

Chạy được. Và ba tuần sau bạn sẽ gặp ba chuyện.

**Một, token đi một vòng vô nghĩa.** E2EE mã hoá và gửi dữ liệu ở tầng native (Kotlin/Swift, vì crypto ở đó nhanh và có keystore). Token được lôi từ native lên Dart, rồi Dart lại truyền nó xuống native của chính package đó để gọi API. Hai lần qua bridge cho một thứ vốn chưa bao giờ cần rời khỏi native.

**Hai, N package thì N channel, N cách refresh.** Media cũng cần token, mở `app/media/token`. Feature X cũng cần, mở `app/feature_x/token`. Mỗi team tự viết retry khi 401, tự quyết định lúc nào gọi refresh. Ba team, ba cách hiểu về vòng đời session.

**Ba, token string chạy khắp nơi.** Nó nằm trong Dart heap của ba package, trong log lỡ tay của ai đó, trong crash report. Ai muốn đổi cách lưu token (ví dụ chuyển sang keystore-backed) phải đi sửa cả ba chỗ.

Lưu ý: vấn đề *không phải* MethodChannel chậm. Với vài lần gọi mỗi phiên, hiệu năng bridge không đáng bàn. Vấn đề là **ownership**: token thuộc Host, nhưng cách này bắt mọi package tự đi lấy và tự quản lý nó.

---

## Reveal 1: native của E2EE vốn đã nằm trong process của Host

Đây là điều mà chính chúng tôi cũng mất một nhịp mới nhìn ra, vì đầu óc còn quen với "package = thứ ở bên kia bridge".

Trong monorepo, phần native của package được include thẳng vào Host:

```kotlin
// Host Android — settings.gradle.kts
include(":e2ee_android")
project(":e2ee_android").projectDir = file("../packages/e2ee/e2ee_android")

// app/build.gradle.kts
dependencies {
    implementation(project(":e2ee_android"))
}
```

```swift
// Host iOS — Package.swift (hoặc Add Local Package trong Xcode)
dependencies: [
    .package(name: "E2eeCore", path: "../packages/e2ee/e2ee_ios"),
]
```

Nghĩa là:

```
packages/e2ee_android
        │
        │ include(project) — cùng một build, cùng một APK
        ▼
     Host Android


packages/e2ee_ios
        │
        │ SPM local package — cùng một binary
        ▼
      Host iOS
```

Và dòng code này trong Host:

```kotlin
// Host Android
E2eeCore.register(...)
```

```swift
// Host iOS
E2eeCore.initialize(...)
```

là **direct native call**. Không có Flutter ở giữa. Không có channel. `E2eeCore` là một class Kotlin/Swift bình thường mà Host link vào và gọi như bất kỳ thư viện nào.

Điều này thay đổi câu hỏi. Native E2EE và Host đang đứng trong cùng một process, cùng một classpath. Chúng không cần bridge để nói chuyện với nhau. Bridge chỉ tồn tại giữa **Dart của E2EE** và **native của E2EE**.

Và còn một chi tiết nhỏ nhưng quan trọng: `E2eeChannel` — cái MethodChannel để Dart-side của E2EE gọi xuống native-side của E2EE — ai đăng ký nó với `FlutterEngine`? Trong add-to-app, engine do Host tạo. Nên **Host là người attach channel**. Nhớ chi tiết này, nó sẽ quay lại ở phần composition root.

Vậy nếu native E2EE và Host đã ở cạnh nhau, tại sao không để `E2eeCore` gọi thẳng `AppCore.session.token`?

---

## Vậy E2EE import thẳng AppCore?

```kotlin
// packages/e2ee/e2ee_android
import com.example.appcore.AppCore   // ← đây

object E2eeCore {
    suspend fun uploadPrekeys(bundle: PrekeyBundle) {
        val token = AppCore.session.accessToken
        api.post("/e2ee/prekeys", bundle, bearer = token)
    }
}
```

Compile được, chạy được, và nó vẽ ra một mũi tên phụ thuộc theo chiều này:

```
packages/e2ee_android ──depends on──▶ Host AppCore
Host Android          ──depends on──▶ packages/e2ee_android
```

Vòng. Với một team thì vòng này khó chịu. Với nhiều team thì nó là thảm hoạ chậm:

- Package không build độc lập được. Muốn chạy unit test cho E2EE phải kéo cả AppCore, tức là kéo cả Host.
- Mỗi lần AppCore đổi API (`session.accessToken` thành `session.current().token`), N package vỡ cùng lúc, và người sửa là N team khác chứ không phải team đổi.
- Package không tái sử dụng được ở app thứ hai, ở sample app, ở môi trường test.

Cách sửa là **đảo chiều mũi tên**: package không biết Host là ai. Package chỉ khai báo *nó cần gì*, dưới dạng interface/protocol nằm ngay trong package. Host là bên implement.

```kotlin
// packages/e2ee/e2ee_android/src/main/kotlin/com/example/e2ee/HostCapabilities.kt
interface AuthorizedClient {
    suspend fun execute(request: ApiRequest): ApiResponse
}

interface DeviceInfo {
    val deviceId: String
}

object E2eeCore {
    private lateinit var client: AuthorizedClient
    private lateinit var device: DeviceInfo

    fun register(client: AuthorizedClient, device: DeviceInfo) {
        this.client = client
        this.device = device
    }

    suspend fun uploadPrekeys(bundle: PrekeyBundle) =
        client.execute(ApiRequest.post("/e2ee/prekeys", bundle))
}
```

```swift
// packages/e2ee/e2ee_ios/Sources/E2eeCore/HostCapabilities.swift
public protocol AuthorizedClient {
    func execute(_ request: ApiRequest) async throws -> ApiResponse
}

public enum E2eeCore {
    static var client: AuthorizedClient!
    public static func initialize(client: AuthorizedClient, device: DeviceInfo) { ... }
}
```

Bây giờ mũi tên chỉ còn một chiều:

```
Host Android ──depends on──▶ packages/e2ee_android
Host Android ──implements──▶ AuthorizedClient (interface của e2ee)
```

Và nơi Host làm việc đó là **composition root** — chỗ duy nhất trong app biết mọi thứ được lắp với nhau ra sao. Trên Android là `Application.onCreate`, trên iOS là `AppDelegate` (hoặc DI graph của Host nếu bạn dùng Hilt/Swinject — bài này không bàn framework, chỉ bàn chỗ đứng).

```kotlin
// Host Android — Application.kt
class HostApp : Application() {
    lateinit var session: HostAuthSession

    override fun onCreate() {
        super.onCreate()
        session = HostAuthSession(TokenStore(this), AuthApi(env))

        // Native packages nhận capability trực tiếp
        E2eeCore.register(client = session, device = AndroidDeviceInfo(this))
        MediaCore.register(client = session)

        // Flutter engine do Host tạo → Host attach channel cho Dart-side của từng package
        val engine = FlutterEngine(this).apply {
            dartExecutor.executeDartEntrypoint(DartEntrypoint.createDefault())
        }
        E2eeChannel.attach(engine.dartExecutor.binaryMessenger, E2eeCore)
        MediaChannel.attach(engine.dartExecutor.binaryMessenger, MediaCore)
        FlutterEngineCache.getInstance().put("main", engine)
    }
}
```

Đây chính là "Host inject dependency vào E2EE" — câu trả lời thứ tư trong group chat. Nó không phải là một trong bốn cách ngang hàng. Nó là cách duy nhất giữ được chiều phụ thuộc đúng.

Một câu hỏi phụ hay gặp: interface `AuthorizedClient` nên nằm trong từng package hay trong một package chung? Cả hai đều đúng, tuỳ bạn ưu tiên gì. Mỗi package tự khai báo interface thì độc lập tuyệt đối, đổi lại Host phải viết adapter cho từng cái. Một package `host_contracts` mỏng (chỉ interface, không implementation, do team platform sở hữu) thì DRY hơn và ba team dùng chung một định nghĩa. Chúng tôi chọn `host_contracts` — nhưng giữ nó *chỉ có interface*, vì ngày nó có implementation là ngày nó biến thành AppCore thứ hai.

---

## Reveal 2: Flutter không nhất thiết phải lấy token

Quay lại câu hỏi mở bài: "Flutter Module lấy Token từ Native Host bằng cách nào?"

Với E2EE, câu trả lời là: **không lấy**. Dart-side của E2EE chỉ cần gọi native-side của E2EE:

```dart
// packages/e2ee/e2ee/lib/e2ee.dart
class E2ee {
  static const _ch = MethodChannel('app/e2ee');

  static Future<void> uploadPrekeys(PrekeyBundle b) =>
      _ch.invokeMethod('uploadPrekeys', b.toJson());
}
```

Handler native của channel này gọi `E2eeCore.uploadPrekeys`, và `E2eeCore` đã có `AuthorizedClient` từ lúc Host register. Token chưa bao giờ lên Dart, cũng chưa bao giờ đi qua channel.

```
                         HOST
                           │
               owns Token / Auth / Session
                           │
                  Composition Root
                           │
                 inject capability
                           ▼
                Native E2eeCore
                           ▲
                           │  E2eeChannel (nghiệp vụ, không phải token)
                           │
                       Flutter (e2ee Dart)
```

Đến đây phải thành thật một chút, vì kết luận "Flutter không cần token" chỉ đúng khi package gọi mạng ở native. **Feature X không như vậy.** Feature X là màn hình thuần Dart, gọi REST bằng dio, không có lý do gì để đẩy networking xuống native chỉ vì token.

Vậy Feature X lấy token thế nào? Câu trả lời giữ nguyên nguyên tắc: **Feature X cũng không lấy token. Feature X nhận một HTTP client đã được authorize.**

Team platform sở hữu một Dart package `host_auth`. Nó cung cấp một interceptor cho dio; interceptor này là **nơi duy nhất** trong toàn bộ code Dart nói chuyện với native về chuyện auth, qua **đúng một channel**:

```dart
// packages/host_auth/lib/host_auth.dart  (team platform sở hữu)
class HostAuthInterceptor extends Interceptor {
  static const _ch = MethodChannel('app/host_auth');

  @override
  Future<void> onRequest(RequestOptions o, RequestInterceptorHandler h) async {
    final headers = await _ch.invokeMapMethod<String, String>('authorize');
    o.headers.addAll(headers!);
    o.extra['authUsed'] = headers['Authorization'];
    h.next(o);
  }

  @override
  Future<void> onError(DioException e, ErrorInterceptorHandler h) async {
    if (e.response?.statusCode != 401) return h.next(e);
    // Không tự refresh. Báo native "token này vừa bị 401", native quyết định.
    await _ch.invokeMethod('unauthorized', {'stale': e.requestOptions.extra['authUsed']});
    h.resolve(await _retry(e.requestOptions));   // gửi lại request, onRequest sẽ authorize lại
  }
}
```

Composition root phía Dart — `main()` của Flutter module — lắp interceptor vào một `Dio` và phát nó cho các feature qua bất cứ DI nào bạn đang dùng:

```dart
// flutter_module/lib/main.dart
void main() {
  final dio = Dio()..interceptors.add(HostAuthInterceptor());
  runApp(AppRoot(dio: dio));   // Feature X nhận Dio qua constructor/provider
}
```

Feature X phụ thuộc vào `Dio` (hoặc một interface `ApiClient` của riêng nó, nếu bạn muốn sạch hơn). Nó **không** import `host_auth`, không biết có channel, không biết token là gì.

Vậy là có **hai composition root** — `Application`/`AppDelegate` bên native và `main()` bên Dart — nhưng **cùng một owner**: team platform. Đó là điểm mấu chốt. Nhiều team viết feature, nhưng chỉ một team quyết định capability được lắp thế nào.

Có một sự thật không tránh được: nếu Dart gọi HTTP thì token *có* nằm trong Dart process memory tại thời điểm request đi. Điều bạn kiểm soát được không phải chuyện nó có ở đó hay không, mà là **chỉ một chỗ (interceptor của `host_auth`) chạm vào nó**, và không feature nào có tay cầm để lấy ra. Muốn tuyệt đối hơn thì đẩy `execute(request)` xuống native qua channel — làm được, nhưng nặng và mất hết tiện ích của dio; chúng tôi không đi đường đó cho feature thuần UI.

---

## Reveal 3: thứ được inject không phải là token

Đến giờ, hai lần chúng ta nói "inject capability", và hai lần đều dùng tên `AuthorizedClient` chứ không phải `TokenProvider`. Đây không phải chuyện đặt tên. Đây là chỗ giải quyết vế thứ hai của bài toán: **refresh dùng chung cho tất cả**.

Giả sử bạn inject cái này:

```kotlin
interface TokenProvider {
    suspend fun accessToken(): String
}
```

Nghe hợp lý, nhỏ gọn, ai cũng hiểu. Và nó ép mỗi package tự trả lời các câu hỏi sau: gặp 401 thì làm gì? Gọi refresh ở đâu? Refresh xong ai lưu? Đang refresh dở mà request khác tới thì sao?

Hình dung app vừa mở lại sau một đêm, access token hết hạn. Trong 200ms đầu, E2EE sync prekey, Media lấy upload URL, Feature X load feed. Ba request, ba cái 401, ba lần gọi refresh song song. Nếu server dùng refresh-token rotation (khá phổ biến), lần refresh đầu thành công và làm refresh token cũ mất hiệu lực; lần thứ hai và thứ ba dùng đúng cái refresh token cũ đó → server trả lỗi → package nào đó kết luận "session hỏng" → user bị đá ra màn hình login dù họ không làm gì sai. Bug này rất khó tái hiện, và không team nào thấy mình sai.

Cách chữa không phải là "mỗi team nhớ làm single-flight". Cách chữa là **không đưa token cho package ngay từ đầu**. Package nhận một capability cao hơn một bậc: *"gửi request này thay tôi, có auth"*. Toàn bộ refresh, retry, khoá tranh chấp nằm ở Host, viết một lần.

```kotlin
// Host Android — implementation duy nhất của AuthorizedClient
class HostAuthSession(
    private val store: TokenStore,
    private val authApi: AuthApi,
    private val http: HttpClient,
) : AuthorizedClient {

    private val refreshLock = Mutex()
    private val _events = MutableSharedFlow<SessionEvent>()
    val events: SharedFlow<SessionEvent> = _events

    override suspend fun execute(request: ApiRequest): ApiResponse {
        val used = store.accessToken()
        val first = http.send(request.withBearer(used))
        if (first.code != 401) return first

        refreshIfStale(used)
        return http.send(request.withBearer(store.accessToken()))  // retry đúng một lần
    }

    private suspend fun refreshIfStale(stale: String) = refreshLock.withLock {
        if (store.accessToken() != stale) return          // ai đó vừa refresh xong rồi
        val fresh = authApi.refresh(store.refreshToken())
            ?: run { _events.emit(SessionEvent.Expired); throw SessionExpired() }
        store.save(fresh)
    }
}
```

Điểm quan trọng nằm ở hai dòng: `withLock` để chỉ một refresh chạy tại một thời điểm, và `if (store.accessToken() != stale) return` để những request xếp hàng sau lock *không* refresh lại lần nữa mà dùng luôn token mới. Ba request 401 cùng lúc → một lần refresh → ba lần retry thành công.

Bên iOS, `actor` cho bạn serialisation miễn phí, nhưng vẫn cần cùng logic "stale check + một task đang chạy":

```swift
actor HostAuthSession: AuthorizedClient {
    private var inflight: Task<Void, Error>?

    func execute(_ request: ApiRequest) async throws -> ApiResponse {
        let used = store.accessToken
        let first = try await http.send(request.withBearer(used))
        guard first.status == 401 else { return first }
        try await refreshIfStale(used)
        return try await http.send(request.withBearer(store.accessToken))
    }

    private func refreshIfStale(_ stale: String) async throws {
        if store.accessToken != stale { return }
        if let task = inflight { return try await task.value }
        let task = Task { defer { inflight = nil }
            guard let fresh = try await authApi.refresh(store.refreshToken) else {
                events.send(.expired); throw SessionExpired()
            }
            store.save(fresh)
        }
        inflight = task
        try await task.value
    }
}
```

Và `SessionEvent.Expired` là thứ giải quyết chuyện cuối cùng mà `TokenProvider` không bao giờ làm được: **logout lan truyền**. Khi refresh thất bại thật, Host phát một event; Flutter shell nghe để điều hướng về login, E2EE nghe để dừng sync, Media nghe để huỷ upload. Không package nào tự quyết "session hỏng" — chỉ có một nơi biết điều đó.

### Escape hatch, có chủ đích

Sẽ có lúc một package *thật sự* cần token thô: mở websocket với header tự tay, hoặc một SDK bên thứ ba đòi `setAuthToken(String)`. Cho những trường hợp đó, Host cung cấp thêm một capability thấp hơn, và tên nó nói rõ đây là ngoại lệ:

```kotlin
interface RawTokenAccess {
    suspend fun current(): String
    val changes: Flow<String>      // để websocket reconnect với token mới sau refresh
}
```

Quy ước của chúng tôi: muốn dùng `RawTokenAccess` phải nói lý do trong PR. Không phải để làm khó, mà để mỗi lần có người với tay lấy token thô, cả team dừng lại một giây tự hỏi "có thật là cần không".

### Dart cùng nguyên tắc

Nhìn lại `HostAuthInterceptor` ở trên: khi gặp 401, nó **không** gọi refresh. Nó gọi `unauthorized(stale)` — báo cho native rằng token này vừa bị từ chối, rồi retry. Native chạy đúng `refreshIfStale` ở trên. Nghĩa là dù bạn có hai FlutterEngine, ba isolate, và mười package Dart, vẫn chỉ có **một** chỗ refresh, một `Mutex`, một nguồn sự thật về session. Dart không cache token, không có timer tự refresh trước khi hết hạn, không có logic session nào cả.

---

## Bức tranh cuối

```
                          ┌───────────────── HOST ─────────────────┐
                          │  owns Token / Session / Device / Env    │
                          │                                         │
                          │   HostAuthSession : AuthorizedClient    │
                          │   (single-flight refresh, retry-401,    │
                          │    SessionEvent.expired)                │
                          │                 │                       │
                          │        Composition Root (native)        │
                          └───────┬─────────┬───────────────┬───────┘
                                  │         │               │
                        register  │         │ register      │ attach channels
                                  ▼         ▼               ▼
                          Native E2eeCore  Native MediaCore  app/host_auth
                                  ▲                               ▲
                     E2eeChannel  │                               │  authorize / unauthorized
                     (nghiệp vụ)  │                               │  (1 channel, 1 owner)
                                  │                               │
                          Flutter e2ee (Dart)             host_auth (Dart)
                                                                  │
                                                        Composition Root (Dart main)
                                                                  │  Dio đã có interceptor
                                                                  ▼
                                                          Feature X (Dart)
```

Và cái thang mà bài này đã leo, từng nấc một:

```
Token ownership            ← token thuộc Host, không thuộc package
      ↓
Native package linking     ← native của package đã ở trong process Host
      ↓
Flutter ↔ Native boundary  ← bridge chỉ nằm giữa Dart và native của cùng một package
      ↓
Dependency direction       ← package không được biết Host là ai
      ↓
Interface / Protocol       ← package khai báo nó cần gì
      ↓
Dependency Injection       ← Host implement và đưa vào
      ↓
Composition Root           ← đúng một chỗ lắp ráp, một owner (native + Dart)
      ↓
Capability injection       ← inject "gửi request có auth", không inject token
      ↓
Modular architecture       ← N team viết feature, 1 team quyết định lắp ráp
```

---

## Câu hỏi ban đầu sai ở đâu

"Flutter Module lấy Token từ Native Host bằng cách nào?" sai ở ba chữ.

**"Flutter"** — người cần capability không phải Flutter, mà là *package*. Package có cả Dart lẫn native, và phần native đã đứng trong Host rồi.

**"lấy"** — package không nên đi lấy gì cả. Package khai báo nhu cầu; Host đưa tới. Chiều mũi tên quyết định app của bạn có còn build được sau khi có mười team hay không.

**"Token"** — thứ package cần không phải token, mà là khả năng gọi API có auth. Token là chi tiết cài đặt của khả năng đó, và refresh, rotation, logout là những thứ đi kèm chi tiết ấy — chúng thuộc về một chỗ.

Lần tới khi một package cần thứ gì đó của Host (device id, environment, feature flag, analytics), checklist chúng tôi dùng:

1. **Capability thật sự là gì?** Không phải "cần token" mà là "cần gọi API có auth". Không phải "cần environment string" mà là "cần biết base URL".
2. **Ai sở hữu nó?** Nếu là Host, package không được có logic về nó.
3. **Interface đặt ở package** (hoặc `host_contracts` chỉ-interface). Package build và test được với một fake.
4. **Host implement ở composition root** — native và Dart, cùng một owner.
5. **Không để state nhạy cảm chạy qua boundary** khi có thể inject capability cao hơn thay thế.

### Ghi chú cho giai đoạn chuyển tiếp

Nếu bạn đang ở giữa đường — Flutter shell vẫn giữ auth, native mới chỉ là vài package — thì chiều mũi tên đảo lại: Dart sở hữu session, native package khai báo `AuthorizedClient` bằng Kotlin/Swift và nhận implementation là một adapter gọi ngược lên Dart qua channel. Trông ngược, nhưng nguyên tắc y hệt: **ai sở hữu thì người đó implement, người cần thì khai báo interface, và chỉ có một chỗ refresh.** Ngày Host native tiếp quản session, bạn đổi implementation ở composition root; interface trong package không đổi một dòng.

Đó là toàn bộ lý do để làm đúng ngay từ chuyện nhỏ như một cái token.
