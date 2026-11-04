import { useId, type ReactNode } from "react";
import { SOURCES, type Cite } from "../rules/sources";

export function CiteLink({ cite }: { cite: Cite }) {
  const s = SOURCES[cite.source];
  return (
    <a className="cite" href={s.url} target="_blank" rel="noopener noreferrer" title={`${s.title} (${s.publisher}). Verified ${s.verified}.`}>
      {s.short}, {cite.pinpoint}
    </a>
  );
}

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  children: (id: string) => ReactNode;
}

export function Field({ label, hint, children }: FieldProps) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <p className="hint">{hint}</p>}
      {children(id)}
    </div>
  );
}

export function Text(props: { label: ReactNode; hint?: ReactNode; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <Field label={props.label} hint={props.hint}>
      {(id) => (
        <input id={id} type={props.type ?? "text"} value={props.value} placeholder={props.placeholder} onChange={(e) => props.onChange(e.target.value)} />
      )}
    </Field>
  );
}

export function Area(props: { label: ReactNode; hint?: ReactNode; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <Field label={props.label} hint={props.hint}>
      {(id) => <textarea id={id} rows={props.rows ?? 3} value={props.value} onChange={(e) => props.onChange(e.target.value)} />}
    </Field>
  );
}

export function NumberInput(props: { label: ReactNode; hint?: ReactNode; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <Field label={props.label} hint={props.hint}>
      {(id) => (
        <input
          id={id}
          type="number"
          min={0}
          inputMode="numeric"
          value={props.value ?? ""}
          onChange={(e) => props.onChange(e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value))))}
        />
      )}
    </Field>
  );
}

export function Select<T extends string>(props: { label: ReactNode; hint?: ReactNode; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <Field label={props.label} hint={props.hint}>
      {(id) => (
        <select id={id} value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
          {props.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Choice<T extends string>(props: {
  legend: ReactNode;
  hint?: ReactNode;
  value: T;
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="choice">
      <legend>{props.legend}</legend>
      {props.hint && <p className="hint">{props.hint}</p>}
      <div className="options">
        {props.options.map((o) => (
          <label key={o.value} className={props.value === o.value ? "option selected" : "option"}>
            <input type="radio" name={name} checked={props.value === o.value} onChange={() => props.onChange(o.value)} />
            <span>
              {o.label}
              {o.hint && <small>{o.hint}</small>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function MultiChoice<T extends string>(props: {
  legend: ReactNode;
  hint?: ReactNode;
  value: T[];
  options: { value: T; label: string; hint?: string }[];
  onChange: (v: T[]) => void;
  columns?: boolean;
}) {
  const toggle = (v: T) => props.onChange(props.value.includes(v) ? props.value.filter((x) => x !== v) : [...props.value, v]);
  return (
    <fieldset className="choice">
      <legend>{props.legend}</legend>
      {props.hint && <p className="hint">{props.hint}</p>}
      <div className={props.columns ? "options columns" : "options"}>
        {props.options.map((o) => (
          <label key={o.value} className={props.value.includes(o.value) ? "option selected" : "option"}>
            <input type="checkbox" checked={props.value.includes(o.value)} onChange={() => toggle(o.value)} />
            <span>
              {o.label}
              {o.hint && <small>{o.hint}</small>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Check(props: { label: ReactNode; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={props.checked ? "option single selected" : "option single"}>
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} />
      <span>
        {props.label}
        {props.hint && <small>{props.hint}</small>}
      </span>
    </label>
  );
}

export const TRI = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
  { value: "unknown" as const, label: "Don't know yet" }
];
