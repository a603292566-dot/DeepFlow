import {
  DIMENSION_LABELS,
  IDENTITY_HINTS,
  IDENTITY_LABELS,
  LEARNING_CATEGORIES,
  LEARNING_GOALS,
  MODE_LABELS,
  QUESTIONNAIRE_ITEMS
} from "./domain.js";
import { getIdentityReportTemplate } from "./identityReportTemplates.js";
import { defaultLanguageProfile, generatePrompt, goalById } from "./promptEngine.js";
import {
  applyExp,
  bonusText,
  calculateExp,
  generateIdentity,
  parameterGrowthText,
  scoreQuestionnaire
} from "./scoring.js";
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
  "selectedCategory",
  "selectedGoalId",
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

function addEvidence(nextState, type, label, sessionId) {
  const result = calculateExp(type, nextState.identity.mainIdentity, nextState.identity.level);
  const evidence = {
    id: makeId("evidence"),
    userId: nextState.user.id,
    type,
    label,
    category: nextState.selectedCategory || undefined,
    goalId: nextState.selectedGoalId || undefined,
    sessionId,
    ...result,
    createdAt: now()
  };

  return {
    ...nextState,
    evidence: [...nextState.evidence, evidence],
    identity: applyExp(nextState.identity, evidence.finalExp)
  };
}

function createPrompt(nextState, mode) {
  const goal = goalById(nextState.selectedGoalId);
  const context = {
    user: nextState.user,
    identity: nextState.identity,
    parameters: nextState.parameters,
    category: nextState.selectedCategory,
    goal,
    mode,
    currentState: "normal",
    recentSessions: nextState.sessions.slice(-3),
    recentEvidence: nextState.evidence.slice(-5),
    activeBonusText: bonusText(nextState.identity.mainIdentity),
    languageProfile:
      nextState.selectedCategory === "language" ? defaultLanguageProfile(nextState.user.id, goal) : null
  };
  const generated = {
    id: makeId("prompt"),
    userId: nextState.user.id,
    category: nextState.selectedCategory,
    goalId: nextState.selectedGoalId,
    mode,
    identity: nextState.identity.mainIdentity,
    text: generatePrompt(context),
    createdAt: now()
  };

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
  return LEARNING_CATEGORIES.find((category) => category.id === categoryId)?.label || categoryId;
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
        <button class="ghost" data-action="install-help">添加到主屏幕</button>
      </div>
    `
    : state.identity
      ? `<div class="profile-controls"><button class="ghost" data-action="create-new-role">创建新角色</button><button class="ghost" data-action="home">角色卡</button><button class="ghost" data-action="install-help">添加到主屏幕</button></div>`
      : `<div class="profile-controls"><button class="ghost" data-action="install-help">添加到主屏幕</button></div>`;

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
      <p class="eyebrow">学习内容</p>
      <h2>选择一个入口</h2>
      <div class="choice-grid">
        ${LEARNING_CATEGORIES.map((category) => `
          <button class="choice" data-action="choose-category" data-category="${category.id}">${category.label}</button>
        `).join("")}
      </div>
    </section>
  `);
}

function renderGoalSelect() {
  const goals = LEARNING_GOALS.filter((goal) => goal.category === state.selectedCategory);
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">学习目标</p>
      <h2>选择本次目标</h2>
      <div class="choice-grid">
        ${goals.map((goal) => `
          <button class="choice" data-action="choose-goal" data-goal="${goal.id}">${goal.label}</button>
        `).join("")}
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
  const goal = goalById(state.selectedGoalId);
  return shell(`
    ${renderInstructionGuide()}
    ${renderRoleCard()}
    <section class="panel instruction-intro">
      <p class="eyebrow">生成学习指令</p>
      <h2>${goal.label}</h2>
      <p class="muted">DeepFlow 会根据你的学习者身份和学习目标，生成一段给 AI 老师的学习指令。你只需要复制它，粘贴到 ChatGPT / Claude 等 AI 工具中学习。学完后回到 DeepFlow 点击完成，系统会记录时间并生成成长反馈。</p>
      <div class="actions-row">
        <button class="primary" data-action="generate-instruction">生成 AI 学习指令</button>
        <button class="ghost" data-action="goal-back">重新选择目标</button>
      </div>
    </section>
  `);
}

