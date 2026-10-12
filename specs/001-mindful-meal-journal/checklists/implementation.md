# Implementation Readiness Checklist: 慢食刻 / BiteTempo

**Purpose**: 在进入实现前，对需求/计划/任务做一致性与完备性自检
**Created**: 2026-10-11
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md) · [tasks.md](../tasks.md)

## 需求与范围

- [x] 每个 FR 均可测且对应至少一条 AC 或验收场景
- [x] 明确排除项（AI 建议/第三方 ASR/音频混音/云同步等）未被任务偷偷纳入
- [x] 两 Tab + 顶部设置的信息架构在 spec/plan/tasks 一致
- [x] 无声提醒（无按钮/声音/振动/TTS）在 spec/plan/tasks 一致

## 安全与隐私

- [x] 密钥仅 SecureStore；任务含密钥/权限扫描项（T028）
- [x] 麦克风仅主动触发使用；无后台录音
- [x] 无 `EXPO_PUBLIC_*` 承载密钥

## 视觉与品牌

- [x] 使用冻结 C「慢食刻 / BiteTempo」资产，无 A/B
- [x] UI 逐页对照 HTML 原型为独立任务（T027）
- [x] Android 底栏固定、内容独立滚动

## 平台能力

- [x] 计时后台恢复（挂钟+单调）有专门任务（T011/T016）
- [x] 系统语音能力探测与回退有专门任务（T017）
- [x] 主题三态 + 中英/跟随/回退 + 持久化有任务（T006/T007/T009/T024–T026）

## 验收与证据

- [x] 真机预构建与首次安装提前（T029），非末尾补做
- [x] 独立 APK 与断网验证（T030）
- [x] 自审/QA/追踪矩阵落盘（T031/T032）
- [x] 未运行不得标 PASS；缺凭证/不可用标 BLOCKED/NOT_TESTED

## Notes

- 全部条目通过，可进入 `/speckit.implement`。
