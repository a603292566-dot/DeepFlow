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
  light_start: "8 分钟",
  standard: "25 分钟",
  deep: "40 分钟以上",
  restart: "8 分钟"
};

export const LEARNING_MODULES = [
  { id: "language", label: "语言学习" },
  { id: "programming", label: "编程学习" },
  { id: "math", label: "数学学习" },
  { id: "investment", label: "投资学习" }
];

export const MODULE_SUBJECTS = {
  language: [
    { id: "german", label: "德语", targetLanguage: "德语" },
    { id: "english", label: "英语", targetLanguage: "英语" }
  ],
  programming: [
    { id: "ai_coding", label: "AI 辅助编程" },
    { id: "programming_basics", label: "编程基础" }
  ],
  math: [
    { id: "math_basics", label: "数学基础" },
    { id: "high_school_math", label: "高中数学" },
    { id: "college_math", label: "大学数学" }
  ],
  investment: [
    { id: "investment_knowledge", label: "投资知识学习" }
  ]
};

export const MODULE_LEVELS = {
  language: [
    { id: "language_a1", label: "A1 / 零基础", zeroBase: true },
    { id: "language_a2", label: "A2" },
    { id: "language_b1", label: "B1" },
    { id: "language_b2", label: "B2" },
    { id: "language_c1", label: "C1" },
    { id: "language_c2", label: "C2" },
    { id: "language_exam", label: "考试导向" }
  ],
  programming: [
    { id: "programming_l0", label: "L0 纯零基础", zeroBase: true },
    { id: "programming_l1", label: "L1 能看懂简单代码" },
    { id: "programming_l2", label: "L2 能改写小函数" },
    { id: "programming_l3", label: "L3 能做小功能" },
    { id: "programming_l4", label: "L4 能做完整小项目" },
    { id: "programming_l5", label: "L5 能设计系统" }
  ],
  math: [
    { id: "math_m0", label: "M0 零基础", zeroBase: true },
    { id: "math_m1", label: "M1 初中基础" },
    { id: "math_m2", label: "M2 高中基础" },
    { id: "math_m3", label: "M3 大学基础" },
    { id: "math_m4", label: "M4 专业进阶" }
  ],
  investment: [
    { id: "investment_l0", label: "L0 完全小白", zeroBase: true },
    { id: "investment_l1", label: "L1 市场入门" },
    { id: "investment_l2", label: "L2 涨跌因素理解" },
    { id: "investment_l3", label: "L3 资产定价入门" },
    { id: "investment_l4", label: "L4 财报与基本面" },
    { id: "investment_l5", label: "L5 估值与投资决策" },
    { id: "investment_l6", label: "L6 组合管理与投资系统" }
  ]
};

export const MODULE_GOALS = {
  language: [
    { id: "language_reading", label: "阅读理解" },
    { id: "language_vocabulary", label: "词汇积累" },
    { id: "language_structured_output", label: "结构化输出" },
    { id: "language_writing", label: "写作训练" },
    { id: "language_speaking", label: "口语准备" },
    { id: "language_grammar", label: "语法训练" },
    { id: "language_exam_training", label: "考试训练" }
  ],
  programming: [
    { id: "programming_logic", label: "理解代码逻辑" },
    { id: "programming_concepts", label: "学习基础概念" },
    { id: "programming_ai_assisted", label: "AI 辅助编程" },
    { id: "programming_debug", label: "Debug 训练" },
    { id: "programming_project", label: "项目实践" },
    { id: "programming_algorithm", label: "算法理解" }
  ],
  math: [
    { id: "math_concept", label: "概念理解" },
    { id: "math_formula", label: "公式推导" },
    { id: "math_practice", label: "习题训练" },
    { id: "math_error_review", label: "错题分析" },
    { id: "math_application", label: "应用训练" }
  ],
  investment: [
    { id: "investment_beginner", label: "投资入门" },
    { id: "investment_market_logic", label: "理解市场涨跌" },
    { id: "investment_company_decision", label: "看懂公司与投资决策" }
  ]
};

