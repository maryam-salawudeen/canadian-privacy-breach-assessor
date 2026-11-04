import { SCOPE } from "../rules/scope";
import type { QuebecSector } from "../rules/quebec";
import { cite } from "../rules/sources";
import type { AssessmentInput, Applicability, Province, Reason } from "./types";

/**
 * Decides which of the three laws apply, from the kind of organisation, where
 * it operates and where the affected people live. Where the answer depends on
 * facts a form can't settle, the result is "may-apply" and the law is still
 * assessed, so nothing is missed.
 */

export interface ApplicabilityResult {
  applicability: Applicability;
  reasons: Reason[];
}

const SUBSTANTIALLY_SIMILAR: Province[] = ["QC", "AB", "BC"];

const provinceName: Record<Province, string> = {
  AB: "Alberta", BC: "British Columbia", MB: "Manitoba", NB: "New Brunswick", NL: "Newfoundland and Labrador",
  NS: "Nova Scotia", NT: "the Northwest Territories", NU: "Nunavut", ON: "Ontario", PE: "Prince Edward Island",
  QC: "Quebec", SK: "Saskatchewan", YT: "Yukon"
};

const isCommercial = (input: AssessmentInput) =>
  input.org.type === "private" || (input.org.type === "nonprofit" && input.org.commercialActivity);

export function pipedaApplies(input: AssessmentInput): ApplicabilityResult {
  const { org, scope } = input;
  if (org.type === "public") return { applicability: "not-applicable", reasons: [SCOPE.pipedaPublic] };
  if (org.type === "federal") {
    const reasons: Reason[] = [SCOPE.pipedaFederal];
    if (scope.employeeInfo) reasons.push(SCOPE.pipedaEmployees);
    return { applicability: "applies", reasons };
  }
  if (scope.employeeInfo) return { applicability: "not-applicable", reasons: [SCOPE.pipedaEmployees] };
  if (!isCommercial(input)) return { applicability: "not-applicable", reasons: [SCOPE.pipedaNonCommercial] };

  if (!SUBSTANTIALLY_SIMILAR.includes(org.province)) {
    return {
      applicability: "applies",
      reasons: [
        SCOPE.pipedaCommercial,
        { text: `${provinceName[org.province]} has no general private-sector privacy law of its own, so PIPEDA governs commercial activity there.`, cite: SCOPE.pipedaSubstantiallySimilar.cite }
      ]
    };
  }
  if (scope.crossBorder === "yes" || scope.outsideCanada) {
    return { applicability: "applies", reasons: [SCOPE.pipedaCrossBorder] };
  }
  const elsewhere = scope.residentProvinces.filter((p) => p !== org.province);
  if (elsewhere.length) {
    return {
      applicability: "may-apply",
      reasons: [
        { text: `Some affected people live outside ${provinceName[org.province]} (${elsewhere.map((p) => provinceName[p]).join(", ")}), so the information may have crossed provincial borders.` },
        SCOPE.pipedaCrossBorder
      ]
    };
  }
  if (scope.crossBorder === "unknown") {
    return {
      applicability: "may-apply",
      reasons: [{ text: "It is not known whether the information crossed provincial or national borders." }, SCOPE.pipedaCrossBorder]
    };
  }
  return { applicability: "not-applicable", reasons: [SCOPE.pipedaSubstantiallySimilar] };
}

export function quebecApplies(input: AssessmentInput): ApplicabilityResult & { sector: QuebecSector } {
  const { org, scope } = input;
  const qcResidents = scope.residentProvinces.includes("QC");
  if (org.type === "public") {
    return org.province === "QC"
      ? { applicability: "applies", sector: "public", reasons: [SCOPE.quebecPublic] }
      : { applicability: "not-applicable", sector: "public", reasons: [{ text: "Quebec's public-sector rules apply only to Quebec public bodies.", cite: SCOPE.quebecPublic.cite }] };
  }
  if (org.type === "federal") {
    return org.province === "QC" || qcResidents
      ? { applicability: "may-apply", sector: "private", reasons: [SCOPE.quebecFederal] }
      : { applicability: "not-applicable", sector: "private", reasons: [{ text: "The organisation does not operate in Quebec and no affected people live there." }] };
  }
  if (org.province === "QC") {
    if (org.type === "nonprofit" && !org.commercialActivity) {
      return {
        applicability: "may-apply",
        sector: "private",
        reasons: [
          SCOPE.quebecEnterprise,
          { text: "Most non-profits that carry on an organized activity are \"enterprises\" under article 1525 of the Civil Code. Confirm this applies to yours." }
        ]
      };
    }
    return { applicability: "applies", sector: "private", reasons: [SCOPE.quebecEnterprise] };
  }
  if (qcResidents) return { applicability: "may-apply", sector: "private", reasons: [SCOPE.quebecOutOfProvince] };
  return { applicability: "not-applicable", sector: "private", reasons: [{ text: "The organisation does not operate in Quebec and no affected people live there." }] };
}

