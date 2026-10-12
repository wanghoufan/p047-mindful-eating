# 语音识别真机排查结论（P047 慢食刻 / BiteTempo）

设备：Xiaomi 22041216UC（xagapro / Redmi），MIUI；ADB `IN9LZTAYV4UGU4JF`
时间：2026-10-12

## 一句话结论

**两台 MIUI 设备（Redmi 22041216UC、Redmi Note 12 Pro 22101316C）的系统语音识别引擎“内部识别成功但从不把结果回传给第三方 App”**，属 OEM 平台缺陷，换机复测不能解决，App 侧无法修复。已按规范实现系统识别 + 键盘语音/手动输入兜底，并修好“自动终止”这类界面问题。

## 已实现的系统语音通道

- Android `SpeechRecognizer`（原生桥接，本地 Expo Module `modules/my-module`，Kotlin）。
- 通过 `<queries>` 声明 `android.speech.RecognitionService` / `RECOGNIZE_SPEECH`（Android 11+ 包可见性）——**修复后能力探测由 false 变 true**。
- 用 **Activity 上下文**创建识别器——**修复了 `50010004 timeout at DIALOG_START`**。
- 持续聆听（单次结束自动续听、去抖重启）＋「停止」由用户控制——**修复了“一句话说不完/自动终止”**。
- 失败时（无权限/无匹配/服务不可用）明确提示并回退「系统键盘语音 / 手动输入」。

## 实测证据（logcat）

1. 能力探测：`SpeechRecognizer.isRecognitionAvailable()` 返回 **true**（设备存在 `com.xiaomi.mibrain.speech.asr.AsrService`）。
2. 引擎确实在识别（外放中文语音时）：
   ```
   AsrService: handleMsg: ASR_DATA results=特别快后面放下筷子就慢一些
   AsrService: handleMsg: ASR_DATA results=筷子就慢一些
   ```
3. 但**我们的 `RecognitionListener` 从未收到 `onPartial/onResults`**：
   ```
   RemoteSpeechRecognitionService: #startListening called while listening is in progress for this caller.   （反复出现）
   ```
   即引擎未把结果投递给调用方 App。
4. 系统识别界面兜底（`RecognizerIntent` → 小米 `AsrActivity`）：界面能打开、显示「正在倾听」/「说完了」，但同样**不带回结果**（`onActivityResult` 为取消/空）。

## 结论边界

- 这是**设备/系统 ASR 行为**，非 App 逻辑；同一代码在具备正常系统 ASR 的设备（如装有 Google 语音服务的机型）应可工作。
- 规范与交接包已预期此风险（R1 / 课程第 121 讲）：系统识别不可用时允许**键盘语音或手动输入**兜底。

## 不受影响、已验证可用

- **AI 文本整理（DeepSeek 真接口）**：用户 Key 有效；去口水词、保留事实/否定、拒绝越权建议（黄金样例 4/4 通过）。
- 手动输入 → AI 整理 → 保存 → 历史记录：可用。
- 计时 / 光球 / 静音文字轮播 / 暂停恢复 / 主题三态 / 中英切换：可用。

## 第二台机复测（2026-10-12，Redmi Note 12 Pro）

设备：Redmi Note 12 Pro（22101316C / ruby，Android 14，MIUI V816），ADB `indq5xfi6hovay4d`；测试方式＝Mac mini 外放（Tingting 中文 TTS）对手机麦克风播测试句，全程 ADB 截图＋logcat 留证（`docs/qa/evidence/week10/`）。

**结论：换机不能解决，属同一类 MIUI/小米 ASR 平台行为。**

1. App 内 `SpeechRecognizer` 路径：引擎**内部确实识别成功**（logcat `ASR_DATA results=吃了15分钟`），但结果被送进小爱 NLP/TTS 管线（`Nlp.StartAnswer` → `SpeechSynthesizer.Speak` → `Dialog.Finish`），**从未回调 `onResults/onPartialResults` 给第三方 App**；另有多次 `onCallbackResults: param error`、`error code: 7 (NO_MATCH)`。App 端只收到 onError → 界面提示「没有听到内容，请再试一次」。
2. 系统识别界面路径（`RecognizerIntent` → 小米 `AsrActivity`，**完全不经过本 App 代码**）：能弹出「正在倾听」，但反复以 `error code: 50010004 timeout at stage:DIALOG_START` / `error code: 7` 结束，UI 直接弹「**似乎出错了呢 (4)**」，不回传任何文本。
3. **排除 VPN 干扰**：手机原挂 NekoBox 全隧道 VPN；强制停止 VPN 后复测，App 内路径与系统界面路径**故障依旧**（仍有 NLP 劫持、`param error`、`DIALOG_START` 超时），故与 VPN 无关。测后已重启 NekoBox 进程，隧道未自动重连，需用户在 App 内手动点一次连接。
4. 两台机（xagapro / ruby）症状签名一致：引擎能识别 → 结果不回传第三方 App。

## 待用户裁决

1. 接受本机使用「键盘语音 / 手动输入」作为口述兜底（规范允许）；或
2. 换一台系统 ASR 正常的设备验收原生语音；或
3. 授权突破“不接第三方 ASR”的限制（需用户明确批准，属计划变更）。
