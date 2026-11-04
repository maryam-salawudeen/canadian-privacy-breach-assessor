import { CATEGORY_BY_ID } from "../rules/dataCategories";
import { formatCite, type Cite } from "../rules/sources";
import type { LawRules, NoticeFieldId } from "../rules/types";
import type { AssessmentInput, AssessmentResult } from "./types";

/**
 * Drafts the notice to the regulator and to affected people from the fields
 * each law's regulation prescribes. Anything the user hasn't supplied is left
 * as a [bracketed] gap so it can't be mistaken for a finished notice.
 */

export interface DraftField {
  id: NoticeFieldId;
  label: string;
  value: string;
  missing: boolean;
  cite: Cite;
}

export interface DraftNotice {
  kind: "regulator" | "individuals";
  title: string;
  fields: DraftField[];
  text: string;
  missingCount: number;
}

const gap = (what: string) => `[${what}]`;
const has = (s: string | undefined | null) => !!s && s.trim().length > 0;

export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

export function describePeriod(input: AssessmentInput): string | undefined {
  const { occurredFrom: from, occurredTo: to, occurredApprox: approx } = input.incident;
  if (has(from) && has(to) && from !== to) return `Between ${formatDate(from)} and ${formatDate(to)}`;
  if (has(from)) return `On or about ${formatDate(from)}`;
  if (has(approx)) return `Approximately: ${approx.trim()}`;
  return undefined;
}

export function describeInformation(input: AssessmentInput): string | undefined {
  const labels = input.data.categories.filter((c) => c !== "other").map((c) => CATEGORY_BY_ID[c].label.toLowerCase());
  const parts: string[] = [];
  if (labels.length) parts.push(`The information involved: ${labels.join("; ")}.`);
  if (has(input.data.description)) parts.push(input.data.description.trim());
  return parts.length ? parts.join(" ") : undefined;
}

function describeCount(n: number | null, approx: boolean): string | undefined {
  if (n === null || Number.isNaN(n)) return undefined;
  return `${approx ? "Approximately " : ""}${n.toLocaleString("en-CA")}`;
}

function contact(input: AssessmentInput): string | undefined {
  const o = input.org;
  const bits = [o.contactName, o.contactTitle, o.contactEmail, o.contactPhone].filter(has);
  return has(o.contactName) && (has(o.contactEmail) || has(o.contactPhone)) ? bits.join(", ") : undefined;
}

/** Plain-language explanation of the risk assessment, as the OIPC Alberta and the CAI expect: reasons, not just a level. */
export function riskNarrative(result: AssessmentResult): string {
  const r = result.risk;
  const parts: string[] = [];
  parts.push(`Sensitivity: ${r.sensitivity}. ${r.sensitivityReasons.map((x) => x.text).join(" ")}`);
  parts.push(`Likelihood of misuse: ${r.probability === "negligible" ? "very unlikely" : r.probability}. ${r.probabilityReasons.map((x) => x.text).join(" ")}`);
  if (r.foreseeableHarms.length) parts.push(`Harms that could reasonably result: ${r.foreseeableHarms.join(", ")}.`);
  return parts.join("\n");
}

function fieldValue(id: NoticeFieldId, input: AssessmentInput, result: AssessmentResult): { value: string; missing: boolean } {
  const i = input.incident;
  const v = (val: string | undefined, placeholder: string) => (has(val) ? { value: val!.trim(), missing: false } : { value: gap(placeholder), missing: true });
  switch (id) {
    case "org-name": {
      const name = has(input.org.name) ? input.org.name.trim() : gap("Organisation name");
      const neq = has(input.org.quebecBusinessNumber) ? `Québec business number (NEQ): ${input.org.quebecBusinessNumber.trim()}` : gap("Québec business number (NEQ), if any");
      return { value: `${name}\n${neq}`, missing: !has(input.org.name) || !has(input.org.quebecBusinessNumber) };
    }
    case "contact-person":
      return v(contact(input), "Name, title, email and phone of the person who can answer questions about the breach");
    case "circumstances": {
      const circ = has(i.circumstances) ? i.circumstances.trim() : gap("What happened, in plain words");
      const cause = has(i.cause) ? `Cause: ${i.cause.trim()}` : gap("Cause, if known (or say it is not yet known)");
      return { value: `${circ}\n${cause}`, missing: !has(i.circumstances) || !has(i.cause) };
    }
    case "cause":
      return v(i.cause, "Cause, if known");
    case "occurred":
      return v(describePeriod(input), "Date or period of the breach, or the approximate period");
    case "became-aware":
      return v(has(i.becameAware) ? formatDate(i.becameAware) : undefined, "Date you became aware of the incident");
    case "info-description":
      return v(describeInformation(input), "Description of the personal information involved, or why it can't yet be described");
    case "affected-count":
      return v(describeCount(i.affectedCount, i.affectedApprox), "Number of people affected, or an estimate");
    case "qc-resident-count": {
      const total = describeCount(i.affectedCount, i.affectedApprox);
      const qc = describeCount(i.quebecResidentCount, i.affectedApprox);
      return {
        value: `Persons concerned: ${total ?? gap("total number or estimate")}\nOf whom reside in Québec: ${qc ?? gap("number or estimate")}`,
        missing: !total || !qc
      };
    }
    case "rrosh-count":
      return v(describeCount(i.affectedCount, i.affectedApprox), "Estimate of the number of people at real risk of significant harm");
    case "risk-assessment":
      return { value: riskNarrative(result), missing: false };
    case "steps-reduce-harm":
      return v(input.response.containment, "Steps taken to contain the breach and reduce the risk of harm");
    case "steps-prevent": {
      const a = has(input.response.containment) ? input.response.containment.trim() : gap("Measures taken to reduce or mitigate the risk of injury, with dates");
      const b = has(input.response.prevention) ? input.response.prevention.trim() : gap("Measures to prevent similar incidents, with dates or expected time limits");
      return { value: `${a}\n${b}`, missing: !has(input.response.containment) || !has(input.response.prevention) };
    }
    case "notify-plan":
      return v(input.response.notifyPlan, "How and when you notified, or will notify, the people affected");
    case "individual-steps":
      return v(input.response.individualSteps, suggestedStepsPlaceholder(input));
    case "contact-for-individuals":
      return v(input.org.publicContact, "Toll-free number or email address people can use for more information");
    case "other-regulators":
      return v(i.otherRegulators, "Whether a privacy regulator outside Québec (e.g. the OPC or OIPC Alberta) has been notified, or \"Not applicable\"");
    default: {
      const unhandled: never = id;
      throw new Error(`No value for notice field ${unhandled}`);
    }
  }
}

