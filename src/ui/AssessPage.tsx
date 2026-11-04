import { useEffect, useMemo, useRef, useState } from "react";
import { assess } from "../engine/assess";
import { emptyInput } from "../engine/defaults";
import { createRecord, updateRecord, type BreachRecord } from "../engine/log";
import type { AssessmentInput } from "../engine/types";
import { getMeta, putRecord, setMeta } from "../storage/db";
import { Notices } from "./Notices";
import { Results } from "./Results";
import { DataStep, IncidentStep, MisuseStep, OrgStep, ResponseStep, ScopeStep, type StepProps } from "./Steps";

const STEPS: { title: string; blurb: string; body: (p: StepProps) => React.ReactNode }[] = [
  { title: "Organisation", blurb: "Who you are decides which laws can apply.", body: (p) => <OrgStep {...p} /> },
  { title: "Who is affected", blurb: "Where the affected people live matters as much as where you are.", body: (p) => <ScopeStep {...p} /> },
  { title: "What happened", blurb: "The facts that go into every notice and the record log.", body: (p) => <IncidentStep {...p} /> },
  { title: "Information involved", blurb: "The first factor: how sensitive is it?", body: (p) => <DataStep {...p} /> },
  { title: "Likelihood of misuse", blurb: "The second factor: how likely is it to be misused?", body: (p) => <MisuseStep {...p} /> },
  { title: "Your response", blurb: "What you have done, and what people can do.", body: (p) => <ResponseStep {...p} /> }
];
const RESULTS = STEPS.length;

interface Draft {
  input: AssessmentInput;
  step: number;
  editing?: BreachRecord;
}

export function AssessPage({ editing, onSaved }: { editing?: BreachRecord; onSaved: (rec: BreachRecord) => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState<BreachRecord | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Load the record being edited, or the autosaved draft.
  useEffect(() => {
    if (editing) {
      setDraft({ input: editing.input, step: 0, editing });
      setSaved(null);
      return;
    }
    getMeta<Draft>("draft")
      .then((d) => setDraft(d ?? { input: emptyInput(), step: 0 }))
      .catch(() => setDraft({ input: emptyInput(), step: 0 }));
  }, [editing]);

  // Autosave a new assessment locally so a refresh doesn't lose work. Edits to a
  // saved record are kept apart so they never overwrite the new-assessment draft.
  useEffect(() => {
    if (draft && !draft.editing) setMeta("draft", draft).catch(() => undefined);
  }, [draft]);

  const result = useMemo(() => (draft ? assess(draft.input) : null), [draft]);
  if (!draft || !result) return <p className="loading">Loading…</p>;

  const set: StepProps["set"] = (section, patch) => setDraft((d) => d && { ...d, input: { ...d.input, [section]: { ...d.input[section], ...patch } } });
  const go = (step: number) => {
    setDraft((d) => d && { ...d, step });
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const save = async () => {
    const rec = draft.editing ? updateRecord(draft.editing, draft.input, draft.editing.status) : createRecord(draft.input);
    await putRecord(rec);
    if (!draft.editing) await setMeta("draft", undefined);
    setSaved(rec);
    setDraft({ ...draft, editing: rec });
  };

  const startOver = async () => {
    if (!confirm("Start a new assessment? Unsaved answers in this one will be cleared.")) return;
    await setMeta("draft", undefined);
    setSaved(null);
    setDraft({ input: emptyInput(), step: 0 });
  };

  const step = draft.step;
  return (
    <div className="assess" ref={topRef}>
      <nav className="stepper" aria-label="Assessment steps">
        <ol>
          {[...STEPS.map((s) => s.title), "Decision and notices"].map((t, i) => (
            <li key={t}>
              <button className={i === step ? "current" : i < step ? "visited" : ""} aria-current={i === step ? "step" : undefined} onClick={() => go(i)}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                {t}
              </button>
            </li>
          ))}
        </ol>
        <button className="link" onClick={startOver}>
          Start a new assessment
        </button>
      </nav>

      <div className="panel">
        {draft.editing && <p className="editing">Editing log record “{draft.editing.input.incident.title || "Untitled"}”.</p>}
        {step < RESULTS ? (
          <form onSubmit={(e) => { e.preventDefault(); go(step + 1); }}>
            <h2>{STEPS[step].title}</h2>
            <p className="lede">{STEPS[step].blurb}</p>
            {STEPS[step].body({ input: draft.input, set })}
            <div className="nav-buttons">
              {step > 0 && (
                <button type="button" className="secondary" onClick={() => go(step - 1)}>
                  Back
                </button>
              )}
              <button type="submit" className="primary">
                {step === RESULTS - 1 ? "See the decision" : "Next"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <Results result={result} />
            <Notices input={draft.input} result={result} />
            <section className="save">
              <h2>Record it</h2>
              <p>
                PIPEDA requires a record of <b>every</b> breach for 24 months, and Quebec a register of every incident for 5 years, including ones you don't report. Saving keeps
                the record in this browser only.
              </p>
              <div className="nav-buttons">
                <button className="secondary" onClick={() => go(RESULTS - 1)}>
                  Back
                </button>
                <button className="primary" onClick={save}>
                  {draft.editing ? "Update log record" : "Save to breach log"}
                </button>
                {saved && (
                  <button className="secondary" onClick={() => onSaved(saved)}>
                    Open in log
                  </button>
                )}
              </div>
              {saved && <p className="ok" role="status">Saved to the breach log on this device.</p>}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
