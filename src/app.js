import {
  DIMENSION_LABELS,
  IDENTITY_HINTS,
  IDENTITY_LABELS,
  LEARNING_MODULES,
  MODE_DURATION,
  MODE_LABELS,
  PROGRAMMING_GOAL_EVIDENCE_MAP,
  PROGRAMMING_LEVEL_EVIDENCE,
  QUESTIONNAIRE_ITEMS,
  STATUS_OPTIONS
} from "./domain.js";
import { getIdentityReportTemplate } from "./identityReportTemplates.js";
import { defaultLanguageProfile, generatePrompt } from "./promptEngine.js";
import { addGrowthEvidence, collectedLevelEvidence } from "./growthEvidence.js";
import {
  autoLanguageModulePlan,
  goalLabelById,
  goalsForPath,
  languageTargetById,
  languageTargetsForSubject,
  learningGoalById,
  learningModuleById,
  levelById,
  levelsForModule,
  statusById,
  subjectById,
  subjectsForModule
} from "./learningPath.js";
import {
  clearCloudConfig,
  cloudConfigPreview,
  flushCloudQueue,
  getCloudConfig,
  getCloudSyncStatus,
  hasEnvCloudConfig,
  queueCloudEvent,
  queueTestCloudEvent,
  saveCloudConfig
} from "./cloudSync.js";
import {
  bonusText,
  generateIdentity,
  parameterGrowthText,
  scoreQuestionnaire
} from "./scoring.js";
import {
  diagnoseInvestmentLevel,
  evaluateInvestmentUpgradeAnswer,
  investmentDiagnosticQuestions,
  investmentLevelById,
  investmentTopicForMode,
  investmentTrackById,
  INVESTMENT_MODULE_ID,
  INVESTMENT_TRACKS,
  investmentUpgradeQuestionForLevel,
  shouldOfferInvestmentUpgradeQuestion
} from "./investmentLearning.js";
import { loadState, makeId, resetState, saveState } from "./storage.js";

let state = loadState();
const app = document.querySelector("#app");

const PROFILE_DATA_FIELDS = [
  "user",
  "questionnaireResponse",
  "parameters",
  "identity",
  "prompts",
  "sessions",
  "evidence",
  "selectedLearningModuleId",
  "selectedCategory",
  "selectedGoalId",
  "selectedSubjectId",
  "selectedCurrentLevelId",
  "selectedGoalBranchId",
  "selectedLearningGoalId",
  "selectedTrainingMode",
  "targetInvestmentTrack",
  "currentInvestmentLevel",
  "investmentDiagnosticAnswers",
  "investmentDiagnosticResult",
  "investmentUpgradeResult",
  "currentStatusId",
  "energyLevel",
  "fatigueLevel",
  "focusLevel",
  "motivationLevel",
  "plannedDuration",
  "activePromptId",
  "activeSessionId",
  "lastCompletedSession",
  "feedbackDraft"
];

function commit(patch) {
  state = persistActiveProfile({ ...state, ...patch });
  saveState(state);
  render();
}

function updateState(recipe) {
  state = persistActiveProfile(recipe({ ...state }));
  saveState(state);
  render();
}

function now() {
  return new Date().toISOString();
}

function profileLabel(profile) {
  const mainLabel = IDENTITY_LABELS[profile.mainIdentity] || "学习者";
  const secondaryLabel = IDENTITY_LABELS[profile.secondaryIdentity] || "正在形成";
  return `${mainLabel} Lv.${profile.level} · 副身份 ${secondaryLabel}`;
}

function createProfileSnapshot(nextState) {
  if (!nextState.user || !nextState.identity) return null;

  const data = Object.fromEntries(PROFILE_DATA_FIELDS.map((field) => [field, nextState[field] ?? null]));

  return {
    id: nextState.user.id,
    createdAt: nextState.user.createdAt,
    updatedAt: now(),
    mainIdentity: nextState.identity.mainIdentity,
    secondaryIdentity: nextState.identity.secondaryIdentity,
    level: nextState.identity.level,
    currentExp: nextState.identity.currentExp,
    requiredExp: nextState.identity.requiredExp,
    evidenceCount: nextState.evidence.length,
    sessionCount: nextState.sessions.length,
    label: profileLabel({
      mainIdentity: nextState.identity.mainIdentity,
      secondaryIdentity: nextState.identity.secondaryIdentity,
      level: nextState.identity.level
    }),
    data
  };
}

function persistActiveProfile(nextState) {
  const profile = createProfileSnapshot(nextState);
  if (!profile) return { ...nextState, profiles: nextState.profiles || [] };

  const profiles = nextState.profiles || [];
  const existingIndex = profiles.findIndex((item) => item.id === profile.id);
  const updatedProfiles =
    existingIndex >= 0
      ? profiles.map((item) => (item.id === profile.id ? profile : item))
      : [profile, ...profiles];

  return {
    ...nextState,
    activeProfileId: profile.id,
    profiles: updatedProfiles
  };
}

function switchToProfile(profileId) {
  const profile = state.profiles.find((item) => item.id === profileId);
  if (!profile) return;

  state = persistActiveProfile(state);
  state = {
    ...state,
    ...profile.data,
    activeProfileId: profile.id,
    draftAnswers: undefined,
    screen: "home"
  };
  saveState(state);
  render();
}

function normalizeLoadedState() {
  if (state.identity && state.screen === "welcome") state.screen = "home";
  if (state.identity && state.user) state = persistActiveProfile(state);
  saveState(state);
}

normalizeLoadedState();

