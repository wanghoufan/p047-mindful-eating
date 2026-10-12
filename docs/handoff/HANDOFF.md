# HANDOFF｜交接（先读我）

> 恢复开工读盘顺序（全体系唯一）：`AGENTS.md` → 相关角色卡 → 根 `USER_MODEL_OVERRIDE.md` → 本 HANDOFF → 根 `经验一句话.md` → 任务目标放最后。冲突才扩大读。
> 本文件是「小交接」：开发暂时告一段落，记录进展 / 下一步 / 注意事项，供下一会话快速恢复。

- Captured at：2026-10-12 12:50（+08:00）
- 项目：P047 慢食刻 / BiteTempo（本地目录 `047-ing-正念吃饭`，私有仓 `wanghoufan/p047-mindful-eating`）
- PROJECT_PHASE：**DEVELOP**（Phase2 已由用户口令「第二阶段，开发」正式批准）
- 执行方式：**单智能体**（用户口令「你是唯一开发者」）。同一智能体自任自审/QA，**如实标注「自审」，不得伪造独立审查**；不自动派其他智能体。
- PLAN_VERSION：以 `docs/pm/PRODUCT_PLAN_V1.0.md` 为需求真源（Readiness 92；已过 Readiness+原型门，PLAN_GATE=READY_FOR_HUMAN_REVIEW）
- DEV_BASELINE：PRODUCT_PLAN_V1.0（＋ 用户确认的 C 品牌、HTML 原型基线）
- CHANGE_REQUEST：NONE
- 发布类型：**首次发布** → 收尾**必须用户签收**，签收前状态记 `OPEN`
- Stage ID：P047 第9周 Spec Kit 实战开发（Expo/React Native 安卓首发）

---

## A. 当前工作进展（已完成 / 已验证）

**产品基线**（用户已确认，勿再询问）：两 Tab「用餐 / 心得」＋顶部设置；品牌冻结 **C「慢食刻 / BiteTempo」**；HTML 原型 `docs/design/prototype/index.html` 为视觉与交互唯一基准（禁 WebView 包装）。

**技术栈**：Expo SDK 57 / React Native 0.86 / TypeScript / expo-router；expo-sqlite、expo-secure-store、expo-localization、i18next。

**已实现并真机跑通**（包名 `com.wanghoufan.bitetempo`）：
1. 双 Tab 底部导航（固定不随内容滚动）＋顶部齿轮进设置。
2. 用餐页：C 光球动画、10/12/15/20 分钟、倒数、暂停/继续/提前结束确认；**倒计时下方单句无声文字自动轮播**（默认 60s，可 30/90/120/关闭；暂停同暂停；无下一句按钮/无声音/无振动）。
3. 计时状态机：挂钟增量＋单调校正，后台/锁屏返回按实际时间恢复（`src/state/useMealTimer.ts`）。
4. 心得页：语音入口、原文编辑、AI 整理、原文/整理对照、直接保存、历史增删改（删除确认）、草稿自动保存（`src/app/(tabs)/journal.tsx`、`src/storage/db.ts`）。
5. 设置：主题三态 `LIGHT/DARK/SYSTEM`（默认 SYSTEM）、语言 `FOLLOW_SYSTEM/zh-CN/en`（默认跟随、不支持回退 zh-CN）、提醒间隔与开关、减弱动画、DeepSeek API Key（SecureStore）。
6. **AI 文本整理（DeepSeek 真接口）已用用户 Key 验证通过**：去口水词、保留事实/否定/数字/时间、拒绝越权建议（黄金样例 4/4）。Provider 抽象：`src/ai/`（接口 `TextPolishProvider` + `deepseek.ts` + `prompt.ts` + `secureKey.ts`）。
7. 本地存储：`expo-sqlite`（会话/心得/设置/草稿）＋ `expo-secure-store`（仅 Key）。

**Spec Kit 已真实执行**（opencode 集成）：`.specify/`（constitution 已写 v1.0.0）、`specs/001-mindful-meal-journal/`（`spec.md`/`plan.md`/`research.md`/`data-model.md`/`quickstart.md`/`tasks.md`/`analysis.md`/`checklists/`）。命令与产物为本机实跑生成（`specify init --here --integration opencode`）。

**真机交付物**：Release APK（用 debug 签名可独立安装）已构建并安装到真机：
`android/app/build/outputs/apk/release/app-release.apk`

**QA 证据**：`docs/qa/evidence/week09/`（启动/计时/暂停/结束确认/心得/设置/语音排查等截图）＋ `docs/qa/evidence/week09/VOICE-FINDING.md`。

