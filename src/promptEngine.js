import { IDENTITY_LABELS, LEARNING_GOALS, MODE_LABELS } from "./domain.js";

const ZERO_BASE_LEVEL_IDS = new Set(["language_a1", "programming_l0", "math_m0"]);

export function defaultLanguageProfile(userId, goal) {
  return {
    userId,
    targetLanguage: goal.targetLanguage,
    targetLevel: goal.targetLevel,
    examGoal: goal.examGoal,
    currentEstimatedLevel: goal.targetLevel === "A1 / 零基础" ? "A1 / 零基础启动" : goal.targetLevel,
    preferredModules: ["vocabulary_chunks", "structured_output", "review"],
    strongModules: ["review"],
    weakModules: ["structured_output"],
    outputPreference: "structured_first",
    avoidTasks: ["一开始长篇自由写作", "完整模拟考试"],
    reviewQueue: [],
    commonMistakes: [],
    lastUpdatedAt: new Date().toISOString()
  };
}

export function generatePrompt(context) {
  if (context.learningModule?.id === "language" || context.category === "language") return generateLanguagePrompt(context);

  const mainIdentity = IDENTITY_LABELS[context.identity.mainIdentity] || "学习者";
  const secondaryIdentity = IDENTITY_LABELS[context.identity.secondaryIdentity] || "正在形成";
  const learningModule = context.learningModule?.label || context.goal.moduleLabel || context.category || "学习";
  const subject = context.subject?.label || context.goal.subjectLabel || context.goal.label || "未填写";
  const currentLevel = context.currentLevel?.label || context.goal.targetLevel || "未填写";
  const learningGoal = context.learningGoal?.label || context.goal.examGoal || context.goal.label || "未填写";
  const mode = MODE_LABELS[context.mode] || context.trainingMode || "轻启动";
  const isZeroBase = ZERO_BASE_LEVEL_IDS.has(context.currentLevel?.id);
  const zeroBaseRules = isZeroBase ? buildZeroBaseRules(context) : "";
  const l0AiCodingGoalRules = buildL0AiCodingGoalRules(context);
  const levelEvidenceSection = buildLevelEvidenceSection(context);

  return `你现在是 DeepFlow 认知训练教练。

【学习者信息】
* 学习者身份：${mainIdentity}
* 副身份：${secondaryIdentity}
* 当前成长阶段：Lv.${context.identity.level}
* 年龄：未填写
* 受教育程度：未填写
* 当前经验加成方向：${context.expBonusDirection || context.activeBonusText || "成长证据积累"}

【本次学习路径】
* 学习模块：${learningModule}
* 具体学科：${subject}
* 当前水平：${currentLevel}
* 学习目标：${learningGoal}

【当前状态】
* 当前状态：${context.currentStatus || "状态已记录"}
* 自动训练模式：${mode}
* 预计时长：${context.plannedDuration || context.duration}

【材料导向学习规则】
在开始训练前，请先询问用户：

“你是否有想用于本次学习的材料？你可以上传文件、粘贴文本、粘贴题目、粘贴代码或提供文章片段。”

如果用户提供材料：
1. 优先基于用户材料设计训练。
2. 明确区分“材料中已有内容”和“AI 补充内容”。
3. 不要编造材料中不存在的信息。
4. 如果材料不足，请明确提示用户材料不足。
5. 围绕材料生成输入、输出、反馈和正反馈环节。

如果用户没有材料：
1. 根据学习模块、具体学科、当前水平和学习目标生成合适训练内容。
2. 零基础用户应从非常低负荷任务开始。
3. 不要一次性给大量信息。
4. 优先引导用户主动输出。

${zeroBaseRules}

${l0AiCodingGoalRules}

${levelEvidenceSection}

【DeepFlow 训练原则】
1. 目标不是灌输知识，而是训练学习能力。
2. 必须包含输入、输出、反馈、正反馈。
3. 优先引导用户主动输出。
4. 输入与输出比例尽量接近 30:70。
5. 难度应略高于用户当前水平，但不能过载。
6. 每次只给一个小任务，等待用户回答后再反馈。
7. 反馈必须具体、可执行、成长导向。
8. 训练结束后输出 Session Feedback（学习反馈）。
9. 请使用成长语言，不使用失败、落后、断签等表达。
10. 你只负责观察本次学习产生了哪些成长证据，不要直接宣布用户升级；最终层级更新由 DeepFlow 根据多次记录决定。

【训练流程】
1. 先询问用户是否有学习材料。
2. 根据用户是否提供材料，确定训练内容。
3. 说明本次训练目标。
4. 给出第一小步任务。
5. 等待用户回答。
6. 对用户回答进行反馈。
7. 根据表现调整下一步任务。
8. 训练结束后输出 Session Feedback（学习反馈）。

【Session Feedback（学习反馈）格式】
Flow 分数：
疲劳分数：
专注分数：
主要错误类型：
新增知识点：
成长证据：
下一步建议：
建议加入复习队列：`;
}