function recentExpSources(limit = 4) {
  return state.evidence
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

function currentGoals() {
  if (state.selectedLearningModuleId === "language") {
    return languageTargetsForSubject(state.selectedSubjectId);
  }
  return goalsForPath(state.selectedLearningModuleId, state.selectedSubjectId, state.selectedCurrentLevelId);
}

function currentLearningModule() {
  return learningModuleById(state.selectedLearningModuleId || state.selectedCategory);
}

function currentSubject() {
  const moduleId = state.selectedLearningModuleId || state.selectedCategory;
  return subjectById(moduleId, state.selectedSubjectId);
}

function currentLevel() {
  const moduleId = state.selectedLearningModuleId || state.selectedCategory;
  return levelById(moduleId, state.selectedCurrentLevelId);
}

function currentLearningGoal() {
  const moduleId = state.selectedLearningModuleId || state.selectedCategory;
  if (moduleId === "language") return languageTargetById(state.selectedLearningGoalId || state.selectedGoalId);
  if (moduleId === INVESTMENT_MODULE_ID) return investmentTrackById(state.targetInvestmentTrack);
  return learningGoalById(
    moduleId,
    state.selectedLearningGoalId || state.selectedGoalBranchId || state.selectedGoalId,
    state.selectedSubjectId,
    state.selectedCurrentLevelId
  );
}

function createGoalFromSelection(nextState) {
  const moduleId = nextState.selectedLearningModuleId || nextState.selectedCategory;
  const module = learningModuleById(moduleId);
  if (moduleId === INVESTMENT_MODULE_ID) {
    const track = investmentTrackById(nextState.targetInvestmentTrack);
    const level = investmentLevelById(nextState.currentInvestmentLevel);
    return {
      id: track?.id || nextState.targetInvestmentTrack || "investment",
      category: INVESTMENT_MODULE_ID,
      label: track?.label || "投资学习",
      moduleLabel: module?.label || "投资学习",
      subjectLabel: "投资知识学习",
      targetLevel: level?.label || "诊断中",
      examGoal: track?.label || "投资知识学习"
    };
  }
  const languageTarget = moduleId === "language" ? languageTargetById(nextState.selectedLearningGoalId || nextState.selectedGoalId) : null;
  const subject = languageTarget
    ? subjectById(moduleId, languageTarget.subjectId)
    : subjectById(moduleId, nextState.selectedSubjectId);
  const currentLevel = languageTarget
    ? levelById(moduleId, languageTarget.levelId)
    : levelById(moduleId, nextState.selectedCurrentLevelId);
  const learningGoal = languageTarget || learningGoalById(
    moduleId,
    nextState.selectedLearningGoalId || nextState.selectedGoalBranchId,
    nextState.selectedSubjectId,
    nextState.selectedCurrentLevelId
  );

  return {
    id: learningGoal?.id || nextState.selectedLearningGoalId || nextState.selectedGoalBranchId,
    category: module?.id || moduleId || "learning",
    label: `${subject?.label || "学习"} · ${learningGoal?.label || "学习目标"}`,
    moduleLabel: module?.label,
    subjectLabel: subject?.label,
    targetLanguage: learningGoal?.targetLanguage || subject?.targetLanguage,
    targetLevel: currentLevel?.label,
    examGoal: learningGoal?.label
  };
}

function createPrompt(nextState, mode) {
  const moduleId = nextState.selectedLearningModuleId || nextState.selectedCategory;
  const learningModule = learningModuleById(moduleId);
  const investmentTrack = moduleId === INVESTMENT_MODULE_ID ? investmentTrackById(nextState.targetInvestmentTrack) : null;
  const investmentLevel = moduleId === INVESTMENT_MODULE_ID ? investmentLevelById(nextState.currentInvestmentLevel) : null;
  const languageTarget = moduleId === "language" ? languageTargetById(nextState.selectedLearningGoalId || nextState.selectedGoalId) : null;
  const subject = languageTarget
    ? subjectById(moduleId, languageTarget.subjectId)
    : investmentTrack
      ? { id: "investment_knowledge", label: "投资知识学习" }
    : subjectById(moduleId, nextState.selectedSubjectId);
  const currentLevel = languageTarget
    ? levelById(moduleId, languageTarget.levelId)
    : investmentLevel
      ? { id: `investment_${investmentLevel.id.toLowerCase()}`, label: investmentLevel.label }
    : levelById(moduleId, nextState.selectedCurrentLevelId);
  const learningGoal = languageTarget || investmentTrack || learningGoalById(
    moduleId,
    nextState.selectedLearningGoalId || nextState.selectedGoalBranchId,
    nextState.selectedSubjectId,
    nextState.selectedCurrentLevelId
  );
  const goal = createGoalFromSelection(nextState);
  const currentStatus = statusById(nextState.currentStatusId);
  const plannedDuration = nextState.plannedDuration || currentStatus?.plannedDuration || MODE_DURATION[mode];
  const levelEvidence = PROGRAMMING_LEVEL_EVIDENCE[currentLevel?.id] || null;
  const collectedEvidence = collectedLevelEvidence(nextState, levelEvidence);
  const likelyEvidenceIds = PROGRAMMING_GOAL_EVIDENCE_MAP[learningGoal?.id] || [];
  const generatedModulePlan = moduleId === "language" ? autoLanguageModulePlan(mode, languageTarget) : null;
  const shouldIncludeInvestmentUpgradeQuestion = moduleId === INVESTMENT_MODULE_ID && shouldOfferInvestmentUpgradeQuestion({
    sessions: nextState.sessions,
    currentLevelId: nextState.currentInvestmentLevel,
    latestSession: nextState.lastCompletedSession
  });
  const context = {
    user: nextState.user,
    identity: nextState.identity,
    parameters: nextState.parameters,
    category: goal.category,
    goal,
    learningModule,
    subject,
    currentLevel,
    learningGoal,
    generatedModulePlan,
    autoSelectedModule: generatedModulePlan?.modules?.join(" + ") || "",
    investmentTrack,
    investmentTrackId: investmentTrack?.id,
    investmentLevel,
    currentInvestmentLevel: investmentLevel?.id,
    investmentTopic: investmentLevel ? investmentTopicForMode(investmentLevel.id, mode) : "",
    investmentUpgradeQuestion: investmentUpgradeQuestionForLevel(investmentLevel?.id),
    shouldIncludeUpgradeQuestion: shouldIncludeInvestmentUpgradeQuestion,
    levelEvidence,
    collectedEvidence,
    likelyEvidenceIds,
    goalBranch: learningGoal,
    trainingMode: mode,
    duration: plannedDuration,
    plannedDuration,
    currentStatus: currentStatus?.label || "状态已记录",
    energyLevel: nextState.energyLevel ?? currentStatus?.energyLevel ?? null,
    fatigueLevel: nextState.fatigueLevel ?? currentStatus?.fatigueLevel ?? null,
    focusLevel: nextState.focusLevel ?? currentStatus?.focusLevel ?? null,
    motivationLevel: nextState.motivationLevel ?? currentStatus?.motivationLevel ?? 6,
    learnerIdentity: nextState.identity.mainIdentity,
    secondaryIdentity: nextState.identity.secondaryIdentity,
    expBonusDirection: bonusText(nextState.identity.mainIdentity),
    mode,
    currentState: "normal",
    recentSessions: nextState.sessions.slice(-3),
    recentEvidence: nextState.evidence.slice(-5),
    activeBonusText: bonusText(nextState.identity.mainIdentity),
    languageProfile:
      moduleId === "language" ? defaultLanguageProfile(nextState.user.id, goal) : null
  };
  const generated = {
    id: makeId("prompt"),
    userId: nextState.user.id,
    category: goal.category,
    goalId: goal.id,
    learningModuleId: learningModule?.id,
    learningModule: learningModule?.label,
    subjectId: subject?.id,
    subject: subject?.label,
    currentLevelId: currentLevel?.id,
    currentLevel: currentLevel?.label,
    learningGoalId: learningGoal?.id,
    learningGoal: learningGoal?.label,
    goalBranchId: learningGoal?.id,
    generatedModulePlan,
    autoSelectedModule: context.autoSelectedModule,
    investmentTrackId: investmentTrack?.id,
    targetInvestmentTrack: investmentTrack?.id,
    currentInvestmentLevel: investmentLevel?.id,
    investmentLevelLabel: investmentLevel?.label,
    investmentTopic: context.investmentTopic,
    levelEvidenceId: levelEvidence ? currentLevel?.id : null,
    likelyEvidenceIds,
    currentStatus: context.currentStatus,
    energyLevel: context.energyLevel,
    fatigueLevel: context.fatigueLevel,
    focusLevel: context.focusLevel,
    motivationLevel: context.motivationLevel,
    plannedDuration,
    mode,
    identity: nextState.identity.mainIdentity,
    text: generatePrompt(context),
    createdAt: now()
  };

  queueCloudEvent("prompt_generated", nextState, { prompt: generated });
  if (moduleId === INVESTMENT_MODULE_ID) {
    queueCloudEvent("investment_prompt_generated", nextState, { prompt: generated });
  }

  return {
    ...nextState,
    prompts: [...nextState.prompts, generated],
    activePromptId: generated.id,
    copyNotice: "",
    screen: "learning_instruction"
  };
}

function activePrompt() {
  return state.prompts.find((prompt) => prompt.id === state.activePromptId);
}

function activeSession() {
  return state.sessions.find((session) => session.id === state.activeSessionId);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea fallback for local file and WebKit app contexts.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  textarea.remove();
  return ok;
}

function categoryLabel(categoryId) {
  const module = learningModuleById(categoryId);
  if (module) return module.label;
  return categoryId || "学习";
}

function goalLabel(goalId) {
  return goalLabelById(goalId);
}

function formatTimer(session) {
  if (!session) return "00:00";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000));
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

