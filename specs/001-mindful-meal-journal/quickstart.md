# Quickstart: 慢食刻 / BiteTempo

> 本文件在实现完成后用于验证 App 可运行。开发阶段先建骨架并跑通真机。

## 前置

- Node.js（本机 v24.x）、JDK 17（`JAVA_HOME`）、Android SDK（platform 34/35/36）。
- 安卓真机开启 USB 调试并连接：`adb devices -l` 应显示 `device`。

## 运行（开发版，依赖 Metro）

```bash
npm install
npx expo start --dev-client
# 另一终端：安装到真机
npx expo run:android --device
```

## 独立安装包（不依赖 Metro）

```bash
cd android && ./gradlew assembleRelease
# 产物：android/app/build/outputs/apk/release/app-release.apk
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## 最小验证路径

1. 打开 App → 「用餐」默认 10:00，选 12 分钟 → 开始 → 倒计时递减、下方一句文字；暂停冻结；继续恢复。
2. 全程无声音/振动（手机静音也无关，因为根本无音频实现）。
3. 切「心得」→ 语音/手动录入原文 → 「AI 整理」（需 Key）→ 对照 → 保存 → 历史出现。
4. 设置切 LIGHT/DARK/SYSTEM 与 zh-CN/en；重启后设置保留、计时与草稿不丢。
5. 断网打开独立 APK：用餐与本地历史可用；AI 提示需要网络。

## 已知外部依赖（可能 BLOCKED）

- DeepSeek 真 API 需用户本人填入个人 Key（BYOK）。
- 系统语音识别可用性依设备而定；不可用时走键盘语音/手动输入。
