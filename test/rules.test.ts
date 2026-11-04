import { describe, expect, it } from "vitest";
import { ALBERTA } from "../src/rules/alberta";
import { DATA_CATEGORIES } from "../src/rules/dataCategories";
import { PIPEDA } from "../src/rules/pipeda";
import { QUEBEC_PRIVATE, QUEBEC_PUBLIC } from "../src/rules/quebec";
import { SCOPE } from "../src/rules/scope";
import { SOURCES, type Cite } from "../src/rules/sources";
import type { LawRules } from "../src/rules/types";

const LAWS: LawRules[] = [PIPEDA, QUEBEC_PRIVATE, QUEBEC_PUBLIC, ALBERTA];

function citesIn(value: unknown, out: Cite[] = []): Cite[] {
  if (Array.isArray(value)) value.forEach((v) => citesIn(v, out));
  else if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (typeof o.source === "string" && typeof o.pinpoint === "string") out.push(o as unknown as Cite);
    else Object.values(o).forEach((v) => citesIn(v, out));
  }
  return out;
}

describe("rules data", () => {
  it("every rule cites a known official source with a pinpoint", () => {
    const cites = [...citesIn(LAWS), ...citesIn(SCOPE), ...citesIn(DATA_CATEGORIES)];
    expect(cites.length).toBeGreaterThan(80);
    for (const c of cites) {
      expect(SOURCES[c.source], c.source).toBeDefined();
      expect(c.pinpoint.trim().length).toBeGreaterThan(0);
    }
  });

  it("every source is an official government or regulator page over HTTPS", () => {
    for (const s of Object.values(SOURCES)) {
      expect(s.url).toMatch(/^https:\/\/(laws-lois\.justice\.gc\.ca|www\.priv\.gc\.ca|www\.legisquebec\.gouv\.qc\.ca|www\.cai\.gouv\.qc\.ca|kings-printer\.alberta\.ca|oipc\.ab\.ca)\//);
      expect(s.verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("PIPEDA notices list exactly the items in SOR/2018-64 ss. 2(1) and 3", () => {
    expect(PIPEDA.regulatorNoticeFields.map((f) => f.cite.pinpoint)).toEqual(["a", "b", "c", "d", "e", "f", "g"].map((p) => `s. 2(1)(${p})`));
    expect(PIPEDA.individualNoticeFields.map((f) => f.cite.pinpoint)).toEqual(["a", "b", "c", "d", "e", "f"].map((p) => `s. 3(${p})`));
    expect(PIPEDA.recordKeeping.retentionMonths).toBe(24);
  });

  it("Quebec notices list exactly the items in the regulation ss. 3 and 5", () => {
    expect(QUEBEC_PRIVATE.regulatorNoticeFields.map((f) => f.cite.pinpoint)).toEqual(Array.from({ length: 11 }, (_, n) => `s. 3(${n + 1})`));
    expect(QUEBEC_PRIVATE.individualNoticeFields.map((f) => f.cite.pinpoint)).toEqual(Array.from({ length: 6 }, (_, n) => `s. 5(${n + 1})`));
    expect(QUEBEC_PRIVATE.recordKeeping.retentionMonths).toBe(60);
  });

  it("Alberta notices list exactly the items in the PIPA Regulation ss. 19 and 19.1", () => {
    expect(ALBERTA.regulatorNoticeFields.map((f) => f.cite.pinpoint)).toEqual(["a", "b", "c", "d", "e", "f", "g", "h"].map((p) => `s. 19(${p})`));
    expect(ALBERTA.individualNoticeFields.map((f) => f.cite.pinpoint)).toEqual(["i", "ii", "iii", "iv", "v"].map((p) => `s. 19.1(1)(b)(${p})`));
    expect(ALBERTA.individualNotice.mandatory).toBe(false);
    expect(ALBERTA.recordKeeping.required).toBe(false);
  });

  it("Quebec's public-sector variant cites the Access Act sections", () => {
    expect(QUEBEC_PUBLIC.reportingDuty.cite).toEqual({ source: "qc-public", pinpoint: "s. 63.8, paras. 1–2" });
    expect(QUEBEC_PRIVATE.reportingDuty.cite).toEqual({ source: "qc-private", pinpoint: "s. 3.5, paras. 1–2" });
  });

  it("each law's incident definition matches its text", () => {
    expect(PIPEDA.incidentDefinition.covers).not.toContain("unauthorized-use");
    expect(ALBERTA.incidentDefinition.covers).not.toContain("unauthorized-use");
    expect(QUEBEC_PRIVATE.incidentDefinition.covers).toContain("unauthorized-use");
  });
});
