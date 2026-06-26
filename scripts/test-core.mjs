import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { QUESTIONNAIRE_ITEMS, LEARNING_MODULES, LANGUAGE_TARGETS, MODE_LABELS } from "../src/domain.js";
import { autoLanguageModulePlan, levelById, subjectById } from "../src/learningPath.js";
import {
  addCompletedSessionToCalendar,
  getCalendarStats,
  getRecentLearningDays,
  getSessionsByDate,
  getTodayDateKey
} from "../src/learningCalendar.js";
import { generatePrompt } from "../src/promptEngine.js";
import { applyExp, calculateExp, generateIdentity, scoreQuestionnaire } from "../src/scoring.js";
import {
  createInvestmentProfile,
  formatInvestmentSessionNumber,
  investmentLevelById,
  investmentProgressionRecommendation,
  investmentTrackById,
  INVESTMENT_TRACKS,
  nextInvestmentSessionNumber,
  progressInvestmentProfile,
  shouldRecommendInvestmentProgression,
  updateInvestmentProfileAfterSession
} from "../src/investmentLearning.js";

function testQuestionnaireScoring() {
  const maxAnswers = Object.fromEntries(
    QUESTIONNAIRE_ITEMS.map((item) => [item.id, item.reverseScored ? 1 : 5])
  );
  const result = scoreQuestionnaire(maxAnswers, "user_test");
  const parameterScores = Object.entries(result).filter(([key]) => !["userId", "measuredAt"].includes(key));
  assert.ok(parameterScores.length > 0);
  for (const [, score] of parameterScores) {
    assert.equal(score, 100);
  }
}

function testIdentityGeneration() {
  const identity = generateIdentity(
    {
      explorationDrive: 70,
      executionStability: 65,
      systemBuilding: 60,
      principleThinking: 85,
      growthBelief: 65,
      emotionalStability: 65,
      learnerIdentity: 65,
      knowledgeConnection: 85
    },
    "user_test"
  );
  assert.equal(identity.mainIdentity, "scholar");
  assert.ok(identity.secondaryIdentity);
  assert.equal(identity.level, 1);
}

function testExpCalculation() {
  const exp = calculateExp("light_start_completed", "scholar", 1);
  assert.ok(exp.finalExp > 0);
  const identity = {
    mainIdentity: "scholar",
    secondaryIdentity: "explorer",
    level: 1,
    currentExp: 0,
    totalExp: 0,
    requiredExp: 500
  };
  const updated = applyExp(identity, exp.finalExp);
  assert.equal(updated.totalExp, exp.finalExp);
  assert.equal(updated.currentExp, exp.finalExp);
}

function testPromptGeneration() {
  const languageTarget = LANGUAGE_TARGETS.find((target) => target.id === "german_telc_c1");
  const prompt = generatePrompt({
    user: { id: "user_test" },
    identity: {
      mainIdentity: "scholar",
      secondaryIdentity: "explorer",
      level: 1
    },
    learningModule: LEARNING_MODULES.find((module) => module.id === "language"),
    subject: subjectById("language", languageTarget.subjectId),
    currentLevel: levelById("language", languageTarget.levelId),
    learningGoal: languageTarget,
    goal: languageTarget,
    mode: "light_start",
    trainingModeLabel: MODE_LABELS.light_start,
    plannedDuration: 8,
    currentStatus: "有点疲劳",
    generatedModulePlan: autoLanguageModulePlan("light_start", languageTarget),
    expBonusDirection: "结构化输出"
  });

  assert.ok(prompt.includes("德语学习教练"));
  assert.ok(prompt.includes("目标等级：C1"));
  assert.ok(prompt.includes("本次优先模块：Sprachbausteine / 语块积累"));
  assert.ok(prompt.includes("用户不需要手动选择阅读、词汇或写作模块"));
  assert.ok(prompt.includes("【DeepFlow 回流格式】"));
}

function testInvestmentTracks() {
  assert.equal(INVESTMENT_TRACKS.length, 3);
  assert.equal(investmentTrackById("beginner").label, "投资入门");
  assert.equal(investmentTrackById("market_logic").label, "理解市场涨跌");
  assert.equal(investmentTrackById("company_decision").label, "看懂公司与投资决策");
}

