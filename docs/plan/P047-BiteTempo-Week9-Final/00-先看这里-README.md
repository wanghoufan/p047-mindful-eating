# P047 正念吃饭：第 9 周 Spec Kit 实战开发交接包

**版本**：V1.3 | **制作时间**：2026-10-11 | **状态**：完整开发输入包，**不是已执行 Spec Kit 的结果，也不是已完成 APP**。

## 你先做什么

1. **先双击 `prototype/branding/index.html` 查看**已经批准的 C「慢食刻 / BiteTempo」图标和启动页**；再双击 `prototype/index.html`，在电脑上打开、点击体验两个 Tab 的流程。桌面和手机都只显示**已经冻结的 C 方向**；移动端是单屏视图。
2. 读 `01-产品需求与验收/产品需求基线.md` 与 `01-产品需求与验收/交互规范与HTML基线.md`。需求范围已经明确；**视觉与品牌已由用户选定 C（慢食刻 / BiteTempo）**，Builder 不得重新选 A/B。
3. 打开 `05-交接/发给桌面智能体-提示词.md`，复制整份提示词给在 P047 项目目录运行的桌面智能体。
4. 智能体在真实项目里按照 Spec Kit 的命令生成 `.specify/` 和 `specs/001-mindful-meal-journal/`，不得把本包草案复制进去冒称执行过命令。
5. 设计已确认；由 ORCA 原有开发许可放行后，进入开发、安卓 Development Build、真机实测、收集至少 3 张**真实安卓运行截图**，最后完成作业提交。

## 当前项目真源（只读检查结果）

- Mac mini：`/Users/zzymima0000/Developer/coding/1.Active/047-ing-正念吃饭`
- 既有 GitHub 私有仓库：`wanghoufan/p047-mindful-eating`。不要重新创建、不要默认 push。
- 已有 `.project.yaml`，`AGENTS.md`、ORCA 文档、`docs/pm/` 模板及 `docs/review` / `docs/qa` 等治理结构；**不得覆盖或重建治理模板**。
- 最近一次只读检查显示 README 仍是“项目说明待补充”；没有发现 Spec Kit 已初始化的证据。这是检查时点信息，执行者必须重新检查真实仓库状态与分支。

## 内容索引

| 目录 | 作用 | 注意 |
|---|---|---|
| `01-产品需求与验收/` | 已确定的目标、两 Tab、用户流、FR 和 AC 候选 | SPEC 的需求输入，不是 Spec Kit 实际输出 |
| `02-Spec-Kit执行/` | 课程第九周对照、实际执行顺序、任务候选 | 命令必须在真实开发环境执行 |
| `03-技术方案/` | Expo + 原生系统语音识别 + AI Provider + DeepSeek + 本地存储 + 版权 | 方案输入，版本兼容性由 Builder 安装时验证 |
| `04-真机验收/` | 测试用例、失败回退、作业截图交付模板 | 只有真机证据才能填 PASS |
| `05-交接/` | 开发窗口的单块指令 | 先读 P047 AGENTS.md |
| `prototype/` | **冻结的 C 方向可操作 HTML 原型、中英双名、1024px PNG + SVG、Android adaptive icon 和 splash 资产、浏览器原型截图** | HTML 不调用 DeepSeek/系统语音识别，截图不是安卓 APP 运行截图 |
| `课程原文/` | 用户提供的第九周原课程资料精选，含作业/速查 | 原资料；非本包原创 |

## 功能总纲（最终用户裁决）

**用餐**：发光光球、计时 10 / 12 / 15 / 20 分钟、文字温和提醒、暂停恢复、提前结束。吃饱可停，进食时不强制配合呼吸、不憋气。

**心得**：点击“AI 语音记录” → 调用**手机系统语音识别（不是第三方 ASR API）** → 得到用户原话 → DeepSeek **只清理口水词、语序、标点** → 用户预览修改并保存 → 历史心得。可用系统键盘语音与文字输入兜底。AI 不分析、不评价、不添加饮食建议。

**技术与发布**：安卓首发，Expo / React Native；AI Provider 统一抽象、DeepSeek 首个可选项；单人个人测试 Key 由用户在 APP 中提供，通过 `expo-secure-store` 安全存储，**禁止把自己的 Key 预置 APK 或 EXPO_PUBLIC_***；公开分发前切换到有鉴权、配额、防滥用的服务端代理。

**ORCA 默认**：保留深色 / 浅色 / 跟随系统、中文 / 英文 / 跟随系统、本地设置持久化、用户批准的品牌素材和导航契约。任何 APP 基线例外须由用户明确批准、记录在 Product Plan 中。主导航只有“用餐 / 心得”两个 Tab，设置为页面内入口，不新增低频 Tab。

## 关于 HTML 的重要承诺

`prototype/index.html` 是真正可交互的单文件 HTML，能操作计时、暂停/恢复、提前结束确认、倒计时下方静音自动文字轮播（无下一句按钮）、原始/示例润色对照、保存/编辑/删除心得、双 Tab、主题/语言与冻结的 C 方向。它用于**冻结界面/交互目标**，不是 Android 成品：HTML 的“语音记录”按钮提示使用系统输入法麦克风，真实原生识别由 APP 负责；“AI 整理预览”仅展示**预设样例文本**，不会伪装已请求 DeepSeek。

## 用户必须批准与执行者自主处理的分界

- **功能需求**：本轮已由用户确认，不再反复问。
- **视觉/品牌方向**：用户已明确批准 C「慢食刻 / BiteTempo」，本包仅此一套。不得再次要求选择风格；ORCA 开发阶段放行仍需遵守。
- **ORCA 开发 Human Gate**：照 P047 当前生效规范执行，不由此压缩包替代批准。
- **技术细节、依赖版本、文件路径**：执行者查官方文档后自行确定并同步 Spec Kit 计划，不因小事频繁询问。
- **凭证**：用户在自己设备或受控测试环境内输入，不要求发给智能体。

## 主要官方技术资料

- GitHub Spec Kit：https://github.com/github/spec-kit
- Existing Projects：https://github.com/github/spec-kit/blob/main/docs/guides/existing-projects.md
- Expo：https://docs.expo.dev/
- Android SpeechRecognizer：https://developer.android.com/reference/android/speech/SpeechRecognizer
- Android RecognizerIntent：https://developer.android.com/reference/android/speech/RecognizerIntent
- Expo SecureStore：https://docs.expo.dev/versions/latest/sdk/securestore/
- DeepSeek 官方 API：https://api-docs.deepseek.com/


## V1.3 定稿：唯一 C 品牌、自动无声提醒

- **中文正式工作名：慢食刻；英文名：BiteTempo；视觉正式 C 方案**。A/B 资源已从本正式开发包移除。
- 安卓图标与 adaptive 前景、启动页 PNG/SVG 均在 `prototype/branding/C/`。图标和启动页仍需要 Expo/Android 真机适配验收。
- 用餐页的短句直接显示在**倒计时下方**，默认每 60 秒**自动**换下一句；设置可改 30/90/120 秒或关闭。**没有下一句按钮，也不播放提醒声音、背景音、TTS 或振动**。暂停倒计时，文字轮播也暂停。
- `prototype/index.html` 是唯一 C 方向的可交互 HTML 对照。**浏览器原型已具备倒计时/自动轮播等前端行为，不代表 Android/DeepSeek/语音已测试**。
- 源课程讲的音频混音、语音朗读是教学案例，不属于 P047 V1 范围；心得中的系统语音识别只负责采集用户口述，不是播放提醒。
