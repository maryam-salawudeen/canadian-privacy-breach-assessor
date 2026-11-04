import { cite } from "./sources";
import type { Rule } from "./types";

/**
 * Rules for which law applies to which organisation. The engine in
 * src/engine/jurisdiction.ts combines these with the user's answers.
 */
export const SCOPE = {
  pipedaCommercial: {
    text: "PIPEDA applies to personal information an organization collects, uses or discloses in the course of commercial activities.",
    cite: cite("pipeda", "s. 4(1)(a)")
  },
  pipedaEmployees: {
    text: "PIPEDA covers information about employees and job applicants only for federal works, undertakings or businesses (such as banks, airlines, telecoms and interprovincial transport).",
    cite: cite("pipeda", "s. 4(1)(b)")
  },
  pipedaFederal: {
    text: "Federally regulated organizations that conduct business in Canada are always subject to PIPEDA.",
    cite: cite("opc-pipeda-brief", "\"Federally regulated organizations\"")
  },
  pipedaSubstantiallySimilar: {
    text:
      "Alberta, British Columbia and Quebec have private-sector privacy laws deemed substantially similar to PIPEDA. Organizations subject to them are generally exempt from PIPEDA for information handled within that province.",
    cite: cite("opc-pipeda-brief", "\"Provincial privacy laws\"")
  },
  pipedaCrossBorder: {
    text:
      "Businesses handling personal information that crosses provincial or national borders in the course of commercial activities are subject to PIPEDA, wherever they are based, including in Alberta, British Columbia and Quebec.",
    cite: cite("opc-pipeda-brief", "\"Information that crosses borders\"")
  },
  pipedaNonCommercial: {
    text: "PIPEDA does not generally cover the non-commercial activities of non-profits. Selling, bartering or leasing donor, membership or fundraising lists is commercial activity.",
    cite: cite("opc-pipeda-brief", "\"Does the Act apply to your business?\"")
  },
  pipedaPublic: {
    text:
      "PIPEDA applies only to commercial activities and to federal works, undertakings or businesses, and not to federal government institutions under the Privacy Act. Public bodies such as municipalities are generally governed by provincial public-sector privacy laws instead.",
    cite: cite("pipeda", "s. 4(1)–(2)")
  },
  quebecEnterprise: {
    text:
      "Quebec's private-sector Act applies to personal information a person collects, holds, uses or communicates in the course of carrying on an enterprise within the meaning of article 1525 of the Civil Code of Québec (an organized economic activity, whether or not commercial).",
    cite: cite("qc-private", "s. 1")
  },
  quebecPublic: {
    text: "Quebec public bodies, including municipalities, have the same confidentiality-incident duties under the Access Act and the same regulation.",
    cite: cite("qc-public", "ss. 63.8–63.11")
  },
  quebecFederal: {
    text: "Federally regulated organizations are always subject to PIPEDA. Whether Quebec's Act also applies to them is not settled; this tool treats it as possibly applying so that nothing is missed.",
    cite: cite("opc-pipeda-brief", "\"Federally regulated organizations\"")
  },
  albertaNonProfit: {
    text:
      "Alberta PIPA applies to a non-profit organization (one incorporated under the Societies Act or Agricultural Societies Act, or registered under Part 9 of the Companies Act) only for information handled in connection with a commercial activity. Other non-profits are fully covered.",
    cite: cite("ab-pipa", "s. 56")
  },
  albertaCollected: {
    text:
      "The OIPC Alberta considers information \"collected in Alberta\" if the individual was in Alberta when it was collected or the organization operates in Alberta. For example, a job application sent from Alberta to an organization in Ontario was collected in Alberta.",
    cite: cite("oipc-ab-guidance", "Section B, \"Was the information collected in Alberta?\"")
  },
  quebecOutOfProvince: {
    text:
      "Quebec's Act applies to enterprises handling information in the course of carrying on an enterprise. For an organization based outside Quebec, whether that includes its Quebec residents' information depends on whether it carries on its enterprise in Quebec. This tool flags it as possibly applying.",
    cite: cite("qc-private", "s. 1")
  }
} satisfies Record<string, Rule>;
