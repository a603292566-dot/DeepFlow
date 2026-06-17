export const DIMENSIONS = [
  "explorationDrive",
  "executionStability",
  "systemBuilding",
  "principleThinking",
  "growthBelief",
  "emotionalStability",
  "learnerIdentity",
  "knowledgeConnection"
];

export const DIMENSION_LABELS = {
  explorationDrive: "探索驱动力",
  executionStability: "执行稳定性",
  systemBuilding: "系统建构能力",
  principleThinking: "原理思维",
  growthBelief: "成长信念",
  emotionalStability: "情绪稳定性",
  learnerIdentity: "学习者身份",
  knowledgeConnection: "知识连接能力"
};

export const IDENTITY_LABELS = {
  traveler: "旅行者",
  explorer: "探险家",
  scholar: "学者",
  builder: "构筑者",
  doer: "实干家",
  master: "大师"
};

export const IDENTITY_HINTS = {
  traveler: "学习者身份正在形成",
  explorer: "探索驱动型学习者",
  scholar: "原理思维 / 研究型学习者",
  builder: "系统建构型学习者",
  doer: "行动导向型学习者",
  master: "综合型高阶学习者"
};

export const MODE_LABELS = {
  light_start: "轻启动",
  standard: "标准深化",
  deep: "深度学习",
  restart: "重启"
};

export const MODE_DURATION = {
  light_start: "5-10 分钟",
  standard: "20-30 分钟",
  deep: "40 分钟以上",
  restart: "5-10 分钟"
};

export const LEARNING_CATEGORIES = [
  { id: "language", label: "语言" },
  { id: "math", label: "数学" },
  { id: "programming", label: "编程" }
];

export const LEARNING_GOALS = [
  { id: "german_c1", category: "language", label: "德语 C1", targetLanguage: "德语", targetLevel: "C1", examGoal: "C1 稳定表达与考试任务" },
  { id: "german_b2", category: "language", label: "德语 B2", targetLanguage: "德语", targetLevel: "B2", examGoal: "B2 阅读、表达与语法自动化" },
  { id: "english_c1", category: "language", label: "英语 C1", targetLanguage: "英语", targetLevel: "C1", examGoal: "C1 结构化表达" },
  { id: "english_b2", category: "language", label: "英语 B2", targetLanguage: "英语", targetLevel: "B2", examGoal: "B2 实用表达与阅读" },
  { id: "french_intro", category: "language", label: "法语入门", targetLanguage: "法语", targetLevel: "入门", examGoal: "基础表达启动" },
  { id: "calculus", category: "math", label: "微积分" },
  { id: "linear_algebra", category: "math", label: "线性代数" },
  { id: "probability", category: "math", label: "概率论" },
  { id: "statistics_intro", category: "math", label: "统计学基础" },
  { id: "python_intro", category: "programming", label: "Python 入门" },
  { id: "frontend_dev", category: "programming", label: "前端开发" },
  { id: "ai_coding", category: "programming", label: "AI 辅助编程" },
  { id: "product_code_logic", category: "programming", label: "产品代码理解" }
];

