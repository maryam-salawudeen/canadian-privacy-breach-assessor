import { useEffect, useRef, useState } from "react";
import { keepUntil, parseBackup, toBackup, toCsv, type BreachRecord, type NotificationStatus } from "../engine/log";
import { describePeriod, formatDate } from "../engine/notices";
import { deleteRecord, eraseAll, listRecords, putRecord, restoreRecords } from "../storage/db";
import { Area, Check, Text } from "./fields";
import { downloadText, today } from "./download";
import { Notices } from "./Notices";
import { Results, VerdictBadge } from "./Results";

const LAW_SHORT = { pipeda: "PIPEDA", quebec: "Quebec", alberta: "Alberta" } as const;

function StatusEditor({ rec, onChange }: { rec: BreachRecord; onChange: (s: NotificationStatus) => void }) {
  const s = rec.status;
  const set = (p: Partial<NotificationStatus>) => onChange({ ...s, ...p });
  const applies = (law: "pipeda" | "quebec" | "alberta") => rec.result.laws.some((l) => l.law === law && l.applicability !== "not-applicable");
  return (
    <div className="status-editor">
      <h3>Reporting and notification dates</h3>
      <div className="grid2">
        {applies("pipeda") && <Text label="Reported to the OPC" type="date" value={s.opcReportedOn} onChange={(opcReportedOn) => set({ opcReportedOn })} />}
        {applies("quebec") && <Text label="Reported to the CAI" type="date" value={s.caiReportedOn} onChange={(caiReportedOn) => set({ caiReportedOn })} />}
        {applies("alberta") && <Text label="Reported to OIPC Alberta" type="date" value={s.oipcReportedOn} onChange={(oipcReportedOn) => set({ oipcReportedOn })} />}
        <Text label="Individuals notified" type="date" value={s.individualsNotifiedOn} onChange={(individualsNotifiedOn) => set({ individualsNotifiedOn })} />
      </div>
      <Check label="Notice was given publicly instead of (or as well as) directly" checked={s.publicNotice} onChange={(publicNotice) => set({ publicNotice })} />
      {s.publicNotice && <Text label="Reason for public notice" value={s.publicNoticeReason} onChange={(publicNoticeReason) => set({ publicNoticeReason })} />}
      <Area label="Notes" hint="Anything else the regulator would need to verify your assessment, such as why you decided not to report." value={s.notes} onChange={(notes) => set({ notes })} />
    </div>
  );
}

