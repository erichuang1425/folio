# Tabento maintenance guide

Tabento — Locus Legacy Edition preserves the final Tabento product identity and feature set while accepting maintenance, compatibility, security, translation, and accessibility improvements.

## Product invariants

- The interface name is **Tabento**. “Locus Legacy Edition” is repository/release context only.
- Data remains local under `chrome.storage.local` key `te`.
- No account, analytics, project server, or host permissions.
- Import remains compatible with historical `stow`, `tabento`, `tabnest`, and `tabextend` envelopes.
- Persistent shape changes require a schema bump and forward migration.
- New user-visible strings require all supported locales and English fallback.
- Motion must respect reduced-motion preferences and the animation setting.
- Tabento icons and warm bento visual signature remain the default identity.

## Release policy

Use semantic patch releases for maintenance. Validate scripts, manifest, translation keys, assets, primary workflows, and the packaged ZIP. GitHub source archives and the reproducible ZIP are the supported distribution artifacts.

## Historical boundary

Commit `d80781caba9c3d6b5c838a02a1d5f8fb7e58e41d` is the final intact Tabento snapshot. The following commit begins the Folio migration. The pre-rollback online state is permanently preserved by branch `work/pre-legacy-rollback` and tag `pre-tabento-legacy-rollback`.
