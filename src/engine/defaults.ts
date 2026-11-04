import type { AssessmentInput } from "./types";

/** A blank assessment. Every "unknown" here is deliberate: unknowns raise the risk until answered. */
export function emptyInput(): AssessmentInput {
  return {
    org: {
      name: "",
      type: "private",
      province: "ON",
      commercialActivity: true,
      inControl: true,
      quebecBusinessNumber: "",
      contactName: "",
      contactTitle: "",
      contactEmail: "",
      contactPhone: "",
      publicContact: ""
    },
    scope: { residentProvinces: [], outsideCanada: false, crossBorder: "unknown", employeeInfo: false },
    incident: {
      title: "",
      kinds: [],
      circumstances: "",
      cause: "",
      occurredFrom: "",
      occurredTo: "",
      occurredApprox: "",
      becameAware: "",
      determined: "",
      affectedCount: null,
      affectedApprox: false,
      quebecResidentCount: null,
      otherRegulators: ""
    },
    data: { categories: [], description: "", contextRaisesSensitivity: false },
    misuse: {
      recipient: "unknown",
      maliciousIntent: "unknown",
      misuseEvidence: "unknown",
      publiclyPosted: "unknown",
      recovered: "unknown",
      recipientConfirmedDeletion: "unknown",
      encryption: "unknown",
      exposure: "unknown",
      vulnerablePeople: "unknown"
    },
    response: { containment: "", prevention: "", individualSteps: "", notifyPlan: "", lawEnforcementHold: false }
  };
}
