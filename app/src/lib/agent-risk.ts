export interface IndexedViolationLike {
  id?: string;
  violationType: string;
  description?: string;
  timestamp?: string | number | bigint;
}

export interface IndexedAgentLike {
  agentIdentity: string;
  owner: string;
  stakeAmount: string | number | bigint;
  status: string;
  maxTransferLamports: string | number | bigint;
  maxDailyTransactions: number;
  registeredAt: string | number | bigint;
  violations: IndexedViolationLike[];
}

export interface AgentTrustSummary {
  score: number;
  label: "High" | "Guarded" | "Elevated" | "Critical";
  color: string;
  reasons: string[];
}

export interface RiskRecommendation {
  title: string;
  detail: string;
}

export interface PreflightWarning {
  severity: "info" | "warn" | "critical";
  title: string;
  detail: string;
}

const LAMPORTS_PER_SOL = 1_000_000_000;

function toBigInt(value: string | number | bigint): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  return BigInt(value);
}

function toTimestampMs(value: string | number | bigint): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return Date.now();
  return numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
}

export function lamportsToSol(value: string | number | bigint): number {
  return Number(toBigInt(value)) / LAMPORTS_PER_SOL;
}

export function formatCompactWallet(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatAgentAge(registeredAt: string | number | bigint): string {
  const ageMs = Math.max(0, Date.now() - toTimestampMs(registeredAt));
  const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

  if (ageDays < 1) {
    const ageHours = Math.max(1, Math.floor(ageMs / (60 * 60 * 1000)));
    return `${ageHours}h old`;
  }

  if (ageDays < 30) return `${ageDays}d old`;

  const ageMonths = Math.floor(ageDays / 30);
  return `${ageMonths}mo old`;
}

export function formatIndexedTimestamp(value: string | number | bigint): string {
  return new Date(toTimestampMs(value)).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function computeIndexedAgentTrust(
  agent: IndexedAgentLike,
  options?: { insuranceTier?: "Basic" | "Standard" | "Premium" | null }
): AgentTrustSummary {
  let score = 100;
  const reasons: string[] = [];
  const transferSol = lamportsToSol(agent.maxTransferLamports);

  if (agent.status === "Paroled") {
    score -= 20;
    reasons.push("Agent is currently on probation.");
  } else if (agent.status === "Arrested") {
    score -= 35;
    reasons.push("Agent is currently suspended.");
  } else if (agent.status === "Terminated") {
    score -= 60;
    reasons.push("Agent has been terminated.");
  }

  if (agent.violations.length > 0) {
    const violationPenalty = Math.min(40, agent.violations.length * 8);
    score -= violationPenalty;
    reasons.push(`${agent.violations.length} recorded violation(s).`);
  }

  if (!options?.insuranceTier) {
    score -= 8;
    reasons.push("No active insurance coverage.");
  }

  if (transferSol >= 5) {
    score -= 10;
    reasons.push("Transfer cap is high for a guarded agent.");
  } else if (transferSol >= 1) {
    score -= 5;
    reasons.push("Transfer cap could be tightened.");
  }

  if (agent.maxDailyTransactions > 100) {
    score -= 8;
    reasons.push("Daily transaction limit is wide open.");
  } else if (agent.maxDailyTransactions > 25) {
    score -= 4;
    reasons.push("Daily transaction limit is permissive.");
  }

  score = Math.max(0, Math.min(100, score));

  if (reasons.length === 0) {
    reasons.push("Clean history with bounded permissions.");
  }

  if (score >= 85) {
    return { score, label: "High", color: "#39FF14", reasons };
  }

  if (score >= 65) {
    return { score, label: "Guarded", color: "#00E5CC", reasons };
  }

  if (score >= 40) {
    return { score, label: "Elevated", color: "#FF9B26", reasons };
  }

  return { score, label: "Critical", color: "#FF0033", reasons };
}

export function getAgentRiskRecommendations(
  agent: IndexedAgentLike,
  options?: { insuranceTier?: "Basic" | "Standard" | "Premium" | null }
): RiskRecommendation[] {
  const recommendations: RiskRecommendation[] = [];
  const transferSol = lamportsToSol(agent.maxTransferLamports);

  if (!options?.insuranceTier) {
    recommendations.push({
      title: "Register coverage",
      detail: "Insurance is the fastest way to improve the agent's visible safety posture.",
    });
  }

  if (transferSol >= 1) {
    recommendations.push({
      title: "Tighten transfer cap",
      detail: "Lower the per-transaction limit before the agent handles larger balances.",
    });
  }

  if (agent.maxDailyTransactions > 25) {
    recommendations.push({
      title: "Reduce daily throughput",
      detail: "Smaller daily transaction caps make abuse easier to contain.",
    });
  }

  if (agent.violations.length > 0) {
    recommendations.push({
      title: "Inspect recent violations",
      detail: "Review evidence and watch for repeat patterns before approving new activity.",
    });
  }

  if (agent.status === "Paroled" || agent.status === "Arrested") {
    recommendations.push({
      title: "Request governance review",
      detail: "Suspended or paroled agents need stronger human oversight before trust can recover.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Maintain current posture",
      detail: "This agent already has a clean operating profile. Keep monitoring for new changes.",
    });
  }

  return recommendations;
}

export function getRegistrationPreflightWarnings(input: {
  stakeAmount: number;
  maxTransfer: number;
  maxDailyTransactions: number;
}): PreflightWarning[] {
  const warnings: PreflightWarning[] = [];

  if (input.maxTransfer >= 5) {
    warnings.push({
      severity: "critical",
      title: "High transfer amount",
      detail: "This cap enables large one-shot movements before a human has time to react.",
    });
  } else if (input.maxTransfer >= 1) {
    warnings.push({
      severity: "warn",
      title: "Elevated transfer cap",
      detail: "Consider starting lower until the agent has earned a track record.",
    });
  }

  if (input.maxDailyTransactions > 100) {
    warnings.push({
      severity: "critical",
      title: "Wide-open daily throughput",
      detail: "A high daily transaction cap makes automated abuse harder to stop early.",
    });
  } else if (input.maxDailyTransactions > 25) {
    warnings.push({
      severity: "warn",
      title: "Permissive daily volume",
      detail: "More restrictive daily limits create better containment if behavior changes.",
    });
  }

  if (input.stakeAmount > 0 && input.maxTransfer >= input.stakeAmount) {
    warnings.push({
      severity: "warn",
      title: "Transfer cap matches or exceeds bond",
      detail: "A single transaction could move as much value as the stake securing the agent.",
    });
  }

  warnings.push({
    severity: "info",
    title: "Coverage is not automatic",
    detail: "New agents launch uninsured until the owner explicitly buys protection.",
  });

  return warnings;
}
