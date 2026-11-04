import { cite, type SourceId } from "./sources";
import type { LawRules } from "./types";

/**
 * Quebec confidentiality-incident rules (Law 25).
 *
 * Private sector: Act respecting the protection of personal information in the
 * private sector (P-39.1), ss. 3.5–3.8. Public bodies, including Quebec
 * municipalities: Access Act (A-2.1), ss. 63.8–63.11, which use the same test.
 * Both share the Regulation respecting confidentiality incidents
 * (A-2.1, r. 3.1), ss. 3–8. Verified against the official text on 2026-11-04.
 */

export type QuebecSector = "private" | "public";

interface SectorCites {
  act: SourceId;
  duty: string;
  definition: string;
  factors: string;
  register: string;
  who: string;
}

const SECTOR: Record<QuebecSector, SectorCites> = {
  private: { act: "qc-private", duty: "s. 3.5", definition: "s. 3.6", factors: "s. 3.7", register: "s. 3.8", who: "person carrying on an enterprise" },
  public: { act: "qc-public", duty: "s. 63.8", definition: "s. 63.9", factors: "s. 63.10", register: "s. 63.11", who: "public body" }
};

const REG = "qc-incidents-reg" as const;

export function quebecRules(sector: QuebecSector): LawRules {
  const s = SECTOR[sector];
  return {
    id: "quebec",
    name:
      sector === "private"
        ? "Quebec Act respecting the protection of personal information in the private sector (as amended by Law 25)"
        : "Quebec Act respecting Access to documents held by public bodies and the Protection of personal information (as amended by Law 25)",
    shortName: sector === "private" ? "Quebec Law 25 (private sector)" : "Quebec Law 25 (public bodies)",
    regulator: "Commission d'accès à l'information du Québec",
    regulatorShort: "CAI",
    threshold: "risk of serious injury",
    incidentDefinition: {
      text:
        "A \"confidentiality incident\" is access to, use of or communication of personal information not authorized by law, or the loss of personal information or any other breach of its protection.",
      cite: cite(s.act, `${s.definition} (definition of "confidentiality incident")`),
      covers: ["unauthorized-access", "unauthorized-use", "unauthorized-disclosure", "loss", "other"]
    },
    reportingDuty: {
      text:
        `A ${s.who} that has cause to believe a confidentiality incident has occurred must take reasonable measures to reduce the risk of injury and prevent new incidents of the same nature. If the incident presents a risk of serious injury, it must promptly notify the Commission and any person whose personal information is concerned.`,
      cite: cite(s.act, `${s.duty}, paras. 1–2`)
    },
    harmFactors: [
      { text: "The sensitivity of the information concerned.", cite: cite(s.act, s.factors) },
      { text: "The anticipated consequences of its use.", cite: cite(s.act, s.factors) },
      { text: "The likelihood that the information will be used for injurious purposes.", cite: cite(s.act, s.factors) },
      {
        text: "The assessment must be made in consultation with the person in charge of the protection of personal information.",
        cite: cite(s.act, s.factors)
      }
    ],
    harmDefinition: {
      text:
        "The Acts do not list kinds of injury. Information is \"sensitive\" if, due to its nature (in particular medical, biometric or otherwise intimate) or the context of its use or communication, it entails a high level of reasonable expectation of privacy.",
      cite: cite("qc-private", "s. 12, para. 4(2)")
    },
    deadlineRegulator: {
      text: "Promptly. The Act sets no fixed number of days. Information learned after the notice must be sent to the Commission promptly.",
      cite: cite(s.act, `${s.duty}, para. 2; Regulation s. 4`)
    },
    deadlineIndividuals: {
      text:
        "Promptly, with the Commission. A person need not be notified so long as doing so could hamper an investigation by a body responsible by law for preventing, detecting or repressing crime or statutory offences.",
      cite: cite(s.act, `${s.duty}, paras. 2–3`)
    },
    individualNotice: {
      mandatory: true,
      text:
        "Any person whose personal information is concerned by an incident presenting a risk of serious injury must be notified. If not, the Commission may order it. Any person or body that could reduce the risk may also be notified, sharing only the information needed for that purpose.",
      cite: cite(s.act, `${s.duty}, para. 2`)
    },
    regulatorNoticeFields: [
      { id: "org-name", label: "The name of the body and any Québec business number (NEQ) assigned to it", cite: cite(REG, "s. 3(1)") },
      { id: "contact-person", label: "The name and contact information of the person to be contacted in the body about the incident", cite: cite(REG, "s. 3(2)") },
      { id: "info-description", label: "A description of the personal information covered by the incident or, if not known, the reasons why it is impossible to describe it", cite: cite(REG, "s. 3(3)") },
      { id: "circumstances", label: "A brief description of the circumstances of the incident and what caused it, if known", cite: cite(REG, "s. 3(4)") },
      { id: "occurred", label: "The date or time period when the incident occurred or, if not known, the approximate time period", cite: cite(REG, "s. 3(5)") },
      { id: "became-aware", label: "The date or time period when the body became aware of the incident", cite: cite(REG, "s. 3(6)") },
      { id: "qc-resident-count", label: "The number of persons concerned and the number of those who reside in Québec or, if not known, the approximate numbers", cite: cite(REG, "s. 3(7)") },
      { id: "risk-assessment", label: "A description of the elements that led the body to conclude there is a risk of serious injury, such as the sensitivity of the information, possible ill-intentioned uses, the anticipated consequences of its use and the likelihood it will be used for injurious purposes", cite: cite(REG, "s. 3(8)") },
      { id: "notify-plan", label: "The measures taken or intended to notify the persons concerned, and the date they were notified or the expected time limit", cite: cite(REG, "s. 3(9)") },
      { id: "steps-prevent", label: "The measures taken or intended after the incident, including those to reduce or mitigate the risk of injury and to prevent new incidents of the same nature, with dates or expected time limits", cite: cite(REG, "s. 3(10)") },
      { id: "other-regulators", label: "If applicable, an indication that a body outside Québec with similar functions to the Commission has been notified", cite: cite(REG, "s. 3(11)") }
    ],
    individualNoticeFields: [
      { id: "info-description", label: "A description of the personal information covered by the incident or, if not known, the reasons why it is impossible to describe it", cite: cite(REG, "s. 5(1)") },
      { id: "circumstances", label: "A brief description of the circumstances of the incident", cite: cite(REG, "s. 5(2)") },
      { id: "occurred", label: "The date or time period when the incident occurred or, if not known, the approximate time period", cite: cite(REG, "s. 5(3)") },
      { id: "steps-reduce-harm", label: "A brief description of the measures taken or intended after the incident to reduce the risks of injury", cite: cite(REG, "s. 5(4)") },
      { id: "individual-steps", label: "The measures the body suggests the person take to reduce the risk of injury or mitigate it", cite: cite(REG, "s. 5(5)") },
      { id: "contact-for-individuals", label: "The contact information where the person can obtain more information about the incident", cite: cite(REG, "s. 5(6)") }
    ],
    indirectNotice: {
      text:
        "Notices go to each person concerned. They are given by public notice instead when sending them is likely to cause increased injury to the person, would cause undue hardship for the body, or the body has no contact information. A public notice may also be used when there is a need to act rapidly to reduce or mitigate a serious injury, but individual notices must still follow with proper diligence.",
      cite: cite(REG, "s. 6")
    },
    recordKeeping: {
      required: true,
      retentionMonths: 60,
      retentionFrom: "became-aware",
      text:
        "Keep a register of all confidentiality incidents, including those without a risk of serious injury, and send a copy to the Commission on request. Each entry records the information described, the circumstances, when the incident occurred and when the body became aware, the number of persons, why the body concluded there was or was not a risk of serious injury, notice dates (and any public notice with reasons) and the measures taken. Keep entries up to date for at least 5 years after the body became aware of the incident.",
      cite: cite(s.act, `${s.register}; Regulation ss. 7–8`)
    },
    howToReport: {
      text: "Notify the Commission in writing. The CAI provides an incident declaration form on its website.",
      cite: cite(REG, "s. 3; CAI incident form"),
      url: "https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/incidents-confidentialite-mesures-securite-entreprises"
    },
    serviceProviders: {
      text:
        "The CAI says an enterprise that entrusts personal information to a third party for storage remains responsible for all its incident obligations: measures, register and notices.",
      cite: cite("cai-incidents", "\"Renseignements personnels conservés par un tiers\"")
    },
    notes: [
      {
        text:
          "Quebec's definition is broader than PIPEDA's: it also covers use not authorized by law (for example, an employee browsing records without a work reason).",
        cite: cite(s.act, s.definition)
      },
      {
        text:
          "If any information about the incident is shared with a person or body that could reduce the risk, the person in charge of the protection of personal information must record that communication.",
        cite: cite(s.act, `${s.duty}, para. 2`)
      }
    ]
  };
}

export const QUEBEC_PRIVATE = quebecRules("private");
export const QUEBEC_PUBLIC = quebecRules("public");