setInterval(() => {
  if (state.screen === "active_session") render();
}, 1000);

function shell(content) {
  const profiles = state.profiles || [];
  const profileControls = profiles.length
    ? `
      <div class="profile-controls">
        <label>
          <span>角色切换</span>
          <select data-action="switch-profile" aria-label="角色切换">
            ${profiles.map((profile) => `
              <option value="${profile.id}" ${profile.id === state.activeProfileId ? "selected" : ""}>
                ${profileLabel(profile)}
              </option>
            `).join("")}
          </select>
        </label>
        <button class="ghost" data-action="create-new-role">创建新角色</button>
        ${state.identity ? `<button class="ghost" data-action="home">角色卡</button>` : ""}
        <button class="ghost" data-action="cloud-settings">云端同步</button>
        <button class="ghost" data-action="install-help">添加到主屏幕</button>
      </div>
    `
    : state.identity
      ? `<div class="profile-controls"><button class="ghost" data-action="create-new-role">创建新角色</button><button class="ghost" data-action="home">角色卡</button><button class="ghost" data-action="cloud-settings">云端同步</button><button class="ghost" data-action="install-help">添加到主屏幕</button></div>`
      : `<div class="profile-controls"><button class="ghost" data-action="cloud-settings">云端同步</button><button class="ghost" data-action="install-help">添加到主屏幕</button></div>`;

  return `
    <main class="app-shell">
      <section class="topbar">
        <div>
          <p class="eyebrow">DeepFlow MVP</p>
          <h1>AI 学习启动与成长反馈系统</h1>
        </div>
        ${profileControls}
      </section>
      ${content}
    </main>
  `;
}

function renderWelcome() {
  return shell(`
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">本地原型</p>
        <h2>创建你的学习者角色</h2>
        <p>完成一份低负担问卷，DeepFlow 会生成学习者身份、极简角色卡，并为外部 AI 老师生成轻启动学习指令。</p>
        <button class="primary" data-action="start-questionnaire">创建你的学习者角色</button>
      </div>
    </section>
  `);
}

function renderInstallHelp() {
  return shell(`
    <section class="panel install-help">
      <div class="section-head">
        <div>
          <p class="eyebrow">安装 DeepFlow</p>
          <h2>把 DeepFlow 添加到主屏幕</h2>
        </div>
        <button class="ghost" data-action="${state.identity ? "home" : "welcome"}">返回</button>
      </div>
      <p class="muted">用公开链接打开后，可以把 DeepFlow 放到手机或电脑桌面，像普通应用一样进入。</p>
      <div class="install-grid">
        <article class="install-card">
          <h3>iPhone</h3>
          <ol>
            <li>用 Safari 打开 DeepFlow 链接</li>
            <li>点击分享按钮</li>
            <li>选择“添加到主屏幕”</li>
          </ol>
        </article>
        <article class="install-card">
          <h3>Android</h3>
          <ol>
            <li>用 Chrome 打开 DeepFlow 链接</li>
            <li>点击右上角菜单</li>
            <li>选择“安装应用”或“添加到主屏幕”</li>
          </ol>
        </article>
        <article class="install-card">
          <h3>Windows</h3>
          <ol>
            <li>用 Edge 或 Chrome 打开 DeepFlow 链接</li>
            <li>点击地址栏右侧的安装图标</li>
            <li>选择安装</li>
          </ol>
        </article>
        <article class="install-card">
          <h3>Mac</h3>
          <ol>
            <li>直接使用浏览器打开</li>
            <li>也可以用 Chrome / Edge 安装为应用</li>
          </ol>
        </article>
      </div>
    </section>
  `);
}

function renderCloudSettings() {
  const config = getCloudConfig();
  const status = getCloudSyncStatus();
  const envConfigured = hasEnvCloudConfig();
  const returnAction = state.identity ? "home" : "welcome";
  return shell(`
    <section class="panel cloud-settings">
      <div class="section-head">
        <div>
          <p class="eyebrow">云端同步</p>
          <h2>Supabase 测试数据库</h2>
        </div>
        <button class="ghost" data-action="${returnAction}">返回</button>
      </div>
      <p class="muted">DeepFlow 会继续优先保存在本地；配置 Supabase 后，会把关键学习事件同步到云端，方便你在 Supabase Table Editor 里浏览测试数据。</p>
      ${envConfigured ? `<p class="notice">已检测到环境变量配置。下面表单可留空，或用于临时覆盖。</p>` : ""}
      <form id="cloud-settings-form" class="settings-form">
        <label>
          <span>Supabase Project URL</span>
          <input name="supabaseUrl" value="${config.supabaseUrl || ""}" placeholder="https://xxxx.supabase.co" />
        </label>
        <label>
          <span>anon public key</span>
          <input name="anonKey" value="${config.anonKey || ""}" placeholder="只填写 anon public key，不要填写 service role key" />
        </label>
        <div class="actions-row">
          <button class="primary" type="submit">保存并同步</button>
          <button class="secondary" type="button" data-action="test-cloud">测试连接 / 发送测试事件</button>
          <button class="ghost" type="button" data-action="flush-cloud">立即同步队列</button>
          <button class="ghost" type="button" data-action="clear-cloud">清除配置</button>
        </div>
      </form>
      <div class="sync-status">
        <p>当前配置：${cloudConfigPreview()}</p>
        <p>同步状态：${status.configured ? "已配置" : "未配置"}</p>
        <p>待同步事件：${status.queueCount || 0}</p>
        <p>最近同步：${status.lastSyncedAt || "暂无"}</p>
        <p>最近测试：${status.lastTestAt || "暂无"}</p>
        ${status.lastError ? `<p class="notice">最近错误：${status.lastError}</p>` : ""}
      </div>
      <p class="muted">管理者界面：打开 Supabase Dashboard → Table Editor → deepflow_sync_events。</p>
    </section>
  `);
}

