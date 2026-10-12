## 2026-10-10 (cedfa79) feat(governance): 正式支持单智能体执行方式（含复审修正：QA 按类型适用 + Human Gate 明示保留）

**为什么**：让更聪明的模型承担更多自主工作，让 ORCA 用更少的管理成本保障交付质量。此前体系只按多智能体写，单人连续执行的项目要么被强制拉起整套派工，要么绕开体系，均不划算。首轮实现经独立审查「有条件通过」，本条含复审要求的全部修正。

**改了什么**
- `AGENTS.md` 新增「两种执行方式」节：**默认多智能体（其余各节原样不动）**；用户明确指定单智能体时直接采用、不再询问、不因客户端支持子智能体而自动派工。**执行方式与治理强度分开判断**——单智能体不代表低风险。
- 同文件「原有 Human Gate 同样适用」条（复审新增）：单智能体**不得绕过**开发前方案批准／Change C 受控重开／首次发布用户签收／生产·付费·凭据·不可逆操作的授权限制；**均为既有规则继续适用，不新增 Gate**。
- 同文件质量门禁条补「**按项目类型、实际工具与风险适用**」＋不模拟 supervisor 但**交付前须逐条检查原有关键质量放行条件**；「减少的是管理成本」条补「报告规模与风险相称、实际测试不能省」「缺陷由同一智能体切回开发再复验」。
- `README.md` 新增「单智能体开发使用说明」：按阶段读哪些规范（产品规划／UI／开发／自审／测试／交付）＋四条硬约束，**按需读，不许开工全量加载**；**只说明如何使用现有规范，不复述 SOP 全文**；读取失败须如实报告。
- `docs/roles/builder.md`、`code-reviewer.md`：各加一条单智能体口径——**禁止兼任／独立 Session／独立派工只约束多智能体执行**；自审须如实标注「自审」，**不得伪造独立审查**。
- `docs/roles/qa.md`：单智能体口径重写为「**单智能体 QA 执行细则**」——**质量底线不降**（关键 AC 有证据／核心路径真点真看／无验证不判 PASS 三条任何条件不放宽）＋**按类型选通道**（Web 用浏览器、Android 用模拟器／ADB／真机）＋**工具适用性**（真机 Canary 与会话能力预检只在适用时强制，**不得因缺少无关工具阻断开发**）＋不模拟 supervisor 但放行条件不减＋缺陷同一智能体修复复验＋报告规模与风险相称，并明写**这不是跳过验收的万能借口**。
- **触发口令「你是唯一开发者」**（补充指令）：`AGENTS.md` 新增触发口令条——用户说出**这一句即立即启用单智能体模式**，**无需补充其他启动提示词、不再询问是否启用、不自动派遣其他智能体**；智能体**自行**按项目状态按需读取现有规范（产品规划与简化审查／UI 规范／SDD／技术 SOP 与 Skill／Code Review 自审／真实 QA 与缺陷修复复验／HANDOFF），**由 ORCA 自动决定各阶段读哪些文件，用户不逐项指定**；**口令只决定执行方式，不代表跳过产品方案确认、必要 Human Gate 或授权要求**。同节补「用户没要求切换时不得擅自改变既定执行方式」。`README.md` 同步写明「只需说这一句，不用复制长提示词；智能体自行读 AGENTS.md 继续执行」。回归加 C3–C6 四条用例（口令与四项配套条款齐备／README 说明／口令随两包分发／多智能体仍默认且不得擅改模式）。
  **补漏（2026-10-10 用户指出）**：首轮实现只写了 `AGENTS.md` 与 `README.md`，**漏了对外概览与三张角色卡**——口令是用户唯一入口，漏一处该处读者就不知道有这回事，属四件套第 2 步未执行。已补：概览「一之二」节加「怎么切换：一句话」与「用户没要求切换不得擅自改变执行方式」；三张角色卡各加触发口令条（builder 不派工不造记录／code-reviewer 文首标明「自审」／qa 如实标注「自测」不得冒充独立 QA）；`check-sync.sh` 关键词清单加 `"你是唯一开发者"`（实测：概览里去掉口令即报 `OVERVIEW-STALE`）；回归加 C7（口令须在概览＋三张角色卡齐备）与 C8（check-sync 关键词含口令），并做非空跑验证（抽掉 qa 卡口令 → C7 FAIL）。
- `ORCA治理体系说明.md` 新增「一之二、两种执行方式」；`check-sync.sh` 对外必现机制关键词清单**只加 `"单智能体"`**（复审：不必加 `自审`）。
- 新增回归 `scripts/model/solo-agent.test.mjs` ＋ 夹具 `scripts/model/fixtures/solo-agent/`（A 组免管理负担／A' 账本缺失仍拦／B 组质量门禁不减／C 组规则文本到位且多智能体独立性未被覆盖／D 组无第二套体系）。**A4 用例保留**（复审确认）。

**没改什么（刻意）**
- **未改 `check-ledger.mjs`**（复审明令不碰已证明兼容的脚本）：实测空 `DISPATCH-LOG` 只报 WARN 不 FAIL（exit 0），已支持单智能体「不造行」。
- 未新增角色／Gate／阶段／状态／评分指标／单智能体专属 SOP 或第二套模板包；未改 APP 能力、UI 标准与安全边界；未动任何业务项目、未批量迁移旧项目。

**影响谁**：所有 ORCA 项目的执行者与编排者。单智能体项目可省派工记录与角色模拟；多智能体执行链、账本口径与独立审查要求**维持原样**。

**怎么验**：`SYNC-OK`｜`CHANNEL-OK`｜tm-qualification 17/17｜prototype-gate 9/9｜ui-leak 2/2｜**solo-agent 15/15**（新增 C3–C8 触发口令用例）。**另做真实执行验证**（隔离副本 `solo-demo`，非用户业务项目）：铺新项目模板包 → 小型局部开发（折扣门槛取等＋按分取整）→ 自审七查 → 实际运行测试发现缺陷 → 切回开发修复 → 复验 **5/5 PASS、exit 0**；`DISPATCH-LOG` 留空不造行、账本 `LEDGER-OK`；全程未派任何其他智能体。多智能体路径核对：Human Gate 保留条款在位、三张角色卡「只约束多智能体」在位、四段主链关键串未被覆盖。


## 2026-10-11 (PENDING) fix(ledger): 历史兼容返工——整文件指纹改为审批清单逐行白名单

