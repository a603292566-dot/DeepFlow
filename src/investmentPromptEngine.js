import { IDENTITY_LABELS, MODE_LABELS } from "./domain.js";
import {
  investmentLevelById,
  investmentTopicForMode,
  investmentTrackById,
  investmentUpgradeQuestionForLevel
} from "./investmentLearning.js";

export function generateInvestmentPrompt(context) {
  const identity = context.identity || {};
  const mainIdentity = IDENTITY_LABELS[identity.mainIdentity] || context.learnerIdentity || "学习者";
  const secondaryIdentity = IDENTITY_LABELS[identity.secondaryIdentity] || context.secondaryIdentity || "正在形成";
  const mode = MODE_LABELS[context.mode] || context.trainingMode || "轻启动";
  const track = context.investmentTrack || investmentTrackById(context.investmentTrackId);
  const level = context.investmentLevel || investmentLevelById(context.currentInvestmentLevel || context.currentInvestmentLevelId);
  const topic = context.investmentTopic || investmentTopicForMode(level?.id, context.mode);
  const upgradeQuestion = context.investmentUpgradeQuestion || investmentUpgradeQuestionForLevel(level?.id);
  const includeUpgradeQuestion = Boolean(context.shouldIncludeUpgradeQuestion && upgradeQuestion);

  return `你现在是 DeepFlow 投资知识学习教练。

【学习者信息】
* 学习者身份：${mainIdentity}
* 副身份：${secondaryIdentity}
* 当前成长阶段：Lv.${identity.level || context.level || 1}
* 当前经验加成方向：${context.expBonusDirection || context.activeBonusText || "成长证据积累"}

【本次投资学习路径】
* 学习模块：投资知识学习
* 目标方向：${track?.label || "投资入门"}
* 当前内部水准：${level?.label || "L0 完全小白"}
* 当前能力画像：${level?.summary || "投资知识正在建立"}
* 当前训练模式：${mode}
* 当前状态：${context.currentStatus || "低负荷启动"}
* 预计时长：${context.plannedDuration || context.duration || "8 分钟"}
* 本次自动选择主题：${topic}

【投资学习边界】
1. 本次学习只做投资知识教育。
2. 不提供具体买卖建议。
3. 不推荐个股、基金或具体产品。
4. 不承诺收益。
5. 不根据用户资金情况给具体配置方案。
6. 所有内容仅用于理解概念和训练判断框架。
7. 如果需要举例，请使用虚构公司、虚构基金或一般性市场场景，不使用真实推荐语气。

【风险提示】
投资有风险，价格会波动，历史表现不代表未来结果。学习目标是提升概念理解、风险意识和判断框架，不是生成交易结论。

【本次任务范围】
${investmentModeRules(context.mode, level, topic)}

【输出要求】
1. 先用一句话说明本次训练目标。
2. 解释一个核心概念。
3. 给一个直观类比。
4. 给一个最小例子，例子必须是非荐股、非产品推荐。
5. 让我回答一个小问题或完成一个结构化解释。
6. 等待我回答后，给简短反馈和成长语言正反馈。
7. 如需提到风险，请具体指出“需要理解的风险点”，不要制造焦虑。

${includeUpgradeQuestion ? investmentUpgradeSection(upgradeQuestion) : "【升级问题】\n本次不主动触发升级问题。请先完成当前训练，并在回流格式中说明是否建议下次触发升级问题。"}

【DeepFlow 回流格式】
完成状态：
本次模块：投资知识学习
目标方向：
当前内部水准：
本次主题：
掌握较好：
需要复习：
未理解内容：
输出难度：
Flow 感：
是否触发升级问题：
升级问题结果：
建议加入复习队列：
成长证据：`;
}

function investmentModeRules(mode, level, topic) {
  if (mode === "deep") {
    return `深度学习：
- 围绕「${topic}」做一个较完整的非荐股案例分析。
- 引导用户区分事实、假设、风险和判断。
- 输出一个简短的投资判断框架，而不是具体买卖结论。`;
  }

  if (mode === "standard") {
    return `标准深化：
- 复习轻启动概念。
- 引入一个相邻概念。
- 给一个现实但非荐股的例子。
- 让用户完成结构化解释。
- 生成复习项或升级问题建议。`;
  }

  return `轻启动：
- 预计 5-10 分钟。
- 只讲一个核心概念：${topic}。
- 给一个直观类比。
- 给一个最小例子。
- 只问一个小问题。
- 不要一次性给大量术语。`;
}

function investmentUpgradeSection(question) {
  const options = question.options.map((option) => `${option.id}. ${option.text}`).join("\n");
  return `【升级问题】
如果用户已经完成本次核心任务，请在最后提供以下升级问题：

${question.question}
${options}

回答后请判断是否已经具备进入 ${question.toLevel} 的基础。
请使用成长语言，不要使用“不合格”“失败”等表达。`;
}
