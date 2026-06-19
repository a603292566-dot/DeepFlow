import {
  LANGUAGE_MODULE_PLANS,
  LANGUAGE_TARGETS,
  LEARNING_MODULES,
  MODULE_GOALS,
  MODULE_LEVELS,
  MODULE_SUBJECTS,
  SPECIAL_GOALS_BY_PATH,
  STATUS_OPTIONS
} from "./domain.js";

const LANGUAGE_TARGET_ALIASES = {
  german_b2: "german_telc_b2",
  german_c1: "german_telc_c1"
};

export function learningModuleById(moduleId) {
  return LEARNING_MODULES.find((module) => module.id === moduleId);
}

export function subjectsForModule(moduleId) {
  return MODULE_SUBJECTS[moduleId] || [];
}

export function subjectById(moduleId, subjectId) {
  return subjectsForModule(moduleId).find((subject) => subject.id === subjectId);
}

export function languageTargetById(targetId) {
  const normalizedId = LANGUAGE_TARGET_ALIASES[targetId] || targetId;
  return LANGUAGE_TARGETS.find((target) => target.id === normalizedId);
}

export function languageTargetsForSubject(subjectId) {
  return LANGUAGE_TARGETS.filter((target) => target.subjectId === subjectId);
}

export function levelsForModule(moduleId) {
  return MODULE_LEVELS[moduleId] || [];
}

export function levelById(moduleId, levelId) {
  return levelsForModule(moduleId).find((level) => level.id === levelId);
}

export function goalsForModule(moduleId) {
  return MODULE_GOALS[moduleId] || [];
}

export function specialGoalPathKey(moduleId, subjectId, levelId) {
  return `${moduleId}:${subjectId}:${levelId}`;
}

export function goalsForPath(moduleId, subjectId, levelId) {
  return SPECIAL_GOALS_BY_PATH[specialGoalPathKey(moduleId, subjectId, levelId)] || goalsForModule(moduleId);
}

export function learningGoalById(moduleId, goalId, subjectId = null, levelId = null) {
  return goalsForPath(moduleId, subjectId, levelId).find((goal) => goal.id === goalId);
}

export function statusById(statusId) {
  return STATUS_OPTIONS.find((status) => status.id === statusId);
}

export function autoLanguageModulePlan(mode, languageTarget = null) {
  const plan = LANGUAGE_MODULE_PLANS[mode] || LANGUAGE_MODULE_PLANS.light_start;
  if (languageTarget?.targetLanguage !== "英语") return plan;
  return {
    ...plan,
    modules: plan.modules.map((module) =>
      module
        .replace("Sprachbausteine / 语块积累", "chunks / 表达块积累")
        .replace("Sprachbausteine 复习", "表达块复习")
    )
  };
}

export function goalLabelById(goalId) {
  const languageTarget = languageTargetById(goalId);
  if (languageTarget) return languageTarget.label;
  for (const module of LEARNING_MODULES) {
    const goal = goalsForModule(module.id).find((item) => item.id === goalId);
    if (goal) return goal.label;
    for (const goals of Object.values(SPECIAL_GOALS_BY_PATH)) {
      const specialGoal = goals.find((item) => item.id === goalId);
      if (specialGoal) return specialGoal.label;
    }
  }
  return goalId || "学习目标";
}
