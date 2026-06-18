# DeepFlow Data Schema V3

本文件定义 DeepFlow 发布版 MVP 的核心数据结构。MVP 阶段优先使用 localStorage、IndexedDB、SQLite 或 Supabase，不要过早建设复杂后端。

## 1. User

```ts
type User = {
  id: string
  displayName?: string
  createdAt: string
  timezone?: string
  hasCompletedQuestionnaire: boolean
}
```

## 2. Questionnaire

```ts
type QuestionnaireDimension =
  | "explorationDrive"
  | "executionStability"
  | "systemBuilding"
  | "principleThinking"
  | "growthBelief"
  | "emotionalStability"
  | "learnerIdentity"
  | "knowledgeConnection"
```

```ts
type QuestionnaireItem = {
  id: string
  text: string
  dimension: QuestionnaireDimension
  reverseScored: boolean
}
```

```ts
type QuestionnaireResponse = {
  id: string
  userId: string
  answers: Record<string, number>
  submittedAt: string
}
```

```ts
type IdentityParameters = {
  userId: string
  explorationDrive: number
  executionStability: number
  systemBuilding: number
  principleThinking: number
  growthBelief: number
  emotionalStability: number
  learnerIdentity: number
  knowledgeConnection: number
  measuredAt: string
}
```

所有参数存储为 0–100。

## 3. Learner Identity

```ts
type LearnerIdentityType =
  | "traveler"
  | "explorer"
  | "scholar"
  | "builder"
  | "doer"
  | "master"
```

```ts
type LearnerIdentity = {
  userId: string
  mainIdentity: LearnerIdentityType
  secondaryIdentity?: LearnerIdentityType
  level: number
  currentExp: number
  requiredExp: number
  totalExp: number
  updatedAt: string
}
```

## 4. Learning Path

```ts
type LearningCategory = "language" | "math" | "programming"
```

```ts
type LearningModule = {
  id: LearningCategory
  label: string
}
```

```ts
type LearningSubject = {
  id: string
  moduleId: LearningCategory
  label: string
  targetLanguage?: string
}
```

```ts
type CurrentLevel = {
  id: string
  moduleId: LearningCategory
  label: string
  zeroBase?: boolean
}
```

```ts
type LearningGoal = {
  id: string
  category: LearningCategory
  label: string
  description?: string
}
```

V1 学习路径采用：

学习模块 → 具体学科 → 当前水平 → 学习目标 → 状态评估 → 生成 Prompt。

DeepFlow MVP 不保存用户上传文件；学习材料由用户在外部 LLM 中上传或粘贴。

## 5. Session Mode and Learning Session

```ts
type SessionMode = "light_start" | "standard" | "deep" | "restart"
```

```ts
type LearningSessionStatus =
  | "active"
  | "completed"
  | "ended_after_light_start"
  | "continued_to_standard"
  | "continued_to_deep"
  | "stopped"
```

```ts
type LearningSession = {
  id: string
  userId: string
  category: LearningCategory
  goalId: string
  mode: SessionMode

  learningModule: string
  subject: string
  currentLevel: string
  learningGoal: string
  levelEvidenceId?: string
  likelyEvidenceIds?: string[]
  currentStatus: "状态不错" | "有点疲劳" | "很疲劳"
  energyLevel: number
  fatigueLevel: number
  focusLevel: number
  plannedDuration: string
  generatedPrompt: string

  promptId: string
  promptText: string

  status: LearningSessionStatus

  startTime: string
  endTime?: string
  durationMinutes?: number

  evidenceIds: string[]
  expGained: number

  createdAt: string
  updatedAt: string
}
```

## 6. Prompt System

```ts
type PromptTemplate = {
  id: string
  category: LearningCategory
  goalId?: string
  mode: SessionMode
  identity?: LearnerIdentityType
  template: string
}
```

```ts
type GeneratedPrompt = {
  id: string
  userId: string
  category: LearningCategory
  goalId: string
  learningModule: string
  subject: string
  currentLevel: string
  learningGoal: string
  levelEvidenceId?: string
  likelyEvidenceIds?: string[]
  currentStatus: "状态不错" | "有点疲劳" | "很疲劳"
  energyLevel: number
  fatigueLevel: number
  focusLevel: number
  plannedDuration: string
  mode: SessionMode
  identity: LearnerIdentityType
  text: string
  createdAt: string
}
```

```ts
type PromptGenerationContext = {
  user: User
  identity: LearnerIdentity
  parameters: IdentityParameters
  category: LearningCategory
  goal: LearningGoal
  learningModule?: LearningModule
  subject?: LearningSubject
  currentLevel?: CurrentLevel
  learningGoal?: LearningGoal
  levelEvidence?: {
    label: string
    nextLevel?: string | null
    nextLevelLabel: string
    requiredCount: number
    coreAbilities: string[]
    requiredEvidence: Array<{ id: string; label: string }>
  }
  collectedEvidence?: Array<{ id: string; label: string }>
  likelyEvidenceIds?: string[]
  currentStatus?: string
  energyLevel?: number
  fatigueLevel?: number
  focusLevel?: number
  plannedDuration?: string
  mode: SessionMode
  currentState?: "fatigued" | "normal" | "good" | "restart"
  recentSessions?: LearningSession[]
  recentEvidence?: GrowthEvidence[]
  activeBonuses?: ExpBonus[]
  languageProfile?: LanguageLearningProfile
}
```

## 7. Language Learning Profile

