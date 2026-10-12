# C｜慢食刻 / BiteTempo｜Android 图标工程说明

- 完整图标：`icon-1024.png`（1024×1024）与 `icon.svg`。
- 自适应图标前景：`adaptive-foreground-1024.png`（透明 1024×1024）与 `adaptive-foreground.svg`，主体收进安全区；Android mask 实际按各设备裁剪，需要真机截图核查。
- 建议自适应背景色：`#0B2225`。
- 启动画面概念：`splash-1080x1920.png` 与 `splash.svg`，仅作品牌预览；正式 Expo splash 须走 `expo-splash-screen` 的配置插件和原生构建，不能把任意 1080×1920 图片当系统 Splash 规则。
- 状态：**用户于 2026-10-11 已确认 C「慢食刻 / BiteTempo」品牌视觉与图标方案（Design / Brand Freeze）**。正式安卓设备裁剪与启动屏仍须 Builder 实测；品牌确认不等于允许绕过 ORCA 开发许可，也不代表应用商店 / 商标审查已完成。