**为什么**：审查实测一版「整文件 sha256 指纹豁免」两处硬伤——①追加一条合法新记录后整文件哈希变化，旧记录重新 FAIL（**正常做下一次任务就失去兼容**）；②环境变量可自行签发资格（新写非法 runtime→算哈希→传入即 exit 0）。另有三处：豁免对全部 fieldRules 生效导致 result=null 被放行；cost_cny 未验有限性；存量行数 48 被我误报 49。

**改了什么**（`scripts/model/check-ledger.mjs` ＋ 新增基线与测试）
- **逐行白名单取代整文件指纹**：豁免绑定 `(项目目录名, 账本文件, 该行完整 sha256, 字段)`，**追加新记录不影响旧行**；清单落版本库固定路径 `scripts/model/ledger-legacy-baseline.json`，调用方只能引用不能自行新增（旧 `LEDGER_LEGACY_GRACE` 已完全失效）。
- **豁免仅限 used/runtime/rework 三个字段**；result/date/role/缺键/BAD_JSON **永不可豁免**。已实测：获批历史 used 可兼容，同文件 result=null 与 BAD_JSON 仍 FAIL。
- **补数值有限性**：`Number.isFinite` 拦 `1e309→Infinity`；`tokens` 另加 `isSafeInteger`；布尔显式排除。Infinity 报错显示还原为字面量（原先被 `JSON.stringify` 显示成 null 致误判）。
- 新增 `ledger-legacy.test.mjs` **17 条** ＋ 夹具 `fixtures/ledger-legacy/`（含 proj-approved/proj-unapproved 两个项目）；`ledger-fields.test.mjs` 20→18 条（迁走已废弃的指纹试验）。

**存量核对（修正上轮 48→49 的错报）**：逐文件逐行明细已写入基线 `entries`，共 **48 条**（used 41／runtime 6／rework 1，涉 5 个项目 6 个文件）。全量跑修复后的校验器：**本轮字段校验导致的 FAIL 为 0 个**；31 个项目仍 exit 1 全部是既有 `APP-TRUEOUT-SOURCE-UNRESOLVED`，3 个是既有 APP 门/WARN。

**怎么验**：`ledger-legacy 17/17`｜`ledger-fields 18/18`｜母版 `LEDGER-OK`｜`SYNC-OK`｜tm 17/17｜proto 9/9｜ui-leak 2/2｜solo 15/15。反向验证：短路 checkFields → 两套分别 12 条 FAIL；基线路径指向 /dev/null → ledger-legacy 1 条 FAIL（证明豁免确由清单驱动）。

**未做（等审批）**：结果语义草案、Episode 去重、未测标注、Supervisor 统一入口、GATE/P0 分类核验、原始输入副本留存。

## 2026-10-11 (PENDING) fix(ledger): 历史兼容三轮返工收口——审批门/来源绑定/字段粒度（附对前两轮结论的更正）

**为什么**：两轮独立审查（codex/gpt-6.1-sol）连续判定「需修改」，逐条实测出漏洞。

**本轮修的三个阻断**
1. **正式入口可自签发**：先后出现过三种注入通道（`LEDGER_BASELINE` 环境变量 → `LEDGER_ALLOW_TEST_BASELINE`+`LEDGER_BASELINE_TESTONLY` 双开关 → `--baseline-test-inject` CLI 参数），审查实测**每一种都能让调用方签发豁免**——参数和环境变量都是普通调用方可用的能力，不构成隔离。**现正式 CLI 已无任何注入开关**，测试改为**复制隔离副本并改写副本内 `BASELINE_PATH` 常量**，正式文件不被触碰。
2. **条目审批继承顶层**：`e.approved_by ?? j.approved_by` 让「仅删条目审批人」仍 exit0。改为顶层与条目**各自必须显式非 PENDING**，缺失即零授权。
3. **来源只绑 basename／同行多字段被吞**：授权键改为 `(source_id, 文件, 物理行号, 字段)` ＋ 行内容 sha256 ＋ expected_value 全中才授权；**48 条候选条目已全部补上 `source_id`**（`orca-src-` + sha256(项目目录名) 前 16 位），项目侧需提供 `docs/model/GOVERNANCE-SOURCE.json`。

**同时删除**：`graceConsumed` 消费集合。审查实测「删除后 33/33 仍全绿」——现行 CLI 每物理行只遍历一次，防复制完全由 line_no＋来源＋sha＋expected 四重匹配承担，该集合无可观察作用。

## ⚠️ 对本文件前两条结论的更正（务必以本条为准）

- 上条写「全量跑修复后的校验器：**本轮字段校验导致的 FAIL 为 0 个**」——**该结论不成立**。当时用的是**尚未获批**的清单，属候选方案模拟，不能作为已批准兼容或正式落实的证明。
- 更早一条写「仅 6 个文件 **49 行**」——**算术错误，逐行明细合计为 48**（used 41／runtime 6／rework 1）。
- 更早一条提到 `LEDGER_LEGACY_GRACE` 整文件指纹豁免——该机制**已被逐行白名单取代并完全退役**，历史记录保留仅为沿革。

## 存量三套口径（现行，实测可复现）

| 模式 | 项目数 | exit 0 | 本轮字段 FAIL |
|---|---|---|---|
|---|---|---|---|
| 严格（正式基线 PENDING，零授权） | 35 | 1 | 5 项目 / **48 行** |
| 未获批候选清单 | 35 | 1 | 5 项目 / 48 行（与严格一致，因 PENDING 不生效） |
| 已批对照（仅测试，且项目须先有 `GOVERNANCE-SOURCE.json`） | 35 | 1 | **0 行** |

**「exit 0 = 1」不是「35 个项目全部通过」**：其余 34 个的 exit 1 来自既有 `APP-TRUEOUT-SOURCE-UNRESOLVED` 等 APP 门禁，与本轮字段校验无关，两者不可混计。

**已知残留边界（如实记录，未修复）**：条目**未声明** `source_id` 且项目无身份文件时，同 basename 的另一来源仍会命中（用例 I6 明确断言 exit 0，不隐藏）。正式清单启用 `source_id` 后该路径自动收紧。

