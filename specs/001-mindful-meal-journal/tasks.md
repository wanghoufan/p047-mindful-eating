---
description: "Task list for 慢食刻 / BiteTempo"
---

# Tasks: 慢食刻 / BiteTempo · 正念用餐与语音心得

**Input**: Design documents from `/specs/001-mindful-meal-journal/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: 本特性未显式要求自动化测试套件；验证以「类型检查 + Lint + 真机 QA + 关键逻辑断言脚本」为主（见 quickstart.md 与 QA 用例）。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无依赖）
- **[Story]**: US1（计时）/ US2（心得）/ US3（设置）

## Phase 1: Setup（共享基础设施）

- [ ] T001 初始化 Expo + TypeScript 工程于仓库根（create-expo-app，保留已有 ORCA 文件不被覆盖）
- [ ] T002 [P] 安装并核对核心依赖：expo-router、reanimated、expo-sqlite、expo-secure-store、expo-localization、i18next、react-i18next（`npx expo install`）
- [ ] T003 [P] 配置 ESLint / tsconfig / Prettier 与 `npm run lint`、`npm run typecheck` 脚本
- [ ] T004 [P] 写入 `app.json`：名称（慢食刻/BiteTempo）、slug、包名、图标与 splash 指向 `branding/C` 资产
- [ ] T005 [P] 复制品牌资产到 `assets/`（icon/adaptive-foreground/splash）

## Phase 2: Foundational（阻塞前置）

- [ ] T006 主题系统：语义 Token + LIGHT/DARK/SYSTEM（默认 SYSTEM），根 Provider 注入（`src/theme/`）
- [ ] T007 [P] i18n：zh-CN / en 资源 + FOLLOW_SYSTEM 默认 + 回退 zh-CN（`src/i18n/`）
- [ ] T008 [P] SQLite 初始化与 migration（`src/storage/`），实体仓储接口（`src/domain/`）
- [ ] T009 [P] 设置持久化读写（LocalSettings）与启动加载
- [ ] T010 expo-router 骨架：根布局 + `(tabs)` 两 Tab（用餐/心得）+ 设置路由；底栏固定不随内容滚动

## Phase 3: US1 - 用餐计时与慢食提醒 (P1) 🎯 MVP

**Goal**: 选时长 → 开始 → 光球 + 倒数 + 静音文字自动轮播 → 暂停/继续/提前结束 → 保存会话。

**Independent Test**: 真机执行 quickstart 第 1–2 步，核对倒数/暂停冻结/后台恢复/全程静音。

- [ ] T011 [US1] 计时状态机（单调时钟 + 挂钟校正）：`src/state/timer.ts`
- [ ] T012 [P] [US1] 光球组件（呼吸动画 + 减少动画支持）：`src/components/Orb.tsx`
- [ ] T013 [P] [US1] 静音文字轮播组件（单句、间隔可设、暂停冻结、无按钮）：`src/components/TipRotator.tsx`
- [ ] T014 [US1] 用餐页 UI（默认 10:00、四预设、开始/暂停/结束确认、达标提示）：`app/(tabs)/index.tsx`
- [ ] T015 [US1] 会话保存到 SQLite + 时长记忆
- [ ] T016 [US1] 后台/锁屏恢复：AppState 监听重算剩余时间

**Checkpoint**: US1 可独立在真机演示。

## Phase 4: US2 - 语音心得与 AI 整理 (P1)

**Goal**: 系统语音/手动录入 → 原文可编辑 → AI 只整理 → 对照确认 → 保存 → 历史 CRUD。

**Independent Test**: 真机口述一段中文含口水话，核对原文落入、AI 只润色不改意、保存与删除。

- [ ] T017 [US2] VoiceInputAdapter：能力探测 + 系统识别 + 失败回退（原生桥接/插件）（`src/voice/`）
- [ ] T018 [P] [US2] TextPolishProvider 接口 + DeepSeekProvider + Prompt + 错误映射（`src/ai/`）
- [ ] T019 [P] [US2] SecureStore BYOK：存取/清除 Key（`src/ai/secureKey.ts`）
- [ ] T020 [US2] 心得页 UI：语音按钮/原文编辑/「AI 整理」/直接保存（`app/(tabs)/journal.tsx`）
- [ ] T021 [US2] 原文/整理对照 + 编辑/重试/保留原文/取消
- [ ] T022 [US2] 草稿自动保存（失焦/切页/中断可找回），防重复保存
- [ ] T023 [US2] 历史心得 CRUD（列表/编辑/删除确认/持久化）

**Checkpoint**: US1 + US2 均可独立工作。

## Phase 5: US3 - 主题/语言/设置 (P2)

- [ ] T024 [US3] 设置页：主题三态、语言三态、提醒间隔（30/60/90/120/关闭）、减少动画、AI Provider/Key
- [ ] T025 [US3] 切换不丢状态验证与修正（计时/草稿保留）
- [ ] T026 [US3] 系统主题/语言变化跟随（SYSTEM/FOLLOW_SYSTEM）

## Phase 6: Polish & 真机验收

- [ ] T027 [P] UI 逐页对照 HTML 原型（同尺寸）并记录差异与修复（`docs/qa/`）
- [ ] T028 [P] 密钥与权限安全扫描（无硬编码 Key、无 `EXPO_PUBLIC_*` 密钥、日志无 Key）
- [ ] T029 安卓 prebuild（`npx expo prebuild --platform android`）+ `npx expo run:android --device` 首次安装
- [ ] T030 独立 APK 构建（`assembleRelease`）与断网核心功能验证
- [ ] T031 自审代码审查落盘 `docs/review/`
- [ ] T032 真机 QA 证据 + 产品验收追踪矩阵落盘 `docs/qa/`
- [ ] T033 [P] `THIRD_PARTY_NOTICES.md` / `LICENSE-AUDIT.md` / `SECURITY-REVIEW.md`
- [ ] T034 `/speckit.converge` 收敛 + 最终 Human Gate 材料

## Dependencies & Execution Order

- Setup → Foundational（阻塞全部）→ US1 → US2 → US3 → Polish。
- US1 与 US2 可在 Foundational 后并行（若单人则按优先级串行）。
- 尽早完成 T011+T014 即拿到第一个真机可用计时器（T029 提前做）。

## Notes

- 每个关键里程碑后立即真机复测，不等到最后。
- 未实际运行的项标 `NOT_TESTED`；缺 DeepSeek Key / 语音不可用标 `BLOCKED`，不得写 PASS。
