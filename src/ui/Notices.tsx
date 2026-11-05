import { useState } from "react";
import { rulesFor } from "../engine/assess";
import { draftIndividualNotice, draftRegulatorNotice } from "../engine/notices";
import type { AssessmentInput, AssessmentResult } from "../engine/types";
import { CiteLink } from "./fields";
import { downloadText } from "./download";

const LAW_SHORT = { pipeda: "PIPEDA", quebec: "Quebec", alberta: "Alberta" } as const;

export function Notices({ input, result }: { input: AssessmentInput; result: AssessmentResult }) {
  const laws = result.laws.filter((l) => l.verdict === "report" || l.verdict === "lean-report");
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState("");

  if (!laws.length) {
    return (
      <section className="notices">
        <h2>Draft notices</h2>
        <p>No law in this tool points to reporting on these answers, so no notices are drafted. The breach still goes in your record log.</p>
      </section>
    );
  }

  const drafts = laws.flatMap((l) => {
    const rules = rulesFor(l.law, input);
    return [
      { key: `${l.law}-reg`, tab: `To the ${rules.regulatorShort}`, notice: draftRegulatorNotice(rules, input, result), rules },
      { key: `${l.law}-ind`, tab: `To people affected (${LAW_SHORT[l.law]})`, notice: draftIndividualNotice(rules, input, result), rules }
    ];
  });
  const current = drafts[Math.min(tab, drafts.length - 1)];
  const n = current.notice;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(n.text);
      setCopied(current.key);
      setTimeout(() => setCopied(""), 2000);
    } catch {
      setCopied("");
    }
  };

  return (
    <section className="notices">
      <h2>Draft notices</h2>
      <p className="lede">
        <b>[Bracketed]</b> text marks something you still need to fill in. Review every draft before sending.
      </p>
      <div className="notice-head">
        <label className="inline-select">
          Notice{" "}
          <select value={Math.min(tab, drafts.length - 1)} onChange={(e) => setTab(Number(e.target.value))}>
            {drafts.map((d, i) => (
              <option key={d.key} value={i}>
                {d.tab}
                {d.notice.missingCount ? ` (${d.notice.missingCount} to fill in)` : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="draft-actions">
          <button onClick={copy}>{copied === current.key ? "Copied" : "Copy text"}</button>
          <button onClick={() => downloadText(`${current.key}-draft.txt`, n.text, "text/plain")}>Download .txt</button>
        </div>
      </div>
      <pre className="draft">{n.text}</pre>
      <details className="checklist">
        <summary>
          What the law requires in this notice{n.missingCount ? ` (${n.missingCount} still missing)` : ""}
        </summary>
        <ul>
          {n.fields.map((f) => (
            <li key={f.id} className={f.missing ? "missing" : "done"}>
              <span aria-hidden>{f.missing ? "○" : "●"}</span>
              <span>
                {f.label} <CiteLink cite={f.cite} />
              </span>
            </li>
          ))}
        </ul>
        <p className="small">
          {n.kind === "regulator" ? current.rules.howToReport.text : current.rules.indirectNotice.text}{" "}
          {n.kind === "regulator" && (
            <a href={current.rules.howToReport.url} target="_blank" rel="noopener noreferrer">
              {current.rules.regulatorShort} reporting page
            </a>
          )}
        </p>
      </details>
    </section>
  );
}
