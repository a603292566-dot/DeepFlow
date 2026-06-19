export const INVESTMENT_MODULE_ID = "investment";

export const INVESTMENT_TRACKS = [
  {
    id: "beginner",
    label: "投资入门",
    subtitle: "我想先搞懂股票、基金、ETF 和风险收益这些基础概念。",
    coveredLevels: ["L0", "L1"]
  },
  {
    id: "market_logic",
    label: "理解市场涨跌",
    subtitle: "我想理解股票、基金为什么涨跌，以及利率、政策、情绪、资金会怎样影响市场。",
    coveredLevels: ["L2", "L3"]
  },
  {
    id: "company_decision",
    label: "看懂公司与投资决策",
    subtitle: "我想学习财报、估值、公司基本面，并逐步形成自己的投资判断框架。",
    coveredLevels: ["L4", "L5", "L6"]
  }
];

export const INVESTMENT_LEVELS = [
  {
    id: "L0",
    label: "L0 完全小白",
    publicLabel: "投资入门",
    summary: "适合先建立股票、基金、ETF、风险和收益这些基础概念。",
    coreAbilities: ["知道股票、基金、债券、ETF 是什么", "知道投资不是稳赚", "知道收益和风险通常同时存在"],
    lightStartTopic: "股票、基金、ETF 是什么，以及风险和收益是什么"
  },
  {
    id: "L1",
    label: "L1 市场入门",
    publicLabel: "投资入门",
    summary: "适合从价格为什么波动、买卖力量和市场情绪开始。",
    coreAbilities: ["理解价格会受买卖力量影响", "理解资金流入流出、消息和情绪会影响短期波动", "知道上涨不等于公司一定变好，下跌不等于公司一定变差"],
    lightStartTopic: "为什么价格会涨跌：买卖力量和市场情绪"
  },
  {
    id: "L2",
    label: "L2 涨跌因素理解",
    publicLabel: "市场涨跌理解",
    summary: "适合学习政策、行业景气、市场预期、情绪和资金如何影响价格。",
    coreAbilities: ["理解政策、行业景气、市场预期、情绪和资金会影响价格", "能区分短期波动和长期价值", "初步理解预期对价格的重要性"],
    lightStartTopic: "消息、政策、资金和预期如何影响价格"
  },
  {
    id: "L3",
    label: "L3 资产定价入门",
    publicLabel: "市场涨跌理解",
    summary: "适合学习利率、折现率、风险溢价和估值之间的基本关系。",
    coreAbilities: ["理解利率、折现率、风险溢价和估值的基本关系", "知道利率变化为什么可能影响股票和债券价格", "理解未来现金流和当前价格之间的关系"],
    lightStartTopic: "为什么利率上升可能压低一部分高估值股票"
  },
  {
    id: "L4",
    label: "L4 财报与基本面",
    publicLabel: "财报与估值入门",
    summary: "适合学习三张财务报表，以及收入、利润、现金流之间的区别。",
    coreAbilities: ["理解利润表、资产负债表、现金流量表的基本含义", "知道收入、利润、现金流不完全相同", "理解净利润增长不一定代表经营质量变好"],
    lightStartTopic: "为什么净利润增长不一定代表经营质量变好"
  },
  {
    id: "L5",
    label: "L5 估值与投资决策",
    publicLabel: "财报与估值入门",
    summary: "适合学习好公司、好价格、未来预期和风险补偿之间的关系。",
    coreAbilities: ["理解好公司不一定等于好投资", "理解投资回报还取决于买入价格、未来预期和风险补偿", "初步理解安全边际和投资假设"],
    lightStartTopic: "为什么好公司不一定是好投资"
  },
  {
    id: "L6",
    label: "L6 组合管理与投资系统",
    publicLabel: "投资系统进阶",
    summary: "适合学习仓位、资产配置、相关性、分散和再平衡。",
    coreAbilities: ["理解仓位管理、资产配置、相关性、分散和再平衡", "知道单个判断正确也可能因为仓位过重导致组合风险过高", "开始形成自己的投资决策流程"],
    lightStartTopic: "为什么组合管理要看仓位和相关性"
  }
];

