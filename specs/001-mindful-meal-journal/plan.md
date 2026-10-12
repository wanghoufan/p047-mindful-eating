# Implementation Plan: 慢食刻 / BiteTempo · 正念用餐与语音心得

**Branch**: `001-mindful-meal-journal` | **Date**: 2026-10-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-mindful-meal-journal/spec.md`

## Summary

用 Expo / React Native + TypeScript 实现安卓首发 App「慢食刻 / BiteTempo」：两 Tab（用餐/心得）+ 顶部设置入口。用餐页以可重入状态机驱动光球与倒计时，倒计时下方**单句无声文字提醒自动轮播**；心得页经 Android 本机系统语音识别采集口述，再经统一 `TextPolishProvider`（首版 DeepSeek）**只做去口水词/修语病标点**的整理，原文/结果对照后本地保存。主题三态、中英双语、本地持久化（SQLite）与 BYOK 密钥（SecureStore）全部落实。视觉严格对照已冻结的 C 方向 HTML 原型，Android 底部导航用官方组件、底栏固定不随内容滚动。

## Technical Context

**Language/Version**: TypeScript 5.x（React Native，Expo SDK 以本机实际安装为准）

**Primary Dependencies**: expo、expo-router、react-native、react-native-reanimated（或官方动画）、expo-sqlite、expo-secure-store、expo-localization、i18next、@react-native-async-storage/async-storage（如需）、原生语音桥接（Kotlin/Config Plugin 或成熟维护插件）

**Storage**: 本地 SQLite（`expo-sqlite`）保存 MealSession / MealNote / LocalSettings；`expo-secure-store` 仅存 DeepSeek API Key

**Testing**: TypeScript 类型检查（`tsc --noEmit`）、ESLint；真机手工 QA（开发版 + 独立 APK）；核心逻辑（计时恢复、去口水词 Prompt、语言回退）以可运行断言/脚本核验

**Target Platform**: Android（真机 22041216UC / xagapro，ADB `IN9LZTAYV4UGU4JF`）；最小 SDK 以 Expo 默认为准

**Project Type**: mobile-app（单一 Expo 工程，仓库根）

**Performance Goals**: 光球动画流畅不闪烁；倒计时秒级精度；交互无卡顿

**Constraints**: 用餐提醒全程静音（无声音/振动/TTS）；离线核心可用；计时不得靠固定 setInterval 累减；密钥不入库/日志/`EXPO_PUBLIC_*`

**Scale/Scope**: 单用户本地应用；2 主页面 + 1 设置页；无后端、无账号

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 检查 | 结论 |
|---|---|---|
| I. 用户场景与范围冻结 | 仅两 Tab + 顶部设置，无被排除能力 | PASS |
| II. 原型为视觉与交互真源 | UI 逐状态对照 `docs/design/prototype/index.html`；不用 WebView | PASS |
| III. AI 只整理、不改意 | 统一 Provider + 强约束 Prompt + 原文对照 + 黄金样例 | PASS |
| IV. 隐私/密钥/权限最小化 | 主动触发才用麦克风；BYOK SecureStore；无硬编码 | PASS |
| V. 离线核心与静默 | 计时/心得离线可用；提醒仅屏幕文字 | PASS |
| VI. 主题与多语言基线 | LIGHT/DARK/SYSTEM + zh-CN/en/FOLLOW_SYSTEM + 持久化 | PASS |
| VII. 真机证据优先 | 真机安装/操作/截图；未测标 NOT_TESTED，缺凭证标 BLOCKED | PASS |

无违反项。复杂度跟踪无需要。

## Project Structure

### Documentation (this feature)

```text
specs/001-mindful-meal-journal/
├── plan.md              # 本文件
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
├── checklists/
│   └── requirements.md  # 规格质量清单
└── tasks.md             # Phase 2 输出（/speckit.tasks）
```

### Source Code (repository root)

```text
047-ing-正念吃饭/
├── app/                         # expo-router 路由（Expo 官方约定）
│   ├── _layout.tsx              # 根布局：主题 Provider + i18n Provider
│   ├── (tabs)/
│   │   ├── _layout.tsx          # 底部两 Tab（用餐/心得），底栏固定
│   │   ├── index.tsx            # 用餐页（光球 + 倒计时 + 静音文字轮播）
│   │   └── journal.tsx          # 心得页（语音/原文/整理对照/历史）
│   └── settings.tsx             # 设置页（主题/语言/提醒间隔/动画/AI Key）
├── src/
│   ├── domain/                  # 实体与仓储接口（MealSession/MealNote/LocalSettings）
│   ├── state/                   # 计时状态机（单调时钟 + 挂钟校正）
│   ├── storage/                 # expo-sqlite 仓储实现 + migration
│   ├── voice/                   # 系统语音适配（原生桥接 + 键盘/手动兜底）
│   ├── ai/                      # TextPolishProvider + DeepSeekProvider + Prompt
│   ├── theme/                   # 语义 Token + 三态主题
│   ├── i18n/                    # zh-CN / en 资源 + FOLLOW_SYSTEM
│   └── components/              # Orb / TipRotator / NoteEditor 等
├── assets/                      # 图标/启动图（来自 branding/C）
├── docs/review/                 # ORCA 自审
├── docs/qa/                     # ORCA 真机 QA 证据 + 产品验收追踪矩阵
└── android/                     # expo prebuild 生成的原生工程
```

**Structure Decision**: 采用单一 Expo 工程于仓库根（handoff 明确 `src/`/`app/` 于根）；`app/` 为 expo-router 约定目录，其余业务分层入 `src/`。原生语音以一个本地 Expo Module/Config Plugin 桥接 Android `SpeechRecognizer`。

## Complexity Tracking

无宪法违反项，本节不适用。
