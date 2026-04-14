export function getStatusString(
  status: Record<string, unknown>
): "Active" | "Arrested" | "Paroled" | "Terminated" {
  if ("active" in status) return "Active";
  if ("arrested" in status) return "Arrested";
  if ("paroled" in status) return "Paroled";
  if ("terminated" in status) return "Terminated";
  return "Active";
}

export function getTierString(
  tier: Record<string, unknown>
): "Basic" | "Standard" | "Premium" {
  if ("basic" in tier) return "Basic";
  if ("standard" in tier) return "Standard";
  if ("premium" in tier) return "Premium";
  return "Basic";
}

export function getBailOutcomeString(
  outcome: Record<string, unknown>
): "Pending" | "Released" | "Paroled" | "Terminated" {
  if ("pending" in outcome) return "Pending";
  if ("released" in outcome) return "Released";
  if ("paroled" in outcome) return "Paroled";
  if ("terminated" in outcome) return "Terminated";
  return "Pending";
}

export function getViolationTypeString(
  vt: Record<string, unknown>
): "ExceededTransferLimit" | "UnauthorizedProgram" | "RateLimitBreached" | "ParoleViolation" | "Other" {
  if ("exceededTransferLimit" in vt) return "ExceededTransferLimit";
  if ("unauthorizedProgram" in vt) return "UnauthorizedProgram";
  if ("rateLimitBreached" in vt) return "RateLimitBreached";
  if ("paroleViolation" in vt) return "ParoleViolation";
  return "Other";
}