function renderQuestionnaire() {
  const answered = state.draftAnswers || {};
  const items = QUESTIONNAIRE_ITEMS.map((item) => `
    <fieldset class="question" data-question="${item.id}">
      <legend>
        <span>${item.id}</span>
        ${item.text}
      </legend>
      <div class="scale" role="radiogroup" aria-label="${item.text}">
        ${[1, 2, 3, 4, 5].map((value) => `
          <label class="scale-option ${answered[item.id] === value ? "selected" : ""}">
            <input type="radio" name="${item.id}" value="${value}" ${answered[item.id] === value ? "checked" : ""} />
            <span>${value}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `).join("");
  const count = Object.keys(answered).length;

  return shell(`
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">学习者身份问卷</p>
          <h2>请按照过去半年真实情况作答</h2>
        </div>
        <span class="pill">${count} / ${QUESTIONNAIRE_ITEMS.length}</span>
      </div>
      <p class="muted">1 = 非常不同意，5 = 非常同意。没有标准答案，本问卷用于生成你的 DeepFlow 学习者角色。</p>
      <form id="questionnaire-form">
        <div class="question-list">${items}</div>
        <button class="primary wide" type="submit" ${count < QUESTIONNAIRE_ITEMS.length ? "disabled" : ""}>生成学习者身份</button>
      </form>
    </section>
  `);
}

function renderRoleCard() {
  const identity = state.identity;
  const expPercent = Math.round((identity.currentExp / identity.requiredExp) * 100);
  const sources = recentExpSources();
  const mainLabel = IDENTITY_LABELS[identity.mainIdentity];
  const secondaryLabel = IDENTITY_LABELS[identity.secondaryIdentity] || "正在形成";

  return `
    <section class="role-card">
      <div class="role-main">
        <div>
          <p class="eyebrow">角色卡</p>
          <h2>${mainLabel} Lv.${identity.level}</h2>
          <p>${IDENTITY_HINTS[identity.mainIdentity]}</p>
        </div>
        <span class="pill">副身份：${secondaryLabel}</span>
      </div>
      <div class="exp-row">
        <span>EXP ${identity.currentExp} / ${identity.requiredExp}</span>
        <span>距离升级 ${Math.max(0, identity.requiredExp - identity.currentExp)}</span>
      </div>
      <div class="bar"><span style="width:${Math.min(100, expPercent)}%"></span></div>
      <div class="mini-grid">
        <div>
          <strong>当前经验加成</strong>
          <p>${bonusText(identity.mainIdentity)}</p>
        </div>
        <div>
          <strong>近期 EXP 来源</strong>
          ${
            sources.length
              ? `<ul>${sources.map((source) => `<li>${source.label} +${source.finalExp}</li>`).join("")}</ul>`
              : "<p>完成问卷后会显示近期来源。</p>"
          }
        </div>
      </div>
    </section>
  `;
}

function renderHome() {
  return shell(`
    ${renderRoleCard()}
    <section class="actions-row">
      <button class="primary" data-action="select-category">开始学习</button>
      <button class="secondary" data-action="identity-report">查看身份报告</button>
    </section>
    <section class="history-strip">
      <p class="eyebrow">基础记录</p>
      <h3>学习记录与成长证据</h3>
      <p>${state.sessions.length} 次学习会话 · ${state.evidence.length} 条成长证据</p>
    </section>
  `);
}

function renderQuestionnaireFeedback() {
  const identity = state.identity;
  const template = getIdentityReportTemplate(identity.mainIdentity);
  const mainLabel = IDENTITY_LABELS[identity.mainIdentity];
  const secondaryLabel = IDENTITY_LABELS[identity.secondaryIdentity] || "正在形成";
  const previewStrengths = template.strengths.slice(0, 3).map((strength) => `<li>${strength}</li>`).join("");

  return shell(`
    <section class="identity-feedback">
      <div class="feedback-hero">
        <div>
          <p class="eyebrow">学习者身份已生成</p>
          <h2>${mainLabel} Lv.${identity.level}</h2>
          <p class="identity-subtitle">副身份：${secondaryLabel}</p>
        </div>
        <div class="role-preview">
          <strong>${mainLabel} Lv.${identity.level}</strong>
          <span>EXP ${identity.currentExp} / ${identity.requiredExp}</span>
        </div>
      </div>
      <p class="feedback-summary">${template.feedbackSummary}</p>
      <div class="feedback-strengths">
        <strong>当前更容易进入状态的方向</strong>
        <ul>${previewStrengths}</ul>
      </div>
      <div class="actions-row feedback-actions">
        <button class="secondary prominent" data-action="identity-report">查看完整身份报告</button>
        <button class="primary prominent" data-action="select-category">开始学习</button>
      </div>
    </section>
  `);
}

function renderIdentityReport() {
  const identity = state.identity;
  const template = getIdentityReportTemplate(identity.mainIdentity);
  const mainLabel = IDENTITY_LABELS[identity.mainIdentity];
  const secondaryLabel = IDENTITY_LABELS[identity.secondaryIdentity] || "正在形成";
  const rows = Object.entries(DIMENSION_LABELS).map(([key, label]) => `
    <div class="metric">
      <span>${parameterGrowthText(label, state.parameters[key])}</span>
      <strong>${state.parameters[key]}</strong>
    </div>
  `).join("");
  const list = (items) => `<ul class="report-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;

  return shell(`
    <section class="panel report-page">
      <div class="section-head">
        <div>
          <p class="eyebrow">完整身份报告</p>
          <h2>${mainLabel}学习者报告</h2>
        </div>
        <button class="ghost" data-action="home">返回角色卡</button>
      </div>
      <div class="report-overview">
        <div><span>主身份</span><strong>${mainLabel}</strong></div>
        <div><span>副身份</span><strong>${secondaryLabel}</strong></div>
        <div><span>当前等级</span><strong>Lv.${identity.level}</strong></div>
        <div><span>当前 EXP</span><strong>${identity.currentExp} / ${identity.requiredExp}</strong></div>
      </div>
      <article class="report-section">
        <h3>身份解释</h3>
        <p>${template.identitySummary}</p>
      </article>
      <article class="report-section">
        <h3>学习特点</h3>
        ${list(template.learningCharacteristics)}
      </article>
      <article class="report-section">
        <h3>核心优势</h3>
        ${list(template.strengths)}
      </article>
      <article class="report-section">
        <h3>值得深化的能力</h3>
        ${list(template.growthAreas)}
      </article>
      <article class="report-section">
        <h3>DeepFlow 适配策略</h3>
        ${list(template.deepflowStrategy)}
      </article>
      <article class="report-section">
        <h3>参数画像</h3>
        <p class="muted">参数用于帮助 DeepFlow 选择更合适的启动方式和反馈节奏，不作为固定评价。</p>
        <div class="metrics">${rows}</div>
      </article>
      <div class="actions-row">
        <button class="primary" data-action="select-category">开始学习</button>
        <button class="secondary" data-action="home">返回角色卡</button>
      </div>
    </section>
  `);
}

function renderCategorySelect() {
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">Step 1 / New Session</p>
      <h2>选择学习模块</h2>
      <div class="choice-grid">
        ${LEARNING_MODULES.map((module) => `
          <button class="choice" data-action="choose-learning-module" data-module="${module.id}">${module.label}</button>
        `).join("")}
      </div>
    </section>
  `);
}

function renderInvestmentGoalSelect() {
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">投资学习</p>
      <h2>选择一个目标方向</h2>
      <p class="muted">先选一个大方向，DeepFlow 会用几个小问题判断你更适合从哪里开始。</p>
      <div class="choice-grid">
        ${INVESTMENT_TRACKS.map((track) => `
          <button class="choice" data-action="choose-investment-track" data-track="${track.id}">
            ${track.label}
            <br><span>${track.subtitle}</span>
          </button>
        `).join("")}
      </div>
      <div class="actions-row">
        <button class="ghost" data-action="select-category">返回学习模块</button>
      </div>
    </section>
  `);
}

function renderInvestmentDiagnostic() {
  const track = investmentTrackById(state.targetInvestmentTrack);
  const questions = investmentDiagnosticQuestions(state.targetInvestmentTrack);
  const answers = state.investmentDiagnosticAnswers || {};
  const answeredCount = questions.filter((question) => answers[question.id]).length;
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">投资学习诊断</p>
      <h2>${track?.label || "投资学习"}</h2>
      <p class="muted">DeepFlow 会用几个小问题判断你当前更适合从哪里开始。这不是考试，只是为了生成更适合你的 AI 学习指令。</p>
      <div class="diagnostic-list">
        ${questions.map((question, index) => `
          <article class="question-block">
            <h3>${index + 1}. ${question.question}</h3>
            <div class="choice-grid compact">
              ${question.options.map((option) => `
                <button class="choice ${answers[question.id] === option.id ? "selected" : ""}" data-action="choose-investment-answer" data-question="${question.id}" data-option="${option.id}">
                  ${option.id}. ${option.text}
                </button>
              `).join("")}
            </div>
          </article>
        `).join("")}
      </div>
      <div class="actions-row">
        <button class="primary" data-action="submit-investment-diagnostic" ${answeredCount === questions.length ? "" : "disabled"}>查看当前起点</button>
        <button class="ghost" data-action="investment-goal-back">返回目标方向</button>
      </div>
      <p class="muted">已完成 ${answeredCount} / ${questions.length}</p>
    </section>
  `);
}

function renderInvestmentFeedback() {
  const track = investmentTrackById(state.targetInvestmentTrack);
  const level = investmentLevelById(state.currentInvestmentLevel);
  const result = state.investmentDiagnosticResult;
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">当前起点已生成</p>
      <h2>${level?.publicLabel || "投资入门"}</h2>
      <div class="settlement">
        <p>目标方向：${track?.label || "投资学习"}</p>
        <p>当前适合起点：${level?.publicLabel || "投资入门"}</p>
        <p>诊断完成：${result ? `${result.correctCount} / ${result.totalQuestions} 个关键判断已记录` : "已记录"}</p>
      </div>
      <p>${level?.summary || "投资知识正在建立，DeepFlow 会从低负荷任务开始。"}</p>
      <p class="muted">本模块只做投资知识教育和判断框架训练，不提供买卖建议、个股推荐或收益承诺。</p>
      <div class="actions-row">
        <button class="primary" data-action="generate-investment-instruction">生成 AI 学习指令</button>
        <button class="ghost" data-action="investment-diagnostic-back">返回诊断题</button>
      </div>
    </section>
  `);
}

