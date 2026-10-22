# v1.1.0 Release 包真机验证证据

- 日期：2026-10-22
- 设备：Redmi Note 12 Pro（`22101316C`，ADB `indq5xfi6hovay4d`，副机；主真机为用户日常机未动）
- 安装包：`android/app/build/outputs/apk/release/app-release.apk`
- 版本：`versionName=1.1.0`、`versionCode=2`（`aapt2 dump badging` 实读）
- SHA-256：`1e2a1f854ba3ee06f3643d11e1c01b83c67b22c367ef175988167fd0645f16ec`
- 安装方式：`adb install -r`（与 v1.0.0 同为 debug keystore 签名，可覆盖升级）

## 已验项（截图）

| 证据 | 验证内容 |
|---|---|
| `01-home.png` | 冷启动进入用餐页；三 Tab（用餐/心得/统计）齐全；光球、10 分钟档、开始按钮正常 |
| `02-stats.png` | 统计页：四项累计卡片、最近 7 天柱状图、空状态文案与三 Tab 底部导航正常 |
| `03-timer-running.png` | 点「开始用餐」后倒计时实际走秒（09:56）、提示语轮播、暂停/结束按钮出现 |

## 已知限制

- 点「结束」后副机前台被另一并发 App（`com.postureguard.app`，本机其他会话在做真机测试）抢占，**「结束→写入记录→统计计数」这一段未在本轮复验**；该链路的同一源码已于 2026-10-12 在 week10-stats 真机 QA 全项通过，本次构建仅改版本号（`app.json`／`package.json`／`build.gradle`），未改业务代码。
- 测试期间 `adb logcat -b crash` 为空，无崩溃记录。
- 不再抢前台复测，避免干扰其他会话在跑的真机任务。
