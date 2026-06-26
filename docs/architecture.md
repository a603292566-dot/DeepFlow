# DeepFlow MVP Architecture

DeepFlow MVP is a local-first web app. It does not call a GPT API, does not upload learning files, and does not require login. The core loop is:

Questionnaire -> identity -> role card -> learning path -> AI learning instruction -> local timer -> settlement -> growth evidence -> EXP update.

## Runtime Shape

- `index.html` loads `env-config.js` and `src/app.js`.
- `src/app.js` owns UI rendering, screen transitions, click handlers, and session state orchestration.
- Local data is saved in `localStorage` through `src/storage.js`.
- Supabase sync is event based and optional through `src/cloudSync.js`.
- The Mac app build uses `scripts/build-desktop-html.mjs` to inline CSS and JS into a single HTML file inside `DeepFlow.app`.

## Core Modules

### `src/domain.js`

Stores product constants and configuration:

- questionnaire items
- learning modules, subjects, levels, goals
- language targets
- language auto module plans
- status options
- programming level evidence
- EXP base tables and level requirements

This file should stay declarative. Avoid adding UI rendering here.

### `src/scoring.js`

Owns questionnaire and identity logic:

- questionnaire score conversion
- identity scoring and identity generation
- EXP calculation
- role level EXP application
- growth-language helpers for parameters and bonuses

### `src/learningPath.js`

Owns learning path lookup and pure path helpers:

- module, subject, level, goal lookup
- language target lookup
- legacy language target aliases
- language auto module selection
- goal label resolution

This keeps path rules out of `app.js`.

### `src/promptEngine.js`

Owns AI learning instruction generation:

- generic DeepFlow cognitive training prompt
- language learning coach prompt
- zero-base rules
- programming L0 special goal rules
- programming level evidence callback format

Prompt templates should be changed here instead of inside UI code.

### `src/investmentLearning.js`

Owns investment learning configuration and pure logic:

- three public tracks: beginner, market logic, company decision
- internal investment levels L0-L6
- learning profile creation
- session numbering
- stage session counting
- stage progression recommendation
- profile progression or consolidation
- investment topic selection by mode

The UI should not expose L0-L6 as a required first choice. It should show the three public tracks, create an `investmentProfile`, and continue from that profile on later visits. The investment module no longer uses single-choice diagnostics or upgrade questions.

### `src/investmentPromptEngine.js`

Owns investment learning prompt generation:

- investment knowledge education boundaries
- risk reminders
- mode-specific task shape
- session number and continuous learning context
- open-ended learning question
- DeepFlow investment feedback format

This module must not produce concrete buy/sell advice, individual stock recommendations, product recommendations, allocation plans, or return promises.

### `src/growthEvidence.js`

Owns growth evidence mutations:

- create growth evidence records
- calculate EXP for evidence
- apply EXP to the role card
- collect programming level evidence

### `src/learningCalendar.js`

Owns automatic learning calendar logic:

- create one calendar entry when a learning session is completed
- group completed sessions by local date
- allow multiple completed sessions on the same day
- avoid duplicate entries by `sessionId`
- calculate current streak, total learning days, monthly sessions, monthly minutes, and monthly EXP
- create month-view data for the calendar page

The calendar is not a manual check-in system. A day is recorded only when the user finishes a learning session and DeepFlow creates growth evidence.

### `src/storage.js`

Owns local-first persistence:

- create initial state
- load/save/reset state
- create local IDs
- persist `learningCalendar` and `lastCalendarEntry` locally

### `src/cloudSync.js`

Owns optional Supabase event sync:

- reads public Supabase config
- queues local sync events
- flushes events to `deepflow_sync_events`
- stores sync status locally

Do not put service role keys or private database secrets in this app.

## Data Flow

1. User finishes questionnaire.
2. `src/scoring.js` calculates parameters and identity.
3. `src/app.js` saves identity and shows feedback.
4. User starts a learning session.
5. `src/learningPath.js` resolves module, subject, level, goal, and language auto module plan.
6. For investment learning, `src/investmentLearning.js` resolves profile, track, current level, session number, and topic.
7. `src/promptEngine.js` generates the AI learning instruction.
8. If the module is investment, `src/investmentPromptEngine.js` generates the investment-specific instruction.
9. User copies the instruction to an external LLM.
10. Timer starts locally.
11. Completion creates a learning session record.
12. `src/growthEvidence.js` creates growth evidence and applies EXP.
13. `src/learningCalendar.js` creates or updates the local daily learning record.
14. The settlement screen shows that today's learning has been recorded.
15. `src/storage.js` persists local state.
16. `src/cloudSync.js` optionally queues and uploads sync events.