export const INVESTMENT_DIAGNOSTIC_QUESTIONS = {
  beginner: [
    {
      id: "investment_diag_beginner_001",
      question: "如果你买了一只股票，你本质上是在买什么？",
      options: [
        { id: "A", text: "一家公司的一部分所有权，价格会随市场变化", scoreLevel: "L1" },
        { id: "B", text: "一种通常能稳定保本的理财产品", scoreLevel: "L0" },
        { id: "C", text: "一种只要长期持有就一定上涨的资产", scoreLevel: "L0" },
        { id: "D", text: "一份固定利息合同", scoreLevel: "L0" }
      ],
      correctOptionId: "A"
    },
    {
      id: "investment_diag_beginner_002",
      question: "基金和 ETF 更接近以下哪种理解？",
      options: [
        { id: "A", text: "把钱交给一个工具或组合，间接持有一篮子资产", scoreLevel: "L1" },
        { id: "B", text: "收益通常固定、风险很低的存款替代品", scoreLevel: "L0" },
        { id: "C", text: "只会投资一家公司股票的工具", scoreLevel: "L0" },
        { id: "D", text: "不受市场价格波动影响的资产", scoreLevel: "L0" }
      ],
      correctOptionId: "A"
    },
    {
      id: "investment_diag_beginner_003",
      question: "关于风险和收益，哪种说法更稳妥？",
      options: [
        { id: "A", text: "潜在收益越高，通常需要理解和承担更高不确定性", scoreLevel: "L1" },
        { id: "B", text: "高收益产品只要名气大，风险通常可以忽略", scoreLevel: "L0" },
        { id: "C", text: "投资时间越长，就一定不会亏损", scoreLevel: "L0" },
        { id: "D", text: "亏损主要来自运气，不需要提前理解", scoreLevel: "L0" }
      ],
      correctOptionId: "A"
    }
  ],
  market_logic: [
    {
      id: "investment_diag_market_001",
      question: "一家公司发布利好消息后股价上涨，以下哪种解释更合理？",
      options: [
        { id: "A", text: "利好改善了投资者预期，短期买入力量增强", scoreLevel: "L2" },
        { id: "B", text: "只要发布利好，股价通常都会长期上涨", scoreLevel: "L1" },
        { id: "C", text: "股价上涨说明公司利润已经大幅增加", scoreLevel: "L1" },
        { id: "D", text: "市场已经完全准确反映了公司真实价值", scoreLevel: "L2" }
      ],
      correctOptionId: "A"
    },
    {
      id: "investment_diag_market_002",
      question: "为什么同一条消息有时会导致股价下跌？",
      options: [
        { id: "A", text: "市场可能之前预期更高，实际信息低于预期", scoreLevel: "L2" },
        { id: "B", text: "说明这条消息一定是假的", scoreLevel: "L1" },
        { id: "C", text: "说明公司基本面已经确定变差", scoreLevel: "L1" },
        { id: "D", text: "说明资金永远只看短期情绪", scoreLevel: "L2" }
      ],
      correctOptionId: "A"
    },
    {
      id: "investment_diag_market_003",
      question: "为什么利率上升可能影响股票或债券价格？",
      options: [
        { id: "A", text: "未来现金流折现到今天的价值可能变化", scoreLevel: "L3" },
        { id: "B", text: "利率上升会让所有公司利润立刻下降", scoreLevel: "L2" },
        { id: "C", text: "利率变化只影响银行，不影响市场估值", scoreLevel: "L1" },
        { id: "D", text: "资金一定会全部离开股票市场", scoreLevel: "L2" }
      ],
      correctOptionId: "A"
    },
    {
      id: "investment_diag_market_004",
      question: "短期波动和长期价值之间，更合适的理解是？",
      options: [
        { id: "A", text: "短期价格常受情绪和资金影响，长期还需要看基本面和预期兑现", scoreLevel: "L3" },
        { id: "B", text: "短期涨跌已经完全说明长期价值", scoreLevel: "L1" },
        { id: "C", text: "长期价值和价格没有关系", scoreLevel: "L2" },
        { id: "D", text: "长期价值只由公司知名度决定", scoreLevel: "L1" }
      ],
      correctOptionId: "A"
    }
  ],
  company_decision: [
    {
      id: "investment_diag_company_001",
      question: "为什么净利润增长不一定代表经营质量变好？",
      options: [
        { id: "A", text: "净利润可能受到一次性收益、会计处理或现金流质量影响", scoreLevel: "L4" },
        { id: "B", text: "判断公司质量时，收入增长永远比净利润更重要", scoreLevel: "L3" },
        { id: "C", text: "现金流没有同步增长时，净利润增长一定没有价值", scoreLevel: "L4" },
        { id: "D", text: "公司质量主要由股价表现决定", scoreLevel: "L3" }
      ],
      correctOptionId: "A"
    },
    {
      id: "investment_diag_company_002",
      question: "为什么好公司不一定等于好投资？",
      options: [
        { id: "A", text: "投资回报还取决于买入价格、未来预期和风险补偿", scoreLevel: "L5" },
        { id: "B", text: "好公司估值通常较高，所以更适合长期持有", scoreLevel: "L4" },
        { id: "C", text: "只要公司优秀，买入价格影响不大", scoreLevel: "L3" },
        { id: "D", text: "投资中最重要的是公司知名度", scoreLevel: "L3" }
      ],
      correctOptionId: "A"
    },
    {
      id: "investment_diag_company_003",
      question: "资产配置和仓位管理主要帮助投资者理解什么？",
      options: [
        { id: "A", text: "单个判断正确，也可能因仓位过重或资产同涨同跌导致整体风险过高", scoreLevel: "L6" },
        { id: "B", text: "分散到足够多资产就基本不会亏损", scoreLevel: "L4" },
        { id: "C", text: "仓位管理主要适合短线交易", scoreLevel: "L5" },
        { id: "D", text: "相关性越高，组合越容易稳定收益", scoreLevel: "L4" }
      ],
      correctOptionId: "A"
    },
    {
      id: "investment_diag_company_004",
      question: "如果你要判断一家公司的投资价值，哪个顺序更稳妥？",
      options: [
        { id: "A", text: "理解业务和财务质量，再结合价格、预期和风险补偿", scoreLevel: "L5" },
        { id: "B", text: "先看股价最近涨得多不多，再判断公司好不好", scoreLevel: "L3" },
        { id: "C", text: "只要行业热门，就可以降低对估值的要求", scoreLevel: "L4" },
        { id: "D", text: "只看净利润增长即可", scoreLevel: "L4" }
      ],
      correctOptionId: "A"
    }
  ]
};

