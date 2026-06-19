# DeepFlow MVP Testing Checklist

Use this checklist before each public test deployment.

## 1. First Entry

- Open DeepFlow from a fresh browser profile or after local reset.
- Confirm the welcome page appears.
- Click `创建你的学习者角色`.

## 2. Questionnaire

- Answer all questionnaire items.
- Submit the questionnaire.
- Confirm the identity feedback page appears before learning selection.
- Confirm it shows main identity, secondary identity, short strengths, and role preview.
- Click `查看完整身份报告`.
- Confirm the report includes overview, explanation, learning traits, strengths, growth areas, DeepFlow strategy, and parameter portrait.

## 3. Role Card

- Return to the role card.
- Confirm the role card stays minimal:
  - identity
  - level
  - EXP
  - progress bar
  - EXP to next level
  - recent EXP sources
  - active bonus

## 4. Language Learning Path

- Click `开始学习`.
- Choose `语言学习`.
- Confirm the next screen shows only `德语` and `英语`.
- Choose `德语`.
- Confirm the next screen shows:
  - 德语入门
  - telc B1
  - telc B2
  - telc C1
- Confirm it does not show reading, vocabulary, grammar, writing, speaking, listening, translation, or mock exam as required choices.
- Choose `telc C1`.
- Choose a current state.
- Generate the AI learning instruction.
- Confirm the instruction mentions:
  - target language
  - target level
  - current mode
  - automatically selected module
  - review queue
  - output preference
  - DeepFlow feedback format

## 5. Programming L0 Path

- Start a new learning flow.
- Choose `编程学习`.
- Choose `AI 辅助编程`.
- Choose `L0 纯零基础`.
- Confirm only these goals appear:
  - 认识代码
  - 学习功能
  - 学习 GitHub / Codex
- Generate an instruction for each goal over time.
- Confirm L0 prompts do not require writing code first.
- Confirm English terms include Chinese explanations.

## 6. Status Assessment

- Confirm the status page asks only `现在状态如何？`.
- Confirm only three options appear:
  - 状态不错
  - 有点疲劳
  - 很疲劳
- Confirm no manual fatigue, focus, motivation, or duration fields appear.

## 7. Investment Learning

- Start a new learning flow.
- Confirm `投资学习` appears next to the other learning modules.
- Choose `投资学习`.
- Confirm only three target directions appear:
  - 投资入门
  - 理解市场涨跌
  - 看懂公司与投资决策
- Choose one target direction.
- Confirm no diagnostic questions appear.
- Confirm the investment profile starting point page appears.
- Confirm the feedback page uses low-pressure language and does not use failure-style labels.
- Generate the AI learning instruction.
- Confirm the instruction includes `投资学习 Session 001`.
- Confirm the instruction says it is only for investment knowledge education.
- Confirm the instruction does not include concrete buy/sell advice, individual stock recommendations, product recommendations, allocation plans, or return promises.
- Confirm the instruction includes a risk reminder.
- Confirm the instruction uses an open-ended question, not a forced choice question.
- Generate an interest-rate-related investment instruction.
- Confirm it distinguishes discount rate and discount factor / present value factor.
- Confirm it uses conditional wording such as `其他条件不变`.
- Confirm it includes real-market interference factors such as risk appetite, fund flow, liquidity, positioning, or policy expectations.
- Generate a `看懂公司与投资决策` instruction and confirm it includes financial statement learning.
- Confirm company analysis includes income statement, balance sheet, cash flow statement, revenue, profit, cash flow, margins, ROE, debt, solvency, operating cash flow, earnings quality, business model, and valuation.
- Generate a `理解市场涨跌` instruction and confirm it can include technical analysis as an auxiliary observation topic.
- Confirm K-line and technical indicators are described as observation tools, not deterministic buy/sell signals.
- Start the timer.
- Complete light start and confirm EXP settlement.
- Reopen `投资学习`.
- Confirm the continue page appears directly.
- Confirm the next instruction uses `投资学习 Session 002`.
- Complete enough sessions to show the next-stage recommendation.
- Choose `继续巩固当前阶段` and confirm the current stage stays the same.
- Later choose `进入下一阶段` and confirm the current stage updates.
- Confirm no forced question flow appears.
- Confirm language, math, and programming flows still work.

## 8. AI Learning Instruction

- Confirm the page title is `复制 AI 学习指令`.
- Confirm the instruction can be copied.
- Confirm copy success feedback appears.
- Click `我已开始学习`.

## 9. Timer And Settlement

- Confirm the timer starts after `我已开始学习`.
- Confirm the active session page shows:
  - current mode
  - elapsed time
  - completion button
- Complete the session.
- Confirm settlement offers:
  - 继续深化
  - 结束并结算
- Confirm optional AI feedback can be pasted or skipped.
- Confirm EXP is added to the role card.

## 10. Local Data

- Refresh the page.
- Confirm the current profile, role card, records, and EXP are preserved.
- Create a second role.
- Switch between roles and confirm data remains separated.

## 11. Cloud Sync

- Open `云端同步`.
- Confirm configuration status is visible.
- Click `测试连接 / 发送测试事件`.
- Confirm success or a clear pending/error state appears.
- In Supabase Table Editor, confirm `deepflow_sync_events` receives the test event.

## 12. PWA And Deployment

- Run the build script.
- Open the built site.
- Confirm the app shell loads.
- Confirm mobile layout has no horizontal scroll.
- Confirm the install help page explains iPhone, Android, Windows, and Mac usage.

## 13. Mac App

- Run the Mac build script.
- Open `build/macos/DeepFlow.app` or `open-deepflow.command`.
- Confirm the app is not blank.
- Repeat the language learning path smoke test inside the Mac app.