function testInvestmentProfileCreation() {
  const beginner = createInvestmentProfile("beginner", "2026-01-01T00:00:00.000Z");
  const market = createInvestmentProfile("market_logic", "2026-01-01T00:00:00.000Z");
  const company = createInvestmentProfile("company_decision", "2026-01-01T00:00:00.000Z");
  assert.equal(beginner.currentLevel, "L0");
  assert.equal(market.currentLevel, "L2");
  assert.equal(company.currentLevel, "L4");
  assert.equal(nextInvestmentSessionNumber(market), 1);
  assert.equal(formatInvestmentSessionNumber(1), "投资学习 Session 001");
}

function testInvestmentPromptGeneration() {
  const track = investmentTrackById("company_decision");
  const level = investmentLevelById("L5");
  const profile = {
    ...createInvestmentProfile("company_decision", "2026-01-01T00:00:00.000Z"),
    currentLevel: "L5",
    currentLevelLabel: level.label,
    sessionCount: 1,
    currentStageSessionCount: 1,
    lastSessionNumber: 1,
    lastTopic: "为什么好公司不一定是好投资"
  };
  const prompt = generatePrompt({
    user: { id: "user_test" },
    identity: {
      mainIdentity: "scholar",
      secondaryIdentity: "builder",
      level: 1
    },
    learningModule: { id: "investment", label: "投资学习" },
    subject: { id: "investment_knowledge", label: "投资知识学习" },
    currentLevel: { id: "investment_l5", label: level.label },
    learningGoal: track,
    goal: { id: track.id, label: track.label, category: "investment" },
    mode: "light_start",
    plannedDuration: 8,
    currentStatus: "低负荷启动",
    investmentProfile: profile,
    investmentTrack: track,
    investmentLevel: level,
    currentInvestmentLevel: level.id,
    investmentSessionNumber: 2,
    currentStageSessionNumber: 2,
    currentDate: "2026-06-18",
    lastLearningDate: "2026-06-17",
    currentStreak: 3,
    todaySessionCount: 1,
    monthlySessionCount: 5
  });

  assert.ok(prompt.includes("DeepFlow 投资知识学习教练"));
  assert.ok(prompt.includes("投资学习 Session 002"));
  assert.ok(prompt.includes("本次学习日期：2026-06-18"));
  assert.ok(prompt.includes("最近一次学习日期：2026-06-17"));
  assert.ok(prompt.includes("当前连续学习：3 天"));
  assert.ok(prompt.includes("今日已完成学习：1 次"));
  assert.ok(prompt.includes("本月已完成学习：5 次"));
  assert.ok(prompt.includes("当前阶段学习次数：第 2 次"));
  assert.ok(prompt.includes("折现率"));
  assert.ok(prompt.includes("折现系数 / 现值系数"));
  assert.ok(prompt.includes("折现率上升时，折现系数下降"));
  assert.ok(prompt.includes("其他条件不变"));
  assert.ok(prompt.includes("多层解释结构"));
  assert.ok(prompt.includes("凯恩斯选美理论"));
  assert.ok(prompt.includes("行为金融学"));
  assert.ok(prompt.includes("流动性 / 资金流模型"));
  assert.ok(prompt.includes("利润表"));
  assert.ok(prompt.includes("资产负债表"));
  assert.ok(prompt.includes("现金流量表"));
  assert.ok(prompt.includes("毛利率、净利率、ROE"));
  assert.ok(prompt.includes("不提供具体买卖建议"));
  assert.ok(prompt.includes("不推荐个股"));
  assert.ok(prompt.includes("不承诺收益"));
  assert.ok(!prompt.includes("利率下降，债券一定涨"));
  assert.ok(!prompt.includes("利率下降，股票一定涨"));
  assert.ok(!prompt.includes("利率上升，股票一定跌"));
  assert.ok(!prompt.includes("A/B/C/D"));
  assert.ok(!prompt.includes("单选题"));
  assert.ok(prompt.includes("【DeepFlow 回流格式】"));
}

