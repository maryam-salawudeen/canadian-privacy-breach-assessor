# Contributing

Thanks for helping. This tool is only useful if its rules are right, so **corrections to the legal rules are the most valuable contribution**, and you don't need to write code to make one.

## Reporting a rule that's wrong or out of date

Open an issue with:

1. The rule as the app states it, with the citation shown next to it (for example "SOR/2018-64, s. 2(1)(d)").
2. What the official source actually says, with a link to the official text (Justice Laws, LégisQuébec, Alberta King's Printer, or the OPC, CAI or OIPC Alberta).
3. If the law changed, the amending instrument and its in-force date.

Please don't cite law-firm blogs or summaries as the source for a rule. Use them only to point to the official text.

## Changing the rules

All legal content lives in [`src/rules/`](src/rules):

| File | Contents |
|---|---|
| `sources.ts` | Every official source: URL, publisher, version and the date it was last verified |
| `pipeda.ts` | PIPEDA and SOR/2018-64 |
| `quebec.ts` | Quebec P-39.1 / A-2.1 and the confidentiality-incidents regulation |
| `alberta.ts` | Alberta PIPA and its Regulation |
| `scope.ts` | Which law applies to which organisation |
| `dataCategories.ts` | Kinds of information and their default sensitivity |

When you change a rule:

- **Every rule needs a `cite(source, pinpoint)`** pointing to the exact section, paragraph or heading. The tests fail if a citation refers to an unknown source.
- Keep the wording close to the source text. Paraphrase only to make it readable, never to change its meaning.
- Update `verified` (and `currency` where relevant) in `sources.ts` for each source you checked against the official text.
- When a law is uncertain or its application depends on facts, make the engine say **may apply** or **lean towards reporting**. Never make it reassure.
- Add or update a test in `test/` showing the effect of the change.

The decision logic is in [`src/engine/`](src/engine): `jurisdiction.ts` (which laws apply), `risk.ts` (sensitivity and likelihood of misuse), `assess.ts` (the verdict matrix and obligations) and `notices.ts` (drafts).

### Principles that won't be accepted as changes

- Calling a breach "safe", or any wording that implies there is no risk.
- Letting unknown answers lower the risk.
- Sending data off the device (analytics, error reporting, remote fonts or CDNs).

## Development

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run typecheck
```

Before opening a pull request, make sure `npm test` and `npm run build` both pass. Match the existing code style: TypeScript strict mode, small pure functions in `src/engine/`, and no new runtime dependencies without discussion.

## Adding another law

Adding BC PIPA or a public-sector law is welcome. Add a `LawRules` object in `src/rules/`, an applicability function in `src/engine/jurisdiction.ts`, wire it into `assess()`, and add tests covering clear-cut, borderline and multi-jurisdiction cases.

## Code of conduct

Be respectful and assume good faith. Privacy professionals, developers and members of the public are all welcome here.