function generateLanguagePrompt(context) {
  const identity = context.identity || {};
  const mainIdentity = IDENTITY_LABELS[identity.mainIdentity] || context.learnerIdentity || "学习者";
  const secondaryIdentity = IDENTITY_LABELS[identity.secondaryIdentity] || context.secondaryIdentity || "正在形成";
  const profile = context.languageProfile || defaultLanguageProfile(context.user?.id, context.goal);
  const mode = MODE_LABELS[context.mode] || context.trainingMode || "轻启动";
  const plan = context.generatedModulePlan || {};
  const modules = plan.modules?.length ? plan.modules.join(" + ") : "语块积累 + 结构化输出";
  const avoidTasks = [
    ...(profile.avoidTasks || []),
    ...(plan.avoid || [])
  ];
  const reviewQueue = profile.reviewQueue?.length
    ? profile.reviewQueue.map((item) => `- ${item.text}`).join("\n")
    : "- 暂无历史复习项。请生成 3 个适合目标等级的高价值表达作为本次启动材料。";
  const recentSessions = context.recentSessions?.length
    ? context.recentSessions.map((session) => `- ${session.mode} / ${session.durationMinutes || 0} 分钟 / ${session.learningGoal || session.goalId || "学习"}`).join("\n")
    : "- 暂无最近学习记录。";

  return `你是我的${profile.targetLanguage}学习教练，也是 DeepFlow 语言学习教练。

【学习者信息】
* 学习者身份：${mainIdentity}
* 副身份：${secondaryIdentity}
* 当前成长阶段：Lv.${identity.level || context.level || 1}
* 当前经验加成方向：${context.expBonusDirection || context.activeBonusText || "成长证据积累"}

【语言学习目标】
* 目标语言：${profile.targetLanguage}
* 目标等级：${profile.targetLevel}
* 考试 / 长期目标：${profile.examGoal || context.learningGoal?.label || "稳定完成当前等级的理解与表达"}
* 当前估计水平：${profile.currentEstimatedLevel || profile.targetLevel}

【当前启动状态】
* 当前状态：${context.currentStatus || "状态已记录"}
* 当前模式：${mode}
* 预计时长：${context.plannedDuration || context.duration}

【系统自动选择的模块】
本次优先模块：${modules}
模块选择理由：DeepFlow 根据当前模式、当前状态、语言学习档案、复习队列和最近学习反馈自动选择。用户不需要手动选择阅读、词汇或写作模块。
本次任务形态：${plan.taskShape || "以小输入和结构化输出为主，完成后输出 DeepFlow 回流格式。"}

【语言学习档案】
* 优先模块：${(profile.preferredModules || []).join("、") || "语块积累、结构化输出、复习"}
* 强模块：${(profile.strongModules || []).join("、") || "复习"}
* 弱模块：${(profile.weakModules || []).join("、") || "结构化输出"}
* 输出偏好：${profile.outputPreference || "先给清晰示例，再让我做一个小输出"}
* 避免任务：${avoidTasks.join("、") || "一开始长篇自由写作、完整模拟考试"}

【复习队列】
${reviewQueue}

【最近学习记录】
${recentSessions}

【启动阶梯规则】
${languageModeRules(context.mode)}

【训练流程】
1. 先询问我是否有本次想使用的语言材料；如果没有材料，直接用你生成的短材料开始。
2. 根据本次优先模块生成任务，不要让我手动选择模块。
3. 先给少量输入，再让我完成一个明确输出。
4. 等待我回答后，给简短纠错、正反馈和 1 个下一步建议。
5. 训练结束后输出 DeepFlow 回流格式。

【DeepFlow 回流格式】
完成状态：
本次模式：
目标语言：
目标等级：
本次优先模块：
掌握较好：
需要复习：
未理解内容：
新增表达：
输出难度：
Flow 感：
建议加入复习队列：
下一次建议：`;
}

