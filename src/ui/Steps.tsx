import { DATA_CATEGORIES } from "../rules/dataCategories";
import { cite } from "../rules/sources";
import type { IncidentKind } from "../rules/types";
import { PROVINCES, type AssessmentInput, type OrgType, type Province } from "../engine/types";
import { Area, Check, Choice, CiteLink, MultiChoice, NumberInput, Select, Text, TRI } from "./fields";

export interface StepProps {
  input: AssessmentInput;
  set: <K extends keyof AssessmentInput>(section: K, patch: Partial<AssessmentInput[K]>) => void;
}

export function OrgStep({ input, set }: StepProps) {
  const o = input.org;
  const org = (p: Partial<AssessmentInput["org"]>) => set("org", p);
  return (
    <>
      <Text label="Organisation name" value={o.name} onChange={(name) => org({ name })} />
      <Choice<OrgType>
        legend="What kind of organisation is it?"
        hint="This decides which laws can apply."
        value={o.type}
        onChange={(type) => org({ type })}
        options={[
          { value: "private", label: "Business", hint: "A provincially regulated company, partnership or sole proprietor" },
          { value: "federal", label: "Federally regulated business", hint: "Bank, airline, telecom, broadcaster, interprovincial transport" },
          { value: "nonprofit", label: "Non-profit or charity", hint: "Society, association, charity, co-op" },
          { value: "public", label: "Municipality or other public body", hint: "City, town, school board, provincial agency" }
        ]}
      />
      {o.type === "nonprofit" && (
        <Check
          label="This information was handled in a commercial activity"
          hint="For example selling, bartering or leasing donor or membership lists, or running fee-based services. PIPEDA and Alberta PIPA cover non-profits only for commercial activity."
          checked={o.commercialActivity}
          onChange={(commercialActivity) => org({ commercialActivity })}
        />
      )}
      <Select<Province>
        label="Province or territory where the organisation operates and handled this information"
        value={o.province}
        onChange={(province) => org({ province })}
        options={PROVINCES.map((p) => ({ value: p.code, label: p.name }))}
      />
      {o.province === "QC" && o.type !== "public" && (
        <Text label="Québec business number (NEQ), if any" value={o.quebecBusinessNumber} onChange={(quebecBusinessNumber) => org({ quebecBusinessNumber })} />
      )}
      <Check
        label="We control this information"
        hint="Untick if you are a service provider holding it for a client. The organisation in control usually reports."
        checked={o.inControl}
        onChange={(inControl) => org({ inControl })}
      />
      <h3>Who can answer the regulator's questions?</h3>
      <div className="grid2">
        <Text label="Name" value={o.contactName} onChange={(contactName) => org({ contactName })} />
        <Text label="Title" value={o.contactTitle} onChange={(contactTitle) => org({ contactTitle })} />
        <Text label="Email" type="email" value={o.contactEmail} onChange={(contactEmail) => org({ contactEmail })} />
        <Text label="Phone" type="tel" value={o.contactPhone} onChange={(contactPhone) => org({ contactPhone })} />
      </div>
      <Text
        label="Contact for affected people"
        hint="A toll-free number or email address people can use to find out more. Required in notices to individuals."
        value={o.publicContact}
        onChange={(publicContact) => org({ publicContact })}
      />
    </>
  );
}

export function ScopeStep({ input, set }: StepProps) {
  const s = input.scope;
  const scope = (p: Partial<AssessmentInput["scope"]>) => set("scope", p);
  return (
    <>
      <MultiChoice<Province>
        legend="Where do the affected people live?"
        hint="Tick every province or territory. If you don't know, tick the ones you serve."
        value={s.residentProvinces}
        onChange={(residentProvinces) => scope({ residentProvinces })}
        options={PROVINCES.map((p) => ({ value: p.code, label: p.name }))}
        columns
      />
      <Check label="Some affected people live outside Canada" checked={s.outsideCanada} onChange={(outsideCanada) => scope({ outsideCanada })} />
      <Choice
        legend="Did this information cross a provincial or national border in the course of your business?"
        hint={
          <>
            For example collected online from another province, or stored or processed outside the province. PIPEDA applies to information that crosses borders in commercial activity. <CiteLink cite={cite("opc-pipeda-brief", "\"Information that crosses borders\"")} />
          </>
        }
        value={s.crossBorder}
        onChange={(crossBorder) => scope({ crossBorder })}
        options={TRI}
      />
      <Check
        label="The information is about our own employees or job applicants"
        hint="PIPEDA covers employee information only for federally regulated employers."
        checked={s.employeeInfo}
        onChange={(employeeInfo) => scope({ employeeInfo })}
      />
    </>
  );
}

