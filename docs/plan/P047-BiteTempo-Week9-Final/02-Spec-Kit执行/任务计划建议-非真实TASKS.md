# 任务计划建议（供 `/speckit.tasks` 生成正式 tasks.md；不可充当官方命令产物）

任务由实际 Builder 根据 Spec Kit 生成后重编号；下述 `ST-*` 是**建议编号**，不可把它伪装成已执行的 `T001`。

| 建议任务 | 工作内容 | 依赖 | 验证方式 |
|---|---|---|---|
| ST-01 | 环境盘点、现有 Git 与 ORCA 边界、安全分支 | — | 检查报告、git status |
| ST-02 | Specify CLI 安装/现有项目初始化 | ST-01 | CLI 命令及真实 `.specify` 文件 |
| ST-03 | `/speckit.constitution` 与 `/speckit.specify` | ST-02 | 产物路径、diff、命令记录 |
| ST-04 | `/speckit.clarify` 与 `/speckit.plan` | ST-03 | 记录关键决策，真实 plan |
| ST-05 | 核对用户已批准 C「慢食刻 / BiteTempo」和对应图标/启动页，完成正式视觉基线登记 | ST-04 | C 方向用户确认记录、冻结 HTML V1.3 |
| ST-06 | `/speckit.tasks`、`checklist`、`analyze` | ST-04、05 | 矛盾清零或明确受控裁决 |
| ST-07 | Expo + TypeScript 工程骨架、2 Tab + 设置、主题与 i18n | ST-06 + ORCA 开发许可 | 安卓构建、页面真机 |
| ST-08 | 可重入倒计时状态机与会话本地存储 | ST-07 | 自动状态测试与真机暂停恢复 |
| ST-09 | Reanimated 光球、倒计时下方自动无声文字轮播（30/60/90/120/off，暂停冻结）、低动效模式 | ST-07 | 浅深色真机截图、帧率检查 |
| ST-10 | 心得列表 CRUD、草稿与本地存储 | ST-07 | 离线增删改/重启持久化 |
| ST-11 | Android 本机系统语音识别与能力检测、兜底 | ST-07/10 | 目标手机中文实说；系统键盘/手工兜底 |
| ST-12 | 统一 Provider、DeepSeek 适配、SecureStore BYOK | ST-10 | 真 API 数据完整性、无密钥日志 |
| ST-13 | AI 去口水词 Prompt、原文与润色对照 | ST-12 | 黄金样例与拒绝建议/虚构测试 |
| ST-14 | 完整 UI 对照 HTML 与系统键盘/安全区适配 | ST-08–13 | 逐页截图差异与修复 |
| ST-15 | 真机 Development Build + 独立 APK + 断网回归 | ST-14 | adb、运行、断网、重启记录 |
| ST-16 | `/speckit.converge` + 代码自审 + ORCA QA 矩阵 | ST-15 | 完整日志、关键 AC 有证据 |
| ST-17 | 用户签收与课程 3 张真实截图/说明 | ST-16 | 作业提交包 |

### 依赖与实施策略

- 先做到 **ST-07＋ST-08** 即第一个可用单机计时器，就拿到真机测试，避免最后一刻才发现 Expo/设备问题。
- 本地 AI Key 必须用户亲自在受控环境输入，不向 Builder 复制 API Key。
- 系统原生语音如因兼容性无法实现自动唤起，**先做好系统键盘语音/手动输入兜底，并真实标注未完成的语音按钮 AC**；不能对外宣称全部通过。是否接受降级交作业需按用户 Gate 裁决。
- 任何临时联网 STT、预置模型、健康分析都是越界，不能“为了顺利跑通”偷偷加入。