## Home Layout Principles

The home page is the user's long-term learning feedback surface, not only a prompt launch page.

- The home role card should show only core identity and EXP state.
- Keep role card content compact: main identity, secondary identity, level, EXP, upgrade distance, and current bonus.
- Do not put a full recent EXP source list inside the home role card.
- The learning calendar preview is a core home feedback component.
- The calendar preview should show today's learning state, current streak, monthly sessions, monthly EXP, and recent 7-day learning marks.
- Detailed recent records should live in the full learning calendar page or lower record/detail areas.
- Top navigation should stay system-oriented and avoid competing with the home feedback area.

## Learning Calendar Flow

1. User starts any learning session and completes it.
2. DeepFlow creates growth evidence and EXP as before.
3. `addCompletedSessionToCalendar` creates a calendar entry using:
   - date
   - module
   - session number or title
   - topic
   - mode
   - duration
   - EXP
   - evidence types
   - completed time
4. If the same `sessionId` already exists on that date, no duplicate entry is added.
5. The settlement page shows:
   - today's learning has been recorded
   - today's session count
   - monthly session count
   - current streak
   - EXP gained
6. The `学习日历` page shows a month view and date details.
7. Optional Supabase sync queues these event types:
   - `learning_calendar_entry_created`
   - `daily_checkin_recorded`
   - `learning_streak_updated`

Calendar data is local-first and saved inside the active profile snapshot. Cloud sync is an event mirror for later admin review, not the source of truth for the MVP.

## Investment Learning Flow

1. User chooses `投资学习`.
2. User chooses one of three public tracks:
   - 投资入门
   - 理解市场涨跌
   - 看懂公司与投资决策
3. `src/investmentLearning.js` creates an `investmentProfile`.
4. The selected track sets the initial level:
   - beginner -> L0
   - market_logic -> L2
   - company_decision -> L4
5. User sees a low-pressure starting point feedback page.
6. DeepFlow generates a numbered light-start AI learning instruction, such as `投资学习 Session 001`.
7. The session uses the existing timer, settlement, EXP, role card, and cloud sync paths.
8. Completion updates `sessionCount`, `currentStageSessionCount`, `lastSessionNumber`, and `lastTopic`.
9. Later visits open the investment continue page directly.
10. When the current stage has enough completed sessions, DeepFlow recommends the next stage. The user can enter the next stage or continue consolidating the current one.

## Investment Theory Boundaries

DeepFlow investment learning uses a multi-model explanation framework. It should train users to compare mechanisms, not memorize one fixed formula.

- Market explanations must separate classic theory relationships from real market interference.
- Interest rate, bond, and stock explanations must distinguish market interest rate, required return, discount rate, discount factor / present value factor, bond price, bond yield to maturity, and stock valuation.
- Interest rate and valuation explanations must clarify that discount rate and discount factor move in opposite directions.
- Bond and stock relationships should use conditional language such as "all else equal" and must not be framed as permanent rules.
- Explanations should include multiple models when relevant: fundamental / discount model, efficient market / information reflection, Keynesian beauty contest, behavioral finance, liquidity / fund flow, reflexivity, and market structure.
- Financial statements are a core part of company analysis. The company decision track should cover income statement, balance sheet, cash flow statement, revenue, profit, cash flow, margins, ROE, debt, solvency, operating cash flow, earnings quality, business model, and valuation.
- K-line charts and technical indicators are auxiliary observation tools. They can help describe behavior, sentiment, trend, momentum, and crowding, but they are not a deterministic prediction system.
- Technical analysis must not be converted into buy/sell signals inside DeepFlow prompts.

## Current Maintenance Risks

- `src/app.js` is still large because it owns all screens and event handlers.
- UI rendering is string-template based, so a broken template can affect a full screen.
- Prompt templates are long and should stay centralized in `src/promptEngine.js`.
- Learning path constants can grow quickly; keep them declarative in `src/domain.js`.
- Supabase sync is intentionally event based. Do not turn it into a full backend inside the frontend.

## Suggested Next Refactors

Keep refactors small:

1. Move role card rendering into a small `src/components/roleCard.js`.
2. Move screen renderers into `src/screens/` only after the UI stabilizes.
3. Add more tests around learning path selection and language prompt variants.
4. Keep business rules in pure modules before adding new UI.