**怎么验**：`ledger-legacy 33/33`｜`ledger-fields 18/18`｜母版 `LEDGER-OK`｜`SYNC-OK`｜tm 17/17｜proto 9/9｜ui-leak 2/2｜solo 15/15。反向验证对 7 处防线逐条做「破坏→看 FAIL→还原」：顶层审批门／条目审批门／source_id 判定／行号匹配／sha 绑定／expected 绑定／字段校验**均被抓到**；删除冗余消费集合后仍 33/33（证明其确为冗余）。

**未做（等审批）**：结果语义草案、Episode 去重、未测标注、Supervisor 统一入口、实际记账入口接线、两次打回升级实测、GATE/P0 分类核验、TM 未测维度贯通、原始输入副本留存、下一任务落实清单。

## 2026-10-11 (PENDING) fix(ledger): 派工/任务账本字段校验补齐（反例实测确认的零校验漏洞）

**为什么**：账本报告复评指出中央校验与 supervisor 卡内联块覆盖面不同。审查进一步用反例确认**非法 date／role／used／runtime、result=null、rework 的 null／负数／字符串／小数全部 exit 0 通过**。根因＝枚举检查写作 `d[k] !== null` 使 null 整体绕过，且这四个字段根本没进枚举表。

**改了什么**（仅 `scripts/model/check-ledger.mjs`，中央规则文本未改）
- 按字段分别定义类型与可空性，**覆盖缺键／null／空串／错误类型／非法枚举**：`date` 须真实日历日期（`2026-02-30` 已拦，不自动归一化）、`role` 两本账本都校验（保留 `orchestrator`／`迁移整理工` 等既有合法标识）、`used` **维持恒填主语义一字未改**、`runtime` 限定 7 个现行取值、`rework` **整数且 ≥0（不照 tokens/cost 放 null）**、`tokens`/`cost_cny` 允许 null 但有值时校验。
- 新增 `LEDGER_LEGACY_GRACE` 内容指纹豁免：**只认文件内容 sha256，不认可伪造的 date**；命中则新增项降 WARN；**既有结构硬错误（缺键／BAD_JSON／result 非法）一律不放宽**，与新增项区别处理；**不自动改写任何历史**。
- 新增回归 `scripts/model/ledger-fields.test.mjs` ＋ 夹具 `scripts/model/fixtures/ledger-fields/`（14 个隔离项目，20 条断言）。

**存量影响（只读扫描 1.Active 全量）**：37 个含真实行文件／2341 行中，**仅 6 个文件 49 行**受影响（used≠主 41 行、runtime 变体 6 行、rework 字符串 1 行）；`date`／`role`／`result` 零影响。另发现 **039 与 028 账本内容指纹完全相同**，疑同源，未深查。

**怎么验**：ledger-fields **20/20**；反向验证「短路 `checkFields` → 15 条 FAIL」「豁免改为按 date 放行 → 1 条 FAIL」证明非空跑；`SYNC-OK`｜母版自检 `LEDGER-OK`｜tm 17/17｜proto 9/9｜ui-leak 2/2｜solo 15/15｜7-Skill `VALID`。

**未做（等审批）**：结果语义草案（**已确认会破坏 `supervisor+FAIL` 升级计数，上一版撤回**）、Episode 去重（实测评分器无去重）、未测维度标注、GATE_VIOLATION 分类核验、F 组原始输入留存。

## 2026-10-10 (PENDING) fix(governance): A 项留痕缺口 + 触发口令补进老项目注入区块

**为什么**：①A 项——外部独立会话两次复现「铺了包却按小活免留痕」；②老项目迁移——注入区块不含触发口令，老项目 `AGENTS.md` 拿不到这个入口，规则到不了已治理的老仓。

**改了什么**
- `AGENTS.md`「何时起」节补「**小活豁免只管还没铺包的项目**：判据是**要不要铺包**，不是**任务大不大**；已铺包（`docs/review/`、`docs/qa/`、`docs/model/`、`docs/handoff/` 任一在位）＝已在体系内，无论单多小，自审与 QA 留痕照旧落盘、账本照旧记账；拿「这是个小活」当免留痕理由＝**半套**，按红线打回」。
- 同文件「自审仍须留痕」条补：**已铺包的项目这是硬要求**，留痕可极简三五行但不能没有；`TASK-MODEL-LOG` 记一行。
- `scripts/_inject-agents-block.py` 的注入区块补「**两种执行方式**」一条，含触发口令「你是唯一开发者」、不得擅自切换、质量门禁不减、只约束多智能体等要点——**只增不删**，老项目下次跑 `sync-old-projects.sh` 即获得该入口。

**怎么验**：注入幂等实测（临时项目连跑两次 → 区块仍 1 个、口令 1 处、项目专属内容保留）；包内角色卡已含口令（`老项目迁移模板包/docs/roles/qa.md` 命中）；`SYNC-OK`｜`CHANNEL-OK`｜tm 17/17｜proto 9/9｜ui-leak 2/2｜solo 15/15｜7-Skill `VALID`。

**未做**：按用户裁决 B3，**未批量铺开老项目**（`sync-old-projects.sh` 未实跑），等有具体项目要升级时单个处理。

## 2026-10-10 (cedfa79) docs(review): 对 10-10 审查报告 P0 项的复核与反驳（结论：不采纳 P0-1～P0-4）

**为什么**：独立审查给出 CONDITIONAL PASS 并列 P0-1～P0-4 四处「文字矛盾」。逐条实测后，三项已不成立、一项属误读；若照报告改会把已正确的表述改坏（P0-1 若删禁 Builder 措辞会连带移除 P046 边界）。故出书面反驳交回复审者。

**改了什么**：新增 `review/对审查报告_2026-10-10_P0项复核与反驳.md`。**治理规则零改动。**

**复核结论（每条附可复跑命令）**
- P0-1 不成立：`supervisor.md:46` 已含「builder 有且仅有两项例外（2026-10-09 用户定，P046 教训）」，与 AGENTS Phase1 一致。
- P0-2 不成立：`qa.md:17` 已写「本卡不再写"仅限QA"以免误拒」；概览 L92/L109 的「仅限 QA」是转述历史变更沿革，非当前口径。
- P0-3 误读：编排者提示词「默认三件套」指派工角色组（开发/产品/QA），与「体系更新四件套」无关；概览中「四件套」出现 0 次。
- P0-4 误报：模板实为 10 列；qa 卡与编排者提示词均已定「列数以模板为准、不复述数字」，概览 0 处「N 列」表述，无从漂移。
- P0-5 属实但非矛盾：未提交改动是等授权的正确状态；报告 SYNC-FAIL 系时序巧合（报告 16:19:55 落盘 vs 两包同步 16:19:59，晚 4 秒），当前 SYNC-OK。
- 附带证伪：P1-8 检查点第 4 条已是放宽后口径；P1-10 母版 check-ledger 自检实跑 `LEDGER-OK (含 WARN)`。