语言学习项目必须保存语言学习档案，以支持长期 Prompt 生成。

```ts
type LanguageLearningModule =
  | "vocabulary_chunks"
  | "reading_comprehension"
  | "structured_output"
  | "grammar_automation"
  | "listening_comprehension"
  | "speaking_prompt"
  | "translation"
  | "exam_task"
  | "free_writing"
  | "review"
```

```ts
type LanguageLearningProfile = {
  userId: string
  targetLanguage: string
  targetLevel: string
  examGoal?: string
  currentEstimatedLevel?: string

  preferredModules: LanguageLearningModule[]
  strongModules: LanguageLearningModule[]
  weakModules: LanguageLearningModule[]

  outputPreference: "structured_first" | "free_output" | "speaking_first" | "reading_first"
  avoidTasks?: string[]

  reviewQueue: ReviewItem[]
  commonMistakes: string[]
  lastUpdatedAt: string
}
```

```ts
type ReviewItem = {
  id: string
  text: string
  type: "expression" | "grammar" | "sentence" | "topic" | "mistake"
  meaning?: string
  sourceSessionId?: string
  addedAt: string
  masteryLevel: "new" | "reviewing" | "stable"
}
```

## 8. Growth Evidence

```ts
type GrowthEvidenceType =
  | "questionnaire_completed"
  | "identity_created"
  | "light_start_completed"
  | "standard_session_completed"
  | "deep_session_completed"
  | "restart_after_interruption"
  | "feedback_completed"
  | "structured_output_completed"
  | "vocabulary_practice_completed"
  | "reading_comprehension_completed"
  | "concept_explained"
  | "knowledge_transfer_completed"
  | "systematization_completed"
  | "project_progress_completed"
  | "model_built"
```

```ts
type GrowthEvidence = {
  id: string
  userId: string
  type: GrowthEvidenceType
  label: string

  category?: LearningCategory
  goalId?: string
  sessionId?: string

  baseExp: number
  identityMultiplier: number
  levelCurveFactor: number
  qualityModifier: number
  finalExp: number

  createdAt: string
}
```

## 9. EXP System

```ts
const BASE_EXP: Record<GrowthEvidenceType, number> = {
  questionnaire_completed: 50,
  identity_created: 50,
  light_start_completed: 30,
  standard_session_completed: 80,
  deep_session_completed: 150,
  restart_after_interruption: 60,
  feedback_completed: 30,
  structured_output_completed: 50,
  vocabulary_practice_completed: 40,
  reading_comprehension_completed: 40,
  concept_explained: 50,
  knowledge_transfer_completed: 80,
  systematization_completed: 90,
  project_progress_completed: 90,
  model_built: 120
}
```

```ts
const IDENTITY_BONUS = {
  scholar: {
    light_start_completed: 1.5,
    standard_session_completed: 1.5,
    deep_session_completed: 1.3,
    structured_output_completed: 1.8,
    knowledge_transfer_completed: 1.5,
    systematization_completed: 1.5,
    project_progress_completed: 1.5,
    model_built: 1.5
  },
  explorer: {
    light_start_completed: 1.5,
    standard_session_completed: 1.5,
    project_progress_completed: 2.0,
    knowledge_transfer_completed: 1.5
  },
  traveler: {
    questionnaire_completed: 1.5,
    identity_created: 1.5,
    light_start_completed: 2.0,
    restart_after_interruption: 2.0
  },
  builder: {
    systematization_completed: 1.8,
    structured_output_completed: 1.5,
    project_progress_completed: 1.5
  },
  doer: {
    light_start_completed: 1.5,
    standard_session_completed: 1.5,
    concept_explained: 1.8,
    feedback_completed: 1.5
  },
  master: {
    deep_session_completed: 1.3,
    knowledge_transfer_completed: 1.3,
    systematization_completed: 1.3,
    model_built: 1.5
  }
}
```

```ts
type ExpCalculationInput = {
  evidenceType: GrowthEvidenceType
  identity: LearnerIdentityType
  level: number
  qualityScore?: number
}
```

```ts
type ExpCalculationResult = {
  baseExp: number
  identityMultiplier: number
  levelCurveFactor: number
  qualityModifier: number
  finalExp: number
}
```

```ts
finalExp = Math.round(baseExp * identityMultiplier * levelCurveFactor * qualityModifier)
```

## 10. Level Requirements

```ts
const LEVEL_REQUIREMENTS: Record<number, number> = {
  1: 500,
  2: 650,
  3: 850,
  4: 1100,
  5: 1400,
  6: 1750,
  7: 2150,
  8: 2600,
  9: 3100,
  10: 3650
}
```

## 11. Role Card

```ts
type RoleCard = {
  userId: string
  identityLabel: string
  secondaryLabel?: string
  level: number
  currentExp: number
  requiredExp: number
  expToNextLevel: number
  expPercent: number
  recentExpSources: RecentExpSource[]
  activeBonuses: ExpBonus[]
  updatedAt: string
}
```

```ts
type RecentExpSource = {
  label: string
  exp: number
  evidenceType: GrowthEvidenceType
}
```

```ts
type ExpBonus = {
  label: string
  multiplier: number
}
```

## 12. Identity Report

```ts
type IdentityReport = {
  id: string
  userId: string
  mainIdentity: LearnerIdentityType
  secondaryIdentity?: LearnerIdentityType
  parameterSnapshot: IdentityParameters
  summary: string
  strengths: string[]
  growthSpaces: string[]
  generatedAt: string
}
```
