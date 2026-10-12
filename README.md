# 慢食刻 BiteTempo

[English](./README.en.md)

> 给吃饭太快的人一个安静的计时搭档：选好时长慢慢吃完一顿饭，饭后把感受说出来，AI 只帮你去掉口水词，留下一份能随时回看的用餐记录。

<p align="center">
  <img src="./docs/screenshots/meal.png" width="190" alt="用餐页：光球与 10 分钟倒计时">
  <img src="./docs/screenshots/journal.png" width="190" alt="心得页：语音记录与历史心得">
  <img src="./docs/screenshots/settings.png" width="190" alt="设置页：外观、语言、文字提醒与 AI Key">
</p>

## 这是什么

吃饭总想快点结束、注意力又被手机带走；想记点什么又懒得打字，过几天连吃了什么都想不起来。慢食刻（BiteTempo）把这两件事做成一个安静的安卓小应用：

- **吃饭时**：选 10 / 12 / 15 / 20 分钟，光球缓缓呼吸，大字倒数，倒计时下方一句慢食提示无声轮播——**全程不响铃、不振动**。
- **吃完后**：把这顿饭的感受说一句（或直接打字），AI 只做一件事——去掉「然后就是」这类口水词，事实、否定、数字、时间原样保留，改完给你前后对照，确认了才存。

两个底部标签「用餐」「心得」，加一个顶部齿轮进设置，没有第三层菜单。

## 功能

- **光球计时**：四档时长、暂停 / 继续 / 提前结束（结束时记录实际用时，不是目标时长）；切后台或锁屏回来，按真实时间继续。
- **无声文字轮播**：倒计时下方每 60 秒换一句（可设 30 / 90 / 120 秒或关闭），暂停时跟着暂停。
- **心得记录**：语音或手输原文 →「AI 整理」→ 原文与整理稿对照 → 编辑确认或直接保存；历史可增删改，编辑中途切走草稿不丢。
- **AI 整理（BYOK）**：首版接 DeepSeek，Key 由你自己填；不给建议、不做健康判断，只去口水词。
- **主题与语言**：浅色 / 深色 / 跟随系统（默认跟随），简体中文 / English / 跟随系统；切换不丢当前计时与草稿。
- **本机存储**：用餐记录、心得、设置都存在手机本地（SQLite），无账号、无云同步。

## 数据与隐私

- 心得原文与整理稿只存本机，不上传到作者的任何服务器——本项目没有服务器。
- API Key 只保存在系统安全存储（SecureStore），不写日志、不进代码。
- 只有你点「AI 整理」时，文本才会发给你在设置里填的那个 Key 对应的 AI 服务商，界面在按钮旁写明了这一点。
- 麦克风只在你点「AI 语音记录」时使用，不做后台录音。

## 已知限制

- **部分安卓机型的系统语音识别不可用**（实测两台小米 / MIUI：系统识别成功但不把结果回传给应用）。此时应用会提示，你可以改用输入法的语音或手动打字，记录与 AI 整理不受影响。排查记录见 `docs/qa/evidence/week09/VOICE-FINDING.md`。
- 计划中不做：饮食建议、健康诊断、趋势评分、TTS 播报、提示音、社交与账号体系。
- 尚未发布到应用市场，也还没有在线网页版。

## 快速开始

需要 Node.js、JDK 17、Android SDK（构建原生时）。

```bash
npm install
npx expo start          # 开发调试（扫码或模拟器）
npx expo run:android    # 生成/安装 Development Build 到真机或模拟器
```

已发布安装包：打开 [Releases · v1.0.0](https://github.com/wanghoufan/p047-mindful-eating/releases/tag/v1.0.0)，下载 `BiteTempo-1.0.0-universal.apk`（Android 7.0+ 通用包，页面内有 SHA-256 与安装说明；仓库为私有，下载需登录你的 GitHub 账号）。

本地构建产物在：

```
android/app/build/outputs/apk/release/app-release.apk
```

代码自检：

```bash
npm run typecheck
npm run lint
```

## 技术栈

Expo SDK 57 / React Native 0.86 / TypeScript，`expo-router` 管两页与设置；`expo-sqlite` 存数据、`expo-secure-store` 存 Key、`i18next` 管中英文；原生语音识别通过一个最小 Kotlin 桥接（Android SpeechRecognizer）。计时用「单调时钟 + 挂钟校正」的状态机，不靠每秒累减，所以锁屏回来不会跑偏。

## 文档

- 产品计划（需求、验收标准）：`docs/pm/PRODUCT_PLAN_V1.0.md`
- 视觉与交互基准（HTML 原型）：`docs/design/prototype/index.html`
- 真机测试证据与缺陷记录：`docs/qa/evidence/`、`docs/qa/`
- 代码自审记录：`docs/review/`

## 状态

v1.0.0，安卓首发，**开发收尾阶段**：安装包已在 GitHub Release（`v1.0.0`）提供，未上架应用市场、无网页版。个人学习项目。
