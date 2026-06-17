# Questionnaire and Scoring Logic V1

本文件专门定义 DeepFlow 学习者身份问卷、评分逻辑与身份判定逻辑。

## 1. 问卷目标

问卷用于创建用户的学习者角色。

问卷必须在首次进入 DeepFlow 时出现。用户完成问卷后，系统生成身份、角色卡和初始经验加成方向。

## 2. 参数维度

DeepFlow 使用八项学习参数：

1. explorationDrive：探索驱动力
2. executionStability：执行稳定性
3. systemBuilding：系统建构能力
4. principleThinking：原理思维倾向
5. growthBelief：成长信念
6. emotionalStability：情绪稳定性
7. learnerIdentity：学习者认同
8. knowledgeConnection：知识连接能力

## 3. 题目结构

每个维度 5 道题，共 40 道题。

每题 1–5 分。

MVP 阶段全部使用正向计分，reverseScored = false。

## 4. 评分公式

每个参数原始分范围：5–25。

转换到 0–100：

```ts
function convertTo100(rawScore: number): number {
  return Math.round(((rawScore - 5) / 20) * 100)
}
```

## 5. 参数分组

```ts
const DIMENSION_ITEMS = {
  explorationDrive: ["Q1", "Q2", "Q3", "Q4", "Q5"],
  executionStability: ["Q6", "Q7", "Q8", "Q9", "Q10"],
  systemBuilding: ["Q11", "Q12", "Q13", "Q14", "Q15"],
  principleThinking: ["Q16", "Q17", "Q18", "Q19", "Q20"],
  growthBelief: ["Q21", "Q22", "Q23", "Q24", "Q25"],
  emotionalStability: ["Q26", "Q27", "Q28", "Q29", "Q30"],
  learnerIdentity: ["Q31", "Q32", "Q33", "Q34", "Q35"],
  knowledgeConnection: ["Q36", "Q37", "Q38", "Q39", "Q40"]
}
```

## 6. 身份判定分数

身份判定可使用简单打分。

```ts
type IdentityScore = Record<LearnerIdentityType, number>
```

建议计算：

```ts
scholarScore = principleThinking * 0.4 + knowledgeConnection * 0.35 + explorationDrive * 0.25
explorerScore = explorationDrive * 0.45 + knowledgeConnection * 0.3 + growthBelief * 0.25
builderScore = systemBuilding * 0.45 + principleThinking * 0.3 + knowledgeConnection * 0.25
doerScore = executionStability * 0.45 + learnerIdentity * 0.3 + growthBelief * 0.25
travelerScore = (100 - learnerIdentity) * 0.35 + (100 - executionStability) * 0.35 + growthBelief * 0.3
masterScore = averageTopSixParameters if executionStability >= 70 and learnerIdentity >= 70 else 0
```

主身份取最高分。

副身份取第二高分。

注意：traveler 不应被呈现为负面身份。它表示学习者身份正在形成。

## 7. 成长语言映射

参数前台展示不直接使用低分。

分数映射：

- 0–20：刚刚启航
- 20–40：正在建立
- 40–60：持续成长中
- 60–80：优势逐渐形成
- 80–100：核心优势

示例：

- executionStability = 36 → 执行稳定性正在建立
- learnerIdentity = 40 → 学习者身份持续成长中
- principleThinking = 84 → 原理思维是核心优势

## 8. 初始角色卡

用户完成问卷后：

- 等级：Lv.1
- 当前 EXP：0
- 升级需求：500
- 可选：问卷完成 +50 EXP，身份创建 +50 EXP

如果给初始奖励：

- questionnaire_completed +50 EXP
- identity_created +50 EXP

则初始角色卡可显示 100 / 500 EXP。

## 9. 身份报告生成

身份报告是可选内容，不默认展示。

报告应包括：

- 主身份解释
- 副身份解释
- 核心优势
- 成长空间
- 推荐经验加成行为

报告必须使用成长语言。
