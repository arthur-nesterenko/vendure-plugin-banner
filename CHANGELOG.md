# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-05-14

v2 general availability. The 2.0.0 tarball was published to npm in April but stayed off the `latest` tag; this release polishes the v2 line and finally promotes it to the default install, ahead of the Vendure Hub submission.

### Fixed

- Align dashboard types with the Vendure 3.6 SDK: replace `<Button asChild><Link>` with `useNavigate` + `onClick` after `asChild` was removed from `ButtonProps`; narrow `SearchResultItem.image` from full `Asset` to `{ id, preview }` and select `id` on the underlying `productAsset` / `featuredAsset` GraphQL fields; pass the `AssetPickerDialog` result through to `onAssetSelected` directly.
- Minor `cursor-pointer` polish on interactive buttons in the section editor.

### Changed

- Declare `@vendure/core` and `@vendure/dashboard` as `peerDependencies` (`^3.0.0`) so consumers don't accidentally end up with duplicate copies of `@vendure/core` — which silently breaks decorator metadata.
- Add `keywords`, `bugs`, `homepage`, and a focused `exports` map to `package.json` for npm and Vendure Hub discoverability.
- Tighten the `package.json` description from marketing prose to a keyword-dense feature summary.
- Lock `useDefineForClassFields: false` in `tsconfig.json` so TypeORM `@Column` decorators stay safe across future `target` bumps.

### Documentation

- Add `AGENTS.md` with architecture notes and gotchas for contributors.
- Expand the README with **Translations** (content + UI axes) and **Contributing** sections.
- Add dashboard screenshots (`banner-list.png`, `banner-detail.png`) to the README with explanatory captions.

## [2.0.0] - 2026-04-08

v2 is a major rewrite that replaces the Angular-based admin UI with a native React extension for the new Vendure Dashboard. The backend API and database schema are unchanged, so no data migration is required — see the [migration guide](./README.md#migrating-from-v1-to-v2) in the README.

### Added

- Native React-based Vendure Dashboard extension auto-registered via the plugin's `dashboard` hook — no `compileUiExtensions` or `AdminUiPlugin` setup required
- Drag-and-drop reordering of banner sections in the dashboard, powered by `@dnd-kit`
- `BannerEvent` published on Vendure's `EventBus` whenever a banner is created, updated, or deleted — useful for cache invalidation, audit logs, and other side effects
- Polish (`pl`) translation alongside English and Ukrainian
- Lingui-based i18n with `.po` files for dashboard strings
- Comprehensive unit and end-to-end test coverage for the dashboard components and the banner service
- Beta release workflow that publishes preview versions from pull requests

### Changed

- **BREAKING:** Vendure compatibility narrowed to `^3.0.0` (was `^2.0.0 || ^3.0.0`)
- **BREAKING:** Node.js minimum bumped to `>=22`
- Bumped all `@vendure/*` packages to `3.6.0`
- Migrated CI tooling from Yarn to npm
- Replaced JSON translation files with Lingui `.po` format

### Fixed

- Updating non-translatable fields on existing banner sections previously left them unchanged
- Section ordering is now persisted reliably after drag-and-drop save

### Removed

- **BREAKING:** Angular admin UI extension. `BannerPlugin.ui` no longer exists — projects on the Angular Admin UI must stay on `vendure-banner-plugin@^1.0.0`

## [1.x]

See the [v1 branch](https://github.com/arthur-nesterenko/vendure-plugin-banner/tree/v1) for the v1 release history. v1 is in maintenance mode and only receives security fixes.

[2.1.0]: https://github.com/arthur-nesterenko/vendure-plugin-banner/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/arthur-nesterenko/vendure-plugin-banner/releases/tag/v2.0.0
