import { cite } from "./sources";
import type { LawRules } from "./types";

/**
 * PIPEDA (federal) breach of security safeguards rules.
 * Act: ss. 2(1), 10.1–10.3. Regulations: SOR/2018-64 ss. 2–6.
 * Verified against the official text on 2026-11-04.
 */
export const PIPEDA: LawRules = {
  id: "pipeda",
  name: "Personal Information Protection and Electronic Documents Act (PIPEDA)",
  shortName: "PIPEDA",
  regulator: "Office of the Privacy Commissioner of Canada",
  regulatorShort: "OPC",
  threshold: "real risk of significant harm (RROSH)",
  incidentDefinition: {
    text:
      "A \"breach of security safeguards\" is the loss of, unauthorized access to or unauthorized disclosure of personal information resulting from a breach of the organization's security safeguards, or from a failure to establish them.",
    cite: cite("pipeda", "s. 2(1), definition of \"breach of security safeguards\""),
    covers: ["unauthorized-access", "unauthorized-disclosure", "loss"]
  },
  reportingDuty: {
    text:
      "An organization must report to the Commissioner any breach of security safeguards involving personal information under its control if it is reasonable in the circumstances to believe that the breach creates a real risk of significant harm to an individual.",
    cite: cite("pipeda", "s. 10.1(1)")
  },
  harmFactors: [
    { text: "The sensitivity of the personal information involved in the breach.", cite: cite("pipeda", "s. 10.1(8)(a)") },
    {
      text: "The probability that the personal information has been, is being or will be misused.",
      cite: cite("pipeda", "s. 10.1(8)(b)")
    },
    {
      text:
        "Probability questions the OPC suggests: who accessed or could have accessed the information, how long it was exposed, evidence of malicious intent (theft, hacking), how many pieces of information were breached, whether the recipient is a reputational risk (e.g. an ex-spouse or boss), whether known recipients committed to destroy it, whether harm has materialized, whether it was recovered, and whether it was adequately encrypted or anonymized.",
      cite: cite("opc-guidance", "Part 6, \"Probability of Misuse\"")
    }
  ],
  harmDefinition: {
    text:
      "Significant harm includes bodily harm, humiliation, damage to reputation or relationships, loss of employment, business or professional opportunities, financial loss, identity theft, negative effects on the credit record and damage to or loss of property.",
    cite: cite("pipeda", "s. 10.1(7)")
  },
  deadlineRegulator: {
    text: "As soon as feasible after the organization determines that the breach has occurred. The Act sets no fixed number of days.",
    cite: cite("pipeda", "s. 10.1(2)")
  },
  deadlineIndividuals: {
    text: "As soon as feasible after the organization determines that the breach has occurred.",
    cite: cite("pipeda", "s. 10.1(6)")
  },
  individualNotice: {
    mandatory: true,
    text:
      "Unless otherwise prohibited by law, the organization must notify each individual where it is reasonable to believe the breach creates a real risk of significant harm to them. The notice must be conspicuous and give enough information for the individual to understand the significance of the breach and take steps to reduce the risk of harm.",
    cite: cite("pipeda", "s. 10.1(3)–(5)")
  },
  regulatorNoticeFields: [
    { id: "circumstances", label: "A description of the circumstances of the breach and, if known, the cause", cite: cite("pipeda-regs", "s. 2(1)(a)") },
    { id: "occurred", label: "The day on which, or the period during which, the breach occurred or, if neither is known, the approximate period", cite: cite("pipeda-regs", "s. 2(1)(b)") },
    { id: "info-description", label: "A description of the personal information that is the subject of the breach, to the extent that the information is known", cite: cite("pipeda-regs", "s. 2(1)(c)") },
    { id: "affected-count", label: "The number of individuals affected by the breach or, if unknown, the approximate number", cite: cite("pipeda-regs", "s. 2(1)(d)") },
    { id: "steps-reduce-harm", label: "A description of the steps the organization has taken to reduce the risk of harm to affected individuals that could result from the breach or to mitigate that harm", cite: cite("pipeda-regs", "s. 2(1)(e)") },
    { id: "notify-plan", label: "A description of the steps the organization has taken or intends to take to notify affected individuals", cite: cite("pipeda-regs", "s. 2(1)(f)") },
    { id: "contact-person", label: "The name and contact information of a person who can answer, on behalf of the organization, the Commissioner's questions about the breach", cite: cite("pipeda-regs", "s. 2(1)(g)") }
  ],
  individualNoticeFields: [
    { id: "circumstances", label: "A description of the circumstances of the breach", cite: cite("pipeda-regs", "s. 3(a)") },
    { id: "occurred", label: "The day on which, or period during which, the breach occurred or, if neither is known, the approximate period", cite: cite("pipeda-regs", "s. 3(b)") },
    { id: "info-description", label: "A description of the personal information that is the subject of the breach, to the extent that the information is known", cite: cite("pipeda-regs", "s. 3(c)") },
    { id: "steps-reduce-harm", label: "A description of the steps the organization has taken to reduce the risk of harm that could result from the breach", cite: cite("pipeda-regs", "s. 3(d)") },
    { id: "individual-steps", label: "A description of the steps that affected individuals could take to reduce the risk of harm or to mitigate that harm", cite: cite("pipeda-regs", "s. 3(e)") },
    { id: "contact-for-individuals", label: "Contact information that the affected individual can use to obtain further information about the breach", cite: cite("pipeda-regs", "s. 3(f)") }
  ],
  indirectNotice: {
    text:
      "Notify directly (in person, by telephone, mail, email or another form a reasonable person would consider appropriate). Notify indirectly, by public communication or a similar measure that could reasonably be expected to reach the individuals, only if direct notice would likely cause further harm to the individual, would likely cause undue hardship for the organization, or the organization has no contact information.",
    cite: cite("pipeda-regs", "ss. 4–5")
  },
  recordKeeping: {
    required: true,
    retentionMonths: 24,
    retentionFrom: "determined",
    text:
      "Keep a record of every breach of security safeguards, including those that are not reported, for 24 months after the day the organization determines the breach occurred. The record must contain any information that lets the Commissioner verify compliance with the reporting and notification duties. The OPC expects at minimum: the date or estimated date, a general description of the circumstances, the nature of the information involved, and whether it was reported to the Commissioner and individuals were notified.",
    cite: cite("pipeda-regs", "s. 6; PIPEDA s. 10.3; OPC breach guidance, Part 3")
  },
  howToReport: {
    text: "Report in writing by any secure means of communication. The OPC provides a breach report form on its website, and new information can be sent after the first report.",
    cite: cite("pipeda-regs", "s. 2(2)–(3)"),
    url: "https://www.priv.gc.ca/en/report-a-concern/report-a-privacy-breach-at-your-organization/report-a-privacy-breach-at-your-business/"
  },
  serviceProviders: {
    text:
      "When a breach happens at a third-party processor, the OPC treats the organization that transferred the information to it as having control, and so as the one responsible for reporting, notifying and record-keeping. Control is assessed case by case.",
    cite: cite("opc-guidance", "Part 1 (meaning of \"control\")")
  },
  notes: [
    {
      text:
        "An organization that notifies individuals must also notify any other organization or government institution that may be able to reduce the risk of harm (for example, a bank or the police).",
      cite: cite("pipeda", "s. 10.2(1)")
    },
    {
      text: "The number of people affected does not decide the question: a breach affecting one person must be reported if it creates a real risk of significant harm.",
      cite: cite("opc-guidance", "Part 1, \"Do I need to report all breaches to the OPC?\"")
    }
  ]
};
