// src/lib/ai/guardrails.ts
// Placeholder pro Fázi 3 (AI safety).
// Input/output filtering, jailbreak detection, PII scrubbing, off-topic detection.

export interface GuardrailVerdict {
  allowed: boolean;
  reason?: string;
  category?: "jailbreak" | "off_topic" | "pii_leak" | "unsafe_content";
}

export function filterInput(_input: string): GuardrailVerdict {
  // TODO Fáze 3:
  // - jailbreak pattern detection (regex + ML classifier)
  // - off-topic detection (mimo matematiku / RVP)
  // - PII detection (email, telefon, full names)
  return { allowed: true };
}

export function filterOutput(_output: string): GuardrailVerdict {
  // TODO Fáze 3:
  // - URL detection a stripping
  // - email/telefon detection
  // - edu-context check
  // - markdown sanitization
  return { allowed: true };
}