function renderSubjectSelect() {
  const module = currentLearningModule();
  const subjects = subjectsForModule(state.selectedLearningModuleId);
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">Step 2 / ${module?.label || "学习模块"}</p>
      <h2>${state.selectedLearningModuleId === "language" ? "选择目标语言" : "选择具体学科"}</h2>
      <div class="choice-grid">
        ${subjects.map((subject) => `
          <button class="choice" data-action="choose-subject" data-subject="${subject.id}">${subject.label}</button>
        `).join("")}
      </div>
      <div class="actions-row">
        <button class="ghost" data-action="select-category">返回学习模块</button>
      </div>
    </section>
  `);
}

function renderCurrentLevelSelect() {
  const module = currentLearningModule();
  const subject = currentSubject();
  const levels = levelsForModule(state.selectedLearningModuleId);
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">Step 3 / ${module?.label || "学习模块"} · ${subject?.label || "具体学科"}</p>
      <h2>选择当前水平</h2>
      <div class="choice-grid">
        ${levels.map((level) => `
          <button class="choice" data-action="choose-current-level" data-level="${level.id}">${level.label}</button>
        `).join("")}
      </div>
      <div class="actions-row">
        <button class="ghost" data-action="module-back">返回具体学科</button>
      </div>
    </section>
  `);
}

function renderGoalBranchSelect() {
  const module = currentLearningModule();
  const subject = currentSubject();
  const level = currentLevel();
  const goals = currentGoals();
  const isLanguage = state.selectedLearningModuleId === "language";
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">${isLanguage ? `Step 3 / ${subject?.label || "目标语言"}` : `Step 4 / ${subject?.label || "具体学科"} · ${level?.label || "当前水平"}`}</p>
      <h2>${isLanguage ? `选择${subject?.label || "语言"}目标` : "选择学习目标"}</h2>
      <div class="choice-grid">
        ${goals.map((goal) => `
          <button class="choice" data-action="choose-learning-goal" data-goal="${goal.id}">
            ${goal.label}
            ${goal.subtitle ? `<br><span>${goal.subtitle}</span>` : ""}
          </button>
        `).join("")}
      </div>
      <div class="actions-row">
        <button class="ghost" data-action="${isLanguage ? "module-back" : "level-back"}">${isLanguage ? "返回语言选择" : "返回当前水平"}</button>
      </div>
    </section>
  `);
}

function renderStatusAssessment() {
  const module = currentLearningModule();
  const subject = currentSubject();
  const level = currentLevel();
  const learningGoal = currentLearningGoal();
  const isLanguage = state.selectedLearningModuleId === "language";

  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">Step 5 / 当前状态</p>
      <h2>现在状态如何？</h2>
      <p class="muted">DeepFlow 会根据你的状态自动调整任务强度。</p>
      <div class="learning-path-summary">
        <span>模块：${module?.label || "未选择"}</span>
        <span>学科：${subject?.label || "未选择"}</span>
        <span>水平：${level?.label || "未选择"}</span>
        <span>${isLanguage ? "目标" : "目标"}：${learningGoal?.label || "未选择"}</span>
      </div>
      <div class="choice-grid">
        ${STATUS_OPTIONS.map((status) => `
          <button class="choice" data-action="choose-current-status" data-status="${status.id}">${status.label}</button>
        `).join("")}
      </div>
      <div class="actions-row">
        <button class="ghost" data-action="branch-back">返回${isLanguage ? "目标等级" : "学习目标"}</button>
      </div>
    </section>
  `);
}

function renderInstructionGuide() {
  if (!state.showInstructionGuide) return "";

  return `
    <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="学习指令使用说明">
      <section class="guide-modal">
        <p class="eyebrow">第一次使用</p>
        <h2>DeepFlow 配合 AI 老师使用</h2>
        <p>DeepFlow 生成学习指令，你复制到 ChatGPT / Claude 中学习。学完回到 DeepFlow 点击完成，系统会记录时间和成长证据。</p>
        <button class="primary" data-action="dismiss-instruction-guide">知道了</button>
      </section>
    </div>
  `;
}

function renderInstructionIntro() {
  const module = currentLearningModule();
  const subject = currentSubject();
  const level = currentLevel();
  const learningGoal = currentLearningGoal();
  const mode = state.selectedTrainingMode || "light_start";
  const status = statusById(state.currentStatusId);
  const isLanguage = state.selectedLearningModuleId === "language";
  return shell(`
    ${renderInstructionGuide()}
    ${renderRoleCard()}
    <section class="panel instruction-intro">
      <p class="eyebrow">Step 6 / 生成 Prompt（提示词）</p>
      <h2>${isLanguage ? `开始一次${learningGoal?.label || subject?.label} ${MODE_LABELS[mode]}` : `${subject?.label} · ${learningGoal?.label}`}</h2>
      <div class="learning-path-summary">
        <span>学习模块：${module?.label}</span>
        <span>当前水平：${level?.label}</span>
        <span>当前状态：${status?.label || "已记录"}</span>
        <span>训练模式：${MODE_LABELS[mode]}</span>
        <span>预计时长：${state.plannedDuration || MODE_DURATION[mode]}</span>
      </div>
      <p class="muted">${
        isLanguage
          ? "DeepFlow 会根据你的学习者身份、当前状态和历史复习内容，自动生成本次 AI 学习指令。你不需要手动选择阅读、词汇或写作模块。"
          : "DeepFlow 会根据你的学习者身份和学习目标，生成一段给 AI 老师的学习指令。你只需要复制它，粘贴到 ChatGPT / Claude 等 AI 工具中学习。学完后回到 DeepFlow 点击完成，系统会记录时间并生成成长反馈。"
      }</p>
      <div class="actions-row">
        <button class="primary" data-action="generate-instruction">生成 AI 学习指令</button>
        <button class="ghost" data-action="mode-back">返回当前状态</button>
      </div>
    </section>
  `);
}

