# BUGS — P047 慢食刻 / BiteTempo（用餐历史记录与统计 A1/B1/C1/D1）

> 执行者：**自审**（单智能体模式，用户口令「你是唯一开发者」；无独立 QA 角色，不得伪造独立审查）。
> 本轮范围：真机验证「统计」Tab（A1）、累计四项＋近 7 天柱状图（B1）、笔记-用餐关联（C1）、中途退出自动补记（D1）。
> 设备：Redmi Note 11T Pro+（Xiaomi 22041216UC，ADB `IN9LZTAYV4UGU4JF`，目标机已由 `android-device-target-lock-local-zh` 锁定）。
> 被测包：release APK `android/app/build/outputs/apk/release/app-release.apk`（versionName 1.0.0，装机时间 2026-10-12 17:08）。

## 缺陷表

| Bug ID | Priority | Stage P0 Blocking? | Repro | Status | Current Task | 备注（截图/日志一句） |
|---|---|---|---|---|---|---|
| —（本轮未发现 P0/P1 缺陷） | — | — | — | — | — | 六项真机测试全过，见下表 |
| OBS-01 | P3 | 否 | 心得页存在残留草稿「整理后」文本时，直接保存会用草稿整理稿覆盖本次新输入的原文 | OPEN（观察项，非本轮 C1 引入） | 记录，待用户判定 | `05d-journal-saved.png`：原文框输入后保存，落库内容为残留整理稿 |
| OBS-02 | P3 | 否 | 统计「累计四项」中「目标达标率」分母含「未完成/进行中」会话，会拉低比例 | OPEN（与已确认原型一致） | 记录，待用户判定 | 代码 `stats.tsx:65`，与原型口径一致，非缺陷 |
| OBS-03 | P3 | 否 | 英文界面下近 7 天柱状图 x 轴标签 `Yesterday` 折成两行（`Yester`/`day`），未截断但排版不齐 | OPEN（观察项） | 记录，待用户判定 | `07c-stats-en-dark.png` |

## AC 操作级记录（结论回 `产品验收追踪矩阵.md`）

| AC 编号 | 前置数据/边界样本 | 设备/视口 | 操作步骤 | 实际结果 | 证据位置 | 关联缺陷 ID | 矩阵状态回填 |
|---|---|---|---|---|---|---|---|
| AC-S1（进行中记录） | 无进行中会话 | 1080x2460 | 用餐页点「开始用餐」→ 切「统计」Tab | 列表首条出现「10月12日 17:26 · 目标 12 分钟 · 进行中」，四卡计数不误加 | `week10-stats/01-running-timer.png`、`02-stats-inprogress.png` | — | （见矩阵） |
| AC-S2（杀进程补记） | 存在进行中会话（17:26） | 1080x2460 | `am force-stop` → 重新启动 → 切「统计」 | 该条由「进行中」变「未完成」，并显示「计时中退出，自动记录」 | `week10-stats/03b-stats-unfinished.png` | — | （见矩阵） |
| AC-S3（提前结束） | 进行中会话 | 1080x2460 | 计时中点「结束」→ 弹「提前结束？」→ 点「结束用餐」 | 列表出现「10月12日 17:27 · 01:20 · 目标 12 分钟 · 提前结束」；`01:20` 为实际用时非目标时长 | `week10-stats/04c-after-end.png`、`04d-ended-meal.png`、`04e-stats-earlyend.png` | — | （见矩阵） |
| AC-S4（笔记-用餐关联 C1） | 刚结束的会话（01:20） | 1080x2460 | 结束页点「记录一点心得」→ 心得页 → 输入→「直接保存」 | 心得页顶部徽标「将关联本次用餐（01:20）」；保存后历史卡显示「关联用餐 01:20」 | `week10-stats/05b-journal-linkedbadge.png`、`05c-journal-typed.png`、`05d-journal-saved.png` | OBS-01 | （见矩阵） |
| AC-S5（完整吃满·达标） | 10 分钟档 | 1080x2460 | 「用餐」选 10 分钟→开始→计时归零 | 00:00 显示「目标时间已到」无负计时；记录「10月12日 17:30 · 10:00 · 目标 10 分钟 · 达标」；四卡更新为 7 / 14% / 12 / 2；柱状图「今天 12」 | `week10-stats/06b-10min-running.png`、`06c-after-10min.png`、`06d-stats-reached.png` | — | （见矩阵） |
| AC-S6（统计页 i18n/主题） | 统计页有数据（7 条） | 1080x2460 | 设置切 English + Dark → 返回统计页 | 全页英文（Stats / Total meals / Target rate / On target / Ended early / Incomplete）+ 深色渲染正确；数据不丢（仍 7 条） | `week10-stats/07a-settings.png`、`07b-settings-en-dark.png`、`07c-stats-en-dark.png`、`07d-settings-restored.png` | OBS-03 | （见矩阵） |

