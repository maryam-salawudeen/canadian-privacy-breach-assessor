import { overallVerdict } from "../engine/assess";
import { verdictLabel } from "../engine/log";
import { formatDate } from "../engine/notices";
import type { Applicability, AssessmentResult, LawResult, Reason, Verdict } from "../engine/types";
import { CiteLink } from "./fields";

const APPLICABILITY: Record<Applicability, string> = {
  applies: "Applies",
  "may-apply": "May apply",
  "not-applicable": "Does not apply"
};

const HEADLINE: Record<Verdict, string> = {
  report: "Report this breach",
  "lean-report": "Borderline: reporting is recommended",
  "not-indicated": "Reporting is not indicated by your answers"
};

export function VerdictBadge({ verdict }: { verdict?: Verdict }) {
  return <span className={`badge v-${verdict ?? "na"}`}>{verdictLabel(verdict)}</span>;
}

function Reasons({ items }: { items: Reason[] }) {
  return (
    <ul className="reasons">
      {items.map((r, n) => (
        <li key={n}>
          {r.text} {r.cite && <CiteLink cite={r.cite} />}
        </li>
      ))}
    </ul>
  );
}

function LawCard({ law }: { law: LawResult }) {
  const out = law.applicability === "not-applicable";
  return (
    <article className={`law-card ${out ? "muted" : `v-${law.verdict}`}`}>
      <header>
        <h3>{law.name}</h3>
        <span className={`pill a-${law.applicability}`}>{APPLICABILITY[law.applicability]}</span>
        {!out && <VerdictBadge verdict={law.verdict} />}
      </header>
      <details open={!out}>
        <summary>Why this law {out ? "does not apply" : law.applicability === "applies" ? "applies" : "may apply"}</summary>
        <Reasons items={law.applicabilityReasons} />
      </details>
      {!out && (
        <>
          <h4>Decision and reasons</h4>
          <Reasons items={law.verdictReasons} />
          <h4>What to do</h4>
          <ol className="obligations">
            {law.obligations.map((o) => (
              <li key={o.id} className={o.required ? "required" : "recommended"}>
                <strong>{o.title}</strong>
                <span className="tag">{o.required ? "Required" : "Recommended"}</span>
                {o.deadline && (
                  <p className="deadline">
                    <b>When:</b> {o.deadline}
                  </p>
                )}
                <p>
                  {o.detail} <CiteLink cite={o.cite} />
                </p>
              </li>
            ))}
          </ol>
          {law.retentionUntil && <p className="retention">Keep the record until at least <b>{formatDate(law.retentionUntil)}</b>.</p>}
        </>
      )}
    </article>
  );
}

export function Results({ result }: { result: AssessmentResult }) {
  const overall = overallVerdict(result);
  const reporting = result.laws.filter((l) => l.verdict === "report" || l.verdict === "lean-report");
  const r = result.risk;
  return (
    <section className="results">
      <div className={`headline v-${overall ?? "na"}`}>
        <p className="eyebrow">Overall result</p>
        <h2>{overall ? HEADLINE[overall] : "None of the three laws in this tool applies"}</h2>
        {overall && overall !== "not-indicated" && (
          <p>
            {reporting.map((l) => l.name).join(", ")}: report to the regulator{reporting.length > 1 ? "s" : ""} below.
          </p>
        )}
        {overall === "not-indicated" && (
          <p>This does not mean the breach is harmless. Record it, keep your reasoning, and reassess if anything new comes to light.</p>
        )}
        {!overall && <p>See the notes below for the laws that may cover you instead.</p>}
      </div>

      <div className="risk">
        <div>
          <p className="eyebrow">Sensitivity</p>
          <p className={`level l-${r.sensitivity}`}>{r.sensitivity}</p>
          <Reasons items={r.sensitivityReasons} />
        </div>
        <div>
          <p className="eyebrow">Likelihood of misuse</p>
          <p className={`level l-${r.probability}`}>{r.probability === "negligible" ? "very unlikely" : r.probability}</p>
          <Reasons items={r.probabilityReasons} />
        </div>
      </div>
      {r.foreseeableHarms.length > 0 && (
        <p className="harms">
          <b>Harms that could reasonably result:</b> {r.foreseeableHarms.join(", ")}.
        </p>
      )}

      {result.outOfScope.length > 0 && (
        <div className="callout">
          <h3>Also check</h3>
          <Reasons items={result.outOfScope} />
        </div>
      )}

      <div className="law-cards">
        {result.laws.map((l) => (
          <LawCard key={l.law} law={l} />
        ))}
      </div>
      <p className="small">Assessed {new Date(result.assessedAt).toLocaleString("en-CA")}. Informational only, not legal advice.</p>
    </section>
  );
}
