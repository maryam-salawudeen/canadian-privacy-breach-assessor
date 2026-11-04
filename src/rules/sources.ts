/**
 * Official sources every rule in this app is drawn from.
 *
 * Each rule elsewhere in src/rules points at one of these by `source` plus a
 * `pinpoint` (section, paragraph or heading). To check a rule, open the URL
 * and find the pinpoint. `verified` is the date a maintainer last compared the
 * rule text in this repo with the official text. See CONTRIBUTING.md.
 */

export type SourceId =
  | "pipeda"
  | "pipeda-regs"
  | "opc-guidance"
  | "opc-rrosh-tool"
  | "opc-report"
  | "opc-pipeda-brief"
  | "qc-private"
  | "qc-public"
  | "qc-incidents-reg"
  | "cai-incidents"
  | "cai-form"
  | "ab-pipa"
  | "ab-pipa-reg"
  | "oipc-ab-breach"
  | "oipc-ab-guidance";

export interface Source {
  id: SourceId;
  title: string;
  /** Short form used in inline citations. */
  short: string;
  publisher: string;
  url: string;
  /** Consolidation or page date as shown by the publisher when last verified. */
  currency: string;
  verified: string;
}

export const SOURCES: Record<SourceId, Source> = {
  pipeda: {
    id: "pipeda",
    title: "Personal Information Protection and Electronic Documents Act (S.C. 2000, c. 5)",
    short: "PIPEDA",
    publisher: "Justice Laws Website, Government of Canada",
    url: "https://laws-lois.justice.gc.ca/eng/acts/P-8.6/FullText.html",
    currency: "Consolidated text as published on Justice Laws",
    verified: "2026-11-04"
  },
  "pipeda-regs": {
    id: "pipeda-regs",
    title: "Breach of Security Safeguards Regulations (SOR/2018-64)",
    short: "SOR/2018-64",
    publisher: "Justice Laws Website, Government of Canada",
    url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-64/FullText.html",
    currency: "Page modified 2026-11-02",
    verified: "2026-11-04"
  },
  "opc-guidance": {
    id: "opc-guidance",
    title: "What you need to know about mandatory reporting of breaches of security safeguards",
    short: "OPC breach guidance",
    publisher: "Office of the Privacy Commissioner of Canada",
    url: "https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/privacy-breaches-at-your-business/gd_pb_201810/",
    currency: "Page modified 2025-08-11",
    verified: "2026-11-04"
  },
  "opc-rrosh-tool": {
    id: "opc-rrosh-tool",
    title: "Assess if a privacy breach poses a real risk of significant harm to an individual (OPC RROSH tool)",
    short: "OPC RROSH tool",
    publisher: "Office of the Privacy Commissioner of Canada",
    url: "https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/privacy-breaches-at-your-business/rrosh-tool/",
    currency: "Live page",
    verified: "2026-11-04"
  },
  "opc-report": {
    id: "opc-report",
    title: "Report a privacy breach at your business",
    short: "OPC breach report page",
    publisher: "Office of the Privacy Commissioner of Canada",
    url: "https://www.priv.gc.ca/en/report-a-concern/report-a-privacy-breach-at-your-organization/report-a-privacy-breach-at-your-business/",
    currency: "Live page",
    verified: "2026-11-04"
  },
  "opc-pipeda-brief": {
    id: "opc-pipeda-brief",
    title: "PIPEDA in brief",
    short: "OPC, PIPEDA in brief",
    publisher: "Office of the Privacy Commissioner of Canada",
    url: "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda_brief/",
    currency: "Live page",
    verified: "2026-11-04"
  },
  "qc-private": {
    id: "qc-private",
    title: "Act respecting the protection of personal information in the private sector (CQLR c. P-39.1), as amended by Law 25 (2021, c. 25)",
    short: "Quebec private-sector Act (P-39.1)",
    publisher: "LégisQuébec, Government of Quebec",
    url: "https://www.legisquebec.gouv.qc.ca/en/document/cs/P-39.1",
    currency: "Consolidated text as published on LégisQuébec",
    verified: "2026-11-04"
  },
  "qc-public": {
    id: "qc-public",
    title: "Act respecting Access to documents held by public bodies and the Protection of personal information (CQLR c. A-2.1)",
    short: "Quebec Access Act (A-2.1)",
    publisher: "LégisQuébec, Government of Quebec",
    url: "https://www.legisquebec.gouv.qc.ca/en/document/cs/A-2.1",
    currency: "Consolidated text as published on LégisQuébec",
    verified: "2026-11-04"
  },
  "qc-incidents-reg": {
    id: "qc-incidents-reg",
    title: "Regulation respecting confidentiality incidents (CQLR c. A-2.1, r. 3.1)",
    short: "Quebec incidents regulation",
    publisher: "LégisQuébec, Government of Quebec",
    url: "https://www.legisquebec.gouv.qc.ca/en/document/cr/A-2.1,%20r.%203.1",
    currency: "O.C. 1761-2022, in force 2022-09-22 (reg. s. 9)",
    verified: "2026-11-04"
  },
  "cai-incidents": {
    id: "cai-incidents",
    title: "Incidents de confidentialité et mesures de sécurité (entreprises privées)",
    short: "CAI incident guidance",
    publisher: "Commission d'accès à l'information du Québec",
    url: "https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/incidents-confidentialite-mesures-securite-entreprises",
    currency: "Live page",
    verified: "2026-11-04"
  },
  "cai-form": {
    id: "cai-form",
    title: "Formulaire : Déclaration d'un incident de confidentialité",
    short: "CAI incident form",
    publisher: "Commission d'accès à l'information du Québec",
    url: "https://www.cai.gouv.qc.ca/uploads/pdfs/CAI_FO_Incident_Conf.pdf",
    currency: "Version dated October 2024",
    verified: "2026-11-04"
  },
  "ab-pipa": {
    id: "ab-pipa",
    title: "Personal Information Protection Act (Alberta), SA 2003, c. P-6.5",
    short: "Alberta PIPA",
    publisher: "Alberta King's Printer",
    url: "https://kings-printer.alberta.ca/documents/Acts/P06P5.pdf",
    currency: "Office consolidation current as of 2025-09-01",
    verified: "2026-11-04"
  },
  "ab-pipa-reg": {
    id: "ab-pipa-reg",
    title: "Personal Information Protection Act Regulation, Alta Reg 366/2003",
    short: "Alberta PIPA Regulation",
    publisher: "Alberta King's Printer",
    url: "https://kings-printer.alberta.ca/documents/Regs/2003_366.pdf",
    currency: "Office consolidation current as of 2026-06-25",
    verified: "2026-11-04"
  },
  "oipc-ab-breach": {
    id: "oipc-ab-breach",
    title: "Breach Notification Requirements",
    short: "OIPC Alberta breach page",
    publisher: "Office of the Information and Privacy Commissioner of Alberta",
    url: "https://oipc.ab.ca/breach-notification/",
    currency: "Live page",
    verified: "2026-11-04"
  },
  "oipc-ab-guidance": {
    id: "oipc-ab-guidance",
    title: "Guidance for Notifying the OIPC about a Privacy Breach Under PIPA (April 2024)",
    short: "OIPC Alberta notification guidance",
    publisher: "Office of the Information and Privacy Commissioner of Alberta",
    url: "https://oipc.ab.ca/wp-content/uploads/2024/04/Guidance-for-Notifying-the-OIPC-about-a-Privacy-Breach-Under-PIPA-April-2024.pdf",
    currency: "April 2024",
    verified: "2026-11-04"
  }
};

/** A pointer from a rule to the exact place in an official source. */
export interface Cite {
  source: SourceId;
  pinpoint: string;
}

export const cite = (source: SourceId, pinpoint: string): Cite => ({ source, pinpoint });

export function formatCite(c: Cite): string {
  return `${SOURCES[c.source].short}, ${c.pinpoint}`;
}
