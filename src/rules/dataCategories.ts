import { cite, type Cite } from "./sources";

/**
 * Kinds of personal information a breach can involve, with the sensitivity
 * this tool starts from.
 *
 * None of the three laws lists sensitivity levels. The defaults below follow
 * the categories the regulators name as generally sensitive (cited on each
 * entry). Everything else starts lower, and the assessor can raise it when the
 * context makes the information more sensitive, which the OPC and Quebec both
 * say can happen. When in doubt, a category is set higher, not lower.
 */

export type Sensitivity = "low" | "moderate" | "high";

export type DataCategoryId =
  | "government-id"
  | "financial"
  | "credentials"
  | "health"
  | "biometric"
  | "special-category"
  | "criminal-legal"
  | "children"
  | "employment"
  | "date-of-birth"
  | "location"
  | "contact"
  | "name"
  | "other";

export interface DataCategory {
  id: DataCategoryId;
  label: string;
  examples: string;
  sensitivity: Sensitivity;
  why: string;
  cites: Cite[];
}

const OPC_SENSITIVITY = cite("opc-guidance", "Part 6, \"Sensitivity\" (citing PIPEDA Sch. 1, Principle 4.3.4)");
const QC_SENSITIVE = cite("qc-private", "s. 12, para. 4(2) (definition of sensitive information)");
const AB_FACTORS = cite("oipc-ab-guidance", "Section C, \"Real Risk of Significant Harm\" factors");

export const DATA_CATEGORIES: DataCategory[] = [
  {
    id: "government-id",
    label: "Government identifiers",
    examples: "Social Insurance Number, driver's licence, passport, health card number",
    sensitivity: "high",
    why: "Can be used for identity theft or fraud, which the OIPC Alberta lists as a factor and PIPEDA lists as significant harm.",
    cites: [cite("pipeda", "s. 10.1(7) (identity theft)"), AB_FACTORS]
  },
  {
    id: "financial",
    label: "Financial information",
    examples: "Bank account or payment card numbers, income, credit reports",
    sensitivity: "high",
    why: "The OPC says financial information and income records are almost always sensitive.",
    cites: [OPC_SENSITIVITY]
  },
  {
    id: "credentials",
    label: "Account credentials",
    examples: "Usernames with passwords, security questions, PINs, access tokens",
    sensitivity: "high",
    why: "Credentials give direct access to accounts and the information in them, enabling fraud or further breaches.",
    cites: [AB_FACTORS, cite("pipeda", "s. 10.1(7) (financial loss, identity theft)")]
  },
  {
    id: "health",
    label: "Health information",
    examples: "Medical records, diagnoses, prescriptions, disability, genetic data",
    sensitivity: "high",
    why: "The OPC names health and genetic data as generally sensitive; Quebec's Act names medical information as sensitive by nature.",
    cites: [OPC_SENSITIVITY, QC_SENSITIVE]
  },
  {
    id: "biometric",
    label: "Biometric information",
    examples: "Fingerprints, face or voice templates",
    sensitivity: "high",
    why: "The OPC names uniquely identifying biometric data as generally sensitive; Quebec's Act names biometric information as sensitive by nature.",
    cites: [OPC_SENSITIVITY, QC_SENSITIVE]
  },
  {
    id: "special-category",
    label: "Intimate or belief-related information",
    examples: "Ethnic or racial origin, political opinions, religious or philosophical beliefs, sex life or sexual orientation",
    sensitivity: "high",
    why: "The OPC names each of these as generally sensitive; Quebec's Act treats intimate information as sensitive.",
    cites: [OPC_SENSITIVITY, QC_SENSITIVE]
  },
  {
    id: "criminal-legal",
    label: "Criminal or legal matters",
    examples: "Criminal record checks, charges, legal proceedings, investigations",
    sensitivity: "high",
    why: "Exposure can cause humiliation, damage to reputation or relationships and loss of employment, all listed as significant harm. Set high by this tool as a cautious default.",
    cites: [cite("pipeda", "s. 10.1(7)")]
  },
  {
    id: "children",
    label: "Information about children or other vulnerable people",
    examples: "Student or youth program records, information about seniors in care",
    sensitivity: "high",
    why: "The OIPC Alberta asks whether vulnerable individuals such as youth or seniors are involved. Set high by this tool as a cautious default.",
    cites: [AB_FACTORS]
  },
  {
    id: "employment",
    label: "Employment or HR records",
    examples: "Performance reviews, discipline, salary, leave records",
    sensitivity: "moderate",
    why: "Can lead to humiliation, damaged relationships or lost opportunities depending on context. Salary also counts as income (see Financial).",
    cites: [cite("pipeda", "s. 10.1(7)"), OPC_SENSITIVITY]
  },
  {
    id: "date-of-birth",
    label: "Date of birth",
    examples: "Full date of birth",
    sensitivity: "moderate",
    why: "Combined with a name and address it is a common building block for identity theft.",
    cites: [cite("opc-guidance", "Part 6, \"Probability of Misuse\" (number of pieces of information breached)")]
  },
  {
    id: "location",
    label: "Precise location",
    examples: "GPS history, home location of a person at risk",
    sensitivity: "moderate",
    why: "Can create a risk of bodily harm in some contexts (for example, someone fleeing violence). Raise to high in that case.",
    cites: [cite("pipeda", "s. 10.1(7) (bodily harm)")]
  },
  {
    id: "contact",
    label: "Personal contact details",
    examples: "Home address, personal email, phone number",
    sensitivity: "low",
    why: "Generally less sensitive on its own, but the OPC notes that any information can be sensitive in context, and contact details enable phishing.",
    cites: [OPC_SENSITIVITY]
  },
  {
    id: "name",
    label: "Name only",
    examples: "First and last name",
    sensitivity: "low",
    why: "Generally not sensitive alone. Context can change that (for example, a name on a list of clients of a sensitive service).",
    cites: [OPC_SENSITIVITY]
  },
  {
    id: "other",
    label: "Other information",
    examples: "Anything not listed: describe it in the notes",
    sensitivity: "moderate",
    why: "Unknown kinds of information are treated as moderately sensitive so that the assessment does not understate the risk.",
    cites: [OPC_SENSITIVITY]
  }
];

export const CATEGORY_BY_ID: Record<DataCategoryId, DataCategory> = Object.fromEntries(
  DATA_CATEGORIES.map((c) => [c.id, c])
) as Record<DataCategoryId, DataCategory>;