function languageModeRules(mode) {
  if (mode === "deep") {
    return `深度学习：
- 默认组合：复习队列、较长阅读、论证结构分析、结构化输出、表达升级、知识迁移。
- 可以安排较完整输出，但必须分步进行。
- 必须输出 DeepFlow 回流格式。`;
  }

  if (mode === "standard") {
    return `标准深化：
- 默认组合：Sprachbausteine 复习、短阅读、表达提取、结构化输出、简短纠错。
- 适合 20-30 分钟稳定训练。
- 不生成完整模拟考试。`;
  }

  if (mode === "restart") {
    return `重启：
- 默认优先熟悉表达复习和极低负荷任务。
- 只要求一句话输出。
- 不补偿中断，不使用负面语言。
- 完成后生成 Restart Evidence。`;
  }

  return `轻启动：
- 默认优先 Sprachbausteine / 语块积累、复习旧表达、1 个小填空、1 个造句、简短反馈。
- 不生成完整阅读任务。
- 不要求长作文。
- 不要求完整模拟考试。`;
}

function buildLevelEvidenceSection(context) {
  const levelEvidence = context.levelEvidence;
  if (!levelEvidence) return "";

  const coreAbilities = toBulletList(levelEvidence.coreAbilities);
  const requiredEvidence = toEvidenceList(levelEvidence.requiredEvidence);
  const collectedEvidence = context.collectedEvidence?.length
    ? toEvidenceList(context.collectedEvidence)
    : "- 暂无已记录的本层级证据。";
  const collectedIds = new Set((context.collectedEvidence || []).map((item) => item.id));
  const missingEvidence = levelEvidence.requiredEvidence.filter((item) => !collectedIds.has(item.id));
  const missingEvidenceList = missingEvidence.length ? toEvidenceList(missingEvidence) : "- 本层级关键证据已经比较完整。";
  const likelyEvidence = levelEvidence.requiredEvidence.filter((item) => (context.likelyEvidenceIds || []).includes(item.id));
  const likelyEvidenceList = likelyEvidence.length ? toEvidenceList(likelyEvidence) : "- 请根据用户表现选择最贴近的本层级证据。";

  return `【当前能力层级】
当前能力层级：${levelEvidence.label}
下一层级：${levelEvidence.nextLevelLabel}
本层级核心能力：
${coreAbilities}

训练边界：
1. 请只训练当前层级的能力，不要提前进入下一层级任务。
2. 如果用户表现很好，可以在反馈中建议“下一次尝试更高一层”，但本次不要直接升级任务难度。
3. 不要直接宣布用户升级，最终升级由 DeepFlow 根据多次成长证据决定。

【本层级成长证据】
升级建议阈值：累计 ${levelEvidence.requiredCount} 条以上关键证据后，可以建议用户尝试 ${levelEvidence.nextLevelLabel}。
本层级关键证据：
${requiredEvidence}

已获得证据：
${collectedEvidence}

还缺少的证据：
${missingEvidenceList}

【本次可能产生的证据】
${likelyEvidenceList}

【DeepFlow Level Evidence 回流格式】
训练结束时，请在 Session Feedback 后额外输出以下固定格式：

DeepFlow Level Evidence:
本次训练层级：${levelEvidence.label}
本次学习目标：${context.learningGoal?.label || "未填写"}
本次产生的成长证据：
- evidence_id:
- evidence_label:
- evidence_strength: weak / normal / strong
- reason:
本次尚未形成的证据：
-
是否建议继续当前层级：是 / 否
是否建议尝试下一层级：是 / 否
建议理由：
下一次建议训练：`;
}

function toBulletList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function toEvidenceList(items) {
  return items.map((item) => `- ${item.id}：${item.label}`).join("\n");
}

