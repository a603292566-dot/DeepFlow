const STORAGE_KEY = "deepflow_mvp_state_v1";

export function createInitialState() {
  return {
    user: null,
    questionnaireResponse: null,
    parameters: null,
    identity: null,
    prompts: [],
    sessions: [],
    evidence: [],
    selectedLearningModuleId: null,
    selectedCategory: null,
    selectedGoalId: null,
    selectedSubjectId: null,
    selectedCurrentLevelId: null,
    selectedGoalBranchId: null,
    selectedLearningGoalId: null,
    selectedTrainingMode: null,
    currentStatusId: null,
    energyLevel: null,
    fatigueLevel: null,
    focusLevel: null,
    motivationLevel: null,
    plannedDuration: null,
    activePromptId: null,
    activeSessionId: null,
    activeProfileId: null,
    profiles: [],
    hasSeenInstructionGuide: false,
    showInstructionGuide: false,
    copyNotice: "",
    feedbackDraft: "",
    screen: "welcome"
  };
}

export function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createInitialState();
    return { ...createInitialState(), ...JSON.parse(stored) };
  } catch {
    return createInitialState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return createInitialState();
}

export function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`;
}
