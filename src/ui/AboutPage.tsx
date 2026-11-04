export function Disclaimer() {
  return (
    <p className="disclaimer" role="note">
      <b>Informational only, not legal advice.</b> This tool helps you structure a breach assessment. It can't know every fact or account for every change in the law. When in doubt it
      leans towards reporting. Confirm your decision with your privacy officer or a lawyer.
    </p>
  );
}

export function AboutPage() {
  return (
    <div className="about">
      <h2>About this tool</h2>
      <Disclaimer />

      <h3>What it does</h3>
      <p>
        It walks a privacy officer through a privacy breach and works out, for each of three Canadian laws, whether the breach must be reported: PIPEDA (federal), Quebec's Law 25 (private sector and
        public bodies) and Alberta's PIPA. It explains each decision with citations, drafts the notice to the regulator and to the people affected, and keeps the breach record log that PIPEDA and
        Quebec require.
      </p>

      <h3>How it decides</h3>
      <p>
        All three laws weigh two things: how sensitive the information is, and how likely it is to be misused. The tool rates each from your answers, using the factors named by the OPC, the CAI and
        the OIPC Alberta, then combines them:
      </p>
      <ul>
        <li>
          <b>Report</b>: the answers point to the threshold being met.
        </li>
        <li>
          <b>Borderline: reporting recommended</b>: the answers don't clearly rule it out. The tool leans towards reporting and says why.
        </li>
        <li>
          <b>Reporting not indicated by your answers</b>: nothing you entered points to the threshold. This is never a finding that a breach is harmless, and the record is still required.
        </li>
      </ul>
      <p>Unknown answers count against you, not for you. With three or more key facts unknown, the tool won't say reporting isn't indicated.</p>

      <h3>Your data stays here</h3>
      <p>
        Everything you enter is stored in this browser's IndexedDB and nowhere else. There is no server, account, analytics or tracking. The app works offline once loaded and can be installed
        from your browser's menu. Export a backup from the Breach log page and keep it safe: clearing browser data deletes the log.
      </p>

      <h3>How it differs from the OPC's tool</h3>
      <p>
        The Office of the Privacy Commissioner of Canada offers a free online tool to assess whether a breach poses a real risk of significant harm under PIPEDA. Use it too. This tool is different
        in that it is open source, covers Quebec and Alberta as well as PIPEDA, drafts the notices, and keeps the 24-month breach record log on your own device.
      </p>

      <h3>What it doesn't cover</h3>
      <ul>
        <li>British Columbia's PIPA, and public-sector privacy laws outside Quebec.</li>
        <li>Provincial health privacy laws (such as Alberta's Health Information Act or Ontario's PHIPA).</li>
        <li>Federal government institutions under the Privacy Act.</li>
        <li>Foreign laws, sector rules (such as banking or securities regulators), contracts and cyber-insurance requirements.</li>
      </ul>

      <h3>Open source</h3>
      <p>MIT licensed. The legal rules are kept in one module, each with its source, so anyone can check them and propose corrections.</p>
    </div>
  );
}