function buildZeroBaseRules(context) {
  const moduleId = context.learningModule?.id || context.category;
  const programmingRules =
    moduleId === "programming"
      ? `
编程零基础额外规则：
1. 不要默认用户理解 function（函数）、array（数组）、object（对象）、参数、返回值、测试等概念。
2. 不要要求用户一开始写代码。
3. 代码例子不超过 3-5 行。
4. 微型任务只能要求用户用自然语言描述“这段代码大概做了什么”。
5. 英语专用名词首次出现时必须加中文解释，例如 function（函数）、variable（变量）、button（按钮）、component（组件）。`
      : "";

  return `【零基础低启动规则】
1. 使用低启动负荷任务。
2. 不假设用户已有基础知识。
3. 从生活类比、简单识别、自然语言解释开始。
4. 不要求用户一开始完成复杂输出。
5. 如果用户没有材料，可以跳过材料输入，由你自动生成入门训练内容。
${programmingRules}`;
}

function buildL0AiCodingGoalRules(context) {
  const isL0AiCoding =
    context.learningModule?.id === "programming" &&
    context.subject?.id === "ai_coding" &&
    context.currentLevel?.id === "programming_l0";

  if (!isL0AiCoding) return "";

  const goalId = context.learningGoal?.id;
  if (goalId === "programming_l0_code_literacy") return buildCodeLiteracyRules();
  if (goalId === "programming_l0_feature_literacy") return buildFeatureLiteracyRules();
  if (goalId === "programming_l0_github_codex") return buildGithubCodexRules();
  return "";
}

function buildCodeLiteracyRules() {
  return `【本次 L0 目标：认识代码】
请严格围绕“认识代码”设计训练：
1. 不假设用户有任何编程基础。
2. 用生活类比解释代码是什么。
3. 解释 HTML（网页结构）、CSS（样式规则）、JavaScript（交互逻辑）分别负责什么。
4. 每个英语编程术语首次出现时必须加中文解释，例如 function（函数）、const（常量声明）、render（渲染）、state（状态）。
5. 如果用户粘贴 DeepFlow 项目代码，先解释这段代码整体在做什么，再逐行解释。
6. 每次只解释少量代码，不要一次性讲太多。
7. 最后总结本次最重要的 3-5 个编程术语。`;
}

function buildFeatureLiteracyRules() {
  return `【本次 L0 目标：学习功能】
请严格围绕“把想法说成清晰功能需求”设计训练：
1. 不要求用户直接写代码。
2. 先让用户用自然语言描述想实现的功能。
3. 帮用户把功能拆成：
   - 用户看到什么页面
   - 用户点击什么按钮
   - 系统保存什么数据
   - 页面如何跳转
   - Codex（编程代理）需要修改哪些部分
4. 把模糊需求改写成清晰的 Codex（编程代理）开发任务。
5. 每个英语产品或代码术语首次出现时必须加中文解释，例如 page（页面）、button（按钮）、data（数据）、flow（流程）、state（状态）、component（组件）。
6. 目标是训练用户“把想法说成清晰功能需求”的能力。`;
}

function buildGithubCodexRules() {
  return `【本次 L0 目标：学习 GitHub / Codex】
请严格围绕“看懂项目推进中的提交、推送和部署”设计训练：
1. 不假设用户懂 Git、GitHub 或命令行。
2. 用 DeepFlow 当前项目推进场景解释术语。
3. 解释以下术语时，首次出现必须加中文解释：
   - Git（代码版本管理系统）
   - GitHub（代码托管平台）
   - GitHub Desktop（GitHub 图形客户端）
   - Codex（编程代理）
   - Repository / Repo（代码仓库）
   - Branch（分支）
   - main（主分支）
   - origin（远程仓库）
   - Add（添加）
   - Commit（提交）
   - Summary（提交摘要）
   - Description（详细说明）
   - Push（推送）
   - Pull（拉取）
   - Fetch（获取远程状态）
   - Build（构建）
   - Deploy（部署）
   - Vercel（部署平台）
4. 重点训练用户看懂 GitHub Desktop（GitHub 图形客户端）界面和 Codex（编程代理）修改记录。
5. 每次只讲一个小操作，不要一次性解释全部概念。
6. 目标是让用户能够独立完成：
   - 看懂 Changes（改动）
   - 写 Summary（提交摘要）
   - Commit to main（提交到主分支）
   - Push origin（推送到远程仓库）
   - 查看部署结果。`;
}

export function goalById(goalId) {
  return LEARNING_GOALS.find((goal) => goal.id === goalId);
}
