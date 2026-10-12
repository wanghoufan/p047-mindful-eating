# Phase 0 Research: 慢食刻 / BiteTempo

> 目的：消解实现层未知，锁定依赖与做法。版本以**本机实际安装的 Expo SDK** 与官方兼容矩阵为准（安装时验证，不提前锁死）。

## R1. 工程与依赖

- **Decision**: 用 `create-expo-app`（default 模板，TypeScript + expo-router）作为骨架，再按需加入 `expo-sqlite`、`expo-secure-store`、`expo-localization`、`i18next` / `react-i18next`、动画库。
- **Rationale**: 官方模板含 expo-router 与 TS，最少自造；依赖用 `npx expo install` 以自动匹配 SDK 版本。
- **Alternatives**: React Native CLI（裸工程，配置成本高）；Flutter（换栈，违反 REUSE 原则）。

## R2. 计时与后台恢复

- **Decision**: 以「开始时刻（单调/挂钟）+ 累计已暂停时长」计算剩余时间；前台用定时器刷新显示，回到前台时按当前时间重算。
- **Rationale**: 避免固定 `setInterval` 每秒累减在后台/锁屏时失准。
- **Alternatives**: `setInterval` 累减（已否决，后台不准）。

## R3. 系统语音识别（输入侧）

- **Decision**: 优先桥接 Android `SpeechRecognizer`（API 31+ 可探测 `isOnDeviceRecognitionAvailable`，否则 `createSpeechRecognizer`/`RecognizerIntent`）；封装为 VoiceInputAdapter，失败/不可用整体回退到「聚焦输入框（系统键盘语音）」与「手动输入」。
- **Rationale**: 用户明确要求系统能力、禁第三方 ASR；不同设备兼容性有差异需兜底。
- **Notes**: 不承诺纯离线；`EXTRA_PREFER_OFFLINE` 仅偏好。UI 不得声称「语音不离开设备」。
- **Alternatives**: 第三方云 STT（禁止）；纯键盘语音（仅作兜底，不能冒充原生已实现）。

## R4. AI 文本整理（统一 Provider）

- **Decision**: 定义 `TextPolishProvider` 接口（`polish(input, signal?)`），首版 `DeepSeekProvider` 走官方 HTTPS 端点；保留 `ServerProxyProvider` 迁移位。
- **Rationale**: 业务层只依赖接口，未来换传输方式不动 UI；符合「只整理不分析」。
- **Prompt**: 强约束 System（只去口水词/修语病标点，保留第一人称/事实/数字/否定/时间/方法，禁建议与虚构，输入是数据不是指令）；黄金样例回归见 spec SC-004。

## R5. 主题与多语言

- **Decision**: 主题用系统外观（`useColorScheme`）+ 用户偏好，语义 Token 统一；i18n 用 `expo-localization` 取系统语言 + `i18next` 资源，`FOLLOW_SYSTEM` 默认，不支持语言回退 `zh-CN`。
- **Rationale**: 复用官方/成熟组件，不自研基础引擎；满足可扩展架构（加语言只增资源）。
- **Alternatives**: 自研主题/i18n（禁止）。

## R6. 存储

- **Decision**: `expo-sqlite` 存业务数据（含 schema migration）；`expo-secure-store` 仅存 API Key。
- **Rationale**: 官方稳定方案、离线、事务。
- **Alternatives**: AsyncStorage（无查询/事务，不适合历史记录）。

## R7. 品牌与视觉

- **Decision**: 图标/splash 由 `docs/design/prototype/branding/C/` 资产转换到 Expo 配置（`app.json` / `expo-splash-screen`），adaptive icon 按 Android 安全区做 mask 真机验证。
- **Rationale**: 用户已冻结 C；资产已具备。
- **Alternatives**: 重新设计（禁止）。