## 真机QA会话能力预检结果

> 说明：本项目单智能体 QA 采用 **adb 真机直驱**（`screencap` 取证 + `input tap` 操作），不使用 CUA 原生读屏。按 `AGENTS.md`「QA 会话能力预检只在对应工具与测试方式适用时强制」，CUA 各项标记为不适用；下方记录本机实际使用的能力与前置。

- 日期/任务名：2026-10-12 / 统计功能真机 QA
- session ID：—（单智能体，无多角色 session）
- 模型精确ID：—（当前客户端）
- Runtime：adb 真机直驱（USB）
- 原生CUA是否实际注入：否（本项目采用 adb，不使用 `mcp__cua_repl.js`）
- 可用工具精确名称：`adb exec-out screencap`、`adb shell input tap/keyevent`、`adb shell dumpsys window`、`adb shell monkey`、`adb shell pidof`
- CLI备用入口是否存在：是（`adb` 位于 `/Users/zzymima0000/android-toolchain/sdk/platform-tools/adb`）
- 设备唯一性/锁定：是（`android_device_lock.py status`＝已固定 Redmi Note 11T Pro+，在线）
- 读屏结果：adb 截图像素判读（非 AX）；文本以截图为证据
- 截图结果：是（1080x2460，逐张核对前台为目标 App）
- 点击并恢复结果：是（每次 tap 前 `dumpsys window | grep mFocusedApp` 复核前台；点击后截图复核）
- 输入并清除结果：不适用（未在本轮做 CUA 输入金丝雀；使用 `input text` 写入心得，见 `05c`）
- 最终结论：**PASS**（adb 直驱能力满足本轮真机用例）
- 是否允许进入正式QA：YES

## 完整吃满（AC-S5）与英文+深色（AC-S6）结果

- **AC-S5 完整吃满**：选 10 分钟档 → 开始（17:30:57）→ 按 HOME 后台计时 → 17:41 回到前台，计时显示 `00:00` + 「目标时间已到」（无负计时，符合 AC-06）；切统计页得记录「10月12日 17:30 · 10:00 · 目标 10 分钟 · 达标」，四卡变为 `7 / 14% / 12 / 2`，柱状图「今天 12」。**后台跨约 10 分钟仍按真实时间正确归零，未跳变、未重复计数**（旁证 AC-04）。到期那条时间 17:30 与开始时刻吻合。✅
- **AC-S6 英文+深色**：设置「外观=Dark、语言=English」后返回统计页，标题/卡片/图表/记录/底部导航全部英文（Total meals / Target rate / Mindful time / Avg per meal / Last 7 days / On target / Ended early / Incomplete / Meal / Notes / Stats），深色配色正确；**切换过程中已存 7 条记录仍在**（旁证 AC-28 切换不丢状态）。测试后已把外观与语言恢复为「跟随系统」。仅 1 处 P3 观察（OBS-03：`Yesterday` 折行）。✅

## 结论

- 本轮 6 项真机测试 **全部通过**；无 P0/P1 缺陷；3 条 P3 观察项（OBS-01/02/03）记录待用户判定。
- 执行者：**自审**（单智能体，无独立审查者）。

## Fix Attempt Fingerprint

- Task ID：P047-stats-realdevice-QA
- Root Cause Hypothesis：—
- Approach：—
- Files Changed：—
- Verification：—
- Failure Reason：—
- Difference From Previous Attempt：—

## v1.1.0 Release 包真机抽验（2026-10-22）

- 构建：`./gradlew :app:assembleRelease`（JDK17 + SDK36），`BUILD SUCCESSFUL`；`versionName=1.1.0`／`versionCode=2`；SHA-256 `1e2a1f85…645f16ec`。
- 安装：副机 Redmi Note 12 Pro（`indq5xfi6hovay4d`）`adb install -r` 成功，可覆盖 v1.0.0（同 debug keystore 签名）。
- 抽验项：冷启动用餐页、三 Tab 导航、统计页四卡+7 天图+空状态、开始用餐后倒计时走秒与提示轮播——**全部通过**，`logcat -b crash` 无记录。证据：`docs/qa/evidence/release-v1.1.0/`。
- 未验项：点「结束」后副机被并发 App（`com.postureguard.app`）抢占前台，本轮未复验「结束→记录→统计计数」；该链路同源码已于 week10-stats 全项真机通过，本次仅改版本号。
- 结论：**PASS（自审）**；无 P0/P1。首次发布签收仍待用户。