function testInvestmentMarketLogicPrompt() {
  const track = investmentTrackById("market_logic");
  const level = investmentLevelById("L2");
  const profile = {
    ...createInvestmentProfile("market_logic", "2026-01-01T00:00:00.000Z"),
    currentLevel: "L2",
    currentLevelLabel: level.label,
    sessionCount: 3,
    currentStageSessionCount: 3,
    lastSessionNumber: 3,
    lastTopic: "技术分析与市场行为观察"
  };
  const prompt = generatePrompt({
    user: { id: "user_test" },
    identity: {
      mainIdentity: "explorer",
      secondaryIdentity: "scholar",
      level: 1
    },
    learningModule: { id: "investment", label: "投资学习" },
    subject: { id: "investment_knowledge", label: "投资知识学习" },
    currentLevel: { id: "investment_l2", label: level.label },
    learningGoal: track,
    goal: { id: track.id, label: track.label, category: "investment" },
    mode: "light_start",
    plannedDuration: 8,
    currentStatus: "低负荷启动",
    investmentProfile: profile,
    investmentTrack: track,
    investmentLevel: level,
    currentInvestmentLevel: level.id,
    investmentSessionNumber: 4,
    currentStageSessionNumber: 4,
    investmentTopic: "技术分析与市场行为观察：K线、量价和常见指标只能作为辅助观察工具"
  });

  assert.ok(prompt.includes("技术分析与市场行为观察"));
  assert.ok(prompt.includes("K线基础"));
  assert.ok(prompt.includes("MACD 金叉/死叉/背离"));
  assert.ok(prompt.includes("BOLL 布林带"));
  assert.ok(prompt.includes("辅助观察"));
  assert.ok(prompt.includes("不是预测未来的确定工具"));
  assert.ok(prompt.includes("不能单独作为投资决策依据"));
  assert.ok(prompt.includes("重点讲“如何观察”，不是“如何预测”"));
  assert.ok(!prompt.includes("MACD 金叉就应该买入"));
  assert.ok(!prompt.includes("RSI 超卖就一定反弹"));
  assert.ok(!prompt.includes("出现双底就一定上涨"));
}

function testInvestmentProfileProgression() {
  let profile = createInvestmentProfile("market_logic", "2026-01-01T00:00:00.000Z");
  profile = updateInvestmentProfileAfterSession(profile, { sessionNumber: 1, topic: "市场预期如何影响价格", completedAt: "2026-01-02T00:00:00.000Z" });
  profile = updateInvestmentProfileAfterSession(profile, { sessionNumber: 2, topic: "短期波动和长期价值的区别", completedAt: "2026-01-03T00:00:00.000Z" });
  profile = updateInvestmentProfileAfterSession(profile, { sessionNumber: 3, topic: "消息如何影响价格", completedAt: "2026-01-04T00:00:00.000Z" });
  assert.equal(profile.sessionCount, 3);
  assert.equal(profile.currentStageSessionCount, 3);
  assert.equal(profile.lastSessionNumber, 3);
  assert.equal(shouldRecommendInvestmentProgression(profile), true);
  assert.equal(investmentProgressionRecommendation(profile).nextLevel, "L3");
  const progressed = progressInvestmentProfile(profile, "2026-01-05T00:00:00.000Z");
  assert.equal(progressed.currentLevel, "L3");
  assert.equal(progressed.currentStageSessionCount, 0);
}

function testInvestmentExp() {
  const exp = calculateExp("investment_level_progressed", "scholar", 1);
  assert.equal(exp.baseExp, 120);
  assert.ok(exp.finalExp > 0);
}