function renderLearningInstruction() {
  const prompt = activePrompt();
  const branchLabel = goalLabel(prompt.goalId);
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${MODE_LABELS[prompt.mode]}</p>
          <h2>复制 AI 学习指令</h2>
        </div>
        <span class="pill">${branchLabel}</span>
      </div>
      <p class="muted">这段内容是给 AI 老师看的，不需要逐句理解，复制后粘贴到 ChatGPT / Claude 中发送即可。</p>
      <textarea class="prompt-box" readonly>${prompt.text}</textarea>
      <div class="actions-row">
        <button class="secondary" data-action="copy-instruction">复制学习指令</button>
        <button class="primary" data-action="start-session">我已开始学习</button>
        <button class="ghost" data-action="select-category">重新选择</button>
      </div>
      ${state.copyNotice ? `<p class="notice">${state.copyNotice}</p>` : ""}
    </section>
  `);
}

function renderActiveSession() {
  const session = activeSession();
  const prompt = activePrompt();
  const completeLabel = prompt.mode === "light_start" ? "完成轻启动" : `完成${MODE_LABELS[prompt.mode]}`;
  return shell(`
    ${renderRoleCard()}
    <section class="timer-panel">
      <p class="eyebrow">学习中</p>
      <p class="mode-line">当前模式：${MODE_LABELS[prompt.mode]}</p>
      <h2>${formatTimer(session)}</h2>
      <p>完成后回到 DeepFlow 点击完成。</p>
      <button class="primary" data-action="complete-session">${completeLabel}</button>
    </section>
  `);
}

function renderSettlement() {
  const session = state.lastCompletedSession;
  const completeTitle = session.mode === "light_start" ? "轻启动完成" : `${MODE_LABELS[session.mode]}完成`;
  const canGoDeeper = session.mode !== "deep";
  const upgradeQuestion =
    session.learningModuleId === INVESTMENT_MODULE_ID &&
    shouldOfferInvestmentUpgradeQuestion({
      sessions: state.sessions,
      currentLevelId: session.currentInvestmentLevel,
      latestSession: session
    })
      ? investmentUpgradeQuestionForLevel(session.currentInvestmentLevel)
      : null;
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">成长证据已记录</p>
      <h2>${completeTitle}</h2>
      <div class="settlement">
        <p>学习模块：${session.learningModule || categoryLabel(session.category)}</p>
        <p>具体学科：${session.subject || "已记录"}</p>
        <p>学习目标：${session.learningGoal || goalLabel(session.goalId)}</p>
        <p>实际时长：${session.durationMinutes} 分钟</p>
        <p>获得 EXP：+${session.expGained}</p>
      </div>
      <section class="feedback-capture">
        <h3>AI 有给你反馈吗？</h3>
        <p class="muted">可以粘贴回来，DeepFlow 会帮你整理复习项；也可以跳过直接结算。</p>
        <textarea class="feedback-box" data-action="feedback-draft" placeholder="把 AI 老师的反馈粘贴到这里，可选。">${state.feedbackDraft || ""}</textarea>
        <div class="actions-row">
          <button class="secondary" data-action="settle-with-feedback">粘贴反馈并结算</button>
          <button class="ghost" data-action="finish-learning">跳过并结算</button>
        </div>
      </section>
      ${upgradeQuestion ? `
        <section class="feedback-capture">
          <h3>是否尝试升级问题？</h3>
          <p class="muted">这不是考试，只是帮助判断下一阶段是否已经适合开启。</p>
          <p>${upgradeQuestion.question}</p>
          <div class="choice-grid compact">
            ${upgradeQuestion.options.map((option) => `
              <button class="choice" data-action="answer-investment-upgrade" data-level="${upgradeQuestion.fromLevel}" data-option="${option.id}">
                ${option.id}. ${option.text}
              </button>
            `).join("")}
          </div>
          ${state.investmentUpgradeResult ? `<p class="notice">${state.investmentUpgradeResult.message}</p>` : ""}
        </section>
      ` : ""}
      <h3>是否继续深化？</h3>
      <div class="actions-row">
        ${canGoDeeper ? `<button class="primary" data-action="continue-learning">继续深化</button>` : ""}
        <button class="secondary" data-action="finish-learning">结束并结算</button>
      </div>
    </section>
  `);
}

