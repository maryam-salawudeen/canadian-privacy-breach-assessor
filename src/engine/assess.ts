import { ALBERTA } from "../rules/alberta";
import { PIPEDA } from "../rules/pipeda";
import { quebecRules } from "../rules/quebec";
import type { LawRules } from "../rules/types";
import { albertaApplies, outOfScopeNotes, pipedaApplies, quebecApplies, type ApplicabilityResult } from "./jurisdiction";
import { assessRisk } from "./risk";
import type { AssessmentInput, AssessmentResult, LawResult, Obligation, Probability, Reason, RiskProfile, Verdict } from "./types";
import type { Sensitivity } from "../rules/dataCategories";

/**
 * Turns sensitivity and probability into a verdict. The matrix leans towards
 * reporting: when the answer is not clear it returns "lean-report", never a
 * reassurance. "not-indicated" means only that the answers given don't point to
 * the threshold being met; it is never a finding that the breach is harmless.
 */
export const VERDICT_MATRIX: Record<Probability, Record<Sensitivity, Verdict>> = {
  negligible: { low: "not-indicated", moderate: "not-indicated", high: "not-indicated" },
  low: { low: "not-indicated", moderate: "not-indicated", high: "lean-report" },
  moderate: { low: "not-indicated", moderate: "lean-report", high: "report" },
  high: { low: "lean-report", moderate: "report", high: "report" }
};

/** With this many key facts unknown, "not-indicated" becomes "lean-report". */
export const UNKNOWN_LIMIT = 3;

const LEVEL_WORD: Record<Probability | Sensitivity, string> = {
  negligible: "very unlikely",
  low: "low",
  moderate: "moderate",
  high: "high"
};

export function baseVerdict(risk: RiskProfile): Verdict {
  return VERDICT_MATRIX[risk.probability][risk.sensitivity];
}

/** Adds months to an ISO date (YYYY-MM-DD). Returns undefined for an empty or invalid date. */
export function addMonths(iso: string, months: number): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}

function verdictFor(rules: LawRules, input: AssessmentInput, risk: RiskProfile, app: ApplicabilityResult): { verdict: Verdict; reasons: Reason[] } {
  let verdict = baseVerdict(risk);
  const reasons: Reason[] = [];

  reasons.push({
    text: `Sensitivity is ${LEVEL_WORD[risk.sensitivity]} and the likelihood of misuse is ${LEVEL_WORD[risk.probability]}. These are the factors this law asks you to weigh for the ${rules.threshold} test.`,
    cite: rules.harmFactors[0].cite
  });

  if (verdict === "not-indicated" && risk.probability !== "negligible" && risk.unknowns.length >= UNKNOWN_LIMIT) {
    verdict = "lean-report";
    reasons.push({
      text: `Too many key facts are still unknown (${risk.unknowns.length}) to conclude the threshold isn't met, so this tool leans towards reporting until they are answered.`
    });
  }

  const covered = input.incident.kinds.some((k) => rules.incidentDefinition.covers.includes(k));
  if (input.incident.kinds.length && !covered) {
    reasons.push({
      text: `What you described may not fit this law's definition (${rules.incidentDefinition.text}) If the use involved accessing records without authority, it is unauthorized access and the duty applies. Because this is uncertain, the result leans towards reporting rather than ruling it out.`,
      cite: rules.incidentDefinition.cite
    });
    if (verdict === "report") verdict = "lean-report";
  }

  if (verdict === "report") {
    reasons.push({
      text: `On these answers it is reasonable to conclude there is a ${rules.threshold}. Report to the ${rules.regulatorShort} and notify the people affected.`,
      cite: rules.reportingDuty.cite
    });
  } else if (verdict === "lean-report") {
    reasons.push({
      text: `This is a borderline case. The answers don't clearly rule out a ${rules.threshold}, so this tool recommends reporting to the ${rules.regulatorShort}. Over-reporting costs little; failing to report a breach that meets the test is a contravention. Record your reasoning either way.`,
      cite: rules.reportingDuty.cite
    });
  } else {
    reasons.push({
      text: `The answers given don't point to a ${rules.threshold}. This is not a finding that the breach is harmless. Reassess straight away if you learn anything new (for example signs of misuse), and record your reasoning.`,
      cite: rules.reportingDuty.cite
    });
  }

  if (risk.unknowns.length) {
    reasons.push({ text: `Still unknown: ${risk.unknowns.join("; ")}. Unknowns were treated as raising the risk, not lowering it.` });
  }
  if (app.applicability === "may-apply") {
    reasons.push({ text: `It is not certain that this law applies (see above). If it does, this is the result.` });
  }
  return { verdict, reasons };
}