export function LogPage({ onEdit }: { onEdit: (rec: BreachRecord) => void }) {
  const [records, setRecords] = useState<BreachRecord[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [restoreMode, setRestoreMode] = useState<"merge" | "replace">("merge");
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => listRecords().then(setRecords).catch(() => setRecords([]));
  useEffect(() => {
    reload();
  }, []);

  if (!records) return <p className="loading">Loading…</p>;

  const updateStatus = async (rec: BreachRecord, status: NotificationStatus) => {
    const next = { ...rec, status, updatedAt: new Date().toISOString() };
    setRecords(records.map((r) => (r.id === rec.id ? next : r)));
    await putRecord(next);
  };

  const remove = async (rec: BreachRecord) => {
    const until = keepUntil(rec);
    const warn = until && until > today() ? `\n\nThe law requires keeping this record until ${formatDate(until)}.` : "";
    if (!confirm(`Delete “${rec.input.incident.title || "Untitled"}” from this device?${warn}`)) return;
    await deleteRecord(rec.id);
    reload();
  };

  const restore = async (file: File) => {
    try {
      const backup = parseBackup(await file.text());
      if (restoreMode === "replace" && records.length && !confirm(`Replace the ${records.length} record(s) in this log with the ${backup.records.length} in the backup?`)) return;
      await restoreRecords(backup.records, restoreMode);
      setMessage(`Restored ${backup.records.length} record(s) from the backup made ${new Date(backup.exportedAt).toLocaleString("en-CA")}.`);
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Couldn't read that file.");
    }
  };

  const erase = async () => {
    if (!confirm("Erase every record and draft stored by this app in this browser? Download a backup first if you need one. This can't be undone.")) return;
    await eraseAll();
    setMessage("All data erased from this browser.");
    reload();
  };

  return (
    <div className="log">
      <header className="page-head">
        <div>
          <h2>Breach record log</h2>
          <p className="lede">
            Every breach, reported or not. PIPEDA: keep each record 24 months after you determine the breach occurred. Quebec: keep each register entry at least 5 years after you became aware of it.
          </p>
        </div>
        <div className="toolbar no-print">
          <button onClick={() => downloadText(`breach-log-${today()}.csv`, toCsv(records), "text/csv")} disabled={!records.length}>
            Export CSV
          </button>
          <button onClick={() => downloadText(`breach-log-${today()}.json`, JSON.stringify(toBackup(records), null, 2), "application/json")} disabled={!records.length}>
            Export JSON
          </button>
          <button onClick={() => window.print()} disabled={!records.length}>
            Print / save as PDF
          </button>
        </div>
      </header>

      {message && <p className="ok no-print" role="status">{message}</p>}

      {records.length === 0 ? (
        <div className="empty">
          <p>No breaches recorded on this device yet. Finish an assessment and choose “Save to breach log”.</p>
        </div>
      ) : (
        <table className="log-table">
          <thead>
            <tr>
              <th>Breach</th>
              <th>When</th>
              <th>Decision</th>
              <th>Reported / notified</th>
              <th>Keep until</th>
              <th className="no-print"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => {
              const until = keepUntil(rec);
              const s = rec.status;
              return (
                <tr key={rec.id}>
                  <td>
                    <strong>{rec.input.incident.title || "Untitled"}</strong>
                    <div className="small">{rec.input.org.name}</div>
                    <div className="small print-only">{rec.input.incident.circumstances}</div>
                  </td>
                  <td>
                    {describePeriod(rec.input) ?? "Unknown"}
                    {rec.input.incident.becameAware && <div className="small">Aware {formatDate(rec.input.incident.becameAware)}</div>}
                  </td>
                  <td>
                    {rec.result.laws
                      .filter((l) => l.applicability !== "not-applicable")
                      .map((l) => (
                        <div key={l.law} className="law-line">
                          <span className="small">{LAW_SHORT[l.law]}</span> <VerdictBadge verdict={l.verdict} />
                        </div>
                      ))}
                  </td>
                  <td className="small">
                    {s.opcReportedOn && <div>OPC {formatDate(s.opcReportedOn)}</div>}
                    {s.caiReportedOn && <div>CAI {formatDate(s.caiReportedOn)}</div>}
                    {s.oipcReportedOn && <div>OIPC AB {formatDate(s.oipcReportedOn)}</div>}
                    {s.individualsNotifiedOn && <div>People {formatDate(s.individualsNotifiedOn)}</div>}
                    {!s.opcReportedOn && !s.caiReportedOn && !s.oipcReportedOn && !s.individualsNotifiedOn && "—"}
                  </td>
                  <td>{until ? formatDate(until) : <span className="small">Set the dates to compute</span>}</td>
                  <td className="no-print actions">
                    <button className="secondary" onClick={() => setOpen(open === rec.id ? null : rec.id)}>
                      {open === rec.id ? "Close" : "Open"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {records
        .filter((r) => r.id === open)
        .map((rec) => (
          <section key={rec.id} className="record-detail no-print">
            <div className="toolbar">
              <button onClick={() => onEdit(rec)}>Edit answers</button>
              <button className="danger" onClick={() => remove(rec)}>
                Delete
              </button>
            </div>
            <StatusEditor rec={rec} onChange={(s) => updateStatus(rec, s)} />
            <Results result={rec.result} />
            <Notices input={rec.input} result={rec.result} />
          </section>
        ))}

      <section className="backup no-print">
        <h2>Backup and restore</h2>
        <p>
          Your log exists only in this browser. Clearing site data, or using another device, means it's gone, so download a backup regularly and keep it somewhere your
          organisation controls. The backup file contains the personal information you entered: store it as carefully as the breach records themselves.
        </p>
        <div className="toolbar">
          <button onClick={() => downloadText(`breach-assessor-backup-${today()}.json`, JSON.stringify(toBackup(records), null, 2), "application/json")}>Download backup</button>
          <label className="inline-select">
            When restoring{" "}
            <select value={restoreMode} onChange={(e) => setRestoreMode(e.target.value as "merge" | "replace")}>
              <option value="merge">merge with this log</option>
              <option value="replace">replace this log</option>
            </select>
          </label>
          <button onClick={() => fileRef.current?.click()}>Restore from backup…</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) restore(f);
              e.target.value = "";
            }}
          />
          <button className="danger" onClick={erase}>
            Erase all data
          </button>
        </div>
      </section>
    </div>
  );
}
