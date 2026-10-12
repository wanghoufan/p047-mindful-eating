# P047 品牌定稿：慢食刻 / BiteTempo

状态：**用户已选择 C 方向；Design Freeze C**（2026-10-11）。这仅确认产品命名及设计，不构成 ORCA 正式开发阶段授权，也不代表应用商店商标审核已完成。

- 中文名：**慢食刻**
- 英文名：**BiteTempo**
- 视觉风格：C 极简科技；深灰 / 墨绿 / 薄荷绿，几何节奏环和醒目计时数字；LIGHT、DARK、SYSTEM 是同一视觉基准的适配，不另起设计方向。
- 项目代号：P047 正念吃饭；本地目录和既有私有 GitHub 仓库保持不变。
- 安卓图标：`prototype/branding/C/icon-1024.png`、`icon-512.png`、`icon.svg`。
- Adaptive icon：`prototype/branding/C/adaptive-foreground-1024.png`（透明前景）、`adaptive-foreground.svg`；Builder 根据 Android 官方安全区域做 mask 真机验证。
- 启动画面：`prototype/branding/C/splash-1080x1920.png`、`splash.svg`，作为视觉参照；实际 Expo splash 按系统约束设置背景和 Logo，不是直接把 1080×1920 全图强塞进启动动画。
- 官方唯一 HTML 视觉及交互基准：`prototype/index.html`（固定 C，不支持 A/B 切换）。
- 官方品牌预览：`prototype/branding/index.html`，只展示已获选的 C 方案。

## 不可擅自变更

1. 不准 Builder 在 A/B/C 之间二次投票，也不能擅自选择 A 图标、B 颜色或其它英文名称。
2. 原型中所有状态（HOME/ACTIVE/PAUSED/COMPLETE/JOURNAL/SETTINGS）以 C 为唯一比较基线；主要界面与内容按照对应 HTML 真机对照，不把 HTML 封成 WebView 冒充正式 App。
3. 中文和英文显示名称统一采用以上名称，不保留旧候选的用户可见资产。
4. 若日后需要换名字或品牌视觉，按 ORCA 已有 Change C / Human Gate 执行，不自行放宽。

**提醒语最终用户裁决：** 用餐页倒计时下方纯文字自动轮播；无下一句按钮、无声音/音乐/TTS/提示音/振动；暂停同步暂停轮播；达标也不出声。

## 商标边界

中文/英文名为用户批准的工作品牌；已做的初步文字搜索不等于商标、近似名称或全球应用商店独占性确认。公开上架前须另行核验。
