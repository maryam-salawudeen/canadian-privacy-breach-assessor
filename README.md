# Canadian Privacy Breach Assessor

An open source, offline-first web app that walks a privacy officer through a privacy breach and works out whether it must be reported under **PIPEDA**, **Quebec's Law 25** and **Alberta's PIPA**. It drafts the notices and keeps the breach record log, and every rule it applies is cited to its official source.

> **Informational only, not legal advice.** This tool helps you structure an assessment. It can't know every fact or account for every change in the law. When it isn't sure it leans towards reporting, and it never tells you a breach is "safe". Confirm your decision with your privacy officer or a lawyer.

It's built for privacy officers at Canadian small and mid-sized organisations, non-profits and municipalities.

## What it does

1. **A reporting decision for each law, with reasons**
   - **PIPEDA (federal):** the "real risk of significant harm" (RROSH) test, weighing how sensitive the information is and how likely it is to be misused (s. 10.1).
   - **Quebec Law 25:** confidentiality incidents and the "risk of serious injury" test. It covers businesses (P-39.1, ss. 3.5–3.8) and public bodies such as Quebec municipalities (A-2.1, ss. 63.8–63.11).
   - **Alberta PIPA:** notice to the Commissioner where a reasonable person would consider there is a real risk of significant harm (s. 34.1).
   - Which laws apply depends on the type of organisation, where it operates, where the affected people live and whether the information crossed borders. Where that can't be settled from the answers, the law is marked **may apply** and is still assessed.
2. **Draft notices** to each regulator and to the people affected. They are built from the fields each regulation requires, and anything you haven't supplied is left as a `[bracketed gap]`.
3. **A breach record log.** PIPEDA requires a record of *every* breach for 24 months, and Quebec a register of every incident for 5 years, including the ones you don't report. The log computes the keep-until date, tracks reporting and notification dates, and exports to **CSV** or **JSON** or prints to **PDF**.

### How the decision works

All three laws turn on two factors: **sensitivity** and **likelihood of misuse**. The app rates each one from your answers, using the factors named by the OPC, the CAI and the OIPC Alberta, then combines them:

| Likelihood ↓ / Sensitivity → | Low | Moderate | High |
|---|---|---|---|
| Very unlikely (e.g. strong encryption, key safe) | Not indicated | Not indicated | Not indicated |
| Low | Not indicated | Not indicated | **Borderline: report** |
| Moderate | Not indicated | **Borderline: report** | **Report** |
| High | **Borderline: report** | **Report** | **Report** |

It is designed to be cautious:
- Unknown answers raise the risk and never lower it. With three or more key facts unknown, the result can't be "not indicated".
- "Not indicated" is worded as *your answers don't point to the threshold*, never as *safe*. The record is still required.
- If what happened may fall outside a law's definition (for example "unauthorized use" under PIPEDA), a "Report" result drops to "Borderline: report". It is never dropped further than that.

The matrix and every factor are in [`src/engine/`](src/engine) and covered by unit tests.

## How it differs from the OPC's tool

The Office of the Privacy Commissioner of Canada offers a free online [RROSH assessment tool](https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/privacy-breaches-at-your-business/rrosh-tool/). Use it too. This project is different because it:

| | OPC tool | This project |
|---|---|---|
| Open source, rules checkable line by line | No | Yes (MIT) |
| Federal PIPEDA | Yes | Yes |
| Quebec Law 25 (businesses and public bodies) | No | Yes |
| Alberta PIPA | No | Yes |
| Drafts regulator and individual notices | No | Yes |
| Keeps the 24-month breach record log | No | Yes, on your device |
| Works offline, no data leaves the browser | n/a | Yes |

## Sources

Every rule lives in [`src/rules/`](src/rules), with a citation (source and section) next to it, and the app shows the citation next to each conclusion. The **Rules and sources** page lists them all. Each source was last checked against the official text on **2026-11-04**.

| Law or guidance | Official source |
|---|---|
| PIPEDA, ss. 2(1), 4, 10.1–10.3 | [Justice Laws Website](https://laws-lois.justice.gc.ca/eng/acts/P-8.6/FullText.html) |
| Breach of Security Safeguards Regulations, SOR/2018-64 | [Justice Laws Website](https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-64/FullText.html) |
| OPC: What you need to know about mandatory reporting of breaches | [priv.gc.ca](https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/privacy-breaches-at-your-business/gd_pb_201810/) |
| OPC: PIPEDA in brief (who PIPEDA applies to) | [priv.gc.ca](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda_brief/) |
| Quebec private-sector Act (P-39.1), ss. 1, 3.5–3.8, 12 | [LégisQuébec](https://www.legisquebec.gouv.qc.ca/en/document/cs/P-39.1) |
| Quebec Access Act (A-2.1), ss. 63.8–63.11 | [LégisQuébec](https://www.legisquebec.gouv.qc.ca/en/document/cs/A-2.1) |
| Regulation respecting confidentiality incidents (A-2.1, r. 3.1) | [LégisQuébec](https://www.legisquebec.gouv.qc.ca/en/document/cr/A-2.1,%20r.%203.1) |
| CAI: Incidents de confidentialité (entreprises) | [cai.gouv.qc.ca](https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/incidents-confidentialite-mesures-securite-entreprises) |
| Alberta PIPA, ss. 4, 34.1, 37.1, 56 | [Alberta King's Printer](https://kings-printer.alberta.ca/documents/Acts/P06P5.pdf) |
| Alberta PIPA Regulation (Alta Reg 366/2003), ss. 19, 19.1 | [Alberta King's Printer](https://kings-printer.alberta.ca/documents/Regs/2003_366.pdf) |
| OIPC Alberta: Guidance for Notifying the OIPC about a Privacy Breach (April 2024) | [oipc.ab.ca](https://oipc.ab.ca/wp-content/uploads/2024/04/Guidance-for-Notifying-the-OIPC-about-a-Privacy-Breach-Under-PIPA-April-2024.pdf) |

### Not covered

British Columbia's PIPA; public-sector privacy laws outside Quebec (municipalities elsewhere get a pointer instead); provincial health privacy laws such as Alberta's HIA and Ontario's PHIPA; the federal Privacy Act; foreign laws; and sector regulators, contracts or insurers. The app flags these when your answers suggest they may apply.

## Privacy of the tool itself

- All data is stored in your browser's **IndexedDB**. There is no server, account, analytics or tracking.
- Production builds set a strict Content-Security-Policy (`default-src 'self'`), so the page can't load or send anything to another origin.
- It's an installable **PWA** and works offline once loaded.
- **JSON backup and restore** is on the Breach log page. The backup contains the personal information you entered, so store it securely.
- Clearing site data deletes the log, so back it up.

## Getting started

Requires Node.js 22.12 or later.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173.

```bash
npm test
```

```bash
npm run build
```

`npm run build` type-checks and outputs a static site to `dist/`, which can be hosted anywhere static files are served. `npm run icons` regenerates the app icons.

## Project layout

```
src/rules/     Legal rules as data, each with its citation (the part to check)
src/engine/    Jurisdiction, risk scoring, verdicts, notice drafting, log/CSV/backup
src/storage/   IndexedDB persistence
src/ui/        React components
test/          Vitest unit tests for the decision logic, rules, notices and log
```

## Contributing

Corrections to the legal rules are the most valuable contribution. Please read [CONTRIBUTING.md](CONTRIBUTING.md). For security issues, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE). This tool is not affiliated with or endorsed by the OPC, the CAI or the OIPC Alberta.
