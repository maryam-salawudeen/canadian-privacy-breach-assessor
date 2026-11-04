import { describe, expect, it } from "vitest";
import { addMonths, assess, overallVerdict, VERDICT_MATRIX } from "../src/engine/assess";
import type { AssessmentInput, LawResult, Probability } from "../src/engine/types";
import type { Sensitivity } from "../src/rules/dataCategories";
import { CALM, make } from "./helpers";

const law = (input: AssessmentInput, id: LawResult["law"]) => assess(input).laws.find((l) => l.law === id)!;
const allText = (input: AssessmentInput) => {
  const r = assess(input);
  return [...r.laws.flatMap((l) => [...l.applicabilityReasons, ...l.verdictReasons].map((x) => x.text)), ...r.outOfScope.map((x) => x.text)].join(" ");
};

describe("clear-cut cases", () => {
  it("ransomware with stolen SINs at an Ontario retailer must be reported under PIPEDA only", () => {
    const input = make({
      org: { type: "private", province: "ON" },
      scope: { residentProvinces: ["ON"], crossBorder: "no" },
      incident: { kinds: ["unauthorized-access"] },
      data: { categories: ["name", "government-id", "financial"] },
      misuse: { ...CALM, recipient: "known-threat", maliciousIntent: "yes" }
    });
    const r = assess(input);
    expect(r.risk.sensitivity).toBe("high");
    expect(r.risk.probability).toBe("high");
    expect(law(input, "pipeda").applicability).toBe("applies");
    expect(law(input, "pipeda").verdict).toBe("report");
    expect(law(input, "quebec").applicability).toBe("not-applicable");
    expect(law(input, "alberta").applicability).toBe("not-applicable");
    const obligations = law(input, "pipeda").obligations;
    expect(obligations.find((o) => o.id === "report-regulator")?.required).toBe(true);
    expect(obligations.find((o) => o.id === "notify-individuals")?.required).toBe(true);
    expect(obligations.find((o) => o.id === "notify-others")).toBeDefined();
  });

  it("names emailed to a known partner who confirmed deletion: reporting not indicated, but the record is still required", () => {
    const input = make({
      org: { province: "ON" },
      scope: { residentProvinces: ["ON"], crossBorder: "no" },
      incident: { kinds: ["unauthorized-disclosure"], determined: "2026-03-10" },
      data: { categories: ["name"] },
      misuse: { ...CALM, recipientConfirmedDeletion: "yes" }
    });
    const p = law(input, "pipeda");
    expect(assess(input).risk.probability).toBe("negligible");
    expect(p.verdict).toBe("not-indicated");
    expect(p.obligations.map((o) => o.id)).toEqual(["keep-record"]);
    expect(p.obligations[0].required).toBe(true);
    expect(p.retentionUntil).toBe("2028-03-10");
  });

  it("a lost laptop with strong encryption and a safe key is not reportable even with health information", () => {
    const input = make({
      org: { province: "ON" },
      scope: { residentProvinces: ["ON"], crossBorder: "no" },
      incident: { kinds: ["loss"] },
      data: { categories: ["health", "name"] },
      misuse: { ...CALM, recipient: "nobody-known", encryption: "strong" }
    });
    expect(assess(input).risk.probability).toBe("negligible");
    expect(law(input, "pipeda").verdict).toBe("not-indicated");
  });

  it("health records posted publicly must be reported", () => {
    const input = make({
      org: { province: "MB" },
      data: { categories: ["health"] },
      misuse: { ...CALM, recipient: "many", publiclyPosted: "yes" }
    });
    expect(law(input, "pipeda").verdict).toBe("report");
  });
});

