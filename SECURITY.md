# Security policy

## Design

This app handles details of privacy breaches, which can include personal information. It is designed so that nothing leaves the user's device:

- **No server and no network calls.** All data is stored in the browser's IndexedDB. There are no accounts, analytics, telemetry, fonts or CDNs.
- **Strict Content-Security-Policy** in production builds: `default-src 'self'`, `connect-src 'self'`, `object-src 'none'`, `form-action 'none'`. Links to official sources open in a new tab with `rel="noopener noreferrer"`.
- **No `dangerouslySetInnerHTML`.** All user input is rendered as text by React.
- **CSV exports are protected against formula injection.** Cells starting with `=`, `+`, `-`, `@`, tab or carriage return are prefixed with `'`.
- **Backups are validated** (format, version, record shape) before they are restored.

## What users should know

- Anyone with access to the browser profile can read the log. Use a device and account your organisation controls, with disk encryption turned on.
- JSON backups and CSV exports contain the personal information you entered. Store them as securely as the breach records themselves, and delete copies you no longer need once the retention period ends.
- "Erase all data" on the Breach log page clears the app's IndexedDB stores in this browser.

## Supported versions

Only the latest release on the default branch gets security fixes.

## Reporting a vulnerability

Please **don't open a public issue** for security problems. Use GitHub's private vulnerability reporting ("Report a vulnerability" under the repository's Security tab). If that isn't available, contact the maintainer privately through their GitHub profile.

Please include steps to reproduce, the affected version or commit, and the impact. You can expect an acknowledgement within 7 days. Please allow a reasonable time for a fix before disclosing publicly.

## Dependencies

At the time of writing, `npm audit` reports moderate advisories in `glob`, `minimatch` and `deepmerge`. They come from the Workbox build tooling used by `vite-plugin-pwa` at **build time** and are not shipped to the browser. They will be updated when upstream releases allow it.