export const QUESTIONNAIRE_ITEMS = [
  ["Q1", "我经常主动想了解陌生领域。", "explorationDrive"],
  ["Q2", "遇到新概念时，我会想知道它背后的原理。", "explorationDrive"],
  ["Q3", "我喜欢把学习看成一种探索。", "explorationDrive"],
  ["Q4", "我愿意尝试不熟悉但有价值的主题。", "explorationDrive"],
  ["Q5", "我经常因为好奇而开始学习某个东西。", "explorationDrive"],
  ["Q6", "我能比较稳定地按计划完成学习。", "executionStability"],
  ["Q7", "即使状态一般，我也能完成一个小学习任务。", "executionStability"],
  ["Q8", "我很少因为启动困难而推迟学习。", "executionStability"],
  ["Q9", "我能把学习任务持续推进到结束。", "executionStability"],
  ["Q10", "我能在中断后较快恢复学习。", "executionStability"],
  ["Q11", "我习惯把零散知识整理成结构。", "systemBuilding"],
  ["Q12", "学习新内容时，我会主动建立框架。", "systemBuilding"],
  ["Q13", "我会思考不同知识点之间的层级关系。", "systemBuilding"],
  ["Q14", "我喜欢制作笔记、图谱或知识结构。", "systemBuilding"],
  ["Q15", "我能把复杂内容拆成清晰模块。", "systemBuilding"],
  ["Q16", "我学习时更关心“为什么”而不只是“是什么”。", "principleThinking"],
  ["Q17", "我习惯追问一个现象背后的机制。", "principleThinking"],
  ["Q18", "我喜欢从底层原理理解问题。", "principleThinking"],
  ["Q19", "我会尝试用模型解释现实问题。", "principleThinking"],
  ["Q20", "我不满足于只记住结论。", "principleThinking"],
  ["Q21", "我相信学习能力可以通过训练提升。", "growthBelief"],
  ["Q22", "即使当前水平不高，我也相信可以逐步成长。", "growthBelief"],
  ["Q23", "我认为错误反馈是成长的一部分。", "growthBelief"],
  ["Q24", "我愿意通过小步骤积累能力。", "growthBelief"],
  ["Q25", "我相信持续行动会改变学习状态。", "growthBelief"],
  ["Q26", "学习遇到困难时，我能保持基本稳定。", "emotionalStability"],
  ["Q27", "我不会因为一次失败就否定自己的学习能力。", "emotionalStability"],
  ["Q28", "我能接受学习过程中的波动。", "emotionalStability"],
  ["Q29", "当学习不顺利时，我能重新调整。", "emotionalStability"],
  ["Q30", "我能区分暂时状态和长期能力。", "emotionalStability"],
  ["Q31", "我认为自己是一个正在成长的学习者。", "learnerIdentity"],
  ["Q32", "学习是我身份的一部分。", "learnerIdentity"],
  ["Q33", "我愿意长期建设自己的学习能力。", "learnerIdentity"],
  ["Q34", "我希望自己成为更稳定的学习者。", "learnerIdentity"],
  ["Q35", "当我完成学习时，我会感到自己更接近理想状态。", "learnerIdentity"],
  ["Q36", "我经常把不同领域的知识联系起来。", "knowledgeConnection"],
  ["Q37", "我能从一个领域迁移经验到另一个领域。", "knowledgeConnection"],
  ["Q38", "我喜欢发现概念之间的隐藏联系。", "knowledgeConnection"],
  ["Q39", "我会用一个领域的模型解释另一个领域的问题。", "knowledgeConnection"],
  ["Q40", "我学习时经常产生跨学科联想。", "knowledgeConnection"]
].map(([id, text, dimension]) => ({ id, text, dimension, reverseScored: false }));

export const BASE_EXP = {
  questionnaire_completed: 50,
  identity_created: 50,
  light_start_completed: 30,
  standard_session_completed: 80,
  deep_session_completed: 150,
  restart_after_interruption: 60,
  feedback_completed: 30,
  structured_output_completed: 50,
  vocabulary_practice_completed: 40,
  reading_comprehension_completed: 40,
  concept_explained: 50,
  knowledge_transfer_completed: 80,
  systematization_completed: 90,
  project_progress_completed: 90,
  model_built: 120
};

export const IDENTITY_BONUS = {
  scholar: {
    light_start_completed: 1.5,
    standard_session_completed: 1.5,
    deep_session_completed: 1.3,
    structured_output_completed: 1.8,
    knowledge_transfer_completed: 1.5,
    systematization_completed: 1.5,
    project_progress_completed: 1.5,
    model_built: 1.5
  },
  explorer: {
    light_start_completed: 1.5,
    standard_session_completed: 1.5,
    project_progress_completed: 2,
    knowledge_transfer_completed: 1.5
  },
  traveler: {
    questionnaire_completed: 1.5,
    identity_created: 1.5,
    light_start_completed: 2,
    restart_after_interruption: 2
  },
  builder: {
    systematization_completed: 1.8,
    structured_output_completed: 1.5,
    project_progress_completed: 1.5
  },
  doer: {
    light_start_completed: 1.5,
    standard_session_completed: 1.5,
    concept_explained: 1.8,
    feedback_completed: 1.5
  },
  master: {
    deep_session_completed: 1.3,
    knowledge_transfer_completed: 1.3,
    systematization_completed: 1.3,
    model_built: 1.5
  }
};

export const LEVEL_REQUIREMENTS = {
  1: 500,
  2: 650,
  3: 850,
  4: 1100,
  5: 1400,
  6: 1750,
  7: 2150,
  8: 2600,
  9: 3100,
  10: 3650
};