**2026-10-12 阶段收尾（本轮新增）**
1. **语音判定已完成（自审）**：第二台机（Redmi Note 12 Pro / 22101316C / ruby / Android 14 / MIUI V816，ADB `indq5xfi6hovay4d`）复测两条路径（App 内语音＋系统识别界面），结论＝**换机不能解决，属小米 OEM ASR 平台缺陷**（内部识别成功但不回传第三方 App；系统界面直接报错）。证据 `docs/qa/evidence/week10/`（截图＋两份 logcat），`VOICE-FINDING.md` 已加「第二台机复测」章节。对照测试中 force-stop 过 NekoBox（`moe.nb4a`），**其 VPN 隧道未自动恢复，请用户在 App 内手动重连一次**。
2. **ASR 方案待拍板**：已提 A（端侧离线 sherpa-onnx，【建议】）／B（云 ASR，需用户提供 Key）；用户 2026-10-12 表示「后续再说」，**尚未拍板**，故未动 `VoiceInputAdapter`。
3. **文档与发布**：中英 README 重写并推送（`afafc9b`，含真机截图 `docs/screenshots/`＋快速开始）；GitHub About 三格已写（简介 74 字＋8 topics，无网站故 Website 留空）；**v1.0.0 GitHub Release 已发**（`a979d7a` 时点的代码；资产 `BiteTempo-1.0.0-universal.apk` 113,709,595 字节，SHA-256 `ffc32161…88aef1`，debug 签名＝用户 B1 拍板，下载地址实测 200）。
4. **作品展示层未上墙**：主页 README（现 30 件）与个人网站作品区都**没有**本项目条目——仓库为 PRIVATE，按「访客点得开」铁律不上墙；**待用户决定是否转公开**（转公开后需补主页行＋网站条目＋封面）。
5. **残留清理（自决）**：删 `temp/`（明文 DeepSeek Key 填写单＋metro.log）、`README 2.md`（模板导航副本）、临时目录里的 `p047-expo/` 与 `asr.wav`；Key 已在两台真机 SecureStore 内，不影响继续开发。

**真机环境**：Xiaomi 22041216UC（xagapro/MIUI），ADB id `IN9LZTAYV4UGU4JF`；JDK17、Android SDK(platform 34-36)；Expo Metro 端口 8081 被 Docker 占用（如需 dev 联调改用其它端口 + `adb reverse`）。

---

## B. 下一步任务（按优先级）

**P0（待用户拍板）——第三方 ASR 接不接、接哪种**
- 判定已完成（见 A 节第 1 条）：系统语音在两台小米机上都不可用，**换机路线已排除**；键盘语音/手动输入兜底可用（已实测）。
- 已向用户提出两选一（**尚未答复，用户说「后续再说」**）：
  1. **A｜端侧离线**（sherpa-onnx / react-native-sherpa-onnx + 中文模型）：免费无 Key、音频不出设备、断网可用；APK 约增 30–80MB，集成量最大。
  2. **B｜云 ASR**（讯飞/百度/火山/Whisper 兼容）：接入快、识别率高；需用户提供 Key（按量付费）、音频上传第三方、断网不可用。
- 拍板后走 **Change C**：`PRODUCT_PLAN_V1.0` 升 V1.1（解除 Out-of-Scope 的「第三方 ASR」约束）＋ 新 DEV_BASELINE ＋ 自审留痕，再按所选方案在 `VoiceInputAdapter` 接口下替换实现（改动局部）。未拍板前不改 ASR 相关代码。

**P1（收尾必须补齐，未做）**
- `docs/review/` 写**自审代码审查**（照 `CODE_REVIEW.template.md`，标注「自审」）。
- `docs/qa/产品验收追踪矩阵.md`（照模板）逐条收口关键 AC，证据指向 `docs/qa/evidence/week09/`。
- `docs/qa/BUGS*.md` 记录已知问题（语音平台限制、UI 与原型差异等）。
- 安全/合规三件：`THIRD_PARTY_NOTICES.md`、`LICENSE-AUDIT.md`、`SECURITY-REVIEW.md`（照 `docs/plan/P047-BiteTempo-Week9-Final/03-技术方案/开源版权与合规检查.md`）。
- 密钥扫描：确认 APK/JS bundle/Git/日志无 DeepSeek Key、未用 `EXPO_PUBLIC_*` 承载密钥。
- `/speckit.converge` 收敛（对照 `specs/001-.../spec.md` 补缺口）。

