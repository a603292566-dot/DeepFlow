import {
  BASE_EXP,
  DIMENSIONS,
  IDENTITY_BONUS,
  IDENTITY_LABELS,
  LEVEL_REQUIREMENTS,
  QUESTIONNAIRE_ITEMS
} from "./domain.js";

export function convertTo100(rawScore) {
  return Math.round(((rawScore - 5) / 20) * 100);
}

export function scoreQuestionnaire(answers, userId) {
  const scores = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, 0]));

  for (const item of QUESTIONNAIRE_ITEMS) {
    const answer = Number(answers[item.id] || 0);
    const normalized = item.reverseScored ? 6 - answer : answer;
    scores[item.dimension] += normalized;
  }

  const measuredAt = new Date().toISOString();
  return {
    userId,
    measuredAt,
    ...Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, convertTo100(scores[dimension])]))
  };
}

function averageTopSix(parameters) {
  return DIMENSIONS.map((dimension) => parameters[dimension])
    .sort((a, b) => b - a)
    .slice(0, 6)
    .reduce((sum, score) => sum + score, 0) / 6;
}

export function identityScores(parameters) {
  const highCount = DIMENSIONS.filter((dimension) => parameters[dimension] >= 75).length;
  const masterQualified =
    highCount >= 6 && parameters.executionStability >= 70 && parameters.learnerIdentity >= 70;

  const scores = {
    scholar:
      parameters.principleThinking * 0.4 +
      parameters.knowledgeConnection * 0.35 +
      parameters.explorationDrive * 0.25,
    explorer:
      parameters.explorationDrive * 0.45 +
      parameters.knowledgeConnection * 0.3 +
      parameters.growthBelief * 0.25,
    builder:
      parameters.systemBuilding * 0.45 +
      parameters.principleThinking * 0.3 +
      parameters.knowledgeConnection * 0.25,
    doer:
      parameters.executionStability * 0.45 +
      parameters.learnerIdentity * 0.3 +
      parameters.growthBelief * 0.25,
    traveler:
      (100 - parameters.learnerIdentity) * 0.35 +
      (100 - parameters.executionStability) * 0.35 +
      parameters.growthBelief * 0.3,
    master: masterQualified ? averageTopSix(parameters) : 0
  };

  if (
    parameters.learnerIdentity >= 60 &&
    parameters.executionStability >= 50 &&
    Object.entries(scores).some(([identity, score]) => identity !== "traveler" && score >= 72)
  ) {
    scores.traveler *= 0.55;
  }

  return scores;
}

export function generateIdentity(parameters, userId) {
  const ranked = Object.entries(identityScores(parameters)).sort((a, b) => b[1] - a[1]);
  const mainIdentity = ranked[0][0];
  const secondaryIdentity = ranked.find(([identity]) => identity !== mainIdentity)?.[0];
  return {
    userId,
    mainIdentity,
    secondaryIdentity,
    level: 1,
    currentExp: 0,
    requiredExp: LEVEL_REQUIREMENTS[1],
    totalExp: 0,
    updatedAt: new Date().toISOString()
  };
}

export function calculateExp(evidenceType, identity, level, qualityScore = 1) {
  const baseExp = BASE_EXP[evidenceType] || 0;
  const identityMultiplier = IDENTITY_BONUS[identity]?.[evidenceType] || 1;
  const levelCurveFactor = level <= 3 ? 1 : Math.max(0.8, 1 - (level - 3) * 0.03);
  const qualityModifier = Math.min(1.2, Math.max(0.8, qualityScore));
  const finalExp = Math.round(baseExp * identityMultiplier * levelCurveFactor * qualityModifier);

  return { baseExp, identityMultiplier, levelCurveFactor, qualityModifier, finalExp };
}

export function applyExp(identity, exp) {
  let next = { ...identity, currentExp: identity.currentExp + exp, totalExp: identity.totalExp + exp };

  while (next.currentExp >= next.requiredExp && next.level < 10) {
    next.currentExp -= next.requiredExp;
    next.level += 1;
    next.requiredExp = LEVEL_REQUIREMENTS[next.level] || next.requiredExp + 500;
  }

  return { ...next, updatedAt: new Date().toISOString() };
}

export function parameterGrowthText(label, score) {
  if (score < 20) return `${label}刚刚启航`;
  if (score < 40) return `${label}正在建立`;
  if (score < 60) return `${label}持续成长中`;
  if (score < 80) return `${label}优势逐渐形成`;
  return `${label}是核心优势`;
}

export function bonusText(identity) {
  const bonuses = IDENTITY_BONUS[identity] || {};
  const names = {
    light_start_completed: "轻启动",
    standard_session_completed: "标准深化",
    deep_session_completed: "深度学习",
    structured_output_completed: "结构化输出",
    knowledge_transfer_completed: "知识迁移",
    systematization_completed: "系统整理",
    project_progress_completed: "项目推进",
    model_built: "模型构建",
    concept_explained: "概念解释",
    feedback_completed: "反馈完成",
    restart_after_interruption: "中断后重启",
    questionnaire_completed: "完成问卷",
    identity_created: "创建身份"
  };

  return Object.entries(bonuses)
    .slice(0, 3)
    .map(([type, multiplier]) => `${names[type] || type} x${multiplier}`)
    .join(" · ") || `${IDENTITY_LABELS[identity]}基础成长加成`;
}