**顺带发现（未修）**：概览「八、给审查者的检查点」编号乱序 `1..13, 15, 16, 14`，历史增补未重排，不影响内容正确性。

**按用户裁决**：A1 不采纳并附反驳；B1 P1-6／P1-7 另案处理，本轮不动。

**怎么验**：`SYNC-OK`｜`CHANNEL-OK`｜tm 17/17｜proto 9/9｜ui-leak 2/2｜solo 15/15｜7-Skill `VALID`；反驳文档内 9 条命令已逐条实跑复核。

## 2026-10-10 (0a6238f) docs(governance): 简化门槛第五轮收口——两处结论修正＋两条口径落地

**为什么**：第五轮验收裁决 A2 B1 C1，整改收口。本轮不新增任何规则，只修正两处过强的结论并把两条回执口径落到文件。

**改了什么**
- **结论修正 1（Gate A）**：旧项目缺 A3／A4 等新模板字段，**只能说明不符合新文档要求，不能单独证明存在过度设计**；此前「Gate A 就会拦」的推论撤回。过度设计只认 Gate B 的源码级实据。
- **结论修正 2（Gate D）**：原 QA **已涉及**部分可读性、裁切与界面问题；新增门槛定位为**补齐核心任务操作体验**，**不是否定原有验收**。
- `docs/sop/app-simplicity.md` §3：豁免的是「**安全信息本身**」而非「安全相关界面」——安全能力不得随意删除，但其**页面排版、提示时机与操作流程仍可接受 Gate B 简化审查**。
- 同文件 §4 ＋ `PRODUCT_PLAN.template.md`：**A3／A4 轻量项目各用一句话回答即可**；确认无冗余可写「无须删减」及简单理由；**不强制新建独立表格**；**`Out of Scope` 不得代替已纳入范围的可删减分析**。

**影响谁**：评审与执行者对「缺新字段」与「过度设计」的判读口径。

**怎么验**：`SYNC-OK`｜`CHANNEL-OK`｜tm-qualification 17/17｜prototype-gate 9/9｜ui-leak 2/2｜7-Skill `VALID`；条件依赖端到端 30/30；7 颗 Skill 同步 77/77。

**未做（按回执）**：不批量更新旧项目 SOP；不改 P045／P046 业务代码；不新增角色／Gate／状态／评分／检查表／自动检查器。**母版未 commit、未 push。**

---

## 2026-10-10 (0a6238f) feat(governance): 产品简化门槛（Gate A/B/C/D 挂既有 Gate）

**为什么**：P045 两版对照显示，「完整走流程」的复杂版（`main-2` / `com.p045.pelvicfloor`，174 文件 / 26,005 行 / 88 Composable）出现首页三处入口同指 `onOpenAbility`、`NextLevelChoice()` 常驻训练 HUD 与暂停页、记录页「回今日自由选择等级」实跳能力页；而只做核心任务的轻量版（`045-ing-凯格尔训练` / `com.orca.kegel`，17 文件 / 3,057 行）体验更干净。**根因是 ORCA 每层都在检查「做得对不对、对不完整」，没有任何一层问「这些是不是多余的」**；Readiness 7 维度更对完整性正激励（核心方案完整性 20 分、风险与异常场景 10 分），对冗余零敏感。

**改了什么**
- 新增单一真源 `docs/sop/app-simplicity.md`（11 节）：三条总则／PASS·CONDITIONAL·FAIL 判定／**豁免清单**（安全停止·隐私告知·空状态·删除确认·数据完整性·异常恢复一律不得判冗余）／Gate A 范围与 MVP／治理强度分级（五项判据，不得仅凭单屏单任务）／Gate B 信息架构（**不得 Freeze**）／Gate C 防膨胀／Gate D 真实体验（**证据按低/中/高风险分级**）／§11 SOP 依赖五情形判定。
- 四门槛**全部挂既有 Gate**：Readiness／Design Freeze／DEV_BASELINE／产品验收追踪矩阵。**未新增角色、独立 Gate、Phase、账本字段、状态枚举、评分指标或管理系统；未改 Readiness 评分结构。**
- 7 颗 Skill 加**条件式 SOP 依赖声明**（每条写明触发条件，**仅当任务需要时才读取**），并按 §11 五情形判定：项目缺失+母版可读→回退母版不判缺失／内容不一致→`DEPENDENCY-STALE` 不静默用旧规则／仅项目可用→允许读取但标明无法核对母版／两处不可读且本任务需要→`DEPENDENCY-MISSING` 阻断且**不得判 PASS**／本任务不需要→不检查不阻断。
- 复用 `orca-design-pipeline/validate_skillset.py`：新增 `--master`／`--runtime-project`／`--required`，按运行时真实顺序（项目副本→母版）校验，**不做「母版存在即通过」**。

**影响谁**：所有面向用户的产品与网站；Reviewer/Planner/QA 职责各增一段。

**怎么验**
- 全量门禁：`SYNC-OK`｜`CHANNEL-OK`｜tm-qualification **17/17**｜prototype-gate **9/9**｜ui-leak **2/2**｜7-Skill validator `VALID`
- 条件依赖端到端：7 颗 × 共 **30 条依赖全部解析→读取→判据可用**
- 反向测试：旧版副本→`STALE` 阻断／两处不可读且 required→`DEPENDENCY-MISSING` 阻断／不需要→**0 阻断**
- 新项目模板包运行时校验：**0 MISSING、0 STALE**；7 颗 Skill 同步 library+10 Agent **77/77 一致**
- 复验中修复：概览缺 `DEPENDENCY-MISSING`/`DEPENDENCY-STALE` 关键词导致 `OVERVIEW-STALE`（已补机制说明行）；validator 采集器误把说明正文里的引用当依赖声明（已限定为依赖表格行）

**已知遗留（非本次引入）**：既有项目 `docs/sop/` 副本陈旧——如 `main-2` 的 `app-theme-i18n.md` 缺母版后加的姊妹规范交叉引用行，运行时正确报 `DEPENDENCY-STALE`；按批准范围本轮不批量刷新历史副本。`check-sync` 的 AC-MATRIX 巡检显示多个既有项目缺产品验收矩阵（该段按设计只报、不影响门禁主结论）。