describe("borderline cases lean towards reporting", () => {
  it("health information misdirected to a known recipient who has not confirmed deletion is borderline", () => {
    const input = make({
      org: { province: "ON" },
      incident: { kinds: ["unauthorized-disclosure"] },
      data: { categories: ["health"] },
      misuse: { ...CALM }
    });
    expect(assess(input).risk.probability).toBe("low");
    expect(law(input, "pipeda").verdict).toBe("lean-report");
    const report = law(input, "pipeda").obligations.find((o) => o.id === "report-regulator")!;
    expect(report.required).toBe(false);
    expect(report.title).toMatch(/^Recommended/);
  });

  it("a blank assessment never comes out as not-indicated", () => {
    const input = make({ org: { province: "ON" }, data: { categories: ["name"] } });
    expect(law(input, "pipeda").verdict).toBe("lean-report");
    expect(assess(input).risk.unknowns.length).toBeGreaterThanOrEqual(3);
  });

  it("answering the unknowns benignly lets a low-risk case fall to not-indicated", () => {
    const input = make({ org: { province: "ON" }, data: { categories: ["name"] }, misuse: { ...CALM } });
    expect(law(input, "pipeda").verdict).toBe("not-indicated");
  });

  it("unknown malicious intent raises the likelihood of misuse", () => {
    const input = make({ org: { province: "ON" }, data: { categories: ["financial"] }, misuse: { ...CALM, maliciousIntent: "unknown" } });
    expect(assess(input).risk.probability).toBe("moderate");
    expect(law(input, "pipeda").verdict).toBe("report");
  });

  it("a strong encryption claim does not override evidence of misuse", () => {
    const input = make({ org: { province: "ON" }, data: { categories: ["financial"] }, misuse: { ...CALM, encryption: "strong", misuseEvidence: "yes" } });
    expect(assess(input).risk.probability).toBe("high");
    expect(law(input, "pipeda").verdict).toBe("report");
  });

  it("three or more kinds of information together raise the likelihood of misuse", () => {
    const input = make({ org: { province: "ON" }, data: { categories: ["name", "contact", "date-of-birth"] }, misuse: { ...CALM } });
    expect(assess(input).risk.probability).toBe("moderate");
    expect(law(input, "pipeda").verdict).toBe("lean-report");
  });

  it("context and vulnerable people raise sensitivity", () => {
    const input = make({ org: { province: "ON" }, data: { categories: ["name"], contextRaisesSensitivity: true }, misuse: { ...CALM, vulnerablePeople: "yes" } });
    expect(assess(input).risk.sensitivity).toBe("high");
  });

  it("an ex-spouse receiving the information is treated as a high likelihood of misuse", () => {
    const input = make({ org: { province: "ON" }, data: { categories: ["contact"] }, misuse: { ...CALM, recipient: "relationship" } });
    expect(assess(input).risk.probability).toBe("high");
    expect(law(input, "pipeda").verdict).toBe("lean-report");
    expect(assess(input).risk.foreseeableHarms).toContain("humiliation");
  });

  it("employee snooping described only as unauthorized use is borderline under PIPEDA but reportable under Quebec", () => {
    const input = make({
      org: { type: "private", province: "QC" },
      scope: { residentProvinces: ["QC", "ON"], crossBorder: "yes" },
      incident: { kinds: ["unauthorized-use"] },
      data: { categories: ["health"] },
      misuse: { ...CALM, recipient: "internal" }
    });
    expect(law(input, "pipeda").verdict).toBe("lean-report");
    expect(law(input, "quebec").verdict).toBe("report");
  });

  it("never describes a breach as safe", () => {
    const inputs = [
      make({ data: { categories: ["name"] }, misuse: { ...CALM, recipientConfirmedDeletion: "yes" } }),
      make({ data: { categories: ["health"] }, misuse: { ...CALM, encryption: "strong" } }),
      make({ org: { province: "QC" }, data: { categories: ["contact"] }, misuse: { ...CALM } })
    ];
    for (const i of inputs) expect(allText(i)).not.toMatch(/\bsafe\b/i);
    const ni = law(inputs[0], "pipeda");
    expect(ni.verdictReasons.map((r) => r.text).join(" ")).toMatch(/not a finding that the breach is harmless/);
  });
});

describe("the verdict matrix", () => {
  const probs: Probability[] = ["negligible", "low", "moderate", "high"];
  const sens: Sensitivity[] = ["low", "moderate", "high"];
  const rank = { "not-indicated": 0, "lean-report": 1, report: 2 } as const;

  it("never gets less cautious as sensitivity or likelihood rises", () => {
    for (let p = 0; p < probs.length; p++)
      for (let s = 0; s < sens.length; s++) {
        const here = rank[VERDICT_MATRIX[probs[p]][sens[s]]];
        if (p + 1 < probs.length) expect(rank[VERDICT_MATRIX[probs[p + 1]][sens[s]]]).toBeGreaterThanOrEqual(here);
        if (s + 1 < sens.length) expect(rank[VERDICT_MATRIX[probs[p]][sens[s + 1]]]).toBeGreaterThanOrEqual(here);
      }
  });

  it("always says report when sensitivity and likelihood are both high", () => {
    expect(VERDICT_MATRIX.high.high).toBe("report");
  });
});

