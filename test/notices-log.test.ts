import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { assess } from "../src/engine/assess";
import { createRecord, csvCell, keepUntil, parseBackup, toBackup, toCsv, CSV_COLUMNS, emptyStatus } from "../src/engine/log";
import { draftIndividualNotice, draftRegulatorNotice } from "../src/engine/notices";
import { ALBERTA } from "../src/rules/alberta";
import { PIPEDA } from "../src/rules/pipeda";
import { QUEBEC_PRIVATE } from "../src/rules/quebec";
import { listRecords, putRecord, restoreRecords, deleteRecord, setMeta, getMeta } from "../src/storage/db";
import { CALM, make } from "./helpers";

const full = make({
  org: {
    name: "Maple Outfitters Inc.",
    province: "QC",
    quebecBusinessNumber: "1234567890",
    contactName: "Dana Roy",
    contactTitle: "Privacy Officer",
    contactEmail: "privacy@example.ca",
    contactPhone: "1-800-555-0100",
    publicContact: "1-800-555-0100 or privacy@example.ca"
  },
  scope: { residentProvinces: ["QC", "AB", "ON"], crossBorder: "yes" },
  incident: {
    title: "Web store intrusion",
    kinds: ["unauthorized-access"],
    circumstances: "An attacker used a stolen admin password to export the customer table.",
    cause: "Credential stuffing against an account without two-step verification.",
    occurredFrom: "2026-01-10",
    occurredTo: "2026-01-12",
    becameAware: "2026-01-15",
    determined: "2026-01-16",
    affectedCount: 4200,
    affectedApprox: true,
    quebecResidentCount: 2500,
    otherRegulators: "The OPC and OIPC Alberta were notified on 2026-01-19."
  },
  data: { categories: ["name", "contact", "financial"], description: "Last four digits of cards and billing addresses." },
  misuse: { ...CALM, recipient: "known-threat", maliciousIntent: "yes" },
  response: {
    containment: "Reset all admin passwords on 2026-01-15 and blocked the attacker's IP addresses.",
    prevention: "Two-step verification required for all admin accounts by 2026-02-01.",
    individualSteps: "Watch card statements and be wary of emails that mention this incident.",
    notifyPlan: "Email to every affected customer on 2026-01-20."
  }
});

describe("notice drafts", () => {
  it("a complete assessment fills every PIPEDA, Quebec and Alberta field with no gaps", () => {
    const result = assess(full);
    for (const rules of [PIPEDA, QUEBEC_PRIVATE, ALBERTA]) {
      for (const d of [draftRegulatorNotice(rules, full, result), draftIndividualNotice(rules, full, result)]) {
        expect(d.missingCount, `${rules.id} ${d.kind}`).toBe(0);
        for (const f of d.fields) expect(f.value).not.toMatch(/\[/);
      }
    }
  });

  it("a blank assessment leaves bracketed gaps instead of inventing facts", () => {
    const input = make({ data: { categories: ["name"] } });
    const result = assess(input);
    const reg = draftRegulatorNotice(PIPEDA, input, result);
    expect(reg.missingCount).toBe(6); // all but the information description, which comes from the categories
    expect(reg.text).toMatch(/\[Organisation name\]/);
    expect(reg.text).toMatch(/\[Number of people affected, or an estimate\]/);
    const ind = draftIndividualNotice(PIPEDA, input, result);
    expect(ind.text).toMatch(/\[Toll-free number or email address/);
  });

  it("the Quebec notice includes the NEQ, Quebec resident count and other regulators", () => {
    const d = draftRegulatorNotice(QUEBEC_PRIVATE, full, assess(full));
    expect(d.text).toMatch(/NEQ\): 1234567890/);
    expect(d.text).toMatch(/Of whom reside in Québec: Approximately 2,500/);
    expect(d.text).toMatch(/OIPC Alberta were notified/);
  });

  it("the Alberta notice explains the risk rather than giving only a level", () => {
    const d = draftRegulatorNotice(ALBERTA, full, assess(full));
    const risk = d.fields.find((f) => f.id === "risk-assessment")!;
    expect(risk.value).toMatch(/malicious intent/);
    expect(risk.value).toMatch(/Harms that could reasonably result/);
  });

  it("individual notices use plain headings", () => {
    const d = draftIndividualNotice(PIPEDA, full, assess(full));
    expect(d.text).toMatch(/\nWhat you can do\n/);
    expect(d.text).toMatch(/informational only, not legal advice/i);
  });
});

describe("breach log", () => {
  it("keeps the record until the latest retention date of any applicable law", () => {
    const rec = createRecord(full);
    expect(keepUntil(rec)).toBe("2031-01-15"); // Quebec: 5 years from awareness beats PIPEDA's 24 months
  });

  it("exports CSV with escaping and formula-injection protection", () => {
    expect(csvCell('He said "hi", then left')).toBe('"He said ""hi"", then left"');
    expect(csvCell("=HYPERLINK(\"x\")")).toBe("\"'=HYPERLINK(\"\"x\"\")\"");
    expect(csvCell("-5")).toBe("'-5");
    const csv = toCsv([createRecord(full)]);
    const [header, row] = csv.trim().split("\r\n");
    expect(header.split(",")).toHaveLength(CSV_COLUMNS.length);
    expect(row).toMatch(/Web store intrusion/);
    expect(row).toMatch(/Report/);
  });

  it("round-trips a JSON backup and rejects files that aren't backups", () => {
    const b = toBackup([createRecord(full)]);
    expect(parseBackup(JSON.stringify(b)).records[0].input.org.name).toBe("Maple Outfitters Inc.");
    expect(() => parseBackup("{nope")).toThrow(/valid JSON/);
    expect(() => parseBackup(JSON.stringify({ format: "other" }))).toThrow(/isn't a Breach Assessor backup/);
    expect(() => parseBackup(JSON.stringify({ ...b, version: 99 }))).toThrow(/newer version/);
    expect(() => parseBackup(JSON.stringify({ ...b, records: [{ id: "x" }] }))).toThrow(/incomplete/);
  });
});

describe("browser storage", () => {
  it("saves, lists, restores and deletes records in IndexedDB", async () => {
    const a = createRecord(full, new Date("2026-01-01T00:00:00Z"));
    const b = { ...createRecord(full, new Date("2026-02-01T00:00:00Z")), status: { ...emptyStatus(), notes: "second" } };
    await putRecord(a);
    await putRecord(b);
    expect((await listRecords()).map((r) => r.id)).toEqual([b.id, a.id]);

    await restoreRecords([a], "replace");
    expect((await listRecords()).map((r) => r.id)).toEqual([a.id]);
    await restoreRecords([b], "merge");
    expect(await listRecords()).toHaveLength(2);

    await deleteRecord(a.id);
    expect((await listRecords()).map((r) => r.id)).toEqual([b.id]);

    await setMeta("draft", { hello: 1 });
    expect(await getMeta("draft")).toEqual({ hello: 1 });
  });
});