**PoC v1/v2 保留在 `temp/`，不入母版、不自动决定 Gate。**

---

# ORCA 治理体系变更记录（CHANGELOG）

> **这是母版的变更说明正典。** 每次改动母版并 push，必须在本文件追加一条（最新在最上）。
> Git 负责记录变更/回退/审计；本文件负责说明**改了什么、为什么改、影响谁、怎么验**。
> 协作规则见 `~/.config/opencode/AGENTS.md` 第五节；体系更新三件套见根 `AGENTS.md`。

---

## 2026-10-09 (829ead5) docs(governance): 新建 CHANGELOG.md 并接进体系更新四件套

**为什么**：用户问「每次推送更新情况写清楚没有」——查下来母版与两包**都没有 `CHANGELOG.md`**，此前只靠 commit message ＋ HANDOFF 章节留痕，**违反了中央规则**「具体变更说明记录在 `CHANGELOG.md`」。三者各有用途不能互相替代：commit message 给 git 看、HANDOFF 给当轮接续看、CHANGELOG 给「以后想知道这个体系改过什么」的人看。

**改了什么**
- 新建 `CHANGELOG.md`：回填 2026-10-07 起 8 笔变更（每条含 why／what／影响谁／怎么验），并说明 2026-09-11 之前以 Git 历史为准。
- `AGENTS.md`「体系更新三件套」扩为**四件套**，新增第 4 步：**每次改动并 push 必在 `CHANGELOG.md` 顶部追加一条**；漏写＝体系更新未完成；只写 commit message 或 HANDOFF 章节不算交差。
- `_sync-packages.py` 的 `PAIRS` 加 `CHANGELOG.md`（随包分发）。
- `check-sync.sh` 把 `CHANGELOG.md` 纳入逐字节比对 ＋ 概览新鲜度关键词加 `CHANGELOG`。
- `README.md` 根目录导航、`ORCA治理体系说明.md` 规范表各加一行。

**影响谁**：所有维护本母版的人；漏写将被 `check-sync.sh` 直接判 `SYNC-FAIL`／`OVERVIEW-STALE`。

**怎么验**：故意改包内一份 `CHANGELOG.md` → 立刻报 `DIFF` + `SYNC-FAIL`（漂移可检出）；概览未提 `CHANGELOG` 时报 `OVERVIEW-STALE`（已修）；复位后 `SYNC-OK`｜`CHANNEL-OK`｜`17/17`｜7-Skill `VALID`。

---

## 2026-10-09 (249821b) docs(governance): 账本两本对不上——定性为「非待办」

**为什么**：用户问「派工账跟任务账对不上的话，中间有什么问题吗？还是之前漏了但后面发挥作用了？」经全项目实测核实后定性。

**实测**：TASK 共 1001 行、DISPATCH 共 1235 行（差 −234）。三类成因：
- **DISPATCH 多＝设计如此**：两账粒度不同（DISPATCH 记每次派工，TASK 记任务最终结果）。016 有 9 个任务被重复派工，最多一个派了 28 次。
- **TASK 多＝真漏**：015（+13，DISPATCH 全空）、016（+37）、037（+5）、027（+4）。漏的是「派工流水」不是「任务结果」——同 session 连派多活只记最后一次、续 session 只顾写任务账。
- **两账任务集不重合**：016 有 50 个任务只在 TASK、14 个只在 DISPATCH（命名不一致，无法按 task 精确对齐）。

**用户决定**：不补历史、不加机器门。理由——任务结果账完整，模型评估核心指标（返工次数/是否升级/PASS-FAIL）看 TASK 账不受影响；DISPATCH 本就允许重派多行，加"两账必须对齐"机器门必然误报；机制本身已有 supervisor 对账抽查兜底。

**影响谁**：无行为变更。结论记入 HANDOFF §87 标注**已定性、非待办**，后续不得当缺口翻出重提。

**怎么验**：无脚本变更；`SYNC-OK` 保持。

---

## 2026-10-09 (249821b) feat(governance): 禁止开发内部信息污染用户界面（L1/L2/L3 隔离）

**为什么**：开发智能体常把内部审查信息、技术约束、版本编号、授权流程直接渲染到普通用户界面，APP 冗长复杂，甚至出现与产品目标无关的阻断式操作。

**改了什么**
- 新增单一真源 `docs/sop/app-ui-layers.md`：L1 默认可见（任务/结果/原因/下一步＋必要安全法律）／L2 用户主动展开（详细玩法/来源，来源用可读名称不用内部 ID）／L3 仅内部（Phase/Gate/AC-FR/审查评分/置信等级/数据 ID/动作代码/开发版本与 hash/运营授权记录，不上屏）。
- 严禁把 Plan/UX/Research/QA/合规审查原文直接复制上屏，须经面向用户的文案转换（`E01`→「还差一张二条」等）。安全/医疗/版权必要告知**不得因精简而隐藏**；非紧急说明渐进披露。
- 新增提示式扫描器 `scripts/model/ui-leak.mjs`（含动态渲染线索如 `esc(x.id)` 直接上屏），**只提示、人工语义核验**，刻意避开注释/事件钩子/内部 ID 作数据键的正确写法，内置误伤白名单（地区玩法名/玩法版本/查看来源/安全提示），**永不因扫描自行判 FAIL**。回归 `ui-leak.test.mjs` ＋夹具随包分发。
- 接入既有 Gate：AGENTS／PRODUCT_PLAN 声明＋关键 AC／qa 卡专项／四颗 Skill 主改＋三颗 Skill 引用／概览规范行＋检查点 15／同步与门禁纳管。**不新增角色、Gate、阶段或 Human Decision。**

**影响谁**：所有面向用户的产品与网站；后续新原型在 UX/Prototype/Freeze/QA 各阶段按 L1/L2/L3 记录与核验。

**怎么验**：`ui-leak.test` 2/2；**P046 真实原型扫出 74 处泄露**（含 `esc(ex.id)`、`evidence_grade` 真上屏点）；**正面样例（地区玩法名/版本/查看来源/安全提示）0 误伤**；全量门禁 `prototype-gate 9/9`／`17/17`／`SYNC-OK`／`CHANNEL-OK`／7-Skill `VALID`；7 颗 Skill 同步 library+10 Agent 77/77 一致。

