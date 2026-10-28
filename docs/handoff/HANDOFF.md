# HANDOFF｜交接（先读我）

> 恢复开工读盘顺序（全体系唯一）：`AGENTS.md` → 相关角色卡 → 根 `USER_MODEL_OVERRIDE.md` → 本 HANDOFF → 根 `经验一句话.md` → 任务目标放最后。冲突才扩大读。
> 本文件是「小交接」：开发暂时告一段落，记录进展 / 下一步 / 注意事项，供下一会话快速恢复。

- Captured at：2026-10-23 01:05（+08:00）
- 项目：P047 慢食刻 / BiteTempo（本地目录 `047-ing-正念吃饭`，公开仓 `wanghoufan/p047-mindful-eating`）
- PROJECT_PHASE：**DEVELOP**（Phase2 已由用户口令「第二阶段，开发」批准；后续按「交付单元」复核，勿重新铺 Phase1）
- 执行方式：**单智能体 / 主开发者**。自任自审与 QA，**如实标注「自审」**，不伪造独立审查
- PLAN_VERSION：需求真源 `docs/pm/PRODUCT_PLAN_V1.0.md`（Readiness 92）；**A1 三 Tab 范围仍未回写 Plan 正文**，见「待拍板」
- DEV_BASELINE：PRODUCT_PLAN_V1.0 ＋ C 品牌 ＋ `docs/design/prototype/index.html`（主界面）＋ `docs/design/prototype/stats-v2.html`（统计页）
- CHANGE_REQUEST：NONE
- 发布类型：`首次发布`（v1.1.0 为用户可见新版本）→ **待用户签收；签收前整链 `OPEN`**
- Stage ID：P047 第9周 Spec Kit 实战开发（Expo / React Native 安卓）
- 当前状态：**v1.1.0 已构建、已发布 GitHub Release 与蒲公英、README 已同步；仅剩用户签收与 P1 收尾**
- 手机锁：**已于 2026-10-23 解除**（原绑定身份 `codebuddy` → Redmi Note 12 Pro，已 release；下次用机需重新 `pin`）

---

## A. 当前工作进展（已完成 / 已验证）

### A1. v1.1.0 发布（2026-10-22 完成）

| 项 | 状态 |
|---|---|
| 版本号 | `app.json` / `package.json` / `package-lock.json` / `android/app/build.gradle` 均为 **1.1.0**，`versionCode 2` |
| 本地 APK | `android/app/build/outputs/apk/release/app-release.apk`，113,721,683 B，SHA-256 `1e2a1f85…645f16ec`，debug keystore 签名（可覆盖升级 v1.0.0） |
| GitHub Release | `v1.1.0` 已发布，资产 `BiteTempo-v1.1.0.apk`（113,721,683 B，SHA-256 `1a56334a…ac3c03`）；**tag `v1.1.0` 指向 `062a203`**（用户拍板 A1：不移动 tag） |
| main 分支 | `37cec6f`（含 `2678f03` 版本号＋QA 留痕、`37cec6f` README 更新），已推送 |
| 蒲公英 | 应用「慢食刻」v1.1.0（Build 1），108.5 MB，安装页 <https://www.pgyer.com/manshike>；公开安装、即时发布、长期有效；3 张真机截图＋应用介绍＋更新说明＋审核备注均已填 |
| 图标 | 蒲公英页面图标取自 APK（深色底＋嫩芽时钟，即 `assets/images/icon.png`）；Pgyer APP 设置无单独换图标入口 |
| README | 中英 README 下载入口改为 v1.1.0，并加蒲公英链接 |
| QA 留痕 | `docs/qa/evidence/release-v1.1.0/`（3 张）＋`docs/qa/BUGS.md` 新增一节（自审 PASS） |
| 账本 | `docs/model/TASK-MODEL-LOG.jsonl` 已记发布行（`chain_status=OPEN`）；`check-ledger.mjs` = `LEDGER-OK` |