export const LANGUAGE_TARGETS = [
  {
    id: "german_intro",
    subjectId: "german",
    levelId: "language_a1",
    label: "德语入门",
    subtitle: "从零基础开始，建立最小启动感。",
    targetLanguage: "德语",
    targetLevel: "A1 / 零基础",
    examGoal: "德语入门启动：发音、常用表达和基础句型"
  },
  {
    id: "german_telc_b1",
    subjectId: "german",
    levelId: "language_b1",
    label: "telc B1",
    subtitle: "围绕 B1 高频表达和考试任务建立稳定输出。",
    targetLanguage: "德语",
    targetLevel: "B1",
    examGoal: "telc B1 备考：阅读、语块、写作和口语准备"
  },
  {
    id: "german_telc_b2",
    subjectId: "german",
    levelId: "language_b2",
    label: "telc B2",
    subtitle: "提升 B2 表达、理解和考试任务处理能力。",
    targetLanguage: "德语",
    targetLevel: "B2",
    examGoal: "telc B2 备考：Sprachbausteine、阅读、写作和口语结构"
  },
  {
    id: "german_telc_c1",
    subjectId: "german",
    levelId: "language_c1",
    label: "telc C1",
    subtitle: "面向 B2+ 到 C1 的结构化表达和考试训练。",
    targetLanguage: "德语",
    targetLevel: "C1",
    examGoal: "telc B2-C1 备考：Sprachbausteine、结构化输出和论证表达"
  },
  {
    id: "english_intro",
    subjectId: "english",
    levelId: "language_a1",
    label: "英语入门",
    subtitle: "从零基础开始，建立最小启动感。",
    targetLanguage: "英语",
    targetLevel: "A1 / 零基础",
    examGoal: "英语入门启动：常用表达、基础句型和简单输出"
  },
  {
    id: "english_b1",
    subjectId: "english",
    levelId: "language_b1",
    label: "英语 B1",
    subtitle: "建立日常理解和基础表达稳定性。",
    targetLanguage: "英语",
    targetLevel: "B1",
    examGoal: "英语 B1：日常阅读、核心表达和短输出"
  },
  {
    id: "english_b2",
    subjectId: "english",
    levelId: "language_b2",
    label: "英语 B2",
    subtitle: "提升阅读理解和结构化表达。",
    targetLanguage: "英语",
    targetLevel: "B2",
    examGoal: "英语 B2：实用表达、阅读理解和结构化输出"
  },
  {
    id: "english_c1",
    subjectId: "english",
    levelId: "language_c1",
    label: "英语 C1",
    subtitle: "训练更稳定的高级表达和论证能力。",
    targetLanguage: "英语",
    targetLevel: "C1",
    examGoal: "英语 C1：结构化表达、论证和表达升级"
  }
];

export const LANGUAGE_MODULE_PLANS = {
  light_start: {
    modules: ["Sprachbausteine / 语块积累", "复习旧表达", "小填空", "一句话输出"],
    avoid: ["完整阅读任务", "长作文", "完整模拟考试"],
    taskShape: "复习 3 个表达，完成 1 个小填空和 1 个造句，最后给简短反馈。"
  },
  standard: {
    modules: ["Sprachbausteine 复习", "短阅读", "表达提取", "结构化输出", "简短纠错"],
    avoid: ["完整模拟考试", "过长自由写作"],
    taskShape: "用短阅读承载表达提取，再完成一个结构化小输出。"
  },
  deep: {
    modules: ["复习队列", "较长阅读", "论证结构分析", "结构化输出", "表达升级", "知识迁移"],
    avoid: ["无反馈刷题", "只有输入没有输出"],
    taskShape: "围绕一段较长材料完成结构分析、表达升级和迁移输出。"
  },
  restart: {
    modules: ["熟悉表达复习", "极低负荷任务", "一句话输出", "Restart Evidence"],
    avoid: ["补偿中断", "长任务", "大量纠错"],
    taskShape: "只复习熟悉表达并要求一句话输出，完成后记录 Restart Evidence。"
  }
};

export const SPECIAL_GOALS_BY_PATH = {
  "programming:ai_coding:programming_l0": [
    {
      id: "programming_l0_code_literacy",
      label: "认识代码",
      subtitle: "理解代码和基础术语。",
      description: "理解代码是什么，以及 HTML、CSS、JavaScript、function、const、render、state 等基础术语。"
    },
    {
      id: "programming_l0_feature_literacy",
      label: "学习功能",
      subtitle: "把想法拆成页面、按钮、数据和流程。",
      description: "理解一个产品功能是如何从用户需求变成页面、按钮、数据和流程的。"
    },
    {
      id: "programming_l0_github_codex",
      label: "学习 GitHub / Codex",
      subtitle: "看懂项目推进中的提交、推送和部署。",
      description: "理解 GitHub Desktop、Codex、Add、Commit、Push、main、Deploy 等项目推进术语和基础操作。"
    }
  ]
};

export const ENERGY_OPTIONS = [
  { id: "low", label: "能量较低" },
  { id: "medium", label: "能量正常" },
  { id: "high", label: "能量较好" }
];