function renderFinalSummary() {
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">本次学习已结算</p>
      <h2>成长记录已恢复</h2>
      <p class="muted">本次学习会话、AI 学习指令、成长证据和 EXP 已保存在本地。</p>
      <div class="actions-row">
        <button class="primary" data-action="select-category">开始学习</button>
        <button class="secondary" data-action="home">返回角色卡</button>
      </div>
    </section>
  `);
}

function render() {
  const views = {
    welcome: renderWelcome,
    install_help: renderInstallHelp,
    cloud_settings: renderCloudSettings,
    questionnaire: renderQuestionnaire,
    questionnaire_feedback: renderQuestionnaireFeedback,
    home: renderHome,
    identity_report: renderIdentityReport,
    category: renderCategorySelect,
    investment_goal: renderInvestmentGoalSelect,
    investment_diagnostic: renderInvestmentDiagnostic,
    investment_feedback: renderInvestmentFeedback,
    subject: renderSubjectSelect,
    current_level: renderCurrentLevelSelect,
    goal_branch: renderGoalBranchSelect,
    training_mode: renderStatusAssessment,
    status_assessment: renderStatusAssessment,
    goal: renderCurrentLevelSelect,
    instruction_intro: renderInstructionIntro,
    learning_instruction: renderLearningInstruction,
    prompt: renderLearningInstruction,
    active_session: renderActiveSession,
    settlement: renderSettlement,
    final_summary: renderFinalSummary
  };
  app.innerHTML = (views[state.screen] || renderWelcome)();
}

app.addEventListener("change", (event) => {
  const input = event.target;
  if (input.matches("select[data-action='switch-profile']")) {
    switchToProfile(input.value);
    return;
  }

  if (input.matches("input[type='radio']")) {
    const draftAnswers = { ...(state.draftAnswers || {}), [input.name]: Number(input.value) };
    commit({ draftAnswers });
  }
});

app.addEventListener("input", (event) => {
  const input = event.target;
  if (input.matches("[data-action='feedback-draft']")) {
    state = persistActiveProfile({ ...state, feedbackDraft: input.value });
    saveState(state);
  }
});

app.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "cloud-settings-form") {
    const formData = new FormData(event.target);
    saveCloudConfig({
      supabaseUrl: formData.get("supabaseUrl"),
      anonKey: formData.get("anonKey")
    });
    flushCloudQueue().finally(render);
    render();
    return;
  }

  if (event.target.id !== "questionnaire-form") return;
  const user = { id: makeId("user"), createdAt: now(), hasCompletedQuestionnaire: true };
  const questionnaireResponse = {
    id: makeId("questionnaire"),
    userId: user.id,
    answers: state.draftAnswers,
    submittedAt: now()
  };
  const parameters = scoreQuestionnaire(state.draftAnswers, user.id);
  let nextState = {
    ...state,
    user,
    questionnaireResponse,
    parameters,
    identity: generateIdentity(parameters, user.id),
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
    targetInvestmentTrack: null,
    currentInvestmentLevel: null,
    investmentDiagnosticAnswers: null,
    investmentDiagnosticResult: null,
    investmentUpgradeResult: null,
    selectedTrainingMode: null,
    currentStatusId: null,
    energyLevel: null,
    fatigueLevel: null,
    focusLevel: null,
    motivationLevel: null,
    plannedDuration: null,
    activePromptId: null,
    activeSessionId: null,
    lastCompletedSession: null,
    draftAnswers: undefined,
    screen: "questionnaire_feedback"
  };
  nextState = addGrowthEvidence(nextState, {
    type: "questionnaire_completed",
    label: "完成问卷",
    evidenceId: makeId("evidence"),
    createdAt: now()
  });
  nextState = addGrowthEvidence(nextState, {
    type: "identity_created",
    label: "创建学习者身份",
    evidenceId: makeId("evidence"),
    createdAt: now()
  });
  state = persistActiveProfile(nextState);
  queueCloudEvent("questionnaire_completed", state, {
    user,
    questionnaireResponse,
    parameters,
    identity: state.identity,
    evidence: state.evidence.slice(-2)
  });
  saveState(state);
  render();
});

app.addEventListener("click", async (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;

  if (action === "start-questionnaire") commit({ screen: "questionnaire" });
  if (action === "install-help") commit({ screen: "install_help" });
  if (action === "cloud-settings") commit({ screen: "cloud_settings" });
  if (action === "flush-cloud") {
    flushCloudQueue().finally(render);
  }
  if (action === "test-cloud") {
    queueTestCloudEvent(state);
    flushCloudQueue().finally(render);
  }
  if (action === "clear-cloud") {
    clearCloudConfig();
    render();
  }
  if (action === "welcome") commit({ screen: "welcome" });
  if (action === "create-new-role") {
    commit({
      draftAnswers: undefined,
      screen: "questionnaire"
    });
  }
  if (action === "home") commit({ screen: "home" });
  if (action === "identity-report") commit({ screen: "identity_report" });
  if (action === "select-category") {
    commit({
      screen: "category",
      selectedLearningModuleId: null,
      selectedCategory: null,
      selectedGoalId: null,
      selectedSubjectId: null,
      selectedCurrentLevelId: null,
      selectedGoalBranchId: null,
      selectedLearningGoalId: null,
      targetInvestmentTrack: null,
      currentInvestmentLevel: null,
      investmentDiagnosticAnswers: null,
      investmentDiagnosticResult: null,
      investmentUpgradeResult: null,
      selectedTrainingMode: null,
      currentStatusId: null,
      energyLevel: null,
      fatigueLevel: null,
      focusLevel: null,
      motivationLevel: null,
      plannedDuration: null
    });
  }
  if (action === "choose-learning-module" || action === "choose-category") {
    const moduleId = actionTarget.dataset.module || actionTarget.dataset.category;
    commit({
      selectedLearningModuleId: moduleId,
      selectedCategory: moduleId,
      selectedGoalId: null,
      selectedSubjectId: null,
      selectedCurrentLevelId: null,
      selectedGoalBranchId: null,
      selectedLearningGoalId: null,
      targetInvestmentTrack: null,
      currentInvestmentLevel: null,
      investmentDiagnosticAnswers: null,
      investmentDiagnosticResult: null,
      investmentUpgradeResult: null,
      selectedTrainingMode: null,
      currentStatusId: null,
      energyLevel: null,
      fatigueLevel: null,
      focusLevel: null,
      motivationLevel: null,
      plannedDuration: null,
      screen: moduleId === INVESTMENT_MODULE_ID ? "investment_goal" : "subject"
    });
  }
  if (action === "choose-investment-track") {
    const trackId = actionTarget.dataset.track;
    commit({
      selectedLearningModuleId: INVESTMENT_MODULE_ID,
      selectedCategory: INVESTMENT_MODULE_ID,
      selectedSubjectId: "investment_knowledge",
      selectedGoalId: trackId,
      selectedGoalBranchId: trackId,
      selectedLearningGoalId: trackId,
      targetInvestmentTrack: trackId,
      currentInvestmentLevel: null,
      investmentDiagnosticAnswers: {},
      investmentDiagnosticResult: null,
      investmentUpgradeResult: null,
      selectedTrainingMode: null,
      currentStatusId: null,
      plannedDuration: null,
      screen: "investment_diagnostic"
    });
    queueCloudEvent("investment_goal_selected", state, { trackId });
  }
  if (action === "choose-investment-answer") {
    const questionId = actionTarget.dataset.question;
    const optionId = actionTarget.dataset.option;
    commit({
      investmentDiagnosticAnswers: {
        ...(state.investmentDiagnosticAnswers || {}),
        [questionId]: optionId
      }
    });
  }
  if (action === "submit-investment-diagnostic") {
    const result = diagnoseInvestmentLevel(state.targetInvestmentTrack, state.investmentDiagnosticAnswers || {});
    updateState((nextState) => {
      let updated = {
        ...nextState,
        investmentDiagnosticResult: result,
        currentInvestmentLevel: result.currentLevelId,
        selectedCurrentLevelId: `investment_${result.currentLevelId.toLowerCase()}`,
        selectedTrainingMode: "light_start",
        currentStatusId: "tired",
        energyLevel: 5,
        fatigueLevel: 6,
        focusLevel: 5,
        motivationLevel: 6,
        plannedDuration: 8,
        screen: "investment_feedback"
      };
      updated = addGrowthEvidence(updated, {
        type: "investment_level_diagnosed",
        label: "完成投资学习起点诊断",
        evidenceId: makeId("evidence"),
        createdAt: now()
      });
      queueCloudEvent("investment_diagnostic_completed", updated, { result });
      return updated;
    });
  }
  if (action === "investment-goal-back") commit({ screen: "investment_goal", targetInvestmentTrack: null, investmentDiagnosticAnswers: null });
  if (action === "investment-diagnostic-back") commit({ screen: "investment_diagnostic" });
  if (action === "generate-investment-instruction") {
    updateState((nextState) =>
      createPrompt(
        {
          ...nextState,
          showInstructionGuide: !nextState.hasSeenInstructionGuide,
          selectedTrainingMode: "light_start",
          plannedDuration: 8
        },
        "light_start"
      )
    );
  }
  if (action === "choose-subject") {
    const isLanguage = state.selectedLearningModuleId === "language";
    commit({
      selectedSubjectId: actionTarget.dataset.subject,
      selectedCurrentLevelId: null,
      selectedGoalBranchId: null,
      selectedLearningGoalId: null,
      selectedTrainingMode: null,
      currentStatusId: null,
      selectedGoalId: null,
      screen: isLanguage ? "goal_branch" : "current_level"
    });
  }
  if (action === "choose-current-level") {
    commit({
      selectedCurrentLevelId: actionTarget.dataset.level,
      selectedGoalBranchId: null,
      selectedLearningGoalId: null,
      selectedTrainingMode: null,
      currentStatusId: null,
      selectedGoalId: null,
      screen: "goal_branch"
    });
  }
  if (action === "choose-learning-goal" || action === "choose-goal-branch" || action === "choose-goal") {
    const goalId = actionTarget.dataset.goal || actionTarget.dataset.branch;
    const languageTarget = state.selectedLearningModuleId === "language" ? languageTargetById(goalId) : null;
    commit({
      selectedLearningGoalId: goalId,
      selectedGoalBranchId: goalId,
      selectedGoalId: goalId,
      selectedSubjectId: languageTarget?.subjectId || state.selectedSubjectId,
      selectedCurrentLevelId: languageTarget?.levelId || state.selectedCurrentLevelId,
      selectedTrainingMode: null,
      currentStatusId: null,
      energyLevel: null,
      fatigueLevel: null,
      focusLevel: null,
      motivationLevel: null,
      plannedDuration: null,
      screen: "status_assessment"
    });
  }
  if (action === "choose-current-status") {
    const status = statusById(actionTarget.dataset.status);
    if (!status) return;
    commit({
      currentStatusId: status.id,
      selectedTrainingMode: status.trainingMode,
      plannedDuration: status.plannedDuration,
      energyLevel: status.energyLevel,
      fatigueLevel: status.fatigueLevel,
      focusLevel: status.focusLevel,
      motivationLevel: status.motivationLevel,
      copyNotice: "",
      showInstructionGuide: !state.hasSeenInstructionGuide,
      screen: "instruction_intro"
    });
  }
  if (action === "module-back") commit({ screen: "subject", selectedSubjectId: null, selectedCurrentLevelId: null });
  if (action === "level-back") commit({ screen: "current_level", selectedCurrentLevelId: null, selectedGoalBranchId: null, selectedLearningGoalId: null, selectedTrainingMode: null, currentStatusId: null });
  if (action === "branch-back") commit({ screen: "goal_branch", selectedGoalBranchId: null, selectedLearningGoalId: null, selectedTrainingMode: null, currentStatusId: null });
  if (action === "mode-back" || action === "goal-back") commit({ screen: "status_assessment" });
  if (action === "dismiss-instruction-guide") {
    commit({ hasSeenInstructionGuide: true, showInstructionGuide: false });
  }
  if (action === "generate-instruction") {
    updateState((nextState) =>
      createPrompt(
        { ...nextState, showInstructionGuide: false, hasSeenInstructionGuide: true },
        nextState.selectedTrainingMode || "light_start"
      )
    );
  }
  if (action === "copy-instruction" || action === "copy-prompt") {
    const copied = await copyText(activePrompt().text);
    commit({ copyNotice: copied ? "学习指令已复制。现在粘贴到 ChatGPT / Claude 中发送即可。" : "请手动选中文本复制。" });
  }
  if (action === "start-session") {
    const prompt = activePrompt();
    const session = {
      id: makeId("session"),
      userId: state.user.id,
      category: prompt.category,
      goalId: prompt.goalId,
      learningModule: prompt.learningModule,
      learningModuleId: prompt.learningModuleId,
      subject: prompt.subject,
      subjectId: prompt.subjectId,
      currentLevel: prompt.currentLevel,
      currentLevelId: prompt.currentLevelId,
      learningGoal: prompt.learningGoal,
      learningGoalId: prompt.learningGoalId,
      goalBranchId: prompt.goalBranchId,
      targetInvestmentTrack: prompt.targetInvestmentTrack,
      currentInvestmentLevel: prompt.currentInvestmentLevel,
      investmentLevelLabel: prompt.investmentLevelLabel,
      investmentTopic: prompt.investmentTopic,
      levelEvidenceId: prompt.levelEvidenceId,
      likelyEvidenceIds: prompt.likelyEvidenceIds || [],
      currentStatus: prompt.currentStatus,
      energyLevel: prompt.energyLevel,
      fatigueLevel: prompt.fatigueLevel,
      focusLevel: prompt.focusLevel,
      plannedDuration: prompt.plannedDuration,
      generatedPrompt: prompt.text,
      mode: prompt.mode,
      promptId: prompt.id,
      promptText: prompt.text,
      status: "active",
      startTime: now(),
      evidenceIds: [],
      expGained: 0,
      createdAt: now(),
      updatedAt: now()
    };
    queueCloudEvent("session_started", state, { session });
    if (session.learningModuleId === INVESTMENT_MODULE_ID) {
      queueCloudEvent("investment_session_started", state, { session });
    }
    commit({ sessions: [...state.sessions, session], activeSessionId: session.id, copyNotice: "", screen: "active_session" });
  }
  if (action === "complete-session") {
    updateState((nextState) => {
      const session = nextState.sessions.find((item) => item.id === nextState.activeSessionId);
      const endTime = now();
      const durationMinutes = Math.max(
        1,
        Math.round((new Date(endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
      );
      const isInvestmentSession = session.learningModuleId === INVESTMENT_MODULE_ID;
      const evidenceType = isInvestmentSession
        ? session.mode === "deep"
          ? "investment_case_analysis_completed"
          : session.mode === "standard"
            ? "investment_structured_explanation_completed"
            : "investment_light_start_completed"
        : session.mode === "deep"
          ? "deep_session_completed"
          : session.mode === "standard"
            ? "standard_session_completed"
            : "light_start_completed";
      const label =
        session.mode === "deep"
          ? "完成深度学习"
          : session.mode === "standard"
            ? "完成标准深化"
            : "完成轻启动";
      let updated = {
        ...nextState,
        sessions: nextState.sessions.map((item) =>
          item.id === session.id
            ? { ...item, status: "completed", endTime, durationMinutes, updatedAt: endTime }
            : item
        )
      };
      updated = addGrowthEvidence(updated, {
        type: evidenceType,
        label,
        sessionId: session.id,
        evidenceId: makeId("evidence"),
        createdAt: now()
      });
      const evidence = updated.evidence[updated.evidence.length - 1];
      updated.sessions = updated.sessions.map((item) =>
        item.id === session.id
          ? { ...item, evidenceIds: [evidence.id], expGained: evidence.finalExp }
          : item
      );
      const completedSession = updated.sessions.find((item) => item.id === session.id);
      queueCloudEvent("session_completed", updated, {
        session: completedSession,
        evidence
      });
      if (isInvestmentSession) {
        queueCloudEvent("investment_session_completed", updated, {
          session: completedSession,
          evidence
        });
      }
      return {
        ...updated,
        activeSessionId: null,
        feedbackDraft: "",
        lastCompletedSession: completedSession,
        screen: "settlement"
      };
    });
  }
  if (action === "continue-learning") {
    const mode = state.lastCompletedSession.mode === "light_start" ? "standard" : "deep";
    updateState((nextState) =>
      createPrompt({ ...nextState, feedbackDraft: "", selectedTrainingMode: mode, plannedDuration: MODE_DURATION[mode] }, mode)
    );
  }
  if (action === "settle-with-feedback") {
    const feedbackText = app.querySelector("[data-action='feedback-draft']")?.value.trim() || "";
    updateState((nextState) => {
      let updated = {
        ...nextState,
        feedbackDraft: "",
        sessions: nextState.sessions.map((session) =>
          session.id === nextState.lastCompletedSession.id
            ? { ...session, aiFeedbackText: feedbackText, updatedAt: now() }
            : session
        )
      };
      const completedSession = updated.sessions.find((session) => session.id === updated.lastCompletedSession.id);
      updated.lastCompletedSession = completedSession;

      if (feedbackText) {
        updated = addGrowthEvidence(updated, {
          type: "feedback_completed",
          label: "记录 AI 反馈",
          sessionId: completedSession.id,
          evidenceId: makeId("evidence"),
          createdAt: now()
        });
      }

      queueCloudEvent("feedback_recorded", updated, {
        session: updated.lastCompletedSession,
        feedbackText,
        evidence: feedbackText ? updated.evidence[updated.evidence.length - 1] : null
      });

      return { ...updated, screen: "final_summary" };
    });
  }
  if (action === "answer-investment-upgrade") {
    const levelId = actionTarget.dataset.level;
    const optionId = actionTarget.dataset.option;
    const result = evaluateInvestmentUpgradeAnswer(levelId, optionId);
    updateState((nextState) => {
      let updated = addGrowthEvidence(nextState, {
        type: "investment_upgrade_question_answered",
        label: "完成投资学习升级问题",
        sessionId: nextState.lastCompletedSession?.id,
        evidenceId: makeId("evidence"),
        createdAt: now()
      });
      if (result.isCorrect) {
        updated = {
          ...updated,
          currentInvestmentLevel: result.toLevel || updated.currentInvestmentLevel
        };
        updated = addGrowthEvidence(updated, {
          type: "investment_level_up_recommended",
          label: "投资学习进入下一阶段建议已形成",
          sessionId: nextState.lastCompletedSession?.id,
          evidenceId: makeId("evidence"),
          createdAt: now()
        });
      }
      const latestEvidence = updated.evidence.slice(-2);
      queueCloudEvent("investment_upgrade_question_answered", updated, { result, evidence: latestEvidence });
      if (result.isCorrect) {
        queueCloudEvent("investment_level_up_recommended", updated, { result, evidence: latestEvidence });
      }
      return {
        ...updated,
        investmentUpgradeResult: result
      };
    });
  }
  if (action === "finish-learning") commit({ feedbackDraft: "", screen: "final_summary" });
});

window.deepflowReset = () => {
  state = resetState();
  render();
};

render();