describe("multi-jurisdiction cases", () => {
  const hack = { ...CALM, recipient: "known-threat", maliciousIntent: "yes" } as const;

  it("a Quebec retailer with customers in Quebec, Alberta and Ontario is assessed under all three laws", () => {
    const input = make({
      org: { type: "private", province: "QC" },
      scope: { residentProvinces: ["QC", "AB", "ON"], crossBorder: "yes" },
      incident: { kinds: ["unauthorized-access"], becameAware: "2026-01-15", determined: "2026-01-20" },
      data: { categories: ["name", "financial"] },
      misuse: hack
    });
    const r = assess(input);
    expect(r.laws.map((l) => [l.law, l.applicability, l.verdict])).toEqual([
      ["pipeda", "applies", "report"],
      ["quebec", "applies", "report"],
      ["alberta", "applies", "report"]
    ]);
    expect(law(input, "pipeda").retentionUntil).toBe("2028-01-20");
    expect(law(input, "quebec").retentionUntil).toBe("2031-01-15");
    expect(law(input, "alberta").retentionUntil).toBeUndefined();
    expect(law(input, "quebec").obligations[0].id).toBe("consult-privacy-officer");
    expect(overallVerdict(r)).toBe("report");
  });

  it("a Quebec business with only Quebec customers and no cross-border flow is under Quebec law only", () => {
    const input = make({ org: { province: "QC" }, scope: { residentProvinces: ["QC"], crossBorder: "no" }, data: { categories: ["financial"] }, misuse: hack });
    expect(law(input, "pipeda").applicability).toBe("not-applicable");
    expect(law(input, "quebec").applicability).toBe("applies");
    expect(law(input, "alberta").applicability).toBe("not-applicable");
  });

  it("an Alberta business with residents elsewhere and an unknown data flow flags PIPEDA as possibly applying", () => {
    const input = make({ org: { province: "AB" }, scope: { residentProvinces: ["AB", "SK"], crossBorder: "unknown" }, data: { categories: ["financial"] }, misuse: hack });
    expect(law(input, "pipeda").applicability).toBe("may-apply");
    expect(law(input, "pipeda").verdict).toBe("report");
    expect(law(input, "alberta").applicability).toBe("applies");
  });

  it("an Ontario business with Alberta and Quebec customers: Alberta applies, Quebec may apply", () => {
    const input = make({ org: { province: "ON" }, scope: { residentProvinces: ["ON", "AB", "QC"] }, data: { categories: ["financial"] }, misuse: hack });
    expect(law(input, "pipeda").applicability).toBe("applies");
    expect(law(input, "alberta").applicability).toBe("applies");
    expect(law(input, "quebec").applicability).toBe("may-apply");
  });

  it("Alberta PIPA never makes notifying individuals mandatory on its own", () => {
    const input = make({ org: { province: "AB" }, scope: { residentProvinces: ["AB"], crossBorder: "no" }, data: { categories: ["financial"] }, misuse: hack });
    const ab = law(input, "alberta");
    expect(ab.verdict).toBe("report");
    expect(ab.obligations.find((o) => o.id === "report-regulator")?.required).toBe(true);
    expect(ab.obligations.find((o) => o.id === "notify-individuals")?.required).toBe(false);
    expect(ab.obligations.find((o) => o.id === "keep-record")?.required).toBe(false);
  });

  it("an Alberta non-profit with no commercial activity: PIPEDA out, Alberta possibly in", () => {
    const input = make({ org: { type: "nonprofit", province: "AB", commercialActivity: false }, scope: { residentProvinces: ["AB"] }, data: { categories: ["health"] }, misuse: hack });
    expect(law(input, "pipeda").applicability).toBe("not-applicable");
    expect(law(input, "alberta").applicability).toBe("may-apply");
    expect(law(input, "alberta").verdict).toBe("report");
  });

  it("a non-profit selling its donor list is commercial for PIPEDA", () => {
    const input = make({ org: { type: "nonprofit", province: "NS", commercialActivity: true }, scope: { residentProvinces: ["NS"] }, data: { categories: ["financial"] }, misuse: hack });
    expect(law(input, "pipeda").applicability).toBe("applies");
  });

  it("a bank in Quebec is always under PIPEDA, and possibly under Quebec law", () => {
    const input = make({ org: { type: "federal", province: "QC" }, scope: { residentProvinces: ["QC", "AB"], employeeInfo: true }, data: { categories: ["financial"] }, misuse: hack });
    expect(law(input, "pipeda").applicability).toBe("applies");
    expect(law(input, "quebec").applicability).toBe("may-apply");
    expect(law(input, "alberta").applicability).toBe("not-applicable");
  });

  it("a Quebec municipality is assessed under the public-sector provisions of Law 25", () => {
    const input = make({ org: { type: "public", province: "QC" }, scope: { residentProvinces: ["QC"] }, data: { categories: ["government-id"] }, misuse: hack });
    const qc = law(input, "quebec");
    expect(qc.applicability).toBe("applies");
    expect(qc.name).toBe("Quebec Law 25 (public bodies)");
    expect(qc.obligations.find((o) => o.id === "report-regulator")?.cite.source).toBe("qc-public");
    expect(law(input, "pipeda").applicability).toBe("not-applicable");
    expect(law(input, "alberta").applicability).toBe("not-applicable");
  });

  it("an Ontario municipality gets no verdict and a pointer to its own law", () => {
    const input = make({ org: { type: "public", province: "ON" }, scope: { residentProvinces: ["ON"] }, data: { categories: ["name"] } });
    const r = assess(input);
    expect(r.laws.every((l) => l.applicability === "not-applicable")).toBe(true);
    expect(overallVerdict(r)).toBeUndefined();
    expect(r.outOfScope.map((n) => n.text).join(" ")).toMatch(/public-sector privacy law/);
  });

  it("employee information at an Ontario business is outside PIPEDA and flagged", () => {
    const input = make({ org: { province: "ON" }, scope: { residentProvinces: ["ON"], employeeInfo: true }, data: { categories: ["employment"] } });
    expect(law(input, "pipeda").applicability).toBe("not-applicable");
    expect(assess(input).outOfScope.map((n) => n.text).join(" ")).toMatch(/employee information/);
  });

  it("employee information at an Alberta business is covered by Alberta PIPA", () => {
    const input = make({ org: { province: "AB" }, scope: { residentProvinces: ["AB"], employeeInfo: true, crossBorder: "no" }, data: { categories: ["employment"] } });
    expect(law(input, "pipeda").applicability).toBe("not-applicable");
    expect(law(input, "alberta").applicability).toBe("applies");
  });

  it("flags BC, health custodians, foreign residents and service providers", () => {
    const input = make({
      org: { province: "BC", inControl: false },
      scope: { residentProvinces: ["BC"], outsideCanada: true },
      data: { categories: ["health"] }
    });
    const notes = assess(input).outOfScope.map((n) => n.text).join(" ");
    expect(notes).toMatch(/British Columbia's Personal Information Protection Act/);
    expect(notes).toMatch(/health information custodian/);
    expect(notes).toMatch(/outside Canada/);
    expect(notes).toMatch(/hold this information for a client/);
    expect(law(input, "pipeda").applicability).toBe("applies");
  });
});

describe("record retention dates", () => {
  it("adds months and clamps to the end of shorter months", () => {
    expect(addMonths("2024-02-29", 24)).toBe("2026-02-28");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-11-04", 60)).toBe("2031-11-04");
    expect(addMonths("", 24)).toBeUndefined();
  });

  it("PIPEDA counts from the determination date, falling back to the awareness date", () => {
    const input = make({ org: { province: "ON" }, incident: { becameAware: "2026-05-01" }, data: { categories: ["name"] } });
    expect(law(input, "pipeda").retentionUntil).toBe("2028-05-01");
  });
});
