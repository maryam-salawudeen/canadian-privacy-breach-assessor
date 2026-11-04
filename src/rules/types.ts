import type { Cite } from "./sources";

export type LawId = "pipeda" | "quebec" | "alberta";

/** What happened to the information. Each law's trigger covers a different set. */
export type IncidentKind = "unauthorized-access" | "unauthorized-disclosure" | "loss" | "unauthorized-use" | "other";

/** A statement of law or guidance with the place it comes from. */
export interface Rule {
  text: string;
  cite: Cite;
}

/**
 * Pieces of information a notice can require. The notice drafter fills each
 * one from the assessment, or leaves a [bracketed] gap.
 */
export type NoticeFieldId =
  | "org-name"
  | "contact-person"
  | "circumstances"
  | "cause"
  | "occurred"
  | "became-aware"
  | "info-description"
  | "affected-count"
  | "qc-resident-count"
  | "rrosh-count"
  | "risk-assessment"
  | "steps-reduce-harm"
  | "steps-prevent"
  | "notify-plan"
  | "individual-steps"
  | "contact-for-individuals"
  | "other-regulators";

export interface NoticeField {
  id: NoticeFieldId;
  /** Wording of the requirement, close to the source text. */
  label: string;
  cite: Cite;
}

export interface LawRules {
  id: LawId;
  name: string;
  shortName: string;
  regulator: string;
  regulatorShort: string;
  /** Plain-language name of the harm threshold, e.g. "real risk of significant harm". */
  threshold: string;
  /** What counts as a reportable kind of incident under this law. */
  incidentDefinition: Rule & { covers: IncidentKind[] };
  /** The duty to report to the regulator. */
  reportingDuty: Rule;
  /** The factors the law or regulator says to weigh. */
  harmFactors: Rule[];
  /** What counts as harm, where the law or regulator defines it. */
  harmDefinition: Rule;
  deadlineRegulator: Rule;
  deadlineIndividuals: Rule;
  /** Whether notifying individuals is required by the law itself or only on the regulator's order. */
  individualNotice: Rule & { mandatory: boolean };
  regulatorNoticeFields: NoticeField[];
  individualNoticeFields: NoticeField[];
  indirectNotice: Rule;
  recordKeeping: Rule & {
    required: boolean;
    /** Months to keep each record, counted from `retentionFrom`. */
    retentionMonths?: number;
    retentionFrom?: "determined" | "became-aware";
  };
  howToReport: Rule & { url: string };
  /** Who reports when a service provider holds the information. */
  serviceProviders: Rule;
  /** Other notes the assessor should see whenever this law is in play. */
  notes: Rule[];
}