**存量兼容**：未改任何业务项目；P046 显示层修正由其编排者在原型验收前做，P045/P037 由各自编排者按既有链局部处理。

---

## 2026-10-09 (f6c5f5e) fix(governance): 第二轮审查 P0 四项 ＋ P1 七项整改（CONDITIONAL PASS 复审）

**为什么**：第二轮全量复审（`review/审查报告_2026-10-09_muse-spark-1.3-contributor-free.md`，CONDITIONAL PASS）报 4 项 P0 文字债会让执行者按字面做错，要求修完再 commit＋push。

**P0 四项（执行者按字面会做错，不修 Phase1 停摆）**
- supervisor 第1条与 Phase1 新链冲突 → 加例外句：builder 在 PLAN 阶段**有且仅有两项例外**（`docs/pm/` plan 正文 ＋ `docs/design/prototype/` 原型），其余业务派工含 APK/生产模块/正式后端/未批 SDD TASK 仍禁；否则合法 builder 派工会被全判违规打回。
- qa 卡解禁口径 stale（仍写「仅限QA」）→ 改以 `AGENTS.md` 为准（QA＋planner＋senior-expert）；否则按卡会误拒给 planner/senior 带 `-s`，产品审查汇总与升级任务必失败。
- `AGENTS.md` 标题「三件套」→ 四件套；`prototype-gate` 期望 `pass=6`→`pass=9`（原型6＋导航3）；`README.md` L15 同步。
- 矩阵列数三处不一（模板实 10 列 vs 7 vs 9）→ 统一「照模板，列数以模板为准、不复述数字」，避免随模板演进漂移。

**P1 七项**：`check-ledger` 参数解析 bug（只传 `--allow-example` 时把开关当目录）／`check-sync` 夹具漂移改整树纳管（含 nav-gate/tm-qual）／概览检查点 4 解禁口径／TM 卡补原型口子／母版自检 `--allow-example` 跳过 APP 门（去噪声）／分工表升 T26／README `sed -i` 补 Linux 写法。

**P2**：软链制与 `--untrack` 各补半句澄清；README.en 13B 差**已实测确认为路径裸名归一化**（非漂移）；其余备案。

**影响谁**：Phase1 编排者不再被 supervisor 误打回；planner/senior 能正确带 `-s`；新规 APP 导航声明纳入机器门。

**怎么验**：`prototype-gate` **9/9**｜`tm-qualification` **17/17**｜`SYNC-OK`｜`CHANNEL-OK`｜7-Skill `VALID`；并**亲跑复验报告未重验的三项**——短路 `checkPrototypeDelivery` → `pass=5 fail=4`（还原 9/9）、P045/P046 新门拦截均为 0、P1-2 改包内夹具 → `DIFFDIR`+`SYNC-FAIL`（还原 SYNC-OK）。

---

## 2026-10-09 (f6c5f5e) fix(governance): 审查整改 7 项真缺陷 ＋ APP 导航纳入机器门

**为什么**：muse-spark 审查母版全仓（报告落盘 `review/审查报告_2026-10-09_muse-spark.md`）报 12 项矛盾。用户拍板：**评分不加机器码、导航加机器码**。

**改了什么**
- **C-07（最重）**：TM Qualification 采样门槛（≥30 Episode／≥3 项目）原只写在 A/B 段、不在 Gate 段，照 Gate 读会凭小样本判 QUALIFIED → 已补进 Gate 段。
- **C-02**：分工表 qa 行标题去掉「QA 专用／仅限 QA」旧字面（口径不变，免执行者误拒给 planner/senior 带 `-s`）。
- **C-11**：概览检查点重复编号 `11.` 顺延为 14。｜**C-01**：README「三件套」改四件套。
- **文字债**：supervisor 卡 DISPATCH 校验「8键」改「7 必需键＋note 可选」。
- **C-10**：汇报 ≤10 行补唯一豁免（体系改动测试报告/审查整改报告）。
- **O-05**：`temp/` 分工明确——回归夹具落 `scripts/model/fixtures/`，不放 temp/。
- **APP 导航纳入机器门**（用户令 B）：新增 `APP-NAV-DECL-MISSING`／`APP-NAV-AC-INCOMPLETE` 两码，与品牌/主题同构。

**影响谁**：新写的 APP Plan 必须填导航声明并把五类导航 AC 标进关键 AC 集合；历史 Plan（含开发中的 P045/P046）不受影响。

**怎么验**：测试扩到 **9 用例**（原型 6 ＋导航 3），母版与两包均 `ALL PASS pass=9 fail=0`；非空跑证明（短路 `navNewRegime` → 导航用例 FAIL，还原 9/9）；P045/P046 新门拦截数 = 0。门禁 `SYNC-OK`／`CHANNEL-OK`／`17/17`／7-Skill `VALID`。

**过程中修掉的两个真坑**：①模板自带的小节标题让宽松正则恒真（空声明也算已填）→ `NAV_DECL` 收紧为只认实际填写的标记行；②新门首版会 FAIL 在开发项目的真源 Plan → 加新规兼容口径，只对新规 Plan 判 FAIL。

---

## 2026-10-09 (f6c5f5e) chore(governance): 测试纪律入规 ＋ 测试资产持久化

**为什么**：用户指出——跑完测试把临时夹具删了，等于测试只是一次性验证，用户无法自行复跑，也没法交审查者复核「体系完整性 + 测试合格性」。

**改了什么**
- `AGENTS.md` 入规三条：①**任何体系改动（尤其大改）收工前必跑适用测试**，不许用「改的是文档」当借口不跑；②**跑完必须先向用户报告**，报告前不许自行提交/推送/清场；③**回归夹具必须持久保留、严禁清场**，一律落版本库内固定路径，**禁用 `/tmp`**，要证明非空跑用「改坏→FAIL→还原」且还原后仍保留。
- **修掉真缺口**：`_sync-packages.py` 的 `DIRS` 只同步文件不递归子目录，`scripts/model/fixtures/` 从未进两包——包内测试脚本会因缺夹具跑不起来。新增 `TREE_DIRS` 整树递归同步，`check-sync.sh` 加 `DIFFDIR` 防夹具漂移。
- 新增持久化测试资产：`scripts/model/prototype-gate.test.mjs` ＋ `scripts/model/fixtures/proto-gate/`（6 用例 41 文件），随两包分发，包内亦可复跑。

