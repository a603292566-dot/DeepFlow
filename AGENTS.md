# AGENTS.md

本文件用于指导 Codex、AI 编码 Agent 和后续产品实现 Agent 如何理解并开发 DeepFlow MVP。

## 1. 产品身份

DeepFlow 是一个 AI 学习启动与成长反馈系统。

用户不一定直接在 DeepFlow 内学习全部内容。DeepFlow 的第一版核心是：

1. 生成学习者身份
2. 生成适配外部 LLM 的学习 Prompt
3. 本地记录学习时间
4. 通过启动阶梯降低启动阻力
5. 将学习行为转化为成长证据
6. 将成长证据转化为 EXP
7. 更新极简角色卡

不要把 DeepFlow 做成普通课程平台、打卡 App 或任务管理器。

## 2. Codex 开发优先级

必须按以下顺序实现：

1. 学习者身份问卷页面
2. 问卷评分逻辑
3. 学习者身份生成逻辑
4. 极简角色卡
5. 学习内容选择页面
6. 学习目标选择页面
7. Prompt 生成引擎
8. 本地计时器
9. 轻启动完成记录
10. 是否继续深化流程
11. EXP 结算逻辑
12. 角色卡更新
13. 可选身份报告页面
14. 学习历史与成长证据记录

不要优先开发复杂社交、课程库、排行榜、动画或大型 Dashboard。

## 3. 用户交互原则

用户默认只做低成本选择。

优先使用按钮：

- 创建你的学习者角色
- 开始学习
- 语言
- 数学
- 编程
- 复制 Prompt
- 开始学习
- 完成轻启动
- 继续学习
- 结束并结算
- 查看身份报告

不要要求用户手动拆解学习任务。

## 4. 用户自主性原则

DeepFlow 不命令用户。

避免使用：

- 你必须完成
- 你的任务是
- 你应该
- 你失败了
- 你断签了
- 你没有坚持

优先使用：

- 已生成轻启动 Prompt
- 你可以开始
- 轻启动已完成
- 是否继续深化？
- 是否结束并记录？
- 已获得成长证据
- 成长记录已恢复

## 5. 问卷必须内置

发布版 MVP 中，问卷是创建学习者角色的必要步骤。问卷不应只作为外部表单存在。

问卷提交后，系统必须自动：

1. 计算八项参数
2. 生成主身份
3. 生成副身份
4. 初始化角色等级
5. 初始化 EXP
6. 初始化经验加成方向

## 6. 问卷评分要求

每道题必须包含：

- id
- text
- dimension
- reverseScored

八项参数：

- explorationDrive
- executionStability
- systemBuilding
- principleThinking
- growthBelief
- emotionalStability
- learnerIdentity
- knowledgeConnection

每个参数 5 道题，用户选择 1–5 分。

原始分范围：5–25。

转换公式：

```ts
score100 = Math.round(((rawScore - 5) / 20) * 100)
```

## 7. 身份生成规则

MVP 阶段使用规则系统，不使用机器学习模型。

### 学者 scholar

倾向条件：

- principleThinking >= 75
- knowledgeConnection >= 75
- explorationDrive >= 65

### 探险家 explorer

倾向条件：

- explorationDrive >= 80
- knowledgeConnection >= 65

### 构筑者 builder

倾向条件：

- systemBuilding >= 75
- principleThinking >= 60

### 实干家 doer

倾向条件：

- executionStability >= 75
- learnerIdentity >= 60

### 旅行者 traveler

倾向条件：

- learnerIdentity < 60
- 或 executionStability < 50
- 且其他维度没有形成明显主导身份

### 大师 master

倾向条件：

- 至少 6 个参数 >= 75
- executionStability >= 70
- learnerIdentity >= 70

如果多个身份同时满足，选择最强身份作为主身份，第二强身份作为副身份。

## 8. Prompt 生成是核心功能

DeepFlow 的 Prompt 不是普通练习题，而是给外部 LLM 的学习教练协议。

每个 Prompt 至少包含：

- 目标学科 / 语言 / 技能
- 用户学习者身份
- 目标等级或目标主题
- 当前模式
- 预计时长
- 任务边界
- 输出要求
- 反馈要求
- DeepFlow 回流格式

Prompt 不应给用户过大的任务。

## 9. 语言学习 Prompt 规则

语言学习必须使用 Language Learning Prompt Engine。

语言学习 Prompt 必须读取：

- targetLanguage
- targetLevel
- examGoal
- preferredModules
- strongModules
- weakModules
- reviewQueue
- unknownExpressions
- recentSessions
- currentState
- sessionMode

语言 Prompt 不只是生成题目，而是生成完整语言学习教练协议。

## 10. 数学 Prompt 规则

数学 Prompt 应适配轻启动。

轻启动只解释一个核心概念，不生成完整课程计划。

例如微积分轻启动：

- 解释一个概念：导数、极限、积分之一
- 给直观类比
- 给一个最小例题
- 让用户回答一个小问题
- 要求外部 LLM 给简短反馈

## 11. 编程 Prompt 规则

编程 Prompt 应避免一开始生成完整项目。

轻启动只训练一个最小概念，例如：变量、函数、循环、组件、状态、API 请求。

要求：

- 短解释
- 一个短代码例子
- 一个微型修改任务
- 简短反馈

## 12. 本地计时规则

用户点击 `开始学习` 时：

1. 创建 LearningSession
2. 保存 startTime
3. 状态设为 active
4. 启动本地计时器

用户点击 `完成轻启动` 时：

1. 保存 endTime
2. 计算 durationMinutes
3. 保存 promptText
4. 生成 GrowthEvidence
5. 计算 EXP
6. 展示是否继续深化

## 13. 继续深化规则

如果用户选择继续：

- light_start → standard
- standard → deep

系统生成下一阶段 Prompt，并开始新的计时或更新 session mode。

如果用户选择结束：

- 结算 EXP
- 更新 RoleCard
- 展示近期 EXP 来源

## 14. 角色卡规则

角色卡默认只展示：

- 身份
- 副身份
- 等级
- EXP
- 经验条
- 距离升级
- 近期 EXP 来源
- 当前经验加成

不要在角色卡中展示长篇解释。

## 15. 成长语言规则

低分参数不直接显示为缺陷。

示例：

- 执行力低 → 执行稳定性正在建立
- 学习者认同低 → 学习者身份正在形成
- 成长信念低 → 成长信念正在重建
- 输出差 → 输出能力处于高成长阶段

## 16. 中断与重启规则

学习中断不应被视为失败。

中断后完成轻启动，应生成 restart_after_interruption 证据。

不要使用断签、失败、落后等语言。

## 17. 代码风格

优先：

- 简单组件
- 清晰枚举
- 明确状态机
- 可维护评分函数
- 可维护 Prompt 模板
- 本地存储优先

避免：

- 过早引入复杂后端
- 过度抽象
- 难以修改的硬编码
- 复杂游戏系统

## 18. MVP 最短闭环

Codex 必须优先跑通以下闭环：

问卷 → 身份 → 角色卡 → 选择内容 → 选择目标 → 生成 Prompt → 开始计时 → 完成轻启动 → EXP 结算 → 更新角色卡