function obligationsFor(rules: LawRules, verdict: Verdict, input: AssessmentInput): Obligation[] {
  const out: Obligation[] = [];
  const reporting = verdict !== "not-indicated";
  const firm = verdict === "report";

  if (rules.id === "quebec") {
    out.push({
      id: "consult-privacy-officer",
      title: "Consult your person in charge of the protection of personal information",
      required: true,
      detail: "Quebec requires the risk assessment to be made in consultation with this person.",
      cite: rules.harmFactors[3].cite
    });
  }

  if (reporting) {
    out.push({
      id: "report-regulator",
      title: `${firm ? "Report" : "Recommended: report"} to the ${rules.regulator}`,
      required: firm,
      detail: rules.howToReport.text,
      deadline: rules.deadlineRegulator.text,
      cite: rules.deadlineRegulator.cite
    });
    const hold = rules.id === "quebec" && input.response.lawEnforcementHold;
    out.push({
      id: "notify-individuals",
      title: `${firm && rules.individualNotice.mandatory ? "Notify" : "Recommended: notify"} the people affected`,
      required: firm && rules.individualNotice.mandatory,
      detail:
        rules.individualNotice.text +
        " " +
        rules.indirectNotice.text +
        (hold ? " You said notice could hamper a law-enforcement investigation: notice to individuals can wait only while that remains true." : ""),
      deadline: rules.deadlineIndividuals.text,
      cite: rules.individualNotice.cite
    });
    const others = rules.notes.find((n) => n.cite.pinpoint.startsWith("s. 10.2"));
    if (others) {
      out.push({ id: "notify-others", title: "Notify other organisations that can reduce the harm", required: firm, detail: others.text, cite: others.cite });
    }
  }

  out.push({
    id: "keep-record",
    title: rules.recordKeeping.required ? "Record this breach" : "Record this breach (good practice)",
    required: rules.recordKeeping.required,
    detail: rules.recordKeeping.text,
    cite: rules.recordKeeping.cite
  });
  return out;
}

function lawResult(rules: LawRules, app: ApplicabilityResult, input: AssessmentInput, risk: RiskProfile): LawResult {
  const base: LawResult = {
    law: rules.id,
    name: rules.shortName,
    applicability: app.applicability,
    applicabilityReasons: app.reasons,
    verdictReasons: [],
    obligations: []
  };
  if (app.applicability === "not-applicable") return base;

  const { verdict, reasons } = verdictFor(rules, input, risk, app);
  const rk = rules.recordKeeping;
  const fromDate = rk.retentionFrom === "determined" ? input.incident.determined || input.incident.becameAware : input.incident.becameAware;
  return {
    ...base,
    verdict,
    verdictReasons: reasons,
    obligations: obligationsFor(rules, verdict, input),
    retentionUntil: rk.required && rk.retentionMonths ? addMonths(fromDate, rk.retentionMonths) : undefined
  };
}

export function rulesFor(law: LawResult["law"], input: AssessmentInput): LawRules {
  if (law === "pipeda") return PIPEDA;
  if (law === "alberta") return ALBERTA;
  return quebecRules(quebecApplies(input).sector);
}

export function assess(input: AssessmentInput, now: Date = new Date()): AssessmentResult {
  const risk = assessRisk(input);
  const qc = quebecApplies(input);
  return {
    risk,
    laws: [
      lawResult(PIPEDA, pipedaApplies(input), input, risk),
      lawResult(quebecRules(qc.sector), qc, input, risk),
      lawResult(ALBERTA, albertaApplies(input), input, risk)
    ],
    outOfScope: outOfScopeNotes(input),
    assessedAt: now.toISOString()
  };
}

/** The most cautious verdict across the laws that apply or may apply. */
export function overallVerdict(result: AssessmentResult): Verdict | undefined {
  const order: Verdict[] = ["not-indicated", "lean-report", "report"];
  let best: Verdict | undefined;
  for (const l of result.laws) {
    if (l.verdict && (!best || order.indexOf(l.verdict) > order.indexOf(best))) best = l.verdict;
  }
  return best;
}