**P1（产品功能待完善 / 未测）**
- UI 与 HTML 原型**逐页同尺寸对照**并修差异（`docs/sop/app-navigation.md` 要求；光球立体感、间距、字号等）。
- 主题/语言/系统跟随的真机截图证据；英文长文案与安全区适配。
- 计时后台/锁屏恢复、达标 00:00、提前结束写入实际秒数的真机证据（部分已截，需补全并入矩阵）。
- 独立 APK **断网**核心功能验证（计时/历史离线可用，AI 才提示需网络）。
- 作业提交材料：`docs/plan/P047-BiteTempo-Week9-Final/04-真机验收/第9周作业提交模板.md` 填真实结果 ＋ **≥3 张真实安卓运行截图**（注意：`prototype/screenshots/` 是 HTML 截图，不能冒交）。

**最终 Human Gate（首次发布，需用户签收）**：全部 Task 完成、测试通过、无阻塞缺陷后，集中汇报（完成情况 / APK 路径 / 手机预览方式 / 测试证据 / 作业材料 / 需用户决定项）。

---

## C. 注意事项与规矩（务必遵守）

**执行与授权**
- **单智能体**：不派其他智能体；自审/QA 由本智能体执行并**如实标注「自审」**。
- **不 commit / 不 push / 不公开发布 / 不不可逆删除**，除非用户明确下达指令（含分支名）。
- 开发已获授权，可连续开发→自审→测试→修复→复验；只在**需授权**（secrets、不可逆删除、生产/他人项目、commit/push）时暂停。

**密钥与隐私（红线）**
- DeepSeek Key 为 BYOK：**仅在设备 SecureStore**；**不得**写入代码/日志/APK/`EXPO_PUBLIC_*`/Git。
- ⚠️ 本机 `temp/DeepSeek-API-Key-填写.md` 内有用户明文 Key（**已加 .gitignore 的 `temp/`，勿提交**）；如不再需要测试，**建议删除该文件**（密钥仍在设备里）。
- 语音：麦克风仅用户主动触发；不后台录音；不接第三方 ASR（除非用户授权）。

**范围与冻结项（勿擅自改）**
- 品牌/视觉：C「慢食刻 / BiteTempo」已冻结；**不得重选 A/B、不得改色/名/图标**；UI 只做最小增量对照修复。
- 若需改产品/架构（如接入第三方 ASR），按 ORCA **Change C 受控重开**（受控重开＋用户批准＋新 Plan 版本）。
- 用餐提醒**全程静音**；不做 AI 饮食建议/健康诊断/云同步/账号。

**工程注意**
- 重建 Release：`cd android && JAVA_HOME=<jdk17> ./gradlew :app:assembleRelease --no-daemon`；安装：`adb install -r android/app/build/outputs/apk/release/app-release.apk`。
- **本机磁盘曾几乎写满**（Gradle 构建需数 GB）；如遇 `No space left on device`，清理可再生缓存（勿删用户数据）。
- **Gradle 增量有时不重打 JS bundle**：改了 TS/TSX 后若 APK 时间戳未更新，先删 `modules/my-module/android/build` 或 `android/app/build/generated/assets/react/release/index.android.bundle` 再重建。
- 本地 Expo Module 走 `package.json` → `expo.autolinking.nativeModulesDir: "./modules"`；改了原生代码必须**重新 prebuild/编译**（Fast Refresh 不生效）。真机包为 Release（**不依赖 Metro**），验证方便。
- 类型检查：`npx tsc --noEmit`；Lint：`npm run lint`。

**规范入口（按需读，别全量加载）**
- 产品/简化：`docs/sop/app-simplicity.md`；主题/多语言：`docs/sop/app-theme-i18n.md`；品牌：`docs/sop/app-brand-assets.md`；导航：`docs/sop/app-navigation.md`；信息分层：`docs/sop/app-ui-layers.md`；安卓：`docs/sop/android.md`。
- 本机检查点：`node scripts/model/check-ledger.mjs`（应 `LEDGER-OK`）。
- 用户交付输入包（只读参照）：`docs/plan/P047-BiteTempo-Week9-Final/`（含需求基线、交互规范、技术方案、QA、作业模板、HTML 原型、课程原文）。

**已确认、勿重复询问**：平台（安卓/Expo）、两 Tab、系统语音（非第三方，除非用户改主意）、静音文字轮播、DeepSeek 只润色、BYOK、主题三态/中英/跟随/回退、C 品牌。
