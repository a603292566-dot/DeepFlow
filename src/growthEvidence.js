import { applyExp, calculateExp } from "./scoring.js";

export function addGrowthEvidence(nextState, { type, label, sessionId, evidenceId, createdAt }) {
  const result = calculateExp(type, nextState.identity.mainIdentity, nextState.identity.level);
  const evidence = {
    id: evidenceId,
    userId: nextState.user.id,
    type,
    label,
    category: nextState.selectedCategory || undefined,
    goalId: nextState.selectedGoalId || undefined,
    sessionId,
    ...result,
    createdAt
  };

  return {
    ...nextState,
    evidence: [...nextState.evidence, evidence],
    identity: applyExp(nextState.identity, evidence.finalExp)
  };
}

export function collectedLevelEvidence(nextState, levelEvidence) {
  if (!levelEvidence?.requiredEvidence) return [];
  const validIds = new Set(levelEvidence.requiredEvidence.map((item) => item.id));
  const evidenceIds = new Set();

  for (const evidence of nextState.evidence || []) {
    for (const evidenceId of evidence.levelEvidenceIds || []) {
      if (validIds.has(evidenceId)) evidenceIds.add(evidenceId);
    }
  }

  return levelEvidence.requiredEvidence.filter((item) => evidenceIds.has(item.id));
}