**影响谁**：所有维护母版的人；今后每次大改都有可复跑的验收证据供审查者复核。

**怎么验**：母版与新项目包内各跑一次 `prototype-gate.test.mjs` 均得 `ALL PASS pass=6 fail=0`；短路 `checkPrototypeDelivery` 后 4/6 FAIL 证明非空跑；改包内夹具 → `check-sync.sh` 报 `DIFFDIR` + `SYNC-FAIL`。

---

## 2026-10-09 (f6c5f5e) fix(governance): Phase1 必须交付可运行交互原型（P046 教训）

**为什么**：Phase1 的 builder 只被允许写 plan 正文，AI 倾向把 HTML 原型当「正式开发」而不敢做。P046 **Readiness 96 分、Plan 审查通过**，却没交付用户真正需要的本地可点击 HTML——文档满分，用户要的东西是零。

**改了什么**
- **权限边界**：`AGENTS.md`＋`docs/roles/builder.md` 允许 Phase1 builder 在隔离目录 `docs/design/prototype/` 制作设计验证用 HTML/CSS/JS 原型；**不是正式业务代码、不代表进入 Phase 2**；仍禁 Android APK／生产业务模块／正式后端服务／未批准的 SDD TASK；可自检但**不得启动 Phase2 正式 qa**。
- **APP 默认交付要求**：本地完整可运行原型；核心页面完整不以局部演示替代整套流程；关键按钮/跳转/返回/滚动/状态切换能实际操作；已确定名称/图标/品牌/真实图片素材全部落实；浅深色与语言及代表性异常状态可演示（模拟系统行为须标注）；给出 HTML 路径与本地打开命令。**PDF／截图／纯文档／在线概念图／单张示例预览 HTML 一律不算**。
- **Readiness Gate 附加条件（非新 Gate）**：`PRODUCT_PLAN.template.md` Gate 段新增「原型交付完整性检查条件」五项（存在／能启动／浏览器自动化冒烟测试／用户能自己打开不靠讲解／证据含路径·运行方式·测试结果·已知限制），并明确**文件存在与真实运行分开判定**；缺任一项判现有 Gate 不满足。
- **机器强制点**：`check-ledger.mjs` 新增 `checkPrototypeDelivery`，新增 FAIL 码 `PROTO-MISSING`／`PROTO-NO-RUNTIME-EVIDENCE`；示例预览 HTML（example/sample/demo-preview）不计入。
- **兼容性**：新规判据＝Plan 含该小节；旧规 Plan（含开发中的 P045）只 WARN 不 FAIL，不打断。
- **Skill/文档**：`interactive-product-prototype` 加 Phase1 原型定位（`PROTOTYPE_PHASE1_DRAFT`，不等同正式验收）；`design-freeze` 加「原型输入须可运行、不能是文档」；编排者提示词、迁移提示词 5.10、归位表、对外概览（规范行＋检查点 13）同步；validator 加防回退锚点。

**影响谁**：新建的有用户界面的 APP（Phase1 必须带可运行原型进 Human Gate）。P045 不受影响（实测 PROTO 拦截数=0）。

**怎么验**：隔离样例 6 用例全过——仅 Plan+PDF 被阻(exit1)／有 HTML 无证据被阻(exit1)／可运行 HTML+冒烟证据放行(exit0)／旧规兼容(exit0)／PDF 改名冒充被阻(exit1)／仅示例预览被阻(exit1)。门禁 `SYNC-OK`／`CHANNEL-OK`／`17/17`／7-Skill `VALID`；3 颗 Skill 已同步 library+10 Agent。

---

## 2026-10-09 `eeadd34` feat(governance): APP 导航与视觉方向规范升级 ＋ 公开仓自动补齐工具

**为什么**：解决三类反复出现的失败——① AI 生成的 APP 风格高度雷同（只换配色）；② 导航组件由 Builder 临场随意设计；③ Android 底栏被放进可滚动内容、跟着内容滚走。

**改了什么**
- **新增单一真源 `docs/sop/app-navigation.md`**（与 `app-theme-i18n.md`、`app-brand-assets.md` 并列，不互相覆盖），八节：
  - 视觉方向：新 APP 完整原型前**默认**给三方向，必须在**同一核心页面并置对比**，逐轴拉开布局/信息密度/字体/图标/组件造型/留白/品牌调性；**只换配色＝未做方向**（`VISUAL_DIRECTION=BLOCKED`）；`LIGHT`/`DARK` 是已选风格的主题适配、**不是独立方向**；用户批准后**直接进既有 Design Freeze**，不重复询问、不重选风格（方向变更属 Change C）。
  - 导航设计：**底部导航由产品决策**（不是所有 APP 都要 Tab，单主任务/单屏工具默认不设）；采用时入口名/数量/顺序、图标资源与线条或填充风格、**选中/未选中/点击/焦点**四态、字体字重间距、语义 Token、显隐条件、小屏与英文长文案与系统手势区适配，**全部由产品侧在 UX Contract 显式确定并在 COMPONENT Freeze 绑定，禁 Builder 自行猜测**。
  - Android：优先官方 M3 `NavigationBar`/`NavigationBarItem`/`Scaffold(bottomBar)`；**底栏固定于正常页面导航位、滚动内容独立滚动，禁止把底栏放进可滚动内容**；沉浸式是否隐藏底栏以产品批准规则为准。
  - 原型与 QA：可点击原型必覆盖滚动顶部/中部/底部、页面切换、导航显隐、软键盘、安全区、浅深色、中英文；**正式 Android QA 禁仅凭网页静态原型判定**，须依据真机实际运行截图/录屏/交互测试。
- **接入点**（不另建真源）：`AGENTS.md` 默认继承段 ｜`PRODUCT_PLAN.template.md` 新增「APP 导航与视觉方向声明」＋9 FR/10 AC＋关键 AC 集合增四类硬约束 ｜`docs/roles/qa.md` 导航与视觉方向专项验收 ｜`docs/sop/android.md` §7.5 ｜`ORCA治理体系说明.md` 规范表＋审查检查点第 12 条 ｜`_sync-packages.py` EXTRA 登记 ｜`check-sync.sh` 概览关键词。
- **7 颗设计管线 Skill 全部同步**，并给 `validate_skillset.py` 加**防回退**：`app-navigation.md` 七颗必备 ＋ 5 颗语义锚点（防改词悄悄削弱规范）。
- 同批附带：`scripts/orca-public-guard.sh`——公开仓不带 ORCA 的**自动**补齐工具。