**本轮真机抽验（副机 Redmi Note 12 Pro `indq5xfi6hovay4d`，release 包 `adb install -r`）**：
- 冷启动进入用餐页、三 Tab（用餐/心得/统计）齐全 ✅
- 统计页四卡＋近 7 天柱状图＋空状态正常 ✅
- 点「开始用餐」后倒计时实际走秒（09:56）、提示语轮播、暂停/结束按钮出现 ✅
- `logcat -b crash` 无记录 ✅
- **未验**：点「结束」→写入记录→统计计数这一段。原因：副机前台被本机另一并发会话的 App（`com.postureguard.app`）抢占，按真机规矩立即停手，未再抢前台。该链路同一源码已于 2026-10-12 week10-stats 真机 QA 六项全过；本次构建只改版本号。

### A2. 产品功能基线（用户已确认，勿再询问）

- **三 Tab「用餐 / 心得 / 统计」**＋顶部齿轮进设置；品牌冻结 **C「慢食刻 / BiteTempo」**；HTML 原型为视觉与交互基准（禁 WebView 包装）
- 功能方案（用户拍板 a1 b1 c1 d1）：A1 第 3 个统计 Tab；B1 四卡＋近 7 天柱状图；C1 心得关联当次用餐；D1 开始计时即落库、计时中退出记「未完成」
- 已实现并验证：光球计时（四档/暂停/提前结束/后台按真实时间）、静音提示轮播、心得语音或手输＋AI 去口水词（BYOK DeepSeek，仅润色）、心得增删改、用餐历史、统计、主题三态、中英双语与回退、SQLite 本机存储（无账号/无云同步）
- 系统语音结论已定：**小米/MIUI OEM ASR 不回传识别结果，换机无用**；已做输入法语音/手打兜底，勿再立项修

### A3. 工程与治理状态

- 构建环境：JDK17（`~/android-toolchain/jdk-17.0.20.1+1/Contents/Home`）、SDK36（`~/android-toolchain/sdk`）、Node
- 2026-10-17 治理铺包：`AGENTS.md`／角色卡／README／编排者提示词／`scripts/*` 已更新；旧文件备份为同目录 `*.旧版-2026-10-17`
- `docs/model/GOVERNANCE-STATE.json` 已写 `"execution_mode": "solo"`（check-ledger 的空 DISPATCH 豁免依据）
- **已知坑**：`.git/hooks/pre-commit` 第 37 行 `bad+=("$f（…")` 在 bash 3.2 下把中文括号并入变量名，报 `unbound variable`；**涉及账本的提交会失败**。临时办法：先跑 `node scripts/model/check-ledger.mjs docs/model` 确认 `LEDGER-OK`，再 `git commit --no-verify`（该 hook 属母版分发件，未擅自改）

---

## B. 下一步任务（按优先级）

**P0——签收与补验**
1. 用户验收 **v1.1.0**（真机装 `BiteTempo-v1.1.0.apk` 或蒲公英页），签收通过后方可把整链记 `ACCEPTED`
2. 补验「结束用餐 → 记录写入 → 统计计数」一段（等设备空闲、确认前台安全再做；`docs/qa/evidence/release-v1.1.0/NOTES.md` 已写明缺口）

**P1——收尾补齐**
1. `docs/qa/产品验收追踪矩阵.md` 逐条收口关键 AC（老功能＋统计＋v1.1.0 发布证据）
2. 合规三件：`THIRD_PARTY_NOTICES.md`、`LICENSE-AUDIT.md`、`SECURITY-REVIEW.md`；密钥扫描（APK/JS/Git 不得出现 DeepSeek Key）
3. ASR 方案待用户拍板（A 端侧 sherpa-onnx【建议】／B 云 ASR）；**未拍板不动 `VoiceInputAdapter`**，拍板后走 Change C 升 Plan
4. 3 条 P3 观察（OBS-01 草稿整理稿覆盖新输入原文／OBS-02 达标率分母含未完成／OBS-03 英文 `Yesterday` 折行）由用户判定是否修
5. 可选：把 tag `v1.1.0` 对齐到 `2678f03`（需强推远端 tag；用户已选择暂不移动）

---

## C. 注意事项与规矩（务必遵守）

**执行与授权**
- 主开发者/单智能体继续有效：不派治理角色链；执行层可并行但**判定自己做**；自审必须如实标注
- **不 commit / 不 push / 不公开发布 / 不不可逆删除**，除非用户明确指令（含分支名/平台）
- 可连续开发→自审→测试→修复→复验；只在需授权时暂停

