import { cite } from "./sources";
import type { LawRules } from "./types";

/**
 * Alberta Personal Information Protection Act (PIPA) breach rules.
 * Act: ss. 34.1, 37.1, 56. Regulation (Alta Reg 366/2003): ss. 19, 19.1.
 * Verified against the King's Printer consolidations on 2026-11-04.
 */
export const ALBERTA: LawRules = {
  id: "alberta",
  name: "Alberta Personal Information Protection Act (PIPA)",
  shortName: "Alberta PIPA",
  regulator: "Office of the Information and Privacy Commissioner of Alberta",
  regulatorShort: "OIPC Alberta",
  threshold: "real risk of significant harm (RROSH)",
  incidentDefinition: {
    text: "Any incident involving the loss of, or unauthorized access to or disclosure of, personal information under the organization's control.",
    cite: cite("ab-pipa", "s. 34.1(1)"),
    covers: ["unauthorized-access", "unauthorized-disclosure", "loss"]
  },
  reportingDuty: {
    text:
      "An organization having personal information under its control must, without unreasonable delay, notify the Commissioner of any incident involving the loss of or unauthorized access to or disclosure of the information where a reasonable person would consider that there exists a real risk of significant harm to an individual as a result.",
    cite: cite("ab-pipa", "s. 34.1(1)")
  },
  harmFactors: [
    {
      text:
        "Factors the OIPC lists: the nature of the information; who obtained or could have obtained access; how many people it was exposed to; any personal or professional relationship between the individual and the recipient; security measures such as encryption and any known flaws; how long it was exposed; evidence of malicious intent (theft, hacking, malware); whether it could be used for identity theft or fraud; whether it was recovered; how many individuals are affected; whether vulnerable individuals such as youth or seniors are involved.",
      cite: cite("oipc-ab-guidance", "Section C, \"Real Risk of Significant Harm\"")
    },
    {
      text: "The risk must be more than mere speculation or conjecture, and the organization must consider all the circumstances.",
      cite: cite("oipc-ab-guidance", "Section C, \"Real Risk of Significant Harm\"")
    },
    {
      text: "Describing the risk as \"low\", \"medium\" or \"high\" alone does not meet the requirement for an assessment of the risk of harm. Explain the reasons.",
      cite: cite("oipc-ab-guidance", "Section C, \"Real Risk of Significant Harm\"")
    }
  ],
  harmDefinition: {
    text:
      "Significant harm is damage, detriment or injury to the individual. The OIPC's examples include embarrassment, hurt or humiliation; damage to reputation or relationships; loss of employment, business or professional opportunities; financial loss; identity theft; fraud; negative effects on a credit record; damage to or loss of property; bodily harm; and blackmail or extortion.",
    cite: cite("oipc-ab-guidance", "Section C, \"Significant Harm\"")
  },
  deadlineRegulator: {
    text:
      "Without unreasonable delay. The Act sets no fixed number of days. The OIPC recommends notifying as soon as possible, even if not all the information on its form is available yet.",
    cite: cite("ab-pipa", "s. 34.1(1); OIPC Alberta notification guidance")
  },
  deadlineIndividuals: {
    text:
      "Within the time the Commissioner sets, if the Commissioner requires notification. The Commissioner encourages organizations not to wait and to notify affected individuals immediately on their own initiative when they believe a real risk of significant harm exists.",
    cite: cite("ab-pipa", "s. 37.1(1)(b); OIPC Alberta notification guidance")
  },
  individualNotice: {
    mandatory: false,
    text:
      "PIPA itself makes notifying individuals a duty only when the Commissioner requires it. In practice the Commissioner encourages organizations to notify directly without waiting, using the content the Regulation prescribes.",
    cite: cite("ab-pipa", "s. 37.1; OIPC Alberta notification guidance")
  },
  regulatorNoticeFields: [
    { id: "circumstances", label: "A description of the circumstances of the loss or unauthorized access or disclosure", cite: cite("ab-pipa-reg", "s. 19(a)") },
    { id: "occurred", label: "The date on which or time period during which the loss or unauthorized access or disclosure occurred", cite: cite("ab-pipa-reg", "s. 19(b)") },
    { id: "info-description", label: "A description of the personal information involved", cite: cite("ab-pipa-reg", "s. 19(c)") },
    { id: "risk-assessment", label: "An assessment of the risk of harm to individuals as a result of the loss or unauthorized access or disclosure", cite: cite("ab-pipa-reg", "s. 19(d)") },
    { id: "rrosh-count", label: "An estimate of the number of individuals to whom there is a real risk of significant harm", cite: cite("ab-pipa-reg", "s. 19(e)") },
    { id: "steps-reduce-harm", label: "A description of any steps the organization has taken to reduce the risk of harm to individuals", cite: cite("ab-pipa-reg", "s. 19(f)") },
    { id: "notify-plan", label: "A description of any steps the organization has taken to notify individuals", cite: cite("ab-pipa-reg", "s. 19(g)") },
    { id: "contact-person", label: "The name of and contact information for a person who can answer, on behalf of the organization, the Commissioner's questions", cite: cite("ab-pipa-reg", "s. 19(h)") }
  ],
  individualNoticeFields: [
    { id: "circumstances", label: "A description of the circumstances of the loss or unauthorized access or disclosure", cite: cite("ab-pipa-reg", "s. 19.1(1)(b)(i)") },
    { id: "occurred", label: "The date on which or time period during which it occurred", cite: cite("ab-pipa-reg", "s. 19.1(1)(b)(ii)") },
    { id: "info-description", label: "A description of the personal information involved", cite: cite("ab-pipa-reg", "s. 19.1(1)(b)(iii)") },
    { id: "steps-reduce-harm", label: "A description of any steps the organization has taken to reduce the risk of harm", cite: cite("ab-pipa-reg", "s. 19.1(1)(b)(iv)") },
    { id: "contact-for-individuals", label: "Contact information for a person who can answer, on behalf of the organization, questions about it", cite: cite("ab-pipa-reg", "s. 19.1(1)(b)(v)") }
  ],
  indirectNotice: {
    text:
      "A required notification must be given directly to the individual. It may be given indirectly only if the Commissioner determines direct notification would be unreasonable in the circumstances; the OIPC suggests making a submission explaining why, with a plan for indirect notice.",
    cite: cite("ab-pipa-reg", "s. 19.1(1)(a), (2)")
  },
  recordKeeping: {
    required: false,
    text:
      "PIPA has no separate breach-record duty like PIPEDA's or Quebec's. Keeping a record is still good practice: it shows how you assessed the risk if the Commissioner asks.",
    cite: cite("ab-pipa", "ss. 34.1, 37.1 (no record-keeping provision)")
  },
  howToReport: {
    text: "Notify the Commissioner in writing. The OIPC asks organizations to use its PIPA Privacy Breach Notification Form and prefers it by email to breachnotice@oipc.ab.ca.",
    cite: cite("ab-pipa-reg", "s. 19; OIPC Alberta notification guidance, \"Submitting to the Commissioner\""),
    url: "https://oipc.ab.ca/breach-notification/"
  },
  serviceProviders: {
    text: "The duty rests on the organization having the personal information under its control, which includes information a service provider handles for it.",
    cite: cite("ab-pipa", "s. 34.1(1)")
  },
  notes: [
    {
      text:
        "PIPA's trigger covers loss, unauthorized access and unauthorized disclosure. The OIPC treats employee \"snooping\" (unauthorized access by an authorized user) as a privacy breach.",
      cite: cite("oipc-ab-guidance", "\"What is a Privacy Breach?\"")
    }
  ]
};