export const INVESTMENT_UPGRADE_QUESTIONS = {
  L1: {
    fromLevel: "L1",
    toLevel: "L2",
    question: "一家公司发布了看起来不错的利好消息后，股价当天上涨。以下哪种解释最合理？",
    options: [
      { id: "A", text: "利好消息改善了投资者预期，短期买入力量增强" },
      { id: "B", text: "只要公司发布利好消息，股价通常都会长期上涨" },
      { id: "C", text: "股价上涨说明公司当前利润一定已经大幅增加" },
      { id: "D", text: "股价上涨主要说明市场已经完全准确反映了公司真实价值" }
    ],
    correctOptionId: "A"
  },
  L2: {
    fromLevel: "L2",
    toLevel: "L3",
    question: "为什么利率上升可能会压低一部分高估值股票的价格？",
    options: [
      { id: "A", text: "因为未来现金流折现到今天的价值可能下降" },
      { id: "B", text: "因为利率上升通常会让股票的短期交易量减少" },
      { id: "C", text: "因为高估值股票的公司利润会立刻下降" },
      { id: "D", text: "因为资金一定会全部从股票市场流向银行存款" }
    ],
    correctOptionId: "A"
  },
  L3: {
    fromLevel: "L3",
    toLevel: "L4",
    question: "为什么净利润增长不一定代表公司经营质量变好？",
    options: [
      { id: "A", text: "因为净利润可能受到一次性收益、会计处理或现金流质量影响" },
      { id: "B", text: "因为判断公司质量时，收入增长通常比净利润更重要" },
      { id: "C", text: "因为只要现金流没有同步增长，净利润增长就一定没有价值" },
      { id: "D", text: "因为公司经营质量主要由股价表现决定" }
    ],
    correctOptionId: "A"
  },
  L4: {
    fromLevel: "L4",
    toLevel: "L5",
    question: "为什么“好公司”不一定等于“好投资”？",
    options: [
      { id: "A", text: "因为投资回报还取决于买入价格、未来预期和风险补偿" },
      { id: "B", text: "因为好公司的估值通常较高，所以更适合长期持有" },
      { id: "C", text: "因为只要公司足够优秀，买入价格对长期收益影响不大" },
      { id: "D", text: "因为投资中最重要的是公司知名度和行业地位" }
    ],
    correctOptionId: "A"
  },
  L5: {
    fromLevel: "L5",
    toLevel: "L6",
    question: "为什么组合管理中需要关注仓位和资产相关性？",
    options: [
      { id: "A", text: "因为单个判断正确，也可能因仓位过重或资产同涨同跌而造成整体风险过高" },
      { id: "B", text: "因为只要分散到足够多资产，就可以基本消除亏损风险" },
      { id: "C", text: "因为仓位管理主要用于短线交易，长期投资中影响较小" },
      { id: "D", text: "因为相关性越高，组合越容易形成稳定收益" }
    ],
    correctOptionId: "A"
  }
};

