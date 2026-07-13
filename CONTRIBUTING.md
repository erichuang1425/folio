# Contributing to Tabento

Thank you for helping maintain Tabento — Locus Legacy Edition. Focused fixes, compatibility work, accessibility improvements, translations, tests, and documentation are welcome.

## Setup

There are no dependencies to install and no application build step.

```powershell
git clone https://github.com/erichuang1425/folio.git
cd folio
node scripts/validate.mjs
```

Load the repository with **Load unpacked** in a current Chrome or Edge development profile.

## Contribution rules

- Search existing issues and open an issue before a large behavior or data-model change.
- Keep Tabento local-only, account-free, and free of host permissions.
- Preserve storage keys and import migrations.
- Keep the application branded Tabento; Locus is only the legacy-edition descriptor.
- Add every English translation key to every supported locale and preserve placeholders.
- Include screenshots for visible changes and describe permission/privacy effects.
- Run `node scripts/validate.mjs` and manually test affected flows.
- Do not commit exports, personal URLs, secrets, browser profiles, or `dist/`.

By contributing, you license your contribution under the repository’s [MIT License](./LICENSE). Community participation follows [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