function renderLearningInstruction() {
  const prompt = activePrompt();
  const goal = goalById(prompt.goalId);
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${MODE_LABELS[prompt.mode]}</p>
          <h2>复制 AI 学习指令</h2>
        </div>
        <span class="pill">${goal.label}</span>
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
  return shell(`
    ${renderRoleCard()}
    <section class="panel">
      <p class="eyebrow">成长证据已记录</p>
      <h2>${completeTitle}</h2>
      <div class="settlement">
        <p>学习内容：${categoryLabel(session.category)}</p>
        <p>学习目标：${goalById(session.goalId).label}</p>
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
    questionnaire: renderQuestionnaire,
    questionnaire_feedback: renderQuestionnaireFeedback,
    home: renderHome,
    identity_report: renderIdentityReport,
    category: renderCategorySelect,
    goal: renderGoalSelect,
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
    selectedCategory: null,
    selectedGoalId: null,
    activePromptId: null,
    activeSessionId: null,
    lastCompletedSession: null,
    draftAnswers: undefined,
    screen: "questionnaire_feedback"
  };
  nextState = addEvidence(nextState, "questionnaire_completed", "完成问卷");
  nextState = addEvidence(nextState, "identity_created", "创建学习者身份");
  state = persistActiveProfile(nextState);
  saveState(state);
  render();
});

app.addEventListener("click", async (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;

  if (action === "start-questionnaire") commit({ screen: "questionnaire" });
  if (action === "install-help") commit({ screen: "install_help" });
  if (action === "welcome") commit({ screen: "welcome" });
  if (action === "create-new-role") {
    commit({
      draftAnswers: undefined,
      screen: "questionnaire"
    });
  }
  if (action === "home") commit({ screen: "home" });
  if (action === "identity-report") commit({ screen: "identity_report" });
  if (action === "select-category") commit({ screen: "category", selectedCategory: null, selectedGoalId: null });
  if (action === "choose-category") {
    commit({ selectedCategory: actionTarget.dataset.category, selectedGoalId: null, screen: "goal" });
  }
  if (action === "choose-goal") {
    commit({
      selectedGoalId: actionTarget.dataset.goal,
      copyNotice: "",
      showInstructionGuide: !state.hasSeenInstructionGuide,
      screen: "instruction_intro"
    });
  }
  if (action === "goal-back") commit({ screen: "goal", selectedGoalId: null });
  if (action === "dismiss-instruction-guide") {
    commit({ hasSeenInstructionGuide: true, showInstructionGuide: false });
  }
  if (action === "generate-instruction") {
    updateState((nextState) =>
      createPrompt({ ...nextState, showInstructionGuide: false, hasSeenInstructionGuide: true }, "light_start")
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
      const evidenceType =
        session.mode === "deep"
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
      updated = addEvidence(updated, evidenceType, label, session.id);
      const evidence = updated.evidence[updated.evidence.length - 1];
      updated.sessions = updated.sessions.map((item) =>
        item.id === session.id
          ? { ...item, evidenceIds: [evidence.id], expGained: evidence.finalExp }
          : item
      );
      const completedSession = updated.sessions.find((item) => item.id === session.id);
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
    updateState((nextState) => createPrompt({ ...nextState, feedbackDraft: "" }, mode));
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
        updated = addEvidence(updated, "feedback_completed", "记录 AI 反馈", completedSession.id);
      }

      return { ...updated, screen: "final_summary" };
    });
  }
  if (action === "finish-learning") commit({ feedbackDraft: "", screen: "final_summary" });
});

window.deepflowReset = () => {
  state = resetState();
  render();
};

render();