const LEVEL_ORDER = INVESTMENT_LEVELS.map((level) => level.id);

export function investmentTrackById(trackId) {
  return INVESTMENT_TRACKS.find((track) => track.id === trackId);
}

export function investmentLevelById(levelId) {
  return INVESTMENT_LEVELS.find((level) => level.id === levelId);
}

export function investmentDiagnosticQuestions(trackId) {
  return INVESTMENT_DIAGNOSTIC_QUESTIONS[trackId] || [];
}

export function diagnoseInvestmentLevel(trackId, answers = {}) {
  const questions = investmentDiagnosticQuestions(trackId);
  const scores = {};

  for (const question of questions) {
    const selectedOptionId = answers[question.id];
    const option = question.options.find((item) => item.id === selectedOptionId);
    const levelId = option?.scoreLevel || question.options.find((item) => item.id === question.correctOptionId)?.scoreLevel;
    if (levelId) scores[levelId] = (scores[levelId] || 0) + 1;
  }

  const fallbackLevel = investmentTrackById(trackId)?.coveredLevels?.[0] || "L0";
  const ranked = Object.entries(scores).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return LEVEL_ORDER.indexOf(b[0]) - LEVEL_ORDER.indexOf(a[0]);
  });
  const currentLevelId = ranked[0]?.[0] || fallbackLevel;
  const level = investmentLevelById(currentLevelId) || investmentLevelById(fallbackLevel);
  const correctCount = questions.filter((question) => answers[question.id] === question.correctOptionId).length;

  return {
    trackId,
    currentLevelId: level.id,
    publicLabel: level.publicLabel,
    summary: level.summary,
    correctCount,
    totalQuestions: questions.length,
    answeredAt: new Date().toISOString()
  };
}

export function investmentTopicForMode(levelId, mode) {
  const level = investmentLevelById(levelId) || INVESTMENT_LEVELS[0];
  if (mode === "standard") return `复习「${level.lightStartTopic}」，再加入一个相邻概念和结构化解释`;
  if (mode === "deep") return `围绕「${level.lightStartTopic}」做非荐股案例分析和判断框架训练`;
  return level.lightStartTopic;
}

export function shouldOfferInvestmentUpgradeQuestion({ sessions = [], currentLevelId, latestSession = null }) {
  if (!currentLevelId || currentLevelId === "L0" || currentLevelId === "L6") return false;
  if (latestSession && ["standard", "deep"].includes(latestSession.mode)) return true;
  const completedAtLevel = sessions.filter(
    (session) =>
      session.learningModuleId === INVESTMENT_MODULE_ID &&
      session.currentInvestmentLevel === currentLevelId &&
      session.status === "completed"
  );
  return completedAtLevel.length >= 2;
}

export function investmentUpgradeQuestionForLevel(levelId) {
  return INVESTMENT_UPGRADE_QUESTIONS[levelId] || null;
}

export function evaluateInvestmentUpgradeAnswer(levelId, optionId) {
  const question = investmentUpgradeQuestionForLevel(levelId);
  const isCorrect = Boolean(question && optionId === question.correctOptionId);
  return {
    fromLevel: question?.fromLevel || levelId,
    toLevel: question?.toLevel || null,
    selectedOptionId: optionId,
    correctOptionId: question?.correctOptionId || null,
    isCorrect,
    message: isCorrect
      ? "你已经具备进入下一阶段的基础。是否进入下一阶段学习？"
      : "当前阶段的核心概念正在建立，建议继续巩固一次，再进入下一阶段。"
  };
}
