# Phase 1 Data Model: 慢食刻 / BiteTempo

> 本地 SQLite 表结构（实现层）。字段为建议，实现时以 migration 为准。

## MealSession（用餐会话）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | UUID |
| startedAt | INTEGER | 开始挂钟时间（epoch ms） |
| endedAt | INTEGER? | 结束时间 |
| targetSeconds | INTEGER | 目标秒数（600/720/900/1200） |
| actualSeconds | INTEGER? | 实际用餐秒数 |
| finishReason | TEXT? | `reached_target` / `early_end` |
| createdAt | INTEGER | 创建时间 |

## MealNote（心得）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | TEXT PK | UUID |
| sessionId | TEXT? | 可选关联会话 |
| rawText | TEXT | 用户原文（必存） |
| finalText | TEXT | 用户确认后的最终文本 |
| revision | INTEGER | 修订号（防重复保存） |
| polishedBy | TEXT? | 是否经 AI 整理（provider id） |
| createdAt | INTEGER | 创建时间 |
| updatedAt | INTEGER | 更新时间 |

## LocalSettings（本地设置，键值或单行）

| 字段 | 值域 |
|---|---|
| durationPreset | 600 / 720 / 900 / 1200 |
| themeMode | `light` / `dark` / `system` |
| languageMode | `system` / `zh-CN` / `en` |
| reminderEnabled | 0 / 1 |
| reminderIntervalSeconds | 30 / 60 / 90 / 120 |
| reduceMotion | 0 / 1 |

## ProviderConfig（AI 服务配置）

| 字段 | 说明 |
|---|---|
| providerId | `deepseek` |
| modelId | 以 DeepSeek 官方 API 文档为准 |
| transportMode | `direct`（BYOK）/ `server_proxy`（预留） |
| apiKey | **仅存 `expo-secure-store`，不入 SQLite、不入日志** |

## 状态机（SessionState，非持久化实体，跨前后台重算）

- status：`idle` → `running` ↔ `paused` → `completed` / `early_end`
- 依据：`startEpoch`（挂钟）+ `accumulatedPauseMs`（累计暂停）+ `monotonicElapsed`（运行时单调校正）
- 恢复：回到前台时 `remaining = target - (now - startEpoch - accumulatedPauseMs)`；避免系统改时误差以挂钟+单调双重校验。