export function albertaApplies(input: AssessmentInput): ApplicabilityResult {
  const { org, scope } = input;
  const inAlberta = org.province === "AB" || scope.residentProvinces.includes("AB");
  if (org.type === "public") {
    return {
      applicability: "not-applicable",
      reasons: [{ text: "Alberta PIPA does not apply to public bodies or information under their control. Alberta public bodies fall under the Protection of Privacy Act.", cite: cite("ab-pipa", "s. 4(2), (3)(e)") }]
    };
  }
  if (org.type === "federal") {
    return { applicability: "not-applicable", reasons: [SCOPE.pipedaFederal] };
  }
  if (!inAlberta) {
    return { applicability: "not-applicable", reasons: [{ text: "The organisation does not operate in Alberta and no affected people live there.", cite: SCOPE.albertaCollected.cite }] };
  }
  const reasons: Reason[] = [SCOPE.albertaCollected];
  if (org.type === "nonprofit") {
    reasons.push(SCOPE.albertaNonProfit);
    if (!org.commercialActivity) return { applicability: "may-apply", reasons };
  }
  if (org.province !== "AB") {
    reasons.unshift({ text: "Affected people live in Alberta, so the information may have been collected in Alberta even though the organisation is based elsewhere." });
  }
  return { applicability: "applies", reasons };
}

/** Situations the three laws in this tool don't cover, so the user knows to look further. */
export function outOfScopeNotes(input: AssessmentInput): Reason[] {
  const { org, scope, data } = input;
  const notes: Reason[] = [];
  if (org.type === "public" && org.province !== "QC") {
    notes.push({
      text: `Public bodies in ${provinceName[org.province]} are governed by that province's public-sector privacy law, which may have its own breach rules. This tool does not assess them.`
    });
  }
  if (data.categories.includes("health")) {
    notes.push({
      text:
        "If you are a health information custodian or trustee (for example under Alberta's Health Information Act or Ontario's Personal Health Information Protection Act, 2004), a provincial health privacy law with its own breach rules probably applies. Alberta PIPA, for example, does not apply to health information covered by the Health Information Act. This tool does not assess those laws.",
      cite: cite("ab-pipa", "s. 4(3)(f)")
    });
  }
  if (org.type !== "public" && org.type !== "federal" && (org.province === "BC" || scope.residentProvinces.includes("BC"))) {
    notes.push({
      text: "British Columbia's Personal Information Protection Act may apply to this breach. This tool does not assess it; check with the Office of the Information and Privacy Commissioner for British Columbia.",
      cite: SCOPE.pipedaSubstantiallySimilar.cite
    });
  }
  if (scope.outsideCanada) {
    notes.push({ text: "Some affected people live outside Canada. Foreign laws (for example the EU GDPR or US state breach laws) may also apply." });
  }
  if (scope.employeeInfo && (org.type === "private" || org.type === "nonprofit") && !["QC", "AB", "BC"].includes(org.province)) {
    notes.push({
      text: `PIPEDA does not cover employee information of provincially regulated employers, and ${provinceName[org.province]} has no general private-sector privacy law. Check whether another law, contract or policy requires you to act.`,
      cite: SCOPE.pipedaEmployees.cite
    });
  }
  if (!org.inControl) {
    notes.push({
      text:
        "You said you hold this information for a client. Under PIPEDA the organisation in control of the information (usually your client) reports and notifies. Tell your client promptly and follow your contract. The results below describe what the organisation in control must do.",
      cite: cite("opc-guidance", "Part 1 (meaning of \"control\")")
    });
  }
  return notes;
}
