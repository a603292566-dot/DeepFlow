import { IDENTITY_LABELS, LEARNING_GOALS, MODE_DURATION, MODE_LABELS } from "./domain.js";

const MODULE_LABELS = {
  vocabulary_chunks: "语块 / 表达积累",
  reading_comprehension: "阅读理解",
  structured_output: "结构化输出",
  grammar_automation: "语法自动化",
  review: "复习",
  exam_task: "考试题型",
  free_writing: "自由写作"
};

export function defaultLanguageProfile(userId, goal) {
  return {
    userId,
    targetLanguage: goal.targetLanguage,
    targetLevel: goal.targetLevel,
    examGoal: goal.examGoal,
    currentEstimatedLevel: goal.targetLevel === "入门" ? "零基础 / A1 启动" : "比目标等级低半级到一级",
    preferredModules: ["vocabulary_chunks", "structured_output", "review"],
    strongModules: ["review"],
    weakModules: ["structured_output"],
    outputPreference: "structured_first",
    avoidTasks: ["一开始长篇自由写作", "完整模拟考试"],
    reviewQueue: [],
    commonMistakes: [],
    lastUpdatedAt: new Date().toISOString()
  };
}

export function generatePrompt(context) {
  if (context.category === "language") return generateLanguagePrompt(context);
  if (context.category === "math") return generateMathPrompt(context);
  return generateProgrammingPrompt(context);
}

function sharedHeader(context) {
  const main = IDENTITY_LABELS[context.identity.mainIdentity];
  const secondary = IDENTITY_LABELS[context.identity.secondaryIdentity] || "暂无";
  return [
    `我的学习者身份是：${main}。`,
    `我的副身份是：${secondary}。`,
    `当前训练模式：${MODE_LABELS[context.mode]}。`,
    `预计时长：${MODE_DURATION[context.mode]}。`,
    `当前经验加成方向：${context.activeBonusText}。`,
    `请使用成长语言，反馈要简短、具体，不使用失败、落后、断签等表达。`
  ].join("\n");
}

function generateLanguagePrompt(context) {
  const profile = context.languageProfile;
  const reviewQueue = profile.reviewQueue.length
    ? profile.reviewQueue.map((item) => `- ${item.text}`).join("\n")
    : "- 暂无历史复习项，请生成 3 个适合目标等级的高价值表达。";
  const preferredModules = profile.preferredModules.map((module) => MODULE_LABELS[module]).join("、");
  const strongModules = profile.strongModules.map((module) => MODULE_LABELS[module]).join("、");
  const weakModules = profile.weakModules.map((module) => MODULE_LABELS[module]).join("、");
  const recentSessions = context.recentSessions.length
    ? context.recentSessions.map((session) => `- ${session.mode} / ${session.durationMinutes || 0} 分钟`).join("\n")
    : "- 暂无最近学习记录。";

  return `你是我的${profile.targetLanguage}学习教练。

${sharedHeader(context)}

目标语言：${profile.targetLanguage}
目标等级：${profile.targetLevel}
考试 / 长期目标：${profile.examGoal || "稳定完成当前等级的理解与表达"}
当前估计水平：${profile.currentEstimatedLevel}
当前状态：${context.currentState}

我的模块偏好：
- 优先模块：${preferredModules}
- 强模块：${strongModules}
- 弱模块：${weakModules}
- 输出偏好：先给清晰示例，再让我做一个小输出
- 避免任务：${profile.avoidTasks.join("、")}

本次需要复习的内容：
${reviewQueue}

最近学习记录：
${recentSessions}

请根据当前模式生成任务：
- 轻启动：只给一个 5-10 分钟的小任务，不生成完整学习计划，只要求一个小输出。
- 标准深化：给一个 20-30 分钟结构化任务，可以包含短阅读、表达积累和结构化输出。
- 深度学习：给一个 40 分钟以上深度任务，可以包含长阅读、论证分析、知识迁移和完整输出。
- 重启：只给低负荷恢复任务，目标是恢复连续性。

任务边界：
1. 不要一次给太多材料。
2. 如果我回答有偏差，请指出最重要的 1-3 个点。
3. 把未掌握表达列入“需要复习”。
4. 任务完成后输出 DeepFlow 回流格式。

DeepFlow 回流格式：
完成状态：
本次模块：
目标语言：
目标等级：
掌握较好：
需要复习：
未理解内容：
输出难度：
Flow 感：
建议加入复习队列：`;
}

function generateMathPrompt(context) {
  const conceptMap = {
    calculus: "导数、极限、积分中任选一个核心概念",
    linear_algebra: "向量、矩阵乘法、线性变换中任选一个核心概念",
    probability: "随机事件、条件概率、期望中任选一个核心概念",
    statistics_intro: "均值、方差、抽样中任选一个核心概念"
  };
  const coreConcept = conceptMap[context.goal.id] || "一个最小核心概念";

  return `你是我的数学学习教练。

${sharedHeader(context)}

学习目标：${context.goal.label}
目标主题：${coreConcept}

请为我生成一个${MODE_LABELS[context.mode]}任务。

任务边界：
- 如果是轻启动，只解释一个核心概念，不生成完整课程计划。
- 给一个直观类比。
- 给一个最小例题。
- 让我回答一个小问题。
- 我回答后，请给简短反馈和一个可以下次继续的小方向。

输出要求：
1. 核心概念解释
2. 直观类比
3. 最小例题
4. 一个小问题
5. DeepFlow 回流格式

DeepFlow 回流格式：
完成状态：
本次模块：
学习目标：
掌握较好：
需要复习：
未理解内容：
输出难度：
Flow 感：
建议加入复习队列：`;
}

function generateProgrammingPrompt(context) {
  const conceptMap = {
    python_intro: "变量、函数、循环中任选一个最小概念",
    frontend_dev: "组件、状态、事件处理中任选一个最小概念",
    ai_coding: "让 AI 解释代码、改写函数、生成测试中任选一个最小概念",
    product_code_logic: "页面状态、数据流、用户操作路径中任选一个最小概念"
  };
  const coreConcept = conceptMap[context.goal.id] || "一个最小编程概念";

  return `你是我的编程学习教练。

${sharedHeader(context)}

学习目标：${context.goal.label}
本次最小概念：${coreConcept}

请为我生成一个${MODE_LABELS[context.mode]}任务。

任务边界：
- 不要一开始生成完整项目。
- 先给短解释。
- 给一个短代码例子。
- 让我做一个微型修改任务。
- 我回答后给简短反馈，指出一个下一步可继续的小方向。

输出要求：
1. 概念解释
2. 短代码例子
3. 微型修改任务
4. 简短反馈规则
5. DeepFlow 回流格式

DeepFlow 回流格式：
完成状态：
本次模块：
学习目标：
掌握较好：
需要复习：
未理解内容：
输出难度：
Flow 感：
建议加入复习队列：`;
}

export function goalById(goalId) {
  return LEARNING_GOALS.find((goal) => goal.id === goalId);
}
