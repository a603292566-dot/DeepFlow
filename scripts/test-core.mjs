import assert from "node:assert/strict";

import { QUESTIONNAIRE_ITEMS, LEARNING_MODULES, LANGUAGE_TARGETS, MODE_LABELS } from "../src/domain.js";
import { autoLanguageModulePlan, levelById, subjectById } from "../src/learningPath.js";
import { generatePrompt } from "../src/promptEngine.js";
import { applyExp, calculateExp, generateIdentity, scoreQuestionnaire } from "../src/scoring.js";
import {
  diagnoseInvestmentLevel,
  evaluateInvestmentUpgradeAnswer,
  investmentDiagnosticQuestions,
  investmentLevelById,
  investmentTrackById,
  INVESTMENT_TRACKS
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

function testInvestmentDiagnostic() {
  const questions = investmentDiagnosticQuestions("market_logic");
  assert.ok(questions.length >= 3);
  assert.ok(questions.length <= 5);
  const answers = Object.fromEntries(questions.map((question) => [question.id, question.correctOptionId]));
  const result = diagnoseInvestmentLevel("market_logic", answers);
  assert.ok(["L2", "L3"].includes(result.currentLevelId));
  assert.equal(result.totalQuestions, questions.length);
}

function testInvestmentPromptGeneration() {
  const track = investmentTrackById("company_decision");
  const level = investmentLevelById("L5");
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
    investmentTrack: track,
    investmentLevel: level,
    currentInvestmentLevel: level.id,
    shouldIncludeUpgradeQuestion: false
  });

  assert.ok(prompt.includes("DeepFlow 投资知识学习教练"));
  assert.ok(prompt.includes("不提供具体买卖建议"));
  assert.ok(prompt.includes("不推荐个股"));
  assert.ok(prompt.includes("不承诺收益"));
  assert.ok(prompt.includes("【DeepFlow 回流格式】"));
}

function testInvestmentUpgradeQuestion() {
  const correct = evaluateInvestmentUpgradeAnswer("L4", "A");
  const needsPractice = evaluateInvestmentUpgradeAnswer("L4", "B");
  assert.equal(correct.isCorrect, true);
  assert.equal(correct.toLevel, "L5");
  assert.equal(needsPractice.isCorrect, false);
  assert.ok(needsPractice.message.includes("继续巩固"));
}

function testInvestmentExp() {
  const exp = calculateExp("investment_upgrade_question_answered", "scholar", 1);
  assert.equal(exp.baseExp, 80);
  assert.ok(exp.finalExp > 0);
}

testQuestionnaireScoring();
testIdentityGeneration();
testExpCalculation();
testPromptGeneration();
testInvestmentTracks();
testInvestmentDiagnostic();
testInvestmentPromptGeneration();
testInvestmentUpgradeQuestion();
testInvestmentExp();

console.log("Core logic tests passed.");
