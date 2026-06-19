export const INVESTMENT_MODULE_ID = "investment";
export const INVESTMENT_PROGRESSION_THRESHOLD = 3;

export const INVESTMENT_TRACKS = [
  {
    id: "beginner",
    label: "投资入门",
    subtitle: "我想先搞懂股票、基金、ETF 和风险收益这些基础概念。",
    defaultLevel: "L0"
  },
  {
    id: "market_logic",
    label: "理解市场涨跌",
    subtitle: "我想理解股票、基金为什么涨跌，以及利率、政策、情绪、资金会怎样影响市场。",
    defaultLevel: "L2"
  },
  {
    id: "company_decision",
    label: "看懂公司与投资决策",
    subtitle: "我想学习财报、估值、公司基本面，并逐步形成自己的投资判断框架。",
    defaultLevel: "L4"
  }
];

export const INVESTMENT_LEVELS = [
  {
    id: "L0",
    label: "L0 投资基础概念",
    publicLabel: "投资入门",
    summary: "适合先建立股票、基金、ETF、风险和收益这些基础概念。",
    coreAbilities: ["知道股票、基金、债券、ETF 是什么", "知道投资不是稳赚", "知道收益和风险通常同时存在"],
    topics: ["股票、基金、ETF 是什么", "风险和收益是什么", "为什么投资不是稳赚"]
  },
  {
    id: "L1",
    label: "L1 市场入门",
    publicLabel: "市场入门",
    summary: "适合从价格为什么波动、买卖力量和市场情绪开始。",
    coreAbilities: ["理解价格会受买卖力量影响", "理解资金流入流出、消息和情绪会影响短期波动", "知道上涨不等于公司一定变好，下跌不等于公司一定变差"],
    topics: ["为什么价格会涨跌", "买卖力量和市场情绪", "上涨和下跌不等于公司立刻变好或变差"]
  },
  {
    id: "L2",
    label: "L2 涨跌因素理解",
    publicLabel: "市场涨跌理解",
    summary: "适合学习政策、行业景气、市场预期、情绪和资金如何影响价格。",
    coreAbilities: ["理解政策、行业景气、市场预期、情绪和资金会影响价格", "能区分短期波动和长期价值", "初步理解预期对价格的重要性"],
    topics: ["消息、政策、资金和预期如何影响价格", "短期波动和长期价值的区别", "市场预期如何影响价格", "技术分析与市场行为观察：K线、量价和常见指标只能作为辅助观察工具"]
  },
  {
    id: "L3",
    label: "L3 资产定价入门",
    publicLabel: "资产定价入门",
    summary: "适合学习利率、折现率、风险溢价和估值之间的基本关系。",
    coreAbilities: ["理解利率、折现率、风险溢价和估值的基本关系", "知道利率变化为什么可能影响股票和债券价格", "理解未来现金流和当前价格之间的关系"],
    topics: ["为什么利率上升可能压低一部分高估值股票", "未来现金流和当前价格的关系", "风险溢价是什么", "利率、债券价格、债券到期收益率和股票估值的关系边界"]
  },
  {
    id: "L4",
    label: "L4 财报与基本面",
    publicLabel: "财报与基本面",
    summary: "适合学习三张财务报表，以及收入、利润、现金流之间的区别。",
    coreAbilities: ["理解利润表、资产负债表、现金流量表的基本含义", "知道收入、利润、现金流不完全相同", "理解净利润增长不一定代表经营质量变好"],
    topics: ["为什么净利润增长不一定代表经营质量变好", "收入、利润和现金流有什么区别", "三张财务报表分别看什么", "毛利率、净利率、ROE 和盈利质量", "负债、偿债能力和经营现金流"]
  },
  {
    id: "L5",
    label: "L5 估值与投资决策",
    publicLabel: "估值与投资决策",
    summary: "适合学习好公司、好价格、未来预期和风险补偿之间的关系。",
    coreAbilities: ["理解好公司不一定等于好投资", "理解投资回报还取决于买入价格、未来预期和风险补偿", "初步理解安全边际和投资假设"],
    topics: ["为什么好公司不一定是好投资", "安全边际是什么", "投资假设如何影响判断", "估值与财报之间的关系"]
  },
  {
    id: "L6",
    label: "L6 组合管理与投资系统",
    publicLabel: "投资系统进阶",
    summary: "适合学习仓位、资产配置、相关性、分散和再平衡。",
    coreAbilities: ["理解仓位管理、资产配置、相关性、分散和再平衡", "知道单个判断正确也可能因为仓位过重导致组合风险过高", "开始形成自己的投资决策流程"],
    topics: ["为什么组合管理要看仓位和相关性", "仓位过重为什么会放大风险", "再平衡是什么"]
  }
];

