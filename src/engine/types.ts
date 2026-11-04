import type { DataCategoryId, Sensitivity } from "../rules/dataCategories";
import type { Cite } from "../rules/sources";
import type { IncidentKind, LawId } from "../rules/types";

export type Province = "AB" | "BC" | "MB" | "NB" | "NL" | "NS" | "NT" | "NU" | "ON" | "PE" | "QC" | "SK" | "YT";

export const PROVINCES: { code: Province; name: string }[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" }
];

/**
 * private: provincially regulated business.
 * federal: federally regulated (bank, airline, telecom, interprovincial transport…).
 * nonprofit: charity, society or other non-profit.
 * public: municipality or other public body.
 */
export type OrgType = "private" | "federal" | "nonprofit" | "public";

export type TriState = "yes" | "no" | "unknown";

/** Who got, or could have got, the information. Mirrors the OPC and OIPC Alberta questions. */
export type Recipient =
  | "known-threat" // hackers, thieves, people likely to try to cause harm
  | "unknown" // unknown person or people
  | "many" // a large number of people, or the public
  | "relationship" // someone with a relationship to the individual (ex-spouse, boss, neighbour)
  | "known-limited" // a limited, known recipient (e.g. a misdirected email to a business partner)
  | "internal" // an employee or insider without authorization
  | "nobody-known"; // lost, with no sign anyone accessed it

export type Encryption = "strong" | "weak-or-compromised" | "none" | "unknown";
export type Exposure = "hours" | "days" | "weeks" | "unknown";

export interface AssessmentInput {
  org: {
    name: string;
    type: OrgType;
    /** Province where the organisation operates and handled this information. */
    province: Province;
    /** For non-profits: was the information handled in a commercial activity (e.g. selling lists, fee-based services)? */
    commercialActivity: boolean;
    /** False when the organisation is a service provider holding the information for a client. */
    inControl: boolean;
    quebecBusinessNumber: string;
    contactName: string;
    contactTitle: string;
    contactEmail: string;
    contactPhone: string;
    /** Contact point for affected people (toll-free number, email…). */
    publicContact: string;
  };
  scope: {
    residentProvinces: Province[];
    outsideCanada: boolean;
    /** Did the information cross provincial or national borders in a commercial activity? */
    crossBorder: TriState;
    /** Is the information about the organisation's own employees or job applicants? */
    employeeInfo: boolean;
  };
  incident: {
    title: string;
    kinds: IncidentKind[];
    circumstances: string;
    cause: string;
    occurredFrom: string; // ISO date, may be empty
    occurredTo: string;
    occurredApprox: string; // free text when dates are unknown
    becameAware: string;
    determined: string;
    affectedCount: number | null;
    affectedApprox: boolean;
    quebecResidentCount: number | null;
    otherRegulators: string;
  };
  data: {
    categories: DataCategoryId[];
    description: string;
    /** The context makes the information more sensitive than it looks (e.g. a client list of an addiction clinic). */
    contextRaisesSensitivity: boolean;
  };
  misuse: {
    recipient: Recipient;
    maliciousIntent: TriState;
    misuseEvidence: TriState;
    publiclyPosted: TriState;
    recovered: TriState;
    /** For known recipients: did they confirm in writing they deleted it and did not share it? */
    recipientConfirmedDeletion: TriState;
    encryption: Encryption;
    exposure: Exposure;
    vulnerablePeople: TriState;
  };
  response: {
    containment: string;
    prevention: string;
    individualSteps: string;
    notifyPlan: string;
    lawEnforcementHold: boolean;
  };
}

export type Applicability = "applies" | "may-apply" | "not-applicable";
export type Verdict = "report" | "lean-report" | "not-indicated";
export type Probability = "negligible" | "low" | "moderate" | "high";

export interface Reason {
  text: string;
  cite?: Cite;
}

export interface Obligation {
  id: "report-regulator" | "notify-individuals" | "notify-others" | "keep-record" | "consult-privacy-officer";
  title: string;
  required: boolean;
  detail: string;
  deadline?: string;
  cite: Cite;
}

export interface LawResult {
  law: LawId;
  name: string;
  applicability: Applicability;
  applicabilityReasons: Reason[];
  /** Absent when the law does not apply. */
  verdict?: Verdict;
  verdictReasons: Reason[];
  obligations: Obligation[];
  /** Record retention for this law, if it requires a record. */
  retentionUntil?: string;
}

export interface RiskProfile {
  sensitivity: Sensitivity;
  sensitivityReasons: Reason[];
  probability: Probability;
  probabilityReasons: Reason[];
  unknowns: string[];
  foreseeableHarms: string[];
}

export interface AssessmentResult {
  risk: RiskProfile;
  laws: LawResult[];
  /** Laws and situations this tool does not cover but the user should check. */
  outOfScope: Reason[];
  assessedAt: string;
}
