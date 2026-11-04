import { CATEGORY_BY_ID, type Sensitivity } from "../rules/dataCategories";
import { cite } from "../rules/sources";
import type { AssessmentInput, Probability, Reason, RiskProfile } from "./types";

/**
 * Weighs the two factors all three laws share: how sensitive the information
 * is, and how likely it is to be misused (PIPEDA s. 10.1(8); Quebec P-39.1
 * s. 3.7 / A-2.1 s. 63.10; OIPC Alberta guidance, Section C).
 *
 * Unknown answers never lower the result. Several unknowns raise it.
 */

const OPC_PROB = cite("opc-guidance", "Part 6, \"Probability of Misuse\"");
const AB_FACTORS = cite("oipc-ab-guidance", "Section C, \"Real Risk of Significant Harm\"");

const SENS_ORDER: Sensitivity[] = ["low", "moderate", "high"];
const raise = (s: Sensitivity): Sensitivity => SENS_ORDER[Math.min(SENS_ORDER.indexOf(s) + 1, 2)];

export function assessSensitivity(input: AssessmentInput): { level: Sensitivity; reasons: Reason[] } {
  const { categories, contextRaisesSensitivity } = input.data;
  const reasons: Reason[] = [];

  if (categories.length === 0) {
    reasons.push({
      text: "No kind of information was selected, so sensitivity is treated as moderate until you describe it.",
      cite: cite("opc-guidance", "Part 6, \"Sensitivity\"")
    });
    return { level: "moderate", reasons };
  }

  let level: Sensitivity = "low";
  for (const id of categories) {
    const c = CATEGORY_BY_ID[id];
    if (SENS_ORDER.indexOf(c.sensitivity) > SENS_ORDER.indexOf(level)) level = c.sensitivity;
  }
  for (const id of categories) {
    const c = CATEGORY_BY_ID[id];
    if (c.sensitivity === level) reasons.push({ text: `${c.label}: ${c.why}`, cite: c.cites[0] });
  }

  if (contextRaisesSensitivity && level !== "high") {
    level = raise(level);
    reasons.push({
      text: "You said the context makes this information more sensitive than it looks. Any information can be sensitive depending on the context.",
      cite: cite("opc-guidance", "Part 6, \"Sensitivity\" (citing PIPEDA Sch. 1, Principle 4.3.4)")
    });
  }
  if (input.misuse.vulnerablePeople === "yes" && level !== "high") {
    level = raise(level);
    reasons.push({ text: "Vulnerable people (such as youth or seniors) are affected.", cite: AB_FACTORS });
  }
  return { level, reasons };
}