const LEVEL_ORDER = INVESTMENT_LEVELS.map((level) => level.id);

export function investmentTrackById(trackId) {
  return INVESTMENT_TRACKS.find((track) => track.id === trackId);
}

export function investmentLevelById(levelId) {
  return INVESTMENT_LEVELS.find((level) => level.id === levelId);
}

export function nextInvestmentLevelId(levelId) {
  const index = LEVEL_ORDER.indexOf(levelId);
  if (index < 0 || index >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[index + 1];
}

export function createInvestmentProfile(trackId, createdAt = new Date().toISOString()) {
  const track = investmentTrackById(trackId) || INVESTMENT_TRACKS[0];
  const level = investmentLevelById(track.defaultLevel) || INVESTMENT_LEVELS[0];
  return {
    hasStarted: true,
    targetTrack: track.id,
    currentLevel: level.id,
    currentLevelLabel: level.label,
    sessionCount: 0,
    currentStageSessionCount: 0,
    lastSessionNumber: 0,
    lastTopic: null,
    reviewQueue: [],
    createdAt,
    updatedAt: createdAt
  };
}

export function nextInvestmentSessionNumber(profile) {
  return (profile?.lastSessionNumber || profile?.sessionCount || 0) + 1;
}

export function formatInvestmentSessionNumber(sessionNumber) {
  return `投资学习 Session ${String(sessionNumber || 1).padStart(3, "0")}`;
}

export function investmentTopicForMode(levelId, mode, profile = null) {
  const level = investmentLevelById(levelId) || INVESTMENT_LEVELS[0];
  const topics = level.topics?.length ? level.topics : [level.summary];
  const index = Math.max(0, profile?.currentStageSessionCount || 0) % topics.length;
  const topic = topics[index];
  if (mode === "standard") return `复习「${topic}」，再加入一个相邻概念和结构化解释`;
  if (mode === "deep") return `围绕「${topic}」做非荐股案例分析和判断框架训练`;
  return topic;
}

export function updateInvestmentProfileAfterSession(profile, { sessionNumber, topic, completedAt = new Date().toISOString() }) {
  if (!profile?.hasStarted) return profile;
  return {
    ...profile,
    sessionCount: (profile.sessionCount || 0) + 1,
    currentStageSessionCount: (profile.currentStageSessionCount || 0) + 1,
    lastSessionNumber: sessionNumber || nextInvestmentSessionNumber(profile),
    lastTopic: topic || profile.lastTopic,
    updatedAt: completedAt
  };
}

export function shouldRecommendInvestmentProgression(profile, threshold = INVESTMENT_PROGRESSION_THRESHOLD) {
  if (!profile?.hasStarted) return false;
  if (!nextInvestmentLevelId(profile.currentLevel)) return false;
  return (profile.currentStageSessionCount || 0) >= threshold;
}

export function investmentProgressionRecommendation(profile) {
  if (!shouldRecommendInvestmentProgression(profile)) return null;
  const nextLevelId = nextInvestmentLevelId(profile.currentLevel);
  const nextLevel = investmentLevelById(nextLevelId);
  return {
    currentLevel: profile.currentLevel,
    nextLevel: nextLevelId,
    nextLevelLabel: nextLevel?.label || "下一阶段",
    nextTopic: nextLevel?.topics?.[0] || nextLevel?.summary || "下一阶段内容"
  };
}

export function progressInvestmentProfile(profile, updatedAt = new Date().toISOString()) {
  const nextLevelId = nextInvestmentLevelId(profile?.currentLevel);
  const nextLevel = investmentLevelById(nextLevelId);
  if (!profile?.hasStarted || !nextLevel) return profile;
  return {
    ...profile,
    currentLevel: nextLevel.id,
    currentLevelLabel: nextLevel.label,
    currentStageSessionCount: 0,
    lastTopic: null,
    updatedAt
  };
}

export function consolidateInvestmentProfile(profile, updatedAt = new Date().toISOString()) {
  if (!profile?.hasStarted) return profile;
  return {
    ...profile,
    updatedAt
  };
}

export function investmentProfileSyncPayload(profile) {
  if (!profile) return {};
  return {
    moduleId: INVESTMENT_MODULE_ID,
    sessionNumber: nextInvestmentSessionNumber(profile),
    targetTrack: profile.targetTrack,
    currentLevel: profile.currentLevel,
    currentStageSessionCount: profile.currentStageSessionCount,
    lastTopic: profile.lastTopic,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
}