function suggestedStepsPlaceholder(input: AssessmentInput): string {
  const tips: string[] = [];
  const c = input.data.categories;
  if (c.includes("financial") || c.includes("government-id")) tips.push("watch bank and card statements", "consider a credit-bureau fraud alert");
  if (c.includes("credentials")) tips.push("change the password and any reused passwords", "turn on two-step verification");
  if (c.includes("contact")) tips.push("be wary of emails or calls that mention this incident");
  return tips.length ? `Steps people can take, e.g. ${tips.join("; ")}` : "Steps people can take to protect themselves";
}

/** Plain headings for the letter to individuals; the legal wording stays in `label` for the checklist. */
const PLAIN_HEADING: Partial<Record<NoticeFieldId, string>> = {
  circumstances: "What happened",
  occurred: "When it happened",
  "info-description": "What information was involved",
  "steps-reduce-harm": "What we are doing",
  "individual-steps": "What you can do",
  "contact-for-individuals": "For more information"
};

function render(title: string, intro: string[], fields: DraftField[], outro: string[], plain = false): string {
  const body = fields.map((f) => `${(plain && PLAIN_HEADING[f.id]) || f.label}\n${f.value}`).join("\n\n");
  return [title, "", ...intro, "", body, "", ...outro].join("\n").trim() + "\n";
}

export function draftRegulatorNotice(rules: LawRules, input: AssessmentInput, result: AssessmentResult): DraftNotice {
  const fields = rules.regulatorNoticeFields.map((f) => ({ id: f.id, label: f.label, cite: f.cite, ...fieldValue(f.id, input, result) }));
  const org = has(input.org.name) ? input.org.name.trim() : gap("Organisation name");
  const title = `DRAFT: Notice of a privacy breach to the ${rules.regulator}`;
  const intro = [
    `From: ${org}`,
    `Law: ${rules.name}`,
    `Duty: ${rules.reportingDuty.text} (${formatCite(rules.reportingDuty.cite)})`
  ];
  const outro = [
    "Each heading above is an item the law requires in this notice:",
    ...fields.map((f) => `- ${formatCite(f.cite)}`),
    "",
    rules.howToReport.text,
    "Draft produced by the Canadian Privacy Breach Assessor. Informational only, not legal advice. Review before sending."
  ];
  return { kind: "regulator", title, fields, text: render(title, intro, fields, outro), missingCount: fields.filter((f) => f.missing).length };
}

export function draftIndividualNotice(rules: LawRules, input: AssessmentInput, result: AssessmentResult): DraftNotice {
  const fields = rules.individualNoticeFields.map((f) => ({ id: f.id, label: f.label, cite: f.cite, ...fieldValue(f.id, input, result) }));
  const org = has(input.org.name) ? input.org.name.trim() : gap("Organisation name");
  const title = `DRAFT: Notice to people affected by a privacy breach at ${org}`;
  const intro = [
    gap("Recipient name, or \"Dear customer\""),
    "",
    `We are writing to tell you about a privacy incident at ${org} that involves your personal information, what we have done about it, and what you can do.`
  ];
  const outro = [
    "We are sorry this happened.",
    has(input.org.contactName) ? `${input.org.contactName.trim()}${has(input.org.contactTitle) ? `, ${input.org.contactTitle.trim()}` : ""}` : gap("Name and title of signatory"),
    org,
    "",
    "Notes for the sender (remove before sending):",
    `- Required content: ${fields.map((f) => formatCite(f.cite)).join("; ")}.`,
    `- ${rules.indirectNotice.text}`,
    ...(rules.id === "quebec" ? ["- For people in Québec, consider sending the notice in French: the Charter of the French Language may require it."] : []),
    "- Draft produced by the Canadian Privacy Breach Assessor. Informational only, not legal advice."
  ];
  return { kind: "individuals", title, fields, text: render(title, intro, fields, outro, true), missingCount: fields.filter((f) => f.missing).length };
}