export function IncidentStep({ input, set }: StepProps) {
  const i = input.incident;
  const inc = (p: Partial<AssessmentInput["incident"]>) => set("incident", p);
  return (
    <>
      <Text label="Short title for the log" placeholder="e.g. Misdirected payroll email" value={i.title} onChange={(title) => inc({ title })} />
      <MultiChoice<IncidentKind>
        legend="What happened to the information?"
        value={i.kinds}
        onChange={(kinds) => inc({ kinds })}
        options={[
          { value: "unauthorized-access", label: "Someone accessed it without authorization", hint: "Hacking, ransomware, an employee looking at records without a work reason" },
          { value: "unauthorized-disclosure", label: "It was disclosed to the wrong people", hint: "Misdirected email or mail, information published by mistake" },
          { value: "loss", label: "It was lost", hint: "Lost laptop, phone, USB key or paper files" },
          { value: "unauthorized-use", label: "It was used for an unauthorized purpose", hint: "Used for something it was not collected for" },
          { value: "other", label: "Some other compromise of its protection" }
        ]}
      />
      <Area label="What happened?" hint="Describe the circumstances in plain words. This goes into the notices." value={i.circumstances} onChange={(circumstances) => inc({ circumstances })} rows={4} />
      <Area label="Cause, if known" hint="Say 'not yet known' if you are still investigating." value={i.cause} onChange={(cause) => inc({ cause })} rows={2} />
      <div className="grid2">
        <Text label="Breach started" type="date" value={i.occurredFrom} onChange={(occurredFrom) => inc({ occurredFrom })} />
        <Text label="Breach ended" type="date" value={i.occurredTo} onChange={(occurredTo) => inc({ occurredTo })} />
      </div>
      <Text label="If the dates are unknown, the approximate period" placeholder="e.g. Sometime in early March 2026" value={i.occurredApprox} onChange={(occurredApprox) => inc({ occurredApprox })} />
      <div className="grid2">
        <Text label="Date you became aware of it" hint="Quebec's register keeps entries 5 years from this date." type="date" value={i.becameAware} onChange={(becameAware) => inc({ becameAware })} />
        <Text label="Date you determined a breach occurred" hint="PIPEDA's 24-month record period runs from this date." type="date" value={i.determined} onChange={(determined) => inc({ determined })} />
      </div>
      <div className="grid2">
        <NumberInput label="Number of people affected" value={i.affectedCount} onChange={(affectedCount) => inc({ affectedCount })} />
        {input.scope.residentProvinces.includes("QC") && (
          <NumberInput label="Of whom live in Quebec" hint="Required in the notice to the CAI." value={i.quebecResidentCount} onChange={(quebecResidentCount) => inc({ quebecResidentCount })} />
        )}
      </div>
      <Check label="These numbers are estimates" checked={i.affectedApprox} onChange={(affectedApprox) => inc({ affectedApprox })} />
      <Text
        label="Other privacy regulators already notified"
        hint="Quebec's notice asks whether a regulator outside Quebec has been told."
        value={i.otherRegulators}
        onChange={(otherRegulators) => inc({ otherRegulators })}
      />
    </>
  );
}

export function DataStep({ input, set }: StepProps) {
  const d = input.data;
  return (
    <>
      <MultiChoice
        legend="What kinds of personal information were involved?"
        hint="Tick everything that applies. Sensitivity is the first factor in all three laws."
        value={d.categories}
        onChange={(categories) => set("data", { categories })}
        options={DATA_CATEGORIES.map((c) => ({ value: c.id, label: c.label, hint: c.examples }))}
        columns
      />
      <Area label="Describe the information" hint="For example 'names, emails and the last four digits of payment cards'." value={d.description} onChange={(description) => set("data", { description })} />
      <Check
        label="The context makes this information more sensitive than it looks"
        hint="For example a list of names that reveals who uses a clinic, shelter or support service. The OPC notes any information can be sensitive in context."
        checked={d.contextRaisesSensitivity}
        onChange={(contextRaisesSensitivity) => set("data", { contextRaisesSensitivity })}
      />
    </>
  );
}