export const FATIGUE_OPTIONS = [
  { id: "low", label: "疲劳较低" },
  { id: "medium", label: "有些疲劳" },
  { id: "high", label: "疲劳较高" }
];

export const FOCUS_OPTIONS = [
  { id: "low", label: "需要慢启动" },
  { id: "medium", label: "可以专注" },
  { id: "high", label: "专注较好" }
];

export const MOTIVATION_OPTIONS = [
  { id: "restart", label: "先恢复状态" },
  { id: "steady", label: "稳定推进" },
  { id: "challenge", label: "想挑战一点" }
];

export const STATUS_OPTIONS = [
  {
    id: "good",
    label: "状态不错",
    subtitle: "我现在有精力，可以进入标准学习。",
    notice: "系统将为你生成一次标准学习任务，预计 20-30 分钟。",
    trainingMode: "standard",
    plannedDuration: MODE_DURATION.standard,
    energyLevel: 8,
    fatigueLevel: 2,
    focusLevel: 7,
    motivationLevel: 6
  },
  {
    id: "tired",
    label: "有点疲劳",
    subtitle: "我想先用低负荷方式开始。",
    notice: "系统将为你生成一次轻启动任务，先完成 5-10 分钟即可。",
    trainingMode: "light_start",
    plannedDuration: MODE_DURATION.light_start,
    energyLevel: 5,
    fatigueLevel: 6,
    focusLevel: 5,
    motivationLevel: 6
  },
  {
    id: "very_tired",
    label: "很疲劳",
    subtitle: "我只想完成一个很轻的小任务。",
    notice: "系统将为你生成一个最低负荷任务，只需要完成一个小步骤。",
    trainingMode: "light_start",
    plannedDuration: MODE_DURATION.light_start,
    energyLevel: 3,
    fatigueLevel: 8,
    focusLevel: 3,
    motivationLevel: 6
  }
];

export const PROGRAMMING_LEVEL_EVIDENCE = {
  programming_l0: {
    label: "L0 纯零基础",
    nextLevel: "programming_l1",
    nextLevelLabel: "L1 能看懂简单代码",
    requiredCount: 3,
    coreAbilities: [
      "认识代码、功能和项目推进的基础术语",
      "用自然语言描述一段简单代码或一个功能流程",
      "理解 GitHub / Codex 项目推进中的基础操作"
    ],
    requiredEvidence: [
      { id: "understands_html_css_js_roles", label: "能解释 HTML / CSS / JavaScript 各自负责什么" },
      { id: "describes_short_code_naturally", label: "能用自然语言说明 3-5 行代码大概在做什么" },
      { id: "understands_basic_code_terms", label: "能理解 function、state、button 等基础词" },
      { id: "describes_feature_in_page_button_data_flow", label: "能把一个功能说成页面、按钮、数据和流程" },
      { id: "understands_github_desktop_flow", label: "能看懂 GitHub Desktop 的 Add / Commit / Push 基本流程" }
    ]
  },
  programming_l1: {
    label: "L1 能看懂简单代码",
    nextLevel: "programming_l2",
    nextLevelLabel: "L2 能改写小函数",
    requiredCount: 3,
    coreAbilities: [
      "读懂小段代码和基础页面结构",
      "识别变量、函数、组件和简单事件流程",
      "在 AI 解释后说出报错的大意"
    ],
    requiredEvidence: [
      { id: "explains_code_line_by_line", label: "能逐行解释一小段代码" },
      { id: "identifies_variable_function_component", label: "能识别变量、函数、组件的大致作用" },
      { id: "understands_button_click_flow", label: "能说出按钮点击后页面发生了什么" },
      { id: "understands_simple_error_message", label: "能理解一个简单报错的大意" }
    ]
  },
  programming_l2: {
    label: "L2 能改写小函数",
    nextLevel: "programming_l3",
    nextLevelLabel: "L3 能做小功能",
    requiredCount: 3,
    coreAbilities: [
      "在 AI 帮助下完成局部代码修改",
      "验证修改结果是否符合预期",
      "用自然语言说明自己改了哪里、为什么这样改"
    ],
    requiredEvidence: [
      { id: "edits_ui_copy_with_ai", label: "能在 AI 帮助下修改页面文案或按钮文字" },
      { id: "changes_simple_logic_with_ai", label: "能在 AI 帮助下修改一个简单判断逻辑" },
      { id: "verifies_change_result", label: "能检查修改结果是否符合预期" },
      { id: "explains_what_changed", label: "能说明本次改动影响了哪里" }
    ]
  },
  programming_l3: {
    label: "L3 能做小功能",
    nextLevel: "programming_l4",
    nextLevelLabel: "L4 能做完整小项目",
    requiredCount: 3,
    coreAbilities: [
      "把一个小功能拆成页面、按钮、数据和流程",
      "写出清晰的 Codex 开发任务",
      "在 AI 帮助下完成端到端小功能"
    ],
    requiredEvidence: [
      { id: "breaks_feature_into_page_button_data_flow", label: "能把功能拆成页面、按钮、数据和流程" },
      { id: "writes_clear_codex_task", label: "能写出清晰的 Codex 开发任务" },
      { id: "completes_small_feature_with_ai", label: "能在 AI 帮助下完成一个小功能" },
      { id: "reads_changed_files_summary", label: "能看懂 AI 修改了哪些文件" }
    ]
  },
  programming_l4: {
    label: "L4 能做完整小项目",
    nextLevel: "programming_l5",
    nextLevelLabel: "L5 能设计系统",
    requiredCount: 3,
    coreAbilities: [
      "维护一个 MVP 功能模块",
      "看懂构建、部署、提交和回滚的基本流程",
      "评审 AI 实现方案并控制迭代范围"
    ],
    requiredEvidence: [
      { id: "maintains_mvp_module", label: "能维护一个 MVP 功能模块" },
      { id: "reviews_ai_implementation", label: "能评审 AI 的实现方案" },
      { id: "handles_build_deploy_flow", label: "能完成构建、部署和提交流程" },
      { id: "scopes_iteration_safely", label: "能判断哪些改动属于当前迭代范围" }
    ]
  },
  programming_l5: {
    label: "L5 能设计系统",
    nextLevel: null,
    nextLevelLabel: "持续深化",
    requiredCount: 3,
    coreAbilities: [
      "设计模块边界和数据结构",
      "拆分复杂需求为可执行迭代",
      "制定验收标准并评审实现质量"
    ],
    requiredEvidence: [
      { id: "designs_module_architecture", label: "能设计一个模块的结构和边界" },
      { id: "plans_data_model", label: "能规划基础数据结构" },
      { id: "reviews_system_tradeoffs", label: "能评审实现方案的取舍" },
      { id: "defines_iteration_acceptance", label: "能制定迭代验收标准" }
    ]
  }
};