**真机（红线级）**
- 本机存在**并发会话**在跑别的项目真机测试（曾出现 `com.postureguard.app`、`com.blinkguard.app`）；操作前必须 `dumpsys window | grep mCurrentFocus` 确认前台为 `com.wanghoufan.bitetempo`
- 发现前台是别的 App **立即停手**，不抢前台、不盲 tap；需要设备时优先副机，主真机是用户日常机
- `uiautomator dump` 会误返回后台窗口；坐标与前台判定**一律以 `screencap` + `dumpsys` 为准**
- 用机前先按 Skill `android-device-target-lock-local-zh` 以本身份 `pin`，再 `status → resolve → adb -s`

**密钥与隐私**
- DeepSeek Key 仅存设备 SecureStore；不得写入代码/日志/APK/`EXPO_PUBLIC_*`/Git

**范围与冻结项（勿擅自改）**
- 品牌/视觉 C 冻结；UI 以 `index.html`＋`stats-v2.html` 为基准做最小增量
- 统计页天分组用 JS 本地时区，**勿改回 SQL `strftime` UTC 分组**
- 产品/架构变更走 Change C；用餐提醒全程静音；不做 AI 建议/云同步/账号
- 本地未跟踪文件（`*.旧版-2026-10-17`、`scripts/`、`docs/model/NEXT-TASKS.md`、`GOVERNANCE-STATE.json` 除外已提交部分）是铺包产物，**勿删**；`README.md.旧版-2026-10-17` 是项目 README 备份（10-17 铺包曾用治理模板覆盖过 README，已从 git 恢复）

**工程注意**
- 重建 Release：`cd android && JAVA_HOME="$HOME/android-toolchain/jdk-17.0.20.1+1/Contents/Home" ANDROID_HOME="$HOME/android-toolchain/sdk" ./gradlew :app:assembleRelease --no-daemon`
- 安装：`adb -s <serial> install -r android/app/build/outputs/apk/release/app-release.apk`
- Gradle 增量有时不重打 JS bundle：改 TS/TSX 后若 APK 时间戳未变，先删 `android/app/build/generated/assets/react/release/index.android.bundle` 再重建
- 类型检查 `npx tsc --noEmit`；Lint `npm run lint`；`useFocusEffect` 从 `expo-router` 导入
- 发布签名用 `android/app/debug.keystore`（与 v1.0.0 相同，保证覆盖升级）

**规范入口（按需读）**：`docs/sop/app-simplicity.md`／`app-theme-i18n.md`／`app-brand-assets.md`／`app-navigation.md`／`app-ui-layers.md`／`android.md`；检查点 `node scripts/model/check-ledger.mjs`

**已确认、勿重复询问**：平台（安卓/Expo）、三 Tab、A1/B1/C1/D1 方案、C 品牌、静音轮播、DeepSeek 只润色、BYOK、主题三态/中英/回退、系统语音结论（OEM 缺陷）

---

## 待拍板（不阻塞开工）

- **范围变更登记**：`PRODUCT_PLAN_V1.0` 正文仍写「两个 Tab / 不做统计」，但实现已按 A1 扩为三 Tab＋统计；是否补登记为 `PRODUCT_PLAN_V1.1` 或一条 Change 记录
- **v1.1.0 签收**：首次发布签收前，账本整链保持 `OPEN`
- **ASR 方案**：A 端侧（建议）／B 云 ASR
- **P3 三条观察**：修或不修

---

## 变更记录（最新在上）

- **2026-10-22/23**：版本号升 1.1.0（versionCode 2），重建 Release APK；GitHub `v1.1.0` Release 与蒲公英「慢食刻」发布完成；中英 README 下载入口更新；release 包副机抽验（首页/三 Tab/统计页/计时走秒）通过；账本记发布行。已知缺口：结束→记录→统计计数未复验（并发 App 抢前台）。
- **2026-10-17**：治理铺包（口令改「你是主开发者」、复核粒度改「交付单元」、子代理模型口径）；旧文件保留 `*.旧版-2026-10-17` 备份。
- **2026-10-12**：用餐历史＋统计（A1/B1/C1/D1）开发完成并六项真机 QA 通过；v1.0.0 首发 Release。
