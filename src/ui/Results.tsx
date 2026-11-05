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

const LEVEL: Record<string, string> = { negligible: "Very unlikely", low: "Low", moderate: "Moderate", high: "High" };

/** First sentence only, so the summary stays short; the full text is under "Reasons and sources". */
const firstSentence = (s: string) => s.split(/(?<=\.)\s/)[0];

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

      {!out && (
        <ul className="todo">
          {law.obligations.map((o) => (
            <li key={o.id}>
              <span className={o.required ? "tag required" : "tag"}>{o.required ? "Required" : "Recommended"}</span>
              <span>
                {o.title}
                {o.deadline && <span className="when"> · {firstSentence(o.deadline)}</span>}
              </span>
            </li>
          ))}
          {law.retentionUntil && (
            <li>
              <span className="tag">Keep until</span>
              <span>{formatDate(law.retentionUntil)}</span>
            </li>
          )}
        </ul>
      )}

      <details>
        <summary>Reasons and sources</summary>
        <h4>{out ? "Why it doesn't apply" : law.applicability === "applies" ? "Why it applies" : "Why it may apply"}</h4>
        <Reasons items={law.applicabilityReasons} />
        {!out && (
          <>
            <h4>Why this decision</h4>
            <Reasons items={law.verdictReasons} />
            <h4>What each step involves</h4>
            <Reasons items={law.obligations.map((o) => ({ text: `${o.title}: ${o.detail}${o.deadline ? ` When: ${o.deadline}` : ""}`, cite: o.cite }))} />
          </>
        )}
      </details>
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
        <h2>{overall ? HEADLINE[overall] : "None of the three laws in this tool applies"}</h2>
        {overall && overall !== "not-indicated" && <p>Report under {reporting.map((l) => l.name).join(", ")}.</p>}
        {overall === "not-indicated" && <p>This does not mean the breach is harmless. Record it and reassess if anything new comes to light.</p>}
        {!overall && <p>See “Also check” below for the laws that may cover you instead.</p>}
        <p className="risk-line">
          Sensitivity <b>{LEVEL[r.sensitivity]}</b> · Likelihood of misuse <b>{LEVEL[r.probability]}</b>
        </p>
      </div>

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

      <details className="risk-details">
        <summary>How the risk was rated</summary>
        <h4>Sensitivity: {LEVEL[r.sensitivity]}</h4>
        <Reasons items={r.sensitivityReasons} />
        <h4>Likelihood of misuse: {LEVEL[r.probability]}</h4>
        <Reasons items={r.probabilityReasons} />
        {r.foreseeableHarms.length > 0 && <p>Harms that could reasonably result: {r.foreseeableHarms.join(", ")}.</p>}
      </details>
    </section>
  );
}