export const PROGRAMMING_GOAL_EVIDENCE_MAP = {
  programming_l0_code_literacy: [
    "understands_html_css_js_roles",
    "describes_short_code_naturally",
    "understands_basic_code_terms"
  ],
  programming_l0_feature_literacy: [
    "describes_feature_in_page_button_data_flow",
    "understands_basic_code_terms"
  ],
  programming_l0_github_codex: [
    "understands_github_desktop_flow"
  ],
  programming_logic: [
    "explains_code_line_by_line",
    "understands_button_click_flow"
  ],
  programming_concepts: [
    "identifies_variable_function_component",
    "understands_basic_code_terms"
  ],
  programming_ai_assisted: [
    "writes_clear_codex_task",
    "reads_changed_files_summary"
  ],
  programming_debug: [
    "understands_simple_error_message",
    "verifies_change_result"
  ],
  programming_project: [
    "breaks_feature_into_page_button_data_flow",
    "completes_small_feature_with_ai",
    "maintains_mvp_module"
  ],
  programming_algorithm: [
    "explains_code_line_by_line",
    "reviews_system_tradeoffs"
  ]
};

// Compatibility aliases for older local records and older helper code.
export const LEARNING_CATEGORIES = LEARNING_MODULES;

export const LEARNING_SUBJECTS = Object.entries(MODULE_SUBJECTS).flatMap(([moduleId, subjects]) =>
  subjects.map((subject) => ({ ...subject, category: moduleId }))
);

export const CURRENT_LEVELS = Object.fromEntries(
  LEARNING_SUBJECTS.map((subject) => [subject.id, MODULE_LEVELS[subject.category]])
);

export const GOAL_BRANCHES = {
  ...MODULE_GOALS,
  ...Object.fromEntries(LEARNING_SUBJECTS.map((subject) => [subject.id, MODULE_GOALS[subject.category]]))
};

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
  model_built: 120,
  investment_level_diagnosed: 50,
  investment_light_start_completed: 30,
  investment_concept_understood: 40,
  investment_structured_explanation_completed: 60,
  investment_upgrade_question_answered: 80,
  investment_level_up_recommended: 120,
  investment_case_analysis_completed: 100,
  investment_risk_awareness_completed: 40
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
