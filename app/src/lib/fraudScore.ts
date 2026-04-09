export interface TrustScoreResult {
  score: number;
  grade: string;
  color: string;
  factors: string[];
}

const VIOLATION_WEIGHTS: Record<string, number> = {
  exceededTransferLimit: 5,
  unauthorizedProgram: 12,
  rateLimitBreached: 5,
  paroleViolation: 15,
  other: 3,
};

function getViolationTypeKey(vt: object): string {
  const keys = Object.keys(vt);
  return keys[0] || "other";
}

export function computeTrustScore(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agentRecord: any
): TrustScoreResult {
  let score = 100;
  const factors: string[] = [];

  // Violation deductions
  const violations = agentRecord.violations || [];
  if (violations.length > 0) {
    let violationPenalty = 0;
    for (const v of violations) {
      const typeKey = getViolationTypeKey(v.violationType);
      const weight = VIOLATION_WEIGHTS[typeKey] || 3;
      violationPenalty += weight;
    }
    score -= violationPenalty;
    factors.push(`${violations.length} violation(s) recorded (-${violationPenalty})`);
  }

  // Status penalties
  const status = agentRecord.status;
  if ("arrested" in status) {
    score -= 30;
    factors.push("Agent currently ARRESTED (-30)");
  } else if ("paroled" in status) {
    score -= 15;
    factors.push("Agent on PAROLE (-15)");
  } else if ("terminated" in status) {
    score -= 50;
    factors.push("Agent TERMINATED (-50)");
  }

  // Parole strikes penalty
  if (agentRecord.paroleTerms) {
    const strikesUsed = 3 - agentRecord.paroleTerms.strikesRemaining;
    if (strikesUsed > 0) {
      const penalty = strikesUsed * 5;
      score -= penalty;
      factors.push(`${strikesUsed} parole strike(s) used (-${penalty})`);
    }
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  // Grade
  let grade: string;
  let color: string;
  if (score >= 90) {
    grade = "A";
    color = "#00E5CC";
  } else if (score >= 70) {
    grade = "B";
    color = "#00B4D8";
  } else if (score >= 50) {
    grade = "C";
    color = "#FF9B26";
  } else if (score >= 25) {
    grade = "D";
    color = "#FF4757";
  } else {
    grade = "F";
    color = "#8B0000";
  }

  if (factors.length === 0) {
    factors.push("Clean record — no incidents");
  }

  return { score, grade, color, factors };
}