**影响谁**：所有面向用户的 APP 新项目（自动继承，不需额外交代）；已存在项目在下次 Plan/设计阶段对齐。

**怎么验**：`SYNC-OK`｜`CHANNEL-OK`｜`tm-qualification 17/17`｜`VALID: 7-Skill simplified final-state regression PASS`｜7 颗均引 `app-navigation.md`｜部署 10 Agent × 7 Skill = **70/70 逐字节一致**。

**踩坑**：`skills-manager-cli` 的 `deploy`/`undeploy` **必须带 `--agent`**，漏带会静默失败却返回成功；这 7 颗在 registry 里 `source_ref` 为空导致 `update` 报 "missing its original source path"、按名解析报 "ambiguous"。处置：备份 DB → 回填原行 `source_ref`（原行带 scenario 关联与部署记录，**不可删**）→ 清孤儿行。教训：**registry 行有 scenario/部署关联，只补 `source_ref`，不要删原行**。

---

## 2026-10-09 `0c7efd2` fix(orca-gitignore): 修中文文件名静默漏摘 ＋ 记录上线实测的两个真 bug

**为什么**：上一笔提交推到 19 个公开仓后，线上实测发现中文名 ORCA 文件并未被摘除。

**改了什么**
- `git ls-files` 默认 `core.quotepath=true`，把中文名输出成 `"ORCA\346\262\273…"` 转义串；脚本把该串喂给 `git rm` **静默失败**（ASCII 名成功、中文名失败）——041 因此 106 预测只摘 96。改为 `-z` ＋ `core.quotepath=false`，且**经临时文件中转**（bash 变量装不下 NUL 字节，`$(...)` 会把多文件黏成一条）。
- HANDOFF §79 记录两个真 bug 根因与修法。

**影响谁**：所有已执行公开仓清理的项目。

**怎么验**：19 仓线上按忽略清单精确复核，ORCA 脚手架残留 **0**；应用文件与本项目记录全保留。

---

## 2026-10-09 `02020ee` feat(governance): 公开作品仓不带 ORCA 三件套 ＋ docs/plan 后续开发计划落盘位

**为什么**：ORCA 铺包后脚手架摊在项目根，作品推公开仓后克隆者看到一堆无关治理文件；而用户一天推十几次，任何「推送前打包/解包」都不可接受。

**改了什么**
- **公开仓不带 ORCA**（三件套，母版 `scripts/`，母版专用不分发）：
  - `orca-public-ignore.txt` — 忽略清单**单一真源**（A1 边界＝只隐藏「每个项目都一样」的通用脚手架；本项目计划/评审/交接/账本/经验保留作云备份；应用 `README.md` 绝不被藏）。
  - `orca-gitignore.sh` — 幂等注入托管忽略块＋`--untrack` 摘除已提交 ORCA（本地文件不动）；**绝不自动 commit/push**。
  - `restore-framework.sh` — clone 回来一句补回框架，**硬拒覆盖**应用 README/真实账本/实例文档/经验；重建 `USER_MODEL_OVERRIDE.md` 软链。
- 文档：母版 README 新增「公开仓怎么不带 ORCA、丢了怎么恢复」节；迁移提示词加 5.9（仅公开仓跑）；归位表加勾选行；对外概览加规范行＋审查第 11 条。
- **`docs/plan/` 后续开发计划落盘位**（§78）：新增 `docs/plan/后续开发计划.template.md`，接入 `_sync-packages`/`check-sync`/`AGENTS`/归位表/README/planner 卡。

**怎么验**：`SYNC-OK`｜`CHANNEL-OK`｜`17/17`｜19 个公开仓线上复核残留 0。

---

## 2026-10-09 `48349dd` fix(governance): 第三轮审查整改 ＋ 修「改名即可绕过真源检查」旁路

- 3×P0（planner 沙箱口径互斥、supervisor DISPATCH 校验块死代码、双审「并行」与串行规则冲突）＋多次 P1／P2。
- `checkAppBaseline` 由 basename 包含改为**精确路径匹配**，新增 `APP-TRUEOUT-SOURCE-UNRESOLVED`／`APP-TRUEOUT-SOURCE-MISMATCH`，不再默认放行。
- 关键词门放宽为中英双语等价（修「合规中文写法被误判 FAIL」）。

---

## 2026-10-08 `a458197` feat(governance): APP 品牌资产前置必选 ＋ Phase1 拟稿分工调整

- 新增 `docs/sop/app-brand-assets.md`（中文名／英文名／安卓图标／启动画面），BRAND Freeze 成为 design-freeze 第七项语义；`check-ledger` 增 `APP-BRAND-ASSETS-MISSING`／`APP-BRAND-AC-INCOMPLETE`。
- Phase1 拟稿与改稿归 builder，planner 只把关审查不执笔（省 Sol 额度）。

---

## 2026-10-08 `b6b7e20` / `337ab8b` fix(governance): 第二轮、第一轮全量体系审查整改

- 第二轮 2×P0 + 5×P1 + 8×P2；第一轮 3×P0 + 7×P1（含脚本侧）。

---

## 2026-10-08 `d31aacb` feat(app): APP 基础能力前置规范 V1.1（主题三态＋中英双语，全局默认）

- 新增 `docs/sop/app-theme-i18n.md`：主题 `LIGHT`/`DARK`/`SYSTEM`（默认 SYSTEM）＋ `zh-CN`/`en`＋设置持久化＋切换不丢状态，**新 APP 自动继承不反复问用户**；六类进关键 AC 集合。

---

## 2026-10-07 `67722f4` feat(governance): Episode 记账硬约束 ＋ 产品验收落盘 ＋ 多模型产品审查链

- 新增 `docs/qa/产品验收追踪矩阵.template.md`（7 列）与 `docs/model/TASK-MANAGER-QUALIFICATION-EVENTS.jsonl`；编排者每轮收工自记一行 Episode。
- 新增产品审查双审链（planner 组织，**串行**派 A/B 两份互不可见审查）。

---

## 更早的变更

2026-09-11 之前的变更（含两阶段治理成型、角色扩到 9+1+1、三道门禁建立）未逐条回填，以 Git 历史为准：
`git log --oneline`（共 77 次提交）。需要补全时用
`git log --date=short --pretty="%ad %h %s"` 自 2026-09-11 往前读。