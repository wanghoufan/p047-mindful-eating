# CODE REVIEW — 用餐历史记录与统计（A1/B1/C1/D1）

- Task: P047 新增「统计」Tab（累计四项 + 近 7 天柱状图 + 每次用餐记录列表）、首页布局修正（hero 垂直居中）、笔记-用餐关联（C1）、中途退出自动补记（D1）
- Commit: 未提交（工作区改动，用户未授权 commit）
- Reviewer: 自审（单智能体模式，执行者=开发智能体本人；无独立审查者）
- Result: 过（tsc 0 error；真机 QA 见 docs/qa/CODE_REVIEW-stats-2026-10-12.md 对应 BUGS 记录）

## 改动范围

- `src/storage/db.ts`：新增 `finishSession()`（结束会话 UPDATE）与 activeSession 内存单例
- `src/domain/types.ts`：新增 `MealStats`、`DayMinutes` 类型
- `src/app/(tabs)/index.tsx`：开始即落库（D1 核心改动）+ 达标/提前结束改为 finishSession + 跳转笔记带 sessionId + hero 垂直居中布局
- `src/app/(tabs)/journal.tsx`：读取 params.sessionId、保存时写入关联、历史卡与输入区显示关联徽标
- `src/app/(tabs)/stats.tsx`：新页面（统计聚合 + 柱状图 + 记录列表）
- `src/app/(tabs)/_layout.tsx`：注册第 3 个 Tab
- `src/i18n/locales/zh-CN.ts` / `en.ts`：stats 节、tabs.stats、journal 关联文案（中英对齐）

## 关键设计决策（自审确认）

1. **D1 用「开始即落库、结束时 UPDATE」而非监听 AppState**：kill 事件无回调无法监听；开始即插入保证任何退出路径都留记录，`endedAt IS NULL` 即「未完成」。activeSessionId 为进程内存单例，杀进程自然丢失，重启后未完结记录正确显示为「未完成」。
2. **统计聚合在 JS 而非 SQL**：SQLite `startedAt/86400000` 按 UTC 天分组会在中国时区错位天边界；数据量级（每日几条）JS 聚合无压力且本地时区正确。
3. **达标率口径 = reached / total**（total 含未完成/进行中）：与已确认原型一致。
4. **编辑旧笔记保留原有关联**（updateNote 不改 sessionId）；新笔记才写 pendingSessionId。

## P0 / P1 Findings

- 无

## P2 / P3 Backlog Findings

- P3：未完成会话（actualSeconds=NULL）若被关联笔记，徽标显示 00:00——低概率路径（未完成通常无笔记），暂不处理
- P3：TabBar 3 项后 paddingHorizontal 30 偏宽，小屏英文长文案待真机确认（QA 检查项）
- P3：进行中的记录计入累计次数分母（拉低达标率），口径简单但与原型一致，如用户反馈再调