export function MisuseStep({ input, set }: StepProps) {
  const m = input.misuse;
  const mis = (p: Partial<AssessmentInput["misuse"]>) => set("misuse", p);
  return (
    <>
      <p className="lede">
        These questions come from the OPC's probability-of-misuse questions and the OIPC Alberta's risk factors. "Don't know yet" is a fair answer: unknowns raise the risk until you resolve them.{" "}
        <CiteLink cite={cite("opc-guidance", "Part 6, \"Probability of Misuse\"")} /> <CiteLink cite={cite("oipc-ab-guidance", "Section C")} />
      </p>
      <Choice
        legend="Who got, or could have got, the information?"
        value={m.recipient}
        onChange={(recipient) => mis({ recipient })}
        options={[
          { value: "known-threat", label: "People likely to misuse it", hint: "Hackers, thieves, fraudsters" },
          { value: "unknown", label: "Unknown people" },
          { value: "many", label: "A large number of people or the public" },
          { value: "relationship", label: "Someone who knows the people affected", hint: "An ex-spouse, boss, neighbour or colleague" },
          { value: "internal", label: "An employee or insider without authorization" },
          { value: "known-limited", label: "A limited, known recipient", hint: "e.g. an email sent to the wrong business contact" },
          { value: "nobody-known", label: "No one we know of", hint: "Lost, with no sign anyone accessed it" }
        ]}
      />
      {m.recipient === "known-limited" && (
        <Choice
          legend="Has the recipient confirmed they deleted it and didn't share it?"
          hint="Get this in writing."
          value={m.recipientConfirmedDeletion}
          onChange={(recipientConfirmedDeletion) => mis({ recipientConfirmedDeletion })}
          options={TRI}
        />
      )}
      <Choice legend="Is there evidence of malicious intent (theft, hacking, malware)?" value={m.maliciousIntent} onChange={(maliciousIntent) => mis({ maliciousIntent })} options={TRI} />
      <Choice legend="Is there evidence the information has been misused?" value={m.misuseEvidence} onChange={(misuseEvidence) => mis({ misuseEvidence })} options={TRI} />
      <Choice legend="Was it posted publicly or offered for sale (e.g. on the dark web)?" value={m.publiclyPosted} onChange={(publiclyPosted) => mis({ publiclyPosted })} options={TRI} />
      <Choice legend="Has the information been recovered?" value={m.recovered} onChange={(recovered) => mis({ recovered })} options={TRI} />
      <Choice
        legend="Was it encrypted?"
        value={m.encryption}
        onChange={(encryption) => mis({ encryption })}
        options={[
          { value: "strong", label: "Yes, strongly, and the key or password was not compromised" },
          { value: "weak-or-compromised", label: "Yes, but weakly, or the key may be compromised" },
          { value: "none", label: "No" },
          { value: "unknown", label: "Don't know yet" }
        ]}
      />
      <Choice
        legend="How long was it exposed?"
        value={m.exposure}
        onChange={(exposure) => mis({ exposure })}
        options={[
          { value: "hours", label: "Hours" },
          { value: "days", label: "Days" },
          { value: "weeks", label: "Weeks or longer" },
          { value: "unknown", label: "Don't know yet" }
        ]}
      />
      <Choice legend="Are vulnerable people affected, such as youth or seniors?" value={m.vulnerablePeople} onChange={(vulnerablePeople) => mis({ vulnerablePeople })} options={TRI} />
    </>
  );
}

export function ResponseStep({ input, set }: StepProps) {
  const r = input.response;
  const res = (p: Partial<AssessmentInput["response"]>) => set("response", p);
  return (
    <>
      <p className="lede">All three laws ask what you have done about it. Include dates. Leave blank what you don't have yet; the notices will show a [gap].</p>
      <Area label="Steps taken to contain the breach and reduce the risk of harm" value={r.containment} onChange={(containment) => res({ containment })} rows={4} />
      <Area label="Steps to prevent it happening again" hint="Quebec's notice asks for these with dates or expected time limits." value={r.prevention} onChange={(prevention) => res({ prevention })} rows={3} />
      <Area label="Steps affected people can take to protect themselves" value={r.individualSteps} onChange={(individualSteps) => res({ individualSteps })} rows={3} />
      <Area label="How and when you notified, or will notify, the people affected" value={r.notifyPlan} onChange={(notifyPlan) => res({ notifyPlan })} rows={2} />
      <Check
        label="Police or another enforcement body has asked us to delay notifying people"
        hint="Quebec lets notice to individuals wait only while it could hamper such an investigation."
        checked={r.lawEnforcementHold}
        onChange={(lawEnforcementHold) => res({ lawEnforcementHold })}
      />
    </>
  );
}