export function assessProbability(input: AssessmentInput): { level: Probability; reasons: Reason[]; unknowns: string[] } {
  const m = input.misuse;
  const reasons: Reason[] = [];
  const unknowns: string[] = [];

  if (m.maliciousIntent === "unknown") unknowns.push("whether there was malicious intent");
  if (m.misuseEvidence === "unknown") unknowns.push("whether the information has been misused");
  if (m.publiclyPosted === "unknown") unknowns.push("whether the information was posted or offered online");
  if (m.recovered === "unknown") unknowns.push("whether the information was recovered");
  if (m.encryption === "unknown") unknowns.push("whether the information was encrypted");
  if (m.exposure === "unknown") unknowns.push("how long the information was exposed");

  // Facts that make misuse likely. Any one of them is enough.
  const high: Reason[] = [];
  if (m.misuseEvidence === "yes") high.push({ text: "There is evidence the information has been misused, so harm may already have materialized.", cite: OPC_PROB });
  if (m.maliciousIntent === "yes") high.push({ text: "There is evidence of malicious intent (such as theft, hacking or malware).", cite: OPC_PROB });
  if (m.recipient === "known-threat") high.push({ text: "The information is known to be with people likely to try to cause harm with it.", cite: OPC_PROB });
  if (m.publiclyPosted === "yes") high.push({ text: "The information was posted publicly or offered for sale.", cite: OPC_PROB });
  if (m.recipient === "relationship")
    high.push({
      text: "The recipient has a personal or professional relationship with the people affected (for example an ex-spouse or a boss), which can be a risk in itself.",
      cite: OPC_PROB
    });
  if (high.length) return { level: "high", reasons: high, unknowns };

  // Facts that make misuse very unlikely, if nothing points the other way.
  const clean = m.maliciousIntent === "no" && m.misuseEvidence === "no";
  if (clean) {
    if (m.encryption === "strong") {
      reasons.push({ text: "The information was strongly encrypted and the key was not compromised.", cite: OPC_PROB });
      return { level: "negligible", reasons, unknowns };
    }
    if (m.recipient === "known-limited" && m.recipientConfirmedDeletion === "yes") {
      reasons.push({
        text: "It went only to a limited, known recipient who has confirmed they destroyed it and did not share it.",
        cite: OPC_PROB
      });
      return { level: "negligible", reasons, unknowns };
    }
    if (m.recipient === "nobody-known" && m.recovered === "yes") {
      reasons.push({ text: "It was recovered and there is no sign anyone accessed it.", cite: OPC_PROB });
      return { level: "negligible", reasons, unknowns };
    }
  }

  let level: Probability = "low";
  const bump = (to: Probability, r: Reason) => {
    const order: Probability[] = ["negligible", "low", "moderate", "high"];
    if (order.indexOf(to) > order.indexOf(level)) level = to;
    reasons.push(r);
  };

  if (m.recipient === "unknown") bump("moderate", { text: "The information was exposed to unknown people.", cite: OPC_PROB });
  if (m.recipient === "many") bump("moderate", { text: "The information was exposed to a large number of people, some of whom might misuse it.", cite: OPC_PROB });
  if (m.recipient === "internal") bump("moderate", { text: "An insider accessed or used the information without authorization (\"snooping\").", cite: cite("oipc-ab-guidance", "\"What is a Privacy Breach?\"") });
  if (m.recipient === "nobody-known" && m.recovered !== "yes" && m.encryption !== "strong")
    bump("moderate", { text: "The information was lost and has not been recovered, and it was not strongly encrypted.", cite: OPC_PROB });
  if (m.exposure === "weeks") bump("moderate", { text: "The information was exposed for weeks or longer.", cite: AB_FACTORS });
  if (m.encryption === "weak-or-compromised") bump("moderate", { text: "Encryption was weak, or the key or password may have been compromised.", cite: AB_FACTORS });
  if (m.maliciousIntent === "unknown") bump("moderate", { text: "It is not yet known whether there was malicious intent.", cite: OPC_PROB });

  if (input.data.categories.filter((c) => c !== "other").length >= 3)
    bump("moderate", { text: "Several pieces of personal information were breached together, which raises the risk of misuse such as identity theft.", cite: OPC_PROB });

  if (unknowns.length >= 2)
    bump("moderate", { text: `Several key facts are still unknown (${unknowns.join("; ")}). Unknowns are treated as raising the risk until they are resolved.` });

  if (level === "low") {
    if (m.recipient === "known-limited")
      reasons.push({ text: "It went to a limited, known recipient with a low likelihood of sharing it in a harmful way.", cite: OPC_PROB });
    if (m.recovered === "yes") reasons.push({ text: "The information was recovered.", cite: OPC_PROB });
    if (reasons.length === 0) reasons.push({ text: "None of the answers point to a likelihood of misuse.", cite: OPC_PROB });
  }
  return { level, reasons, unknowns };
}

const HARMS: Record<string, string[]> = {
  "government-id": ["identity theft", "financial loss", "negative effects on the credit record"],
  financial: ["financial loss", "identity theft", "negative effects on the credit record"],
  credentials: ["financial loss", "identity theft", "damage to or loss of property"],
  health: ["humiliation", "damage to reputation or relationships", "loss of employment, business or professional opportunities"],
  biometric: ["identity theft"],
  "special-category": ["humiliation", "damage to reputation or relationships", "loss of employment, business or professional opportunities"],
  "criminal-legal": ["humiliation", "damage to reputation or relationships", "loss of employment, business or professional opportunities"],
  children: ["humiliation", "damage to reputation or relationships"],
  employment: ["humiliation", "damage to reputation or relationships", "loss of employment, business or professional opportunities"],
  "date-of-birth": ["identity theft"],
  location: ["bodily harm"],
  contact: ["financial loss"], // through phishing or fraud
  name: [],
  other: []
};

/** Kinds of significant harm (PIPEDA s. 10.1(7)) the information could plausibly lead to. */
export function foreseeableHarms(input: AssessmentInput): string[] {
  const out = new Set<string>();
  for (const c of input.data.categories) HARMS[c].forEach((h) => out.add(h));
  if (input.misuse.recipient === "relationship") {
    out.add("humiliation");
    out.add("damage to reputation or relationships");
  }
  return [...out];
}

export function assessRisk(input: AssessmentInput): RiskProfile {
  const s = assessSensitivity(input);
  const p = assessProbability(input);
  return {
    sensitivity: s.level,
    sensitivityReasons: s.reasons,
    probability: p.level,
    probabilityReasons: p.reasons,
    unknowns: p.unknowns,
    foreseeableHarms: foreseeableHarms(input)
  };
}
