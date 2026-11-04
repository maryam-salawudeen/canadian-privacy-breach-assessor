import { ALBERTA } from "../rules/alberta";
import { PIPEDA } from "../rules/pipeda";
import { QUEBEC_PRIVATE } from "../rules/quebec";
import { SOURCES } from "../rules/sources";
import type { LawRules, Rule } from "../rules/types";
import { CiteLink } from "./fields";

function RuleRow({ title, rule }: { title: string; rule: Rule }) {
  return (
    <div className="rule">
      <dt>{title}</dt>
      <dd>
        {rule.text} <CiteLink cite={rule.cite} />
      </dd>
    </div>
  );
}

function LawRulesView({ rules }: { rules: LawRules }) {
  return (
    <details className="law-rules">
      <summary>
        <h3>{rules.name}</h3>
        <span className="small">Regulator: {rules.regulator}</span>
      </summary>
      <dl>
        <RuleRow title="What counts" rule={rules.incidentDefinition} />
        <RuleRow title="Duty to report" rule={rules.reportingDuty} />
        {rules.harmFactors.map((f, i) => (
          <RuleRow key={i} title={i === 0 ? "Factors to weigh" : ""} rule={f} />
        ))}
        <RuleRow title="Harm" rule={rules.harmDefinition} />
        <RuleRow title="Deadline: regulator" rule={rules.deadlineRegulator} />
        <RuleRow title="Deadline: individuals" rule={rules.deadlineIndividuals} />
        <RuleRow title="Notifying individuals" rule={rules.individualNotice} />
        <RuleRow title="Direct or public notice" rule={rules.indirectNotice} />
        <RuleRow title="Records" rule={rules.recordKeeping} />
        <RuleRow title="Service providers" rule={rules.serviceProviders} />
        {rules.notes.map((n, i) => (
          <RuleRow key={i} title={i === 0 ? "Notes" : ""} rule={n} />
        ))}
      </dl>
      <h4>Notice to the regulator must contain</h4>
      <ol>
        {rules.regulatorNoticeFields.map((f) => (
          <li key={f.id + f.cite.pinpoint}>
            {f.label} <CiteLink cite={f.cite} />
          </li>
        ))}
      </ol>
      <h4>Notice to individuals must contain</h4>
      <ol>
        {rules.individualNoticeFields.map((f) => (
          <li key={f.id + f.cite.pinpoint}>
            {f.label} <CiteLink cite={f.cite} />
          </li>
        ))}
      </ol>
    </details>
  );
}

export function SourcesPage() {
  return (
    <div className="sources">
      <h2>Rules and sources</h2>
      <p className="lede">
        Every rule this tool applies, with the official source next to it, so you can check it yourself. The rules live in <code>src/rules/</code> in the source code. Quebec public bodies use the
        same rules under sections 63.8–63.11 of the Access Act.
      </p>
      <LawRulesView rules={PIPEDA} />
      <LawRulesView rules={QUEBEC_PRIVATE} />
      <LawRulesView rules={ALBERTA} />

      <h3>Official sources</h3>
      <table className="source-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Publisher</th>
            <th>Version</th>
            <th>Last checked</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(SOURCES).map((s) => (
            <tr key={s.id}>
              <td>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
              </td>
              <td>{s.publisher}</td>
              <td>{s.currency}</td>
              <td>{s.verified}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small">Found a rule that doesn't match its source, or a law that changed? Please open an issue. See CONTRIBUTING.md.</p>
    </div>
  );
}
