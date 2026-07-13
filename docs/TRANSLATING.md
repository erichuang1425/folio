# Translating Tabento

Supported locales are `en`, `zh-TW`, `zh-CN`, `es`, `ja`, and `fr`.

Application strings live in `newtab.js`, `popup.js`, and `background.js`. Manifest strings live in `_locales/<locale>/messages.json`; Chrome uses `zh_TW` and `zh_CN` directory names.

1. Start from the English key and update the same key in the target locale.
2. Preserve placeholders such as `{count}`, `{name}`, and `{theme}` exactly.
3. Keep intentional HTML and keyboard labels intact.
4. Leave the product name **Tabento** untranslated.
5. Prefer concise, natural interface language.
6. Run `node scripts/validate.mjs`.
7. Check dialogs, tooltips, empty states, menus, and narrow layouts manually.

A new locale must cover application, popup, background/context-menu, and manifest strings and provide an English fallback path.
