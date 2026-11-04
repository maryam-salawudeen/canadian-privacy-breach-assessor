import { emptyInput } from "../src/engine/defaults";
import type { AssessmentInput } from "../src/engine/types";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends (infer U)[] ? U[] : T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** Builds an assessment from a blank one plus overrides, one level deep per section. */
export function make(over: DeepPartial<AssessmentInput> = {}): AssessmentInput {
  const base = emptyInput();
  return {
    org: { ...base.org, ...over.org },
    scope: { ...base.scope, ...over.scope },
    incident: { ...base.incident, ...over.incident },
    data: { ...base.data, ...over.data },
    misuse: { ...base.misuse, ...over.misuse },
    response: { ...base.response, ...over.response }
  } as AssessmentInput;
}

/** Everything known and benign, so a test can change one factor at a time. */
export const CALM = {
  recipient: "known-limited",
  maliciousIntent: "no",
  misuseEvidence: "no",
  publiclyPosted: "no",
  recovered: "no",
  recipientConfirmedDeletion: "no",
  encryption: "none",
  exposure: "hours",
  vulnerablePeople: "no"
} as const;