function testLearningCalendarRecords() {
  let calendar = {};
  const sessionA = {
    id: "session_a",
    learningModuleId: "language",
    learningModule: "语言学习",
    subject: "德语",
    learningGoal: "德语 C1",
    mode: "light_start",
    durationMinutes: 8,
    expGained: 20
  };
  const sessionB = {
    id: "session_b",
    learningModuleId: "programming",
    learningModule: "编程学习",
    subject: "AI辅助编程",
    learningGoal: "认识代码",
    mode: "standard",
    durationMinutes: 25,
    expGained: 45
  };
  const evidenceA = { type: "light_start_completed", finalExp: 20 };
  const evidenceB = { type: "standard_session_completed", finalExp: 45 };

  const first = addCompletedSessionToCalendar(calendar, sessionA, evidenceA, "2026-06-18T09:00:00.000Z");
  calendar = first.calendar;
  assert.equal(first.added, true);
  assert.equal(getTodayDateKey("2026-06-18T09:00:00.000Z"), "2026-06-18");

  const duplicate = addCompletedSessionToCalendar(calendar, sessionA, evidenceA, "2026-06-18T09:05:00.000Z");
  calendar = duplicate.calendar;
  assert.equal(duplicate.added, false);
  assert.equal(calendar["2026-06-18"].totalSessions, 1);

  const second = addCompletedSessionToCalendar(calendar, sessionB, evidenceB, "2026-06-18T11:00:00.000Z");
  calendar = second.calendar;
  const sessions = getSessionsByDate(calendar, "2026-06-18");
  const stats = getCalendarStats(calendar, "2026-06-18");

  assert.equal(sessions.length, 2);
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.totalLearningDays, 1);
  assert.equal(stats.monthlySessionCount, 2);
  assert.equal(stats.monthlyTotalMinutes, 33);
  assert.equal(stats.monthlyTotalExp, 65);

  const persisted = JSON.parse(JSON.stringify({ learningCalendar: calendar }));
  assert.equal(persisted.learningCalendar["2026-06-18"].totalSessions, 2);
}

function testLearningCalendarStreak() {
  let calendar = {};
  const session = {
    learningModuleId: "math",
    learningModule: "数学学习",
    subject: "数学基础",
    learningGoal: "概念理解",
    mode: "light_start",
    durationMinutes: 8,
    expGained: 10
  };
  calendar = addCompletedSessionToCalendar(
    calendar,
    { ...session, id: "session_17" },
    { type: "light_start_completed", finalExp: 10 },
    "2026-06-17T08:00:00.000Z"
  ).calendar;
  calendar = addCompletedSessionToCalendar(
    calendar,
    { ...session, id: "session_18" },
    { type: "light_start_completed", finalExp: 10 },
    "2026-06-18T08:00:00.000Z"
  ).calendar;

  assert.equal(getCalendarStats(calendar, "2026-06-18").currentStreak, 2);
  assert.equal(getCalendarStats(calendar, "2026-06-19").currentStreak, 0);
}

function testRecentLearningDays() {
  let calendar = {};
  const session = {
    id: "session_recent",
    learningModuleId: "language",
    learningModule: "语言学习",
    subject: "德语",
    learningGoal: "telc C1",
    mode: "light_start",
    durationMinutes: 8,
    expGained: 18
  };
  calendar = addCompletedSessionToCalendar(
    calendar,
    session,
    { type: "light_start_completed", finalExp: 18 },
    "2026-06-18T08:00:00.000Z"
  ).calendar;

  const recentDays = getRecentLearningDays(calendar, 7, "2026-06-18");
  assert.equal(recentDays.length, 7);
  assert.equal(recentDays[6].date, "2026-06-18");
  assert.equal(recentDays[6].isToday, true);
  assert.equal(recentDays[6].hasLearning, true);
  assert.equal(recentDays[6].totalSessions, 1);
  assert.equal(recentDays[0].hasLearning, false);
}

function testHomeLayoutSource() {
  const source = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
  assert.ok(source.includes("function renderLearningCalendarPreview"));
  assert.ok(source.includes("home-status-grid"));
  assert.ok(source.includes("calendar-preview-card"));
  assert.ok(source.includes("今日已学习"));
  assert.ok(source.includes("查看完整日历"));
  assert.ok(source.includes("getRecentLearningDays(calendar, 7"));
  assert.ok(!source.includes("近期 EXP 来源"));
  assert.ok(!source.includes('data-action="learning-calendar">学习日历</button>'));
}

testQuestionnaireScoring();
testIdentityGeneration();
testExpCalculation();
testPromptGeneration();
testInvestmentTracks();
testInvestmentProfileCreation();
testInvestmentPromptGeneration();
testInvestmentMarketLogicPrompt();
testInvestmentProfileProgression();
testInvestmentExp();
testLearningCalendarRecords();
testLearningCalendarStreak();
testRecentLearningDays();
testHomeLayoutSource();

console.log("Core logic tests passed.");
