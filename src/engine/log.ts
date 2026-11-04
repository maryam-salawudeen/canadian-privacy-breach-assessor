import { CATEGORY_BY_ID } from "../rules/dataCategories";
import { assess } from "./assess";
import { describePeriod } from "./notices";
import type { AssessmentInput, AssessmentResult, Verdict } from "./types";

/**
 * The breach record log. PIPEDA requires a record of every breach of security
 * safeguards for 24 months (SOR/2018-64 s. 6); Quebec requires a register of
 * every confidentiality incident for at least 5 years (A-2.1, r. 3.1, s. 8).
 */

export interface NotificationStatus {
  opcReportedOn: string;
  caiReportedOn: string;
  oipcReportedOn: string;
  individualsNotifiedOn: string;
  publicNotice: boolean;
  publicNoticeReason: string;
  notes: string;
}

export interface BreachRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: AssessmentInput;
  result: AssessmentResult;
  status: NotificationStatus;
}

export const BACKUP_FORMAT = "canadian-breach-assessor/backup";
export const BACKUP_VERSION = 1;

export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  records: BreachRecord[];
}

export function emptyStatus(): NotificationStatus {
  return { opcReportedOn: "", caiReportedOn: "", oipcReportedOn: "", individualsNotifiedOn: "", publicNotice: false, publicNoticeReason: "", notes: "" };
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createRecord(input: AssessmentInput, now = new Date()): BreachRecord {
  const ts = now.toISOString();
  return { id: newId(), createdAt: ts, updatedAt: ts, input, result: assess(input, now), status: emptyStatus() };
}

export function updateRecord(rec: BreachRecord, input: AssessmentInput, status: NotificationStatus, now = new Date()): BreachRecord {
  return { ...rec, input, status, result: assess(input, now), updatedAt: now.toISOString() };
}

/** The latest date any applicable law requires this record to be kept until. */
export function keepUntil(rec: BreachRecord): string | undefined {
  const dates = rec.result.laws.map((l) => l.retentionUntil).filter((d): d is string => !!d);
  return dates.sort().at(-1);
}

const VERDICT_LABEL: Record<Verdict, string> = {
  report: "Report",
  "lean-report": "Borderline: report recommended",
  "not-indicated": "Reporting not indicated by answers"
};

export function verdictLabel(v: Verdict | undefined): string {
  return v ? VERDICT_LABEL[v] : "Not applicable";
}

export const CSV_COLUMNS = [
  "Record ID",
  "Title",
  "Organisation",
  "Date or period of breach",
  "Became aware",
  "Determined breach occurred",
  "Circumstances",
  "Cause",
  "Information involved",
  "People affected",
  "Sensitivity",
  "Likelihood of misuse",
  "PIPEDA",
  "Quebec Law 25",
  "Alberta PIPA",
  "Reported to OPC",
  "Reported to CAI",
  "Reported to OIPC Alberta",
  "Individuals notified",
  "Public notice",
  "Public notice reason",
  "Measures to reduce harm",
  "Measures to prevent recurrence",
  "Keep until",
  "Notes",
  "Created",
  "Updated"
] as const;

function lawCell(rec: BreachRecord, law: "pipeda" | "quebec" | "alberta"): string {
  const l = rec.result.laws.find((x) => x.law === law);
  if (!l || l.applicability === "not-applicable") return "Not applicable";
  return `${l.applicability === "may-apply" ? "May apply; " : ""}${verdictLabel(l.verdict)}`;
}

export function recordRow(rec: BreachRecord): string[] {
  const { input: i, result: r, status: s } = rec;
  const info = [...i.data.categories.map((c) => CATEGORY_BY_ID[c].label), i.data.description].filter(Boolean).join("; ");
  return [
    rec.id,
    i.incident.title,
    i.org.name,
    describePeriod(i) ?? "Unknown",
    i.incident.becameAware,
    i.incident.determined,
    i.incident.circumstances,
    i.incident.cause,
    info,
    i.incident.affectedCount === null ? "Unknown" : `${i.incident.affectedApprox ? "~" : ""}${i.incident.affectedCount}`,
    r.risk.sensitivity,
    r.risk.probability,
    lawCell(rec, "pipeda"),
    lawCell(rec, "quebec"),
    lawCell(rec, "alberta"),
    s.opcReportedOn,
    s.caiReportedOn,
    s.oipcReportedOn,
    s.individualsNotifiedOn,
    s.publicNotice ? "Yes" : "No",
    s.publicNoticeReason,
    i.response.containment,
    i.response.prevention,
    keepUntil(rec) ?? "",
    s.notes,
    rec.createdAt,
    rec.updatedAt
  ];
}

/** RFC 4180 quoting, plus a guard against spreadsheet formula injection. */
export function csvCell(value: string): string {
  let v = value ?? "";
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(records: BreachRecord[]): string {
  const lines = [CSV_COLUMNS.map(csvCell).join(","), ...records.map((r) => recordRow(r).map(csvCell).join(","))];
  return lines.join("\r\n") + "\r\n";
}

export function toBackup(records: BreachRecord[], now = new Date()): Backup {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now.toISOString(), records };
}

/** Parses and checks a backup file. Throws with a readable message if it isn't one. */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file isn't valid JSON.");
  }
  const b = data as Partial<Backup>;
  if (!b || typeof b !== "object" || b.format !== BACKUP_FORMAT) throw new Error("This file isn't a Breach Assessor backup.");
  if (typeof b.version !== "number" || b.version > BACKUP_VERSION) throw new Error("This backup was made by a newer version of the app.");
  if (!Array.isArray(b.records)) throw new Error("The backup has no records list.");
  b.records.forEach((r, n) => {
    if (!r || typeof r.id !== "string" || !r.input || !r.result || !r.status) throw new Error(`Record ${n + 1} in the backup is incomplete.`);
  });
  return b as Backup;
}
